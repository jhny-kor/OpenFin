import type { FinanceRecord, FinanceItem, ToolContext } from "../types/tool-context.ts";

export type PilotMode = "shadow" | "owner_pilot";
export type PilotContextInput = {
  facts?: FinanceRecord;
  constraints?: FinanceRecord;
  preferences?: FinanceRecord;
  decision_context?: FinanceRecord;
};

const record = (value: unknown): FinanceRecord => value && typeof value === "object" && !Array.isArray(value) ? value as FinanceRecord : {};

export function evaluatePilotCandidates({
  ctx,
  items,
  manifest,
  domain,
  mode,
  asOf,
  context = {},
  deploymentCommit,
}: {
  ctx: Pick<ToolContext, "buildRecommendationCandidates" | "evaluateEligibility" | "rankCandidate" | "explainCandidate" | "evaluateReleaseGate" | "manifestChecksumContract">;
  items: readonly FinanceItem[];
  manifest: FinanceRecord;
  domain: string;
  mode: PilotMode;
  asOf: string;
  context?: PilotContextInput;
  deploymentCommit?: string;
}) {
  const facts = record(context.facts);
  const constraints = record(context.constraints);
  const decisionContext = { ...record(context.decision_context), ...facts, as_of: asOf };
  const preferences = { ...facts, ...record(context.preferences), as_of: asOf };
  const recommendation = ctx.buildRecommendationCandidates(items as unknown as FinanceRecord[], {
    profile: facts,
    constraints,
    decision_context: decisionContext,
    preferences,
    evaluateEligibility: (item, inputs) => ctx.evaluateEligibility(item, { ...inputs, mode }),
    rankCandidate: ctx.rankCandidate,
    explainCandidate: ctx.explainCandidate,
    itemGate: (item) => ctx.evaluateReleaseGate({
      manifest,
      checksumVerified: ctx.manifestChecksumContract(manifest),
      deploymentCommit,
      domain,
      item,
      mode,
    }),
    toCandidate: (item, eligibility, ranking) => ({
      item_id: item.id,
      candidate_id: item.candidate_id ?? item.option_id ?? item.id,
      option_id: item.option_id ?? null,
      offer_id: item.offer_id ?? null,
      title: item.title,
      provider: item.provider,
      eligible: true,
      ...ctx.explainCandidate({ ...item, as_of: asOf, user_facts: facts, generation_id: manifest.generation_id ?? null }, eligibility, ranking),
      score: ranking.score,
      score_components: ranking.score_components,
      ranking_key: ranking.ranking_key ?? null,
      ranking_version: ranking.ranking_version ?? null,
      calculator_version: ranking.calculator_version ?? null,
      recommendation_model_version: ranking.recommendation_model_version ?? null,
      financial_outcome: ranking.financial_outcome ?? null,
      financial_outcomes: ranking.financial_outcomes ?? null,
      promotion_receipt: item.promotion_receipt ?? null,
      data_as_of: eligibility.data_as_of ?? item.last_verified_at ?? item.verified_at ?? null,
    }),
  });
  const reasonCounts: Record<string, number> = {};
  for (const entry of recommendation.excluded) {
    const reason = String(entry.reason ?? "unknown");
    reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
  }
  return {
    candidates: recommendation.candidates,
    excluded: recommendation.excluded,
    evaluated_count: items.length,
    eligible_count: recommendation.candidates.length,
    excluded_count: recommendation.excluded.length,
    reason_counts: Object.fromEntries(Object.entries(reasonCounts).sort(([left], [right]) => left.localeCompare(right))),
    actual_evaluation: true,
  };
}
