import assert from "node:assert/strict";
import test from "node:test";
import { livenessPayload, readinessPayload } from "../src/health.ts";

test("blocked recommendation does not make healthy core unready", () => {
  assert.equal(livenessPayload({ RUNTIME_VERSION: "v1" }, "https://example.test/manifest").status, "ok");
  const payload = readinessPayload({ env: { RUNTIME_VERSION: "v1" }, metadata: { item_count: 1, export_checksum: "x" }, manifest: { manifest_checksum: "abc123", release_status: "ready", recommendation_enabled: false, blocking_reasons: ["LIVE_REGRESSION_STALE"] }, artifactsLoaded: true, checksumVerified: true, manifestUrl: "https://example.test/manifest" });
  assert.equal(payload.status, "ready");
  assert.equal(payload.ready, true);
  assert.equal(payload.capabilities.recommendation, "blocked");
  assert.equal(payload.capabilities.source_freshness, "degraded");
  assert.equal(payload.manifest_checksum, "abc123");
});

test("health exposes source freshness separately from core availability", () => {
  const payload = livenessPayload({ RUNTIME_VERSION: "v1" }, "https://example.test/manifest", {
    source_freshness_status: "degraded",
  });
  assert.equal(payload.status, "ok");
  assert.equal(payload.source_freshness_status, "degraded");
});
