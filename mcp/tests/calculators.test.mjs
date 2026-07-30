import assert from "node:assert/strict";
import test from "node:test";
import { calculateDepositReturn } from "../src/calculators/deposit.ts";
import { calculateEarlyTerminationReturn } from "../src/calculators/early-termination.ts";
import { calculateSavingReturn } from "../src/calculators/saving.ts";
import { calculateInterestTax } from "../src/calculators/tax.ts";

test("deposit and saving calculations use their distinct cash-flow models", () => {
  const deposit = calculateDepositReturn({ principal_krw: 1200000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0 });
  const saving = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0 });
  assert.equal(deposit?.gross_interest_krw, 144000);
  assert.equal(saving?.gross_interest_krw, 78000);
  assert.notEqual(deposit?.calculation_assumption, saving?.calculation_assumption);
});

test("tax and early termination use only supplied verified-rate inputs", () => {
  assert.deepEqual(calculateInterestTax(100000, 15.4), { gross_interest_krw: 100000, tax_rate_percent: 15.4, tax_withheld_krw: 15400, net_interest_krw: 84600 });
  assert.equal(calculateEarlyTerminationReturn({ principal_krw: 1000000, elapsed_months: 6 }), null);
  const early = calculateEarlyTerminationReturn({ principal_krw: 1000000, annual_early_termination_rate_percent: 1, elapsed_months: 6, tax_rate_percent: 0 });
  assert.equal(early?.settlement_amount_krw, 1005000);
});
