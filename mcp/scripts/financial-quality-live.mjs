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
const compareSuites = golden("openfin-comparison-live.jsonl");
const shadowSuites = golden("openfin-recommendation-shadow-live.jsonl");
const positiveFixtures = golden("openfin-positive-runtime.jsonl");
const passed = [];

for (const suite of compareSuites) {
  const rows = golden(suite.source_fixture);
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
  const rows = golden(suite.source_fixture);
  assert.equal(rows.length, suite.expected_case_count, suite.suite_id);
  const ranked = rankCandidates(rows.map((row) => row.item), { principal_krw: 1_000_000, tax_rate_percent: 15.4 });
  assert.deepEqual(ranked.map((row) => row.id), suite.expected_candidate_order, suite.suite_id);
  assert.ok(ranked.every((row) => Array.isArray(row.ranking_key)), `${suite.suite_id}: ranking_key`);
  passed.push({ suite_id: suite.suite_id, case_count: rows.length, candidate_order: ranked.map((row) => row.id), status: "passed" });
}
const eligibilityRows = golden("eligibility-rules.jsonl");
const eligibilityResults = eligibilityRows.map((row) => evaluateEligibility(row.item, { constraints: row.constraints, decision_context: row.decision_context }));
assert.equal(eligibilityResults.filter((row) => row.eligible).length, 2);
assert.equal(eligibilityResults.filter((row) => row.failed_conditions.length > 0).length, 3);
assert.equal(eligibilityResults.filter((row) => row.unknown_conditions.length > 0).length, 1);
for (const row of golden("privacy-and-abstention.jsonl")) {
  const result = recommendationAbstention(row.context);
  if (row.expected_reason) assert.ok(result.reason_codes.includes(row.expected_reason), row.case_id);
}

