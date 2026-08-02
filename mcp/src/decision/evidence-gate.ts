import { collectComparisonAssertions, collectRecommendationAssertions, resolveAssertionProfile, type AssertionProfileName } from "./assertion-profiles.ts";

type RecordLike = Record<string, unknown>;

const record = (value: unknown): RecordLike => value && typeof value === "object" && !Array.isArray(value) ? value as RecordLike : {};
const list = (value: unknown): RecordLike[] => Array.isArray(value) ? value.filter((entry): entry is RecordLike => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
const verified = (value: unknown): boolean => value === "verified";
const current = (value: unknown): boolean => value === "current";
const normalizedChecksum = (value: unknown): string => String(value ?? "").replace(/^sha256:/, "");
const assertionId = (assertion: RecordLike): string | null => typeof assertion.assertion_id === "string" ? assertion.assertion_id : null;

function assertionState(assertions: readonly RecordLike[], asOf?: string) {
  const conflicts = assertions.filter((assertion) => assertion.conflict === true).length;
  const missingReceipt = assertions.filter((assertion) => !assertion.source_id || !assertion.original_url || !assertion.receipt_checksum).length;
  const valid = assertions.filter((assertion) => verified(assertion.verification_status)
    && current(assertion.freshness_status)
    && assertion.conflict !== true
    && (!assertion.valid_to || !asOf || String(assertion.valid_to) >= asOf)
    && assertion.reviewer
    && assertion.reviewer_role
    && assertion.reviewer_permission
    && assertion.reviewer_signature
    && assertion.reviewed_at
    && assertion.receipt_checksum);
  const stale = assertions.filter((assertion) => !current(assertion.freshness_status) || (asOf && assertion.valid_to && String(assertion.valid_to) < asOf)).length;
  return { total: assertions.length, verified: valid.length, conflicts, stale, missingReceipt };
}

const assertionMatches = (assertions: readonly RecordLike[], field: string): RecordLike[] => assertions.filter((assertion) => assertion.field === field || String(assertion.field ?? "").endsWith(`.${field}`));
const ids = (assertions: readonly RecordLike[]): string[] => assertions.map(assertionId).filter((value): value is string => Boolean(value)).sort();
const stringIds = (value: unknown): string[] => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string").sort() : [];
const sameIds = (left: readonly string[], right: readonly string[]) => left.length === right.length && left.every((value, index) => value === right[index]);

export type EvidenceGateInput = {
  offer: RecordLike;
  option: RecordLike;
  domain: "deposit" | "saving";
  asOf?: string;
  sourceRegistry?: RecordLike | Map<string, RecordLike>;
  profile?: AssertionProfileName;
};

export function evaluateEvidenceGate({ offer, option, domain, asOf, sourceRegistry, profile: requestedProfile }: EvidenceGateInput) {
  const promotion = record(option.promotion_receipt ?? offer.promotion_receipt);
  const assertionProfile = resolveAssertionProfile({ profile: requestedProfile ?? promotion.comparison_profile, comparison_mode: promotion.comparison_mode, mode: promotion.mode });
  const comparisonAssertions = collectComparisonAssertions(offer, option, assertionProfile.name).map((entry) => entry.assertion);
  const recommendationAssertions = collectRecommendationAssertions(offer, option, assertionProfile.name).map((entry) => entry.assertion);
  const profileBindingValid = promotion.comparison_mode === undefined || promotion.comparison_mode === assertionProfile.comparison_mode;
  const offerAssertions = list(offer.field_assertions);
  const state = assertionState(comparisonAssertions, asOf);
  const recommendationState = assertionState(recommendationAssertions, asOf);
  const provenance = list(offer.provenance);
  const sourceReceiptCount = provenance.filter((entry) => typeof entry.source_id === "string"
    && typeof entry.checksum === "string"
    && verified(entry.verification_status)
    && current(entry.freshness_status)
    && entry.conflict !== true
    && entry.reviewer
    && entry.reviewer_role
    && entry.reviewer_permission
    && entry.reviewed_at
    && entry.reviewer_signature).length;
  const requiredFields = [
    "deposit_protection_status", "join_channels", "sales_verification_status",
    "term_months", "base_rate_percent", "maximum_rate_percent", "interest_method",
    ...(domain === "saving" ? ["saving_method"] : []),
  ];
  const presentFields = requiredFields.filter((field) => (offer[field] !== undefined && offer[field] !== null) || (option[field] !== undefined && option[field] !== null));
  const promotionPresent = Object.keys(promotion).length > 0;
  const schemaReceipt = record(option.schema_validation_receipt ?? offer.schema_validation_receipt);
  const schemaContentChecksumPresent = /^([a-f0-9]{64})$/.test(normalizedChecksum(schemaReceipt.content_checksum));
  const strictSchemaValid = presentFields.length === requiredFields.length
    && typeof option.option_id === "string"
    && schemaReceipt.validation_status === "valid"
    && schemaContentChecksumPresent
    && normalizedChecksum(promotion.schema_content_checksum) === normalizedChecksum(schemaReceipt.content_checksum);
  const requiredAssertionCoverage = requiredFields.length ? requiredFields.filter((field) => assertionMatches(comparisonAssertions, field).some((entry) => verified(entry.verification_status) && current(entry.freshness_status) && entry.conflict !== true)).length / requiredFields.length : 0;
  const registryLoaded = sourceRegistry instanceof Map || (sourceRegistry !== undefined && sourceRegistry !== null && typeof sourceRegistry === "object" && !Array.isArray(sourceRegistry));
  const registryEntry = (id: unknown): RecordLike | undefined => {
    if (!registryLoaded || typeof id !== "string") return undefined;
    if (sourceRegistry instanceof Map) return sourceRegistry.get(id);
    const value = record(sourceRegistry)[id];
    return value && typeof value === "object" && !Array.isArray(value) ? value as RecordLike : undefined;
  };
  const officialAuthorities = ["association_official", "government_official", "law_official", "provider_official", "regulator_official"];
  const officialSourceAssertionCoverage = comparisonAssertions.length && registryLoaded ? comparisonAssertions.filter((entry) => typeof entry.source_id === "string"
    && typeof entry.original_url === "string"
    && officialAuthorities.includes(String(registryEntry(entry.source_id)?.authority_class))).length / comparisonAssertions.length : 0;
  const recommendationOfficialSourceAssertionCoverage = recommendationAssertions.length && registryLoaded ? recommendationAssertions.filter((entry) => typeof entry.source_id === "string"
    && typeof entry.original_url === "string"
    && officialAuthorities.includes(String(registryEntry(entry.source_id)?.authority_class))).length / recommendationAssertions.length : 0;
  const salesActive = offer.sales_verification_status === "verified_active" && offer.sales_status !== "inactive";
  const salesAssertion = comparisonAssertions.find((entry) => entry.field === "sales_verification_status");
  const salesReceiptLinked = typeof promotion.sales_verification_receipt_id === "string"
    && promotion.sales_verification_receipt_id.length > 0
    && typeof salesAssertion?.receipt_id === "string"
    && salesAssertion.receipt_id === promotion.sales_verification_receipt_id;
  const protectionReview = domain !== "deposit" || (offer.deposit_protection_status === "protected" && offerAssertions.some((entry) => entry.field === "deposit_protection_status" && verified(entry.verification_status)));
  const comparisonAssertionIds = ids(comparisonAssertions);
  const recommendationAssertionIds = ids(recommendationAssertions);
  const assertionSets = record(promotion.assertion_sets);
  const promotionComparisonIds = stringIds(record(assertionSets.comparison).assertion_ids);
  const promotionRecommendationIds = stringIds(record(assertionSets.recommendation).assertion_ids);
  const assertionSetsMatch = sameIds(comparisonAssertionIds, promotionComparisonIds) && sameIds(recommendationAssertionIds, promotionRecommendationIds);
  const comparisonEvidenceReady = strictSchemaValid
    && profileBindingValid
    && salesActive
    && protectionReview
    && sourceReceiptCount > 0
    && comparisonAssertions.length >= requiredFields.length
    && state.verified === comparisonAssertions.length
    && state.conflicts === 0
    && state.stale === 0
    && state.missingReceipt === 0
    && officialSourceAssertionCoverage === 1;
  const recommendationEvidenceReady = recommendationAssertions.length > 0
    && recommendationState.verified === recommendationAssertions.length
    && recommendationState.conflicts === 0
    && recommendationState.stale === 0
    && recommendationState.missingReceipt === 0
    && recommendationOfficialSourceAssertionCoverage === 1;
  const comparisonApprovedWithPromotion = comparisonEvidenceReady
    && promotionPresent
    && promotion.checksum_verified === true
    && promotion.comparison_approved === true
    && assertionSetsMatch
    && salesReceiptLinked;
  const recommendationApproved = comparisonApprovedWithPromotion && recommendationEvidenceReady && promotion.recommendation_approved === true;
  const verificationStatus = comparisonApprovedWithPromotion ? "verified" : "unverified";
  const freshnessStatus = state.stale > 0 ? "stale" : comparisonAssertions.length && state.verified === comparisonAssertions.length ? "current" : "unknown";
  const reasons = [
    ...(!strictSchemaValid ? ["strict_schema_invalid"] : []),
    ...(!salesActive ? ["sales_not_verified"] : []),
    ...(!protectionReview ? ["protection_unverified"] : []),
    ...(sourceReceiptCount === 0 ? ["source_receipt_missing"] : []),
    ...(state.verified !== comparisonAssertions.length ? ["required_assertions_unverified"] : []),
    ...(state.conflicts ? ["assertion_conflict"] : []),
    ...(state.stale ? ["assertion_stale"] : []),
    ...(state.missingReceipt ? ["assertion_receipt_missing"] : []),
    ...(!registryLoaded ? ["source_registry_missing"] : []),
    ...(officialSourceAssertionCoverage === 1 ? [] : ["official_source_authority_unverified"]),
    ...(!promotionPresent ? ["candidate_promotion_missing"] : []),
    ...(promotionPresent && promotion.comparison_approved !== true ? ["candidate_promotion_not_approved"] : []),
    ...(promotionPresent && promotion.checksum_verified !== true ? ["candidate_promotion_checksum_unverified"] : []),
    ...(!profileBindingValid ? ["assertion_profile_mode_mismatch"] : []),
    ...(promotionPresent && !assertionSetsMatch ? ["assertion_set_mismatch"] : []),
    ...(promotionPresent && !salesReceiptLinked ? ["sales_verification_receipt_unlinked"] : []),
  ];
  return {
    status: comparisonApprovedWithPromotion ? "eligible" : "blocked",
    verification_status: comparisonApprovedWithPromotion ? "verified" : verificationStatus,
    freshness_status: freshnessStatus,
    sales_status: salesActive ? "active" : "unknown",
    sales_verification_status: offer.sales_verification_status ?? "unknown",
    source_listing_status: offer.source_listing_status ?? "unknown",
    strict_schema_valid: strictSchemaValid,
    required_field_assertion_coverage: Math.min(1, requiredAssertionCoverage),
    official_source_assertion_coverage: Math.min(1, officialSourceAssertionCoverage),
    unresolved_conflict_count: state.conflicts,
    source_receipt_count: sourceReceiptCount,
    comparison_engine_gate_passed: comparisonApprovedWithPromotion,
    comparison_approved: comparisonApprovedWithPromotion,
    recommendation_approved: recommendationApproved,
    reasons: [...new Set(reasons)],
    assertion_profile: assertionProfile.name,
    comparison_mode: assertionProfile.comparison_mode,
    assertion_count: comparisonAssertions.length,
    recommendation_assertion_count: recommendationAssertions.length,
    verified_assertion_count: state.verified,
  };
}
