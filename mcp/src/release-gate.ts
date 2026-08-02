import { isVerifiedActive } from "./product-status.ts";

export type ReleaseMode = "public" | "shadow" | "owner_pilot";

export type ReleaseGateResult = {
  status: "ready" | "blocked";
  mode: ReleaseMode;
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
  deploymentCommit?: string;
  now?: number;
  mode?: ReleaseMode;
};

const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.length > 0;

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

function currentItem(item: Record<string, unknown>, mode: ReleaseMode): boolean {
  const provenance = Array.isArray(item.provenance) ? item.provenance : [];
  const strict = item.decision_critical === true || item.type === "offer-option";
  const assertions = Array.isArray(item.field_assertions) ? item.field_assertions : [];
  const assertionCoverage = item.required_field_assertion_coverage;
  if (strict && (item.strict_schema_valid !== true || assertionCoverage !== 1 || item.official_source_assertion_coverage !== 1 || item.unresolved_conflict_count !== 0)) return false;
  const capabilities = record(item.capabilities);
  const promotion = record(item.promotion_receipt ?? item.candidate_promotion);
  const promotionReady = !strict || (promotion.checksum_verified === true
    && nonEmpty(promotion.reviewer)
    && nonEmpty(promotion.reviewer_role)
    && nonEmpty(promotion.reviewer_permission)
    && nonEmpty(promotion.reviewer_signature)
    && (mode === "public" ? promotion.mode === "public" || promotion.mode === "limited_public" : true));
  const modeReady = mode === "public"
    ? (item.recommendation_approved === true || (capabilities.recommendation === "public" && item.recommendation_status === "verified_recommendation_candidate"))
    : mode === "shadow"
      ? promotion.mode === "shadow" && promotion.comparison_approved === true && item.comparison_approved === true
      : promotion.mode === "owner_pilot" && promotion.recommendation_approved === true && item.recommendation_approved === true;
  const legacyScopeReady = mode !== "public" || (item.recommendation_approved === undefined && item.capabilities === undefined
    ? item.recommendation_status === "verified_recommendation_candidate" && item.recommendation_scope === "public_recommendation"
    : true);
  return item.verification_status === "verified" && modeReady && legacyScopeReady && item.sales_status === "active" && isVerifiedActive(item.sales_verification_status) && item.freshness_status === "current" && provenance.length > 0 && (!strict || (assertions.length > 0 && record(item.evidence_gate).status === "eligible")) && provenance.every((entry) => {
    const value = record(entry);
    return value.verification_status === "verified" && value.freshness_status === "current" && nonEmpty(value.source_id) && nonEmpty(value.checksum);
  }) && promotionReady;
}

function approvalChecksumsMatch(approval: Record<string, unknown>, artifactContract: Record<string, unknown>): boolean {
  return approval.candidate_set_checksum === artifactContract.candidate_set_checksum
    && approval.quality_suite_checksum === artifactContract.quality_suite_transitive_checksum;
}

function publicApprovalReady(manifest: Record<string, unknown>, artifactContract: Record<string, unknown>, now: number): boolean {
  const approval = record(manifest.recommendation_approval_receipt);
  const strictApproval = Boolean(manifest.artifact_contract);
  const approvedAt = Date.parse(String(approval.approved_at ?? ""));
  const expiresAt = Date.parse(String(approval.expires_at ?? ""));
  return nonEmpty(approval.approval_id)
    && approval.mode === "public"
    && approval.generation_id === manifest.generation_id
    && (!strictApproval || (Number.isFinite(approvedAt) && approvedAt <= now
      && Number.isFinite(expiresAt) && expiresAt > now
      && nonEmpty(approval.candidate_set_checksum)
      && nonEmpty(approval.policy_version)
      && nonEmpty(approval.ranking_version)
      && nonEmpty(approval.calculator_version)
      && nonEmpty(approval.quality_suite_checksum)
      && nonEmpty(approval.reviewer)
      && nonEmpty(approval.reviewer_role)
      && nonEmpty(approval.reviewer_permission)
      && nonEmpty(approval.reviewer_signature)
      && approval.reviewer_signature_algorithm === "HMAC-SHA256"
      && nonEmpty(approval.rollback_generation_id)
      && approvalChecksumsMatch(approval, artifactContract)));
}

