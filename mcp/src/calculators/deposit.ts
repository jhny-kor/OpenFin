import { calculateInterestTax } from "./tax.ts";

const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateDepositReturn({ principal_krw, annual_rate_percent, term_months, tax_rate_percent = 15.4, interest_method = "simple" }: Record<string, unknown>) {
  const principal = number(principal_krw), rate = number(annual_rate_percent), months = number(term_months), tax = number(tax_rate_percent);
  if (principal === null || rate === null || months === null || tax === null) return null;
  const years = months / 12;
  const gross_interest_krw = interest_method === "compound" ? principal * ((1 + rate / 100) ** years - 1) : principal * rate / 100 * years;
  const taxResult = calculateInterestTax(gross_interest_krw, tax);
  return taxResult && { principal_krw: principal, ...taxResult, maturity_amount_krw: Math.round(principal + taxResult.net_interest_krw), calculation_assumption: interest_method === "compound" ? "annual_compound_for_full_term_deposit" : "simple_interest_for_full_term_deposit" };
}
