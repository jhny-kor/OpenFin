import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";
import { evaluatePilotCandidates } from "./pilot-evaluation.ts";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const PILOT_CONTEXT_SCHEMA = z.object({
  as_of: DATE.optional(),
  facts: z.object({
    age_years: z.number().nonnegative().optional(),
    residency_code: z.string().optional(),
    customer_type: z.string().optional(),
    gender: z.string().optional(),
    employment_type: z.string().optional(),
    is_new_customer: z.boolean().optional(),
    eligibility_review_status: z.string().optional(),
    can_transfer_salary: z.boolean().optional(),
    can_use_card: z.boolean().optional(),
    can_set_auto_transfer: z.boolean().optional(),
    tax_rate_percent: z.number().min(0).max(100).optional(),
    fact_sources: z.record(z.string(), z.string()).optional(),
  }).strict().optional(),
  constraints: z.object({
    provider: z.union([z.string(), z.array(z.string())]).optional(),
    term_months: z.union([z.number().int(), z.array(z.number().int())]).optional(),
    join_channel: z.union([z.string(), z.array(z.string())]).optional(),
    minimum_amount_krw: z.number().nonnegative().optional(),
    maximum_amount_krw: z.number().nonnegative().optional(),
  }).strict().optional(),
  preferences: z.object({
    provider: z.string().optional(),
    term_months: z.number().int().positive().optional(),
    liquidity_horizon_months: z.number().int().nonnegative().optional(),
    max_term_months: z.number().int().nonnegative().optional(),
    monthly_budget_krw: z.number().nonnegative().optional(),
    monthly_contribution_krw: z.number().nonnegative().optional(),
    principal_krw: z.number().nonnegative().optional(),
    deposit_amount_krw: z.number().nonnegative().optional(),
    tax_rate_percent: z.number().min(0).max(100).optional(),
    planned_termination_months: z.number().nonnegative().optional(),
    early_termination_months: z.number().nonnegative().optional(),
  }).strict().optional(),
  decision_context: z.object({
    as_of: DATE.optional(),
    liquidity_requirement: z.object({ months: z.number().nonnegative().optional(), required_amount_krw: z.number().nonnegative().optional() }).strict().optional(),
    risk_capacity: z.enum(["low", "medium", "high"]).optional(),
  }).strict().optional(),
}).strict();

export function registerRecommendShadowTool(ctx: ToolContext): void {
  const { server, env, mcpResult, assertFinanceSafe, loadFinanceManifest, loadDetailedItemsForDomain, evaluateReleaseGate, manifestChecksumContract, buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool("recommend_shadow", {
    title: "Run Recommendation Shadow Trace",
    description: "Run an actual non-public recommendation evaluation. It returns aggregate redacted trace data only; candidate identities, rates, and monetary values are never exposed.",
    inputSchema: { domain: z.enum(["deposit", "saving"]), context: PILOT_CONTEXT_SCHEMA.optional() },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Run Recommendation Shadow Trace", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ domain, context: requestContext }) => {
    if (!requestContext?.as_of) return mcpResult({ mode: "shadow", status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED", "SHADOW_TRACE_ONLY"], data_as_of: null, result_count: 0, candidate_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, missing_information: ["as_of"], decision_owner: "user" });
    assertFinanceSafe(requestContext);
    const manifest = await loadFinanceManifest(env);
    const releaseGate = evaluateReleaseGate({ manifest, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT, domain, mode: "shadow" });
    try {
      const items = await loadDetailedItemsForDomain(env, domain, requestContext.as_of);
      const evaluation = evaluatePilotCandidates({
        ctx: { buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, evaluateReleaseGate, manifestChecksumContract },
        items,
        manifest,
        domain,
        mode: "shadow",
        asOf: requestContext.as_of,
        context: requestContext,
        deploymentCommit: env.DEPLOYMENT_COMMIT,
      });
      const reasonCodes = [
        ...releaseGate.reasons,
        ...(evaluation.eligible_count === 0 ? ["SHADOW_NO_ELIGIBLE_CANDIDATE"] : []),
        "SHADOW_TRACE_ONLY",
      ];
      return mcpResult({
        mode: "shadow",
        status: releaseGate.status === "ready" && evaluation.eligible_count > 0 ? "ready" : "blocked",
        reason_codes: [...new Set(reasonCodes)],
        data_as_of: requestContext.as_of,
        result_count: 0,
        candidate_count: evaluation.eligible_count,
        evaluated_count: evaluation.evaluated_count,
        eligible_count: evaluation.eligible_count,
        excluded_count: evaluation.excluded_count,
        reason_counts: evaluation.reason_counts,
        candidates: [],
        candidate_data_exposed: false,
        actual_evaluation: evaluation.actual_evaluation,
        release_gate: releaseGate,
        decision_trace: {
          schema_version: "openfin-decision-trace-v1",
          mode: "shadow",
          as_of: requestContext.as_of,
          generation_id: manifest.generation_id ?? null,
          evaluated_count: evaluation.evaluated_count,
          eligible_count: evaluation.eligible_count,
          excluded_count: evaluation.excluded_count,
          reason_counts: evaluation.reason_counts,
          candidate_id_exposed: false,
          monetary_values_in_trace: false,
          trace_artifact_status: "ephemeral_redacted",
        },
        decision_owner: "user",
        limitations: ["shadow output is an aggregate trace, not a recommendation", "candidate identities, rates, and financial values are withheld"],
      });
    } catch (error) {
      return mcpResult({ mode: "shadow", status: "blocked", reason_codes: ["SHADOW_EVALUATION_FAILED", "SHADOW_TRACE_ONLY"], data_as_of: requestContext.as_of, result_count: 0, candidate_count: 0, evaluated_count: 0, eligible_count: 0, excluded_count: 0, candidates: [], candidate_data_exposed: false, actual_evaluation: false, release_gate: releaseGate, decision_owner: "user", limitations: [error instanceof Error ? error.message : "shadow evaluation failed"] });
    }
  });
}
