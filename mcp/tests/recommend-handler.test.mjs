import test from "node:test";
import assert from "node:assert/strict";
import { buildRecommendationCandidates } from "../src/tools/recommend.ts";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { explainCandidate } from "../src/recommendation/explanation.ts";
import { rankCandidate } from "../src/recommendation/ranking.ts";

const item = (id, provider, term_months) => ({
  id,
  title: id,
  provider,
  product_kind: "deposit",
  term_months,
  maximum_rate_percent: 3,
  freshness_status: "current",
  sales_status: "active",
  sales_verification_status: "verified_active",
  verification_status: "verified",
  recommendation_status: "verified_recommendation_candidate",
  recommendation_scope: "public_recommendation",
  join_channel: ["web", "mobile"],
});

const run = (items, options = {}) => buildRecommendationCandidates(items, {
  evaluateEligibility,
  rankCandidate,
  explainCandidate,
  itemGate: () => ({ status: "ready", reasons: [] }),
  ...options,
});

test("provider preference changes rank without changing eligibility", () => {
  const items = [item("a", "A", 12), item("b", "B", 12)];
  const unpreferred = run(items, { constraints: { join_channel: "web" }, preferences: { provider: "A" } });
  const preferred = run(items, { constraints: { join_channel: "web" }, preferences: { provider: "B" } });
  assert.deepEqual(unpreferred.excluded, []);
  assert.deepEqual(preferred.excluded, []);
  assert.equal(unpreferred.candidates[0].item_id, "a");
  assert.equal(preferred.candidates[0].item_id, "b");
  assert.ok(unpreferred.candidates.every((candidate) => candidate.score_components));
});

test("term preference changes rank and array join channels intersect", () => {
  const result = run([item("a", "A", 12), item("b", "B", 24)], {
    constraints: { join_channel: "web" },
    preferences: { term_months: 24 },
  });
  assert.deepEqual(result.excluded, []);
  assert.equal(result.candidates[0].item_id, "b");
  assert.ok(result.candidates[0].matched_conditions.includes("join_channel_matched"));
});

test("hard constraints exclude candidates and unknown conditions stay explicit", () => {
  const failed = run([item("a", "A", 12)], { constraints: { term_months: 24 } });
  assert.equal(failed.candidates.length, 0);
  assert.equal(failed.excluded[0].reason, "term_failed");

  const unknown = evaluateEligibility(item("a", "A", 12), { constraints: { eligible_conditions: ["salary_transfer"] } });
  assert.equal(unknown.eligible, false);
  assert.ok(unknown.unknown_conditions.includes("condition_unknown:salary_transfer"));
});

test("ranking score equals score component sum", () => {
  const ranking = rankCandidate(item("a", "A", 12), { provider: "A", term_months: 12 });
  assert.equal(ranking.score, Object.values(ranking.score_components).reduce((sum, value) => sum + value, 0));
});
