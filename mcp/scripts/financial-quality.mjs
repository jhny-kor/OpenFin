import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateFinancialOutcome } from "../src/recommendation/outcome.ts";
import { rankCandidates } from "../src/recommendation/ranking.ts";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { recommendationAbstention } from "../src/recommendation/abstention.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (name) => fs.readFileSync(path.join(ROOT, "tests/golden", name), "utf8").trim().split("\n").filter(Boolean).map(JSON.parse);
const unique = (rows) => new Set(rows.map((row) => row.case_id)).size === rows.length;

const deposits = read("deposit-comparison-quality.jsonl");
const savings = read("saving-comparison-quality.jsonl");
const depositRecommendations = read("deposit-recommendation-quality.jsonl");
const savingRecommendations = read("saving-recommendation-quality.jsonl");
const eligibility = read("eligibility-rules.jsonl");
const privacy = read("privacy-and-abstention.jsonl");
for (const [name, rows, minimum] of [["deposit comparison", deposits, 20], ["saving comparison", savings, 20], ["deposit recommendation", depositRecommendations, 10], ["saving recommendation", savingRecommendations, 10]]) {
  assert.ok(rows.length >= minimum, `${name}: expected at least ${minimum}`);
  assert.ok(unique(rows), `${name}: duplicate case_id`);
}

const positiveOutcomes = [...deposits, ...savings].map((row) => calculateFinancialOutcome(row.item, row.preferences));
assert.equal(positiveOutcomes.filter((result) => result.outcome_status === "calculated").length, 40);
const positiveRanks = [...depositRecommendations, ...savingRecommendations].map((row) => rankCandidates([row.item], row.preferences)[0]);
assert.equal(positiveRanks.filter((result) => result.financial_outcome).length, 20);

const eligibilityResults = eligibility.map((row) => evaluateEligibility(row.item, { constraints: row.constraints, decision_context: row.decision_context }));
assert.equal(eligibilityResults.filter((result) => result.eligible).length, 2);
assert.equal(eligibilityResults.filter((result) => result.failed_conditions.length > 0).length, 3);
assert.equal(eligibilityResults.filter((result) => result.unknown_conditions.length > 0).length, 1);
for (const row of privacy) {
  const result = recommendationAbstention(row.context);
  if (row.expected_reason) assert.ok(result.reason_codes.includes(row.expected_reason), `${row.case_id}: missing ${row.expected_reason}`);
  else assert.equal(result.abstain, false, row.case_id);
}

const report = {
  version: "openfin-financial-quality-v1",
  synthetic_only: true,
  live_runtime_claims: false,
  checked_at: new Date().toISOString(),
  positive_comparison_cases: { deposit: deposits.length, saving: savings.length },
  positive_ranking_cases: { deposit: depositRecommendations.length, saving: savingRecommendations.length },
  suites: {
    deposit_comparison: { cases: deposits.length, passed: positiveOutcomes.slice(0, deposits.length).filter((result) => result.outcome_status === "calculated").length },
    saving_comparison: { cases: savings.length, passed: positiveOutcomes.slice(deposits.length).filter((result) => result.outcome_status === "calculated").length },
    deposit_recommendation: { cases: depositRecommendations.length, passed: positiveRanks.slice(0, depositRecommendations.length).filter((result) => result.financial_outcome).length },
    saving_recommendation: { cases: savingRecommendations.length, passed: positiveRanks.slice(depositRecommendations.length).filter((result) => result.financial_outcome).length },
    eligibility: { cases: eligibility.length, passed: eligibilityResults.length },
    privacy_and_abstention: { cases: privacy.length, passed: privacy.length },
  },
  public_recommendation_enabled: false,
};
console.log(JSON.stringify(report, null, 2));
