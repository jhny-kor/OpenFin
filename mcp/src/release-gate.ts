import { isVerifiedActive } from "./product-status.ts";

export type ReleaseGateResult = {
  status: "ready" | "blocked";
  recommendation_enabled: boolean;
  reasons: string[];
  domain: string | null;
  item_ready: boolean;
  domain_ready: boolean;
};

type GateInput = { manifest: Record<string, unknown>; checksumVerified?: boolean; domain?: string | null; item?: Record<string, unknown> | null; deploymentCommit?: string; now?: number };
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

function liveReady(value: unknown, policy: unknown, now = Date.now(), deploymentCommit?: string, expectedGenerationId?: string, expectedFixtureChecksum?: string | null): boolean {
  const live = record(value);
  const contract = record(policy);
  const required = typeof contract.required_count === "number" ? contract.required_count : null;
  const mode = typeof contract.required_mode === "string" ? contract.required_mode : null;
  const ttlHours = typeof contract.freshness_ttl_hours === "number" ? contract.freshness_ttl_hours : null;
  if (required === null || mode === null || ttlHours === null) return false;
  const checkedAt = Date.parse(String(live.checked_at ?? ""));
  const age = now - checkedAt;
  return live.status === "current" && (!live.validation_status || live.validation_status === "current") && live.mode === mode && live.test_count === required && live.passed_count === required && live.failed_count === 0 && (live.skipped_count ?? 0) === 0 && Number.isFinite(checkedAt) && age >= 0 && age <= ttlHours * 60 * 60 * 1000 && typeof live.manifest_checksum === "string" && typeof live.loaded_index_checksum === "string" && typeof live.deployment_commit === "string" && live.deployment_commit !== "unknown" && (!deploymentCommit || live.deployment_commit === deploymentCommit) && (!expectedGenerationId || live.generation_id === expectedGenerationId) && (!expectedFixtureChecksum || live.fixture_checksum === expectedFixtureChecksum);
}

function currentItem(item: Record<string, unknown>): boolean {
  const provenance = Array.isArray(item.provenance) ? item.provenance : [];
  const strict = item.decision_critical === true;
  const assertions = Array.isArray(item.field_assertions) ? item.field_assertions : [];
  const assertionCoverage = item.required_field_assertion_coverage;
  if (strict && (item.strict_schema_valid !== true || assertionCoverage !== 1 || item.official_source_assertion_coverage !== 1 || item.unresolved_conflict_count !== 0)) return false;
  const capabilityReady = item.recommendation_approved === true || (record(item.capabilities).recommendation === "public" && item.recommendation_status === "verified_recommendation_candidate");
  const legacyScopeReady = item.recommendation_approved === undefined && item.capabilities === undefined ? item.recommendation_status === "verified_recommendation_candidate" && item.recommendation_scope === "public_recommendation" : true;
  return item.verification_status === "verified" && capabilityReady && legacyScopeReady && item.sales_status === "active" && isVerifiedActive(item.sales_verification_status) && item.freshness_status === "current" && provenance.length > 0 && (!strict || assertions.length > 0) && provenance.every((entry) => {
    const value = record(entry);
    return value.verification_status === "verified" && value.freshness_status === "current" && typeof value.source_id === "string" && typeof value.checksum === "string";
  });
}

export function evaluateReleaseGate({ manifest, checksumVerified = false, domain = null, item = null, deploymentCommit, now = Date.now() }: GateInput): ReleaseGateResult {
  const reasons: string[] = [];
  if (!checksumVerified) reasons.push("MANIFEST_CHECKSUM_MISMATCH");
  if (manifest.platform_release_status !== "ready" && manifest.release_status !== "ready") reasons.push(`RELEASE_STATUS_${String(manifest.platform_release_status ?? manifest.release_status ?? "MISSING").toUpperCase()}`);
  if (!manifest.recommendation_enabled) reasons.push("MANIFEST_RECOMMENDATION_DISABLED");
  if (manifest.recommendation_enabled && manifest.recommendation_state !== "public") reasons.push(`RECOMMENDATION_STATE_${String(manifest.recommendation_state ?? "MISSING").toUpperCase()}`);
  const approval = record(manifest.recommendation_approval_receipt);
  const strictApproval = Boolean(manifest.artifact_contract);
  if (manifest.recommendation_enabled && (!approval.approval_id || approval.mode !== "public" || approval.generation_id !== manifest.generation_id || (strictApproval && (!approval.candidate_set_checksum || !approval.policy_version || !approval.ranking_version || !approval.calculator_version || !approval.quality_suite_checksum || !approval.reviewer || !approval.reviewer_signature || !approval.rollback_generation_id)))) reasons.push("PUBLIC_APPROVAL_RECEIPT_INVALID");
  const artifactContract = record(manifest.artifact_contract);
  if (artifactContract.generation_id && artifactContract.generation_id !== manifest.generation_id) reasons.push("ARTIFACT_GENERATION_MISMATCH");
  if (!liveReady(manifest.openfin_120_live_regression, manifest.live_regression_policy, now, deploymentCommit, typeof manifest.generation_id === "string" ? manifest.generation_id : undefined, typeof artifactContract.fixture_checksum === "string" ? artifactContract.fixture_checksum : null)) reasons.push("LIVE_REGRESSION_NOT_CURRENT");
  const domainState = domain ? record(record(manifest.domain_readiness)[domain]) : {};
  const requiredCount = Number(domainState.required_verified_candidates ?? 0);
  const domainReady = !domain || (domainState.status === "limited_public_ready" && Number(domainState.public_recommendation_candidate_count ?? domainState.public_candidate_count ?? 0) >= requiredCount && (record(manifest.capabilities).recommendation === undefined || record(manifest.capabilities).recommendation === "public"));
  if (domain && !domainReady) reasons.push(`DOMAIN_NOT_READY:${domain}`);
  const itemReady = !item || currentItem(item);
  if (item && !itemReady) reasons.push("ITEM_NOT_READY");
  return { status: reasons.length ? "blocked" : "ready", recommendation_enabled: !reasons.length, reasons: [...new Set(reasons)], domain, item_ready: itemReady, domain_ready: domainReady };
}
