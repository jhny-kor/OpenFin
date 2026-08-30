import assert from "node:assert/strict";
import test from "node:test";

import { resolveSourceStatus, sourceIdsForItem, sourceStatusRecordFor } from "../src/source-status.ts";

test("source ids combine item, compact-index, and provenance ids without duplicates", () => {
  assert.deepEqual(sourceIdsForItem({
    sources: ["source.a"],
    source_ids: ["source.b", "source.a"],
  }, [{ source_id: "source.c" }, { source_id: "source.b" }]), ["source.a", "source.b", "source.c"]);
});

test("source_id records resolve and aggregate the worst source freshness", () => {
  const artifact = {
    statuses: [
      { source_id: "source.a", freshness_status: "current", checked_at: "2026-08-29T00:00:00Z", refresh: { sla_hours: 168 } },
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

test("runtime freshness uses the registry SLA and effective successful check time", () => {
  const asOf = Date.parse("2026-08-30T00:00:00Z");
  const status = {
    source_id: "source.a",
    freshness_status: "current",
    checked_at: "2026-08-29T00:00:00Z",
    last_successful_checked_at: "2026-08-22T00:00:00Z",
  };
  const result = resolveSourceStatus({
    sourceIds: ["source.a"],
    sourceUrlCount: 1,
    sourceStatusArtifact: { statuses: [status] },
    sourceRegistryArtifact: { sources: [{ id: "source.a", refresh: { sla_hours: 168 } }] },
    asOf,
  });
  assert.equal(result.freshnessStatus, "stale");
  assert.equal(result.statuses[0].freshness_status, "stale");
});

test("SLA boundary is current at SLA minus one second and stale at plus one second", () => {
  const asOf = Date.parse("2026-08-30T00:00:00Z");
  const make = (offsetSeconds) => resolveSourceStatus({
    sourceIds: ["source.a"],
    sourceUrlCount: 1,
    sourceStatusArtifact: { statuses: [{
      source_id: "source.a",
      freshness_status: "current",
      checked_at: new Date(asOf - (168 * 3600 + offsetSeconds) * 1000).toISOString(),
      refresh: { sla_hours: 168 },
    }] },
    asOf,
  });
  assert.equal(make(-1).freshnessStatus, "current");
  assert.equal(make(1).freshnessStatus, "stale");
});

test("future source checks fail closed", () => {
  const asOf = Date.parse("2026-08-30T00:00:00Z");
  const result = resolveSourceStatus({
    sourceIds: ["source.a"],
    sourceUrlCount: 1,
    sourceStatusArtifact: { statuses: [{
      source_id: "source.a",
      freshness_status: "current",
      checked_at: new Date(asOf + 1000).toISOString(),
      refresh: { sla_hours: 168 },
    }] },
    asOf,
  });
  assert.equal(result.freshnessStatus, "unknown");
  assert.equal(result.resolution, "unresolved");
  assert.equal(result.reason, "SOURCE_STATUS_UNRESOLVED");
});

test("missing runtime freshness inputs fail closed", () => {
  const result = resolveSourceStatus({
    sourceIds: ["source.a"],
    sourceUrlCount: 1,
    sourceStatusArtifact: { statuses: [{ source_id: "source.a", freshness_status: "current" }] },
    asOf: "2026-08-30T00:00:00Z",
  });
  assert.equal(result.freshnessStatus, "unknown");
  assert.equal(result.resolution, "unresolved");
});
