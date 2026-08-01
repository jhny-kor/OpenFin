import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEvidenceGate } from "../src/decision/evidence-gate.ts";

const fields = ["deposit_protection_status", "join_channels", "eligibility_rules", "bonus_rate_rules", "early_termination_rules", "sales_verification_status"];
const assertion = (field) => ({ field, source_id: "source.test", original_url: "https://example.com/offer", observed_at: "2026-07-31T00:00:00Z", valid_to: "2027-07-31T00:00:00Z", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "reviewer.test", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig.test", reviewed_at: "2026-07-31T00:00:00Z", receipt_checksum: `sha256:${field.padEnd(64, "0").slice(0, 64)}` });
const schemaReceipt = (schema_id) => ({ schema_id, validator: "ajv", validation_status: "valid", validated_at: "2026-07-31T00:00:00Z", content_checksum: `sha256:${schema_id.padEnd(64, "0").slice(0, 64)}` });
const offer = () => ({ type: "deposit-offer", sales_verification_status: "verified_active", sales_status: "active", source_listing_status: "listed", deposit_protection_status: "protected", join_channels: ["web"], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{}], schema_validation_receipt: schemaReceipt("types/financial-offer.schema.json"), field_assertions: fields.map(assertion), provenance: [{ source_id: "source.test", original_url: "https://example.com/offer", checksum: "sha256:test", verification_status: "verified", freshness_status: "current", conflict: false, reviewer: "reviewer.test", reviewed_at: "2026-07-31T00:00:00Z", reviewer_signature: "sig.test" }] });
const option = () => ({ option_id: "option.deposit.test.12", term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: "simple", schema_validation_receipt: schemaReceipt("types/offer-option.schema.json"), field_assertions: [assertion("term_months"), assertion("base_rate_percent"), assertion("maximum_rate_percent"), assertion("interest_method")], promotion_receipt: { comparison_approved: true, recommendation_approved: false, checksum_verified: true, reviewer: "reviewer.test", reviewer_role: "compliance_reviewer", reviewer_permission: "quality:review", reviewer_signature: "sig.test" } });

test("evidence promotion fails closed on stale or conflicting assertions", () => {
  const current = evaluateEvidenceGate({ offer: offer(), option: option(), domain: "deposit" });
  assert.equal(current.status, "eligible");
  const stale = offer();
  stale.field_assertions[0] = { ...stale.field_assertions[0], freshness_status: "stale" };
  assert.equal(evaluateEvidenceGate({ offer: stale, option: option(), domain: "deposit" }).status, "blocked");
  const conflict = offer();
  conflict.field_assertions[0] = { ...conflict.field_assertions[0], conflict: true };
  assert.equal(evaluateEvidenceGate({ offer: conflict, option: option(), domain: "deposit" }).status, "blocked");
});
