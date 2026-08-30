type JsonRecord = Record<string, unknown>;

export type SourceStatusResolution = {
  statuses: JsonRecord[];
  freshnessStatus: string | null;
  resolution: "resolved" | "unresolved" | "not_required";
  reason?: "SOURCE_STATUS_UNRESOLVED";
};

type TimeInput = string | number | Date;

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

// Search and recommendation responses resolve source freshness for many items
// in one request. Keep a per-artifact lookup so each item does not rescan the
// full source-status array.
const sourceStatusIndexCache = new WeakMap<object, Map<string, JsonRecord>>();

function sourceStatusIndex(value: unknown): Map<string, JsonRecord> | undefined {
  if (!isRecord(value) && !Array.isArray(value)) return undefined;
  const object = value as object;
  const cached = sourceStatusIndexCache.get(object);
  if (cached) return cached;
  const index = new Map<string, JsonRecord>();
  const add = (key: unknown, record: unknown) => {
    if (typeof key === "string" && isRecord(record)) index.set(key, record);
  };
  const addRecord = (record: JsonRecord, fallbackKey?: string) => {
    add(record.id, record);
    add(record.source_id, record);
    add(record.sourceId, record);
    if (fallbackKey) add(fallbackKey, record);
  };
  if (Array.isArray(value)) {
    for (const record of value) if (isRecord(record)) addRecord(record);
  } else {
    if (isRecord(value)) addRecord(value);
    for (const key of ["items", "records", "entries", "sources", "statuses"]) {
      const nested = value[key];
      if (Array.isArray(nested)) {
        for (const record of nested) if (isRecord(record)) addRecord(record);
      } else if (isRecord(nested)) {
        for (const [id, record] of Object.entries(nested)) if (isRecord(record)) addRecord(record, id);
      }
    }
    for (const [id, record] of Object.entries(value)) add(id, record);
  }
  sourceStatusIndexCache.set(object, index);
  return index;
}

export function sourceStatusRecordFor(value: unknown, id: string): JsonRecord | undefined {
  return sourceStatusIndex(value)?.get(id);
}

function normalizeSourceFreshness(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value === "unchanged" || value === "current") return "current";
  return ["changed", "unreachable", "retired", "conflict", "stale"].includes(value) ? value : null;
}

export function sourceIdsForItem(item: { sources?: readonly unknown[]; source_ids?: readonly unknown[] }, provenance: readonly JsonRecord[] = []): string[] {
  return [...new Set([
    ...(item.sources ?? []),
    ...(item.source_ids ?? []),
    ...provenance.map((entry) => entry.source_id).filter((value): value is string => typeof value === "string"),
  ].filter((value): value is string => typeof value === "string"))];
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
  sourceRegistryArtifact?: unknown;
  staticFreshness?: string;
  asOf?: TimeInput;
  as_of?: TimeInput;
  now?: TimeInput;
}): SourceStatusResolution {
  const asOf = parseTime((input.asOf ?? input.as_of ?? input.now ?? Date.now()) as TimeInput);
  const statuses = input.sourceIds.map((sourceId): JsonRecord | undefined => {
    const status = sourceStatusRecordFor(input.sourceStatusArtifact, sourceId);
    if (!status) return undefined;
    const registry = sourceStatusRecordFor(input.sourceRegistryArtifact, sourceId);
    const freshness = runtimeFreshness(status, registry, asOf);
    if (freshness === null) return { ...status, freshness_status: undefined };
    return normalizeSourceFreshness(status.freshness_status ?? status.status) === freshness
      ? status
      : { ...status, freshness_status: freshness };
  }).filter((status): status is JsonRecord => Boolean(status));
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

function parseTime(value: TimeInput): number | null {
  const parsed = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function runtimeFreshness(status: JsonRecord, registry: JsonRecord | undefined, asOf: number | null): string | null {
  const staticStatus = normalizeSourceFreshness(status.freshness_status ?? status.status);
  if (!staticStatus || asOf === null) return null;
  if (staticStatus !== "current") return staticStatus;
  const checkedAt = parseTime((status.last_successful_checked_at ?? status.checked_at) as TimeInput);
  const refresh = isRecord(status.refresh) ? status.refresh : isRecord(registry?.refresh) ? registry.refresh : undefined;
  const slaHours = Number(refresh?.sla_hours ?? status.sla_hours ?? registry?.sla_hours);
  if (checkedAt === null || !Number.isFinite(slaHours) || slaHours <= 0) return null;
  const ageMs = asOf - checkedAt;
  if (ageMs < 0) return null;
  return ageMs > slaHours * 60 * 60 * 1000 ? "stale" : "current";
}
