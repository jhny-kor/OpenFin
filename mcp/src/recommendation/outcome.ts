import { calculateDepositReturn } from "../calculators/deposit.ts";
import { calculateSavingReturn } from "../calculators/saving.ts";
import { resolveAttainableRate } from "./attainable-rate.ts";
import { calculateEarlyTerminationReturn, resolveEarlyTerminationRate } from "../calculators/early-termination.ts";

type RecordLike = Record<string, unknown>;
const finite = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
export const CALCULATOR_VERSION = "openfin-calculator-v1";

export function calculateFinancialOutcome(item: RecordLike, preferences: RecordLike = {}) {
  const rate = resolveAttainableRate(item, preferences);
  const tax = finite(preferences.tax_rate_percent ?? preferences.tax_rate) ?? 15.4;
  const isSaving = item.product_kind === "saving" || item.search_type === "saving";
  const paymentTiming = preferences.payment_timing ?? item.payment_timing;
  const paymentSchedule = preferences.payment_schedule_krw ?? item.payment_schedule_krw;
  const calculationOptions = {
    compounding_frequency: item.compounding_frequency,
    interest_payment_frequency: item.interest_payment_frequency,
    day_count_convention: item.day_count_convention,
    accrual_basis: item.accrual_basis,
    rounding_policy: item.rounding_policy,
  };
  const calculate = (annualRatePercent: number | null) => isSaving
    ? calculateSavingReturn({ monthly_payment_krw: preferences.monthly_payment_krw ?? preferences.monthly_contribution_krw, payment_schedule_krw: paymentSchedule, payment_timing: paymentTiming, annual_rate_percent: annualRatePercent, term_months: item.term_months, tax_rate_percent: tax, rounding_policy: item.rounding_policy })
    : calculateDepositReturn({ principal_krw: preferences.principal_krw ?? preferences.deposit_amount_krw, annual_rate_percent: annualRatePercent, term_months: item.term_months, tax_rate_percent: tax, interest_method: item.interest_method, ...calculationOptions });
  const plannedTerminationMonths = finite(preferences.planned_termination_months ?? preferences.early_termination_months);
  const validPlannedTermination = plannedTerminationMonths === null || Number.isInteger(plannedTerminationMonths);
  const earlyRate = resolveEarlyTerminationRate(item, validPlannedTermination ? plannedTerminationMonths ?? undefined : undefined, rate.attainable_rate_percent ?? rate.base_rate_percent ?? undefined);
  const earlyTerminationRate = earlyRate.rate_percent;
  const base = calculate(rate.base_rate_percent ?? null);
  const attainable = calculate(rate.attainable_rate_percent ?? rate.rate_percent ?? null);
  const optimistic = calculate(rate.optimistic_rate_percent ?? rate.maximum_rate_percent ?? null);
  const monthlyPayment = finite(preferences.monthly_payment_krw ?? preferences.monthly_contribution_krw);
  const earlyPrincipal = isSaving
    ? (Array.isArray(paymentSchedule) ? paymentSchedule.every((value) => finite(value) !== null) ? paymentSchedule.slice(0, plannedTerminationMonths ?? 0).reduce<number>((sum, value) => sum + (finite(value) ?? 0), 0) : null : monthlyPayment === null ? null : monthlyPayment * (plannedTerminationMonths ?? 0))
    : preferences.principal_krw ?? preferences.deposit_amount_krw;
  const earlyTermination = !validPlannedTermination || plannedTerminationMonths === null ? null : calculateEarlyTerminationReturn({ principal_krw: earlyPrincipal, annual_early_termination_rate_percent: earlyTerminationRate, elapsed_months: plannedTerminationMonths, tax_rate_percent: tax, rounding_policy: item.rounding_policy });
  const raw = attainable;
  return {
    calculator_version: CALCULATOR_VERSION,
    ...rate,
    attainable_rate_percent: rate.rate_percent,
    product_kind: isSaving ? "saving" : "deposit",
    outcome_status: raw ? "calculated" : "amount_unknown",
    outcome: raw,
    financial_outcomes: {
      base: { annual_rate_percent: rate.base_rate_percent, outcome: base },
      attainable: { annual_rate_percent: rate.attainable_rate_percent, outcome: attainable },
      optimistic: { annual_rate_percent: rate.optimistic_rate_percent, outcome: optimistic, limitations: ["optimistic scenario assumes every asserted bonus rule is met"] },
      early_termination: { annual_rate_percent: earlyTerminationRate, elapsed_months: plannedTerminationMonths, outcome: earlyTermination, limitations: !validPlannedTermination ? ["planned termination time must be an integer number of months"] : plannedTerminationMonths === null ? ["planned termination time is required"] : earlyRate.reason ? [earlyRate.reason] : earlyPrincipal === null ? ["amount is required"] : [] },
    },
    non_monetary_conditions: { term_months: item.term_months ?? null, join_channels: item.join_channels ?? item.join_channel ?? [], sales_status: item.sales_status ?? null },
    uncertainty: { unknown_conditions: [...rate.unknown_conditions, ...(earlyRate.reason ? [earlyRate.reason] : []), ...(!validPlannedTermination ? ["planned_termination_requires_integer_months"] : [])], rate_scenario: rate.scenario, early_termination_rate_known: earlyRate.status === "known", planned_termination_known: plannedTerminationMonths !== null && validPlannedTermination },
  };
}
