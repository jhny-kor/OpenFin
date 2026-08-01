import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";
import { evaluatePilotCandidates } from "./pilot-evaluation.ts";
import { PILOT_CONTEXT_SCHEMA } from "./recommend-shadow.ts";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function base64UrlBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function verifyOwnerSessionProof({ secret, domain, asOf, sessionId, proof }: { secret?: string; domain: string; asOf: string; sessionId?: string; proof?: string }): Promise<boolean> {
  if (!secret || !sessionId || !proof) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const payload = `${domain}|${asOf}|${sessionId}|recommendation:owner_pilot`;
    return await crypto.subtle.verify("HMAC", key, base64UrlBytes(proof), new TextEncoder().encode(payload));
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
      context: PILOT_CONTEXT_SCHEMA.extend({ as_of: DATE.optional() }).optional(),
      owner_session_id: z.string().min(1).optional(),
      owner_session_proof: z.string().min(1).optional(),
      limit: z.number().int().min(1).max(20).optional(),
    },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Owner Pilot Recommendation", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ domain, context: requestContext, owner_session_id, owner_session_proof, limit }) => {
    if (!requestContext?.as_of) return mcpResult({ mode: "owner_pilot", status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED"], data_as_of: null, result_count: 0, candidates: [], candidate_data_exposed: false, missing_information: ["as_of"], decision_owner: "user" });
    assertFinanceSafe(requestContext);
    const manifest = await loadFinanceManifest(env);
    const releaseGate = evaluateReleaseGate({ manifest, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT, domain, mode: "owner_pilot" });
    const auth = await verifyOwnerSessionProof({ secret: env.OWNER_PILOT_SESSION_SECRET, domain, asOf: requestContext.as_of, sessionId: owner_session_id, proof: owner_session_proof });
    const reasons = [
      ...(!owner_session_id || !owner_session_proof ? ["OWNER_AUTH_REQUIRED"] : []),
      ...(owner_session_id && owner_session_proof && !auth ? ["OWNER_SESSION_PROOF_INVALID"] : []),
      ...(env.OWNER_PILOT_ENABLED !== "true" ? ["OWNER_PILOT_DISABLED"] : []),
    ];
    if (reasons.length || releaseGate.status !== "ready") return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: [...new Set([...reasons, ...releaseGate.reasons])], data_as_of: requestContext.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, release_gate: releaseGate, decision_owner: "user", limitations: ["owner pilot requires a server-verified signed session, owner permission, approval receipt, and current-generation evidence"] });
    try {
      const items = await loadDetailedItemsForDomain(env, domain, requestContext.as_of);
      const evaluation = evaluatePilotCandidates({
        ctx: { buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, evaluateReleaseGate, manifestChecksumContract },
        items,
        manifest,
        domain,
        mode: "owner_pilot",
        asOf: requestContext.as_of,
        context: requestContext,
        deploymentCommit: env.DEPLOYMENT_COMMIT,
      });
      const candidates = evaluation.candidates.slice(0, limit ?? 5).map((candidate) => {
        const { promotion_receipt: _promotionReceipt, ...safeCandidate } = candidate;
        return safeCandidate;
      });
      return mcpResult({ mode: "owner_pilot", status: candidates.length ? "ready" : "blocked", reason_codes: candidates.length ? [] : ["NO_OWNER_PILOT_CANDIDATE"], data_as_of: requestContext.as_of, result_count: candidates.length, candidate_count: evaluation.eligible_count, evaluated_count: evaluation.evaluated_count, excluded_count: evaluation.excluded_count, candidates, candidate_data_exposed: candidates.length > 0, actual_evaluation: evaluation.actual_evaluation, release_gate: releaseGate, decision_owner: "user", limitations: ["owner-pilot output is limited to the authenticated owner session and the approved candidate set"] });
    } catch (error) {
      return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: ["OWNER_PILOT_EVALUATION_FAILED"], data_as_of: requestContext.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, release_gate: releaseGate, decision_owner: "user", limitations: [error instanceof Error ? error.message : "owner-pilot evaluation failed"] });
    }
  });
}
