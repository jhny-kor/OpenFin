type Item = Record<string, unknown>;

type Eligibility = {
  eligible: boolean;
  reason_codes?: string[];
  [key: string]: unknown;
};

type Ranking = {
  score?: number;
  score_components?: Record<string, number>;
  recommendation_model_version?: string;
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
  for (const item of items) {
    const eligibility = options.evaluateEligibility(item, {
      profile: options.profile,
      constraints: options.constraints,
      decision_context: options.decision_context,
    });
    const gate = options.itemGate?.(item);
    const blocker = options.recommendationBlocker?.(item)
      ?? (eligibility.eligible ? undefined : eligibility.reason_codes?.[0] ?? "eligibility_unknown")
      ?? (gate?.status === "ready" ? undefined : gate?.reasons?.[0]);
    if (blocker) {
      excluded.push({ item_id: String(item.id), reason: blocker });
      continue;
    }
    const ranking = options.rankCandidate(item, options.preferences ?? {});
    candidates.push(options.toCandidate?.(item, eligibility, ranking) ?? {
      item_id: item.id,
      title: item.title,
      ...options.explainCandidate(item, eligibility, ranking),
      score: ranking.score,
      score_components: ranking.score_components,
      recommendation_model_version: ranking.recommendation_model_version,
    });
  }
  candidates.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0) || String(a.item_id).localeCompare(String(b.item_id), "ko-KR"));
  return { candidates, excluded };
}
