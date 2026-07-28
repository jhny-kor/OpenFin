export type ReleaseGateResult = {
  status: "ready" | "blocked";
  recommendation_enabled: boolean;
  reasons: string[];
  domain: string | null;
  item_ready: boolean;
  domain_ready: boolean;
};

type GateInput = {
  manifest: Record<string, unknown>;
  checksumVerified?: boolean;
  domain?: string | null;
  item?: Record<string, unknown> | null;
};

const CURRENT_LIVE_COUNT = 120;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function liveReady(value: unknown): boolean {
  const live = record(value);
  return live.mode === "live"
    && live.test_count === CURRENT_LIVE_COUNT
    && live.passed_count === CURRENT_LIVE_COUNT
    && live.failed_count === 0
    && (live.skipped_count ?? 0) === 0
    && live.status !== "stale"
    && live.status !== "missing";
}

function currentItem(item: Record<string, unknown>): boolean {
  const provenance = Array.isArray(item.provenance) ? item.provenance : [];
  return item.verification_status === "verified"
    && item.recommendation_status === "verified_recommendation_candidate"
    && item.recommendation_scope === "public_recommendation"
    && item.sales_status === "active"
    && item.sales_verification_status === "verified_active"
    && item.freshness_status === "current"
    && provenance.length > 0
    && provenance.every((entry) => {
      const value = record(entry);
      return value.verification_status === "verified" && typeof value.source_id === "string" && typeof value.checksum === "string";
    });
}

export function evaluateReleaseGate({ manifest, checksumVerified = true, domain = null, item = null }: GateInput): ReleaseGateResult {
  const reasons: string[] = [];
  if (!checksumVerified) reasons.push("MANIFEST_CHECKSUM_MISMATCH");
  if (manifest.release_status !== "ready") reasons.push(`RELEASE_STATUS_${String(manifest.release_status ?? "MISSING").toUpperCase()}`);
  if (!manifest.recommendation_enabled) reasons.push("MANIFEST_RECOMMENDATION_DISABLED");
  if (!liveReady(manifest.openfin_120_live_regression)) reasons.push("LIVE_REGRESSION_NOT_CURRENT");

  const domainReadiness = record(manifest.domain_readiness);
  const domainState = domain ? record(domainReadiness[domain]) : {};
  const domainReady = !domain || (domainState.status === "limited_public_ready" && domainState.recommendation !== "blocked");
  if (domain && !domainReady) reasons.push(`DOMAIN_NOT_READY:${domain}`);

  const itemReady = !item || currentItem(item);
  if (item && !itemReady) reasons.push("ITEM_NOT_READY");

  return {
    status: reasons.length ? "blocked" : "ready",
    recommendation_enabled: reasons.length === 0,
    reasons: [...new Set(reasons)],
    domain,
    item_ready: itemReady,
    domain_ready: domainReady,
  };
}
