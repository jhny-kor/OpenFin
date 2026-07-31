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
})).digest("hex");

test("live fixture has 120 distinct semantic cases across required categories", () => {
  assert.equal(cases.length, 120);
  assert.equal(new Set(cases.map((entry) => entry.case_id)).size, 120);
  assert.equal(new Set(cases.map(semanticHash)).size, 120);
  const minimums = { exact_search: 20, alias_search: 10, ambiguous_query: 10, comparison: 15, eligibility: 15, freshness: 10, recommendation_gate: 15, security: 10, unknown: 10, deployment: 5 };
  for (const [category, minimum] of Object.entries(minimums)) assert.ok(cases.filter((entry) => entry.category === category).length >= minimum, category);
});
