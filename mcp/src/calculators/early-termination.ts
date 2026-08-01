import { calculateInterestTax } from "./tax.ts";

const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

// This calculator is intentionally unavailable unless a product supplied an
// explicit early-termination rate; the caller must not substitute the normal rate.
export function calculateEarlyTerminationReturn({ principal_krw, annual_early_termination_rate_percent, elapsed_months, tax_rate_percent = 15.4 }: Record<string, unknown>) {
  const principal = finite(principal_krw), rate = finite(annual_early_termination_rate_percent), months = finite(elapsed_months);
  if (principal === null || rate === null || months === null || principal < 0 || rate < 0 || months < 0) return null;
  const tax = calculateInterestTax(principal * rate / 100 * (months / 12), tax_rate_percent);
  return tax && { principal_krw: principal, ...tax, settlement_amount_krw: Math.round(principal + tax.net_interest_krw), calculation_assumption: "verified_early_termination_rate_only" };
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
