import assert from "node:assert/strict";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { resolveAttainableRate } from "../src/recommendation/attainable-rate.ts";

const verified = {
  id: "mutation.deposit", verification_status: "verified", freshness_status: "current", sales_status: "active", sales_verification_status: "verified_active",
  recommendation_status: "verified_recommendation_candidate", recommendation_scope: "public_recommendation", term_months: 12, join_channel: ["web"],
};
assert.equal(evaluateEligibility(verified, { constraints: { term_months: 12, join_channel: "web" } }).eligible, true);
assert.equal(evaluateEligibility(verified, { constraints: { term_months: 24 } }).eligible, false);
const rateItem = { base_rate_percent: 2, maximum_rate_percent: 3, bonus_rate_rules: [{ rule_id: "salary", rule_type: "bonus-rate", predicate: { fact: "can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 1 }, unknown_policy: "not_applied", field_assertions: [{ field: "can_transfer_salary" }] }] };
assert.equal(resolveAttainableRate(rateItem, { can_transfer_salary: false }).rate_percent, 2);
assert.equal(resolveAttainableRate(rateItem, { can_transfer_salary: true }).rate_percent, 3);
console.log(JSON.stringify({ ok: true, mutations_checked: 2 }));
