import assert from "node:assert/strict";
import test from "node:test";
import { livenessPayload, readinessPayload } from "../src/health.ts";

test("health is liveness and readiness reports degraded state", () => {
  assert.equal(livenessPayload({ RUNTIME_VERSION: "v1" }, "https://example.test/manifest").status, "ok");
  const payload = readinessPayload({ env: { RUNTIME_VERSION: "v1" }, manifest: { release_status: "degraded", recommendation_enabled: false, blocking_reasons: ["LIVE_REGRESSION_STALE"] }, artifactsLoaded: true, checksumVerified: true, manifestUrl: "https://example.test/manifest" });
  assert.equal(payload.status, "degraded");
  assert.equal(payload.ready, false);
});
