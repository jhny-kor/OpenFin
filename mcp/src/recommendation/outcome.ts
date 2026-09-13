import { calculateDepositReturn } from "../calculators/deposit.ts";
import { calculateSavingReturn } from "../calculators/saving.ts";
import { resolveAttainableRate } from "./attainable-rate.ts";
import { calculateEarlyTerminationInstallments, calculateEarlyTerminationReturn, resolveEarlyTerminationRate } from "../calculators/early-termination.ts";

type RecordLike = Record<string, unknown>;
const finite = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
const isoDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const dayDifference = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
const calendarMonths = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00Z`), end = new Date(`${to}T00:00:00Z`);
  const addMonths = (date: Date, count: number) => {
    const result = new Date(date), day = result.getUTCDate();
    result.setUTCDate(1); result.setUTCMonth(result.getUTCMonth() + count);
    result.setUTCDate(Math.min(day, new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate()));
    return result;
  };
  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  const candidate = addMonths(start, months);
  if (candidate > end) months -= 1;
  const anchor = addMonths(start, months);
  const monthDays = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0)).getUTCDate();
  return months + (end.getTime() - anchor.getTime()) / (monthDays * 86400000);
};
export const CALCULATOR_VERSION = "openfin-calculator-v2";

export function calculateFinancialOutcome(item: RecordLike, preferences: RecordLike = {}) {
  const rate = resolveAttainableRate(item, preferences);
  const tax = finite(preferences.tax_rate_percent ?? preferences.tax_rate) ?? 15.4;
  const isSaving = item.product_kind === "saving" || item.search_type === "saving";
  const paymentTiming = preferences.payment_timing ?? item.payment_timing;
  const paymentSchedule = preferences.payment_schedule_krw ?? item.payment_schedule_krw;
  const monthlyPayment = finite(preferences.monthly_payment_krw ?? preferences.monthly_contribution_krw);
  const savingSchedule = Array.isArray(paymentSchedule) ? paymentSchedule : monthlyPayment !== null && Number.isInteger(item.term_months) ? Array.from({ length: item.term_months as number }, () => monthlyPayment) : null;
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
  const paidAt = preferences.installment_paid_at;
  const terminationDate = preferences.termination_date;
  const hasDateInput = paidAt !== undefined || terminationDate !== undefined;
  const validDateInput = !hasDateInput || (isSaving && item.day_count_convention !== "30/360" && Array.isArray(paidAt) && paidAt.length > 0 && isoDate(terminationDate) && paidAt.every(isoDate));
  const dateSchedule = validDateInput && Array.isArray(paidAt) && isoDate(terminationDate) ? paidAt as string[] : null;
  const validPlannedTermination = plannedTerminationMonths === null || Number.isInteger(plannedTerminationMonths);
  const earlyRate = resolveEarlyTerminationRate(item, validPlannedTermination ? plannedTerminationMonths ?? undefined : undefined, rate.attainable_rate_percent ?? rate.base_rate_percent ?? undefined);
  const earlyTerminationRate = earlyRate.rate_percent;
  const base = calculate(rate.base_rate_percent ?? null);
  const attainable = calculate(rate.attainable_rate_percent ?? rate.rate_percent ?? null);
  const optimistic = calculate(rate.optimistic_rate_percent ?? rate.maximum_rate_percent ?? null);
  const earlyPrincipal = isSaving
    ? (Array.isArray(paymentSchedule) ? paymentSchedule.every((value) => finite(value) !== null) ? paymentSchedule.slice(0, plannedTerminationMonths ?? 0).reduce<number>((sum, value) => sum + (finite(value) ?? 0), 0) : null : monthlyPayment === null ? null : monthlyPayment * (plannedTerminationMonths ?? 0))
    : preferences.principal_krw ?? preferences.deposit_amount_krw;
  const endDate = terminationDate as string;
  const earlyInstallments = isSaving && validDateInput && dateSchedule && Array.isArray(savingSchedule) && dateSchedule.length === savingSchedule.length ? savingSchedule.map((value, index) => {
    const principal = finite(value);
    const elapsedDays = dayDifference(dateSchedule[index], endDate);
    if (elapsedDays < 0 || (principal !== null && principal > 0 && dateSchedule[index] > endDate)) return null;
    const elapsed = calendarMonths(dateSchedule[index], endDate);
    const resolved = resolveEarlyTerminationRate(item, elapsed, rate.attainable_rate_percent ?? rate.base_rate_percent ?? undefined);
    return principal === null ? null : resolved.rate_percent === null ? null : { principal_krw: principal, elapsed_months: elapsed, elapsed_days: elapsedDays, annual_early_termination_rate_percent: resolved.rate_percent };
  }) : isSaving && validPlannedTermination && plannedTerminationMonths !== null && Array.isArray(savingSchedule) ? savingSchedule.slice(0, plannedTerminationMonths).map((value, index) => {
    const principal = finite(value);
    const elapsed = Math.max(0, plannedTerminationMonths - index - (paymentTiming === "month_end" ? 1 : 0));
    const resolved = resolveEarlyTerminationRate(item, elapsed, rate.attainable_rate_percent ?? rate.base_rate_percent ?? undefined);
    return principal === null || principal === 0 ? null : resolved.rate_percent === null ? null : { principal_krw: principal, elapsed_months: elapsed, annual_early_termination_rate_percent: resolved.rate_percent };
  }) : null;
  const earlyTermination = !validDateInput || (dateSchedule && Array.isArray(savingSchedule) && dateSchedule.length !== savingSchedule.length) ? null : earlyInstallments?.some((entry) => entry === null) ? null : earlyInstallments ? calculateEarlyTerminationInstallments({ installments: earlyInstallments, day_count_convention: item.day_count_convention, tax_rate_percent: tax, rounding_policy: item.rounding_policy }) : !validPlannedTermination || plannedTerminationMonths === null ? null : calculateEarlyTerminationReturn({ principal_krw: earlyPrincipal, annual_early_termination_rate_percent: earlyTerminationRate, elapsed_months: plannedTerminationMonths, tax_rate_percent: tax, rounding_policy: item.rounding_policy });
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
      early_termination: { annual_rate_percent: earlyTerminationRate, elapsed_months: plannedTerminationMonths, outcome: earlyTermination, limitations: !validDateInput ? ["installment dates and termination date must be valid and use a supported day-count convention"] : dateSchedule ? earlyTermination === null ? ["verified early-termination rate is required for every paid installment"] : [] : !validPlannedTermination ? ["planned termination time must be an integer number of months"] : plannedTerminationMonths === null ? ["planned termination time is required"] : earlyRate.reason ? [earlyRate.reason] : earlyPrincipal === null ? ["amount is required"] : [] },
    },
    non_monetary_conditions: { term_months: item.term_months ?? null, join_channels: item.join_channels ?? item.join_channel ?? [], sales_status: item.sales_status ?? null },
    uncertainty: { unknown_conditions: [...rate.unknown_conditions, ...(dateSchedule ? [] : earlyRate.reason ? [earlyRate.reason] : []), ...(!validPlannedTermination && !dateSchedule ? ["planned_termination_requires_integer_months"] : []), ...(!validDateInput ? ["installment_paid_at_and_termination_date_must_be_valid_and_complete"] : []), ...(dateSchedule && Array.isArray(savingSchedule) && dateSchedule.length !== savingSchedule.length ? ["installment_paid_at_length_must_match_payment_schedule"] : [])], rate_scenario: rate.scenario, early_termination_rate_known: dateSchedule ? earlyTermination !== null : earlyRate.status === "known", planned_termination_known: dateSchedule ? validDateInput && earlyTermination !== null : plannedTerminationMonths !== null && validPlannedTermination },
  };
}