function ownerPilotApprovalReady(manifest: Record<string, unknown>, domain: string | null, artifactContract: Record<string, unknown>, now: number): boolean {
  const approval = record(manifest.owner_pilot_approval_receipt);
  const expiresAt = Date.parse(String(approval.expires_at ?? ""));
  return nonEmpty(approval.approval_id)
    && approval.mode === "owner_pilot"
    && (!domain || approval.domain === domain)
    && approval.generation_id === manifest.generation_id
    && Number.isFinite(Date.parse(String(approval.approved_at ?? ""))) && Date.parse(String(approval.approved_at)) <= now
    && Number.isFinite(expiresAt) && expiresAt > now
    && nonEmpty(approval.candidate_set_checksum)
    && nonEmpty(approval.policy_version)
    && nonEmpty(approval.ranking_version)
    && nonEmpty(approval.calculator_version)
    && nonEmpty(approval.quality_suite_checksum)
    && nonEmpty(approval.reviewer)
    && nonEmpty(approval.reviewer_role)
    && nonEmpty(approval.reviewer_permission)
    && nonEmpty(approval.reviewer_signature)
    && approval.reviewer_signature_algorithm === "HMAC-SHA256"
    && nonEmpty(approval.rollback_generation_id)
    && approvalChecksumsMatch(approval, artifactContract);
}

export function evaluateReleaseGate({ manifest, checksumVerified = false, domain = null, item = null, deploymentCommit, now = Date.now(), mode = "public" }: GateInput): ReleaseGateResult {
  const reasons: string[] = [];
  const artifactContract = record(manifest.artifact_contract);
  if (!checksumVerified) reasons.push("MANIFEST_CHECKSUM_MISMATCH");
  if (manifest.service_availability !== "available" && manifest.platform_release_status !== "ready" && manifest.release_status !== "ready") reasons.push(`SERVICE_UNAVAILABLE_${String(manifest.service_availability ?? manifest.platform_release_status ?? manifest.release_status ?? "MISSING").toUpperCase()}`);
  if (mode === "public") {
    if (!manifest.recommendation_enabled) reasons.push("MANIFEST_RECOMMENDATION_DISABLED");
    if (manifest.recommendation_enabled && manifest.recommendation_state !== "public") reasons.push(`RECOMMENDATION_STATE_${String(manifest.recommendation_state ?? "MISSING").toUpperCase()}`);
    if (manifest.recommendation_enabled && !publicApprovalReady(manifest, artifactContract, now)) reasons.push("PUBLIC_APPROVAL_RECEIPT_INVALID");
  } else if (mode === "owner_pilot" && !ownerPilotApprovalReady(manifest, domain, artifactContract, now)) {
    reasons.push("OWNER_PILOT_APPROVAL_RECEIPT_INVALID");
  }
  if (artifactContract.generation_id && artifactContract.generation_id !== manifest.generation_id) reasons.push("ARTIFACT_GENERATION_MISMATCH");
  if (!liveReady(manifest._live_regression ?? manifest.openfin_120_live_regression, manifest.live_regression_policy, now, deploymentCommit, typeof manifest.generation_id === "string" ? manifest.generation_id : undefined, typeof artifactContract.fixture_checksum === "string" ? artifactContract.fixture_checksum : null)) reasons.push("LIVE_REGRESSION_NOT_CURRENT");
  const domainState = domain ? record(record(manifest.domain_readiness)[domain]) : {};
  const requiredCount = Number(domainState.required_verified_candidates ?? 0);
  const capabilities = record(manifest.capabilities);
  let domainReady = !domain;
  if (domain) {
    if (mode === "public") {
      const publicCount = Number(domainState.public_recommendation_candidate_count ?? domainState.public_candidate_count ?? 0);
      domainReady = domainState.status === "limited_public_ready" && publicCount >= requiredCount && (capabilities.recommendation === undefined || capabilities.recommendation === "public");
      if (!domainReady) reasons.push(`DOMAIN_NOT_READY:${domain}`);
    } else if (mode === "shadow") {
      const comparisonCount = Number(domainState.comparison_eligible_candidate_count ?? 0);
      const shadowCount = Number(domainState.shadow_recommendation_candidate_count ?? 0);
      domainReady = comparisonCount > 0 && shadowCount > 0;
      if (comparisonCount === 0) reasons.push(`SHADOW_COMPARISON_CANDIDATE_SET_EMPTY:${domain}`);
      if (shadowCount === 0) reasons.push(`SHADOW_CANDIDATE_SET_EMPTY:${domain}`);
    } else {
      const ownerCount = Number(domainState.owner_pilot_candidate_count ?? 0);
      domainReady = ownerCount > 0 && ownerPilotApprovalReady(manifest, domain, artifactContract, now);
      if (ownerCount === 0) reasons.push(`OWNER_PILOT_CANDIDATE_SET_EMPTY:${domain}`);
    }
  }
  const itemReady = !item || currentItem(item, mode);
  if (item && !itemReady) reasons.push("ITEM_NOT_READY");
  return { status: reasons.length ? "blocked" : "ready", mode, recommendation_enabled: reasons.length === 0, reasons: [...new Set(reasons)], domain, item_ready: itemReady, domain_ready: domainReady };
}
