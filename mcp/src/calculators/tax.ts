const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateInterestTax(gross_interest_krw: unknown, tax_rate_percent: unknown = 15.4) {
  const gross = finite(gross_interest_krw);
  const rate = finite(tax_rate_percent);
  if (gross === null || rate === null || rate < 0 || rate > 100) return null;
  const tax_withheld_krw = Math.round(gross * rate / 100);
  return { gross_interest_krw: Math.round(gross), tax_rate_percent: rate, tax_withheld_krw, net_interest_krw: Math.round(gross) - tax_withheld_krw };
}
