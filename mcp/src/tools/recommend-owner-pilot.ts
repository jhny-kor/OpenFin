import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function registerRecommendOwnerPilotTool(ctx: ToolContext): void {
  const { server, env, mcpResult, loadFinanceManifest, evaluateReleaseGate, manifestChecksumContract, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool("recommend_owner_pilot", {
    title: "Owner Pilot Recommendation",
    description: "Owner-authenticated pilot boundary for recommendations. It never bypasses the release gate and is disabled unless the server-side owner-pilot feature flag is enabled.",
    inputSchema: {
      domain: z.enum(["deposit", "saving"]),
      context: z.object({ as_of: DATE.optional() }).strict().optional(),
      owner_authenticated: z.boolean(),
      owner_session_id: z.string().min(1).optional(),
      owner_permission: z.literal("recommendation:owner_pilot").optional(),
    },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Owner Pilot Recommendation", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ domain, context, owner_authenticated, owner_session_id, owner_permission }) => {
    if (!context?.as_of) return mcpResult({ mode: "owner_pilot", status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED"], data_as_of: null, result_count: 0, candidates: [], missing_information: ["as_of"], decision_owner: "user" });
    const reasons = [
      ...(!owner_authenticated ? ["OWNER_AUTH_REQUIRED"] : []),
      ...(owner_authenticated && !owner_session_id ? ["OWNER_SESSION_REQUIRED"] : []),
      ...(owner_authenticated && owner_session_id && owner_permission !== "recommendation:owner_pilot" ? ["OWNER_PERMISSION_REQUIRED"] : []),
      ...(env.OWNER_PILOT_ENABLED !== "true" ? ["OWNER_PILOT_DISABLED"] : []),
    ];
    const manifest = await loadFinanceManifest(env);
    const releaseGate = evaluateReleaseGate({ manifest, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT, domain });
    if (reasons.length || releaseGate.status !== "ready") return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: [...new Set([...reasons, ...releaseGate.reasons])], data_as_of: context.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, release_gate: releaseGate, decision_owner: "user", limitations: ["owner pilot never bypasses manifest, source, checksum, or live evidence gates"] });
    return mcpResult({ mode: "owner_pilot", status: "blocked", reason_codes: ["OWNER_PILOT_CANDIDATE_PATH_NOT_ENABLED"], data_as_of: context.as_of, result_count: 0, candidates: [], candidate_data_exposed: false, release_gate: releaseGate, decision_owner: "user" });
  });
}
