type RecordLike = Record<string, unknown>;

const record = (value: unknown): RecordLike => value && typeof value === "object" && !Array.isArray(value) ? value as RecordLike : {};
const list = (value: unknown): RecordLike[] => Array.isArray(value) ? value.filter((entry): entry is RecordLike => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
const verified = (value: unknown): boolean => value === "verified";
const current = (value: unknown): boolean => value === "current";

function assertionState(assertions: readonly RecordLike[], asOf?: string) {
  const conflicts = assertions.filter((assertion) => assertion.conflict === true).length;
  const missingReceipt = assertions.filter((assertion) => !assertion.source_id || !assertion.original_url || !assertion.receipt_checksum).length;
  const valid = assertions.filter((assertion) => verified(assertion.verification_status) && current(assertion.freshness_status) && assertion.conflict !== true && (!assertion.valid_to || !asOf || String(assertion.valid_to) >= asOf) && assertion.reviewer && assertion.reviewed_at && assertion.receipt_checksum);
  const stale = assertions.filter((assertion) => !current(assertion.freshness_status) || (asOf && assertion.valid_to && String(assertion.valid_to) < asOf)).length;
  return { total: assertions.length, verified: valid.length, conflicts, stale, missingReceipt };
}

const assertionMatches = (assertions: readonly RecordLike[], field: string): RecordLike[] => assertions.filter((assertion) => assertion.field === field || String(assertion.field ?? "").endsWith(`.${field}`));

export type EvidenceGateInput = {
  offer: RecordLike;
  option: RecordLike;
  domain: "deposit" | "saving";
  asOf?: string;
  sourceRegistry?: RecordLike | Map<string, RecordLike>;
};

export function evaluateEvidenceGate({ offer, option, domain, asOf, sourceRegistry }: EvidenceGateInput) {
  const offerAssertions = list(offer.field_assertions);
  const optionAssertions = list(option.field_assertions);
  const assertions = [...offerAssertions, ...optionAssertions];
  const state = assertionState(assertions, asOf);
  const provenance = list(offer.provenance);
  const sourceReceiptCount = provenance.filter((entry) => typeof entry.source_id === "string" && typeof entry.checksum === "string" && verified(entry.verification_status) && current(entry.freshness_status) && entry.conflict !== true && entry.reviewer && entry.reviewed_at && entry.reviewer_signature).length;
  const requiredFields = [
    "deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status",
    "term_months", "base_rate_percent", "maximum_rate_percent", "interest_method",
    ...(domain === "saving" ? ["saving_method"] : []),
  ];
  const presentFields = requiredFields.filter((field) => offer[field] !== undefined && offer[field] !== null || option[field] !== undefined && option[field] !== null);
  const strictSchemaValid = presentFields.length === requiredFields.length && typeof option.option_id === "string" && record(option.schema_validation_receipt ?? offer.schema_validation_receipt).validation_status === "valid";
  const requiredAssertionCoverage = requiredFields.length ? requiredFields.filter((field) => assertionMatches(assertions, field).some((entry) => verified(entry.verification_status) && current(entry.freshness_status) && entry.conflict !== true)).length / requiredFields.length : 0;
  const registryEntry = (id: unknown): RecordLike | undefined => {
    if (sourceRegistry instanceof Map) return sourceRegistry.get(String(id));
    if (!sourceRegistry) return undefined;
    const value = record(sourceRegistry)[String(id)];
    return value && typeof value === "object" && !Array.isArray(value) ? value as RecordLike : undefined;
  };
  const officialSourceAssertionCoverage = assertions.length ? assertions.filter((entry) => {
    const registered = registryEntry(entry.source_id);
    return typeof entry.source_id === "string" && typeof entry.original_url === "string" && (!sourceRegistry || ["association_official", "government_official", "law_official", "provider_official", "regulator_official"].includes(String(registered?.authority_class)));
  }).length / assertions.length : 0;
  const salesActive = offer.sales_verification_status === "verified_active" && offer.sales_status !== "inactive";
  const protectionReview = domain !== "deposit" || (offer.deposit_protection_status === "protected" && offerAssertions.some((entry) => entry.field === "deposit_protection_status" && verified(entry.verification_status)));
  const comparisonApproved = strictSchemaValid && salesActive && protectionReview && sourceReceiptCount > 0 && assertions.length >= requiredFields.length && state.verified === assertions.length && state.conflicts === 0 && state.stale === 0 && state.missingReceipt === 0 && officialSourceAssertionCoverage === 1;
  const promotion = record(option.promotion_receipt ?? offer.promotion_receipt);
  const promotionPresent = Object.keys(promotion).length > 0;
  const comparisonApprovedWithPromotion = comparisonApproved && promotionPresent && promotion.checksum_verified === true && promotion.comparison_approved === true;
  const recommendationApproved = comparisonApprovedWithPromotion && promotion.recommendation_approved === true;
  const verificationStatus = comparisonApprovedWithPromotion ? "verified" : "unverified";
  const freshnessStatus = state.stale > 0 ? "stale" : assertions.length && state.verified === assertions.length ? "current" : "unknown";
  const reasons = [
    ...(!strictSchemaValid ? ["strict_schema_invalid"] : []),
    ...(!salesActive ? ["sales_not_verified"] : []),
    ...(!protectionReview ? ["protection_unverified"] : []),
    ...(sourceReceiptCount === 0 ? ["source_receipt_missing"] : []),
    ...(state.verified !== assertions.length ? ["required_assertions_unverified"] : []),
    ...(state.conflicts ? ["assertion_conflict"] : []),
    ...(state.stale ? ["assertion_stale"] : []),
    ...(state.missingReceipt ? ["assertion_receipt_missing"] : []),
    ...(strictSchemaValid ? [] : ["schema_validation_receipt_missing"]),
    ...(officialSourceAssertionCoverage === 1 ? [] : ["official_source_authority_unverified"]),
    ...(!promotionPresent ? ["candidate_promotion_missing"] : []),
    ...(promotionPresent && promotion.comparison_approved !== true ? ["candidate_promotion_not_approved"] : []),
    ...(promotionPresent && promotion.checksum_verified !== true ? ["candidate_promotion_checksum_unverified"] : []),
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
    assertion_count: assertions.length,
    verified_assertion_count: state.verified,
  };
}
