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
    data_as_of: eligibility.data_as_of ?? null,
    policy_version: ranking.recommendation_model_version ?? eligibility.policy_version,
  };
}
