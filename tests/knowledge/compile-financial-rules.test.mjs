import assert from "node:assert/strict";
import test from "node:test";
import { atomicEligibilityPredicates, compileEligibilityRules } from "../../scripts/knowledge/compile-financial-rules.mjs";

const source = { source_id: "source.test", url: "https://example.com/source", locator: "eligibility" };
const compile = (text) => compileEligibilityRules({ text, source, observedAt: "2026-07-31T00:00:00Z", validTo: null, rulePrefix: "rule.test" })[0];

test("eligibility compiler preserves multiple bounds, regions, and customer types", () => {
  const predicates = atomicEligibilityPredicates("만 18세 이상 서울 또는 부산 거주자 실명의 개인 및 개인사업자");
  assert.deepEqual(predicates, [
    { fact: "user.age_years", operator: "gte", expected: 18 },
    { fact: "user.customer_type", operator: "in", expected: ["individual", "sole_proprietor"] },
    { fact: "user.residency_code", operator: "in", expected: ["서울", "부산"] },
  ]);
  const bounded = compile("만 18세 이상 만 65세 이하");
  assert.equal(bounded.executable, true);
  assert.equal(bounded.predicate.operator, "and");
  assert.equal(bounded.predicate.conditions.length, 2);
});

test("eligibility compiler marks unsupported text unresolved", () => {
  const unresolved = compile("기타 조건 확인 필요");
  assert.equal(unresolved.executable, false);
  assert.equal(unresolved.rule_status, "unresolved");
  assert.equal(unresolved.blocker, "ELIGIBILITY_RULE_UNRESOLVED");
  assert.equal(compile("개인(개인사업자 포함)").executable, true);
});
