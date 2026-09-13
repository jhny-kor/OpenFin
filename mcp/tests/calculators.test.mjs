import assert from "node:assert/strict";
import test from "node:test";
import { calculateDepositReturn } from "../src/calculators/deposit.ts";
import { calculateEarlyTerminationInstallments, calculateEarlyTerminationReturn } from "../src/calculators/early-termination.ts";
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
  const compound = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 10, term_months: 24, tax_rate_percent: 0, interest_method: "compound", compounding_frequency: "annual" });
  assert.ok(compound.net_interest_krw > simple.net_interest_krw);
  assert.equal(calculateInterestTax(100.4, 0)?.net_interest_krw, 100);
});

test("deposit golden cases honor monthly, daily, and annual compounding", () => {
  const monthly = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0, interest_method: "compound", compounding_frequency: "monthly" });
  const daily = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0, interest_method: "compound_daily" });
  const annual = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 12, tax_rate_percent: 0, interest_method: "compound_annual" });
  assert.equal(monthly?.gross_interest_krw, 126825);
  assert.equal(daily?.gross_interest_krw, 127475);
  assert.equal(annual?.gross_interest_krw, 120000);
});

test("deposit payouts are separate cashflows and never reinvest", () => {
  const result = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 18, tax_rate_percent: 0, interest_payment_frequency: "annual" });
  assert.deepEqual(result?.periodic_interest_cashflows.map((entry) => entry.gross_interest_krw), [120000, 60000]);
  assert.equal(result?.maturity_principal_krw, 1000000);
  assert.equal(result?.maturity_amount_krw, 1000000);
  assert.equal(result?.total_gross_interest_krw, 180000);
});

test("periodic payouts compound only within each payout period", () => {
  const result = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 18, tax_rate_percent: 0, interest_method: "compound_monthly", interest_payment_frequency: "annual" });
  assert.deepEqual(result?.periodic_interest_cashflows.map((entry) => entry.gross_interest_krw), [126825, 61520]);
  assert.equal(result?.total_gross_interest_krw, 188345);
  assert.equal(result?.maturity_principal_krw, 1000000);
  assert.equal(calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 12, term_months: 18, tax_rate_percent: 0, interest_method: "compound_annual", interest_payment_frequency: "annual" }), null);
});

test("saving early termination applies each installment tenure and bracket rate", () => {
  const result = calculateEarlyTerminationInstallments({ installments: [
    { principal_krw: 100000, elapsed_months: 6, annual_early_termination_rate_percent: 1 },
    { principal_krw: 100000, elapsed_months: 3, annual_early_termination_rate_percent: 2 },
  ], tax_rate_percent: 0 });
  assert.equal(result?.gross_interest_krw, 1000);
  assert.equal(result?.settlement_amount_krw, 201000);
});

test("saving early termination uses validated paid dates and leap-year day count", async () => {
  const { calculateFinancialOutcome } = await import("../src/recommendation/outcome.ts");
  const result = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 12, term_months: 2, early_termination_rate_percent: 12, day_count_convention: "ACT/366" }, { monthly_payment_krw: 100000, installment_paid_at: ["2028-01-31", "2028-02-29"], termination_date: "2028-03-01", tax_rate_percent: 0 });
  assert.equal(result.financial_outcomes.early_termination.outcome?.installment_outcomes[0].elapsed_days, 30);
  assert.equal(result.financial_outcomes.early_termination.outcome?.installment_outcomes[1].elapsed_days, 1);
  assert.equal(result.financial_outcomes.early_termination.outcome?.gross_interest_krw, 1016);
  const invalid = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 12, term_months: 2, early_termination_rate_percent: 12 }, { monthly_payment_krw: 100000, installment_paid_at: ["2028-02-30", "2028-02-29"], termination_date: "2028-03-01", tax_rate_percent: 0 });
  assert.equal(invalid.financial_outcomes.early_termination.outcome, null);
  const future = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 12, term_months: 2, early_termination_rate_percent: 12 }, { monthly_payment_krw: 100000, installment_paid_at: ["2028-01-31", "2028-03-02"], termination_date: "2028-03-01", tax_rate_percent: 0 });
  assert.equal(future.financial_outcomes.early_termination.outcome, null);
  const unsupported = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 12, term_months: 2, day_count_convention: "30/360", early_termination_rate_percent: 12 }, { monthly_payment_krw: 100000, installment_paid_at: ["2028-01-31", "2028-02-29"], termination_date: "2028-03-01", tax_rate_percent: 0 });
  assert.equal(unsupported.financial_outcomes.early_termination.outcome, null);
});

test("saving schedules distinguish month-start, month-end, free payments, and missed installments", () => {
  const start = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0, payment_timing: "month_start" });
  const end = calculateSavingReturn({ monthly_payment_krw: 100000, annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0, payment_timing: "month_end" });
  assert.ok(start.gross_interest_krw > end.gross_interest_krw);
  const free = calculateSavingReturn({ payment_schedule_krw: [100000, 0, 200000], annual_rate_percent: 12, term_months: 3, tax_rate_percent: 0 });
  assert.equal(free.principal_krw, 300000);
  assert.equal(free.gross_interest_krw, 5000);
});

test("outcome forwards payment timing, tax, rounding, and saving early termination", async () => {
  const { calculateFinancialOutcome } = await import("../src/recommendation/outcome.ts");
  const result = calculateFinancialOutcome({ product_kind: "saving", base_rate_percent: 12, term_months: 3, payment_timing: "month_end", early_termination_rate_percent: 2, rounding_policy: { mode: "floor", unit: "krw" } }, { monthly_payment_krw: 100000, planned_termination_months: 2, tax_rate_percent: 15.4 });
  assert.equal(result.outcome?.gross_interest_krw, 3000);
  assert.equal(result.financial_outcomes.early_termination.outcome?.settlement_amount_krw, 200141);
});

test("calculator monotonicity holds for verified non-negative inputs", () => {
  for (const term_months of [6, 12, 24, 36]) {
    const low = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 1, term_months, tax_rate_percent: 15.4 });
    const high = calculateDepositReturn({ principal_krw: 1000000, annual_rate_percent: 2, term_months, tax_rate_percent: 15.4 });
    assert.ok(high.net_interest_krw >= low.net_interest_krw && high.net_interest_krw >= 0);
  }
});

test("Korean interest methods do not silently downgrade compound interest", () => {
  const input = {principal_krw:1000000, annual_rate_percent:12, term_months:12, tax_rate_percent:0};
  assert.equal(calculateDepositReturn({...input,interest_method:"복리"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"compound",compounding_frequency:"none"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"compound_monthly",compounding_frequency:"annual"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"compound_monthly",interest_payment_frequency:"daily"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"compound_daily",interest_payment_frequency:"monthly"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"단리",compounding_frequency:"annual"}),null);
  assert.equal(calculateDepositReturn({...input,interest_method:"단리"}).gross_interest_krw,120000);
  assert.equal(calculateDepositReturn({...input,interest_method:"복리",compounding_frequency:"monthly"}).gross_interest_krw,126825);
});
