import assert from "node:assert/strict";
import { evaluateEligibility } from "../src/recommendation/policy.ts";
import { resolveAttainableRate } from "../src/recommendation/attainable-rate.ts";
import { resolveEarlyTerminationRate } from "../src/calculators/early-termination.ts";
import { evaluateEvidenceGate } from "../src/decision/evidence-gate.ts";
import { candidateSetChecksum, decisionOfferFiles } from "../../scripts/knowledge/common.mjs";

const verified = {
  id: "mutation.deposit", verification_status: "verified", freshness_status: "current", sales_status: "active", sales_verification_status: "verified_active",
  recommendation_status: "verified_recommendation_candidate", recommendation_scope: "public_recommendation", term_months: 12, join_channel: ["web"],
};
assert.equal(evaluateEligibility(verified, { constraints: { term_months: 12, join_channel: "web" } }).eligible, true);
assert.equal(evaluateEligibility(verified, { constraints: { term_months: 24 } }).eligible, false);
const rateItem = { base_rate_percent: 2, maximum_rate_percent: 3, bonus_rate_rules: [{ rule_id: "salary", rule_type: "bonus-rate", predicate: { fact: "can_transfer_salary", operator: "eq", expected: true }, effect: { additional_rate_percent: 1 }, unknown_policy: "not_applied", field_assertions: [{ field: "can_transfer_salary", verification_status: "verified" }] }] };
assert.equal(resolveAttainableRate(rateItem, { can_transfer_salary: false }).rate_percent, 2);
assert.equal(resolveAttainableRate(rateItem, { can_transfer_salary: true }).rate_percent, 3);
assert.equal(resolveEarlyTerminationRate({ early_termination_rules: [{ effect: { rate_schedule: [{ from_elapsed_months: 0, until_elapsed_months: 6, rate_percent: 0.1 }, { from_elapsed_months: 6, until_elapsed_months: 12, rate_percent: 0.5 }] } }] }, 9, 3).rate_percent, 0.5);

const assertion = (field, overrides = {}) => ({ field, source_id: "source.mutation", original_url: "https://example.com/mutation", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "mutation-reviewer", reviewed_at: "2026-07-31T00:00:00Z", reviewer_signature: "sig-mutation", receipt_checksum: `sha256:${field.padEnd(64, "0").slice(0, 64)}`, ...overrides });
const offer = () => ({ type: "deposit-offer", deposit_protection_status: "protected", join_channels: ["web"], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{}], sales_verification_status: "verified_active", sales_status: "active", source_listing_status: "listed", schema_validation_receipt: { validation_status: "valid" }, field_assertions: ["deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status"].map((field) => assertion(field)), provenance: [{ source_id: "source.mutation", checksum: "sha256:source", verification_status: "verified", freshness_status: "current", reviewer: "mutation-reviewer", reviewed_at: "2026-07-31T00:00:00Z", reviewer_signature: "sig-mutation" }] });
const option = () => ({ option_id: "mutation.option.12", term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: "simple", schema_validation_receipt: { validation_status: "valid" }, field_assertions: ["term_months", "base_rate_percent", "maximum_rate_percent", "interest_method"].map((field) => assertion(field)), promotion_receipt: { comparison_approved: true, checksum_verified: true, reviewer: "mutation-reviewer", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig-mutation" } });
const gate = (changedOffer = offer(), changedOption = option(), sourceRegistry) => evaluateEvidenceGate({ offer: changedOffer, option: changedOption, domain: "deposit", asOf: "2026-07-31", sourceRegistry });
assert.equal(gate().status, "eligible");
const stale = offer(); stale.field_assertions[0] = { ...stale.field_assertions[0], freshness_status: "stale" };
const conflict = offer(); conflict.field_assertions[0] = { ...conflict.field_assertions[0], conflict: true };
const noReview = offer(); noReview.provenance = [{ ...noReview.provenance[0], reviewer: null, reviewed_at: null, reviewer_signature: null }];
const noPromotionChecksum = option(); noPromotionChecksum.promotion_receipt = { ...noPromotionChecksum.promotion_receipt, checksum_verified: false };
const invalidSchema = option(); invalidSchema.schema_validation_receipt = { validation_status: "invalid" };
const mutations = {
  verified_to_unverified_blocked: gate(stale).status === "blocked",
  current_to_stale_blocked: gate(stale).status === "blocked",
  conflict_blocked: gate(conflict).status === "blocked",
  review_receipt_removed_blocked: gate(noReview).status === "blocked",
  source_authority_unknown_blocked: gate(offer(), option(), new Map([["source.mutation", { authority_class: "unknown" }]])).status === "blocked",
  promotion_checksum_changed_blocked: gate(offer(), noPromotionChecksum).status === "blocked",
  schema_receipt_invalid_blocked: gate(offer(), invalidSchema).status === "blocked",
  candidate_set_mutation_detected: (() => { const original = decisionOfferFiles(); const changed = structuredClone(original); changed[0].options[0].base_rate_percent = Number(changed[0].options[0].base_rate_percent ?? 0) + 0.01; return candidateSetChecksum(original) !== candidateSetChecksum(changed); })(),
  unknown_bonus_not_applied: resolveAttainableRate(rateItem, {}).rate_percent === 2,
  early_termination_schedule_changed: resolveEarlyTerminationRate({ early_termination_rules: [{ effect: { rate_schedule: [{ from_elapsed_months: 0, until_elapsed_months: 12, rate_percent: 0.1 }] } }] }, 9, 3).rate_percent === 0.1,
};
assert.ok(Object.values(mutations).every(Boolean));
console.log(JSON.stringify({ ok: true, mutations_checked: Object.keys(mutations).length, mutations }));
