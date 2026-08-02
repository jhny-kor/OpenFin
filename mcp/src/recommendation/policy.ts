import { isVerifiedActive } from "../product-status.ts";
import { evaluateRules, type StructuredRule } from "./rule-engine.ts";
import { contextFacts, type RecommendationContext } from "./context.ts";

export const RECOMMENDATION_POLICY_VERSION = "openfin-recommendation-policy-v1";

type Product = Record<string, unknown>;
type Inputs = { profile?: Product; constraints?: Product; decision_context?: Product; mode?: "public" | "shadow" | "owner_pilot" };

const value = (item: Product, ...keys: string[]): unknown => keys.map((key) => item[key]).find((candidate) => candidate !== undefined && candidate !== null);
const number = (candidate: unknown): number | undefined => typeof candidate === "number" && Number.isFinite(candidate) ? candidate : undefined;

export function productDomain(item: Product): string | null {
  if (item.type === "deposit-offer" || (item.type === "offer-option" && (item.search_type === "deposit" || item.product_kind === "deposit"))) return "deposit";
  if (item.type === "saving-offer" || (item.type === "offer-option" && (item.search_type === "saving" || item.product_kind === "saving"))) return "saving";
  if (item.search_type === "deposit" || item.product_kind === "deposit") return "deposit";
  if (item.search_type === "saving" || item.product_kind === "saving") return "saving";
  if (item.type === "card-product") return "card";
  if (item.type === "insurance-product") return "insurance";
  if (item.search_type === "loan" || item.product_kind === "loan") return "loan";
  return null;
}

function currentAndVerified(item: Product, mode: Inputs["mode"] = "public"): string[] {
  const reasons: string[] = [];
  if (item.verification_status !== "verified") reasons.push("verification_not_verified");
  if (item.freshness_status !== "current") reasons.push(item.freshness_status === "stale" ? "stale_source" : "freshness_unknown");
  if (item.sales_status !== "active" || !isVerifiedActive(item.sales_verification_status)) reasons.push("sales_not_verified");
  const capabilities = item.capabilities && typeof item.capabilities === "object" && !Array.isArray(item.capabilities) ? item.capabilities as Product : {};
  const pilotReady = (mode === "shadow" || mode === "owner_pilot") && (item.comparison_approved === true || capabilities.comparison === "limited_public" || capabilities.comparison === "public");
  if (mode !== "public" && !pilotReady) reasons.push("comparison_candidate_not_approved");
  const ownerReady = mode !== "owner_pilot" || item.recommendation_approved === true || capabilities.recommendation === "owner_pilot";
  if (mode === "owner_pilot" && !ownerReady) reasons.push("owner_pilot_candidate_not_approved");
  if (mode === "public" && item.recommendation_approved !== true && capabilities.recommendation !== "public") {
    if (item.recommendation_status !== "verified_recommendation_candidate") reasons.push("not_verified_recommendation_candidate");
    if (item.recommendation_scope !== "public_recommendation") reasons.push("not_public_recommendation_scope");
  }
  return reasons;
}

export function evaluateEligibility(item: Product, inputs: Inputs = {}) {
  const constraints = inputs.constraints ?? {};
  const context = inputs.decision_context ?? {};
  const matched_conditions: string[] = [];
  const failed_conditions: string[] = currentAndVerified(item, inputs.mode);
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
    else if (!riskCapacityAllows(riskCapacity, risk)) failed_conditions.push("risk_capacity_failed");
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

  const rules = (Array.isArray(item.eligibility_rules) ? item.eligibility_rules : []).filter((rule): rule is StructuredRule => Boolean(rule && typeof rule === "object" && typeof (rule as Product).rule_id === "string" && (rule as Product).predicate && typeof (rule as Product).predicate === "object"));
  const factContext: RecommendationContext = { as_of: typeof context.as_of === "string" ? context.as_of : null, comparison_mode: "user_fit", goal: {}, facts: { ...(inputs.profile ?? {}), ...context }, hard_constraints: {}, preferences: {}, assumptions: [], consent: { transient_only: true } };
  const ruleResult = evaluateRules(rules, contextFacts(factContext));
  matched_conditions.push(...ruleResult.matched.map((id) => `rule_matched:${id}`));
  failed_conditions.push(...ruleResult.failed.map((id) => `rule_failed:${id}`));
  unknown_conditions.push(...ruleResult.unknown.map((id) => `rule_unknown:${id}`));
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

function riskCapacityAllows(capacity: string, productRisk: string): boolean {
  const level = { low: 0, medium: 1, high: 2 } as const;
  const allowed = level[capacity as keyof typeof level];
  const required = level[productRisk as keyof typeof level];
  return allowed !== undefined && required !== undefined && required <= allowed;
}

export function recommendationFields(item: Product): string[] {
  return ["base_rate_percent", "maximum_rate_percent", "term_months", "join_channel", "sales_status", "sales_verification_status", "freshness_status", "provenance"]
    .filter((field) => item[field] !== undefined && item[field] !== null);
}
