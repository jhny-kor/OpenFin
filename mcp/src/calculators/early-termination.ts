import { calculateInterestTax, roundKrw } from "./tax.ts";

const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

// This calculator is intentionally unavailable unless a product supplied an
// explicit early-termination rate; the caller must not substitute the normal rate.
export function calculateEarlyTerminationReturn({ principal_krw, annual_early_termination_rate_percent, elapsed_months, tax_rate_percent = 15.4, rounding_policy }: Record<string, unknown>) {
  const principal = finite(principal_krw), rate = finite(annual_early_termination_rate_percent), months = finite(elapsed_months);
  if (principal === null || rate === null || months === null || principal < 0 || rate < 0 || months < 0 || !Number.isInteger(months)) return null;
  const tax = calculateInterestTax(principal * rate / 100 * (months / 12), tax_rate_percent, rounding_policy);
  return tax && { principal_krw: principal, ...tax, settlement_amount_krw: roundKrw(principal + tax.net_interest_krw, rounding_policy), calculation_assumption: "verified_early_termination_rate_only" };
}

export function calculateEarlyTerminationInstallments({ installments, tax_rate_percent = 15.4, rounding_policy, day_count_convention = "ACT/365" }: Record<string, unknown>) {
  if (!Array.isArray(installments) || !installments.length) return null;
  if (!["ACT/365", "ACT/366", "30/360"].includes(String(day_count_convention))) return null;
  const valid = installments.map((entry) => {
    const value = entry && typeof entry === "object" && !Array.isArray(entry) ? entry as Record<string, unknown> : {};
    const principal = finite(value.principal_krw), rate = finite(value.annual_early_termination_rate_percent), months = finite(value.elapsed_months), days = finite(value.elapsed_days);
    return principal !== null && rate !== null && months !== null && months >= 0 && (days === null || days >= 0) && principal >= 0 && rate >= 0 ? { principal, rate, months, days } : null;
  });
  if (valid.some((entry) => entry === null)) return null;
  const rows = valid as { principal: number; rate: number; months: number; days: number | null }[];
  const dayCountDays = String(day_count_convention) === "ACT/366" ? 366 : String(day_count_convention) === "30/360" ? 360 : 365;
  const gross = rows.reduce((sum, entry) => sum + entry.principal * entry.rate / 100 * (entry.days === null ? entry.months / 12 : entry.days / dayCountDays), 0);
  const tax = calculateInterestTax(gross, tax_rate_percent, rounding_policy);
  return tax && { principal_krw: rows.reduce((sum, entry) => sum + entry.principal, 0), ...tax, settlement_amount_krw: roundKrw(rows.reduce((sum, entry) => sum + entry.principal, 0) + tax.net_interest_krw, rounding_policy), installment_outcomes: rows.map((entry) => ({ principal_krw: entry.principal, elapsed_months: entry.months, ...(entry.days === null ? {} : { elapsed_days: entry.days }), annual_early_termination_rate_percent: entry.rate })), calculation_assumption: rows.some((entry) => entry.days !== null) ? "verified_early_termination_rate_per_installment_actual_days" : "verified_early_termination_rate_per_installment" };
}

export function resolveEarlyTerminationRate(item: Record<string, unknown>, elapsedMonths: number | undefined, contractRatePercent: number | undefined): { rate_percent: number | null; status: "known" | "unknown"; reason?: string } {
  if (elapsedMonths === undefined || elapsedMonths < 0 || !Number.isFinite(elapsedMonths)) return { rate_percent: null, status: "unknown", reason: "planned_termination_unknown" };
  const rules = Array.isArray(item.early_termination_rules) ? item.early_termination_rules : [];
  const schedule = rules.flatMap((rule) => rule && typeof rule === "object" && !Array.isArray(rule) && typeof (rule as Record<string, unknown>).effect === "object" ? ((rule as Record<string, unknown>).effect as Record<string, unknown>).rate_schedule : []).filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry));
  const matched = schedule.find((entry) => {
    const from = typeof entry.from_elapsed_months === "number" ? entry.from_elapsed_months : Number.NEGATIVE_INFINITY;
    const until = typeof entry.until_elapsed_months === "number" ? entry.until_elapsed_months : Number.POSITIVE_INFINITY;
    return elapsedMonths >= from && elapsedMonths < until;
  });
  if (matched && typeof matched.rate_percent === "number") return { rate_percent: matched.rate_percent, status: "known" };
  if (matched && typeof matched.contract_rate_multiplier_percent === "number" && contractRatePercent !== undefined) return { rate_percent: contractRatePercent * matched.contract_rate_multiplier_percent / 100, status: "known" };
  const scalar = finite(item.early_termination_rate_percent);
  return scalar === null ? { rate_percent: null, status: "unknown", reason: "verified_early_termination_rate_missing" } : { rate_percent: scalar, status: "known" };
}
