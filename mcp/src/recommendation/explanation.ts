type Candidate = Record<string, unknown>;

export function explainCandidate(item: Candidate, eligibility: Record<string, unknown>, ranking: Record<string, unknown>) {
  const provenance = Array.isArray(item.provenance) ? item.provenance : [];
  return {
    matched_conditions: eligibility.matched_conditions ?? [],
    failed_conditions: eligibility.failed_conditions ?? [],
    unknown_conditions: eligibility.unknown_conditions ?? [],
    reason_codes: eligibility.reason_codes ?? [],
    score: ranking.score ?? null,
    score_components: ranking.score_components ?? {},
    source_basis: provenance,
    source_assertion_ids: item.source_assertion_ids ?? provenance.map((entry) => entry.receipt_id ?? entry.assertion_id).filter(Boolean),
    decision_graph: {
      entities: {
        recommendation_context: { type: "RecommendationContext", as_of: item.as_of ?? null, fact_names: Object.keys(item.user_facts ?? {}).sort() },
        user_fact_claims: Object.keys(item.user_facts ?? {}).sort().map((fact) => ({ type: "UserFactClaim", fact, value_persisted: false })),
        eligibility_evaluation: { type: "EligibilityEvaluation", status: eligibility.eligible === true ? "eligible" : "insufficient_or_excluded" },
        financial_outcome: { type: "FinancialOutcome", value: ranking.financial_outcomes ?? ranking.financial_outcome ?? null },
        recommendation_decision: { type: "RecommendationDecision", candidate_id: item.candidate_id ?? item.option_id ?? item.id ?? null },
        decision_trace: { type: "DecisionTrace", supported_by: item.source_receipt_ids ?? [] },
        policy_version: { type: "PolicyVersion", version: eligibility.policy_version ?? ranking.recommendation_model_version ?? null },
        calculator_version: { type: "CalculatorVersion", version: ranking.calculator_version ?? "openfin-calculator-v1" },
        ranking_version: { type: "RankingVersion", version: ranking.ranking_version ?? "openfin-ranking-v2" },
        artifact_generation: { type: "ArtifactGeneration", generation_id: item.generation_id ?? null },
      },
      candidate_id: item.candidate_id ?? item.option_id ?? item.id ?? null,
      offer_id: item.offer_id ?? null,
      rules: { matched: eligibility.matched_conditions ?? [], failed: eligibility.failed_conditions ?? [], unknown: eligibility.unknown_conditions ?? [] },
      outcomes: ranking.financial_outcomes ?? null,
      evidence: item.evidence_gate ?? item.promotion_receipt ?? null,
      ranking_basis: ranking.ranking_key ?? null,
    },
    data_as_of: eligibility.data_as_of ?? null,
    policy_version: ranking.recommendation_model_version ?? eligibility.policy_version,
  };
}
