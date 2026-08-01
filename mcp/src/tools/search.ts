import { z } from "zod";
import type { SearchFilters, ToolContext } from "../types/tool-context.ts";

export function registerSearchTool(ctx: ToolContext): void {
  const { server, env, mcpResult, SUPPORT_INTENT_RE, dedupeProductItems, loadSearchItemsForQuery, loadFinanceArtifacts, normalizeQuery, isNamedProductQuery, strictNamedProductPayload, enrichSearchPayload, isDiscoveryQuery, discoveryPayload, SEARCH_TYPE_GROUPS, inferredTypesForQuery, supportRegionForQuery, inferredSearchTypeForQuery, matchesSearchFilters, matchesSupportRegion, matchesSupportIntent, isPubliclySearchable, scoreItem, matchReasons, supportMatchTier, itemUrl, sourceHealth, reasonCounts, supportParsedQuery, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool(
    "search",
    {
      title: "Search Finance Ontology",
      description:
        "Use this when the user needs to find Korean tax, deduction, policy support, local-government support, card, bank, insurance, filing deadline, term, or official-source nodes. Recommendation wording routes to source-backed discovery candidates; verified public recommendations remain a separate tool. Do not use for personalized tax, legal, accounting, or financial advice.",
      inputSchema: {
        query: z.string().min(1).describe("Search query, for example '보험료 공제 한도', '청년 월세', '체크카드 전월실적', or 'bank-products'."),
        type: z
          .string()
          .optional()
          .describe("Optional ontology item type filter, for example 'tax', 'support-program', 'card-product', 'bank-product', or 'insurance-product'. 'tax' also matches tax-credit, deduction, and other tax decision types."),
        search_type: z.string().optional().describe("Optional product search-type filter, for example 'loan', 'deposit', or 'saving'."),
        product_kind: z.string().optional().describe("Optional product-kind filter, for example 'policy-loan'."),
        recommendation_status: z.string().optional().describe("Optional recommendation-state filter. manual_review_candidate records are internal-only and recommendation wording returns only verified_recommendation_candidate records."),
        recommendation_scope: z.string().optional().describe("Optional recommendation-scope filter, for example 'listing_only' or 'internal_verification_candidate'."),
        sales_status: z.string().optional().describe("Optional sales-state filter, for example 'active'."),
        application_status: z.string().optional().describe("Optional support application-state filter, for example 'open'."),
        provider: z.string().optional().describe("Optional exact provider filter."),
        region: z.string().optional().describe("Optional local-support jurisdiction filter, for example '서울' or '전라남도'."),
        freshness_status: z.string().optional().describe("Optional source-freshness filter, for example 'current' or 'stale'."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum number of results. Defaults to 10."),
      },
      outputSchema: STANDARD_OUTPUT_SCHEMA,
      annotations: {
        title: "Search Finance Ontology",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ query, type, search_type, product_kind, recommendation_status, recommendation_scope, sales_status, application_status, provider, region, freshness_status, limit }) => {
      const items = dedupeProductItems(await loadSearchItemsForQuery(env, query, type, search_type, product_kind));
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      const normalizedQuery = normalizeQuery(query);
      const maxResults = limit ?? 10;
      if (isNamedProductQuery(query)) {
        const payload = strictNamedProductPayload(query, items, maxResults, env);
        if (payload) return mcpResult(enrichSearchPayload(payload, items, artifacts));
      }
      if (isDiscoveryQuery(query)) {
        const payload = discoveryPayload(query, items, maxResults, artifacts);
        return mcpResult(enrichSearchPayload(payload, items, artifacts));
      }

      const allowedTypes = type ? SEARCH_TYPE_GROUPS[type] ?? new Set([type]) : inferredTypesForQuery(normalizedQuery);
      const supportRegion = supportRegionForQuery(normalizedQuery);
      const filters: SearchFilters = {
        searchType: search_type ?? inferredSearchTypeForQuery(normalizedQuery),
        productKind: product_kind,
        recommendationStatus: recommendation_status,
        recommendationScope: recommendation_scope,
        salesStatus: sales_status,
        applicationStatus: application_status,
        provider,
        region,
        freshnessStatus: freshness_status,
      };
      const scoreCache = new Map<string, number>();
      const cachedScore = (item: Parameters<typeof scoreItem>[0]): number => {
        const cached = scoreCache.get(item.id);
        if (cached !== undefined) return cached;
        const score = scoreItem(item, normalizedQuery);
        scoreCache.set(item.id, score);
        return score;
      };
      const supportQuery = SUPPORT_INTENT_RE.test(normalizedQuery);
      const supportSearchTokens = supportQuery
        ? normalizedQuery.split(/\s+/).filter((token) => token && !["지원", "지원금", "보조금", "신청"].includes(token))
        : [];
      const excludedSummary: Record<string, number> = {};
      const addExcluded = (item: Parameters<typeof scoreItem>[0], reason: string): void => {
        if (!supportQuery || item.type !== "support-program") return;
        excludedSummary[reason] = (excludedSummary[reason] ?? 0) + 1;
      };
      const scoredItems: Array<{ item: Parameters<typeof scoreItem>[0]; score: number }> = [];
      for (const item of items) {
        if (supportSearchTokens.length && typeof item.search_text === "string" && !supportSearchTokens.some((token) => (item.search_text as string).includes(token))) {
          addExcluded(item, "query_mismatch");
          continue;
        }
        if (!isPubliclySearchable(item)) { addExcluded(item, "not_publicly_searchable"); continue; }
        if (allowedTypes && !allowedTypes.has(item.type)) { addExcluded(item, "type_filter"); continue; }
        if (!matchesSearchFilters(item, filters, artifacts)) { addExcluded(item, "filter_mismatch"); continue; }
        if (!matchesSupportRegion(item, supportRegion)) { addExcluded(item, "region_mismatch"); continue; }
        if (!matchesSupportIntent(item, normalizedQuery)) { addExcluded(item, "support_intent_mismatch"); continue; }
        const score = cachedScore(item);
        if (score <= 0) { addExcluded(item, "query_mismatch"); continue; }
        scoredItems.push({ item, score });
      }
      const rankedItems = scoredItems
        .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ko-KR"))
        .slice(0, maxResults);
      if (supportQuery) {
        const returnedIds = new Set(rankedItems.map(({ item }) => item.id));
        for (const { item } of scoredItems) if (!returnedIds.has(item.id)) addExcluded(item, "result_limit");
      }
      const results = rankedItems
        .map(({ item, score }) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          provider: item.provider,
          product_kind: item.product_kind,
          search_type: item.search_type,
          product_status: item.product_status,
          sales_status: item.sales_status,
          source_listing_status: item.source_listing_status,
          sales_verification_status: item.sales_verification_status,
          source_freshness_status: item.source_freshness_status,
          status: item.status,
          recommendation_status: item.recommendation_status,
          recommendation_scope: item.recommendation_scope,
          catalog_recommendation_status: item.catalog_recommendation_status,
          catalog_recommendation_scope: item.catalog_recommendation_scope,
          canonical_product_id: item.canonical_product_id,
          resolved_canonical_product_id: item.resolved_canonical_product_id ?? item.canonical_product_id,
          external_product_ids: item.external_product_ids ?? [],
          provider_external_ids: item.provider_external_ids ?? [],
          provider_roles: item.provider_roles ?? [],
          application_status: item.application_status,
          is_currently_applicable: item.is_currently_applicable,
          application_open_to: item.application_open_to,
          application_window: item.application_window ?? {},
          jurisdiction: item.jurisdiction,
          freshness_status: item.freshness_status,
          recommendation_model_version: item.recommendation_model_version,
          recommendation_exclusion_reasons: item.recommendation_exclusion_reasons ?? [],
          recommendation_basis_fields: item.recommendation_basis_fields ?? [],
          comparison_basis_fields: item.comparison_basis_fields ?? [],
          verification_status: item.verification_status,
          completeness_ratio: item.completeness_ratio,
          comparison_engine_gate_passed: item.comparison_engine_gate_passed,
          comparison_field_verification_status: item.comparison_field_verification_status,
          comparison_field_verification: item.comparison_field_verification ?? {},
          missing_required_fields: item.missing_required_fields ?? [],
          structured_summary: item.structured_summary ?? {},
          search_facets: item.search_facets ?? {},
          ...sourceHealth(item, artifacts),
          match_reasons: matchReasons(item, normalizedQuery),
          match_tier: supportMatchTier(item, normalizedQuery),
          url: itemUrl(env, item.id),
          score,
          text: item.description ?? "",
        }));

      const payload = {
        query,
        filters,
        parsed_query: supportParsedQuery(query, region),
        result_count: results.length,
        results,
        exact_results: results.filter((item) => item.match_tier === "exact"),
        partial_results: results.filter((item) => item.match_tier === "partial"),
        related_results: results.filter((item) => item.match_tier === "related"),
        support_match_tier_counts: reasonCounts(results.filter((item) => item.match_tier).map((item) => ({ reason: item.match_tier as string }))),
        excluded_summary: excludedSummary,
      };

      return mcpResult(payload);
    },
  );
}
