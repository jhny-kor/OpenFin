import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleaseGate } from "../src/release-gate.ts";

const readyManifest = {
  release_status: "ready",
  generation_id: "generation",
  recommendation_enabled: true,
  openfin_120_live_regression: { status: "current", mode: "live", checked_at: new Date().toISOString(), manifest_checksum: "manifest", loaded_index_checksum: "index", generation_id: "generation", deployment_commit: "commit", test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 },
  live_regression_policy: { required_count: 120, required_mode: "live", freshness_ttl_hours: 24 },
  domain_readiness: { deposit: { status: "limited_public_ready", recommendation_mode: "public" } },
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
