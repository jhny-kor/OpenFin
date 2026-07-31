import { RECOMMENDATION_POLICY_VERSION } from "./policy.ts";
import { calculateFinancialOutcome, CALCULATOR_VERSION } from "./outcome.ts";
import { compareRankingKeys, rankingKey, RANKING_VERSION } from "./ranking-v2.ts";

type Candidate = Record<string, unknown>;

const numeric = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : 0;
const rounded = (value: number): number => Math.round(value * 100) / 100;

export function rankCandidate(item: Candidate, preferences: Candidate = {}) {
  const components: Record<string, number> = {
    after_tax_return: 0,
    liquidity_fit: 0,
    term_fit: 0,
    condition_attainability: 0,
    provider_preference: 0,
    freshness_confidence: 0,
  };
  const taxRate = Math.min(100, Math.max(0, numeric(preferences.tax_rate_percent ?? preferences.tax_rate ?? 15.4)));
  const outcomeResult = calculateFinancialOutcome(item, { ...preferences, tax_rate_percent: taxRate });
  const financial_outcome = outcomeResult.outcome;
  const rate = numeric(outcomeResult.rate_percent);
  if (financial_outcome) components.after_tax_return = rounded(financial_outcome.net_interest_krw / 100000);
  else if (rate) components.after_tax_return = rounded(rate * (1 - taxRate / 100) * 10);
  if (preferences.provider && preferences.provider === item.provider) components.provider_preference = 2;
  if (preferences.term_months !== undefined && String(preferences.term_months) === String(item.term_months)) components.term_fit = 7;
  const horizon = numeric(preferences.liquidity_horizon_months ?? preferences.max_term_months);
  const term = numeric(item.term_months);
  if (horizon && term) components.liquidity_fit = term <= horizon ? 8 : -8;
  const liquidAssets = numeric(preferences.liquid_assets_krw);
  const requiredLiquidity = numeric(item.minimum_deposit_krw ?? item.monthly_payment_min_krw);
  if (liquidAssets && requiredLiquidity) components.liquidity_fit += requiredLiquidity <= liquidAssets ? 4 : -8;
  const explicitBudget = numeric(preferences.monthly_budget_krw ?? preferences.monthly_contribution_krw);
  const disposableIncome = numeric(preferences.monthly_net_income_krw) - numeric(preferences.essential_monthly_expenses_krw);
  const budget = explicitBudget || (disposableIncome > 0 ? disposableIncome : 0);
  if (budget) {
    const minimum = numeric(item.monthly_payment_min_krw);
    const maximum = numeric(item.monthly_payment_max_krw) || Infinity;
    components.condition_attainability = budget >= minimum && budget <= maximum ? 6 : -4;
  } else if (Array.isArray(item.bonus_rate_rules) && item.bonus_rate_rules.length === 0) {
    components.condition_attainability = 3;
  }
  // Freshness and sales verification are release gates, never score bonuses.
  const score = Object.values(components).reduce((sum, value) => sum + value, 0);
  return {
    score,
    score_components: components,
    financial_outcome,
    financial_outcomes: outcomeResult.financial_outcomes,
    financial_outcome_detail: outcomeResult,
    ranking_key: rankingKey(item, { ...preferences, tax_rate_percent: taxRate }),
    ranking_version: RANKING_VERSION,
    calculator_version: outcomeResult.calculator_version ?? CALCULATOR_VERSION,
    recommendation_model_version: RECOMMENDATION_POLICY_VERSION,
  };
}

export function rankCandidates<T extends Candidate>(items: readonly T[], preferences: Candidate = {}): Array<T & ReturnType<typeof rankCandidate>> {
  return items.map((item) => ({ ...item, ...rankCandidate(item, preferences) })).sort((left, right) => compareRankingKeys(left.ranking_key, right.ranking_key));
}
