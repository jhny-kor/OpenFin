import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";
import { evaluatePilotCandidates } from "./pilot-evaluation.ts";
import { PILOT_CONTEXT_SCHEMA } from "./recommend-shadow.ts";
import { normalizeRecommendationContext } from "../recommendation/context.ts";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const OWNER_AUDIENCE = "openfin-owner-pilot";
const OWNER_PERMISSION = "recommendation:owner_pilot";
const MAX_TOKEN_LIFETIME_SECONDS = 15 * 60;
const usedJti = new Map<string, number>();

function base64UrlBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64Url(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeJson(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlBytes(value)));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function stableJson(value: Record<string, unknown>): string {
  return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]])));
}

function pruneReplay(now: number): void {
  for (const [jti, expiresAt] of usedJti) if (expiresAt <= now) usedJti.delete(jti);
  // ponytail: bounded per-isolate replay cache; use a durable account-scoped cache when owner pilot is enabled at scale.
  while (usedJti.size > 4096) usedJti.delete(usedJti.keys().next().value as string);
}

export function ownerSessionTokenPayload({ domain, asOf, sessionId, generationId, candidateSetChecksum, issuedAt, expiresAt, jti }: { domain: string; asOf: string; sessionId: string; generationId: string; candidateSetChecksum: string; issuedAt: number; expiresAt: number; jti: string }): Record<string, unknown> {
  return { sub: sessionId, aud: OWNER_AUDIENCE, iat: issuedAt, exp: expiresAt, jti, domain, as_of: asOf, generation_id: generationId, candidate_set_checksum: candidateSetChecksum, permission: OWNER_PERMISSION };
}

export async function verifyOwnerSessionProof({ secret, domain, asOf, sessionId, proof, generationId, candidateSetChecksum, now = Math.floor(Date.now() / 1000) }: { secret?: string; domain: string; asOf: string; sessionId?: string; proof?: string; generationId?: string; candidateSetChecksum?: string; now?: number }): Promise<boolean> {
  if (!secret || !sessionId || !proof || !generationId || !candidateSetChecksum) return false;
  try {
    const segments = proof.split(".");
    if (segments.length !== 3) return false;
    const [encodedHeader, encodedPayload, encodedSignature] = segments;
    const header = decodeJson(encodedHeader);
    const claims = decodeJson(encodedPayload);
    if (header?.alg !== "HS256" || header.typ !== "OPENFIN_OWNER_PILOT" || !claims) return false;
    if (claims.sub !== sessionId || claims.aud !== OWNER_AUDIENCE || claims.domain !== domain || claims.as_of !== asOf || claims.generation_id !== generationId || claims.candidate_set_checksum !== candidateSetChecksum || claims.permission !== OWNER_PERMISSION) return false;
    const issuedAt = typeof claims.iat === "number" ? claims.iat : NaN;
    const expiresAt = typeof claims.exp === "number" ? claims.exp : NaN;
    const jti = typeof claims.jti === "string" ? claims.jti : "";
    if (!Number.isInteger(issuedAt) || !Number.isInteger(expiresAt) || !jti || issuedAt > now || expiresAt <= now || expiresAt <= issuedAt || expiresAt - issuedAt > MAX_TOKEN_LIFETIME_SECONDS) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlBytes(encodedSignature), new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
    if (!valid) return false;
    pruneReplay(now);
    if (usedJti.has(jti)) return false;
    usedJti.set(jti, expiresAt);
    return true;
  } catch {
    return false;
  }
}

export async function verifyRecommendationApprovalSignature({ secret, receipt }: { secret?: string; receipt?: Record<string, unknown> | null }): Promise<boolean> {
  if (!secret || !receipt || receipt.reviewer_signature_algorithm !== "HMAC-SHA256") return false;
  const signature = typeof receipt.reviewer_signature === "string" ? receipt.reviewer_signature : "";
  if (!signature.startsWith("hmac-sha256:")) return false;
  const signed = Object.fromEntries(["approval_id", "domain", "mode", "generation_id", "candidate_set_checksum", "policy_version", "ranking_version", "calculator_version", "quality_suite_checksum", "approved_at", "expires_at", "reviewer", "reviewer_role", "reviewer_permission", "rollback_generation_id"].map((key) => [key, receipt[key]]));
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("HMAC", key, base64UrlBytes(signature.slice("hmac-sha256:".length)), new TextEncoder().encode(stableJson(signed)));
  } catch {
    return false;
  }
}

