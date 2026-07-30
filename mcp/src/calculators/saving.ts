const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateSavingReturn({ monthly_payment_krw, annual_rate_percent, term_months, tax_rate_percent = 15.4 }: Record<string, unknown>) {
  const payment = number(monthly_payment_krw), rate = number(annual_rate_percent), months = number(term_months), tax = number(tax_rate_percent);
  if (payment === null || rate === null || months === null || tax === null) return null;
  // Each fixed monthly payment is assumed to be made at month start; free-saving
  // schedules must provide an explicit payment schedule before they are ranked.
  const gross_interest_krw = Array.from({ length: months }, (_, index) => payment * rate / 100 * (months - index) / 12).reduce((sum, value) => sum + value, 0);
  const tax_withheld_krw = gross_interest_krw * tax / 100;
  return { principal_krw: payment * months, gross_interest_krw: Math.round(gross_interest_krw), tax_withheld_krw: Math.round(tax_withheld_krw), net_interest_krw: Math.round(gross_interest_krw - tax_withheld_krw), maturity_amount_krw: Math.round(payment * months + gross_interest_krw - tax_withheld_krw), calculation_assumption: "simple_interest_with_each_month_paid_at_month_start" };
}
