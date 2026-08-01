type Candidate = Record<string, unknown>;

export const DECISION_TRACE_SCHEMA_VERSION = "openfin-decision-trace-v1";

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const keys = (value: unknown) => Object.keys(record(value)).sort();

export function validateDecisionTrace(trace: unknown): boolean {
  const value = record(trace);
  const entities = record(value.entities);
  return value.schema_version === DECISION_TRACE_SCHEMA_VERSION
    && (value.as_of === null || typeof value.as_of === "string")
    && typeof entities.recommendation_context === "object"
    && typeof entities.eligibility_evaluation === "object"
    && typeof entities.financial_outcome === "object"
    && typeof entities.recommendation_decision === "object"
    && typeof entities.decision_trace === "object"
    && typeof entities.artifact_generation === "object";
}

export function explainCandidate(item: Candidate, eligibility: Record<string, unknown>, ranking: Record<string, unknown>) {
  const provenance = Array.isArray(item.provenance) ? item.provenance : [];
  const asOf = typeof item.as_of === "string" ? item.as_of : typeof item.data_as_of === "string" ? item.data_as_of : null;
  const factSources = record(item.fact_sources);
  const outcome = record(ranking.financial_outcome);
  const outcomeDetail = record(ranking.financial_outcome_detail);
  const trace = {
    schema_version: DECISION_TRACE_SCHEMA_VERSION,
    as_of: asOf,
    entities: {
      recommendation_context: { type: "RecommendationContext", as_of: asOf, fact_names: keys(item.user_facts), source_classes: Object.fromEntries(Object.entries(factSources).sort(([left], [right]) => left.localeCompare(right))) },
      user_fact_claims: keys(item.user_facts).map((fact) => ({ type: "UserFactClaim", fact, source_class: factSources[fact] ?? "user_asserted", value_persisted: false })),
      eligibility_evaluation: { type: "EligibilityEvaluation", status: eligibility.eligible === true ? "eligible" : "insufficient_or_excluded", matched_count: Array.isArray(eligibility.matched_conditions) ? eligibility.matched_conditions.length : 0, failed_count: Array.isArray(eligibility.failed_conditions) ? eligibility.failed_conditions.length : 0, unknown_count: Array.isArray(eligibility.unknown_conditions) ? eligibility.unknown_conditions.length : 0 },
      financial_outcome: { type: "FinancialOutcome", status: outcomeDetail.outcome_status ?? (outcome ? "calculated" : "unknown"), fields: Object.keys(outcome).sort() },
      recommendation_decision: { type: "RecommendationDecision", candidate_id: item.candidate_id ?? item.option_id ?? item.id ?? null },
      decision_trace: { type: "DecisionTrace", schema_version: DECISION_TRACE_SCHEMA_VERSION, supported_by: item.source_receipt_ids ?? [] },
      policy_version: { type: "PolicyVersion", version: eligibility.policy_version ?? ranking.recommendation_model_version ?? null },
      calculator_version: { type: "CalculatorVersion", version: ranking.calculator_version ?? "openfin-calculator-v1" },
      ranking_version: { type: "RankingVersion", version: ranking.ranking_version ?? "openfin-ranking-v2" },
      artifact_generation: { type: "ArtifactGeneration", generation_id: item.generation_id ?? null },
    },
    candidate_id: item.candidate_id ?? item.option_id ?? item.id ?? null,
    offer_id: item.offer_id ?? null,
    rules: { matched: eligibility.matched_conditions ?? [], failed: eligibility.failed_conditions ?? [], unknown: eligibility.unknown_conditions ?? [] },
    evidence: { source_receipt_ids: item.source_receipt_ids ?? [], promotion_receipt_id: record(item.promotion_receipt).receipt_id ?? null },
    ranking_basis: ranking.ranking_key ?? null,
    monetary_values_in_trace: false,
  };
  if (!validateDecisionTrace(trace)) throw new Error("Decision trace failed structural validation");
  return {
    matched_conditions: eligibility.matched_conditions ?? [],
    failed_conditions: eligibility.failed_conditions ?? [],
    unknown_conditions: eligibility.unknown_conditions ?? [],
    reason_codes: eligibility.reason_codes ?? [],
    score: ranking.score ?? null,
    score_components: ranking.score_components ?? {},
    score_explanation_only: true,
    source_basis: provenance.map((entry) => ({ receipt_id: record(entry).receipt_id ?? null, source_id: record(entry).source_id ?? null, locator: record(entry).locator ?? null })),
    source_assertion_ids: item.source_assertion_ids ?? provenance.map((entry) => record(entry).receipt_id ?? record(entry).assertion_id).filter(Boolean),
    decision_graph: trace,
    data_as_of: eligibility.data_as_of ?? asOf,
    policy_version: ranking.recommendation_model_version ?? eligibility.policy_version,
  };
}
