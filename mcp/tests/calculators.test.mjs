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

test("calculators fail closed on invalid cash-flow dimensions", () => {
  assert.equal(calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 3, term_months: 0 }), null);
  assert.equal(calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 3, term_months: 12.5 }), null);
  assert.equal(calculateSavingReturn({ payment_schedule_krw: [100000], annual_rate_percent: 3, term_months: 2 }), null);
});

test("deposit terms, compounding, tax exemption, and won rounding are explicit", () => {
  for (const term_months of [6, 12, 24, 36]) {
    const simple = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 3.333, term_months, tax_rate_percent: 0 });
    assert.ok(simple && Number.isInteger(simple.net_interest_krw));
  }
  const simple = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 10, term_months: 24, tax_rate_percent: 0 });
  const compound = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 10, term_months: 24, tax_rate_percent: 0, interest_method: "compound" });
  assert.ok(compound.net_interest_krw > simple.net_interest_krw);
  assert.equal(calculateInterestTax(100.4, 0)?.net_interest_krw, 100);
});

test("saving schedules distinguish month-start, month-end, free payments, and missed installments", () => {
  const start = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0, payment_timing: "month_start" });
  const end = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0, payment_timing: "month_end" });
  assert.ok(start.gross_interest_krw > end.gross_interest_krw);
  const free = calculateSavingReturn({ payment_schedule_krw: [100000, 0, 200000], annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0 });
  assert.equal(free.principal_krw, 300000);
  assert.equal(free.gross_interest_krw, 5000);
});

test("calculator monotonicity holds for verified non-negative inputs", () => {
  for (const term_months of [6, 12, 24, 36]) {
    const low = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 1, term_months, tax_rate_percent: 15.4 });
    const high = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 2, term_months, tax_rate_percent: 15.4 });
    assert.ok(high.net_interest_krw >= low.net_interest_krw && high.net_interest_krw >= 0);
  }
});
