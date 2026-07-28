type JsonRecord = Record<string, unknown>;

export type SourceStatusResolution = {
  statuses: JsonRecord[];
  freshnessStatus: string | null;
  resolution: "resolved" | "unresolved" | "not_required";
  reason?: "SOURCE_STATUS_UNRESOLVED";
};

const FRESHNESS_SEVERITY: Record<string, number> = {
  conflict: 5,
  retired: 4,
  unreachable: 3,
  changed: 2,
  stale: 1,
  current: 0,
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function artifactRecords(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["items", "records", "entries", "provenance", "sources", "statuses"]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

export function sourceStatusRecordFor(value: unknown, id: string): JsonRecord | undefined {
  if (isRecord(value)) {
    if (value.id === id || value.source_id === id || value.sourceId === id) return value;
    const direct = value[id];
    if (isRecord(direct)) return direct;
    for (const key of ["items", "records", "entries", "sources", "statuses"]) {
      const nested = value[key];
      if (isRecord(nested) && isRecord(nested[id])) return nested[id];
    }
  }
  return artifactRecords(value).find(
    (record) => record.id === id || record.source_id === id || record.sourceId === id,
  );
}

function normalizeSourceFreshness(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value === "unchanged" || value === "current") return "current";
  return ["changed", "unreachable", "retired", "conflict", "stale"].includes(value) ? value : null;
}

function worstFreshness(values: readonly string[]): string | null {
  return values.reduce<string | null>((worst, value) => {
    const normalized = value === "unchanged" ? "current" : value;
    return !worst || (FRESHNESS_SEVERITY[normalized] ?? -1) > (FRESHNESS_SEVERITY[worst] ?? -1)
      ? normalized
      : worst;
  }, null);
}

export function resolveSourceStatus(input: {
  sourceIds: readonly string[];
  sourceUrlCount: number;
  sourceStatusArtifact: unknown;
  staticFreshness?: string;
}): SourceStatusResolution {
  const statuses = input.sourceIds
    .map((sourceId) => sourceStatusRecordFor(input.sourceStatusArtifact, sourceId))
    .filter((status): status is JsonRecord => Boolean(status));
  const resolutionRequired = input.sourceIds.length > 0 || input.sourceUrlCount > 0;
  const statusFreshnesses = statuses
    .map((status) => normalizeSourceFreshness(status.freshness_status ?? status.status))
    .filter((value): value is string => Boolean(value));
  const hasUnresolvedFreshness = statuses.length > statusFreshnesses.length;
  const resolutionFailed = resolutionRequired && (
    !input.sourceStatusArtifact ||
    statuses.length < input.sourceIds.length ||
    hasUnresolvedFreshness ||
    (input.sourceIds.length === 0 && statuses.length === 0)
  );

  return {
    statuses,
    freshnessStatus: resolutionFailed
      ? "unknown"
      : statusFreshnesses.length
        ? worstFreshness(statusFreshnesses)
        : normalizeSourceFreshness(input.staticFreshness),
    resolution: resolutionFailed ? "unresolved" : resolutionRequired ? "resolved" : "not_required",
    reason: resolutionFailed ? "SOURCE_STATUS_UNRESOLVED" : undefined,
  };
}
