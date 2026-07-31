import { evaluateEvidenceGate } from "./evidence-gate.ts";
import type { DecisionCandidate } from "../types/decision-candidate.ts";

type RecordLike = Record<string, unknown>;
const record = (value: unknown): RecordLike => value && typeof value === "object" && !Array.isArray(value) ? value as RecordLike : {};
const list = (value: unknown): RecordLike[] => Array.isArray(value) ? value.filter((entry): entry is RecordLike => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
const unique = (values: unknown[]): string[] => [...new Set(values.filter((value): value is string => typeof value === "string"))];
const assertionIds = (assertions: RecordLike[]): string[] => unique(assertions.map((entry) => entry.assertion_id ?? entry.receipt_id ?? entry.receipt_checksum));

function optionLimits(option: RecordLike) {
  const amount = record(option.amount_limit);
  const monthly = record(option.monthly_payment_limit);
  return {
    minimum_deposit_krw: amount.minimum_krw,
    maximum_deposit_krw: amount.maximum_krw,
    monthly_payment_min_krw: monthly.minimum_krw,
    monthly_payment_max_krw: monthly.maximum_krw,
  };
}

export function adaptDecisionOfferOptions(offer: RecordLike, domain: "deposit" | "saving"): DecisionCandidate[] {
  if (offer.type !== `${domain}-offer` || !Array.isArray(offer.options)) return [];
  const provenance = list(offer.provenance);
  const sourceUrls = unique(provenance.map((entry) => entry.original_url));
  const sourceIds = unique([...list(offer.field_assertions), ...list(offer.options).flatMap((option) => list(option.field_assertions))].map((entry) => entry.source_id));
  return list(offer.options).flatMap((option) => {
    if (typeof option.option_id !== "string") return [];
    const gate = evaluateEvidenceGate({ offer, option, domain });
    const limits = optionLimits(option);
    const optionAssertions = list(option.field_assertions);
    const offerAssertions = list(offer.field_assertions);
    const sourceAssertionIds = assertionIds([...offerAssertions, ...optionAssertions]);
    const candidate: DecisionCandidate = {
      ...offer,
      ...option,
      id: option.option_id,
      item_id: option.option_id,
      candidate_id: option.option_id,
      option_id: option.option_id,
      offer_id: String(offer.id ?? ""),
      product_id: offer.product_id,
      title: `${String(offer.title ?? "")} (${String(option.term_months ?? "")}개월)`,
      type: "offer-option",
      search_type: domain,
      product_kind: domain,
      provider: offer.provider_id ?? offer.provider,
      offer_field_assertions: offerAssertions,
      option_field_assertions: optionAssertions,
      field_assertions: optionAssertions,
      source_urls: sourceUrls,
      source_ids: sourceIds,
      source_receipt_ids: unique(provenance.map((entry) => entry.receipt_id)),
      source_assertion_ids: sourceAssertionIds,
      source_assertions: [...offerAssertions, ...optionAssertions],
      ...limits,
      ...gate,
      evidence_gate: gate,
      capabilities: {
        comparison: gate.comparison_approved ? "limited_public" : "blocked",
        recommendation: gate.recommendation_approved ? "public" : "blocked",
      },
      recommendation_status: gate.recommendation_approved ? "verified_recommendation_candidate" : "reference_only",
      comparison_field_verification_status: gate.comparison_approved ? "verified" : "unverified",
      comparison_options: [{ ...option, ...limits, source_urls: sourceUrls, source_assertions: optionAssertions, candidate_id: option.option_id }],
      decision_critical: true,
    };
    return [candidate];
  });
}

/** Comparison and recommendation use distinct projections even when they share a source option. */
export function comparisonCandidateAdapter(candidate: RecordLike): RecordLike {
  return { ...candidate, candidate_id: candidate.option_id ?? candidate.id, decision_capability: "comparison" };
}

export function recommendationCandidateAdapter(candidate: RecordLike): RecordLike {
  return { ...candidate, candidate_id: candidate.option_id ?? candidate.id, decision_capability: "recommendation" };
}
