import personalFinancePolicy from "../../../contracts/personal-finance-policy.json" with { type: "json" };

export type NeedGateStatus = "ready" | "blocked" | "insufficient_information" | "abstained" | "no_product_recommended";
export type NeedGateResult = { status: NeedGateStatus; reason_codes: string[]; missing_information: string[]; blocked_domains: string[] };

export function evaluateRecommendationNeedGate(domain: string, context: Record<string, unknown>, needs: readonly Record<string, unknown>[] = [], metrics: Record<string, Record<string, unknown>> = {}): NeedGateResult {
  const depositLike = domain === "deposit" || domain === "saving";
  const missing = ["as_of"].filter((key) => context[key] == null || context[key] === "");
  if (depositLike && (context.goal_purpose == null || context.goal_purpose === "")) missing.push("goal.purpose");
  if (depositLike && context.goal_target_date == null && typeof context.goal_liquidity_horizon_months !== "number") missing.push("goal.period");
  if (missing.length) return { status: "insufficient_information", reason_codes: ["RECOMMENDATION_CONTEXT_INCOMPLETE"], missing_information: missing, blocked_domains: [] };
  const active = new Set(needs.filter((need) => need.status === "active").map((need) => String(need.need_type)));
  if (depositLike && active.has("cashflow_stabilization")) return { status: "abstained", reason_codes: ["CASHFLOW_STABILIZATION_REQUIRED"], missing_information: [], blocked_domains: [domain] };
  if (depositLike && (active.has("liquidity_gap") || active.has("emergency_liquidity"))) return { status: "abstained", reason_codes: ["LIQUIDITY_PROTECTION_REQUIRED"], missing_information: [], blocked_domains: [domain] };
  const debtRate = metrics.weighted_debt_rate_percent?.value;
  if (typeof debtRate === "number" && debtRate >= personalFinancePolicy.thresholds.high_interest_debt_rate_percent && depositLike) return { status: "abstained", reason_codes: ["HIGH_INTEREST_DEBT_REVIEW_REQUIRED"], missing_information: [], blocked_domains: [domain] };
  return { status: "ready", reason_codes: [], missing_information: [], blocked_domains: [] };
}