const evidenceAssertion = (field) => ({ field, source_id: "source.quality", original_url: "https://example.com/quality", observed_at: "2026-07-31T00:00:00Z", valid_to: "2027-07-31T00:00:00Z", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "quality-reviewer", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig-quality", reviewed_at: "2026-07-31T00:00:00Z", receipt_checksum: `sha256:${field.padEnd(64, "0").slice(0, 64)}` });
const evidenceFields = ["deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status"];
const evidenceOffer = () => ({ type: "deposit-offer", sales_verification_status: "verified_active", sales_status: "active", source_listing_status: "listed", deposit_protection_status: "protected", join_channels: ["web"], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{}], schema_validation_receipt: { schema_id: "types/financial-offer.schema.json", validator: "ajv", validation_status: "valid", validated_at: "2026-07-31T00:00:00Z", content_checksum: "sha256:" + "a".repeat(64) }, field_assertions: evidenceFields.map(evidenceAssertion), provenance: [{ source_id: "source.quality", original_url: "https://example.com/quality", checksum: "sha256:quality", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "quality-reviewer", reviewed_at: "2026-07-31T00:00:00Z", reviewer_signature: "sig-quality" }] });
const evidenceOption = () => ({ option_id: "option.deposit.quality.12", term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: "simple", schema_validation_receipt: { schema_id: "types/offer-option.schema.json", validator: "ajv", validation_status: "valid", validated_at: "2026-07-31T00:00:00Z", content_checksum: "sha256:" + "b".repeat(64) }, field_assertions: ["term_months", "base_rate_percent", "maximum_rate_percent", "interest_method"].map(evidenceAssertion), promotion_receipt: { comparison_approved: true, recommendation_approved: false, checksum_verified: true, reviewer: "quality-reviewer", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig-quality" } });
const baselineGate = evaluateEvidenceGate({ offer: evidenceOffer(), option: evidenceOption(), domain: "deposit", asOf: "2026-07-31" });
assert.equal(baselineGate.status, "eligible");
const staleOffer = evidenceOffer(); staleOffer.field_assertions[0] = { ...staleOffer.field_assertions[0], freshness_status: "stale" };
const conflictOffer = evidenceOffer(); conflictOffer.field_assertions[0] = { ...conflictOffer.field_assertions[0], conflict: true };
const missingReceiptOffer = evidenceOffer(); missingReceiptOffer.provenance = [];
const mutationChecks = {
  stale_assertion_blocked: evaluateEvidenceGate({ offer: staleOffer, option: evidenceOption(), domain: "deposit", asOf: "2026-07-31" }).status === "blocked",
  conflicting_assertion_blocked: evaluateEvidenceGate({ offer: conflictOffer, option: evidenceOption(), domain: "deposit", asOf: "2026-07-31" }).status === "blocked",
  missing_source_receipt_blocked: evaluateEvidenceGate({ offer: missingReceiptOffer, option: evidenceOption(), domain: "deposit", asOf: "2026-07-31" }).status === "blocked",
  unknown_bonus_not_applied: calculateFinancialOutcome({ product_kind: "deposit", base_rate_percent: 2, maximum_rate_percent: 4, term_months: 12, bonus_rate_rules: [{ rule_id: "unknown", rule_type: "bonus-rate", predicate: { fact: "user.can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 2 }, unknown_policy: "not_applied", field_assertions: [evidenceAssertion("predicate"), evidenceAssertion("effect"), evidenceAssertion("valid_from"), evidenceAssertion("valid_to")] }] }, { principal_krw: 1_000_000 }).rate_percent === 2,
};
assert.ok(Object.values(mutationChecks).every(Boolean));

const endpoint = process.env.MCP_URL?.replace(/\/$/, "") ?? null;
const live = { execution_status: endpoint ? "not_executed" : "not_requested", endpoint, call_count: 0, status: endpoint ? "pending" : "offline_only", positive_cases: [], blocked_cases: [], failures: [] };
if (endpoint) {
  const timeoutMs = Number(process.env.LIVE_REQUEST_TIMEOUT_MS || 10000);
  const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); }
  };
  let requestId = 0;
  const rpc = async (method, params = {}) => {
    const response = await fetchWithTimeout(endpoint, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++requestId, method, params }) });
    const body = await response.json();
    live.call_count += 1;
    if (body.error || !response.ok) throw new Error(`${method}: ${body.error?.message ?? response.status}`);
    return body.result;
  };
  const payload = (result, tool) => {
    if (result?.isError) throw new Error(`${tool}: isError`);
    const text = result?.content?.find((entry) => entry.type === "text")?.text;
    if (typeof text !== "string") throw new Error(`${tool}: missing structured text`);
    return JSON.parse(text);
  };
  try {
    await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "openfin-financial-quality", version: "1" } });
    for (const fixture of positiveFixtures) {
      const result = payload(await rpc("tools/call", { name: fixture.tool, arguments: fixture.arguments }), fixture.case_id);
      const status = result.status ?? "ok";
      if (status === fixture.expected_status) {
        const positive = Number(result.result_count ?? 0) > 0 && Array.isArray(result.candidates) && result.candidates.every((candidate) => candidate.candidate_id ?? candidate.item_id ?? candidate.id);
        if (!positive) throw new Error(`${fixture.case_id}: positive endpoint assertions failed`);
        live.positive_cases.push(fixture.case_id);
      } else if (status === "blocked" || status === "insufficient_information") {
        const reasons = Array.isArray(result.reason_codes) ? result.reason_codes.map(String) : [];
        if (status !== "blocked" || !reasons.some((reason) => reason.includes("RELEASE_GATE") || reason.includes("NO_VERIFIED") || reason.includes("COMPARISON_DOMAIN_NOT_READY"))) throw new Error(`${fixture.case_id}: unexpected endpoint block ${JSON.stringify(reasons)}`);
        live.blocked_cases.push({ case_id: fixture.case_id, status, reason_codes: reasons });
      } else throw new Error(`${fixture.case_id}: status=${status}`);
    }
    const missingAsOf = payload(await rpc("tools/call", { name: "compare", arguments: { domain: "deposit", term_months: 12 } }), "compare-missing-as-of");
    if (missingAsOf.status !== "insufficient_information" || !missingAsOf.reason_codes?.includes("CONTEXT_AS_OF_REQUIRED")) throw new Error("compare must reject missing as_of");
    const shadow = payload(await rpc("tools/call", { name: "recommend_shadow", arguments: { domain: "deposit", context: { as_of: "2026-07-31" } } }), "recommend_shadow");
    if (shadow.status !== "blocked" || Array.isArray(shadow.candidates) && shadow.candidates.length) throw new Error("shadow tool must remain fail-closed without candidate payload");
    const owner = payload(await rpc("tools/call", { name: "recommend_owner_pilot", arguments: { domain: "deposit", context: { as_of: "2026-07-31" }, owner_authenticated: false } }), "recommend_owner_pilot");
    if (owner.status !== "blocked" || !owner.reason_codes?.includes("OWNER_AUTH_REQUIRED")) throw new Error("owner pilot must require authentication");
    live.execution_status = "executed";
    live.status = live.positive_cases.length === positiveFixtures.length ? "current" : "blocked_by_release_gate";
  } catch (error) {
    live.execution_status = "failed";
    live.status = "failed";
    live.failures.push(error instanceof Error ? error.message : String(error));
  }
  if (live.status === "blocked_by_release_gate" && process.env.OPENFIN_REQUIRE_POSITIVE_RUNTIME === "true") throw new Error(`positive endpoint fixture blocked: ${JSON.stringify(live.blocked_cases)}`);
  if (live.status === "failed") throw new Error(live.failures.join("; "));
}

const report = {
  version: "openfin-financial-quality-live-v2",
  mode: endpoint ? "live_endpoint" : "offline_golden",
  live_endpoint: endpoint,
  live_execution_status: live.execution_status,
  live_status: live.status,
  live_call_count: live.call_count,
  live_positive_cases: live.positive_cases,
  live_blocked_cases: live.blocked_cases,
  live_failures: live.failures,
  positive_fixture_count: positiveFixtures.length,
  positive_compare_cases: compareSuites.reduce((sum, suite) => sum + suite.expected_case_count, 0),
  shadow_ranking_cases: shadowSuites.reduce((sum, suite) => sum + suite.expected_case_count, 0),
  eligibility_cases: eligibilityRows.length,
  mutation_checks: mutationChecks,
  passed_case_count: passed.length,
  case_results: passed,
  public_recommendation_enabled: false,
  claims: { official_source_evidence: false, public_runtime_readiness: live.status === "current", endpoint_executed: live.execution_status === "executed" },
};
console.log(JSON.stringify(report, null, 2));
