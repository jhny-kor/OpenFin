import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const input = {
  domain: z.enum(["deposit", "saving"]),
  context: z.object({ as_of: DATE.optional() }).strict().optional(),
};

export function registerRecommendShadowTool(ctx: ToolContext): void {
  const { server, env, mcpResult, loadFinanceManifest, evaluateReleaseGate, manifestChecksumContract, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool("recommend_shadow", {
    title: "Run Recommendation Shadow Trace",
    description: "Run a non-public recommendation gate trace. It returns counts and reason codes only; candidate identities, rates, and monetary values are never exposed.",
    inputSchema: input,
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Run Recommendation Shadow Trace", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ domain, context }) => {
    if (!context?.as_of) return mcpResult({ mode: "shadow", status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED"], data_as_of: null, result_count: 0, candidate_count: 0, candidates: [], candidate_data_exposed: false, missing_information: ["as_of"], decision_owner: "user" });
    const manifest = await loadFinanceManifest(env);
    const readiness = manifest.domain_readiness?.[domain] ?? {};
    const releaseGate = evaluateReleaseGate({ manifest, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT, domain });
    const publicReasons = releaseGate.status === "ready" ? [] : releaseGate.reasons;
    return mcpResult({
      mode: "shadow",
      status: releaseGate.status,
      reason_codes: [...publicReasons, "SHADOW_TRACE_ONLY"],
      data_as_of: context.as_of,
      result_count: 0,
      candidate_count: Number(readiness.shadow_recommendation_candidate_count ?? 0),
      strict_offer_count: Number(readiness.strict_offer_count ?? 0),
      structural_option_count: Number(readiness.structural_option_count ?? 0),
      candidates: [],
      candidate_data_exposed: false,
      release_gate: releaseGate,
      decision_trace: { schema_version: "openfin-decision-trace-v1", mode: "shadow", as_of: context.as_of, generation_id: manifest.generation_id ?? null, monetary_values_in_trace: false, candidate_id_exposed: false },
      decision_owner: "user",
      limitations: ["shadow output is an aggregate trace, not a recommendation", "candidate identities and financial values are withheld"],
    });
  });
}
