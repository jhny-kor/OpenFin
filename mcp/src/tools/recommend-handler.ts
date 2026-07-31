import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnySchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { z } from "zod";
import { normalizeRecommendationContext, contextFieldNames } from "../recommendation/context.ts";
import { assertRecommendationContextSafe, recommendationAuditMetadata } from "../recommendation/privacy.ts";
import { evaluateRecommendationNeedGate } from "../recommendation/need-gate.ts";

type FinanceRecord = Record<string, unknown>;
type FinanceItem = FinanceRecord & { id?: string; title?: string; provider?: string; source_urls?: string[]; source_assertions?: FinanceRecord[]; provenance?: FinanceRecord[] };
type ToolResult = { structuredContent: FinanceRecord; content: [{ type: "text"; text: string }] };
type ReleaseGate = { status: "ready" | "blocked"; reasons: string[]; [key: string]: unknown };
type ToolContext = {
  server: McpServer;
  env: FinanceRecord;
  mcpResult: (payload: FinanceRecord) => ToolResult;
  assertFinanceSafe: (...values: unknown[]) => void;
  isRecord: (value: unknown) => value is FinanceRecord;
  loadFinanceManifest: (env: FinanceRecord) => Promise<FinanceRecord & { domain_readiness?: Record<string, FinanceRecord> }>;
  evaluateReleaseGate: (input: FinanceRecord) => ReleaseGate;
  manifestChecksumContract: (manifest: FinanceRecord) => boolean;
  normalizeFinanceSnapshot: (value: unknown) => FinanceRecord;
  financeMetrics: (value: FinanceRecord) => unknown;
  financeNeeds: (value: FinanceRecord, metrics: unknown) => unknown;
  recommendationReadinessStates: (domain: string, readiness: FinanceRecord) => unknown;
  nextRecommendationActions: (domain: string, readiness: FinanceRecord) => unknown;
  nextRecommendationAction: (domain: string, readiness: FinanceRecord) => unknown;
  financeAuditId: (...values: unknown[]) => string;
  dedupeProductItems: (items: readonly FinanceItem[]) => FinanceItem[];
  loadDetailedItemsForDomain: (env: FinanceRecord, domain: string) => Promise<FinanceItem[]>;
  loadFinanceArtifacts: (env: FinanceRecord, keys: readonly string[]) => Promise<FinanceRecord>;
  domainMatches: (item: FinanceItem, domain: string) => boolean;
  sourceHealth: (item: FinanceItem, artifacts: FinanceRecord) => FinanceRecord;
  recommendationReadiness: (domain: string, items: readonly FinanceItem[], minimumRequiredCount?: number) => FinanceRecord;
  buildRecommendationCandidates: (items: readonly FinanceItem[], input: FinanceRecord) => { candidates: FinanceItem[]; excluded: FinanceRecord[] };
  evaluateEligibility: (item: FinanceItem, inputs: FinanceRecord) => FinanceRecord;
  rankCandidate: (item: FinanceItem, preferences: FinanceRecord) => FinanceRecord;
  explainCandidate: (item: FinanceItem, eligibility: FinanceRecord, ranking: FinanceRecord) => FinanceRecord;
  recommendationBlocker: (item: FinanceItem, artifacts: FinanceRecord) => string | null;
  EXCLUDED_SAMPLE_LIMIT: number;
  reasonCounts: (values: readonly FinanceRecord[]) => FinanceRecord;
  itemUrl: (env: FinanceRecord, id: string) => string;
  READ_ONLY_TOOL_ANNOTATIONS: FinanceRecord;
  STANDARD_OUTPUT_SCHEMA: AnySchema;
};

