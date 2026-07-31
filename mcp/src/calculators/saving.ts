import { calculateInterestTax } from "./tax.ts";

const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateSavingReturn({ monthly_payment_krw, payment_schedule_krw, payment_timing = "month_start", annual_rate_percent, term_months, tax_rate_percent = 15.4 }: Record<string, unknown>) {
  const payment = number(monthly_payment_krw), rate = number(annual_rate_percent), months = number(term_months), tax = number(tax_rate_percent);
  if (rate === null || months === null || tax === null || rate < 0 || months <= 0 || !Number.isInteger(months) || !["month_start", "month_end"].includes(String(payment_timing))) return null;
  const schedule = Array.isArray(payment_schedule_krw) ? payment_schedule_krw.map(number) : payment === null ? null : Array.from({ length: months }, () => payment);
  if (!schedule || schedule.length !== months || schedule.some(value => value === null || value < 0) || !schedule.some(value => value !== null && value > 0)) return null;
  const payments = schedule as number[];
  const offset = payment_timing === "month_end" ? 1 : 0;
  const gross_interest_krw = payments.reduce((sum, value, index) => sum + value * rate / 100 * Math.max(0, months - index - offset) / 12, 0);
  const principal = payments.reduce((sum, value) => sum + value, 0);
  const taxResult = calculateInterestTax(gross_interest_krw, tax);
  return taxResult && { principal_krw: principal, ...taxResult, maturity_amount_krw: Math.round(principal + taxResult.net_interest_krw), calculation_assumption: `simple_interest_with_explicit_or_fixed_schedule_paid_at_${payment_timing}` };
}
