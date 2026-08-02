import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEvidenceGate } from "../src/decision/evidence-gate.ts";
import { collectComparisonAssertions, collectRecommendationAssertions } from "../src/decision/assertion-profiles.ts";

const offerFields = ["deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status"];
const optionFields = ["term_months", "base_rate_percent", "maximum_rate_percent", "interest_method"];
const assertionId = (field) => `assertion.test.${field}`;
const assertion = (field) => ({ assertion_id: assertionId(field), field, source_id: "source.test", original_url: "https://example.com/offer", observed_at: "2026-07-31T00:00:00Z", valid_to: "2027-07-31T00:00:00Z", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "reviewer.test", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig.test", reviewed_at: "2026-07-31T00:00:00Z", receipt_id: field === "sales_verification_status" ? "receipt.sales.test" : undefined, receipt_checksum: `sha256:${field.padEnd(64, "0").slice(0, 64)}` });
const schemaReceipt = (schema_id, checksum) => ({ schema_id, validator: "ajv", validation_status: "valid", validated_at: "2026-07-31T00:00:00Z", content_checksum: `sha256:${checksum}` });
const sourceRegistry = new Map([["source.test", { authority_class: "provider_official" }]]);
const promotionAssertionIds = () => [...offerFields, ...optionFields].map(assertionId).sort();
const promotion = () => ({ comparison_approved: true, recommendation_approved: false, checksum_verified: true, comparison_profile: "user_fit_comparison", comparison_mode: "user_fit", mode: "shadow", schema_content_checksum: `sha256:${"b".repeat(64)}`, assertion_sets: { comparison: { assertion_ids: promotionAssertionIds() }, recommendation: { assertion_ids: promotionAssertionIds() } }, sales_verification_receipt_id: "receipt.sales.test", reviewer: "reviewer.test", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig.test" });
const offer = () => ({ type: "deposit-offer", sales_verification_status: "verified_active", sales_status: "active", source_listing_status: "listed", deposit_protection_status: "protected", join_channels: ["web"], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{}], schema_validation_receipt: schemaReceipt("types/financial-offer.schema.json", "a".repeat(64)), field_assertions: offerFields.map(assertion), provenance: [{ source_id: "source.test", original_url: "https://example.com/offer", checksum: "sha256:test", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "reviewer.test", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewed_at: "2026-07-31T00:00:00Z", reviewer_signature: "sig.test" }] });
const option = () => ({ option_id: "option.deposit.test.12", term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: "simple", schema_validation_receipt: schemaReceipt("types/offer-option.schema.json", "b".repeat(64)), field_assertions: optionFields.map(assertion), promotion_receipt: promotion() });
const gate = (changedOffer = offer(), changedOption = option(), registry = sourceRegistry) => evaluateEvidenceGate({ offer: changedOffer, option: changedOption, domain: "deposit", asOf: "2026-07-31", sourceRegistry: registry });

test("evidence promotion fails closed on stale, conflicting, or unregistered evidence", () => {
  assert.equal(gate().status, "eligible");
  const stale = offer();
  stale.field_assertions[0] = { ...stale.field_assertions[0], freshness_status: "stale" };
  assert.equal(gate(stale).status, "blocked");
  const conflict = offer();
  conflict.field_assertions[0] = { ...conflict.field_assertions[0], conflict: true };
  assert.equal(gate(conflict).status, "blocked");
  const missingRegistry = gate(offer(), option(), null);
  assert.equal(missingRegistry.status, "blocked");
  assert.ok(missingRegistry.reasons.includes("source_registry_missing"));
});

test("assertion profiles separate market comparison and include offer-level bonus evidence", () => {
  const bonus = assertion("bonus_rate_rules.0.effect");
  const profileOffer = { field_assertions: [assertion("deposit_protection_status"), assertion("join_channels"), assertion("sales_verification_status")], bonus_rate_rules: [{ field_assertions: [bonus] }] };
  const profileOption = { option_id: "option.profile.test", field_assertions: optionFields.map(assertion) };
  const marketIds = collectComparisonAssertions(profileOffer, profileOption, "market_comparison").map(({ assertion: item }) => item.assertion_id);
  const userFitIds = collectComparisonAssertions(profileOffer, profileOption, "user_fit_comparison").map(({ assertion: item }) => item.assertion_id);
  const recommendationIds = collectRecommendationAssertions(profileOffer, profileOption, "market_comparison").map(({ assertion: item }) => item.assertion_id);
  assert.equal(marketIds.includes(bonus.assertion_id), false);
  assert.equal(userFitIds.includes(bonus.assertion_id), true);
  assert.equal(recommendationIds.includes(bonus.assertion_id), true);
});
