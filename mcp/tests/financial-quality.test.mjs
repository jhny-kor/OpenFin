import assert from "node:assert/strict";
import test from "node:test";
import { resolveAttainableRate } from "../src/recommendation/attainable-rate.ts";
import { calculateFinancialOutcome } from "../src/recommendation/outcome.ts";
import { recommendationAbstention } from "../src/recommendation/abstention.ts";
import { rankCandidates } from "../src/recommendation/ranking.ts";

test("attainable rate never assumes an unmet maximum-rate condition", () => {
  const item = { base_rate_percent: 2, maximum_rate_percent: 4, bonus_rate_rules: [{ rule_id: "salary_transfer", rule_type: "bonus-rate", predicate: { fact: "can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 2 }, unknown_policy: "not_applied", field_assertions: [{ field: "can_transfer_salary", verification_status: "verified" }] }] };
  assert.equal(resolveAttainableRate(item).rate_percent, 2);
  assert.equal(resolveAttainableRate(item, { can_transfer_salary: true }).rate_percent, 4);
});

test("ranking uses after-tax economic outcome before soft preferences", () => {
  const items = [
    { id: "low", product_kind: "deposit", provider: "preferred", base_rate_percent: 2, term_months: 12 },
    { id: "high", product_kind: "deposit", provider: "other", base_rate_percent: 4, term_months: 12 },
  ];
  const ranked = rankCandidates(items, { principal_krw: 1000000, provider: "preferred" });
  assert.deepEqual(ranked.map((item) => item.id), ["high", "low"]);
  assert.equal(ranked[0].ranking_key[1] > ranked[1].ranking_key[1], true);
});

test("missing financial context abstains without exposing raw values", () => {
  const result = recommendationAbstention({ monthly_net_income_krw: 1000000 });
  assert.equal(result.abstain, true);
  assert.ok(result.reason_codes.includes("CONTEXT_INCOMPLETE"));
  assert.deepEqual(Object.keys(result).sort(), ["abstain", "missing_fields", "reason_codes"]);
});

test("saving outcome uses monthly cash flow and explicit tax", () => {
  const result = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 3, term_months: 12 }, { monthly_payment_krw: 100000, tax_rate_percent: 0 });
  assert.equal(result.outcome_status, "calculated");
  assert.equal(result.outcome?.gross_interest_krw, 19500);
});
