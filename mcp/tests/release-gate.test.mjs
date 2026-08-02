import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleaseGate } from "../src/release-gate.ts";

const readyManifest = {
  service_availability: "available",
  generation_id: "generation",
  recommendation_enabled: true,
  recommendation_state: "public",
  recommendation_approval_receipt: { approval_id: "approval.test", mode: "public", generation_id: "generation" },
  openfin_120_live_regression: { status: "current", mode: "live", checked_at: new Date().toISOString(), manifest_checksum: "manifest", loaded_index_checksum: "index", generation_id: "generation", deployment_commit: "commit", test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 },
  live_regression_policy: { required_count: 120, required_mode: "live", freshness_ttl_hours: 24 },
  domain_readiness: { deposit: { status: "limited_public_ready", recommendation_mode: "public", public_candidate_count: 20, required_verified_candidates: 20 } },
};

test("release gate is data-driven and requires a verified manifest checksum", () => {
  assert.equal(evaluateReleaseGate({ manifest: readyManifest, checksumVerified: true, domain: "deposit", deploymentCommit: "commit" }).status, "ready");
  const blocked = evaluateReleaseGate({ manifest: readyManifest, checksumVerified: false, domain: "deposit" });
  assert.equal(blocked.status, "blocked");
  assert.ok(blocked.reasons.includes("MANIFEST_CHECKSUM_MISMATCH"));
});

test("release gate blocks stale live regression and non-ready domains", () => {
  const result = evaluateReleaseGate({ manifest: { ...readyManifest, openfin_120_live_regression: { ...readyManifest.openfin_120_live_regression, status: "stale" }, domain_readiness: { deposit: { status: "domain_coverage_incomplete" } } }, domain: "deposit" });
  assert.equal(result.status, "blocked");
  assert.ok(result.reasons.includes("LIVE_REGRESSION_NOT_CURRENT"));
  assert.ok(result.reasons.includes("DOMAIN_NOT_READY:deposit"));
});

test("release gate blocks expired and cross-generation live evidence", () => {
  const stale = { ...readyManifest, openfin_120_live_regression: { ...readyManifest.openfin_120_live_regression, checked_at: "2020-01-01T00:00:00Z" } };
  assert.equal(evaluateReleaseGate({ manifest: stale, checksumVerified: true }).status, "blocked");
  assert.equal(evaluateReleaseGate({ manifest: readyManifest, checksumVerified: true, deploymentCommit: "other" }).status, "blocked");
  assert.equal(evaluateReleaseGate({ manifest: { ...readyManifest, openfin_120_live_regression: { ...readyManifest.openfin_120_live_regression, generation_id: "other" } }, checksumVerified: true }).status, "blocked");
});

test("shadow and owner-pilot gates have separate candidate and approval contracts", () => {
  const shadowManifest = {
    ...readyManifest,
    recommendation_enabled: false,
    recommendation_state: "blocked",
    domain_readiness: { deposit: { comparison_eligible_candidate_count: 1, shadow_recommendation_candidate_count: 1 } },
  };
  assert.equal(evaluateReleaseGate({ manifest: shadowManifest, checksumVerified: true, domain: "deposit", mode: "shadow" }).status, "ready");
  const ownerBlocked = evaluateReleaseGate({ manifest: shadowManifest, checksumVerified: true, domain: "deposit", mode: "owner_pilot" });
  assert.equal(ownerBlocked.status, "blocked");
  assert.ok(ownerBlocked.reasons.includes("OWNER_PILOT_APPROVAL_RECEIPT_INVALID"));

  const candidateChecksum = "candidate";
  const qualityChecksum = "quality";
  const ownerManifest = {
    ...shadowManifest,
    artifact_contract: { candidate_set_checksum: candidateChecksum, quality_suite_transitive_checksum: qualityChecksum },
    owner_pilot_approval_receipt: {
      approval_id: "owner-approval.test",
      mode: "owner_pilot",
      domain: "deposit",
      generation_id: "generation",
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      candidate_set_checksum: candidateChecksum,
      quality_suite_checksum: qualityChecksum,
      approved_at: new Date(Date.now() - 60_000).toISOString(),
      policy_version: "policy",
      ranking_version: "ranking",
      calculator_version: "calculator",
      reviewer: "owner",
      reviewer_role: "owner_pilot_reviewer",
      reviewer_permission: "recommendation:owner_pilot",
      reviewer_signature: "signature",
      reviewer_signature_algorithm: "HMAC-SHA256",
      rollback_generation_id: "rollback",
    },
    domain_readiness: { deposit: { owner_pilot_candidate_count: 1 } },
  };
  assert.equal(evaluateReleaseGate({ manifest: ownerManifest, checksumVerified: true, domain: "deposit", mode: "owner_pilot" }).status, "ready");
});
