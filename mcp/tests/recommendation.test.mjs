import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { rankCandidates } from "../src/recommendation/ranking.ts";

const item = { id: "product.a", search_type: "deposit", verification_status: "verified", freshness_status: "current", sales_status: "active", sales_verification_status: "verified_active", recommendation_status: "verified_recommendation_candidate", recommendation_scope: "public_recommendation", term_months: 12, provider: "Bank A", maximum_rate_percent: 4.2, provenance: [{ source_id: "source.bank", checksum: "sha256:x", verification_status: "verified" }] };

test("eligibility separates matched, failed, and unknown constraints", () => {
  const eligible = evaluateEligibility(item, { constraints: { provider: "Bank A", term_months: 12 } });
  assert.equal(eligible.eligible, true);
  assert.deepEqual(eligible.failed_conditions, []);
  const unknown = evaluateEligibility(item, { constraints: { minimum_amount_krw: 1000 } });
  assert.equal(unknown.eligible, false);
  assert.ok(unknown.unknown_conditions.includes("maximum_amount_unknown"));
});

test("ranking is deterministic with stable tie breaking", () => {
  const result = rankCandidates([{ ...item, item_id: "b" }, { ...item, item_id: "a" }]);
  assert.deepEqual(result.map((candidate) => candidate.item_id), ["a", "b"]);
  assert.equal(result[0].score, result[1].score);
});
