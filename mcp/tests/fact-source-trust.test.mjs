import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRecommendationContext } from "../src/recommendation/context.ts";
import { evaluateRules } from "../src/recommendation/rule-engine.ts";

const rule = { rule_id: "age", rule_type: "eligibility", predicate: { fact: "user.age_years", operator: "gte", expected: 19 }, field_assertions: [{ field: "predicate", verification_status: "verified" }] };

test("critical facts require a trusted registered source class", () => {
  assert.deepEqual(evaluateRules([rule], { user: { age_years: 20 } }).unknown, ["age"]);
  assert.deepEqual(evaluateRules([rule], { user: { age_years: 20 }, fact_sources: { age_years: "system_inferred" } }).unknown, ["age"]);
  assert.deepEqual(evaluateRules([rule], { user: { age_years: 20 }, fact_sources: { age_years: "user_asserted" } }).matched, ["age"]);
  assert.throws(() => normalizeRecommendationContext({ facts: { age_years: 20, fact_sources: { age_years: "model_guess" } } }), /unregistered fact source class/);
  assert.deepEqual(normalizeRecommendationContext({ as_of: "2026-08-03", facts: { is_new_customer: true, fact_sources: { is_new_customer: "official_confirmed" } } }).facts.fact_sources, { "user.is_new_customer": "official_confirmed" });
});
