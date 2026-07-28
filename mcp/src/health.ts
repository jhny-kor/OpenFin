export type HealthEnv = {
  RUNTIME_VERSION?: string;
  DEPLOYMENT_COMMIT?: string;
  FINANCE_MANIFEST_URL?: string;
};

export function livenessPayload(env: HealthEnv, manifestUrl: string) {
  return {
    name: "finance",
    status: "ok",
    runtime_version: env.RUNTIME_VERSION ?? "openfin-mcp-unknown",
    deployment_commit: env.DEPLOYMENT_COMMIT ?? "unknown",
    mcp_endpoint: "/mcp",
    finance_manifest_url: manifestUrl,
  };
}

export function readinessPayload(input: {
  env: HealthEnv;
  manifest?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  artifactsLoaded: boolean;
  checksumVerified: boolean;
  cacheAgeMs?: number;
  manifestUrl: string;
}) {
  const manifest = input.manifest ?? {};
  const live = manifest.openfin_120_live_regression as Record<string, unknown> | undefined;
  const liveReady = live?.mode === "live" && live.test_count === 120 && live.passed_count === 120 && live.failed_count === 0 && (live.skipped_count ?? 0) === 0 && live.status !== "stale";
  const ready = manifest.release_status === "ready" && Boolean(manifest.recommendation_enabled) && input.artifactsLoaded && input.checksumVerified && liveReady;
  return {
    name: "finance",
    status: ready ? "ready" : "degraded",
    ready,
    runtime_version: input.env.RUNTIME_VERSION ?? "openfin-mcp-unknown",
    deployment_commit: input.env.DEPLOYMENT_COMMIT ?? "unknown",
    mcp_endpoint: "/mcp",
    finance_manifest_url: input.manifestUrl,
    manifest_version: manifest.version ?? null,
    manifest_checksum: manifest.export_checksum ?? null,
    release_status: manifest.release_status ?? "unknown",
    recommendation_enabled: manifest.recommendation_enabled ?? false,
    blocking_reasons: manifest.blocking_reasons ?? ["MANIFEST_UNAVAILABLE"],
    live_regression: live ?? null,
    search_available: Boolean(input.metadata),
    loaded_index_checksum: input.metadata?.export_checksum ?? null,
    loaded_item_count: input.metadata?.item_count ?? null,
    cache_age_ms: input.cacheAgeMs ?? null,
    artifacts_loaded: input.artifactsLoaded,
    checksum_verified: input.checksumVerified,
  };
}
