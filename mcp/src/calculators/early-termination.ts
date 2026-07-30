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