export function registerRecommendTool(rawContext: unknown): void {
  const { server, env, mcpResult, assertFinanceSafe, isRecord, loadFinanceManifest, evaluateReleaseGate, manifestChecksumContract, normalizeFinanceSnapshot, financeMetrics, financeNeeds, recommendationReadinessStates, nextRecommendationActions, nextRecommendationAction, dedupeProductItems, loadDetailedItemsForDomain, loadFinanceArtifacts, domainMatches, sourceHealth, recommendationReadiness, buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, recommendationBlocker, EXCLUDED_SAMPLE_LIMIT, reasonCounts, itemUrl, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = rawContext as ToolContext;
  server.registerTool(
    "recommend",
    {
      title: "Recommend Finance Products",
      description:
        "Use this only when the user asks which finance product fits their current needs. It returns deterministic recommendations only from verified public recommendation candidates with source evidence; otherwise it returns an empty result with structured blockers.",
      inputSchema: {
        domain: z.enum(["deposit", "saving", "card", "loan", "insurance"]).describe("Recommendation domain."),
        context: z.object({ as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), goal: z.object({ purpose: z.enum(["save", "preserve_liquidity", "income", "compare", "education"]).optional(), target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), liquidity_horizon_months: z.number().int().nonnegative().nullable().optional() }).strict().optional(), facts: z.object({ as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), monthly_net_income_krw: z.number().nonnegative().nullable().optional(), essential_monthly_expenses_krw: z.number().nonnegative().nullable().optional(), liquid_assets_krw: z.number().nonnegative().nullable().optional(), investment_assets_krw: z.number().nonnegative().nullable().optional(), tax_rate_percent: z.number().min(0).max(100).nullable().optional(), can_transfer_salary: z.boolean().nullable().optional(), can_use_card: z.boolean().nullable().optional(), can_set_auto_transfer: z.boolean().nullable().optional(), is_new_customer: z.boolean().nullable().optional() }).strict().optional(), hard_constraints: z.object({ provider: z.union([z.string(), z.array(z.string())]).nullable().optional(), term_months: z.union([z.number().int(), z.array(z.number().int())]).nullable().optional(), join_channel: z.union([z.string(), z.array(z.string())]).nullable().optional(), minimum_amount_krw: z.number().nonnegative().nullable().optional(), maximum_amount_krw: z.number().nonnegative().nullable().optional(), eligible_rule_ids: z.array(z.string()).optional() }).strict().optional(), preferences: z.object({ provider: z.string().optional(), term_months: z.number().int().positive().optional(), liquidity_horizon_months: z.number().int().nonnegative().optional(), max_term_months: z.number().int().nonnegative().optional(), monthly_budget_krw: z.number().nonnegative().optional(), monthly_contribution_krw: z.number().nonnegative().optional(), principal_krw: z.number().nonnegative().optional(), deposit_amount_krw: z.number().nonnegative().optional(), tax_rate_percent: z.number().min(0).max(100).optional(), risk_capacity: z.enum(["low", "medium", "high"]).optional() }).strict().optional(), assumptions: z.array(z.string().max(240)).max(20).optional(), consent: z.object({ transient_only: z.literal(true) }).strict().optional() }).strict().optional(),
        profile: z.object({ provider: z.string().optional(), term_months: z.number().int().positive().optional(), risk_capacity: z.enum(["low", "medium", "high"]).optional(), liquidity_horizon_months: z.number().int().nonnegative().optional(), tax_rate_percent: z.number().min(0).max(100).optional() }).strict().optional().describe("Allowlisted user facts only; never persisted."),
        constraints: z.object({ provider: z.union([z.string(), z.array(z.string())]).nullable().optional(), term_months: z.union([z.number().int(), z.array(z.number().int())]).nullable().optional(), join_channel: z.union([z.string(), z.array(z.string())]).nullable().optional(), minimum_amount_krw: z.number().nonnegative().nullable().optional(), maximum_amount_krw: z.number().nonnegative().nullable().optional(), eligible_rule_ids: z.array(z.string()).optional() }).strict().optional().describe("Allowlisted hard constraints."),
        preferences: z.object({ provider: z.string().optional(), term_months: z.number().int().positive().optional(), liquidity_horizon_months: z.number().int().nonnegative().optional(), max_term_months: z.number().int().nonnegative().optional(), monthly_budget_krw: z.number().nonnegative().optional(), monthly_contribution_krw: z.number().nonnegative().optional(), principal_krw: z.number().nonnegative().optional(), deposit_amount_krw: z.number().nonnegative().optional(), tax_rate_percent: z.number().min(0).max(100).optional(), risk_capacity: z.enum(["low", "medium", "high"]).optional() }).strict().optional().describe("Allowlisted soft preferences."),
        decision_context: z.object({ as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), liquidity_requirement: z.object({ months: z.number().nonnegative().optional(), required_amount_krw: z.number().nonnegative().optional() }).strict().optional(), risk_capacity: z.enum(["low", "medium", "high"]).optional() }).strict().optional().describe("Transient typed decision facts."),
        limit: z.number().int().min(1).max(20).optional().describe("Maximum number of recommendations. Defaults to 5."),
      },
      outputSchema: STANDARD_OUTPUT_SCHEMA,
      annotations: {
        title: "Recommend Finance Products",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ domain, context: requestContext, profile, constraints, preferences, decision_context, limit }) => {
      const recommendationContext = normalizeRecommendationContext({ context: requestContext, profile, constraints, preferences, decision_context }, domain);
      assertRecommendationContextSafe(recommendationContext);
      const manifest = await loadFinanceManifest(env);
      const requiredVerifiedCount = Number(manifest.domain_readiness?.[domain]?.required_verified_candidates ?? 0);
      const releaseGate = evaluateReleaseGate({ manifest: manifest as unknown as Record<string, unknown>, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: typeof env.DEPLOYMENT_COMMIT === "string" ? env.DEPLOYMENT_COMMIT : undefined, domain });
      const maxResults = limit ?? 5;
      const context = normalizeFinanceSnapshot(decision_context);
      const profileRecord: FinanceRecord = isRecord(profile) ? profile : {};
      const mappedDecisionContext: FinanceRecord = {
        ...context,
        ...recommendationContext.facts,
        ...(recommendationContext.goal.purpose ? { goal_purpose: recommendationContext.goal.purpose } : {}),
        ...(recommendationContext.goal.target_date ? { goal_target_date: recommendationContext.goal.target_date } : {}),
        ...(recommendationContext.goal.liquidity_horizon_months !== undefined && recommendationContext.goal.liquidity_horizon_months !== null ? { goal_liquidity_horizon_months: recommendationContext.goal.liquidity_horizon_months } : {}),
        ...(recommendationContext.goal.liquidity_horizon_months !== undefined && recommendationContext.goal.liquidity_horizon_months !== null ? { liquidity_requirement: { months: recommendationContext.goal.liquidity_horizon_months } } : {}),
        ...(context.risk_capacity === undefined && typeof profileRecord.risk_capacity === "string" ? { risk_capacity: profileRecord.risk_capacity } : {}),
        ...(context.liquidity_requirement === undefined && typeof profileRecord.liquidity_horizon_months === "number" ? { liquidity_requirement: { months: profileRecord.liquidity_horizon_months } } : {}),
      };
      const mappedLiquidity = isRecord(mappedDecisionContext.liquidity_requirement) && typeof mappedDecisionContext.liquidity_requirement.months === "number" ? mappedDecisionContext.liquidity_requirement.months : undefined;
      const rankingPreferences = {
        ...recommendationContext.facts,
        ...recommendationContext.preferences,
        ...(typeof profileRecord.provider === "string" ? { provider: profileRecord.provider } : {}),
        ...(profileRecord.term_months !== undefined ? { term_months: profileRecord.term_months } : {}),
        ...Object.fromEntries(["tax_rate_percent", "tax_rate", "liquidity_horizon_months", "max_term_months", "monthly_budget_krw", "monthly_contribution_krw", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => profileRecord[key] !== undefined).map((key) => [key, profileRecord[key]])),
        ...(mappedLiquidity !== undefined ? { liquidity_horizon_months: mappedLiquidity } : {}),
        ...Object.fromEntries(["tax_rate_percent", "monthly_budget_krw", "monthly_contribution_krw", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => mappedDecisionContext[key] !== undefined).map((key) => [key, mappedDecisionContext[key]])),
        user_facts: recommendationContext.facts,
      };
      const contextMetrics = financeMetrics(mappedDecisionContext);
      const contextNeeds = financeNeeds(mappedDecisionContext, contextMetrics);
      // Recommendation context is domain-scoped. A deposit lookup must not
      // force unrelated investment or insurance fields into the request.
      const contextMissing = ["as_of"].filter((key) => recommendationContext[key as "as_of"] === null);
      if (releaseGate.status !== "ready") {
        // A blocked release must be cheap and deterministic. Do not hydrate
        // the large product shard or source artifacts just to return an empty
        // fail-closed response.
        const manifestReadiness = manifest.domain_readiness?.[domain] ?? {};
        const readiness = {
          verified_active_product_count: Number(manifestReadiness.runtime_eligible_candidate_count ?? 0),
          verification_evidence_product_count: Number(manifestReadiness.field_verified_candidate_count ?? 0),
          comparison_engine_product_count: Number(manifestReadiness.value_complete_candidate_count ?? 0),
          verified_completeness_product_count: Number(manifestReadiness.field_verified_candidate_count ?? 0),
          public_recommendation_candidate_count: Number(manifestReadiness.public_candidate_count ?? 0),
          minimum_required_count: requiredVerifiedCount,
        };
        const blockerCounts = {
          domain_recommendation_not_enabled: Number(manifestReadiness.item_count ?? 0),
          sales_not_verified: Math.max(0, Number(manifestReadiness.item_count ?? 0) - readiness.verified_active_product_count),
          verification_evidence_missing: Math.max(0, Number(manifestReadiness.item_count ?? 0) - readiness.verification_evidence_product_count),
          verified_completeness_incomplete: Math.max(0, Number(manifestReadiness.item_count ?? 0) - readiness.verified_completeness_product_count),
        };
        const payload = {
          mode: "decision_support",
          status: "blocked",
          reason_codes: [...releaseGate.reasons.map((reason) => `RELEASE_GATE_${reason}`), "NO_VERIFIED_RECOMMENDATION_CANDIDATE"],
          profile_as_of: recommendationContext.as_of,
          data_as_of: null,
          assumptions: ["the manifest release gate is evaluated at request time", "only verified recommendation candidates could qualify"],
          missing_information: contextMissing,
          financial_needs: contextNeeds,
          domain,
          domain_enabled: false,
          release_gate: releaseGate,
          input_summary: { fields: contextFieldNames(recommendationContext) },
          recommendation_model_version: "openfin-recommendation-v0.1.0",
          result_count: 0,
          candidates: [],
          blocker_counts: blockerCounts,
          readiness,
          readiness_states: recommendationReadinessStates(domain, readiness),
          next_required_actions: nextRecommendationActions(domain, readiness),
          next_required_action: nextRecommendationAction(domain, readiness),
          excluded_count: Number(manifestReadiness.item_count ?? 0),
          excluded_sample: [],
          decision_owner: "user",
          limitations: ["use lookup, education, comparison, and scenario tools only until the owner pilot is enabled"],
          audit_id: recommendationAuditMetadata(recommendationContext, domain, typeof manifest.generation_id === "string" ? manifest.generation_id : null),
          warnings: ["No verified public recommendation candidates are available for this domain."],
        };
        return mcpResult(payload);
      }
      const contextNeedsGate = evaluateRecommendationNeedGate(domain, mappedDecisionContext, contextNeeds as FinanceRecord[], contextMetrics as Record<string, FinanceRecord>);
      if (contextNeedsGate.status !== "ready") {
        return mcpResult({ mode: "decision_support", status: contextNeedsGate.status, reason_codes: contextNeedsGate.reason_codes, profile_as_of: recommendationContext.as_of, data_as_of: null, assumptions: recommendationContext.assumptions, missing_information: contextNeedsGate.missing_information, financial_needs: contextNeeds, domain, domain_enabled: false, release_gate: releaseGate, result_count: 0, candidates: [], decision_owner: "user", limitations: ["recommendation is abstained until the stated financial need is addressed"], audit_id: recommendationAuditMetadata(recommendationContext, domain, null), warnings: ["No product was recommended because the current financial context does not support this recommendation."] });
      }
      const items = dedupeProductItems(await loadDetailedItemsForDomain(env, domain));
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      const domainItems = items.filter((item) => domainMatches(item, domain) && sourceHealth(item, artifacts).freshness_status === "current");
      const readiness = recommendationReadiness(domain, domainItems, requiredVerifiedCount);
      const recommendation = buildRecommendationCandidates(domainItems as unknown as Array<Record<string, unknown>>, {
        profile: { ...recommendationContext.facts, ...recommendationContext.preferences },
        constraints: recommendationContext.hard_constraints,
        decision_context: mappedDecisionContext,
        preferences: rankingPreferences,
        evaluateEligibility: (item: FinanceItem, inputs: FinanceRecord) => evaluateEligibility(item, inputs),
        rankCandidate,
        explainCandidate,
        recommendationBlocker: (item: FinanceItem) => recommendationBlocker(item, artifacts),
        itemGate: (item: FinanceItem) => evaluateReleaseGate({ manifest: manifest as unknown as Record<string, unknown>, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: typeof env.DEPLOYMENT_COMMIT === "string" ? env.DEPLOYMENT_COMMIT : undefined, domain, item }),
        toCandidate: (item: FinanceItem, eligibility: FinanceRecord, ranking: FinanceRecord) => ({
          item_id: item.id,
          title: item.title,
          provider: item.provider,
          eligible: true,
          ...explainCandidate(item as unknown as Record<string, unknown>, eligibility, ranking),
          score: ranking.score,
          score_components: ranking.score_components,
          warnings: [],
          source_basis_dates: item.source_basis_dates ?? [],
          last_verified_at: item.last_verified_at,
          recommendation_status: item.recommendation_status,
          recommendation_scope: item.recommendation_scope,
          recommendation_model_version: ranking.recommendation_model_version,
          sources: item.source_urls ?? [],
          source_assertions: item.source_assertions ?? [],
          verification_status: item.verification_status ?? "unknown",
          promotion_receipt: item.promotion_receipt ?? null,
          data_as_of: eligibility.data_as_of ?? item.last_verified_at ?? item.verified_at ?? null,
          structured_summary: item.structured_summary ?? {},
          url: itemUrl(env, String(item.id)),
        }),
      });
      const { candidates, excluded } = recommendation;
      const results = candidates.slice(0, maxResults);
      const payload = {
        mode: "recommendation",
        status: results.length ? "ready" : "blocked",
        reason_codes: results.length ? [] : ["NO_VERIFIED_RECOMMENDATION_CANDIDATE"],
        profile_as_of: recommendationContext.as_of,
        data_as_of: null,
        assumptions: ["only verified public recommendation candidates are eligible"],
        missing_information: contextMissing,
        financial_needs: contextNeeds,
        domain,
        input_summary: { fields: contextFieldNames(recommendationContext) },
        recommendation_model_version: "openfin-recommendation-v0.1.0",
        domain_enabled: true,
        release_gate: releaseGate,
        result_count: results.length,
        candidates: results,
        blocker_counts: reasonCounts(excluded),
        readiness,
        readiness_states: recommendationReadinessStates(domain, readiness),
        next_required_actions: nextRecommendationActions(domain, readiness),
        next_required_action: nextRecommendationAction(domain, readiness),
        excluded_count: excluded.length,
        excluded_sample: excluded.slice(0, EXCLUDED_SAMPLE_LIMIT),
        decision_owner: "user",
        limitations: ["recommendation output is subject to source freshness and user verification"],
        audit_id: recommendationAuditMetadata(recommendationContext, domain, null, results.map((result) => String(result.item_id ?? ""))),
        warnings: results.length ? [] : ["No verified public recommendation candidates are available for this domain."],
      };
      return mcpResult(payload);
    },
  );
}
