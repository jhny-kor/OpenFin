export type HealthEnv = { RUNTIME_VERSION?: string; DEPLOYMENT_COMMIT?: string; FINANCE_MANIFEST_URL?: string };
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const liveCurrent = (live: Record<string, unknown>, policy: Record<string, unknown>, deploymentCommit?: string, now = Date.now()) => {
  const checkedAt = Date.parse(String(live.checked_at ?? ""));
  const age = now - checkedAt;
  const ttlHours = Number(policy.freshness_ttl_hours ?? 24);
  return live.status === "current" && live.mode === (policy.required_mode ?? "live") && live.test_count === (policy.required_count ?? 120) && live.passed_count === (policy.required_count ?? 120) && live.failed_count === 0 && (live.skipped_count ?? 0) === 0 && Number.isFinite(checkedAt) && age >= 0 && age <= ttlHours * 60 * 60 * 1000 && typeof live.manifest_checksum === "string" && typeof live.loaded_index_checksum === "string" && typeof live.deployment_commit === "string" && live.deployment_commit !== "unknown" && (!deploymentCommit || live.deployment_commit === deploymentCommit);
};

export function livenessPayload(env: HealthEnv, manifestUrl: string) { return { name: "finance", status: "ok", runtime_version: env.RUNTIME_VERSION ?? "openfin-mcp-unknown", deployment_commit: env.DEPLOYMENT_COMMIT ?? "unknown", mcp_endpoint: "/mcp", finance_manifest_url: manifestUrl }; }

export function readinessPayload(input: { env: HealthEnv; manifest?: Record<string, unknown>; metadata?: Record<string, unknown>; artifactsLoaded: boolean; checksumVerified: boolean; cacheAgeMs?: number; manifestUrl: string }) {
  const manifest = input.manifest ?? {};
  const live = record(manifest.openfin_120_live_regression);
  const domain = record(manifest.domain_readiness);
  const coreReady = input.artifactsLoaded && input.checksumVerified && Boolean(input.metadata);
  const compare = (name: string) => record(domain[name]).status === "limited_public_ready" ? "limited" : "blocked";
  const capabilities = { core: coreReady ? "ready" : "blocked", search: coreReady ? "ready" : "blocked", fetch: coreReady ? "ready" : "blocked", discover: coreReady ? "ready" : "blocked", compare_deposit: compare("deposit"), compare_saving: compare("saving"), recommendation: manifest.recommendation_enabled && liveCurrent(live, record(manifest.live_regression_policy), input.env.DEPLOYMENT_COMMIT) ? "ready" : "blocked" };
  return { name: "finance", status: coreReady ? "ready" : "degraded", ready: coreReady, capabilities, runtime_version: input.env.RUNTIME_VERSION ?? "openfin-mcp-unknown", deployment_commit: input.env.DEPLOYMENT_COMMIT ?? "unknown", mcp_endpoint: "/mcp", finance_manifest_url: input.manifestUrl, manifest_version: manifest.version ?? null, manifest_checksum: manifest.manifest_checksum ?? null, release_status: manifest.release_status ?? "unknown", recommendation_enabled: manifest.recommendation_enabled ?? false, blocking_reasons: manifest.blocking_reasons ?? ["MANIFEST_UNAVAILABLE"], recommendation_blocking_reasons: manifest.recommendation_blocking_reasons ?? [], live_regression: Object.keys(live).length ? live : null, search_available: Boolean(input.metadata), loaded_index_checksum: input.metadata?.export_checksum ?? null, loaded_item_count: input.metadata?.item_count ?? null, cache_age_ms: input.cacheAgeMs ?? null, artifacts_loaded: input.artifactsLoaded, checksum_verified: input.checksumVerified };
}
