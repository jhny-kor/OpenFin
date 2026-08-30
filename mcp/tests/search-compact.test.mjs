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

test("the runtime bounds parsed shards without reparsing every domain switch", () => {
  assert.match(workerSource, /const cachedLargeSearchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const cachedSmallSearchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const LARGE_SEARCH_SHARD_CACHE_LIMIT = 1/);
  assert.match(workerSource, /const SMALL_SEARCH_SHARD_CACHE_LIMIT = 1/);
  assert.match(workerSource, /cache\.delete\(key\);\s+cache\.set\(key, cached\)/);
  assert.match(workerSource, /while \(cache\.size >= cacheLimit\) cache\.delete/);
  assert.doesNotMatch(workerSource, /PINNED_SEARCH_SHARD/);
});

test("exact title lookup is isolated and falls back when there is no exact match", () => {
  assert.match(workerSource, /const cachedExactFetchShards = new Map<string, CachedSearchItems>\(\)/);
  assert.match(workerSource, /const isExactFetchShard = \/\^exact-\//);
  assert.match(workerSource, /"ABL생명": \["ABL생명", "ABL"\]/);
  assert.match(workerSource, /requestedProductKind\(query\) \?\? \(query\.includes\("보험"\) \? "insurance" : undefined\)/);
  assert.match(workerSource, /requestedProductKind\(parts\.cleanQuery\) \?\? \(parts\.cleanQuery\.includes\("보험"\) \? "insurance" : undefined\)/);
  assert.match(workerSource, /if \(productKind !== "insurance" && item\.product_kind !== productKind\) return false;/);
  assert.match(workerSource, /if \(exactShards\?\.length && isNamedProductQuery\(query\)\)/);
  assert.match(workerSource, /const exactMatches = exactItems\.filter/);
  assert.match(workerSource, /if \(exactMatches\.length\) return exactMatches;/);
  assert.match(workerSource, /const shardId = searchShardForQuery\(query, type, searchType, productKind\)/);
});

test("exact fetch reuses a current cached shard before loading another shard", () => {
  const start = workerSource.indexOf("async function loadExactFetchItems");
  const end = workerSource.indexOf("async function hydrateSearchItem", start);
  const source = workerSource.slice(start, end);
  const cacheScan = source.indexOf("for (const cached of cachedExactFetchShards.values())");
  const shardHash = source.indexOf("const shardId = await exactFetchShardId(itemId)");

  assert.ok(cacheScan >= 0);
  assert.ok(cacheScan < shardHash);
  assert.match(source, /cached\.generation === manifestGeneration/);
  assert.match(source, /resolveCanonicalItemId\(itemId, cached\.items\)/);
  assert.match(source, /return cached\.items/);
});

test("repeated searches reuse deduplication and avoid full-shard temporary indexes", () => {
  assert.match(workerSource, /const dedupedProductItemsCache = new WeakMap/);
  assert.match(workerSource, /dedupedProductItemsCache\.set\(result, result\)/);
  assert.doesNotMatch(searchToolSource, /scoreCache/);
  assert.doesNotMatch(searchToolSource, /new Map\(items\.map/);
  assert.match(searchToolSource, /const neededIds = new Set<string>\(\)/);
});

test("support search keeps only a bounded ranked candidate buffer", () => {
  assert.match(searchToolSource, /let supportScoredCount = 0/);
  assert.match(searchToolSource, /scoredItems\.length >= maxResults \* 2/);
  assert.match(searchToolSource, /excludedSummary\.result_limit = supportScoredCount - rankedItems\.length/);
});
