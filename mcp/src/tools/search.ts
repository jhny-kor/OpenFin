import { z } from "zod";
import type { FinanceArtifactSet, FinanceItem, SearchFilters, ToolContext } from "../types/tool-context.ts";

export function compactSearchResult(
  item: FinanceItem,
  score: number,
  query: string,
  env: Env,
  artifacts: FinanceArtifactSet,
  sourceHealth: ToolContext["sourceHealth"],
  matchReasons: ToolContext["matchReasons"],
  itemUrl: ToolContext["itemUrl"],
): Record<string, unknown> {
  const health = sourceHealth(item, artifacts);
  const result: Record<string, unknown> = {
    id: item.id,
    title: item.title,
    type: item.type,
    provider: item.provider,
    product_kind: item.product_kind,
    status: item.status ?? item.product_status,
    freshness_status: health.freshness_status,
    source_ids: health.source_ids,
    match_score: score,
    match_reasons: matchReasons(item, query),
    limitations: item.discovery_limitations ?? item.recommendation_exclusion_reasons ?? item.comparison_exclusion_reasons,
    url: itemUrl(env, item.id),
  };
  for (const [key, value] of Object.entries(result)) {
    // source_ids is a required evidence field even when the registry has no
    // usable ids; dropping it makes the response shape ambiguous.
    if (key !== "source_ids" && (value === undefined || (Array.isArray(value) && value.length === 0) || (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0))) delete result[key];
  }
  return result;
}

export function enrichSearchPayload(
  payload: Record<string, unknown>,
  items: readonly FinanceItem[],
  artifacts: FinanceArtifactSet,
  sourceHealth: ToolContext["sourceHealth"],
): Record<string, unknown> {
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const key of ["results", "exact_results", "partial_results", "exact_candidates", "partial_candidates", "related_candidates", "related_results"]) {
    const values = payload[key];
    if (!Array.isArray(values)) continue;
    payload[key] = values.map((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.id !== "string") return value;
      const item = byId.get(value.id);
      return item ? { ...value, ...sourceHealth(item, artifacts) } : value;
    });
  }
  return payload;
}

export function diversifyBroadResults<T extends { item: FinanceItem; score: number }>(
  ranked: readonly T[],
  query: string,
  filters: SearchFilters,
  maxResults: number,
  enabled = true,
): T[] {
  const broad = enabled
    && query.trim().split(/\s+/).filter(Boolean).length <= 2
    && !filters.provider
    && !filters.productKind;
  if (!broad) return ranked.slice(0, maxResults);

  const providerOf = (item: FinanceItem): string => typeof item.provider === "string" ? item.provider.trim() : "";
  const providers = new Set(ranked.map(({ item }) => providerOf(item)).filter(Boolean));
  if (providers.size < 2) return ranked.slice(0, maxResults);

  const selected: T[] = [];
  const selectedCandidates = new Set<T>();
  const providerCounts = new Map<string, number>();
  const targetProviderCount = Math.min(3, maxResults, providers.size);
  if (targetProviderCount >= 3) {
    for (const candidate of ranked) {
      const provider = providerOf(candidate.item);
      if (!provider || providerCounts.has(provider)) continue;
      selected.push(candidate);
      selectedCandidates.add(candidate);
      providerCounts.set(provider, 1);
      if (selected.length === targetProviderCount) break;
    }
  }

  const deferred: T[] = [];
  for (const candidate of ranked) {
    if (selectedCandidates.has(candidate)) continue;
    const provider = providerOf(candidate.item);
    if (provider && (providerCounts.get(provider) ?? 0) >= 2) {
      deferred.push(candidate);
      continue;
    }
    selected.push(candidate);
    if (provider) providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
    if (selected.length === maxResults) return selected;
  }
  for (const candidate of deferred) {
    if (selected.length === maxResults) break;
    const provider = providerOf(candidate.item);
    if (!provider || (providerCounts.get(provider) ?? 0) < 2) {
      selected.push(candidate);
      if (provider) providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
    }
  }
  return selected;
}

export function registerSearchTool(ctx: ToolContext): void {
  const { server, env, mcpResult, SUPPORT_INTENT_RE, dedupeProductItems, loadSearchItemsForQuery, loadFinanceArtifacts, normalizeQuery, isNamedProductQuery, strictNamedProductPayload, isDiscoveryQuery, discoveryPayload, SEARCH_TYPE_GROUPS, inferredTypesForQuery, supportRegionForQuery, inferredSearchTypeForQuery, matchesSearchFilters, matchesSupportRegion, matchesSupportIntent, isPubliclySearchable, scoreItem, diversifyBroadResults, matchReasons, supportMatchTier, itemUrl, sourceHealth, reasonCounts, supportParsedQuery, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
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
        if (payload) return mcpResult(enrichSearchPayload(payload, items, artifacts, sourceHealth));
      }
      if (isDiscoveryQuery(query)) {
        const payload = discoveryPayload(query, items, maxResults, artifacts);
        return mcpResult(enrichSearchPayload(payload, items, artifacts, sourceHealth));
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
      const rankedItems = diversifyBroadResults(
        scoredItems.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ko-KR")),
        normalizedQuery,
        filters,
        maxResults,
        !supportQuery,
      );
      if (supportQuery) {
        const returnedIds = new Set(rankedItems.map(({ item }) => item.id));
        for (const { item } of scoredItems) if (!returnedIds.has(item.id)) addExcluded(item, "result_limit");
      }
      const projectedResults = rankedItems.map(({ item, score }) => ({
        result: compactSearchResult(item, score, normalizedQuery, env, artifacts, sourceHealth, matchReasons, itemUrl),
        matchTier: supportMatchTier(item, normalizedQuery),
      }));
      const results = projectedResults.map(({ result }) => result);

      const payload = {
        query,
        filters,
        parsed_query: supportParsedQuery(query, region),
        result_count: results.length,
        results,
        exact_results: projectedResults.filter(({ matchTier }) => matchTier === "exact").map(({ result }) => result),
        partial_results: projectedResults.filter(({ matchTier }) => matchTier === "partial").map(({ result }) => result),
        related_results: projectedResults.filter(({ matchTier }) => matchTier === "related").map(({ result }) => result),
        support_match_tier_counts: reasonCounts(projectedResults.filter(({ matchTier }) => matchTier).map(({ matchTier }) => ({ reason: matchTier as string }))),
        excluded_summary: excludedSummary,
      };

      return mcpResult(payload);
    },
  );
}
