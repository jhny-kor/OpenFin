export type CandidateCapability = "blocked" | "limited_public" | "public";

export type DecisionCandidate = Record<string, unknown> & {
  id: string;
  title: string;
  item_id: string;
  offer_id: string;
  option_id: string;
  candidate_id: string;
  type: "offer-option";
  search_type: "deposit" | "saving";
  product_kind: "deposit" | "saving";
  capabilities: {
    comparison: CandidateCapability;
    recommendation: CandidateCapability;
  };
  comparison_approved: boolean;
  recommendation_approved: boolean;
  evidence_gate: Record<string, unknown>;
};
