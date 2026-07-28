import { RECOMMENDATION_POLICY_VERSION } from "./policy.ts";

type Candidate = Record<string, unknown>;

const numeric = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : 0;

export function rankCandidate(item: Candidate, preferences: Candidate = {}) {
  const components: Record<string, number> = {};
  const rate = numeric(item.maximum_rate_percent ?? item.base_rate_percent);
  if (rate) components.rate = Math.round(rate * 100);
  if (preferences.provider && preferences.provider === item.provider) components.provider_match = 20;
  if (preferences.term_months !== undefined && String(preferences.term_months) === String(item.term_months)) components.term_match = 10;
  if (item.freshness_status === "current") components.freshness = 10;
  if (item.sales_verification_status === "verified_active") components.sales_verification = 10;
  const score = Object.values(components).reduce((sum, value) => sum + value, 0);
  return { score, score_components: components, recommendation_model_version: RECOMMENDATION_POLICY_VERSION };
}

export function rankCandidates<T extends Candidate>(items: readonly T[], preferences: Candidate = {}): Array<T & ReturnType<typeof rankCandidate>> {
  return items.map((item) => ({ ...item, ...rankCandidate(item, preferences) })).sort((left, right) => Number(right.score) - Number(left.score) || String(left.item_id ?? left.id).localeCompare(String(right.item_id ?? right.id), "ko-KR"));
}
