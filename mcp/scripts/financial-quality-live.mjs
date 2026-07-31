import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateFinancialOutcome } from "../src/recommendation/outcome.ts";
import { rankCandidates } from "../src/recommendation/ranking.ts";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { recommendationAbstention } from "../src/recommendation/abstention.ts";
import { evaluateEvidenceGate } from "../src/decision/evidence-gate.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const golden = (name) => fs.readFileSync(path.join(ROOT, "tests/golden", name), "utf8").trim().split("\n").filter(Boolean).map(JSON.parse);
const descriptors = (name) => golden(name);
const compareSuites = descriptors("openfin-comparison-live.jsonl");
const shadowSuites = descriptors("openfin-recommendation-shadow-live.jsonl");
const readSource = (name) => golden(name);
const passed = [];

for (const suite of compareSuites) {
  const rows = readSource(suite.source_fixture);
  assert.equal(rows.length, suite.expected_case_count, suite.suite_id);
  for (const row of rows) {
    const result = calculateFinancialOutcome(row.item, row.preferences);
    assert.equal(result.outcome_status, "calculated", `${suite.suite_id}:${row.case_id}`);
    assert.ok(row.item.id, `${suite.suite_id}:${row.case_id}: candidate_id`);
    if (suite.required_assertions?.includes("source_assertion_id_required_at_runtime")) {
      assert.match(String(row.source_assertion_id ?? ""), /^assertion\./, `${suite.suite_id}:${row.case_id}: source_assertion_id`);
    }
    assert.ok(result.outcome?.net_interest_krw >= 0, `${suite.suite_id}:${row.case_id}: net outcome`);
    passed.push({ suite_id: suite.suite_id, case_id: row.case_id, candidate_id: row.item.id, source_assertion_id: row.source_assertion_id ?? null, status: "passed" });
  }
}
for (const suite of shadowSuites) {
  const rows = readSource(suite.source_fixture);
  assert.equal(rows.length, suite.expected_case_count, suite.suite_id);
  const ranked = rankCandidates(rows.map((row) => row.item), { principal_krw: 1_000_000, tax_rate_percent: 15.4 });
  assert.deepEqual(ranked.map((row) => row.id), suite.expected_candidate_order, suite.suite_id);
  assert.ok(ranked.every((row) => Array.isArray(row.ranking_key)), `${suite.suite_id}: ranking_key`);
  passed.push({ suite_id: suite.suite_id, case_count: rows.length, candidate_order: ranked.map((row) => row.id), status: "passed" });
}
const eligibilityRows = readSource("eligibility-rules.jsonl");
const eligibilityResults = eligibilityRows.map((row) => evaluateEligibility(row.item, { constraints: row.constraints, decision_context: row.decision_context }));
assert.equal(eligibilityResults.filter((row) => row.eligible).length, 2);
assert.equal(eligibilityResults.filter((row) => row.failed_conditions.length > 0).length, 3);
assert.equal(eligibilityResults.filter((row) => row.unknown_conditions.length > 0).length, 1);
for (const row of readSource("privacy-and-abstention.jsonl")) {
  const result = recommendationAbstention(row.context);
  if (row.expected_reason) assert.ok(result.reason_codes.includes(row.expected_reason), row.case_id);
}
const evidenceAssertion = (field) => ({ field, source_id: "source.quality", original_url: "https://example.com/quality", observed_at: "2026-07-31T00:00:00Z", valid_to: "2027-07-31T00:00:00Z", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "quality-reviewer", reviewed_at: "2026-07-31T00:00:00Z", receipt_checksum: `sha256:${field.padEnd(64, "0").slice(0, 64)}` });
const evidenceFields = ["deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status"];
const evidenceOffer = () => ({ type: "deposit-offer", sales_verification_status: "verified_active", sales_status: "active", source_listing_status: "listed", deposit_protection_status: "protected", join_channels: ["web"], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{}], field_assertions: evidenceFields.map(evidenceAssertion), provenance: [{ source_id: "source.quality", original_url: "https://example.com/quality", checksum: "sha256:quality", verification_status: "verified", freshness_status: "current", conflict: false }] });
const evidenceOption = () => ({ option_id: "option.deposit.quality.12", term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: "simple", field_assertions: ["term_months", "base_rate_percent", "maximum_rate_percent", "interest_method"].map(evidenceAssertion), promotion_receipt: { comparison_approved: true, recommendation_approved: false } });
const baselineGate = evaluateEvidenceGate({ offer: evidenceOffer(), option: evidenceOption(), domain: "deposit" });
assert.equal(baselineGate.status, "eligible");
const staleOffer = evidenceOffer(); staleOffer.field_assertions[0] = { ...staleOffer.field_assertions[0], freshness_status: "stale" };
const conflictOffer = evidenceOffer(); conflictOffer.field_assertions[0] = { ...conflictOffer.field_assertions[0], conflict: true };
const missingReceiptOffer = evidenceOffer(); missingReceiptOffer.provenance = [];
const mutationChecks = {
  stale_assertion_blocked: evaluateEvidenceGate({ offer: staleOffer, option: evidenceOption(), domain: "deposit" }).status === "blocked",
  conflicting_assertion_blocked: evaluateEvidenceGate({ offer: conflictOffer, option: evidenceOption(), domain: "deposit" }).status === "blocked",
  missing_source_receipt_blocked: evaluateEvidenceGate({ offer: missingReceiptOffer, option: evidenceOption(), domain: "deposit" }).status === "blocked",
  unknown_bonus_not_applied: calculateFinancialOutcome({ product_kind: "deposit", base_rate_percent: 2, maximum_rate_percent: 4, term_months: 12, bonus_rate_rules: [{ rule_id: "unknown", rule_type: "bonus-rate", predicate: { fact: "user.can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 2 }, unknown_policy: "not_applied", field_assertions: [evidenceAssertion("predicate"), evidenceAssertion("effect"), evidenceAssertion("valid_from"), evidenceAssertion("valid_to")] }] }, { principal_krw: 1_000_000 }).rate_percent === 2,
};
assert.ok(Object.values(mutationChecks).every(Boolean));
const report = {
  version: "openfin-financial-quality-live-v1",
  mode: process.env.MCP_URL ? "live_endpoint_requested" : "offline_golden",
  live_endpoint: process.env.MCP_URL ?? null,
  live_execution_status: process.env.MCP_URL ? "endpoint_adapter_required" : "not_executed",
  positive_compare_cases: compareSuites.reduce((sum, suite) => sum + suite.expected_case_count, 0),
  shadow_ranking_cases: shadowSuites.reduce((sum, suite) => sum + suite.expected_case_count, 0),
  eligibility_cases: eligibilityRows.length,
  mutation_checks: mutationChecks,
  passed_case_count: passed.length,
  case_results: passed,
  public_recommendation_enabled: false,
  claims: { official_source_evidence: false, public_runtime_readiness: false },
};
console.log(JSON.stringify(report, null, 2));
