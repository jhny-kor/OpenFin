import { calculateFinancialOutcome } from "./outcome.ts";

type RecordLike = Record<string, unknown>;
const number = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : 0;
export const RANKING_VERSION = "openfin-ranking-v2";

/** Primary ordering is economic outcome; preferences only break ties. */
export function rankingKey(item: RecordLike, preferences: RecordLike = {}) {
  const outcome = calculateFinancialOutcome(item, preferences);
  const liquidity = number(preferences.liquidity_horizon_months ?? preferences.max_term_months);
  const term = number(item.term_months);
  const liquidityFit = liquidity && term ? (term <= liquidity ? 1 : 0) : 0;
  const providerFit = preferences.provider && preferences.provider === item.provider ? 1 : 0;
  const termFit = preferences.term_months !== undefined && String(preferences.term_months) === String(item.term_months) ? 1 : 0;
  const net = number(outcome.outcome?.net_interest_krw);
  return [outcome.outcome_status === "calculated" ? 1 : 0, net, -outcome.unknown_conditions.length, liquidityFit, termFit, providerFit, String(item.candidate_id ?? item.option_id ?? item.item_id ?? item.id ?? "")];
}

export function compareRankingKeys(left: readonly unknown[], right: readonly unknown[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index], b = right[index];
    if (typeof a === "number" && typeof b === "number" && a !== b) return b - a;
    if (String(a) !== String(b)) return String(a).localeCompare(String(b), "ko-KR");
  }
  return 0;
}
