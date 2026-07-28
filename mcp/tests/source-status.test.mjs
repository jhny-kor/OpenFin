import assert from "node:assert/strict";
import test from "node:test";

import { resolveSourceStatus, sourceStatusRecordFor } from "../src/source-status.ts";

test("source_id records resolve and aggregate the worst source freshness", () => {
  const artifact = {
    statuses: [
      { source_id: "source.a", freshness_status: "current" },
      { source_id: "source.b", freshness_status: "stale" },
    ],
  };

  assert.equal(sourceStatusRecordFor(artifact, "source.a")?.source_id, "source.a");
  assert.deepEqual(resolveSourceStatus({
    sourceIds: ["source.a", "source.b"],
    sourceUrlCount: 2,
    sourceStatusArtifact: artifact,
    staticFreshness: "current",
  }), {
    statuses: artifact.statuses,
    freshnessStatus: "stale",
    resolution: "resolved",
    reason: undefined,
  });
});

test("missing source-status artifact fails closed even when static freshness is current", () => {
  const result = resolveSourceStatus({
    sourceIds: ["source.a"],
    sourceUrlCount: 1,
    sourceStatusArtifact: undefined,
    staticFreshness: "current",
  });

  assert.equal(result.freshnessStatus, "unknown");
  assert.equal(result.resolution, "unresolved");
  assert.equal(result.reason, "SOURCE_STATUS_UNRESOLVED");
});

test("partial source-status artifacts fail closed", () => {
  const result = resolveSourceStatus({
    sourceIds: ["source.a", "source.b"],
    sourceUrlCount: 2,
    sourceStatusArtifact: { statuses: [{ source_id: "source.a", freshness_status: "current" }] },
    staticFreshness: "current",
  });

  assert.equal(result.statuses.length, 1);
  assert.equal(result.freshnessStatus, "unknown");
  assert.equal(result.resolution, "unresolved");
});

test("status records without a recognized freshness value fail closed", () => {
  for (const status of [{ source_id: "source.a" }, { source_id: "source.a", status: "unexpected" }]) {
    const result = resolveSourceStatus({
      sourceIds: ["source.a"],
      sourceUrlCount: 1,
      sourceStatusArtifact: { statuses: [status] },
      staticFreshness: "current",
    });

    assert.equal(result.freshnessStatus, "unknown");
    assert.equal(result.resolution, "unresolved");
    assert.equal(result.reason, "SOURCE_STATUS_UNRESOLVED");
  }
});