export function registerRecommendOwnerPilotTool(ctx: ToolContext): void {
  const { server, env, mcpResult, assertFinanceSafe, loadFinanceManifest, loadDetailedItemsForDomain, evaluateReleaseGate, manifestChecksumContract, buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool("recommend_owner_pilot", {
    title: "Owner Pilot Recommendation",
    description: "Owner-authenticated pilot boundary for recommendations. The server verifies a signed owner session and a separate owner-pilot approval receipt before exposing candidate identities or financial outcomes.",
    inputSchema: {
      domain: z.enum(["deposit", "saving"]),
      context: PILOT_CONTEXT_SCHEMA.extend({ as_of: DATE }).optional(),
      owner_session_id: z.string().min(1).optional(),
      owner_session_proof: z.string().min(1).optional(),
      limit: z.number().int().min(1).max(20).optional(),
    },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Owner Pilot Recommendation", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ domain, context: requestContext, owner_session_id, owner_session_proof, limit }) => {
    const normalizedContext = normalizeRecommendationContext(requestContext ?? {}, domain);
    if (!normalizedContext.as_of) return mcpResult({ mode: "owner_pilot", status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED"], data_as_of: null, result_count: 0, candidates: [], candidate_data_exposed: false, missing_information: ["as_of"], decision_owner: "user" });
    assertFinanceSafe(normalizedContext);
    const manifest = await loadFinanceManifest(env);
    const releaseGate = evaluateReleaseGate({ manifest, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT, domain, mode: "owner_pilot" });
    const artifactContract = manifest.artifact_contract && typeof manifest.artifact_contract === "object" && !Array.isArray(manifest.artifact_contract) ? manifest.artifact_contract as Record<string, unknown> : {};
    const approval = manifest.owner_pilot_approval_receipt ?? null;
    const approvalSignatureValid = await verifyRecommendationApprovalSignature({ secret: env.OWNER_PILOT_REVIEWER_SIGNATURE_SECRET, receipt: approval });
    const auth = await verifyOwnerSessionProof({ secret: env.OWNER_PILOT_SESSION_SECRET, domain, asOf: normalizedContext.as_of, sessionId: owner_session_id, proof: owner_session_proof, generationId: typeof manifest.generation_id === "string" ? manifest.generation_id : undefined, candidateSetChecksum: typeof artifactContract.candidate_set_checksum === "string" ? artifactContract.candidate_set_checksum : undefined });
    const reasons = [
      ...(!owner_session_id || !owner_session_proof ? ["OWNER_AUTH_REQUIRED"] : []),
      ...(owner_session_id && owner_session_proof && !auth ? ["OWNER_SESSION_PROOF_INVALID"] : []),
      ...(!approvalSignatureValid ? ["OWNER_APPROVAL_SIGNATURE_INVALID"] : []),
      ...(env.OWNER_PILOT_ENABLED !== "true" ? ["OWNER_PILOT_DISABLED"] : []),
    ];
    if (reasons.length || releaseGate.status !== "ready") return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: [...new Set([...reasons, ...releaseGate.reasons])], data_as_of: normalizedContext.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, release_gate: releaseGate, decision_owner: "user", limitations: ["owner pilot requires a server-verified signed session, owner permission, approval receipt, and current-generation evidence"] });
    try {
      const items = await loadDetailedItemsForDomain(env, domain, normalizedContext.as_of);
      const evaluation = evaluatePilotCandidates({
        ctx: { buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, evaluateReleaseGate, manifestChecksumContract },
        items,
        manifest,
        domain,
        mode: "owner_pilot",
        asOf: normalizedContext.as_of,
        context: normalizedContext,
        deploymentCommit: env.DEPLOYMENT_COMMIT,
      });
      const candidates = evaluation.candidates.slice(0, limit ?? 5).map((candidate) => {
        const { promotion_receipt: _promotionReceipt, ...safeCandidate } = candidate;
        return safeCandidate;
      });
      return mcpResult({ mode: "owner_pilot", status: candidates.length ? "ready" : "blocked", reason_codes: candidates.length ? [] : ["NO_OWNER_PILOT_CANDIDATE"], data_as_of: normalizedContext.as_of, result_count: candidates.length, candidate_count: evaluation.eligible_count, evaluated_count: evaluation.evaluated_count, excluded_count: evaluation.excluded_count, candidates, candidate_data_exposed: candidates.length > 0, actual_evaluation: evaluation.actual_evaluation, release_gate: releaseGate, decision_owner: "user", limitations: ["owner-pilot output is limited to the authenticated owner session and the approved candidate set"] });
    } catch (error) {
      return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: ["OWNER_PILOT_EVALUATION_FAILED"], data_as_of: normalizedContext.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, release_gate: releaseGate, decision_owner: "user", limitations: [error instanceof Error ? error.message : "owner-pilot evaluation failed"] });
    }
  });
}
