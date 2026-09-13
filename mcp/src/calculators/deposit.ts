import { calculateInterestTax, roundKrw } from "./tax.ts";

const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateDepositReturn({ principal_krw, annual_rate_percent, term_months, tax_rate_percent = 15.4, interest_method = "simple", compounding_frequency, interest_payment_frequency, day_count_convention, accrual_basis, rounding_policy, accrual_days }: Record<string, unknown>) {
  const principal = number(principal_krw), rate = number(annual_rate_percent), months = number(term_months), tax = number(tax_rate_percent);
  if (principal === null || rate === null || months === null || tax === null || principal < 0 || rate < 0 || months <= 0 || !Number.isInteger(months)) return null;
  const method = interest_method === "단리" ? "simple" : interest_method === "복리" ? "compound" : String(interest_method);
  if (!["simple", "compound", "compound_monthly", "compound_daily", "compound_annual"].includes(method)) return null;
  if (method === "compound" && compounding_frequency === undefined) return null;
  const explicitFrequency = compounding_frequency === undefined ? undefined : String(compounding_frequency);
  if (method === "simple" && explicitFrequency !== undefined && explicitFrequency !== "none") return null;
  const frequency = method === "compound_monthly" ? "monthly" : method === "compound_daily" ? "daily" : method === "compound_annual" ? "annual" : explicitFrequency ?? (method === "compound" ? "annual" : "none");
  if (method !== "simple" && frequency === "none") return null;
  if (method.startsWith("compound_") && explicitFrequency !== undefined && explicitFrequency !== frequency) return null;
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
  const paymentFrequency = interest_payment_frequency ?? "at_maturity";
  if (paymentFrequency === "daily" && ["monthly", "annual"].includes(frequency)) return null;
  if (frequency === "daily" && paymentFrequency !== "at_maturity" && paymentFrequency !== "daily") return null;
  if (paymentFrequency === "monthly" && frequency === "annual") return null;
  if (paymentFrequency === "annual" && frequency === "annual" && months % 12 !== 0) return null;
  const periodic = paymentFrequency !== "at_maturity" ? Array.from({ length: paymentFrequency === "monthly" ? months : paymentFrequency === "annual" ? Math.ceil(months / 12) : Math.max(1, Math.round(days)) }, (_, index) => {
    const periodMonths = paymentFrequency === "monthly" ? 1 : paymentFrequency === "annual" ? Math.min(12, months - index * 12) : 1;
    const weight = paymentFrequency === "daily" ? 1 / Math.max(1, Math.round(days)) : periodMonths / months;
    const grossInterest = frequency === "monthly"
      ? principal * ((1 + periodRate) ** periodMonths - 1)
      : frequency === "annual"
        ? principal * ((1 + periodRate) ** (periodMonths / 12) - 1)
        : principal * rate / 100 * accrualYears * weight;
    return { period: index + 1, gross_interest_krw: grossInterest };
  }).filter((entry) => entry.gross_interest_krw > 0) : [];
  const gross = periodic.length ? periodic.reduce((sum, entry) => sum + entry.gross_interest_krw, 0) : frequency === "none" ? principal * rate / 100 * accrualYears : frequency === "annual" ? principal * ((1 + rate / 100) ** accrualYears - 1) : principal * ((1 + periodRate) ** periods - 1);
  const taxResult = calculateInterestTax(gross, tax, rounding_policy);
  if (!taxResult) return null;
  const cashflows = periodic.map((entry) => ({ ...entry, gross_interest_krw: roundKrw(entry.gross_interest_krw, rounding_policy) }));
  if (cashflows.length) cashflows[cashflows.length - 1].gross_interest_krw += taxResult.gross_interest_krw - cashflows.reduce((sum, entry) => sum + entry.gross_interest_krw, 0);
  return { principal_krw: principal, ...taxResult, periodic_interest_cashflows: cashflows, maturity_principal: principal, maturity_principal_krw: principal, total_gross_interest: taxResult.gross_interest_krw, total_gross_interest_krw: taxResult.gross_interest_krw, total_net_interest: taxResult.net_interest_krw, total_net_interest_krw: taxResult.net_interest_krw, maturity_amount_krw: roundKrw(principal + (periodic.length ? 0 : taxResult.net_interest_krw), rounding_policy), calculation_assumption: periodic.length ? `${paymentFrequency}_interest_payment_without_reinvestment` : frequency === "none" ? "simple_interest_for_full_term_deposit" : `${frequency}_compound_for_full_term_deposit`, interest_payment_frequency: paymentFrequency };
}
