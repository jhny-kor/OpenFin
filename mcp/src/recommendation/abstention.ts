type RecordLike = Record<string, unknown>;

export function recommendationAbstention(context: RecordLike = {}) {
  const reasons: string[] = [];
  const required = ["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw"];
  const missing = required.filter((key) => context[key] === undefined || context[key] === null || context[key] === "");
  if (missing.length) reasons.push("CONTEXT_INCOMPLETE");
  const income = typeof context.monthly_net_income_krw === "number" ? context.monthly_net_income_krw : null;
  const expenses = typeof context.essential_monthly_expenses_krw === "number" ? context.essential_monthly_expenses_krw : null;
  if (income !== null && expenses !== null && income < expenses) reasons.push("NO_PRODUCT_RECOMMENDED_NEGATIVE_CASHFLOW");
  return { abstain: reasons.length > 0, reason_codes: reasons, missing_fields: missing };
}
