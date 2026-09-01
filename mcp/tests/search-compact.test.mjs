import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compactSearchResult, diversifyBroadResults, enrichSearchPayload } from "../src/tools/search.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workerSource = readFileSync(resolve(root, "mcp/src/index.ts"), "utf8");
const searchToolSource = readFileSync(resolve(root, "mcp/src/tools/search.ts"), "utf8");
const schema = JSON.parse(readFileSync(resolve(root, "schemas/mcp-tools/search-result.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

test("search results use the compact evidence projection", () => {
  const result = compactSearchResult(
    { id: "product.1", title: "상품", type: "bank-product", provider: "은행", product_kind: "deposit", status: "active" },
    42,
    "예금",
    {},
    {},
    () => ({ source_ids: ["source.1"], freshness_status: "current" }),
    () => ["title"],
    () => "https://example.test/product.1",
  );

  assert.deepEqual(result, {
    id: "product.1",
    title: "상품",
    type: "bank-product",
    provider: "은행",
    product_kind: "deposit",
    status: "active",
    freshness_status: "current",
    source_ids: ["source.1"],
    match_score: 42,
    match_reasons: ["title"],
    url: "https://example.test/product.1",
  });
  assert.equal("structured_summary" in result, false);
  assert.equal("search_facets" in result, false);
});

test("actual compact search responses validate against the canonical schema", () => {
  const result = compactSearchResult(
    { id: "product.2", title: "상품", type: "bank-product", provider: "은행", product_kind: "deposit", status: "active" },
    7,
    "예금",
    {},
    {},
    () => ({ source_ids: ["source.2"], freshness_status: "current" }),
    () => ["title"],
    () => "https://example.test/product.2",
  );

  assert.equal(validate(result), true, ajv.errorsText(validate.errors));
  assert.equal(validate({ ...result, source_ids: undefined }), false);
});

test("registered compact projection keeps an empty source id list", () => {
  const result = compactSearchResult(
    { id: "product.3", title: "상품", type: "bank-product" },
    1,
    "예금",
    {},
    {},
    () => ({ source_ids: [], freshness_status: "unknown" }),
    () => [],
    () => "https://example.test/product.3",
  );
  assert.deepEqual(result.source_ids, []);
  assert.equal(validate(result), true, ajv.errorsText(validate.errors));
});

test("broad search diversity targets three providers when available", () => {
  const ranked = [
    ["a1", "A", 10],
    ["a2", "A", 9],
    ["a3", "A", 8],
    ["b1", "B", 7],
    ["b2", "B", 6],
    ["c1", "C", 5],
    ["c2", "C", 4],
  ].map(([id, provider, score]) => ({ item: { id, title: id, type: "bank-product", provider }, score }));

  const results = diversifyBroadResults(ranked, "예금", {}, 5);
  assert.equal(new Set(results.map(({ item }) => item.provider)).size, 3);
  assert.deepEqual(results.map(({ item }) => item.id), ["a1", "b1", "c1", "a2", "b2"]);
  assert.ok(results.every(({ item }) => results.filter(({ item: other }) => other.provider === item.provider).length <= 2));
  assert.deepEqual(diversifyBroadResults(ranked, "예금", {}, 3).map(({ item }) => item.id), ["a1", "b1", "c1"]);
  assert.deepEqual(diversifyBroadResults(ranked, "청년 월세", {}, 5, false), ranked.slice(0, 5));
});

test("named and discovery candidates retain decision evidence while adding source health", () => {
  const candidate = {
    id: "product.4",
    canonical_product_id: "canonical.4",
    resolution_status: "exact",
    why_included: ["intent_match"],
    decision: { decision_scope: "discovery_only", eligibility: "unknown" },
  };
  const payload = enrichSearchPayload(
    { exact_candidates: [candidate] },
    [{ id: "product.4", title: "상품", type: "bank-product" }],
    {},
    () => ({ source_ids: ["source.4"], freshness_status: "current" }),
  );

  assert.deepEqual(payload.exact_candidates[0], {
    ...candidate,
    source_ids: ["source.4"],
    freshness_status: "current",
  });
});

test("search enrichment preserves the last duplicate item", () => {
  const payload = enrichSearchPayload(
    { results: [{ id: "duplicate" }] },
    [
      { id: "duplicate", title: "old", type: "bank-product" },
      { id: "duplicate", title: "current", type: "bank-product" },
    ],
    {},
    (item) => ({ source_ids: [`source.${item.title}`], freshness_status: "current" }),
  );
  assert.deepEqual(payload.results[0].source_ids, ["source.current"]);
});

test("bank discovery resolves each hot-shard source set once", () => {
  const start = workerSource.indexOf("function discoveryPayload");
  const end = workerSource.indexOf("function scoreItem", start);
  const candidateSource = workerSource.slice(start, end);
  assert.match(candidateSource, /resolveSourceStatus\(\{ sourceIds,/);
  assert.match(candidateSource, /freshnessCache\.has\(key\)/);
  assert.doesNotMatch(candidateSource, /sourceHealth\(item, artifacts\)/);

  const hotBank = JSON.parse(readFileSync(resolve(root, "docs/opentax/finance-hot-search-index-2026-bank-products.json"), "utf8"));
  const sourceIdsColumn = hotBank.fields.indexOf("source_ids");
  assert.ok(sourceIdsColumn >= 0);
  assert.ok(hotBank.items.every((row) => Array.isArray(row[sourceIdsColumn]) && row[sourceIdsColumn].length > 0));
  assert.equal(hotBank.fields.includes("provenance"), false);
  assert.equal(hotBank.fields.includes("source_assertions"), false);
});

test("freshness-filtered search resolves each shared source set once", () => {
  assert.match(searchToolSource, /const freshnessCache = freshness_status === undefined \? undefined : new Map/);
  assert.match(searchToolSource, /matchesSearchFilters\(item, filters, artifacts, freshnessCache\)/);
  assert.match(workerSource, /sourceFreshnessStatus\(item, artifacts, freshnessCache\)/);

  const start = workerSource.indexOf("function matchesSearchFilters");
  const end = workerSource.indexOf("function isRecommendationSearchEligible", start);
  const filterSource = workerSource.slice(start, end);
  const cheapFilters = filterSource.indexOf("if (!(\n");
  const freshnessResolution = filterSource.indexOf("sourceFreshnessStatus(item, artifacts, freshnessCache)");
  assert.ok(cheapFilters >= 0);
  assert.ok(freshnessResolution > cheapFilters);
});

test("the runtime keeps each parsed search-shard tier bounded", () => {
  assert.match(workerSource, /const cachedLargeSearchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const cachedSmallSearchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const LARGE_SEARCH_SHARD_CACHE_LIMIT = 1/);
  assert.match(workerSource, /const SMALL_SEARCH_SHARD_CACHE_LIMIT = 6/);
  assert.match(workerSource, /const MAX_SEARCH_CACHE_BYTES = 12 \* 1024 \* 1024/);
  assert.match(workerSource, /cache\.delete\(key\);\s+cache\.set\(key, cached\)/);
  assert.match(workerSource, /while \(cache\.size >= cacheLimit\) \{[\s\S]*removeSearchCacheEntry\(cacheKind, oldest\)/);
  assert.doesNotMatch(workerSource, /PINNED_SEARCH_SHARD/);
});

test("search shard loads cannot accumulate unbounded in-flight work", () => {
  assert.match(workerSource, /const MAX_CONCURRENT_SEARCH_SHARD_LOADS = 2/);
  assert.match(workerSource, /const MAX_QUEUED_SEARCH_SHARD_LOADS = 8/);
  assert.match(workerSource, /const SEARCH_SHARD_SLOT_LEASE_MS = 15_000/);
  assert.match(workerSource, /const inFlightSearchShardStartedAt = new Map/);
  assert.match(workerSource, /const inFlightSearchShardControllers = new Map/);
  assert.match(workerSource, /pruneStaleSearchShardRequests\(\)/);
  assert.match(workerSource, /function acquireSearchShardSlot\(signal\?: AbortSignal\)/);
  assert.match(workerSource, /signal\?\.addEventListener\("abort", onAbort/);
  assert.match(workerSource, /inFlightSearchShardControllers\.get\(key\)\?\.abort\(\)/);
  assert.match(workerSource, /let releaseSlot: SearchShardSlotRelease \| undefined/);
  assert.match(workerSource, /releaseSlot\?\.\(\)/);
  assert.match(workerSource, /signal: controller\.signal/);
  assert.match(workerSource, /rawText = await fetchText\(url, MAX_SINGLE_SHARD_BYTES, requestController\.signal\)/);
  assert.match(workerSource, /createServer\(env, diagnostics, request\.signal\)/);
});

test("a replacement shard releases its cache tier before fetching", () => {
  const start = workerSource.indexOf("async function loadSearchShard");
  const end = workerSource.indexOf("const SEARCH_SHARD_BY_DOMAIN", start);
  const source = workerSource.slice(start, end);
  const pending = source.indexOf("const pending = inFlightSearchShards.get(pendingKey);");
  const eviction = source.indexOf("while (cache.size >= cacheLimit)", pending);
  const fetch = source.indexOf("rawText = await fetchText(url", pending);

  assert.ok(pending >= 0);
  assert.ok(eviction > pending);
  assert.ok(fetch > eviction);
  assert.doesNotMatch(source, /cached(?:Large|Small)SearchShards\.clear\(\)/);
});

test("hot shard parsing and scoring avoid repeated row allocations", () => {
  const parseStart = workerSource.indexOf("function parseSearchItems");
  const parseEnd = workerSource.indexOf("function parseTargetedExactItems", parseStart);
  const parseSource = workerSource.slice(parseStart, parseEnd);
  const scoreStart = workerSource.indexOf("function scoreItem");
  const scoreEnd = workerSource.indexOf("async function fetchJson", scoreStart);
  const scoreSource = workerSource.slice(scoreStart, scoreEnd);

  assert.match(parseSource, /attachHotSearchMetadata\(item as FinanceItem, vocabulary as string\[\], termIds as number\[\]\)/);
  assert.match(parseSource, /Object\.setPrototypeOf\(item, HOT_ITEM_PROTOTYPE\)/);
  assert.doesNotMatch(parseSource, /item\.search_text = termIds\.map/);
  assert.doesNotMatch(parseSource, /new Set\(termIds\.map/);
  assert.match(scoreSource, /const recommendationIntent = RECOMMENDATION_QUERY_RE\.test\(query\)/);
  assert.match(scoreSource, /const titleTokenCount = queryTokens\(normalizedTitle\)\.length/);
  assert.doesNotMatch(scoreSource, /const titleTokens = queryTokens\(normalizedTitle\)/);
  assert.doesNotMatch(scoreSource, /const aliases = .*\.map/);
});

test("query-bound hot shard hydration avoids materializing unrelated rows", () => {
  assert.match(workerSource, /function hotSearchRowIndexes\(value: unknown, query: string\)/);
  assert.match(workerSource, /parseSearchItems\(value: unknown, source: string, selectedRows\?: readonly number\[\]\)/);
  assert.match(workerSource, /const rowIndexes = query === undefined \? undefined : hotSearchRowIndexes\(payload, query\)/);
  assert.match(workerSource, /const partial = rowIndexes !== undefined/);
  assert.match(workerSource, /if \(!partial && requestGeneration !== "uninitialized"/);
  assert.match(workerSource, /loadSearchShard\(env, shard, diagnostics, query(?:, signal)?\)/);
});

test("support hot rows decode optional fields lazily and preserve fetch projection", () => {
  const start = workerSource.indexOf("function supportHotState");
  const end = workerSource.indexOf("function isFinanceItem", start);
  const source = workerSource.slice(start, end);
  assert.match(workerSource, /function supportHotTargetGroup\(item: FinanceItem\)/);
  assert.match(workerSource, /Boolean\(state & \(1 << 22\)\)/);
  assert.match(workerSource, /const categoryMask = state === undefined \? 0 : \(state >> 10\) & 0x07ff/);
  assert.match(workerSource, /Object\.setPrototypeOf\(item, HOT_ITEM_PROTOTYPE\)/);
  assert.match(workerSource, /function materializeSupportHotFields\(item: FinanceItem\)/);
  assert.match(workerSource, /if \(indexedItem\?\.type === "support-program"\) materializeSupportHotFields\(indexedItem\)/);
  assert.doesNotMatch(source, /SUPPORT_HOT_CATEGORY_BITS\.filter/);
  assert.doesNotMatch(source, /support_region\.split/);
  assert.match(workerSource, /function supportRegionValues\(item: FinanceItem\)/);
  assert.match(workerSource, /function hasSupportValue\(values: readonly string\[\] \| undefined, expected: string\)/);
  const intentStart = workerSource.indexOf("function matchesSupportIntent");
  const intentEnd = workerSource.indexOf("function supportMatchTier", intentStart);
  assert.doesNotMatch(workerSource.slice(intentStart, intentEnd), /new Set/);
  assert.match(workerSource, /supportRegionValues\(item\)\.some/);
  assert.match(searchToolSource, /searchIncludes\(item, token\)/);
});

test("completed JSON MCP requests release their transport state", () => {
  const start = workerSource.indexOf("export default");
  const source = workerSource.slice(start);
  const handler = source.indexOf("const handler = createMcpHandler");
  const response = source.indexOf("const response = await handler(request, env, ctx)", handler);
  const postGuard = source.indexOf('if (request.method === "POST")', response);
  const close = source.indexOf("await server.close()", postGuard);

  assert.ok(handler >= 0);
  assert.ok(response > handler);
  assert.ok(postGuard > response);
  assert.ok(close > postGuard);
});

test("shard diagnostics are opt-in and include bounded request metadata", () => {
  assert.match(workerSource, /request\.headers\.get\(DIAGNOSTICS_HEADER\) === "1"/);
  assert.match(workerSource, /cache_hits/);
  assert.match(workerSource, /raw_text_units/);
  assert.match(workerSource, /const diagnostics = requestDiagnostics\(request\)/);
  const start = workerSource.indexOf("function diagnosticsSummary");
  const end = workerSource.indexOf("function attachDiagnostics", start);
  assert.ok(start >= 0 && end > start);
  assert.match(workerSource.slice(start, end), /query: diagnostics\.query/);
  assert.match(workerSource.slice(start, end), /query_class: diagnostics\.query_class/);
  assert.doesNotMatch(workerSource.slice(start, end), /result_ids|source_ids/);
  for (const failureClass of ["CPU_LIMIT", "MEMORY_LIMIT", "UPSTREAM_5XX", "UPSTREAM_TIMEOUT", "REQUEST_TIMEOUT", "TRANSPORT_ABORT", "UNKNOWN_EDGE_FAILURE"]) assert.match(workerSource, new RegExp(`\\"${failureClass}\\"`));
});

test("exact title lookup is isolated and falls back when there is no exact match", () => {
  assert.match(workerSource, /const cachedExactFetchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const isExactFetchShard = \/\^exact-\//);
  assert.match(workerSource, /"ABL생명": \["ABL생명", "ABL"\]/);
  assert.match(workerSource, /requestedProductKind\(query\) \?\? \(query\.includes\("보험"\) \? "insurance" : undefined\)/);
  assert.match(workerSource, /requestedProductKind\(parts\.cleanQuery\) \?\? \(parts\.cleanQuery\.includes\("보험"\) \? "insurance" : undefined\)/);
  assert.match(workerSource, /if \(productKind !== "insurance" && item\.product_kind !== productKind\) return false;/);
  assert.match(workerSource, /const exactProductLookup = isNamedProductQuery\(query\)/);
  assert.match(workerSource, /const exactTypedLookup = \["account-product", "bank-product", "card-product", "insurance-product"\]\.includes\(type \?\? ""\)/);
  assert.match(workerSource, /queryTokens\(query\)\.length >= 3/);
  assert.match(workerSource, /const exactLookupRequested = exactProductLookup \|\| exactTypedLookup/);
  assert.match(workerSource, /if \(exactShards\?\.length && exactLookupRequested\)/);
  assert.match(workerSource, /loadTargetedExactShardItems\(env, exactShard, query, true(?:, signal)?\)/);
  assert.doesNotMatch(workerSource, /loadSearchShard\(env, exactShard\)/);
  assert.match(workerSource, /const exactMatches = exactItems\.filter/);
  assert.match(workerSource, /if \(exactMatches\.length\) return exactMatches;/);
  assert.match(workerSource, /const shardId = searchShardForQuery\(query, type, searchType, productKind\)/);
});

test("exact fetch reuses only the matching hot row before targeted decoding", () => {
  const start = workerSource.indexOf("async function loadExactFetchItems");
  const end = workerSource.indexOf("async function hydrateSearchItem", start);
  const source = workerSource.slice(start, end);
  const targetedStart = workerSource.indexOf("async function loadTargetedExactShardItems");
  const targetedEnd = workerSource.indexOf("async function loadSearchItemsForQuery", targetedStart);
  const targetedSource = workerSource.slice(targetedStart, targetedEnd);
  const exactCacheScan = source.indexOf("for (const cached of cachedExactFetchShards.values())");
  const hotCacheScan = source.indexOf("for (const cache of [cachedSmallSearchShards, cachedLargeSearchShards])");
  const shardHash = source.indexOf("const shardId = await exactFetchShardId(itemId)");

  assert.ok(exactCacheScan >= 0);
  assert.ok(hotCacheScan > exactCacheScan);
  assert.ok(hotCacheScan < shardHash);
  assert.match(source, /for \(const cached of cache\.values\(\)\)/);
  assert.match(source, /cached\.generation === manifestGeneration/);
  assert.match(source, /resolveCanonicalItemId\(itemId, cached\.items\)/);
  assert.match(source, /return cached\.items/);
  assert.match(source, /cached\.generation !== manifestGeneration/);
  assert.match(source, /cached\.items\.find\(\(candidate\) => candidate\.id === itemId\)/);
  assert.match(source, /if \(item\) return \[item\]/);
  assert.match(source, /loadTargetedExactShardItems\(env, shard, itemId(?:, false, signal)?\)/);
  assert.match(targetedSource, /generationCacheKey\(manifestGeneration, key\)/);
  assert.match(targetedSource, /const \{ payload, source \} = await pending/);
  assert.doesNotMatch(source, /cachedExactFetchShards\.set/);
});

test("repeated searches reuse deduplication and avoid full-shard temporary indexes", () => {
  assert.match(workerSource, /const dedupedProductItemsCache = new WeakMap/);
  assert.match(workerSource, /dedupedProductItemsCache\.set\(result, result\)/);
  assert.doesNotMatch(searchToolSource, /scoreCache/);
  assert.doesNotMatch(searchToolSource, /new Map\(items\.map/);
  assert.match(searchToolSource, /const neededIds = new Set<string>\(\)/);
});

test("search tokenizes the query once before scoring items", () => {
  const start = searchToolSource.indexOf("async ({ query");
  const end = searchToolSource.indexOf("return mcpResult(payload)", start);
  const source = searchToolSource.slice(start, end);
  const tokenization = source.indexOf("const scoreTokens = queryTokens(normalizedQuery)");
  const loop = source.indexOf("for (const item of items)");

  assert.ok(tokenization >= 0);
  assert.ok(loop > tokenization);
  assert.match(source, /scoreItem\(item, normalizedQuery, scoreTokens\)/);
  assert.doesNotMatch(source.slice(loop), /queryTokens\(normalizedQuery\)/);
});

test("support search keeps only a bounded ranked candidate buffer", () => {
  assert.match(searchToolSource, /let supportScoredCount = 0/);
  assert.match(searchToolSource, /scoredItems\.length >= maxResults \* 2/);
  assert.match(searchToolSource, /excludedSummary\.result_limit = supportScoredCount - rankedItems\.length/);
});
