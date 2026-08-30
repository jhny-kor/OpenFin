import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const file = new URL("../../tests/golden/openfin-runtime-contract-120.jsonl", import.meta.url);
const cases = fs.readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
const semanticHash = (entry) => crypto.createHash("sha256").update(JSON.stringify({
  tool: entry.tool,
  arguments: entry.arguments,
  expected_status: entry.expected_status,
  required_fields: entry.required_fields,
  expected_reason_codes: entry.expected_reason_codes,
  expected_paths: entry.expected_paths ?? null,
  expected_result_ids: entry.expected_result_ids ?? null,
  forbidden_result_ids: entry.forbidden_result_ids ?? null,
  semantic_search: entry.semantic_search ?? null,
})).digest("hex");

test("live fixture has 120 distinct semantic cases across required categories", () => {
  assert.equal(cases.length, 120);
  assert.equal(new Set(cases.map((entry) => entry.case_id)).size, 120);
  assert.equal(new Set(cases.map(semanticHash)).size, 120);
  const minimums = { exact_search: 20, alias_search: 10, ambiguous_query: 10, comparison: 15, eligibility: 15, freshness: 10, recommendation_gate: 15, security: 10, unknown: 10, deployment: 5 };
  for (const [category, minimum] of Object.entries(minimums)) assert.ok(cases.filter((entry) => entry.category === category).length >= minimum, category);
  const semanticMinimums = { tax: ["live-001", 5], support: ["live-002", 5], card: ["live-003", 5], deposit: ["live-004", 5], saving: ["live-005", 5], loan: ["live-006", 5], insurance: ["live-007", 5], pension: ["live-008", 3], account: ["live-009", 3], reference: ["live-010", 4] };
  for (const [domain, [caseId, minimum]] of Object.entries(semanticMinimums)) assert.ok((cases.find((entry) => entry.case_id === caseId)?.semantic_search?.length ?? 0) >= minimum, domain);
});

test("P0-3 broad searches use result contracts instead of one hard-coded product", () => {
  for (const caseId of ["live-001", "live-002", "live-003", "live-004", "live-005", "live-006", "live-007", "live-008", "live-009", "live-010"]) {
    const entry = cases.find((candidate) => candidate.case_id === caseId);
    assert.ok(entry.search_contract, caseId);
    assert.ok(entry.search_contract.minimum_result_count >= (caseId === "live-007" ? 1 : 2), caseId);
    assert.ok(entry.search_contract.allowed_types?.length, caseId);
    assert.ok(entry.search_contract.forbidden_types?.length, caseId);
    assert.equal("expected_result_ids" in entry, false, caseId);
  }
});

test("semantic searches declare exact top-k and evidence expectations", () => {
  const semanticCases = cases.flatMap((entry) => entry.semantic_search ?? []);
  assert.equal(semanticCases.length, 45);
  assert.ok(semanticCases.every((entry) => entry.expected_top_k_ids?.length));
  assert.ok(semanticCases.every((entry) => entry.expected_title));
  assert.ok(semanticCases.every((entry) => entry.expected_source_ids?.length));
  assert.ok(semanticCases.every((entry) => entry.require_freshness === true));
  assert.ok(semanticCases.every((entry) => entry.fetch_id && entry.expected_top_id));
  assert.deepEqual(cases.find((entry) => entry.case_id === "live-007").search_contract.allowed_types, ["financial-provider"]);
  assert.equal(cases.find((entry) => entry.case_id === "live-006").semantic_search[1].query, "우리은행 신용대출 cr0001c");
});
