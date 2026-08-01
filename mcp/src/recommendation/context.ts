export type RecommendationDomain = "deposit" | "saving" | "card" | "loan" | "insurance";
export type RecommendationContext = {
  as_of: string | null;
  goal: { purpose?: "save" | "preserve_liquidity" | "income" | "compare" | "education"; target_date?: string | null; liquidity_horizon_months?: number | null };
  facts: Record<string, unknown>;
  hard_constraints: Record<string, unknown>;
  preferences: Record<string, unknown>;
  assumptions: string[];
  consent: { transient_only: true };
};

export const RECOMMENDATION_FACT_KEYS = new Set(["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw", "tax_rate_percent", "can_transfer_salary", "can_use_card", "can_set_auto_transfer", "is_new_customer", "age_years", "residency_code", "customer_segment", "customer_type", "gender", "employment_type", "eligibility_review_status", "monthly_contribution_krw", "fact_sources"]);
const PREFERENCE_KEYS = new Set(["provider", "term_months", "liquidity_horizon_months", "max_term_months", "monthly_budget_krw", "monthly_contribution_krw", "principal_krw", "deposit_amount_krw", "tax_rate_percent", "risk_capacity", "planned_termination_months", "early_termination_months"]);
const CONSTRAINT_KEYS = new Set(["provider", "term_months", "join_channel", "minimum_amount_krw", "maximum_amount_krw", "eligible_rule_ids"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function pick(value: unknown, keys: Set<string>, label: string): Record<string, unknown> {
  const source = object(value); const unknown = Object.keys(source).filter((key) => !keys.has(key));
  if (unknown.length) throw new Error(`${label} contains unsupported fields: ${unknown.join(",")}`);
  return Object.fromEntries(Object.entries(source).filter(([, item]) => item !== undefined));
}
function date(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !DATE.test(value)) throw new Error(`${label} must use YYYY-MM-DD`);
  return value;
}

export function normalizeRecommendationContext(input: Record<string, unknown> = {}, domain?: RecommendationDomain): RecommendationContext {
  const nested = object(input.context);
  const legacyProfile = object(input.profile);
  const decisionContext = object(input.decision_context);
  const facts = pick({ ...object(nested.facts), ...Object.fromEntries(Object.entries(legacyProfile).filter(([key]) => RECOMMENDATION_FACT_KEYS.has(key))), ...object(input.facts), ...object(decisionContext.facts) }, RECOMMENDATION_FACT_KEYS, "facts");
  const hard_constraints = pick({ ...object(nested.hard_constraints), ...object(input.constraints), ...object(input.hard_constraints) }, CONSTRAINT_KEYS, "hard_constraints");
  const preferences = pick({ ...object(nested.preferences), ...object(input.preferences) }, PREFERENCE_KEYS, "preferences");
  const nestedGoal = object(nested.goal);
  const goal = {
    purpose: nestedGoal.purpose as RecommendationContext["goal"]["purpose"],
    target_date: date(nestedGoal.target_date, "goal.target_date"),
    liquidity_horizon_months: typeof nestedGoal.liquidity_horizon_months === "number" ? nestedGoal.liquidity_horizon_months : null,
  };
  const asOfValues = [nested.as_of, input.as_of, decisionContext.as_of, facts.as_of].filter((value) => value !== undefined && value !== null && value !== "").map((value) => date(value, "as_of"));
  if (new Set(asOfValues).size > 1) throw new Error("all as_of values must match");
  const as_of = asOfValues[0] ?? null;
  if (as_of !== null) facts.as_of = as_of;
  if (domain && !["deposit", "saving", "card", "loan", "insurance"].includes(domain)) throw new Error(`unsupported recommendation domain: ${domain}`);
  return { as_of, goal, facts, hard_constraints, preferences, assumptions: Array.isArray(nested.assumptions) ? nested.assumptions.filter((item): item is string => typeof item === "string").slice(0, 20) : [], consent: { transient_only: true } };
}

export function contextFieldNames(context: RecommendationContext): string[] {
  return [...new Set(["as_of", ...Object.keys(context.goal).filter((key) => context.goal[key as keyof typeof context.goal] != null).map((key) => `goal.${key}`), ...Object.keys(context.facts).map((key) => `facts.${key}`), ...Object.keys(context.hard_constraints).map((key) => `hard_constraints.${key}`), ...Object.keys(context.preferences).map((key) => `preferences.${key}`)])].sort();
}

export function contextFacts(context: RecommendationContext): Record<string, unknown> {
  const term = typeof context.preferences.term_months === "number" ? context.preferences.term_months : typeof context.hard_constraints.term_months === "number" ? context.hard_constraints.term_months : undefined;
  const liquidity = context.goal.liquidity_horizon_months ?? undefined;
  return {
    ...context.facts,
    user: context.facts,
    decision: { as_of: context.as_of, ...(term === undefined ? {} : { term_months: term }), ...(liquidity === undefined ? {} : { liquidity_horizon_months: liquidity }) },
    ...Object.fromEntries(Object.entries(context.goal).filter(([, value]) => value != null).map(([key, value]) => [`goal.${key}`, value])),
    ...Object.fromEntries(Object.entries(context.hard_constraints).map(([key, value]) => [`constraint.${key}`, value])),
  };
}
