import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnySchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { z } from "zod";

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
  minimumVerifiedCount: (domain: string) => number;
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
  recommendationReadiness: (domain: string, items: readonly FinanceItem[]) => FinanceRecord;
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
  const { server, env, mcpResult, assertFinanceSafe, isRecord, loadFinanceManifest, evaluateReleaseGate, manifestChecksumContract, minimumVerifiedCount, normalizeFinanceSnapshot, financeMetrics, financeNeeds, recommendationReadinessStates, nextRecommendationActions, nextRecommendationAction, financeAuditId, dedupeProductItems, loadDetailedItemsForDomain, loadFinanceArtifacts, domainMatches, sourceHealth, recommendationReadiness, buildRecommendationCandidates, evaluateEligibility, rankCandidate, explainCandidate, recommendationBlocker, EXCLUDED_SAMPLE_LIMIT, reasonCounts, itemUrl, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = rawContext as ToolContext;
  server.registerTool(
    "recommend",
    {
      title: "Recommend Finance Products",
      description:
        "Use this only when the user asks which finance product fits their current needs. It returns deterministic recommendations only from verified public recommendation candidates with source evidence; otherwise it returns an empty result with structured blockers.",
      inputSchema: {
        domain: z.enum(["deposit", "saving", "card", "loan", "insurance", "support"]).describe("Recommendation domain."),
        profile: z.record(z.string(), z.unknown()).optional().describe("User profile facts already supplied by the user."),
        constraints: z.record(z.string(), z.unknown()).optional().describe("Hard constraints already supplied by the user."),
        preferences: z.record(z.string(), z.unknown()).optional().describe("Soft preferences already supplied by the user."),
        decision_context: z.record(z.string(), z.unknown()).optional().describe("Transient typed personal-finance snapshot; sensitive account, credential, and identity fields are rejected."),
        limit: z.number().int().min(1).max(20).optional().describe("Maximum number of recommendations. Defaults to 5."),
      },
      outputSchema: STANDARD_OUTPUT_SCHEMA,
      annotations: {
        title: "Recommend Finance Products",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ domain, profile, constraints, preferences, decision_context, limit }) => {
      assertFinanceSafe(profile, "profile");
      assertFinanceSafe(constraints, "constraints");
      assertFinanceSafe(preferences, "preferences");
      assertFinanceSafe(decision_context, "decision_context");
      const manifest = await loadFinanceManifest(env);
      const releaseGate = evaluateReleaseGate({ manifest: manifest as unknown as Record<string, unknown>, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: typeof env.DEPLOYMENT_COMMIT === "string" ? env.DEPLOYMENT_COMMIT : undefined, domain });
      const maxResults = limit ?? 5;
      const context = normalizeFinanceSnapshot(decision_context);
      const rankingPreferences = { ...(isRecord(profile) && typeof profile.provider === "string" ? { provider: profile.provider } : {}), ...(isRecord(profile) && profile.term_months !== undefined ? { term_months: profile.term_months } : {}), ...(preferences ?? {}) };
      const contextMetrics = financeMetrics(context);
      const contextNeeds = financeNeeds(context, contextMetrics);
      const contextMissing = ["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => context[key] === null || context[key] === undefined || context[key] === "");
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
          minimum_required_count: minimumVerifiedCount(domain),
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
          profile_as_of: context.as_of ?? (isRecord(profile) ? profile.as_of ?? null : null),
          data_as_of: null,
          assumptions: ["the manifest release gate is evaluated at request time", "only verified recommendation candidates could qualify"],
          missing_information: contextMissing,
          financial_needs: contextNeeds,
          domain,
          domain_enabled: false,
          release_gate: releaseGate,
          input_summary: { profile_fields: Object.keys(profile ?? {}).sort(), constraint_fields: Object.keys(constraints ?? {}).sort(), preference_fields: Object.keys(preferences ?? {}).sort() },
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
          audit_id: financeAuditId("blocked-recommendation", domain, context.as_of ?? null),
          warnings: ["No verified public recommendation candidates are available for this domain."],
        };
        return mcpResult(payload);
      }
      const items = dedupeProductItems(await loadDetailedItemsForDomain(env, domain));
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      const domainItems = items.filter((item) => domainMatches(item, domain) && sourceHealth(item, artifacts).freshness_status === "current");
      const readiness = recommendationReadiness(domain, domainItems);
      const recommendation = buildRecommendationCandidates(domainItems as unknown as Array<Record<string, unknown>>, {
        profile: profile as Record<string, unknown> | undefined,
        constraints: constraints as Record<string, unknown> | undefined,
        decision_context: decision_context as Record<string, unknown> | undefined,
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
        profile_as_of: context.as_of ?? (isRecord(profile) ? profile.as_of ?? null : null),
        data_as_of: null,
        assumptions: ["only verified public recommendation candidates are eligible"],
        missing_information: contextMissing,
        financial_needs: contextNeeds,
        domain,
        input_summary: { profile_fields: Object.keys(profile ?? {}).sort(), constraint_fields: Object.keys(constraints ?? {}).sort(), preference_fields: Object.keys(preferences ?? {}).sort() },
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
        audit_id: financeAuditId("recommendation", domain, profile ?? {}, results),
        warnings: results.length ? [] : ["No verified public recommendation candidates are available for this domain."],
      };
      return mcpResult(payload);
    },
  );
}
