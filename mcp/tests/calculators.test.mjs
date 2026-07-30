import assert from "node:assert/strict";
import test from "node:test";
import { calculateDepositReturn } from "../src/calculators/deposit.ts";
import { calculateSavingReturn } from "../src/calculators/saving.ts";

test("deposit and saving calculations use their distinct cash-flow models", () => {
  const deposit = calculateDepositReturn({ principal_krw: 1200000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0 });
  const saving = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0 });
  assert.equal(deposit?.gross_interest_krw, 144000);
  assert.equal(saving?.gross_interest_krw, 78000);
  assert.notEqual(deposit?.calculation_assumption, saving?.calculation_assumption);
});
