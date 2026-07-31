import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePredicate, evaluateRules } from "../src/recommendation/rule-engine.ts";

test("structured predicates distinguish matched, failed, and unknown", () => {
  assert.equal(evaluatePredicate({ fact: "can_transfer_salary", operator: "eq", expected: true }, { can_transfer_salary: true }), "matched");
  assert.equal(evaluatePredicate({ fact: "can_transfer_salary", operator: "eq", expected: true }, { can_transfer_salary: false }), "failed");
  assert.equal(evaluatePredicate({ fact: "can_transfer_salary", operator: "eq", expected: true }, {}), "unknown");
});

test("bonus rules apply only when the user fact is present", () => {
  const rule = { rule_id: "salary", rule_type: "bonus-rate", predicate: { fact: "can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 0.5 }, field_assertions: [{ field: "predicate", verification_status: "verified" }] };
  assert.deepEqual(evaluateRules([rule], { can_transfer_salary: true }).matched, ["salary"]);
  assert.deepEqual(evaluateRules([rule], {}).unknown, ["salary"]);
});
