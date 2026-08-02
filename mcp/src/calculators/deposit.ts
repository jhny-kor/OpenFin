import { calculateInterestTax, roundKrw } from "./tax.ts";

const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateDepositReturn({ principal_krw, annual_rate_percent, term_months, tax_rate_percent = 15.4, interest_method = "simple", compounding_frequency, interest_payment_frequency, day_count_convention, accrual_basis, rounding_policy, accrual_days }: Record<string, unknown>) {
  const principal = number(principal_krw), rate = number(annual_rate_percent), months = number(term_months), tax = number(tax_rate_percent);
  if (principal === null || rate === null || months === null || tax === null || principal < 0 || rate < 0 || months <= 0 || !Number.isInteger(months)) return null;
  const method = String(interest_method);
  const explicitFrequency = compounding_frequency === undefined ? undefined : String(compounding_frequency);
  const frequency = method === "compound_monthly" ? "monthly" : method === "compound_daily" ? "daily" : method === "compound_annual" ? "annual" : explicitFrequency ?? (method === "compound" ? "annual" : "none");
  if (!["annual", "monthly", "daily", "none"].includes(frequency) || (accrual_basis !== undefined && !["simple", "compound", "daily_accrual"].includes(String(accrual_basis))) || (interest_payment_frequency !== undefined && !["at_maturity", "annual", "monthly", "daily"].includes(String(interest_payment_frequency)))) return null;
  const dayCount = day_count_convention === undefined ? null : String(day_count_convention);
  if (dayCount !== null && !["ACT/365", "ACT/366", "30/360"].includes(dayCount)) return null;
  const years = months / 12;
  const exactDays = number(accrual_days);
  if (dayCount && dayCount !== "30/360" && exactDays === null) return null;
  const days = exactDays ?? months * 30;
  const accrualYears = dayCount === "ACT/365" ? days / 365 : dayCount === "ACT/366" ? days / 366 : dayCount === "30/360" ? years : years;
  const periods = frequency === "monthly" ? months : frequency === "daily" ? Math.round(accrualYears * (dayCount === "ACT/366" ? 366 : 365)) : 0;
  const periodRate = rate / 100 / (frequency === "monthly" ? 12 : frequency === "daily" ? (dayCount === "ACT/366" ? 366 : 365) : 1);
  const gross = frequency === "none" ? principal * rate / 100 * accrualYears : frequency === "annual" ? principal * ((1 + rate / 100) ** accrualYears - 1) : principal * ((1 + periodRate) ** periods - 1);
  const taxResult = calculateInterestTax(gross, tax, rounding_policy);
  return taxResult && { principal_krw: principal, ...taxResult, maturity_amount_krw: roundKrw(principal + taxResult.net_interest_krw, rounding_policy), calculation_assumption: frequency === "none" ? "simple_interest_for_full_term_deposit" : `${frequency}_compound_for_full_term_deposit`, interest_payment_frequency: interest_payment_frequency ?? "at_maturity" };
}
