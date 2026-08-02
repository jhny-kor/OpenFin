const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function roundKrw(value: number, policy: unknown = undefined): number {
  const mode = policy && typeof policy === "object" && !Array.isArray(policy) && "mode" in policy ? String((policy as Record<string, unknown>).mode) : "nearest";
  return mode === "floor" ? Math.floor(value) : mode === "ceil" ? Math.ceil(value) : Math.round(value);
}

export function calculateInterestTax(gross_interest_krw: unknown, tax_rate_percent: unknown = 15.4, rounding_policy: unknown = undefined) {
  const gross = finite(gross_interest_krw);
  const rate = finite(tax_rate_percent);
  if (gross === null || rate === null || rate < 0 || rate > 100) return null;
  const roundedGross = roundKrw(gross, rounding_policy);
  const tax_withheld_krw = roundKrw(gross * rate / 100, rounding_policy);
  return { gross_interest_krw: roundedGross, tax_rate_percent: rate, tax_withheld_krw, net_interest_krw: roundedGross - tax_withheld_krw };
}
