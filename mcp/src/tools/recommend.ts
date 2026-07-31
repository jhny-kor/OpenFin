type Item = Record<string, unknown>;
import { recommendationCandidateAdapter } from "../decision/candidate-adapter.ts";

type Eligibility = {
  eligible: boolean;
  reason_codes?: string[];
  [key: string]: unknown;
};

type Ranking = {
  score?: number;
  score_components?: Record<string, number>;
  recommendation_model_version?: string;
  ranking_key?: readonly unknown[];
  [key: string]: unknown;
};

type Options = {
  profile?: Item;
  constraints?: Item;
  decision_context?: Item;
  preferences?: Item;
  evaluateEligibility: (item: Item, inputs: { profile?: Item; constraints?: Item; decision_context?: Item }) => Eligibility;
  rankCandidate: (item: Item, preferences: Item) => Ranking;
  explainCandidate: (item: Item, eligibility: Eligibility, ranking: Ranking) => Item;
  recommendationBlocker?: (item: Item) => string | undefined;
  itemGate?: (item: Item) => { status: string; reasons?: string[] };
  toCandidate?: (item: Item, eligibility: Eligibility, ranking: Ranking) => Item;
};

export function buildRecommendationCandidates(items: readonly Item[], options: Options) {
  const excluded: Array<{ item_id: string; reason: string }> = [];
  const candidates: Item[] = [];
  for (const originalItem of items) {
    const item = originalItem.type === "offer-option" ? recommendationCandidateAdapter(originalItem) : originalItem;
    const eligibility = options.evaluateEligibility(item, {
      profile: options.profile,
      constraints: options.constraints,
      decision_context: options.decision_context,
    });
    const gate = options.itemGate?.(item);
    const blocker = eligibility.eligible ? undefined : eligibility.reason_codes?.[0] ?? "eligibility_unknown";
    const gated = blocker ?? options.recommendationBlocker?.(item) ?? (gate?.status === "ready" ? undefined : gate?.reasons?.[0]);
    if (gated) {
      excluded.push({ item_id: String(item.id), reason: gated });
      continue;
    }
    const ranking = options.rankCandidate(item, options.preferences ?? {});
    candidates.push(options.toCandidate?.(item, eligibility, ranking) ?? {
      item_id: item.id,
      title: item.title,
      ...options.explainCandidate(item, eligibility, ranking),
      score: ranking.score,
      score_components: ranking.score_components,
      ranking_key: ranking.ranking_key,
      recommendation_model_version: ranking.recommendation_model_version,
    });
  }
  candidates.sort((a, b) => {
    const left = a.ranking_key;
    const right = b.ranking_key;
    if (Array.isArray(left) && Array.isArray(right)) {
      for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
        const l = left[index], r = right[index];
        if (typeof l === "number" && typeof r === "number" && l !== r) return r - l;
        if (String(l) !== String(r)) return String(l).localeCompare(String(r), "ko-KR");
      }
    }
    return String(a.item_id).localeCompare(String(b.item_id), "ko-KR");
  });
  return { candidates, excluded };
}
