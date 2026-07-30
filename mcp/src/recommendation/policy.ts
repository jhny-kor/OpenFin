export const RECOMMENDATION_POLICY_VERSION = "openfin-recommendation-policy-v1";

type Product = Record<string, unknown>;
type Inputs = { profile?: Product; constraints?: Product; decision_context?: Product };

const value = (item: Product, ...keys: string[]): unknown => keys.map((key) => item[key]).find((candidate) => candidate !== undefined && candidate !== null);
const number = (candidate: unknown): number | undefined => typeof candidate === "number" && Number.isFinite(candidate) ? candidate : undefined;
const asArray = (candidate: unknown): string[] => Array.isArray(candidate) ? candidate.filter((value): value is string => typeof value === "string") : [];

export function productDomain(item: Product): string | null {
  if (item.search_type === "deposit" || item.product_kind === "deposit") return "deposit";
  if (item.search_type === "saving" || item.product_kind === "saving") return "saving";
  if (item.type === "card-product") return "card";
  if (item.type === "insurance-product") return "insurance";
  if (item.search_type === "loan" || item.product_kind === "loan") return "loan";
  return null;
}

function currentAndVerified(item: Product): string[] {
  const reasons: string[] = [];
  if (item.verification_status !== "verified") reasons.push("verification_not_verified");
  if (item.freshness_status !== "current") reasons.push(item.freshness_status === "stale" ? "stale_source" : "freshness_unknown");
  if (item.sales_status !== "active" || item.sales_verification_status !== "verified_active") reasons.push("sales_not_verified");
  if (item.recommendation_status !== "verified_recommendation_candidate") reasons.push("not_verified_recommendation_candidate");
  if (item.recommendation_scope !== "public_recommendation") reasons.push("not_public_recommendation_scope");
  return reasons;
}

export function evaluateEligibility(item: Product, inputs: Inputs = {}) {
  const constraints = inputs.constraints ?? {};
  const context = inputs.decision_context ?? {};
  const matched_conditions: string[] = [];
  const failed_conditions: string[] = currentAndVerified(item);
  const unknown_conditions: string[] = [];
  const addExact = (key: string, itemKeys: string[], label: string) => {
    const expected = constraints[key];
    if (expected === undefined || expected === null || expected === "") return;
    const actual = value(item, ...itemKeys);
    if (actual === undefined || actual === null || actual === "") unknown_conditions.push(`${label}_unknown`);
    else {
      const expectedValues = Array.isArray(expected) ? expected.map(String) : [String(expected)];
      const actualValues = Array.isArray(actual) ? actual.map(String) : [String(actual)];
      if (expectedValues.some(value => actualValues.includes(value))) matched_conditions.push(`${label}_matched`);
      else failed_conditions.push(`${label}_failed`);
    }
  };
  addExact("provider", ["provider"], "provider");
  addExact("term_months", ["term_months"], "term");
  addExact("saving_method", ["saving_method"], "saving_method");
  addExact("join_channel", ["join_channel", "join_channels"], "join_channel");

  // Only explicitly named decision-context constraints become hard checks;
  // profile preferences stay in ranking and never silently change eligibility.
  const liquidity = context.liquidity_requirement;
  const liquidityMonths = liquidity && typeof liquidity === "object" && !Array.isArray(liquidity) ? number((liquidity as Product).months) : undefined;
  if (liquidityMonths !== undefined) {
    const term = number(value(item, "term_months"));
    if (term === undefined) unknown_conditions.push("term_months");
    else if (term > liquidityMonths) failed_conditions.push("term_exceeds_liquidity_horizon");
    else matched_conditions.push("liquidity_horizon_matched");
  }
  const riskCapacity = typeof context.risk_capacity === "string" ? context.risk_capacity : undefined;
  if (riskCapacity) {
    const risk = typeof item.risk_level === "string" ? item.risk_level : undefined;
    if (!risk) unknown_conditions.push("product_risk_level");
    else if (riskCapacity !== risk) failed_conditions.push("risk_capacity_failed");
    else matched_conditions.push("risk_capacity_matched");
  }

  const minAmount = number(constraints.minimum_amount_krw ?? constraints.min_amount_krw);
  const maxAmount = number(constraints.maximum_amount_krw ?? constraints.max_amount_krw);
  const productMin = number(value(item, "minimum_deposit_krw", "monthly_payment_min_krw"));
  const productMax = number(value(item, "maximum_deposit_krw", "monthly_payment_max_krw"));
  if (minAmount !== undefined) {
    if (productMax === undefined) unknown_conditions.push("maximum_amount_unknown");
    else if (productMax < minAmount) failed_conditions.push("minimum_amount_failed");
    else matched_conditions.push("minimum_amount_matched");
  }
  if (maxAmount !== undefined) {
    if (productMin === undefined) unknown_conditions.push("minimum_amount_unknown");
    else if (productMin > maxAmount) failed_conditions.push("maximum_amount_failed");
    else matched_conditions.push("maximum_amount_matched");
  }

  const requiredConditions = asArray(constraints.eligible_conditions);
  if (requiredConditions.length) {
    const aliases: Record<string, string> = { salarytransfer: "급여이체", salarydeposit: "급여이체", autopay: "자동이체", cardspend: "카드실적" };
    const normalize = (condition: string) => {
      const compact = condition.trim().toLocaleLowerCase("ko-KR").replace(/[^\p{L}\p{N}]+/gu, "");
      return aliases[compact] ?? compact;
    };
    const available = new Set(asArray(item.preferential_rate_conditions).concat(asArray(item.eligible_conditions)).map(normalize));
    const missing = requiredConditions.filter((condition) => !available.has(normalize(condition)));
    if (missing.length) unknown_conditions.push(...missing.map((condition) => `condition_unknown:${condition}`));
    else matched_conditions.push("eligible_conditions_matched");
  }

  const data_as_of = value(item, "last_verified_at", "verified_at", "sales_verified_at", "source_modified_at") ?? null;
  const eligible = failed_conditions.length === 0 && unknown_conditions.length === 0;
  return {
    eligible,
    matched_conditions: [...new Set(matched_conditions)].sort(),
    failed_conditions: [...new Set(failed_conditions)].sort(),
    unknown_conditions: [...new Set(unknown_conditions)].sort(),
    reason_codes: [...new Set(failed_conditions.concat(unknown_conditions))].sort(),
    data_as_of,
    policy_version: RECOMMENDATION_POLICY_VERSION,
  };
}

export function recommendationFields(item: Product): string[] {
  return ["base_rate_percent", "maximum_rate_percent", "term_months", "join_channel", "sales_status", "sales_verification_status", "freshness_status", "provenance"]
    .filter((field) => item[field] !== undefined && item[field] !== null);
}
