import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { livenessPayload, readinessPayload } from "../src/health.ts";

const workerSource = fs.readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");

test("blocked recommendation does not make healthy core unready", () => {
  assert.equal(livenessPayload({ RUNTIME_VERSION: "v1" }, "https://example.test/manifest").status, "ok");
  const payload = readinessPayload({ env: { RUNTIME_VERSION: "v1", ARTIFACT_GENERATION: "generation" }, metadata: { item_count: 1, export_checksum: "x" }, manifest: { manifest_checksum: "abc123", generation_id: "generation", current_release: { path: "opentax/current-release.json" }, release_status: "ready", recommendation_enabled: false, blocking_reasons: ["LIVE_REGRESSION_STALE"] }, artifactsLoaded: true, checksumVerified: true, manifestUrl: "https://example.test/manifest" });
  assert.equal(payload.status, "ready");
  assert.equal(payload.ready, true);
  assert.equal(payload.capabilities.recommendation, "blocked");
  assert.equal(payload.capabilities.source_freshness, "blocked");
  assert.equal(payload.manifest_checksum, "abc123");
  assert.equal(payload.production_generation, "generation");
  assert.equal(payload.worker_generation, "generation");
  assert.equal(payload.release_pointer.path, "opentax/current-release.json");
});

test("health exposes source freshness separately from core availability", () => {
  const payload = livenessPayload({ RUNTIME_VERSION: "v1" }, "https://example.test/manifest", {
    source_freshness_status: "degraded",
  });
  assert.equal(payload.status, "ok");
  assert.equal(payload.source_freshness_status, "degraded");
});

test("service availability never becomes a capability status", () => {
  const payload = readinessPayload({ env: {}, metadata: { item_count: 1, export_checksum: "x" }, manifest: { service_availability: "available", capabilities: { search: "ready", comparison: "limited" } }, artifactsLoaded: true, checksumVerified: true, manifestUrl: "https://example.test/manifest" });
  assert.equal(payload.service_availability, "available");
  assert.equal(payload.capabilities.search, "ready");
  assert.equal(payload.capabilities.compare_deposit, "blocked");
  assert.notEqual(payload.capabilities.search, payload.service_availability);
});

test("sharded readiness metadata returns before downloading the compatibility root", () => {
  const shardedBranch = workerSource.indexOf("if (manifest.search_index.shards?.length)");
  const branchReturn = workerSource.indexOf("return data;", shardedBranch);
  const rootDownload = workerSource.indexOf("const indexUrl = resolveExportUrl", shardedBranch);
  assert.ok(shardedBranch >= 0 && branchReturn > shardedBranch && rootDownload > branchReturn);
});
