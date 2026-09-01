import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generationCacheKey, isCurrentGeneration, SingleFlight } from "./generation-cache";
import { CacheBudget } from "./cache-budget.ts";
import { resolveSourceStatus, sourceIdsForItem } from "./source-status";
import { evaluateReleaseGate } from "./release-gate";
import { evaluateEligibility, productDomain, recommendationFields } from "./recommendation/policy";
import { explainCandidate } from "./recommendation/explanation";
import { rankCandidate } from "./recommendation/ranking";
import { buildRecommendationCandidates } from "./tools/recommend";
import { PERSONAL_FINANCE_SNAPSHOT_SCHEMA, registerPersonalFinanceTools } from "./tools/personal-finance";
import { diversifyBroadResults, registerSearchTool } from "./tools/search";
import { registerDiscoverTool } from "./tools/discover";
import { registerRecommendTool } from "./tools/recommend-handler";
import { registerCompareTool } from "./tools/compare";
import { registerRecommendShadowTool } from "./tools/recommend-shadow";
import { registerRecommendOwnerPilotTool } from "./tools/recommend-owner-pilot";
import personalFinancePolicy from "../../contracts/personal-finance-policy.json" with { type: "json" };
import { decodeTargetedExactRows, exactFetchShardId, exportIdForItemId, needsSummaryDetailHydration, registerFetchTool } from "./tools/fetch";
import { registerExportsTool } from "./tools/exports";
import { livenessPayload, readinessPayload } from "./health";
import { asCapabilityStatus, asServiceAvailability } from "./capability-status.ts";
import { isVerifiedActive } from "./product-status";
import { calculateFinancialOutcome } from "./recommendation/outcome";
import { resolveAttainableRate } from "./recommendation/attainable-rate";
import { adaptDecisionOfferOptions, comparisonCandidateAdapter, recommendationCandidateAdapter } from "./decision/candidate-adapter.ts";
import { mergeOntologyExportItems, recombineOntologyExportPayloads } from "./export-shards.ts";

type FinanceItem = {
  id: string;
  title: string;
  type: string;
  description?: string;
  basis_year?: number;
  basis_date?: string;
  publisher?: string;
  url?: string;
  law_reference?: string;
  criteria?: unknown[];
  options?: unknown[];
  observed_at?: string;
  product_id?: string;
  provider_id?: string;
  field_assertions?: Record<string, unknown>[];
  benefits?: unknown[];
  parents?: string[];
  children?: string[];
  related?: string[];
  terms?: string[];
  deadlines?: string[];
  sources?: string[];
  tags?: string[];
  provider?: string;
  provider_code?: string;
  financial_sector?: string;
  product_code?: string;
  product_kind?: string;
  search_type?: string;
  product_status?: string;
  sales_status?: string;
  source_listing_status?: string;
  sales_verification_status?: string;
  sales_verified_at?: string;
  condition_verification_status?: string;
  source_freshness_status?: string;
  status?: string;
  status_reason?: string;
  recommendation_status?: string;
  recommendation_scope?: string;
  capabilities?: { comparison?: string; recommendation?: string };
  comparison_approved?: boolean;
  recommendation_approved?: boolean;
  candidate_id?: string;
  option_id?: string;
  offer_id?: string;
  evidence_gate?: Record<string, unknown>;
  catalog_recommendation_status?: string;
  catalog_recommendation_scope?: string;
  canonical_product_id?: string;
  resolved_canonical_product_id?: string;
  external_product_ids?: { namespace: string; value: string }[];
  provider_external_ids?: { namespace: string; value: string }[];
  provider_roles?: string[];
  source_records?: Record<string, unknown>[];
  preferred_source?: string;
  merged_fields?: Record<string, unknown>;
  field_provenance?: Record<string, string[]>;
  field_conflicts?: Record<string, unknown>;
  recommendation_model_version?: string;
  recommendation_exclusion_reasons?: string[];
  recommendation_basis_fields?: string[];
  comparison_basis_fields?: string[];
  verification_status?: string;
  quality_flags?: string[];
  verification_evidence?: Record<string, unknown>;
  missing_required_fields?: string[];
  missing_in_source_fields?: string[];
  unmapped_existing_fields?: string[];
  unverified_fields?: string[];
  discovery_evidence_fields?: string[];
  completeness_ratio?: number;
  source_completeness_ratio?: number;
  normalized_completeness_ratio?: number;
  verified_completeness_ratio?: number;
  required_field_count?: number;
  completed_field_count?: number;
  domain_gate_passed?: boolean;
  comparison_engine_gate_passed?: boolean;
  comparison_field_verification_status?: string;
  comparison_field_verification?: Record<string, unknown>;
  comparison_options?: unknown[];
  application_status?: string;
  is_currently_applicable?: boolean;
  application_open_from?: string;
  application_open_to?: string;
  application_window?: Record<string, unknown>;
  jurisdiction?: string;
  jurisdiction_code?: string;
  jurisdiction_aliases?: string[];
  parent_jurisdiction_code?: string;
  administrative_history?: unknown[];
  target_group?: string[];
  support_category?: string[];
  last_status_checked_at?: string;
  freshness_status?: string;
  collection_status?: string;
  last_verified_at?: string;
  last_source_checked_at?: string;
  last_reviewed_at?: string;
  public_recommendation_exclusion_reasons?: string[];
  comparison_exclusion_reasons?: string[];
  discovery_limitations?: string[];
  export_id?: string;
  search_text?: string;
  search_aliases?: string[];
  legacy_ids?: string[];
  aliases?: string[];
  source_urls?: string[];
  source_ids?: string[];
  source_basis_dates?: string[];
  source_checksum?: string;
  state?: string;
  collected_at?: string | null;
  normalized_at?: string | null;
  verified_at?: string | null;
  published_at?: string | null;
  source_assertions?: Record<string, unknown>[];
  source_assertion_ids?: string[];
  provenance?: Record<string, unknown>[];
  provenance_shard?: string;
  shard_id?: string;
  promotion_receipt?: Record<string, unknown>;
  risk_level?: string;
  structured_summary?: Record<string, unknown>;
  search_facets?: Record<string, unknown>;
  support_state?: number;
  support_region?: string;
};

type ManifestEntry = {
  id: string;
  domain: string;
  path: string;
  url?: string;
  web_url?: string;
  item_count?: number;
  row_count?: number;
  product_count?: number;
  description?: string;
  shards?: SearchIndexShard[];
  coverage?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  export_checksum?: string;
  content_checksum?: string;
  generated_at?: string;
};

type SearchIndexShard = {
  id: string;
  shard_id: string;
  path: string;
  url?: string;
  web_url?: string;
  item_count?: number;
  export_checksum?: string;
  content_checksum?: string;
};

type FinanceManifest = {
  version: string;
  basis_date: string;
  name: string;
  description?: string;
  service_availability?: string;
  release_status?: string;
  core_search_status?: string;
  platform_release_status?: string;
  comparison_release_status?: string;
  comparison_status?: string;
  recommendation_release_status?: string;
  recommendation_status?: string;
  capabilities?: { search?: string; discovery?: string; comparison?: string; shadow?: string; owner_pilot?: string; recommendation?: string };
  generation_id?: string;
  deployment_commit?: string;
  source_head_commit?: string;
  release_candidate_commit?: string;
  production_commit?: string;
  production_deployed_at?: string | null;
  source_freshness_status?: string;
  artifact_contract?: Record<string, unknown>;
  recommendation_enabled?: boolean;
  owner_pilot_approval_receipt?: Record<string, unknown> | null;
  blocking_reasons?: string[];
  live_regression_evidence?: ManifestEntry;
  _live_regression?: Record<string, unknown>;
  openfin_120_live_regression?: Record<string, unknown>;
  runtime_quality_metrics?: Record<string, unknown>;
  search_index?: ManifestEntry;
  detail_search_index?: ManifestEntry;
  hot_search_index?: ManifestEntry;
  exact_fetch_index?: ManifestEntry;
  quality_exports?: ManifestEntry[];
  source_registry?: ManifestEntry;
  source_status?: ManifestEntry;
  provenance_index?: ManifestEntry;
  provenance_coverage?: ManifestEntry;
  relationship_index?: ManifestEntry;
  decision_offers?: SearchIndexShard;
  domain_readiness?: Record<string, Record<string, unknown>>;
  degraded_domains?: string[];
  exports: ManifestEntry[];
  manifest_checksum?: string;
  _manifest_checksum_verified?: boolean;
};

type FinanceGraph = {
  version: string;
  basis_date: string;
  manifest: FinanceManifest;
  exports: ManifestEntry[];
  items: FinanceItem[];
};

type CachedGraph = {
  data: FinanceGraph;
  loadedAt: number;
  generation: string;
};

type SearchIndexFile = {
  readonly version: string;
  readonly basis_date: string;
  readonly item_count?: number;
  readonly export_checksum?: string;
  readonly content_checksum?: string;
  readonly items?: readonly FinanceItem[];
  readonly shards?: readonly SearchIndexShard[];
};

type CachedSearchIndexMetadata = {
  readonly data: SearchIndexFile;
  readonly loadedAt: number;
  readonly generation: string;
};

type CachedSearchItems = {
  readonly items: readonly FinanceItem[];
  readonly payload?: unknown;
  readonly loadedAt: number;
  readonly generation: string;
  readonly bytes?: number;
  readonly decodedRows?: number;
};

type LoadedSearchShard = {
  readonly payload: unknown;
  readonly source: string;
  readonly rawBytes: number;
  readonly rawTextUnits: number;
  readonly fetchMs: number;
  readonly checksumMs: number;
  readonly parseMs: number;
};

type FinanceArtifacts = {
  source_registry?: unknown;
  source_status?: unknown;
  provenance_index?: unknown;
  provenance_coverage?: unknown;
  relationship_index?: unknown;
};

type FinanceArtifactKey = keyof FinanceArtifacts;
type CachedFinanceArtifact = { data: unknown; loadedAt: number; generation: string };

type SearchFilters = {
  readonly searchType?: string;
  readonly productKind?: string;
  readonly recommendationStatus?: string;
  readonly recommendationScope?: string;
  readonly salesStatus?: string;
  readonly applicationStatus?: string;
  readonly provider?: string;
  readonly region?: string;
  readonly freshnessStatus?: string;
};

// Keep deployment manifest changes visible well before the five-minute public
// freshness promise; a short metadata cache also prevents Pages/MCP workflow
// races from pinning a Worker isolate to the previous generation.
const CACHE_TTL_MS = 30 * 1000;
const DEFAULT_FINANCE_MANIFEST_URL =
  "https://jhny-kor.github.io/OpenFin/opentax/finance-ontology-manifest.json";
const DEFAULT_FINANCE_WEB_BASE_URL = "https://jhny-kor.github.io/OpenFin/opentax/";
const OPENAI_APPS_CHALLENGE_PATH = "/.well-known/openai-apps-challenge";
const RATE_QUERY_RE = /(금리|최고금리|중도해지|정기예금|적금|대출|개월)/i;
const PROTECTION_QUERY_RE = /(예금자보호|보호대상|보호상품|kdic|보호)/i;
const INACTIVE_QUERY_RE = /(종료|판매중단|중단|만료|마감|지난|unknown|closed|ended|reference|보류|불확실)/i;
const RECOMMENDATION_QUERY_RE = /(추천|골라|맞는\s*상품|recommend)/i;
const DISCOVERY_ACTION_RE = /(추천|알려줘|골라줘|찾아줘|괜찮은|좋은|후보|비교|순위|해줘|해주세요)/i;
const DISCOVERY_QUERY_RE = /(추천|알려줘|골라줘|찾아줘|괜찮은|좋은|후보|순위|해줘|해주세요)/i;
const DISCOVERY_DOMAIN_TOKENS = {
  card: ["카드", "체크카드", "신용카드", "마일리지", "구독"],
  loan: ["대출", "신용대출", "전세대출", "월세대출"],
  insurance: ["보험", "실손", "실비", "암보험", "비갱신"],
  deposit: ["예금", "정기예금"],
  saving: ["적금", "자유적금"],
} as const;
type DiscoveryDomain = keyof typeof DISCOVERY_DOMAIN_TOKENS;
const GENERIC_SEARCH_TYPES = new Set(["category", "term", "domain", "source"]);
const TAX_DECISION_TYPES = new Set(["tax-credit", "deduction"]);
const READ_ONLY_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
const ENABLE_CARD_DISCOVERY = true;
const ENABLE_LOAN_DISCOVERY = true;
const ENABLE_INSURANCE_DISCOVERY = true;
const EXCLUDED_SAMPLE_LIMIT = 10;
const QUERY_PARSER_VERSION = "openfin-query-parser-v1.3.0";
const FIELD_EXTRACTOR_VERSION = "openfin-field-extractor-v1.1.0";
const DISCOVERY_ENGINE_VERSION = "openfin-discovery-v1.3.0";
const COMPARISON_ENGINE_VERSION = "openfin-comparison-v1.1.0";
const PERSONAL_FINANCE_POLICY_VERSION = personalFinancePolicy.version;
const ADVICE_POLICY_VERSION = "openfin-advice-policy-v1.0.0";
const MINIMUM_EMERGENCY_FUND_MONTHS = personalFinancePolicy.thresholds.emergency_fund_months;
const HIGH_INTEREST_DEBT_RATE_PERCENT = personalFinancePolicy.thresholds.high_interest_debt_rate_percent;
const SENSITIVE_KEY_TOKENS = new Set([
  "accountnumber", "bankaccount", "cardnumber", "creditcardnumber", "residentregistrationnumber",
  "rrn", "password", "passcode", "pin", "certificate", "privatekey", "apikey", "apitoken",
  "accesstoken", "refreshtoken", "secret", "ssn",
]);
const PROMPT_INJECTION_TOKENS = new Set(["무시", "이전", "지시", "시스템", "프롬프트", "명령", "규칙", "ignore", "previous", "instruction", "instructions", "system", "prompt", "rule", "rules"]);

let cachedGraph: CachedGraph | undefined;
let cachedManifest: { data: FinanceManifest; loadedAt: number } | undefined;
const manifestSingleFlight = new SingleFlight<FinanceManifest>();
let manifestGeneration = "uninitialized";
let cachedSearchIndexMetadata: CachedSearchIndexMetadata | undefined;
let cachedSearchItems: CachedSearchItems | undefined;
const cachedLargeSearchShards = new Map<string, CachedSearchItems>();
const cachedSmallSearchShards = new Map<string, CachedSearchItems>();
const cachedExactFetchShards = new Map<string, CachedSearchItems>();
// Retain validated columnar payloads so query-bound hydration does not refetch
// and reparse the same hot shard; the shared byte/row budget bounds retention.
const cachedHotSearchPayloads = new Map<string, CachedSearchItems>();
// Share one fetch/parse per generation+shard. Selection remains request-local,
// so concurrent queries cannot reuse another query's result rows.
const inFlightSearchShards = new Map<string, Promise<LoadedSearchShard>>();
const inFlightSearchShardStartedAt = new Map<string, number>();
const inFlightSearchShardControllers = new Map<string, AbortController>();
const inFlightSearchShardConsumers = new Map<string, number>();
const inFlightExactFetchShards = new Map<string, Promise<{ payload: unknown; source: string }>>();
const dedupedProductItemsCache = new WeakMap<readonly FinanceItem[], readonly FinanceItem[]>();
// Byte ceilings are primary; count limits remain a cheap secondary guard.
const MAX_TOTAL_CACHE_BYTES = 16 * 1024 * 1024;
const MAX_SEARCH_CACHE_BYTES = 12 * 1024 * 1024;
const MAX_ARTIFACT_CACHE_BYTES = 4 * 1024 * 1024;
const MAX_SINGLE_SHARD_BYTES = 4 * 1024 * 1024;
const MAX_DECODED_ROWS = 12_000;
const MAX_INFLIGHT_BYTES = 8 * 1024 * 1024;
// ponytail: retain only the repeatedly queried support and bank payloads; the
// remaining hot shards stay request-local until a compact selector index exists.
const MAX_CACHED_SUPPORT_PAYLOAD_BYTES = 3 * 1024 * 1024;
const searchCacheBudget = new CacheBudget({ maxTotalBytes: MAX_SEARCH_CACHE_BYTES, maxSingleEntryBytes: MAX_SINGLE_SHARD_BYTES, maxDecodedRows: MAX_DECODED_ROWS, maxInflightBytes: MAX_INFLIGHT_BYTES });
const artifactCacheBudget = new CacheBudget({ maxTotalBytes: MAX_ARTIFACT_CACHE_BYTES, maxSingleEntryBytes: MAX_ARTIFACT_CACHE_BYTES, maxDecodedRows: MAX_DECODED_ROWS, maxInflightBytes: MAX_INFLIGHT_BYTES });
// ponytail: entry count is only a secondary safety ceiling; byte/row budgets decide eviction.
const LARGE_SEARCH_SHARD_ITEM_COUNT = 2_000;
const MAX_SEARCH_CACHE_ENTRIES = 32;
const MAX_CONCURRENT_SEARCH_SHARD_LOADS = 2;
const MAX_QUEUED_SEARCH_SHARD_LOADS = 8;
const SEARCH_SHARD_SLOT_WAIT_MS = 10_000;
const SEARCH_SHARD_SLOT_LEASE_MS = 15_000;
const FINANCE_FETCH_TIMEOUT_MS = 10_000;
let activeSearchShardLoads = 0;
type SearchShardSlotRelease = () => void;
type SearchShardSlotWaiter = {
  resolve: (release: SearchShardSlotRelease) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  cleanup: () => void;
};
const queuedSearchShardLoads: SearchShardSlotWaiter[] = [];
type SearchShardCacheKind = "large" | "small" | "exact" | "payload";
type SearchShardDiagnostic = {
  shard_id: string;
  cache_kind: SearchShardCacheKind;
  item_count: number;
  raw_bytes: number;
  decoded_rows: number;
  cache_hit: boolean;
  cache_miss: boolean;
  raw_text_units: number;
  fetch_ms: number;
  checksum_ms: number;
  parse_ms: number;
  hydrate_ms: number;
  total_ms: number;
  http_status?: number;
  failure_class?: string;
  error?: string;
};
type RequestDiagnostics = {
  started_at: number;
  request_id: string | null;
  case_id: string | null;
  colo: string | null;
  tool: string | null;
  query: string | null;
  query_class: string | null;
  cache_bytes_before: number;
  cache_hits: number;
  cache_misses: number;
  in_flight_reuses: number;
  evictions: number;
  budget_exceeded: number;
  shard_loads: SearchShardDiagnostic[];
  failure_class?: string;
};
const DIAGNOSTICS_HEADER = "x-openfin-diagnostics";
const DIAGNOSTICS_MAX_SHARDS = 16;
const cachedFinanceArtifacts = new Map<string, CachedFinanceArtifact>();
const inFlightFinanceArtifacts = new Map<string, Promise<unknown>>();
const financeArtifactErrors = new Map<string, Record<string, unknown>>();

function diagnosticNow(): number {
  return performance.now();
}

function requestDiagnostics(request: Request): RequestDiagnostics | undefined {
  const header = (name: string): string | null => request.headers.get(name)?.slice(0, 256) ?? null;
  const diagnosticQuery = (value: string | null): string | null => {
    if (value === null) return null;
    try { return decodeURIComponent(value); } catch { return value; }
  };
  const colo = (request as Request & { cf?: { colo?: unknown } }).cf?.colo;
  return request.headers.get(DIAGNOSTICS_HEADER) === "1"
    ? { started_at: diagnosticNow(), request_id: header("x-openfin-request-id"), case_id: header("x-openfin-case-id"), colo: typeof colo === "string" ? colo.slice(0, 64) : null, tool: header("x-openfin-tool"), query: diagnosticQuery(header("x-openfin-query")), query_class: header("x-openfin-query-class"), cache_bytes_before: searchCacheBudget.snapshot().bytes, cache_hits: 0, cache_misses: 0, in_flight_reuses: 0, evictions: 0, budget_exceeded: 0, shard_loads: [] }
    : undefined;
}

function roundDiagnosticMs(value: number): number {
  return Math.round(value * 100) / 100;
}

function classifyRuntimeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/1102|cpu(?: time)? limit|exceeded.*cpu/i.test(message)) return "CPU_LIMIT";
  if (/memory|heap|out of memory|resource limit/i.test(message)) return "MEMORY_LIMIT";
  if (/request body timeout|response body timeout|request timeout|timeout after/i.test(message)) return "REQUEST_TIMEOUT";
  if (/timeout|timed out/i.test(message)) return "UPSTREAM_TIMEOUT";
  if (/abort|aborted/i.test(message)) return "TRANSPORT_ABORT";
  if (/\b5\d{2}\b/.test(message)) return "UPSTREAM_5XX";
  return "UNKNOWN_EDGE_FAILURE";
}

function diagnosticsSummary(diagnostics: RequestDiagnostics, response: Response, env: Env): Record<string, unknown> {
  const searchBudget = searchCacheBudget.snapshot();
  const artifactBudget = artifactCacheBudget.snapshot();
  const shardIds = diagnostics.shard_loads.map((entry) => entry.shard_id);
  const total = (field: "raw_bytes" | "decoded_rows" | "fetch_ms" | "checksum_ms" | "parse_ms" | "hydrate_ms") => diagnostics.shard_loads.reduce((sum, entry) => sum + entry[field], 0);
  const totalMs = roundDiagnosticMs(diagnosticNow() - diagnostics.started_at);
  return {
    request_id: diagnostics.request_id,
    case_id: diagnostics.case_id,
    cf_ray: response.headers.get("cf-ray"),
    colo: diagnostics.colo,
    deployment_commit: env.DEPLOYMENT_COMMIT ?? "unknown",
    generation_id: env.ARTIFACT_GENERATION ?? (manifestGeneration === "uninitialized" ? null : manifestGeneration),
    tool: diagnostics.tool,
    query: diagnostics.query,
    query_class: diagnostics.query_class,
    http_status: response.status,
    request_ms: totalMs,
    handler_ms: totalMs,
    total_ms: totalMs,
    cache_hits: diagnostics.cache_hits,
    cache_misses: diagnostics.cache_misses,
    cache_hit: diagnostics.cache_hits > 0,
    cache_miss: diagnostics.cache_misses > 0,
    in_flight_reuses: diagnostics.in_flight_reuses,
    evictions: diagnostics.evictions,
    cache_eviction: diagnostics.evictions > 0,
    cache_budget_exceeded: diagnostics.budget_exceeded,
    cache_bytes_before: diagnostics.cache_bytes_before,
    cache_bytes_after: searchBudget.bytes + artifactBudget.bytes,
    raw_bytes: total("raw_bytes"),
    decoded_rows: total("decoded_rows"),
    fetch_ms: roundDiagnosticMs(total("fetch_ms")),
    checksum_ms: roundDiagnosticMs(total("checksum_ms")),
    parse_ms: roundDiagnosticMs(total("parse_ms")),
    hydrate_ms: roundDiagnosticMs(total("hydrate_ms")),
    shard_ids: shardIds,
    subrequest_count: shardIds.length,
    failure_class: diagnostics.failure_class ?? null,
    cache_budget: {
      search: searchBudget,
      artifact: artifactBudget,
      max_total_bytes: MAX_TOTAL_CACHE_BYTES,
      max_search_bytes: MAX_SEARCH_CACHE_BYTES,
      max_artifact_bytes: MAX_ARTIFACT_CACHE_BYTES,
      max_single_shard_bytes: MAX_SINGLE_SHARD_BYTES,
      max_decoded_rows: MAX_DECODED_ROWS,
      max_inflight_bytes: MAX_INFLIGHT_BYTES,
    },
    cache_sizes: {
      large: cachedLargeSearchShards.size,
      small: cachedSmallSearchShards.size,
      exact: cachedExactFetchShards.size,
      payload: cachedHotSearchPayloads.size,
      in_flight: inFlightSearchShards.size,
    },
    shard_load_slots: {
      active: activeSearchShardLoads,
      queued: queuedSearchShardLoads.length,
      max_concurrent: MAX_CONCURRENT_SEARCH_SHARD_LOADS,
    },
    shard_loads: diagnostics.shard_loads,
  };
}

function searchCacheBudgetKey(kind: SearchShardCacheKind, key: string): string {
  return `${kind}:${key}`;
}

function searchCacheForKind(kind: SearchShardCacheKind): Map<string, CachedSearchItems> {
  if (kind === "large") return cachedLargeSearchShards;
  if (kind === "small") return cachedSmallSearchShards;
  if (kind === "exact") return cachedExactFetchShards;
  return cachedHotSearchPayloads;
}

function removeSearchCacheEntry(kind: SearchShardCacheKind, key: string): boolean {
  searchCacheBudget.remove(searchCacheBudgetKey(kind, key));
  return searchCacheForKind(kind).delete(key);
}

function clearSearchCaches(): void {
  cachedLargeSearchShards.clear();
  cachedSmallSearchShards.clear();
  cachedExactFetchShards.clear();
  cachedHotSearchPayloads.clear();
  searchCacheBudget.clear();
}

function releaseSearchShardSlot(): SearchShardSlotRelease {
  let released = false;
  const leaseTimer = setTimeout(() => {
    if (released) return;
    released = true;
    activeSearchShardLoads = Math.max(0, activeSearchShardLoads - 1);
    pumpSearchShardSlots();
  }, SEARCH_SHARD_SLOT_LEASE_MS);
  return () => {
    if (released) return;
    released = true;
    clearTimeout(leaseTimer);
    activeSearchShardLoads = Math.max(0, activeSearchShardLoads - 1);
    pumpSearchShardSlots();
  };
}

function pumpSearchShardSlots(): void {
  while (activeSearchShardLoads < MAX_CONCURRENT_SEARCH_SHARD_LOADS && queuedSearchShardLoads.length) {
    const waiter = queuedSearchShardLoads.shift();
    if (!waiter) break;
    clearTimeout(waiter.timer);
    activeSearchShardLoads += 1;
    waiter.resolve(releaseSearchShardSlot());
  }
}

function abortError(message = "search-index shard load aborted"): Error {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function acquireSearchShardSlot(signal?: AbortSignal): Promise<SearchShardSlotRelease> {
  if (signal?.aborted) return Promise.reject(abortError());
  if (activeSearchShardLoads < MAX_CONCURRENT_SEARCH_SHARD_LOADS) {
    activeSearchShardLoads += 1;
    return Promise.resolve(releaseSearchShardSlot());
  }
  if (queuedSearchShardLoads.length >= MAX_QUEUED_SEARCH_SHARD_LOADS) {
    return Promise.reject(new SearchIndexContractError("search-index shard concurrency queue is full"));
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const waiter = {} as SearchShardSlotWaiter;
    waiter.cleanup = () => {
      clearTimeout(waiter.timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const settle = (settlePromise: () => void) => {
      if (settled) return;
      settled = true;
      waiter.cleanup();
      settlePromise();
    };
    const onAbort = () => {
      const index = queuedSearchShardLoads.indexOf(waiter);
      if (index >= 0) queuedSearchShardLoads.splice(index, 1);
      settle(() => reject(abortError()));
    };
    waiter.resolve = (release) => settle(() => resolve(release));
    waiter.reject = (error) => settle(() => reject(error));
    waiter.timer = setTimeout(() => {
      const index = queuedSearchShardLoads.indexOf(waiter);
      if (index >= 0) queuedSearchShardLoads.splice(index, 1);
      waiter.reject(new SearchIndexContractError("search-index shard concurrency wait timed out"));
    }, SEARCH_SHARD_SLOT_WAIT_MS);
    queuedSearchShardLoads.push(waiter);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function pruneStaleSearchShardRequests(now = Date.now()): void {
  for (const [key, startedAt] of inFlightSearchShardStartedAt) {
    if (now - startedAt <= SEARCH_SHARD_SLOT_LEASE_MS) continue;
    inFlightSearchShardControllers.get(key)?.abort();
    inFlightSearchShardStartedAt.delete(key);
    inFlightSearchShards.delete(key);
    inFlightSearchShardControllers.delete(key);
    inFlightSearchShardConsumers.delete(key);
    searchCacheBudget.releaseInflight(key);
  }
}

function retainSearchShardConsumer(key: string): void {
  inFlightSearchShardConsumers.set(key, (inFlightSearchShardConsumers.get(key) ?? 0) + 1);
}

function releaseSearchShardConsumer(key: string): void {
  const consumers = inFlightSearchShardConsumers.get(key);
  if (consumers === undefined) return;
  if (consumers <= 1) {
    inFlightSearchShardConsumers.delete(key);
    inFlightSearchShardControllers.get(key)?.abort();
    return;
  }
  inFlightSearchShardConsumers.set(key, consumers - 1);
}

function removeBudgetEvictions(evicted: readonly string[], diagnostics?: RequestDiagnostics): void {
  for (const value of evicted) {
    const separator = value.indexOf(":");
    if (separator <= 0) continue;
    const kind = value.slice(0, separator) as SearchShardCacheKind;
    const key = value.slice(separator + 1);
    if (removeSearchCacheEntry(kind, key) && diagnostics) diagnostics.evictions += 1;
  }
}

function recordShardDiagnostic(diagnostics: RequestDiagnostics | undefined, entry: SearchShardDiagnostic): void {
  if (diagnostics && diagnostics.shard_loads.length < DIAGNOSTICS_MAX_SHARDS) diagnostics.shard_loads.push(entry);
}

function attachDiagnostics(response: Response, diagnostics: RequestDiagnostics, env: Env): Response {
  if (response.status >= 500 && !diagnostics.failure_class) diagnostics.failure_class = classifyRuntimeFailure(`HTTP ${response.status}`);
  const summary = diagnosticsSummary(diagnostics, response, env);
  const headers = new Headers(response.headers);
  headers.set(DIAGNOSTICS_HEADER, JSON.stringify(summary));
  headers.set("server-timing", `openfin;dur=${String(summary.request_ms)}`);
  console.log(`[openfin-diagnostics] ${JSON.stringify(summary)}`);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function jsonText(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function normalizeQuery(value: string): string {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function queryTokens(query: string): string[] {
  return normalizeQuery(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function financeManifestUrl(env: Env): string {
  return env.FINANCE_MANIFEST_URL || DEFAULT_FINANCE_MANIFEST_URL;
}

function financeWebBaseUrl(env: Env): string {
  return env.FINANCE_WEB_BASE_URL || DEFAULT_FINANCE_WEB_BASE_URL;
}

function itemUrl(env: Env, itemId: string): string {
  return `${financeWebBaseUrl(env).replace(/\/?$/, "/")}#${encodeURIComponent(itemId)}`;
}

// type=tax must also match tax decision types (tax-credit, deduction, ...) so
// typed queries like "연말정산 의료비 세액공제" do not fall through to unrelated tax nodes.
const SEARCH_TYPE_GROUPS: Record<string, Set<string>> = {
  tax: new Set([
    "tax",
    "tax-credit",
    "tax-reduction",
    "deduction",
    "corporate-tax-support",
    "official-tax-item",
    "filing",
    "deadline",
    "required-document",
    "eligibility-rule",
  ]),
  "tax-support": new Set(["required-document"]),
  "tax-rule": new Set(["eligibility-rule"]),
};

const TAX_INTENT_RE = /(세액공제|소득공제|연말정산|원천징수|종합소득세|부가가치세|법인세|교육비|의료비|월세|연금계좌)/;
const SUPPORT_INTENT_RE = /(지원|보조금|신청|청년.*월세|월세.*청년)/;
const SUPPORT_REGION_TOKENS = ["전남광주통합특별시", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"] as const;

function inferredTypesForQuery(query: string): Set<string> | null {
  if (SUPPORT_INTENT_RE.test(query)) {
    return new Set(["support-program"]);
  }
  if (TAX_INTENT_RE.test(query)) {
    return SEARCH_TYPE_GROUPS.tax;
  }
  if (query.includes("보험")) {
    return new Set(["insurance-product"]);
  }
  if (["카드", "체크카드", "신용카드"].some((token) => query.includes(token))) {
    return new Set(["card-product"]);
  }
  return null;
}

function supportRegionForQuery(query: string): string | undefined {
  return SUPPORT_REGION_TOKENS.find((region) => query.includes(normalizeQuery(region)));
}

function canonicalSupportRegion(region: string | undefined): string | undefined {
  if (!region) return undefined;
  const normalized = normalizeQuery(region);
  const aliases: Record<string, string> = {
    "서울": "서울특별시",
    "부산": "부산광역시",
    "대구": "대구광역시",
    "인천": "인천광역시",
    "광주": "광주광역시",
    "대전": "대전광역시",
    "울산": "울산광역시",
    "세종": "세종특별자치시",
    "경기": "경기도",
    "강원": "강원특별자치도",
    "충북": "충청북도",
    "충남": "충청남도",
    "전북": "전북특별자치도",
    "전남": "전라남도",
    "경북": "경상북도",
    "경남": "경상남도",
    "제주": "제주특별자치도",
  };
  return aliases[normalized] ?? region;
}

function matchesSupportRegion(item: FinanceItem, region: string | undefined): boolean {
  if (item.type !== "support-program" || !region) return true;
  return supportRegionValues(item).some((value) => normalizeQuery(value).includes(region));
}

function supportRegionValues(item: FinanceItem): readonly string[] {
  if (typeof item.support_region === "string") return item.support_region.split("\u001f").filter(Boolean);
  return [item.jurisdiction, item.jurisdiction_code, item.parent_jurisdiction_code, ...(item.jurisdiction_aliases ?? [])]
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function hasSupportValue(values: readonly string[] | undefined, expected: string): boolean {
  return values?.some((value) => value === expected || normalizeQuery(value) === expected) ?? false;
}

function matchesSupportIntent(item: FinanceItem, query: string): boolean {
  if (item.type !== "support-program" || !SUPPORT_INTENT_RE.test(query)) return true;
  const requiresYouth = query.includes("청년");
  const requiresRent = /월세/.test(query);
  const requiresHousing = /(월세|주거|전세|임대|보증금|입주|공급|수선)/.test(query);
  const requiresEmployment = /(취업|일자리|구직)/.test(query);
  const requiresEducation = /교육/.test(query);
  const requiresHealth = /(의료|건강)/.test(query);
  const requiresCulture = /(문화|예술)/.test(query);
  const requiresBusiness = /(창업|사업|소상공인)/.test(query);
  const requiresCurrentAvailability = /(지원|보조금|신청|월세|주거)/.test(query);
  const currentlyAvailable = !requiresCurrentAvailability || item.is_currently_applicable === true || ["open", "always_open"].includes(item.application_status ?? "");
  const categories = requiresRent || requiresHousing || requiresEmployment || requiresEducation || requiresHealth || requiresCulture || requiresBusiness
    ? item.support_category
    : undefined;
  return (!requiresYouth || hasSupportValue(item.target_group, "youth"))
    && (!requiresRent || hasSupportValue(categories, "housing") || hasSupportValue(categories, "rent"))
    && (!requiresHousing || hasSupportValue(categories, "housing") || hasSupportValue(categories, "rent") || hasSupportValue(categories, "lease_deposit") || hasSupportValue(categories, "deposit_guarantee") || hasSupportValue(categories, "housing_supply") || hasSupportValue(categories, "housing_repair"))
    && (!requiresEmployment || hasSupportValue(categories, "employment"))
    && (!requiresEducation || hasSupportValue(categories, "education"))
    && (!requiresHealth || hasSupportValue(categories, "health"))
    && (!requiresCulture || hasSupportValue(categories, "culture"))
    && (!requiresBusiness || hasSupportValue(categories, "business"))
    && (!requiresCurrentAvailability || currentlyAvailable);
}

function supportMatchTier(item: FinanceItem, query: string): "exact" | "partial" | "related" | undefined {
  if (item.type !== "support-program" || !SUPPORT_INTENT_RE.test(query)) return undefined;
  const youthRequested = query.includes("청년");
  const youthMatched = !youthRequested || hasSupportValue(item.target_group, "youth");
  const rentRequested = query.includes("월세");
  const rentMatched = hasSupportValue(item.support_category, "rent") || searchTextIncludes(item, "월세");
  const housingMatched = hasSupportValue(item.support_category, "housing") || hasSupportValue(item.support_category, "lease_deposit") || hasSupportValue(item.support_category, "deposit_guarantee") || hasSupportValue(item.support_category, "housing_supply") || hasSupportValue(item.support_category, "housing_repair");
  if (youthMatched && (!rentRequested || rentMatched)) return "exact";
  if (youthMatched && housingMatched) return "partial";
  return "related";
}

function supportParsedQuery(query: string, explicitRegion: string | undefined): Record<string, unknown> {
  const normalized = normalizeQuery(query);
  const categories = [
    ...(normalized.includes("월세") ? ["housing", "rent"] : []),
    ...(normalized.includes("전세") || normalized.includes("보증금") ? ["lease_deposit", "deposit_guarantee"] : []),
    ...(normalized.includes("취업") || normalized.includes("일자리") || normalized.includes("구직") ? ["employment"] : []),
    ...(normalized.includes("교육") ? ["education"] : []),
    ...(normalized.includes("의료") || normalized.includes("건강") ? ["health"] : []),
    ...(normalized.includes("문화") || normalized.includes("예술") ? ["culture"] : []),
    ...(normalized.includes("창업") || normalized.includes("사업") || normalized.includes("소상공인") ? ["business"] : []),
  ];
  return {
    original_query: query,
    intent: SUPPORT_INTENT_RE.test(normalized) ? "find-support" : "search",
    region: canonicalSupportRegion(explicitRegion ?? supportRegionForQuery(normalized)),
    target_groups: normalized.includes("청년") ? ["youth"] : [],
    support_categories: [...new Set(categories)],
  };
}

function inferredSearchTypeForQuery(query: string): string | undefined {
  if (TAX_INTENT_RE.test(query)) {
    return undefined;
  }
  if (query.includes("정기예금") || query.includes("예금")) {
    return "deposit";
  }
  if (query.includes("적금")) {
    return "saving";
  }
  if (query.includes("대출")) {
    return "loan";
  }
  return undefined;
}

function itemSearchText(item: FinanceItem): string {
  const ownSearchText = Object.getOwnPropertyDescriptor(item, "search_text")?.value;
  if (typeof ownSearchText === "string" && ownSearchText) return ownSearchText;
  const hotText = hotSearchText(item);
  if (hotText) return hotText;
  return [
    item.id,
    item.title,
    item.type,
    item.description,
    item.law_reference,
    item.url,
    item.publisher,
    item.provider,
    item.provider_code,
    item.financial_sector,
    item.product_code,
    item.product_kind,
    item.search_type,
    item.product_status,
    item.sales_status,
    item.status,
    item.status_reason,
    item.recommendation_status,
    item.recommendation_scope,
    item.application_status,
    item.application_open_from,
    item.application_open_to,
    item.jurisdiction,
    item.jurisdiction_code,
    ...(item.jurisdiction_aliases ?? []),
    item.freshness_status,
    item.collection_status,
    JSON.stringify(item.structured_summary ?? {}),
    JSON.stringify(item.search_facets ?? {}),
    structuredSearchText(item.criteria),
    structuredSearchText(item.options),
    structuredSearchText(item.benefits),
    ...(item.tags ?? []),
    ...(item.sources ?? []),
    ...(item.source_urls ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");
}

function structuredSearchText(value: unknown[] | undefined): string {
  return (value ?? []).map((entry) => JSON.stringify(entry)).join(" ");
}

function sourceFreshnessStatus(item: FinanceItem, artifacts: FinanceArtifacts, cache?: Map<string, string | null>): string | null {
  if ((item.provenance?.length ?? 0) > 0 || (item.source_assertions?.length ?? 0) > 0) {
    return (sourceHealth(item, artifacts).freshness_status as string | null | undefined) ?? null;
  }
  const sourceIds = [...new Set([...(item.sources ?? []), ...(item.source_ids ?? [])])];
  if (!sourceIds.length) {
    return (sourceHealth(item, artifacts).freshness_status as string | null | undefined) ?? null;
  }
  const cacheKey = JSON.stringify([sourceIds, item.source_urls?.length ?? 0, item.freshness_status ?? item.source_freshness_status ?? ""]);
  if (cache?.has(cacheKey)) return cache.get(cacheKey) ?? null;
  const freshness = resolveSourceStatus({
    sourceIds,
    sourceUrlCount: item.source_urls?.length ?? 0,
    sourceStatusArtifact: artifacts.source_status,
    sourceRegistryArtifact: artifacts.source_registry,
    staticFreshness: item.freshness_status ?? item.source_freshness_status,
  }).freshnessStatus;
  cache?.set(cacheKey, freshness);
  return freshness;
}

function matchesRecommendationDomain(item: FinanceItem, query: string, searchType: string): boolean {
  if (query.includes("보험")) {
    return item.type === "insurance-product";
  }
  if (["카드", "체크카드", "신용카드"].some((token) => query.includes(token))) {
    return item.type === "card-product";
  }
  if (query.includes("대출")) {
    return searchType === "loan";
  }
  if (query.includes("정기예금") || query.includes("예금")) {
    return searchType === "deposit";
  }
  if (query.includes("적금")) {
    return searchType === "saving";
  }
  return true;
}

function matchesSearchFilters(item: FinanceItem, filters: SearchFilters, artifacts?: FinanceArtifacts, freshnessCache?: Map<string, string | null>): boolean {
  const equals = (value: string | undefined, expected: string | undefined): boolean =>
    expected === undefined || normalizeQuery(value ?? "") === normalizeQuery(expected);
  const region = normalizeQuery(filters.region ?? "");
  if (!(
    (filters.searchType === undefined || equals(item.search_type, filters.searchType)) &&
    (filters.productKind === undefined || equals(item.product_kind, filters.productKind)) &&
    (filters.recommendationStatus === undefined || equals(item.recommendation_status, filters.recommendationStatus)) &&
    (filters.recommendationScope === undefined || equals(item.recommendation_scope, filters.recommendationScope)) &&
    (filters.salesStatus === undefined || equals(item.sales_status, filters.salesStatus)) &&
    (filters.applicationStatus === undefined || equals(item.application_status, filters.applicationStatus)) &&
    (filters.provider === undefined || equals(item.provider, filters.provider)) &&
    (!region || supportRegionValues(item).some((value) => normalizeQuery(value).includes(region)))
  )) return false;
  if (filters.freshnessStatus === undefined) return true;
  const freshness = artifacts
    ? sourceFreshnessStatus(item, artifacts, freshnessCache)
    : item.freshness_status;
  return equals(freshness ?? undefined, filters.freshnessStatus);
}

function isRecommendationSearchEligible(item: FinanceItem): boolean {
  return recommendationBlocker(item) === undefined;
}

function isPubliclySearchable(item: FinanceItem): boolean {
  return item.recommendation_scope !== "internal_verification_candidate" && item.recommendation_status !== "manual_review_candidate";
}

function discoveryDomainForQuery(query: string): DiscoveryDomain | undefined {
  for (const [domain, tokens] of Object.entries(DISCOVERY_DOMAIN_TOKENS) as readonly [DiscoveryDomain, readonly string[]][]) {
    if (tokens.some((token) => normalizeQuery(query).includes(normalizeQuery(token)))) return domain;
  }
  return undefined;
}

function isDiscoveryQuery(query: string): boolean {
  return DISCOVERY_QUERY_RE.test(query);
}

function discoveryDomainForItem(item: FinanceItem): DiscoveryDomain | undefined {
  if (item.type === "card-product") return "card";
  if (item.type === "insurance-product") return "insurance";
  if (item.search_type === "loan" || item.search_type === "deposit" || item.search_type === "saving") return item.search_type;
  return undefined;
}

function hasDiscoveryCandidateEvidence(item: FinanceItem, domain: DiscoveryDomain): boolean {
  if (discoveryDomainForItem(item) !== domain) return false;
  if (item.product_status !== "active" || item.status !== "active") return false;
  if (!item.source_urls?.length || item.source_listing_status !== "listed") return false;
  const evidence = new Set(item.discovery_evidence_fields ?? []);
  if (domain === "card") return Boolean(item.title && item.provider && item.product_kind && (["benefit_type", "benefit_rate_or_amount", "benefit_categories"].some((field) => evidence.has(field))));
  if (domain === "loan") return Boolean(item.provider && item.product_kind && ["loan_rate_min_percent", "loan_rate_max_percent", "loan_limit_krw"].some((field) => evidence.has(field)));
  if (domain === "insurance") return Boolean(item.product_kind && ["coverage_amount_krw", "premium_basis", "renewal_type"].some((field) => evidence.has(field)));
  return Boolean(item.comparison_options?.length || evidence.size);
}

function discoveryConfidence(item: FinanceItem): "A" | "B" | "C" | "D" {
  const ratio = item.normalized_completeness_ratio ?? item.completeness_ratio ?? 0;
  if (ratio >= 0.9) return "A";
  if (ratio >= 0.7) return "B";
  if (ratio >= 0.4) return "C";
  return "D";
}

function requestedProductKind(query: string): string | undefined {
  if (query.includes("체크카드")) return "check-card";
  if (query.includes("신용카드")) return "credit-card";
  if (query.includes("신용대출")) return "credit-loan";
  if (query.includes("전세대출") || query.includes("월세대출")) return "rent-loan";
  if (query.includes("주택담보대출")) return "mortgage-loan";
  if (query.includes("정책대출")) return "policy-loan";
  if (query.includes("실손") || query.includes("실비")) return "indemnity-health";
  if (query.includes("암보험")) return "cancer";
  if (query.includes("상해보험")) return "accident";
  if (query.includes("질병보험")) return "disease";
  if (query.includes("정기보험")) return "term-life";
  if (query.includes("종신보험")) return "whole-life";
  if (query.includes("정기예금") || query.includes("예금")) return "deposit";
  if (query.includes("자유적금") || query.includes("적금")) return "saving";
  return undefined;
}

const PROVIDER_ALIASES: Record<string, readonly string[]> = {
  "ABL생명": ["ABL생명", "ABL"],
  "삼성카드": ["삼성카드", "삼성"],
  "BC바로카드": ["BC바로카드", "BC카드", "비씨카드"],
  "신한카드": ["신한카드", "신한"],
  "KB국민카드": ["KB국민카드", "KB국민", "국민카드", "KB"],
  "롯데카드": ["롯데카드", "롯데"],
  "광주은행": ["광주은행"],
};
const GENERIC_PRODUCT_TOKENS = new Set(["카드", "체크카드", "신용카드", "보험", "대출", "예금", "적금", "정기예금", "자유적금", "자유적립", "실손보험", "실비보험", "암보험", "상해보험", "질병보험", "정기보험", "종신보험", "신용대출", "전세대출", "월세대출", "정책대출", "주택담보대출", "상품", "추천", "비교", "후보", "순위", "없는", "비갱신형", "갱신형", "전월실적", "연회비", "교통", "쇼핑", "온라인", "할인", "적립", "마일리지", "구독", "직장인", "중도상환수수료", "낮은", "금리", "청년"]);

function compactProductText(value: string): string {
  return value.toLocaleLowerCase("ko-KR").replace(/[^0-9a-z가-힣]/g, "");
}

function providerForQuery(query: string): string | undefined {
  const compact = compactProductText(query);
  const matches = Object.entries(PROVIDER_ALIASES).filter(([, aliases]) => aliases.some((alias) => compact.includes(compactProductText(alias))));
  if (!matches.length) return undefined;
  return matches.sort((left, right) => Math.max(...right[1].map((alias) => compactProductText(alias).length)) - Math.max(...left[1].map((alias) => compactProductText(alias).length)))[0][0];
}

function productNameTokens(query: string, provider: string | undefined): readonly string[] {
  const providerTokens = new Set((provider ? PROVIDER_ALIASES[provider] ?? [] : []).map(compactProductText));
  const genericTokens = new Set([...GENERIC_PRODUCT_TOKENS].map(compactProductText));
  return [...new Set((query.match(/[0-9A-Za-z가-힣]+/g) ?? [])
    .map(compactProductText)
    .filter((token) => token && token !== "월" && !/^\d+(?:\.\d+)?개월$/.test(token) && !/^\d+(?:\.\d+)?(?:천만원|억원|만원|천원|원)$/.test(token) && !genericTokens.has(token) && !providerTokens.has(token)))];
}

function namedQueryParts(query: string): { cleanQuery: string; unparsedTokens: string[]; promptInjectionDetected: boolean } {
  const tokens = query.match(/[0-9A-Za-z가-힣]+/g) ?? [];
  const firstInjection = tokens.findIndex((token) => PROMPT_INJECTION_TOKENS.has(token.toLocaleLowerCase("ko-KR")));
  if (firstInjection < 0) return { cleanQuery: query, unparsedTokens: [], promptInjectionDetected: false };
  return {
    cleanQuery: tokens.slice(0, firstInjection).join(" "),
    unparsedTokens: tokens.slice(firstInjection),
    promptInjectionDetected: true,
  };
}

function providerForNamedQuery(query: string, items: readonly FinanceItem[]): string | undefined {
  const aliased = providerForQuery(query);
  if (aliased) return aliased;
  const compactQuery = compactProductText(query);
  let bestProvider: string | undefined;
  let bestLength = 0;
  for (const item of items) {
    if (!item.provider) continue;
    const compactProvider = compactProductText(item.provider);
    if (compactProvider.length > bestLength && compactQuery.includes(compactProvider)) {
      bestProvider = item.provider;
      bestLength = compactProvider.length;
    }
  }
  return bestProvider;
}

function isNamedProductQuery(query: string): boolean {
  const provider = providerForQuery(query);
  const productKind = requestedProductKind(query) ?? (query.includes("보험") ? "insurance" : undefined);
  return Boolean(productKind && productNameTokens(query, provider).length);
}

function strictNamedProductPayload(query: string, items: readonly FinanceItem[], limit: number, env: Env): Record<string, unknown> | undefined {
  const parts = namedQueryParts(query);
  const provider = providerForNamedQuery(parts.cleanQuery, items);
  const productKind = requestedProductKind(parts.cleanQuery) ?? (parts.cleanQuery.includes("보험") ? "insurance" : undefined);
  const nameTokens = productNameTokens(parts.cleanQuery, provider);
  if (!productKind && !provider && !nameTokens.length) return undefined;
  if (!productKind || !provider || !nameTokens.length) {
    return {
      query,
      resolution_status: "ambiguous",
      result_count: 0,
      results: [],
      exact_results: [],
      unparsed_query_tokens: parts.unparsedTokens,
      prompt_injection_detected: parts.promptInjectionDetected,
      reason_codes: [
        ...(!provider ? ["PROVIDER_REQUIRED"] : []),
        ...(!productKind ? ["PRODUCT_KIND_REQUIRED"] : []),
        ...(!nameTokens.length ? ["OFFICIAL_PRODUCT_NAME_REQUIRED"] : []),
      ],
      warnings: ["Named product queries require provider, official product name, and product kind; no broad fallback was used."],
    };
  }
  const compactNames = nameTokens.map(compactProductText);
  const tokenMatches = items.filter((item) => {
    if (!item.provider || compactProductText(item.provider) !== compactProductText(provider)) return false;
    if (productKind !== "insurance" && item.product_kind !== productKind) return false;
    const text = compactProductText([item.title, ...(item.search_aliases ?? []), ...(item.aliases ?? [])].join(" "));
    return compactNames.every((token) => text.includes(token));
  });
  const exactTitleMatches = tokenMatches.filter((item) => compactProductText(item.title) === compactProductText(parts.cleanQuery));
  const matches = exactTitleMatches.length ? exactTitleMatches : tokenMatches;
  const resolutionStatus = matches.length === 0 ? "not_found" : matches.length === 1 ? "exact" : "ambiguous";
  const results = matches.slice(0, limit).map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    provider: item.provider,
    product_kind: item.product_kind,
    canonical_product_id: item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id,
    resolved_canonical_product_id: item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id,
    resolution_status: resolutionStatus,
    unparsed_query_tokens: parts.unparsedTokens,
    prompt_injection_detected: parts.promptInjectionDetected,
    source_urls: item.source_urls ?? [],
    url: itemUrl(env, item.id),
  }));
  const sources = [...new Set(matches.flatMap((item) => item.source_urls ?? []).filter(Boolean))];
  const dataAsOf = [...new Set(matches.flatMap((item) => item.source_basis_dates ?? []).filter(Boolean))].sort().at(-1) ?? null;
  return {
    query,
    parsed_intent: { intent: "search", domain: productKind === "check-card" || productKind === "credit-card" ? "card" : productKind?.includes("loan") ? "loan" : productKind?.includes("insurance") ? "insurance" : productKind },
    resolution: {
      status: resolutionStatus,
      provider_required: provider,
      product_kind_required: productKind,
      name_tokens_required: nameTokens,
      canonical_product_ids: results.map((result) => result.resolved_canonical_product_id),
      candidate_count: results.length,
    },
    resolution_status: resolutionStatus,
    result_count: results.length,
    results,
    exact_results: resolutionStatus === "exact" ? results : [],
    partial_results: resolutionStatus === "ambiguous" ? results : [],
    data_as_of: dataAsOf,
    sources,
    limitations: [
      "named product matching requires provider, official product name, and product kind",
      "no any-term fallback is used for named product queries",
      ...(parts.promptInjectionDetected ? ["prompt-injection-like suffix was surfaced as unparsed input and ignored"] : []),
    ],
    unparsed_query_tokens: parts.unparsedTokens,
    prompt_injection_detected: parts.promptInjectionDetected,
    reason_codes: results.length ? [] : ["EXACT_PRODUCT_NOT_FOUND"],
    warnings: ["Prompt-injection-like suffixes are surfaced as unparsed tokens and ignored for matching; no any-term fallback was used."],
  };
}

type DiscoveryConstraint = { readonly field: string; readonly operator: "equals" | "lte" | "contains"; readonly value: string | number };
type ParsedDiscoveryQuery = {
  readonly original_query: string;
  readonly parser_version: string;
  readonly intent: "discovery";
  readonly domain: DiscoveryDomain;
  readonly product_kind?: string;
  readonly provider?: string;
  readonly product_name_tokens: readonly string[];
  readonly hard_constraints: readonly DiscoveryConstraint[];
  readonly soft_preferences: readonly string[];
  readonly negative_constraints: readonly string[];
  readonly numeric_constraints: readonly DiscoveryConstraint[];
  readonly unparsed_tokens: readonly string[];
};

function parseAmountKrw(query: string): number | undefined {
  const match = query.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(천만원|억원|만원|천원|원)/);
  if (!match) return undefined;
  const multiplier = { "억원": 100_000_000, "천만원": 10_000_000, "만원": 10_000, "천원": 1_000, "원": 1 }[match[2]];
  if (multiplier === undefined) return undefined;
  return Math.trunc(Number(match[1]) * multiplier);
}

function parseDiscoveryQuery(query: string, domain: DiscoveryDomain): ParsedDiscoveryQuery {
  const productKind = requestedProductKind(query);
  const provider = providerForQuery(query);
  const nameTokens = productNameTokens(query, provider);
  const hardConstraints: DiscoveryConstraint[] = productKind ? [{ field: "product_kind", operator: "equals", value: productKind }] : [];
  if (query.includes("전월실적 없는")) hardConstraints.push({ field: "previous_month_spend_min_krw", operator: "equals", value: 0 });
  if (query.includes("연회비 없는")) hardConstraints.push({ field: "annual_fee_krw", operator: "equals", value: 0 });
  if (query.includes("비갱신") || query.includes("갱신 안 되는")) hardConstraints.push({ field: "renewal_type", operator: "equals", value: "non_renewable" });
  else if (query.includes("갱신형")) hardConstraints.push({ field: "renewal_type", operator: "equals", value: "renewable" });
  if (query.includes("직장인")) hardConstraints.push({ field: "employment_type", operator: "equals", value: "employee" });
  if (query.includes("중도상환수수료 없는")) hardConstraints.push({ field: "early_repayment_fee", operator: "equals", value: 0 });
  if (query.includes("구독")) hardConstraints.push({ field: "benefit_category", operator: "contains", value: "subscription" });
  if (query.includes("자유적립") || query.includes("자유적금")) hardConstraints.push({ field: "saving_method", operator: "equals", value: "free" });
  const term = query.match(/(\d+)\s*개월/);
  if (term) hardConstraints.push({ field: "term_months", operator: "equals", value: Number(term[1]) });
  const amount = parseAmountKrw(query);
  if (amount !== undefined) hardConstraints.push({ field: domain === "deposit" ? "deposit_amount_krw" : "monthly_payment_krw", operator: "lte", value: amount });
  const softPreferences = ["마일리지", "교통", "쇼핑", "온라인", "우대금리", "낮은 금리", "높은 한도", "대한항공", "SKYPASS", "청년"]
    .filter((token) => normalizeQuery(query).includes(normalizeQuery(token)));
  if (provider) hardConstraints.push({ field: "provider", operator: "equals", value: provider });
  if (nameTokens.length) hardConstraints.push({ field: "product_name_tokens", operator: "contains", value: nameTokens.join("|") });
  return { original_query: query, parser_version: QUERY_PARSER_VERSION, intent: "discovery", domain, product_kind: productKind, provider, product_name_tokens: nameTokens, hard_constraints: hardConstraints, soft_preferences: softPreferences, negative_constraints: [], numeric_constraints: hardConstraints.filter((constraint) => typeof constraint.value === "number"), unparsed_tokens: [] };
}

function discoveryValues(item: FinanceItem, field: string): unknown[] {
  const direct = item[field as keyof FinanceItem];
  if (direct !== undefined && direct !== null && direct !== "" && (!Array.isArray(direct) || direct.length)) return Array.isArray(direct) ? direct : [direct];
  const values: unknown[] = [];
  for (const section of Object.values(item.structured_summary ?? {})) {
    if (isRecord(section) && section[field] !== undefined && section[field] !== null && section[field] !== "") {
      const value = section[field];
      values.push(...(Array.isArray(value) ? value : [value]));
    }
  }
  for (const option of item.comparison_options ?? []) {
    if (isRecord(option) && option[field] !== undefined && option[field] !== null && option[field] !== "") {
      const value = option[field];
      values.push(...(Array.isArray(value) ? value : [value]));
    }
  }
  return values;
}

function flattenDiscoveryValues(values: readonly unknown[]): unknown[] {
  return values.flatMap((value) => Array.isArray(value) ? flattenDiscoveryValues(value) : [value]);
}

function discoveryItemText(item: FinanceItem): string {
  return normalizeQuery([item.title, item.description, item.product_kind, item.search_text, ...(item.search_aliases ?? [])].filter(Boolean).join(" "));
}

function discoveryConstraintState(item: FinanceItem, constraint: DiscoveryConstraint): "matched" | "failed" | "unknown" {
  const { field, value: expected } = constraint;
  const candidateText = discoveryItemText(item);
  if (field === "product_kind") return item.product_kind === expected || (expected === "rent-loan" && item.product_kind === "policy-loan" && candidateText.includes("전세")) ? "matched" : "failed";
  if (field === "provider") {
    const provider = compactProductText(item.provider ?? "");
    return (PROVIDER_ALIASES[String(expected)] ?? [String(expected)]).some((alias) => provider.includes(compactProductText(alias))) ? "matched" : "failed";
  }
  if (field === "product_name_tokens") {
    const expectedTokens = String(expected).split("|").map(compactProductText).filter(Boolean);
    const candidate = compactProductText(candidateText);
    return expectedTokens.length && expectedTokens.every((token) => candidate.includes(token)) ? "matched" : "failed";
  }
  if (field === "employment_type") return ["직장인", "재직자", "근로소득자"].some((token) => candidateText.includes(token)) ? "matched" : "unknown";
  if (field === "term_months") {
    const termMonths = discoveryValues(item, "term_months");
    const terms = termMonths.length ? termMonths : discoveryValues(item, "terms");
    return terms.some((term) => String(term) === String(expected)) ? "matched" : "unknown";
  }
  if (field === "deposit_amount_krw" || field === "monthly_payment_krw") {
    const limits = discoveryValues(item, field === "deposit_amount_krw" ? "maximum_deposit_krw" : "monthly_payment_max_krw");
    return limits.length ? (limits.some((limit) => typeof limit === "number" && limit >= Number(expected)) ? "matched" : "failed") : "unknown";
  }
  const candidates = discoveryValues(item, field === "benefit_category" ? "benefit_categories" : field);
  if (!candidates.length) return "unknown";
  if (field === "renewal_type") return candidates.some((candidate) => String(candidate).replace("nonrenewable", "non_renewable") === expected) ? "matched" : "failed";
  if (field === "benefit_category") return flattenDiscoveryValues(candidates).some((candidate) => ["구독", "subscription"].includes(normalizeQuery(String(candidate)))) ? "matched" : "failed";
  if (expected === 0) return candidates.some((candidate) => candidate === 0) ? "matched" : "failed";
  return candidates.some((candidate) => candidate === expected) ? "matched" : "failed";
}

function discoveryPreferenceState(item: FinanceItem, preference: string): "matched" | "unknown" {
  const tokens: Record<string, readonly string[]> = { "마일리지": ["마일", "mileage"], "구독": ["구독", "subscription"], "교통": ["교통"], "쇼핑": ["쇼핑"], "온라인": ["온라인"], "대한항공": ["대한항공"], "SKYPASS": ["skypass"], "청년": ["청년", "youth"], "자유": ["자유", "free"] };
  return (tokens[preference] ?? [preference]).some((token) => discoveryItemText(item).includes(normalizeQuery(token))) ? "matched" : "unknown";
}

function discoveryDecisionReason(item: FinanceItem, field: string): Record<string, unknown> {
  const values = discoveryValues(item, field === "benefit_category" ? "benefit_categories" : field);
  const matchedValue = field === "product_kind" ? item.product_kind : values[0];
  return {
    constraint: field,
    matched_value: matchedValue ?? null,
    evidence_field: field,
    evidence_text: typeof matchedValue === "string" ? matchedValue : undefined,
    source_url: item.source_urls?.[0],
    source_locator: item.source_basis_dates?.[0],
  };
}

function discoveryPayload(query: string, items: readonly FinanceItem[], limit: number, artifacts?: FinanceArtifacts): Record<string, unknown> {
  const domain = discoveryDomainForQuery(query);
  const enabled = domain === "card" ? ENABLE_CARD_DISCOVERY : domain === "loan" ? ENABLE_LOAN_DISCOVERY : domain === "insurance" ? ENABLE_INSURANCE_DISCOVERY : true;
  if (!domain || !enabled) return { requested_intent: "discovery", executed_mode: "discovery", parsed_query: { original_query: query, parser_version: QUERY_PARSER_VERSION, domain: domain ?? null }, exact_candidates: [], partial_candidates: [], related_candidates: [], excluded_summary: {}, warnings: [domain ? "이 도메인의 탐색은 현재 비활성화되어 있습니다." : "상품 유형을 특정할 수 없어 탐색 후보를 만들지 않았습니다."], engine_version: DISCOVERY_ENGINE_VERSION, field_extractor_version: FIELD_EXTRACTOR_VERSION };
  const parsed = parseDiscoveryQuery(query, domain);
  const groups = { exact_candidates: [] as Record<string, unknown>[], partial_candidates: [] as Record<string, unknown>[], related_candidates: [] as Record<string, unknown>[] };
  const excludedSummary: Record<string, number> = {};
  const seen = new Set<string>();
  const freshnessCache = new Map<string, string | null>();
  const discoveryFreshness = (item: FinanceItem): string | null | undefined => {
    if (!artifacts) return item.source_freshness_status ?? item.freshness_status;
    const sourceIds = sourceIdsForItem(item);
    const key = sourceIds.join("\u0000");
    if (!freshnessCache.has(key)) freshnessCache.set(key, resolveSourceStatus({ sourceIds, sourceUrlCount: item.source_urls?.length ?? 0, sourceStatusArtifact: artifacts.source_status, sourceRegistryArtifact: artifacts.source_registry, staticFreshness: item.freshness_status ?? item.source_freshness_status }).freshnessStatus);
    return freshnessCache.get(key);
  };
  for (const item of items) {
    if (discoveryDomainForItem(item) !== domain) {
      excludedSummary.domain_mismatch = (excludedSummary.domain_mismatch ?? 0) + 1;
      continue;
    }
    if (!hasDiscoveryCandidateEvidence(item, domain) || discoveryFreshness(item) !== "current") {
      excludedSummary.inactive_or_unlisted = (excludedSummary.inactive_or_unlisted ?? 0) + 1;
      continue;
    }
    const matched = parsed.soft_preferences.filter((preference) => discoveryPreferenceState(item, preference) === "matched");
    const ratio = item.normalized_completeness_ratio ?? item.completeness_ratio ?? 0;
    const canonicalId = item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id;
    const states = new Map(parsed.hard_constraints.map((constraint) => [constraint.field, discoveryConstraintState(item, constraint)]));
    const preferenceStates = new Map(parsed.soft_preferences.map((preference) => [preference, discoveryPreferenceState(item, preference)]));
    const failed = [...states.entries()].filter(([, state]) => state === "failed").map(([field]) => field);
    if (domain === "insurance" && !parsed.product_kind && item.product_kind === "other-protection") failed.push("product_kind");
    const unknown = [...states.entries(), ...preferenceStates.entries()].filter(([, state]) => state === "unknown").map(([field]) => field);
    const matchedConstraints = [...states.entries(), ...preferenceStates.entries()].filter(([, state]) => state === "matched").map(([field]) => field);
    const score = 35 + Math.min(20, matched.length * 10)
      + (matchedConstraints.includes("product_name_tokens") ? 40 : 0)
      + (matchedConstraints.includes("provider") ? 25 : 0)
      + Math.round(ratio * 10)
      + (item.source_freshness_status === "current" ? 5 : 0);
    const eligibility = failed.length ? (["product_kind", "provider", "product_name_tokens"].some((field) => failed.includes(field)) ? "related_candidate" : "excluded") : (unknown.length ? "partial_candidate" : "exact_candidate");
    const relevance = eligibility === "exact_candidate" ? "A" : eligibility === "partial_candidate" ? "B" : "D";
    const verification = isVerifiedActive(item.sales_verification_status) && item.verification_status === "verified" && item.verified_completeness_ratio === 1 ? "A" : item.verification_status === "verified" ? "B" : item.source_urls?.length ? "C" : "D";
    const dataGrade = discoveryConfidence(item);
    let overall: "A" | "B" | "C" | "D" = relevance;
    if (verification > overall) overall = verification;
    if (dataGrade > overall) overall = dataGrade;
    if (!isVerifiedActive(item.sales_verification_status) || !item.domain_gate_passed || ratio === 0) {
      overall = overall > "C" ? overall : "C";
    }
    const decision = { mode: "discovery", eligibility, decision_scope: "discovery_only", score, relevance_grade: relevance, data_completeness_grade: dataGrade, verification_grade: verification, overall_candidate_grade: overall, matched_constraints: matchedConstraints, unknown_constraints: unknown, failed_constraints: failed, decision_reasons: matchedConstraints.map((field) => discoveryDecisionReason(item, field)), limitations: item.discovery_limitations ?? ["sales_status_unverified"] };
    if (eligibility === "excluded") {
      excludedSummary.hard_constraint_failed = (excludedSummary.hard_constraint_failed ?? 0) + 1;
      continue;
    }
    if (seen.has(canonicalId)) {
      excludedSummary.duplicate_canonical_product = (excludedSummary.duplicate_canonical_product ?? 0) + 1;
      continue;
    }
    seen.add(canonicalId);
    groups[`${eligibility}s` as keyof typeof groups].push({ canonical_product_id: canonicalId, id: item.id, title: item.title, provider: item.provider, product_kind: item.product_kind, catalog_recommendation_status: item.catalog_recommendation_status ?? item.recommendation_status, catalog_recommendation_scope: item.catalog_recommendation_scope ?? item.recommendation_scope, relevance_grade: relevance, data_completeness_grade: discoveryConfidence(item), verification_grade: verification, overall_candidate_grade: overall, matched_constraints: decision.matched_constraints, unknown_constraints: decision.unknown_constraints, failed_constraints: decision.failed_constraints, why_included: decision.decision_reasons, limitations: decision.limitations, source_urls: item.source_urls ?? [], source_basis_dates: item.source_basis_dates ?? [], decision });
  }
  for (const values of Object.values(groups)) values.sort((left, right) => Number((right.decision as Record<string, unknown>).score) - Number((left.decision as Record<string, unknown>).score) || String(left.canonical_product_id).localeCompare(String(right.canonical_product_id), "ko-KR")).splice(limit);
  return { requested_intent: /추천|골라|알려|찾아/.test(query) ? "recommend" : "discovery", executed_mode: "discovery", fallback_reason: /추천|골라|알려|찾아/.test(query) ? "verified_recommendation_candidate_not_available" : undefined, parsed_query: parsed, ...groups, excluded_summary: excludedSummary, warnings: ["탐색 결과는 최적 상품·승인·보험료·보장 적합성을 뜻하지 않습니다."], engine_version: DISCOVERY_ENGINE_VERSION, field_extractor_version: FIELD_EXTRACTOR_VERSION };
}

function scoreItem(item: FinanceItem, query: string, tokens = queryTokens(query)): number {
  const normalizedTitle = normalizeQuery(item.title);
  const normalizedId = normalizeQuery(item.id);
  const searchType = normalizeQuery(item.search_type ?? item.product_kind ?? "");
  const rateIntent = RATE_QUERY_RE.test(query);
  const recommendationIntent = RECOMMENDATION_QUERY_RE.test(query);

  if (searchType === "deposit-protection" && rateIntent && !PROTECTION_QUERY_RE.test(query)) {
    return 0;
  }
  if (recommendationIntent) {
    const intentTokens = tokens.filter((token) => !RECOMMENDATION_QUERY_RE.test(token));
    if (
      !isRecommendationSearchEligible(item) ||
      !matchesRecommendationDomain(item, query, searchType) ||
      !intentTokens.length
    ) {
      return 0;
    }
  }
  if (item.type === "support-program") {
    const status = normalizeQuery(item.status ?? item.product_status ?? "");
    const recommendationStatus = normalizeQuery(item.recommendation_status ?? "");
    const applicationStatus = normalizeQuery(item.application_status ?? "");
    if (
      (status === "closed" || status === "ended" || applicationStatus === "closed" || recommendationStatus === "reference_only") &&
      !INACTIVE_QUERY_RE.test(query)
    ) {
      return 0;
    }
  }

  if (recommendationIntent) {
    const intentTokens = tokens.filter((token) => !RECOMMENDATION_QUERY_RE.test(token));
    if (!intentTokens.every((token) => searchTextIncludes(item, token))) {
      return 0;
    }
  }
  let score = 0;
  if ((item.search_aliases ?? []).some((alias) => normalizeQuery(alias) === query)) {
    score = 95;
  } else if (normalizedId === query || normalizedTitle === query) {
    score = 100;
  } else if (normalizedId.includes(query)) {
    score = 80;
  } else if (query.includes(normalizedTitle)) {
    const titleTokenCount = queryTokens(normalizedTitle).length;
    const base = GENERIC_SEARCH_TYPES.has(item.type) && titleTokenCount < tokens.length ? 35 : 75;
    score = base + titleTokenCount;
  } else if (normalizedTitle.includes(query)) {
    score = 70;
  } else if (searchTextIncludes(item, query)) {
    score = 40;
  }
  if (tokens.length > 1) {
    const matchedTokens = tokens.filter((token) => searchTextIncludes(item, token));
    if (TAX_DECISION_TYPES.has(item.type) && matchedTokens.length >= Math.min(2, tokens.length)) {
      score = Math.max(score, 60 + matchedTokens.length);
    }
    if (!score && matchedTokens.length === tokens.length) {
      score = 30 + matchedTokens.length;
    }
    if (!score && matchedTokens.length > 0) {
      score = 10 + matchedTokens.length;
    }
  }
  if (score > 0 && rateIntent && ["deposit", "saving", "loan"].includes(searchType)) {
    score += 20;
  }
  return score;
}

function linkAbortSignal(controller: AbortController, signal?: AbortSignal): () => void {
  if (!signal) return () => undefined;
  const abort = () => controller.abort();
  if (signal.aborted) controller.abort();
  else signal.addEventListener("abort", abort, { once: true });
  return () => signal.removeEventListener("abort", abort);
}

function waitForAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => { signal.removeEventListener("abort", onAbort); resolve(value); },
      (error) => { signal.removeEventListener("abort", onAbort); reject(error); },
    );
  });
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const unlinkAbort = linkAbortSignal(controller, signal);
  const timer = setTimeout(() => controller.abort(), FINANCE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "finance-mcp-cloudflare-worker",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Finance ontology fetch failed: ${url} ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
    unlinkAbort();
  }
}

async function fetchText(url: string, maxBytes?: number, signal?: AbortSignal): Promise<string> {
  const controller = new AbortController();
  const unlinkAbort = linkAbortSignal(controller, signal);
  const timer = setTimeout(() => controller.abort(), FINANCE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "finance-mcp-cloudflare-worker",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Finance ontology fetch failed: ${url} ${response.status} ${response.statusText}`);
    const contentLength = Number(response.headers.get("content-length"));
    if (maxBytes !== undefined && Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new SearchIndexContractError(`Finance ontology fetch exceeds ${maxBytes} bytes: ${url} ${contentLength}`);
    }
    const text = await response.text();
    if (maxBytes !== undefined && new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new SearchIndexContractError(`Finance ontology fetch exceeds ${maxBytes} bytes: ${url}`);
    }
    return text;
  } finally {
    clearTimeout(timer);
    unlinkAbort();
  }
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256Hex(value: unknown): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(stableJson(value)));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyArtifactChecksum(data: unknown, expected: string | undefined): Promise<boolean> {
  return typeof expected === "string" && expected.length > 0 && expected.replace(/^sha256:/, "") === await sha256Hex(data);
}

async function verifySearchChecksum(data: unknown, expected: string | undefined): Promise<boolean> {
  if (typeof expected !== "string" || expected.length === 0) return false;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(data)));
  const actual = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return expected.replace(/^sha256:/, "") === actual;
}

async function verifyTextChecksum(text: string, expected: string | undefined): Promise<boolean> {
  if (typeof expected !== "string" || expected.length === 0) return false;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const actual = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return expected.replace(/^sha256:/, "") === actual;
}

async function loadFinanceManifest(env: Env): Promise<FinanceManifest> {
  const now = Date.now();
  if (cachedManifest && now - cachedManifest.loadedAt < CACHE_TTL_MS) {
    return cachedManifest.data;
  }
  return manifestSingleFlight.run(async () => {
    const manifest = await fetchJson<FinanceManifest>(financeManifestUrl(env));
    const expectedManifestChecksum = manifest.manifest_checksum;
    const manifestForChecksum = { ...manifest } as Record<string, unknown>;
    delete manifestForChecksum.manifest_checksum;
    manifest._manifest_checksum_verified = await verifyArtifactChecksum(manifestForChecksum, expectedManifestChecksum);
    const generation = JSON.stringify({
      version: manifest.version,
      basis_date: manifest.basis_date,
      search_index: (manifest.search_index as (ManifestEntry & { export_checksum?: string; content_checksum?: string }) | undefined)?.export_checksum ?? manifest.search_index?.content_checksum ?? manifest.search_index?.path,
      detail_search_index: (manifest.detail_search_index as (ManifestEntry & { export_checksum?: string; content_checksum?: string }) | undefined)?.export_checksum ?? manifest.detail_search_index?.content_checksum ?? manifest.detail_search_index?.path,
      hot_search_index: (manifest.hot_search_index as (ManifestEntry & { export_checksum?: string; content_checksum?: string }) | undefined)?.export_checksum ?? manifest.hot_search_index?.content_checksum ?? manifest.hot_search_index?.path,
      exact_fetch_index: (manifest.exact_fetch_index as (ManifestEntry & { export_checksum?: string; content_checksum?: string }) | undefined)?.export_checksum ?? manifest.exact_fetch_index?.content_checksum ?? manifest.exact_fetch_index?.path,
      exports: manifest.exports.map((entry) => [entry.id, entry.path, entry.url, entry.web_url, (entry as ManifestEntry & { export_checksum?: string }).export_checksum]),
      artifacts: [manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index, manifest.live_regression_evidence]
        .map((entry) => entry ? [entry.id, entry.path, entry.url, entry.web_url, (entry as ManifestEntry & { export_checksum?: string }).export_checksum] : null),
    });
    if (manifestGeneration !== "uninitialized" && manifestGeneration !== generation) {
      cachedGraph = undefined;
      cachedSearchIndexMetadata = undefined;
      cachedSearchItems = undefined;
      clearSearchCaches();
      cachedFinanceArtifacts.clear();
      artifactCacheBudget.clear();
    }
    const liveEntry = manifest.live_regression_evidence;
    const liveEvidence = liveEntry?.export_checksum
      ? await fetchJson<Record<string, unknown>>(resolveExportUrl(liveEntry, financeManifestUrl(env))).catch(() => null)
      : null;
    Object.defineProperty(manifest, "_live_regression", {
      value: liveEvidence && await verifyArtifactChecksum(liveEvidence, liveEntry?.export_checksum)
        ? liveEvidence
        : manifest.openfin_120_live_regression ?? {},
      enumerable: false,
      configurable: true,
    });
    manifestGeneration = generation;
    cachedManifest = { data: manifest, loadedAt: Date.now() };
    return manifest;
  });
}

function manifestChecksumContract(manifest: FinanceManifest): boolean {
  const entries = [manifest.search_index, manifest.detail_search_index, manifest.hot_search_index, ...(manifest.exact_fetch_index ? [manifest.exact_fetch_index] : []), manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index, manifest.live_regression_evidence, ...(manifest.exports ?? [])];
  return manifest._manifest_checksum_verified === true && entries.length > 0 && entries.every((entry) => typeof entry?.export_checksum === "string" && entry.export_checksum.length > 0);
}

function resolveExportUrl(entry: { path: string; url?: string; web_url?: string }, manifestUrl: string): string {
  // The copied data snapshot retains original provenance URLs. Runtime reads
  // must stay inside this independently deployed OpenFin Pages surface.
  const candidate = entry.web_url ?? entry.url ?? entry.path;
  const fileName = new URL(candidate, manifestUrl).pathname.split("/").pop();
  if (!fileName) throw new SearchIndexContractError(`Cannot resolve export file for ${entry.path}`);
  return new URL(fileName, manifestUrl).toString();
}

async function loadOntologyExportPayloads(entry: ManifestEntry, manifestUrl: string, signal?: AbortSignal): Promise<unknown[]> {
  const shards = entry.shards;
  const sources = shards?.length ? shards : [entry];
  const payloads: unknown[] = [];
  for (const source of sources) {
    const label = shards?.length ? `ontology export shard ${(source as SearchIndexShard).shard_id}` : `ontology export ${entry.id}`;
    const url = resolveExportUrl(source, manifestUrl);
    const rawText = await fetchText(url, undefined, signal);
    if (source.content_checksum && !(await verifyTextChecksum(rawText, source.content_checksum))) {
      throw new SearchIndexContractError(`${label} content checksum mismatch`);
    }
    let payload: unknown;
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      throw new SearchIndexContractError(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    let combined;
    try {
      combined = recombineOntologyExportPayloads([payload]);
    } catch (error) {
      throw new SearchIndexContractError(`${label} contract mismatch: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!(await verifyArtifactChecksum(combined, source.export_checksum))) throw new SearchIndexContractError(`${label} checksum mismatch`);
    assertSearchItemCount(combined.items.length + combined.reference_items.length, source.item_count, label);
    payloads.push(payload);
  }
  const combined = recombineOntologyExportPayloads(payloads);
  assertSearchItemCount(combined.items.length + combined.reference_items.length, entry.item_count, `ontology export ${entry.id}`);
  if (!(await verifyArtifactChecksum(combined, entry.export_checksum))) throw new SearchIndexContractError(`ontology export ${entry.id} recombined checksum mismatch`);
  return payloads;
}

async function loadFinanceArtifactEntry(env: Env, cacheKey: string, entry: { path: string; url?: string; web_url?: string }): Promise<unknown | undefined> {
  const now = Date.now();
  const requestGeneration = manifestGeneration;
  const pendingKey = generationCacheKey(requestGeneration, cacheKey);
  const cached = cachedFinanceArtifacts.get(cacheKey);
  if (cached && cached.generation === manifestGeneration && now - cached.loadedAt < CACHE_TTL_MS) return cached.data;
  const pending = inFlightFinanceArtifacts.get(pendingKey);
  if (pending) return pending;
  const request = (async () => {
    try {
      const data = await fetchJson<unknown>(resolveExportUrl(entry, financeManifestUrl(env)));
      if (!(await verifyArtifactChecksum(data, (entry as ManifestEntry).export_checksum))) {
        throw new Error(`manifest checksum mismatch for ${cacheKey}`);
      }
      if (isCurrentGeneration(requestGeneration, manifestGeneration)) {
        const bytes = new TextEncoder().encode(JSON.stringify(data)).byteLength;
        const rows = artifactRecords(data).length;
        const admission = artifactCacheBudget.admit(cacheKey, bytes, rows);
        for (const evicted of admission.evicted) cachedFinanceArtifacts.delete(evicted);
        if (admission.accepted) cachedFinanceArtifacts.set(cacheKey, { data, loadedAt: Date.now(), generation: requestGeneration });
        else cachedFinanceArtifacts.delete(cacheKey);
        financeArtifactErrors.delete(cacheKey);
      }
      return data;
    } catch (error) {
      if (isCurrentGeneration(requestGeneration, manifestGeneration)) {
        financeArtifactErrors.set(cacheKey, { cache_key: cacheKey, error: error instanceof Error ? error.message : String(error), failed_at: new Date().toISOString() });
      }
      return undefined;
    } finally {
      inFlightFinanceArtifacts.delete(pendingKey);
    }
  })();
  inFlightFinanceArtifacts.set(pendingKey, request);
  return request;
}

async function loadFinanceArtifact(env: Env, key: FinanceArtifactKey, manifest?: FinanceManifest): Promise<unknown | undefined> {
  let currentManifest = manifest;
  try { currentManifest ??= await loadFinanceManifest(env); } catch (error) {
    financeArtifactErrors.set(key, { cache_key: key, error: error instanceof Error ? error.message : String(error), failed_at: new Date().toISOString() });
    return undefined;
  }
  const entry = currentManifest[key];
  // An absent optional manifest entry is a normal condition, not an error.
  return entry ? loadFinanceArtifactEntry(env, key, entry) : undefined;
}

async function loadProvenanceShard(env: Env, manifest: FinanceManifest, shardId: string): Promise<unknown | undefined> {
  const shard = manifest.provenance_index?.shards?.find((entry) => entry.shard_id === shardId || entry.id === shardId);
  if (!shard) return undefined;
  return loadFinanceArtifactEntry(env, `provenance_index.shard:${shardId}`, shard);
}

async function loadFinanceArtifacts(env: Env, keys: readonly FinanceArtifactKey[], manifest?: FinanceManifest): Promise<FinanceArtifacts> {
  const values = await Promise.all(keys.map((key) => loadFinanceArtifact(env, key, manifest)));
  return keys.reduce<FinanceArtifacts>((result, key, index) => {
    if (values[index] !== undefined) result[key] = values[index];
    return result;
  }, {});
}

function artifactRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["items", "records", "entries", "provenance", "sources", "statuses"]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

function artifactErrors(): Record<string, unknown>[] {
  return [...financeArtifactErrors.values()];
}

function artifactRecordFor(value: unknown, id: string): Record<string, unknown> | undefined {
  if (isRecord(value)) {
    if (value.id === id || value.item_id === id || value.entity_id === id) return value;
    const direct = value[id];
    if (isRecord(direct)) return direct;
    for (const key of ["items", "records", "entries", "provenance", "sources", "statuses"]) {
      const nested = value[key];
      if (isRecord(nested) && isRecord(nested[id])) return nested[id];
    }
  }
  return artifactRecords(value).find((record) => record.id === id || record.item_id === id || record.entity_id === id || record.source_id === id || record.sourceId === id);
}

function normalizedProvenance(item: FinanceItem, artifacts?: FinanceArtifacts): Record<string, unknown>[] {
  const artifact = artifactRecordFor(artifacts?.provenance_index, item.id);
  const candidates = [
    ...(Array.isArray(item.provenance) ? item.provenance : []),
    ...(Array.isArray(item.source_assertions) ? item.source_assertions : []),
    ...(artifact ? (Array.isArray(artifact.provenance) ? artifact.provenance.filter(isRecord) : [artifact]) : []),
  ];
  const fallbackUrl = item.source_urls?.find((url) => /^https?:\/\//i.test(url));
  return candidates.filter(isRecord).map((entry) => ({
    source_id: entry.source_id ?? entry.source ?? entry.sourceId,
    original_url: entry.original_url ?? entry.url ?? fallbackUrl,
    source_record_id: entry.source_record_id ?? entry.record_id,
    locator: entry.locator,
    supported_fields: entry.supported_fields ?? entry.fields ?? [],
    source_published_at: entry.source_published_at,
    source_modified_at: entry.source_modified_at,
    collected_at: entry.collected_at ?? item.collected_at,
    reviewed_at: entry.reviewed_at ?? item.last_reviewed_at,
    valid_from: entry.valid_from,
    valid_to: entry.valid_to,
    checksum: entry.checksum ?? entry.source_checksum ?? item.source_checksum,
    verification_status: entry.verification_status ?? item.verification_status,
  }));
}

function publicProvenance(item: FinanceItem, artifacts: FinanceArtifacts): { entries: Record<string, unknown>[]; unresolvedCount: number } {
  const registryIds = new Set(artifactRecords(artifacts.source_registry).flatMap((record) => {
    const id = record.id ?? record.source_id ?? record.sourceId;
    return typeof id === "string" ? [id] : [];
  }));
  const entries = normalizedProvenance(item, artifacts);
  // Without a usable registry, source ids cannot be claimed canonical; omit
  // them from public provenance while reporting the unresolved count.
  if (!registryIds.size) {
    const resolved = entries.filter((entry) => typeof entry.source_id !== "string");
    return { entries: resolved, unresolvedCount: entries.length - resolved.length };
  }
  const resolved = entries.filter((entry) => typeof entry.source_id !== "string" || registryIds.has(entry.source_id));
  return { entries: resolved, unresolvedCount: entries.length - resolved.length };
}

function sourceHealth(item: FinanceItem, artifacts?: FinanceArtifacts): Record<string, unknown> {
  const provenance = normalizedProvenance(item, artifacts);
  const sourceIds = sourceIdsForItem(item, provenance);
  const resolution = resolveSourceStatus({
    sourceIds,
    sourceUrlCount: item.source_urls?.length ?? 0,
    sourceStatusArtifact: artifacts?.source_status,
    sourceRegistryArtifact: artifacts?.source_registry,
    staticFreshness: item.freshness_status ?? item.source_freshness_status,
  });
  const { statuses } = resolution;
  const statusVerifiedAt = statuses.map((status) => status.last_successful_checked_at).find((value): value is string => typeof value === "string");
  return {
    source_ids: sourceIds,
    source_count: sourceIds.length || (item.source_urls?.length ?? 0),
    last_verified_at: item.last_verified_at ?? item.verified_at ?? item.last_source_checked_at ?? statusVerifiedAt ?? null,
    freshness_status: resolution.freshnessStatus,
    source_status: statuses.length ? statuses : undefined,
    source_status_resolution: resolution.resolution,
    source_status_reason: resolution.reason,
    artifact_errors: artifactErrors(),
  };
}

function coverageReport(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const candidate = isRecord(value.coverage) ? value.coverage : isRecord(value.summary) ? value.summary : value;
  const result: Record<string, unknown> = {};
  for (const key of ["status", "coverage_ratio", "provenance_coverage_ratio", "verified_ratio", "total", "verified", "missing", "stale", "generated_at"]) {
    if (candidate[key] !== undefined) result[key] = candidate[key];
  }
  return Object.keys(result).length ? result : null;
}

class SearchIndexContractError extends Error {
  readonly name = "SearchIndexContractError";

  constructor(readonly detail: string) {
    super(`Finance search-index contract error: ${detail}`);
  }
}

const SUPPORT_HOT_APPLICATION_STATUSES = [
  "unknown", "recurring_annual", "always_open", "source_schedule_ambiguous",
  "agency_schedule_varies", "closed", "announcement_based", "not_required",
  "budget_exhaustion", "open", "agency_contact_required", "recurring_quarterly",
  "recurring_monthly", "schedule_pending",
] as const;
const SUPPORT_HOT_STATUS_CODES = ["unknown", "active", "closed"] as const;
const SUPPORT_HOT_RECOMMENDATION_CODES = ["reference_only", "eligible_for_listing"] as const;
const SUPPORT_HOT_FRESHNESS_CODES = ["unknown", "current", "stale", "degraded"] as const;
const SUPPORT_HOT_CATEGORY_BITS: ReadonlyArray<readonly [string, number]> = [
  ["rent", 1 << 0], ["housing", 1 << 1], ["lease_deposit", 1 << 2], ["deposit_guarantee", 1 << 3],
  ["housing_supply", 1 << 4], ["housing_repair", 1 << 5], ["employment", 1 << 6], ["education", 1 << 7],
  ["health", 1 << 8], ["culture", 1 << 9], ["business", 1 << 10],
];

const HOT_SEARCH_VOCABULARY = Symbol("openfin.hotSearchVocabulary");
const HOT_SEARCH_TERM_IDS = Symbol("openfin.hotSearchTermIds");
const HOT_SEARCH_TEXT = Symbol("openfin.hotSearchText");
type HotSearchItem = FinanceItem & {
  [HOT_SEARCH_VOCABULARY]?: readonly string[];
  [HOT_SEARCH_TERM_IDS]?: readonly number[];
  [HOT_SEARCH_TEXT]?: string;
};
const HOT_ITEM_PROTOTYPE = Object.create(Object.prototype) as object;

function hotSearchVocabulary(item: FinanceItem): readonly string[] | undefined {
  return (item as HotSearchItem)[HOT_SEARCH_VOCABULARY];
}

function hotSearchTermIds(item: FinanceItem): readonly number[] | undefined {
  return (item as HotSearchItem)[HOT_SEARCH_TERM_IDS];
}

function attachHotSearchMetadata(item: FinanceItem, vocabulary: readonly string[], termIds: readonly number[]): void {
  Object.defineProperties(item, {
    [HOT_SEARCH_VOCABULARY]: { value: vocabulary, configurable: true },
    [HOT_SEARCH_TERM_IDS]: { value: termIds, configurable: true },
  });
}

function defineHotOwnField(item: FinanceItem, field: string, value: unknown): void {
  if (value === undefined) return;
  Object.defineProperty(item, field, { value, enumerable: true, configurable: true, writable: true });
}

function supportHotState(item: FinanceItem): number | undefined {
  return typeof item.support_state === "number" && Number.isInteger(item.support_state) ? item.support_state : undefined;
}

function supportHotApplicationStatus(item: FinanceItem): string | undefined {
  const state = supportHotState(item);
  return state === undefined ? undefined : SUPPORT_HOT_APPLICATION_STATUSES[state & 0x0f] ?? "unknown";
}

function supportHotStatus(item: FinanceItem): string | undefined {
  const state = supportHotState(item);
  return state === undefined ? undefined : SUPPORT_HOT_STATUS_CODES[(state >> 4) & 0x03] ?? "unknown";
}

function supportHotRecommendationStatus(item: FinanceItem): string | undefined {
  const state = supportHotState(item);
  return state === undefined ? undefined : SUPPORT_HOT_RECOMMENDATION_CODES[(state >> 6) & 0x01] ?? "reference_only";
}

function supportHotFreshnessStatus(item: FinanceItem): string | undefined {
  const state = supportHotState(item);
  return state === undefined ? undefined : SUPPORT_HOT_FRESHNESS_CODES[(state >> 7) & 0x03] ?? "unknown";
}

function supportHotCurrentlyApplicable(item: FinanceItem): boolean | undefined {
  const state = supportHotState(item);
  return state === undefined ? undefined : Boolean(state & (1 << 9));
}

function supportHotTargetGroup(item: FinanceItem): string[] | undefined {
  const state = supportHotState(item);
  return state !== undefined && Boolean(state & (1 << 22)) ? ["youth"] : undefined;
}

function supportHotCategories(item: FinanceItem): string[] | undefined {
  const state = supportHotState(item);
  const categoryMask = state === undefined ? 0 : (state >> 10) & 0x07ff;
  if (!categoryMask) return undefined;
  const categories: string[] = [];
  for (const [category, bit] of SUPPORT_HOT_CATEGORY_BITS) if (categoryMask & bit) categories.push(category);
  return categories;
}

function supportHotRecommendationScope(item: FinanceItem): string | undefined {
  const state = supportHotState(item);
  return state !== undefined && !(state & (1 << 23)) ? "internal_verification_candidate" : undefined;
}

function hotSearchText(item: FinanceItem): string {
  const hotItem = item as HotSearchItem;
  const cached = hotItem[HOT_SEARCH_TEXT];
  if (cached !== undefined) return cached;
  const vocabulary = hotSearchVocabulary(item);
  const termIds = hotSearchTermIds(item);
  if (!vocabulary || !termIds) return "";
  const text = termIds.map((termId) => vocabulary[termId] ?? "").join(" ");
  Object.defineProperty(item, HOT_SEARCH_TEXT, { value: text, configurable: true });
  return text;
}

function searchTextIncludes(item: FinanceItem, value: string): boolean {
  const needle = normalizeQuery(value);
  if (!needle) return false;
  const vocabulary = hotSearchVocabulary(item);
  const terms = hotSearchTermIds(item);
  if (!vocabulary || !terms) return itemSearchText(item).includes(needle);
  if (!needle.includes(" ")) {
    return terms.some((termId) => (vocabulary[termId] ?? "").includes(needle));
  }
  const needles = needle.split(/\s+/).filter(Boolean);
  return terms.some((_, start) => needles.every((term, offset) => (vocabulary[terms[start + offset]] ?? "").includes(term)));
}

Object.defineProperties(HOT_ITEM_PROTOTYPE, {
  search_text: { configurable: true, get(this: FinanceItem) { return hotSearchText(this); } },
  application_status: { configurable: true, get(this: FinanceItem) { return supportHotApplicationStatus(this); } },
  status: { configurable: true, get(this: FinanceItem) { return supportHotStatus(this); } },
  recommendation_status: { configurable: true, get(this: FinanceItem) { return supportHotRecommendationStatus(this); } },
  freshness_status: { configurable: true, get(this: FinanceItem) { return supportHotFreshnessStatus(this); } },
  is_currently_applicable: { configurable: true, get(this: FinanceItem) { return supportHotCurrentlyApplicable(this); } },
  target_group: { configurable: true, get(this: FinanceItem) { return supportHotTargetGroup(this); } },
  support_category: { configurable: true, get(this: FinanceItem) { return supportHotCategories(this); } },
  recommendation_scope: { configurable: true, get(this: FinanceItem) { return supportHotRecommendationScope(this); } },
});

function materializeSupportHotFields(item: FinanceItem): FinanceItem {
  if (item.type !== "support-program" || supportHotState(item) === undefined) return item;
  defineHotOwnField(item, "application_status", supportHotApplicationStatus(item));
  defineHotOwnField(item, "status", supportHotStatus(item));
  defineHotOwnField(item, "recommendation_status", supportHotRecommendationStatus(item));
  defineHotOwnField(item, "freshness_status", supportHotFreshnessStatus(item));
  defineHotOwnField(item, "is_currently_applicable", supportHotCurrentlyApplicable(item));
  defineHotOwnField(item, "target_group", supportHotTargetGroup(item));
  defineHotOwnField(item, "support_category", supportHotCategories(item));
  defineHotOwnField(item, "recommendation_scope", supportHotRecommendationScope(item));
  if (hotSearchVocabulary(item)) defineHotOwnField(item, "search_text", hotSearchText(item));
  return item;
}

function hydrateSupportHotFields(item: Record<string, unknown>): void {
  materializeSupportHotFields(item as FinanceItem);
}

function isFinanceItem(value: unknown): value is FinanceItem {
  return isRecord(value) && typeof value.id === "string" && typeof value.title === "string" && typeof value.type === "string";
}

const SUPPORT_BROAD_QUERY_TOKENS = new Set(["지원", "지원금", "보조금", "신청"]);

function hotSearchRowIndexes(value: unknown, query: string): readonly number[] | undefined {
  if (!isRecord(value) || value.format !== "openfin-hot-search-v1" || !Array.isArray(value.vocabulary) || !Array.isArray(value.search_terms) || !Array.isArray(value.items)) return undefined;
  const tokens = queryTokens(query);
  if (!tokens.length) return undefined;
  const supportBroadQuery = value.shard_id === "support" && tokens.some((token) => SUPPORT_BROAD_QUERY_TOKENS.has(token));
  // Universal support terms are routing hints, not useful row selectors when
  // a query also names a specific audience or topic.
  const selectionTokens = value.shard_id === "support"
    ? tokens.filter((token) => !SUPPORT_BROAD_QUERY_TOKENS.has(token))
    : tokens;
  const queryNeedle = normalizeQuery(query);
  const vocabulary = value.vocabulary;
  const searchTerms = value.search_terms;
  const fields = Array.isArray(value.fields) ? value.fields : [];
  const titleColumn = fields.indexOf("title");
  const rows = value.items;
  const selected: number[] = [];
  const selectedScores: Array<{ index: number; score: number }> = [];
  for (const [index, terms] of searchTerms.entries()) {
    if (!Array.isArray(terms)) return undefined;
    const row = rows[index];
    let match = false;
    let matchScore = 0;
    if (value.shard_id === "support") {
      for (const token of selectionTokens) {
        if (terms.some((termId) => typeof termId === "number" && typeof vocabulary[termId] === "string" && vocabulary[termId].includes(token))) {
          match = true;
          matchScore += 10;
        }
      }
    } else {
      match = selectionTokens.some((token) => terms.some((termId) => typeof termId === "number" && typeof vocabulary[termId] === "string" && vocabulary[termId].includes(token)));
    }
    if (!match && Array.isArray(row)) {
      for (const [column, value] of row.entries()) {
        if (!["id", "title", "search_aliases", "aliases", "provider"].includes(fields[column])) continue;
        const values = typeof value === "string" ? [value] : Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
        if (selectionTokens.some((token) => values.some((entry) => entry.toLocaleLowerCase("ko-KR").includes(token)))) {
          match = true;
          matchScore += 1;
          break;
        }
      }
    }
    if (match && value.shard_id === "support" && Array.isArray(row)) {
      const title = titleColumn >= 0 && typeof row[titleColumn] === "string" ? normalizeQuery(row[titleColumn]) : "";
      if (title === queryNeedle) matchScore += 1000;
      else if (queryNeedle && title.includes(queryNeedle)) matchScore += 500;
    }
    if (match) {
      selected.push(index);
      if (value.shard_id === "support") selectedScores.push({ index, score: matchScore });
    }
  }
  // ponytail: broad support queries inspect the first 256 ranked rows;
  // use a compact term index for exhaustive broad ranking if this ceiling proves too narrow.
  if (supportBroadQuery && (!selectionTokens.length || !selected.length || selected.length === value.items.length)) {
    return (selected.length ? selected : Array.from({ length: Math.min(256, rows.length) }, (_, index) => index)).slice(0, 256);
  }
  if (value.shard_id === "support" && selected.length > 256) {
    // Keep exact/strong title matches while bounding support hydration. The
    // source rows are already relevance-ordered; restore that order after the
    // score-based admission so downstream ranking remains deterministic.
    return selectedScores
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .slice(0, 256)
      .map(({ index }) => index)
      .sort((left, right) => left - right);
  }
  // An incomplete vocabulary must not turn a valid query into a false empty
  // result. Returning undefined preserves the existing full-shard fallback.
  if (!selected.length || selected.length === value.items.length) return undefined;
  return selected;
}

function parseSearchItems(value: unknown, source: string, selectedRows?: readonly number[]): readonly FinanceItem[] {
  let items: unknown;
  if (isRecord(value) && value.format === "openfin-hot-search-v1") {
    const fields = value.fields;
    const vocabulary = value.vocabulary;
    const searchTerms = value.search_terms;
    const rows = value.items;
    if (!Array.isArray(fields) || !fields.every((field) => typeof field === "string") || !Array.isArray(vocabulary) || !vocabulary.every((term) => typeof term === "string") || !Array.isArray(searchTerms) || !Array.isArray(rows) || !rows.every((row) => Array.isArray(row))) {
      throw new SearchIndexContractError(`${source} hot-search payload has invalid columnar fields`);
    }
    if (searchTerms.length !== rows.length || searchTerms.some((termIds) => !Array.isArray(termIds) || !termIds.every((termId) => Number.isInteger(termId) && termId >= 0 && termId < vocabulary.length))) {
      throw new SearchIndexContractError(`${source}.search_terms is invalid`);
    }
    const indexes = selectedRows ?? rows.map((_, index) => index);
    items = indexes.map((index) => {
      const row = rows[index];
      if (!Array.isArray(row)) throw new SearchIndexContractError(`${source}.items[${index}] is invalid`);
      const item: Record<string, unknown> = {};
      for (const [column, field] of fields.entries()) {
        if (row[column] !== null && row[column] !== undefined) item[field] = row[column];
      }
      const termIds = searchTerms[index];
      attachHotSearchMetadata(item as FinanceItem, vocabulary as string[], termIds as number[]);
      Object.setPrototypeOf(item, HOT_ITEM_PROTOTYPE);
      return item;
    });
  } else {
    items = Array.isArray(value) ? value : isRecord(value) ? value.items : undefined;
  }
  if (!Array.isArray(items) || !items.every(isFinanceItem)) {
    throw new SearchIndexContractError(`${source} must be a raw item array or an object with an items array`);
  }
  return items;
}

function parseTargetedExactItems(value: unknown, source: string, rawId: string, matchTitle = false): readonly FinanceItem[] {
  if (!isRecord(value) || value.format !== "openfin-hot-search-v1") return parseSearchItems(value, source);
  if (!Array.isArray(value.fields) || !value.fields.every((field) => typeof field === "string") || !Array.isArray(value.vocabulary) || !value.vocabulary.every((term) => typeof term === "string") || !Array.isArray(value.search_terms) || !Array.isArray(value.items) || !value.items.every((row) => Array.isArray(row))) {
    throw new SearchIndexContractError(`${source} exact payload has invalid columnar fields`);
  }
  const fields = value.fields as string[];
  const vocabulary = value.vocabulary as string[];
  const rows = value.items as unknown[][];
  const searchTerms = value.search_terms as unknown[];
  if (searchTerms.length !== rows.length) throw new SearchIndexContractError(`${source}.search_terms row count does not match items`);
  for (const [index, terms] of searchTerms.entries()) {
    if (!Array.isArray(terms) || !terms.every((termId) => Number.isInteger(termId) && termId >= 0 && termId < vocabulary.length)) {
      throw new SearchIndexContractError(`${source}.search_terms[${index}] is invalid`);
    }
  }
  if (value.item_count !== undefined) assertSearchItemCount(rows.length, value.item_count as number, source);
  let items: Record<string, unknown>[];
  try {
    items = decodeTargetedExactRows(fields, vocabulary, searchTerms as number[][], rows, resolveItemId(rawId), matchTitle);
  } catch (error) {
    throw new SearchIndexContractError(`${source} ${error instanceof Error ? error.message : String(error)}`);
  }
  for (const item of items) hydrateSupportHotFields(item);
  if (!items.every(isFinanceItem)) throw new SearchIndexContractError(`${source} exact payload selected an invalid finance item`);
  return items;
}

function parseSearchShard(value: unknown, source: string): SearchIndexShard {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.shard_id !== "string" || typeof value.path !== "string") {
    throw new SearchIndexContractError(`${source} must include id, shard_id, path, and integer item_count`);
  }
  const itemCount = value.item_count;
  if (typeof itemCount !== "number" || !Number.isInteger(itemCount)) {
    throw new SearchIndexContractError(`${source} must include id, shard_id, path, and integer item_count`);
  }
  if (value.url !== undefined && typeof value.url !== "string") {
    throw new SearchIndexContractError(`${source}.url must be a string when present`);
  }
  if (value.web_url !== undefined && typeof value.web_url !== "string") {
    throw new SearchIndexContractError(`${source}.web_url must be a string when present`);
  }
  if (value.export_checksum !== undefined && typeof value.export_checksum !== "string") {
    throw new SearchIndexContractError(`${source}.export_checksum must be a string when present`);
  }
  if (value.content_checksum !== undefined && typeof value.content_checksum !== "string") {
    throw new SearchIndexContractError(`${source}.content_checksum must be a string when present`);
  }
  return {
    id: value.id,
    shard_id: value.shard_id,
    path: value.path,
    url: value.url,
    web_url: value.web_url,
    item_count: itemCount,
    export_checksum: value.export_checksum,
    content_checksum: value.content_checksum,
  };
}

function parseSearchIndexFile(value: unknown, source: string): SearchIndexFile {
  if (!isRecord(value) || typeof value.version !== "string" || typeof value.basis_date !== "string") {
    throw new SearchIndexContractError(`${source} must include version and basis_date`);
  }
  const itemCount = value.item_count;
  if (itemCount !== undefined && (typeof itemCount !== "number" || !Number.isInteger(itemCount))) {
    throw new SearchIndexContractError(`${source}.item_count must be an integer when present`);
  }
  const items = value.items === undefined ? undefined : parseSearchItems(value.items, `${source}.items`);
  const shards = value.shards === undefined
    ? undefined
    : Array.isArray(value.shards)
      ? value.shards.map((shard, index) => parseSearchShard(shard, `${source}.shards[${index}]`))
      : (() => { throw new SearchIndexContractError(`${source}.shards must be an array when present`); })();
  if (value.export_checksum !== undefined && typeof value.export_checksum !== "string") {
    throw new SearchIndexContractError(`${source}.export_checksum must be a string when present`);
  }
  if (value.content_checksum !== undefined && typeof value.content_checksum !== "string") {
    throw new SearchIndexContractError(`${source}.content_checksum must be a string when present`);
  }
  return { version: value.version, basis_date: value.basis_date, item_count: itemCount, export_checksum: value.export_checksum, content_checksum: value.content_checksum, items, shards };
}

function assertSearchItemCount(actual: number, expected: number | undefined, source: string): void {
  if (!Number.isInteger(expected)) {
    throw new SearchIndexContractError(`${source} is missing integer item_count`);
  }
  if (actual !== expected) {
    throw new SearchIndexContractError(`${source} item_count=${expected} but hydrated ${actual} items`);
  }
}

function assertEmbeddedItemCount(value: unknown, items: readonly unknown[], source: string): void {
  if (!isRecord(value) || value.item_count === undefined) return;
  if (typeof value.item_count !== "number") {
    throw new SearchIndexContractError(`${source}.item_count must be an integer when present`);
  }
  assertSearchItemCount(items.length, value.item_count, source);
}

async function loadSearchIndexMetadata(env: Env, signal?: AbortSignal): Promise<SearchIndexFile> {
  const now = Date.now();
  if (cachedSearchIndexMetadata && cachedSearchIndexMetadata.generation === manifestGeneration && now - cachedSearchIndexMetadata.loadedAt < CACHE_TTL_MS) {
    return cachedSearchIndexMetadata.data;
  }
  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  if (!manifest.search_index) {
    throw new SearchIndexContractError("finance manifest is missing search_index metadata");
  }
  if (manifest.search_index.shards?.length) {
    const data = parseSearchIndexFile({
      version: manifest.version,
      basis_date: manifest.basis_date,
      item_count: manifest.search_index.item_count,
      export_checksum: manifest.search_index.export_checksum,
      content_checksum: manifest.search_index.content_checksum,
      shards: manifest.search_index.shards,
    }, `${manifestUrl}#search_index`);
    cachedSearchIndexMetadata = { data, loadedAt: now, generation: manifestGeneration };
    return data;
  }
  const indexUrl = resolveExportUrl(manifest.search_index, manifestUrl);
  const rawText = await fetchText(indexUrl, undefined, signal);
  if (manifest.search_index.content_checksum && !(await verifyTextChecksum(rawText, manifest.search_index.content_checksum))) {
    throw new SearchIndexContractError("finance manifest search_index content checksum mismatch");
  }
  let rawData: unknown;
  try {
    rawData = JSON.parse(rawText);
  } catch (error) {
    throw new SearchIndexContractError(`finance manifest search_index is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  // Search-root checksums are defined over the compact `items` payload by
  // the knowledge build. Keep that scope explicit so checksum validation is
  // identical for local and deployed artifacts.
  const checksumPayload = isRecord(rawData) && Array.isArray(rawData.items) ? rawData.items : rawData;
  if (!manifest.search_index.content_checksum && !(await verifySearchChecksum(checksumPayload, manifest.search_index.export_checksum))) {
    throw new SearchIndexContractError("finance manifest search_index checksum mismatch");
  }
  const data = parseSearchIndexFile(rawData, indexUrl);
  cachedSearchIndexMetadata = { data, loadedAt: now, generation: manifestGeneration };
  return data;
}

async function loadSearchItems(env: Env, signal?: AbortSignal): Promise<readonly FinanceItem[]> {
  const now = Date.now();
  if (cachedSearchItems && cachedSearchItems.generation === manifestGeneration && now - cachedSearchItems.loadedAt < CACHE_TTL_MS) {
    return cachedSearchItems.items;
  }

  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  const metadata = await loadSearchIndexMetadata(env, signal);
  const inlineItems = metadata.items;
  if (inlineItems) {
    assertSearchItemCount(inlineItems.length, metadata.item_count, "search-index root");
    assertSearchItemCount(inlineItems.length, manifest.search_index?.item_count, "finance manifest search_index");
    cachedSearchItems = { items: inlineItems, loadedAt: now, generation: manifestGeneration };
    return inlineItems;
  }

  const shards = metadata.shards ?? manifest.search_index?.shards;
  if (!shards?.length) {
    throw new SearchIndexContractError("search-index manifest has neither inline items nor shards");
  }
  // A root without compact items must never fan out across an unbounded set of
  // detailed shards in a Worker request. Releases with large shard sets must
  // publish compact root items; small legacy snapshots remain supported.
  if (shards.length > 32) {
    throw new SearchIndexContractError("search-index root requires compact inline items when shard count exceeds 32");
  }
  const shardItems = await Promise.all(shards.map(async (shard) => {
    return loadSearchShard(env, shard, undefined, undefined, signal);
  }));
  const items = shardItems.flat();
  assertSearchItemCount(items.length, metadata.item_count, "search-index root");
  assertSearchItemCount(items.length, manifest.search_index?.item_count, "finance manifest search_index");
  cachedSearchItems = { items, loadedAt: now, generation: manifestGeneration };
  return items;
}

async function loadSearchShard(env: Env, shard: SearchIndexShard, diagnostics?: RequestDiagnostics, query?: string, signal?: AbortSignal): Promise<readonly FinanceItem[]> {
  pruneStaleSearchShardRequests();
  const key = shard.path || shard.shard_id;
  const requestGeneration = manifestGeneration;
  const pendingKey = generationCacheKey(requestGeneration, key);
  const isExactFetchShard = /^exact-/.test(shard.shard_id);
  const cache = isExactFetchShard ? cachedExactFetchShards : (shard.item_count ?? 0) > LARGE_SEARCH_SHARD_ITEM_COUNT ? cachedLargeSearchShards : cachedSmallSearchShards;
  const cacheKind: SearchShardCacheKind = isExactFetchShard ? "exact" : cache === cachedLargeSearchShards ? "large" : "small";
  const cacheLimit = MAX_SEARCH_CACHE_ENTRIES;
  const url = resolveExportUrl(shard, financeManifestUrl(env));
  const cached = cache.get(key);
  const cachedPayload = cachedHotSearchPayloads.get(key);
  if (cached && cached.generation !== manifestGeneration) removeSearchCacheEntry(cacheKind, key);
  if (cachedPayload && cachedPayload.generation !== manifestGeneration) removeSearchCacheEntry("payload", key);
  if (cached?.generation === manifestGeneration && query === undefined) {
    if (diagnostics) diagnostics.cache_hits += 1;
    searchCacheBudget.touch(searchCacheBudgetKey(cacheKind, key));
    cache.delete(key);
    cache.set(key, cached);
    return cached.items;
  }
  if (cached?.generation === manifestGeneration && query !== undefined && cachedPayload?.generation !== manifestGeneration) {
    if (diagnostics) diagnostics.cache_hits += 1;
    searchCacheBudget.touch(searchCacheBudgetKey(cacheKind, key));
    return cached.items.filter((item) => searchTextIncludes(item, query));
  }

  const recordFailure = (error: unknown): void => {
    if (!diagnostics) return;
    const message = error instanceof Error ? error.message : String(error);
    diagnostics.failure_class = classifyRuntimeFailure(error);
    const status = Number(message.match(/\b([45]\d{2})\b/)?.[1] ?? 0);
    recordShardDiagnostic(diagnostics, {
      shard_id: shard.shard_id,
      cache_kind: cacheKind,
      item_count: 0,
      raw_bytes: 0,
      decoded_rows: 0,
      cache_hit: false,
      cache_miss: true,
      raw_text_units: 0,
      fetch_ms: 0,
      checksum_ms: 0,
      parse_ms: 0,
      hydrate_ms: 0,
      total_ms: 0,
      http_status: status,
      failure_class: diagnostics.failure_class,
      error: message.slice(0, 512),
    });
  };

  const hydrate = (loaded: LoadedSearchShard, cacheHit: boolean): readonly FinanceItem[] => {
    const hydrateStarted = diagnostics ? diagnosticNow() : 0;
    const rowIndexes = query === undefined ? undefined : hotSearchRowIndexes(loaded.payload, query);
    const partial = rowIndexes !== undefined;
    const items = parseSearchItems(loaded.payload, loaded.source, rowIndexes);
    if (!partial) {
      assertSearchItemCount(items.length, shard.item_count, `search-index shard ${shard.shard_id}`);
      assertEmbeddedItemCount(loaded.payload, items, `search-index shard ${shard.shard_id}`);
    } else {
      const rows = isRecord(loaded.payload) && Array.isArray(loaded.payload.items) ? loaded.payload.items : undefined;
      if (rows) assertSearchItemCount(rows.length, shard.item_count, `search-index shard ${shard.shard_id}`);
      assertEmbeddedItemCount(loaded.payload, rows ?? [], `search-index shard ${shard.shard_id}`);
    }
    // Hot columnar payloads already retain their validated source rows when
    // admitted below. Keeping a second full object projection doubles isolate
    // pressure; materialize it per request instead.
    const hotPayload = isRecord(loaded.payload) && loaded.payload.format === "openfin-hot-search-v1";
    if (!partial && !hotPayload && requestGeneration !== "uninitialized" && isCurrentGeneration(requestGeneration, manifestGeneration)) {
      while (cache.size >= cacheLimit) {
        const oldest = cache.keys().next().value as string | undefined;
        if (oldest === undefined) break;
        if (removeSearchCacheEntry(cacheKind, oldest) && diagnostics) diagnostics.evictions += 1;
      }
      const admission = searchCacheBudget.admit(searchCacheBudgetKey(cacheKind, key), loaded.rawBytes, items.length);
      removeBudgetEvictions(admission.evicted, diagnostics);
      if (!admission.accepted && diagnostics) diagnostics.budget_exceeded += 1;
      if (admission.accepted) cache.set(key, { items, loadedAt: Date.now(), generation: requestGeneration, bytes: loaded.rawBytes, decodedRows: items.length });
    }
    if (diagnostics) {
      const hydrateMs = diagnosticNow() - hydrateStarted;
      const cacheKindForDiagnostic: SearchShardCacheKind = isRecord(loaded.payload) && loaded.payload.format === "openfin-hot-search-v1" ? "payload" : cacheKind;
      recordShardDiagnostic(diagnostics, {
        shard_id: shard.shard_id,
        cache_kind: cacheKindForDiagnostic,
        item_count: items.length,
        raw_bytes: loaded.rawBytes,
        decoded_rows: items.length,
        cache_hit: cacheHit,
        cache_miss: !cacheHit,
        raw_text_units: cacheHit ? 0 : loaded.rawTextUnits,
        fetch_ms: cacheHit ? 0 : roundDiagnosticMs(loaded.fetchMs),
        checksum_ms: cacheHit ? 0 : roundDiagnosticMs(loaded.checksumMs),
        parse_ms: cacheHit ? 0 : roundDiagnosticMs(loaded.parseMs),
        hydrate_ms: roundDiagnosticMs(hydrateMs),
        total_ms: roundDiagnosticMs((cacheHit ? 0 : loaded.fetchMs + loaded.checksumMs + loaded.parseMs) + hydrateMs),
      });
    }
    return items;
  };

  if (cachedPayload?.generation === manifestGeneration && cachedPayload.payload !== undefined) {
    if (diagnostics) diagnostics.cache_hits += 1;
    searchCacheBudget.touch(searchCacheBudgetKey("payload", key));
    cachedHotSearchPayloads.delete(key);
    cachedHotSearchPayloads.set(key, cachedPayload);
    try {
      return hydrate({ payload: cachedPayload.payload, source: url, rawBytes: cachedPayload.bytes ?? 0, rawTextUnits: 0, fetchMs: 0, checksumMs: 0, parseMs: 0 }, true);
    } catch (error) {
      recordFailure(error);
      throw error;
    }
  }
  if (diagnostics) diagnostics.cache_misses += 1;
  if (cached && removeSearchCacheEntry(cacheKind, key) && diagnostics) diagnostics.evictions += 1;
  const pending = inFlightSearchShards.get(pendingKey);
  if (pending) {
    retainSearchShardConsumer(pendingKey);
    if (diagnostics) diagnostics.in_flight_reuses += 1;
    try {
      return hydrate(await waitForAbort(pending, signal), false);
    } catch (error) {
      recordFailure(error);
      throw error;
    } finally {
      releaseSearchShardConsumer(pendingKey);
    }
  }
  const requestController = new AbortController();
  retainSearchShardConsumer(pendingKey);
  if (signal?.aborted) requestController.abort();
  const request = (async (): Promise<LoadedSearchShard> => {
    let releaseSlot: SearchShardSlotRelease | undefined;
    let rawText = "";
    let rawBytes = 0;
    let fetchMs = 0;
    let checksumMs = 0;
    let parseMs = 0;
    let inflightReserved = false;
    try {
      releaseSlot = await acquireSearchShardSlot(requestController.signal);
      const fetchStarted = diagnosticNow();
      rawText = await fetchText(url, MAX_SINGLE_SHARD_BYTES, requestController.signal);
      fetchMs = diagnosticNow() - fetchStarted;
      rawBytes = new TextEncoder().encode(rawText).byteLength;
      inflightReserved = searchCacheBudget.reserveInflight(pendingKey, rawBytes);
      if (!inflightReserved) throw new SearchIndexContractError(`search-index shard ${shard.shard_id} exceeds the in-flight cache budget`);
      if (shard.content_checksum) {
        const checksumStarted = diagnosticNow();
        if (!(await verifyTextChecksum(rawText, shard.content_checksum))) {
          throw new SearchIndexContractError(`search-index shard ${shard.shard_id} content checksum mismatch`);
        }
        checksumMs += diagnosticNow() - checksumStarted;
      }
      let payload: unknown;
      const parseStarted = diagnosticNow();
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        throw new SearchIndexContractError(`search-index shard ${shard.shard_id} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      parseMs = diagnosticNow() - parseStarted;
      const checksumPayload = isRecord(payload) && Array.isArray(payload.items) ? payload.items : payload;
      if (!shard.content_checksum) {
        const checksumStarted = diagnosticNow();
        if (!(await verifySearchChecksum(checksumPayload, shard.export_checksum))) {
          throw new SearchIndexContractError(`search-index shard ${shard.shard_id} checksum mismatch`);
        }
        checksumMs += diagnosticNow() - checksumStarted;
      }
      const rows = isRecord(payload) && Array.isArray(payload.items) ? payload.items : undefined;
      if (isRecord(payload) && payload.format === "openfin-hot-search-v1") {
        if (rows) assertSearchItemCount(rows.length, shard.item_count, `search-index shard ${shard.shard_id}`);
        assertEmbeddedItemCount(payload, rows ?? [], `search-index shard ${shard.shard_id}`);
      }
      const hotPayload = isRecord(payload) && payload.format === "openfin-hot-search-v1";
      const cacheableHotPayload = hotPayload && (
        (shard.shard_id === "support" && rawBytes <= MAX_CACHED_SUPPORT_PAYLOAD_BYTES) ||
        (shard.shard_id === "bank-products" && rawBytes <= MAX_SINGLE_SHARD_BYTES)
      );
      if (cacheableHotPayload && requestGeneration !== "uninitialized" && isCurrentGeneration(requestGeneration, manifestGeneration)) {
        while (cachedHotSearchPayloads.size >= cacheLimit) {
          const oldest = cachedHotSearchPayloads.keys().next().value as string | undefined;
          if (oldest === undefined) break;
          removeSearchCacheEntry("payload", oldest);
        }
        const admission = searchCacheBudget.admit(searchCacheBudgetKey("payload", key), rawBytes, shard.item_count ?? 0);
        removeBudgetEvictions(admission.evicted);
        if (admission.accepted) cachedHotSearchPayloads.set(key, { items: [], payload, loadedAt: Date.now(), generation: requestGeneration, bytes: rawBytes, decodedRows: shard.item_count ?? 0 });
      }
      return { payload, source: url, rawBytes, rawTextUnits: rawText.length, fetchMs, checksumMs, parseMs };
    } finally {
      releaseSlot?.();
      if (inflightReserved) searchCacheBudget.releaseInflight(pendingKey);
      rawText = "";
      if (inFlightSearchShardControllers.get(pendingKey) === requestController) inFlightSearchShardControllers.delete(pendingKey);
    }
  })();
  inFlightSearchShards.set(pendingKey, request);
  inFlightSearchShardStartedAt.set(pendingKey, Date.now());
  inFlightSearchShardControllers.set(pendingKey, requestController);
  const cleanup = () => {
    if (inFlightSearchShards.get(pendingKey) !== request) return;
    inFlightSearchShards.delete(pendingKey);
    inFlightSearchShardStartedAt.delete(pendingKey);
  };
  void request.then(cleanup, cleanup);
  try {
    return hydrate(await waitForAbort(request, signal), false);
  } catch (error) {
    recordFailure(error);
    throw error;
  } finally {
    releaseSearchShardConsumer(pendingKey);
  }
}

const SEARCH_SHARD_BY_DOMAIN: Record<string, string> = {
  card: "card-products", loan: "bank-products", insurance: "insurance-products",
  deposit: "bank-products", saving: "bank-products", support: "support",
};

// The compatibility search root is intentionally complete, but hydrating all
// 21k records for every Worker query exceeds the public Worker resource limit.
// Route bounded queries to the smallest authoritative shard first; the root
// remains the compatibility fallback for genuinely cross-domain searches.
function searchShardForQuery(
  query: string,
  type?: string,
  searchType?: string,
  productKind?: string,
): string | undefined {
  const normalized = normalizeQuery(query);
  if (type === "account-product" || productKind === "housing-subscription" || /^finance\.account\./.test(normalized) || /청약통장|주택드림|isa|개인종합자산관리/.test(normalized)) return "account-products";
  if (type === "support-program" || SUPPORT_INTENT_RE.test(normalized)) return "support";
  if (type === "card-product" || /카드|마일리지|전월실적|연회비/.test(normalized)) return "card-products";
  if (type === "insurance-product" || /보험|실손|실비/.test(normalized)) return "insurance-products";
  if (type === "bank-product" || ["deposit", "saving", "loan"].includes(searchType ?? "") || /대출|예금|적금|은행|bank-products/.test(normalized)) return "bank-products";
  if (type === "financial-product" || PROTECTION_QUERY_RE.test(normalized)) return "deposit-protection";
  if (type && (SEARCH_TYPE_GROUPS[type] || ["tax", "term", "concept", "category", "source", "filing", "deadline"].includes(type))) return "reference";
  if (TAX_INTENT_RE.test(normalized)) return "reference";
  return undefined;
}

async function loadDetailedItemsForDomain(env: Env, domain: string, asOf?: string, signal?: AbortSignal): Promise<readonly FinanceItem[]> {
  const manifest = await loadFinanceManifest(env);
  if ((domain === "deposit" || domain === "saving") && manifest.decision_offers) {
    const offers = await loadSearchShard(env, manifest.decision_offers, undefined, undefined, signal);
    const sourceRegistry = await loadFinanceArtifact(env, "source_registry", manifest);
    const sourceRegistryMap = sourceRegistry === undefined
      ? undefined
      : new Map(artifactRecords(sourceRegistry).map((entry) => [String(entry.id ?? entry.source_id ?? entry.sourceId), entry]));
    return offers.flatMap((offer) => adaptDecisionOfferOptions(offer, domain, asOf, sourceRegistryMap) as FinanceItem[]);
  }
  const detailShards = manifest.detail_search_index?.shards ?? manifest.search_index?.shards;
  const shardId = SEARCH_SHARD_BY_DOMAIN[domain];
  const shard = detailShards?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  return shard ? loadSearchShard(env, shard, undefined, undefined, signal) : loadSearchItems(env, signal);
}

function decisionOptionItems(offer: FinanceItem, domain: "deposit" | "saving"): FinanceItem[] {
  return adaptDecisionOfferOptions(offer, domain) as FinanceItem[];
}

async function loadTargetedExactShardItems(env: Env, shard: SearchIndexShard, lookup: string, matchTitle = false, signal?: AbortSignal): Promise<readonly FinanceItem[]> {
  const key = shard.path || shard.shard_id;
  const pendingKey = generationCacheKey(manifestGeneration, key);
  let pending = inFlightExactFetchShards.get(pendingKey);
  if (!pending) {
    pending = (async () => {
      const source = resolveExportUrl(shard, financeManifestUrl(env));
      const rawText = await fetchText(source, undefined, signal);
      if (shard.content_checksum && !(await verifyTextChecksum(rawText, shard.content_checksum))) {
        throw new SearchIndexContractError(`search-index shard ${shard.shard_id} content checksum mismatch`);
      }
      let payload: unknown;
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        throw new SearchIndexContractError(`search-index shard ${shard.shard_id} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (!shard.content_checksum && !(await verifySearchChecksum(isRecord(payload) && Array.isArray(payload.items) ? payload.items : payload, shard.export_checksum))) {
        throw new SearchIndexContractError(`search-index shard ${shard.shard_id} checksum mismatch`);
      }
      const rows = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.items) ? payload.items : undefined;
      if (!rows) throw new SearchIndexContractError(`search-index shard ${shard.shard_id} exact payload has no items`);
      assertSearchItemCount(rows.length, shard.item_count, `search-index shard ${shard.shard_id}`);
      assertEmbeddedItemCount(payload, rows, `search-index shard ${shard.shard_id}`);
      return { payload, source };
    })().finally(() => inFlightExactFetchShards.delete(pendingKey));
    inFlightExactFetchShards.set(pendingKey, pending);
  }
  const { payload, source } = await pending;
  return parseTargetedExactItems(payload, source, lookup, matchTitle);
}

async function loadSearchItemsForQuery(
  env: Env,
  query: string,
  type?: string,
  searchType?: string,
  productKind?: string,
  diagnostics?: RequestDiagnostics,
  signal?: AbortSignal,
): Promise<readonly FinanceItem[]> {
  const manifest = await loadFinanceManifest(env);
  const exactShards = manifest.exact_fetch_index?.shards;
  const exactProductLookup = isNamedProductQuery(query)
    && (Boolean(searchType || productKind) || Boolean(providerForQuery(query)));
  const exactTypedLookup = ["account-product", "bank-product", "card-product", "insurance-product"].includes(type ?? "")
    && (queryTokens(query).length >= 3 || compactProductText(query).length >= 10);
  const exactLookupRequested = exactProductLookup || exactTypedLookup;
  if (exactShards?.length && exactLookupRequested) {
    const exactShardId = await exactFetchShardId(query);
    const exactShard = exactShards.find((candidate) => candidate.shard_id === exactShardId || candidate.id === exactShardId);
    if (exactShard) {
      const exactItems = await loadTargetedExactShardItems(env, exactShard, query, true, signal);
      const normalized = normalizeQuery(query);
      const exactMatches = exactItems.filter((item) => [item.title, ...(item.search_aliases ?? []), ...(item.aliases ?? []), ...(item.legacy_ids ?? [])]
        .some((value) => normalizeQuery(value) === normalized));
      if (exactMatches.length) return exactMatches;
    }
  }
  const shardId = searchShardForQuery(query, type, searchType, productKind);
  const hotShards = manifest.hot_search_index?.shards;
  if (!shardId) {
    const reference = hotShards?.find((candidate) => candidate.shard_id === "reference" || candidate.id === "reference")
      ?? manifest.search_index?.shards?.find((candidate) => candidate.shard_id === "reference" || candidate.id === "reference");
    return reference ? loadSearchShard(env, reference, diagnostics, query, signal) : loadSearchItems(env, signal);
  }
  const shard = hotShards?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId)
    ?? manifest.search_index?.shards?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  return shard ? loadSearchShard(env, shard, diagnostics, query, signal) : loadSearchItems(env, signal);
}

async function loadExactFetchItems(env: Env, manifest: FinanceManifest, itemId: string, signal?: AbortSignal): Promise<readonly FinanceItem[] | undefined> {
  const shards = manifest.exact_fetch_index?.shards;
  if (!shards?.length) return undefined;
  for (const cached of cachedExactFetchShards.values()) {
    if (cached.generation === manifestGeneration && resolveCanonicalItemId(itemId, cached.items)) return cached.items;
  }
  for (const cache of [cachedSmallSearchShards, cachedLargeSearchShards]) {
    for (const cached of cache.values()) {
      if (cached.generation !== manifestGeneration) continue;
      const item = cached.items.find((candidate) => candidate.id === itemId);
      if (item) return [item];
    }
  }
  const shardId = await exactFetchShardId(itemId);
  const shard = shards.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  return shard ? loadTargetedExactShardItems(env, shard, itemId, false, signal) : [];
}

async function hydrateSearchItem(env: Env, item: FinanceItem, signal?: AbortSignal): Promise<FinanceItem> {
  const manifest = await loadFinanceManifest(env);
  const shardId = item.provenance_shard ?? item.shard_id;
  const detailShards = manifest.detail_search_index?.shards ?? manifest.search_index?.shards;
  const shard = shardId && detailShards?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  if (!shard) return item;
  const detailed = (await loadSearchShard(env, shard, undefined, undefined, signal)).find((candidate) => candidate.id === item.id);
  return detailed ? { ...item, ...detailed } : item;
}

async function loadFinanceGraph(env: Env): Promise<FinanceGraph> {
  const now = Date.now();
  if (cachedGraph && cachedGraph.generation === manifestGeneration && now - cachedGraph.loadedAt < CACHE_TTL_MS) {
    return cachedGraph.data;
  }

  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  const itemsById = new Map<string, FinanceItem>();

  for (const entry of manifest.exports) {
    for (const item of mergeOntologyExportItems(await loadOntologyExportPayloads(entry, manifestUrl)) as FinanceItem[]) {
      if (!itemsById.has(item.id)) {
        itemsById.set(item.id, item);
      }
    }
  }

  const data = {
    version: manifest.version,
    basis_date: manifest.basis_date,
    manifest,
    exports: manifest.exports,
    items: [...itemsById.values()].sort((a, b) => a.id.localeCompare(b.id, "ko-KR")),
  };
  cachedGraph = { data, loadedAt: now, generation: manifestGeneration };
  return data;
}

function indexItems(data: FinanceGraph): Map<string, FinanceItem> {
  return new Map(data.items.map((item) => [item.id, item]));
}

function resolveItemId(rawId: string): string {
  const trimmed = rawId.trim();
  for (const prefix of ["finance://", "opentax://"]) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }

  try {
    const url = new URL(trimmed);
    const hashId = decodeURIComponent(url.hash.replace(/^#/, ""));
    if (hashId) {
      return hashId;
    }
  } catch {
    // Not a URL; use the raw value as an ontology id.
  }

  return trimmed;
}

function itemAliases(item: FinanceItem): readonly string[] {
  return [
    ...(item.legacy_ids ?? []),
    ...(item.search_aliases ?? []),
    ...(item.aliases ?? []),
    ...(item.source_records ?? []).flatMap((record) => [record.id, record.source_record_id].filter((value): value is string => typeof value === "string")),
    ...(item.external_product_ids ?? []).flatMap((identifier) => [identifier.value]),
  ];
}

function resolveCanonicalItemId(rawId: string, items: readonly FinanceItem[]): FinanceItem | undefined {
  const itemId = normalizeQuery(resolveItemId(rawId));
  const direct = items.find((item) => normalizeQuery(item.id) === itemId || normalizeQuery(item.canonical_product_id ?? "") === itemId || itemAliases(item).some((alias) => normalizeQuery(alias) === itemId));
  if (!direct) return undefined;
  const canonicalId = direct.resolved_canonical_product_id ?? direct.canonical_product_id ?? direct.id;
  return dedupeProductItems(items).find((item) => (item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id) === canonicalId) ?? direct;
}

function sourceItems(item: FinanceItem, itemsById: Map<string, FinanceItem>): FinanceItem[] {
  return (item.sources ?? [])
    .map((sourceId) => itemsById.get(sourceId))
    .filter((source): source is FinanceItem => Boolean(source));
}

function searchTypeForItemId(itemId: string): string {
  if (itemId.startsWith("support.")) return "support-program";
  if (itemId.startsWith("finance.account.")) return "account-product";
  if (itemId.startsWith("finance.card.")) return "card-product";
  if (itemId.startsWith("finance.insurance.")) return "insurance-product";
  if (/^finance\.(bank|deposit|saving|loan)\./.test(itemId)) return "bank-product";
  if (/^(credit|deduction|tax)\./.test(itemId)) return "tax";
  return "category";
}

function matchReasons(item: FinanceItem, query: string): string[] {
  const normalized = normalizeQuery(query);
  const reasons: string[] = [];
  if (normalizeQuery(item.id).includes(normalized)) {
    reasons.push("id");
  }
  if (normalizeQuery(item.title).includes(normalized)) {
    reasons.push("title");
  }
  if ((item.search_aliases ?? []).some((alias) => normalizeQuery(alias).includes(normalized))) {
    reasons.push("alias");
  }
  for (const token of queryTokens(query)) {
    if (searchTextIncludes(item, token)) {
      reasons.push(`token:${token}`);
    }
  }
  return [...new Set(reasons)].slice(0, 10);
}

function domainMatches(item: FinanceItem, domain: string): boolean {
  const normalizedDomain = normalizeQuery(domain);
  const itemDomain = productDomain(item);
  if (normalizedDomain === "deposit" || normalizedDomain === "saving") return item.type === "offer-option" && itemDomain === normalizedDomain;
  if (normalizedDomain === "loan") return item.type === "bank-product" && itemDomain === normalizedDomain;
  if (normalizedDomain === "card" || normalizedDomain === "insurance") return itemDomain === normalizedDomain;
  if (normalizedDomain === "support") {
    return item.type === "support-program";
  }
  return false;
}

function verificationEvidenceBlocker(item: FinanceItem): string | undefined {
  if (item.verification_status !== "verified") return "verification_not_verified";
  if (!isRecord(item.verification_evidence)) {
    return "missing_verification_evidence";
  }
  const checksums = item.verification_evidence.source_checksums;
  const evidence = item.verification_evidence.evidence;
  if (!Array.isArray(evidence) || !evidence.length || evidence.some((value) => !isRecord(value) || typeof value.source_url !== "string" || !value.source_url || typeof value.document_type !== "string" || !value.document_type || typeof value.locator !== "string" || !value.locator || !isPastOrCurrentIsoDate(value.captured_at) || (typeof value.field !== "string" && typeof value.verified_field !== "string") || (value.value === undefined && typeof value.source_text !== "string"))) return "invalid_verification_evidence";
  if (!item.source_records?.length) return "missing_source_records";
  const sourceChecksums = item.source_records
    .map((record) => record.source_checksum)
    .filter((checksum): checksum is string => typeof checksum === "string" && checksum.length > 0);
  if (sourceChecksums.length !== item.source_records.length) return "missing_source_checksum";
  if (!Array.isArray(checksums) || !sourceChecksums.every((checksum) => checksums.includes(checksum))) return "source_checksum_mismatch";
  const expiresAt = item.verification_evidence.expires_at;
  if (!isFutureOrCurrentIsoDate(expiresAt)) return "verification_expired";
  if (item.freshness_status === "stale") {
    return "stale_source";
  }
  if (["closed", "ended", "unknown", "suspended"].includes(item.status ?? "")) {
    return `status_${item.status}`;
  }
  return undefined;
}

function recommendationBlocker(item: FinanceItem, artifacts?: FinanceArtifacts): string | undefined {
  if (item.public_recommendation_exclusion_reasons?.length) return "public_recommendation_excluded";
  if (item.recommendation_approved !== true && item.capabilities?.recommendation !== "public") return "recommendation_capability_blocked";
  if (item.sales_status !== "active" || !isVerifiedActive(item.sales_verification_status)) return "sales_not_verified";
  if (artifacts && sourceHealth(item, artifacts).freshness_status !== "current") return "stale_source";
  if (item.type === "offer-option") return isRecord(item.evidence_gate) && item.evidence_gate.status === "eligible" ? undefined : "candidate_evidence_not_approved";
  return verificationEvidenceBlocker(item);
}

function reasonCounts(excluded: readonly { readonly reason: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of excluded) {
    counts[item.reason] = (counts[item.reason] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function productQualityScore(item: FinanceItem): number {
  return (item.verification_status === "verified" ? 1000 : 0)
    + (isVerifiedActive(item.sales_verification_status) ? 500 : 0)
    + Math.round((item.verified_completeness_ratio ?? item.completeness_ratio ?? 0) * 100)
    + (item.source_records?.length ?? 0)
    + (item.source_urls?.length ?? 0);
}

function dedupeProductItems(items: readonly FinanceItem[]): readonly FinanceItem[] {
  const cached = dedupedProductItemsCache.get(items);
  if (cached) return cached;
  const seen = new Set<string>();
  let hasDuplicate = false;
  for (const item of items) {
    const key = item.type === "card-product" || item.type === "bank-product" || item.type === "insurance-product"
      ? item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id
      : item.id;
    if (seen.has(key)) {
      hasDuplicate = true;
      break;
    }
    seen.add(key);
  }
  if (!hasDuplicate) {
    dedupedProductItemsCache.set(items, items);
    return items;
  }
  const selected = new Map<string, FinanceItem>();
  for (const item of items) {
    const key = item.type === "card-product" || item.type === "bank-product" || item.type === "insurance-product"
      ? item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id
      : item.id;
    const previous = selected.get(key);
    if (!previous || productQualityScore(item) > productQualityScore(previous)) selected.set(key, item);
  }
  const result = [...selected.values()];
  dedupedProductItemsCache.set(items, result);
  dedupedProductItemsCache.set(result, result);
  return result;
}

function requiredVerifiedCount(manifest: FinanceManifest | undefined, domain: string): number {
  const value = manifest?.domain_readiness?.[domain]?.required_verified_candidates;
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function comparisonReleaseGate(manifest: FinanceManifest, domain: string): { status: "ready" | "blocked"; reasons: string[] } {
  const state = manifest.domain_readiness?.[domain];
  const required = requiredVerifiedCount(manifest, domain);
  const capabilities = isRecord(manifest.capabilities) ? manifest.capabilities : {};
  const publicCount = typeof state?.public_comparison_candidate_count === "number" ? state.public_comparison_candidate_count : Number(state?.public_candidate_count ?? 0);
  const comparisonCapability = capabilities.comparison === undefined || capabilities.comparison === "limited" || capabilities.comparison === "ready";
  const ready = comparisonCapability && state?.status === "limited_public_ready" && publicCount >= required;
  return { status: ready ? "ready" : "blocked", reasons: ready ? [] : [`COMPARISON_DOMAIN_NOT_READY:${domain}`] };
}

function recommendationReadiness(domain: string, items: readonly FinanceItem[], minimumRequiredCount = 0): Record<string, number> {
  return {
    verified_active_product_count: items.filter((item) => item.sales_verification_status === "verified_active").length,
    verification_evidence_product_count: items.filter((item) => isRecord(item.verification_evidence)).length,
    comparison_engine_product_count: items.filter((item) => item.comparison_engine_gate_passed === true).length,
    verified_completeness_product_count: items.filter((item) => item.verified_completeness_ratio === 1).length,
    public_recommendation_candidate_count: items.filter((item) => recommendationBlocker(item) === undefined).length,
    minimum_required_count: minimumRequiredCount,
  };
}

function recommendationReadinessStates(domain: string, readiness: Record<string, number>): Record<string, string> {
  const comparisonDomain = domain === "deposit" || domain === "saving";
  return {
    discovery: "ready",
    comparison_engine: comparisonDomain && readiness.comparison_engine_product_count > 0 ? "ready" : comparisonDomain ? "blocked" : "not_applicable",
    sales_verification_pilot: readiness.verified_active_product_count >= readiness.minimum_required_count ? "ready" : "blocked",
    comparison_field_verification: comparisonDomain ? (readiness.comparison_engine_product_count > 0 ? "ready" : "blocked") : "not_applicable",
    live_comparison: comparisonDomain ? (readiness.comparison_engine_product_count > 0 ? "ready" : "blocked") : "not_applicable",
    public_recommendation: readiness.public_recommendation_candidate_count > 0 ? "ready" : "blocked",
  };
}

function nextRecommendationActions(domain: string, readiness: Record<string, number>): readonly Record<string, unknown>[] {
  if (readiness.verified_active_product_count === 0) return [{ code: "VERIFY_SALES_STATUS", affected_product_count: readiness.minimum_required_count }];
  if ((domain === "deposit" || domain === "saving") && readiness.public_recommendation_candidate_count === 0 && readiness.verification_evidence_product_count > 0 && readiness.comparison_engine_product_count === 0) {
    return [
      { code: "VERIFY_COMPARISON_FIELDS", affected_product_count: readiness.verification_evidence_product_count },
      { code: "PASS_DOMAIN_GATE", affected_product_count: readiness.verification_evidence_product_count },
    ];
  }
  if (readiness.public_recommendation_candidate_count === 0 && readiness.verification_evidence_product_count > 0) {
    return [{ code: "VERIFY_RECOMMENDATION_FIELDS", affected_product_count: readiness.verification_evidence_product_count }];
  }
  if (readiness.public_recommendation_candidate_count === 0) return [{ code: "REVIEW_PUBLIC_RECOMMENDATION_FLAG", affected_product_count: readiness.minimum_required_count }];
  return [{ code: "USE_VERIFIED_PUBLIC_CANDIDATES", affected_product_count: readiness.public_recommendation_candidate_count }];
}

function nextRecommendationAction(domain: string, readiness: Record<string, number>): string {
  const action = nextRecommendationActions(domain, readiness)[0];
  if (action.code === "VERIFY_SALES_STATUS") return `Verify ${domain} product sales status.`;
  if (action.code === "VERIFY_COMPARISON_FIELDS" || action.code === "PASS_DOMAIN_GATE") return `Complete ${domain} comparison field verification.`;
  if (action.code === "VERIFY_RECOMMENDATION_FIELDS") return `Complete ${domain} recommendation field verification.`;
  if (action.code === "REVIEW_PUBLIC_RECOMMENDATION_FLAG") return `Review ${domain} public recommendation approval and feature flag.`;
  return "Use verified public recommendation candidates.";
}

function comparisonBlockers(domain: string, excludedSummary: Record<string, number>): readonly Record<string, unknown>[] {
  const salesNotVerified = excludedSummary.sales_not_verified ?? 0;
  const fieldNotVerified = excludedSummary.comparison_fields_not_verified ?? 0;
  const staleSource = excludedSummary.stale_source ?? 0;
  const label = domain === "deposit" ? "정기예금" : "적금";
  return [
    ...(salesNotVerified ? [{ code: "SALES_NOT_VERIFIED", count: salesNotVerified, message: `판매상태가 검증되지 않은 ${label}입니다.` }] : []),
    ...(fieldNotVerified ? [{ code: "COMPARISON_FIELDS_NOT_VERIFIED", count: fieldNotVerified, message: `비교 필드 검증이 끝나지 않은 ${label}입니다.` }] : []),
    ...(staleSource ? [{ code: "SOURCE_NOT_CURRENT", count: staleSource, message: `출처 상태가 current가 아닌 ${label}입니다.` }] : []),
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFutureOrCurrentIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value && value >= new Date().toISOString().slice(0, 10);
}

function isPastOrCurrentIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
}

function comparisonBlocker(item: FinanceItem, artifacts: FinanceArtifacts | undefined, salesVerificationTtlHours: number, asOf?: string): string | undefined {
  if (item.comparison_exclusion_reasons?.length) return "comparison_excluded";
  if (item.comparison_approved !== true && item.capabilities?.comparison !== "limited_public" && item.capabilities?.comparison !== "public") return "comparison_capability_blocked";
  if (item.source_listing_status !== "listed") return "source_not_listed";
  if (!isVerifiedActive(item.sales_verification_status)) return "sales_not_verified";
  if ((artifacts && item.type !== "offer-option" ? sourceHealth(item, artifacts).freshness_status : item.source_freshness_status ?? item.freshness_status) !== "current") return "stale_source";
  const rawVerifiedAt = item.sales_verified_at;
  const verifiedAt = typeof rawVerifiedAt === "string" ? Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(rawVerifiedAt) ? `${rawVerifiedAt}T00:00:00Z` : rawVerifiedAt) : Number.NaN;
  const ttlMs = salesVerificationTtlHours * 60 * 60 * 1000;
  const evaluationTime = typeof asOf === "string" ? Date.parse(`${asOf}T23:59:59Z`) : Number.NaN;
  if (!Number.isFinite(evaluationTime) || !Number.isFinite(verifiedAt) || !Number.isFinite(ttlMs) || ttlMs <= 0 || verifiedAt > evaluationTime || evaluationTime - verifiedAt > ttlMs) return "stale_source";
  if (item.verification_status !== "verified") return "not_verified";
  if (item.type !== "offer-option") {
    const evidenceBlocker = verificationEvidenceBlocker(item);
    if (evidenceBlocker) return evidenceBlocker;
  } else if (!isRecord(item.evidence_gate) || item.evidence_gate.status !== "eligible") return "candidate_evidence_not_approved";
  if (item.comparison_engine_gate_passed !== true) return "comparison_fields_not_verified";
  if (["closed", "ended", "unknown", "suspended"].includes(item.status ?? "")) return `status_${item.status}`;
  return undefined;
}

function comparisonOptionCandidates(item: FinanceItem, termMonths: number): readonly Record<string, unknown>[] {
  return (item.comparison_options ?? []).filter(
    (value): value is Record<string, unknown> => isRecord(value) && value.term_months === termMonths && typeof value.base_rate_percent === "number",
  );
}

function comparisonOptionBlocker(option: Record<string, unknown>, domain: string, depositAmount: number | undefined, monthlyPayment: number | undefined, joinChannels: readonly string[], savingMethod: string | undefined): string | undefined {
  const optionChannels = Array.isArray(option.join_channels) ? option.join_channels.filter((value): value is string => typeof value === "string").map((value) => normalizeQuery(value)) : [];
  if (joinChannels.length && (!optionChannels.length || !joinChannels.some((channel) => optionChannels.includes(normalizeQuery(channel))))) return "join_channel_mismatch";
  if (depositAmount !== undefined && typeof option.maximum_deposit_krw === "number" && depositAmount > option.maximum_deposit_krw) return "amount_exceeds_limit";
  if (depositAmount !== undefined && typeof option.minimum_deposit_krw === "number" && depositAmount < option.minimum_deposit_krw) return "amount_below_minimum";
  if (monthlyPayment !== undefined && typeof option.monthly_payment_max_krw === "number" && monthlyPayment > option.monthly_payment_max_krw) return "monthly_payment_exceeds_limit";
  if (monthlyPayment !== undefined && typeof option.monthly_payment_min_krw === "number" && monthlyPayment < option.monthly_payment_min_krw) return "monthly_payment_below_minimum";
  if (domain === "saving" && savingMethod && (typeof option.saving_method !== "string" || option.saving_method !== savingMethod)) return "saving_method_mismatch";
  if (!Array.isArray(option.source_urls) || !option.source_urls.length) return "missing_source_url";
  return undefined;
}

function comparisonCandidate(item: FinanceItem, option: Record<string, unknown>, facts: Record<string, unknown>, depositAmount: number | undefined, monthlyPayment: number | undefined, taxRatePercent: number): Record<string, unknown> {
  const baseRate = option.base_rate_percent;
  const maximumRate = typeof option.maximum_rate_percent === "number" ? option.maximum_rate_percent : baseRate;
  if (typeof baseRate !== "number" || typeof maximumRate !== "number") throw new Error("Comparison option has invalid rate fields");
  const attainable = resolveAttainableRate({ ...item, ...option }, facts);
  const achievableRate = attainable.rate_percent ?? baseRate;
  const termMonths = typeof option.term_months === "number" ? option.term_months : 0;
  const isDeposit = productDomain(item) === "deposit";
  const amountMissing = isDeposit ? depositAmount === undefined : monthlyPayment === undefined;
  const outcomeDetail = amountMissing ? null : calculateFinancialOutcome(
    { ...item, ...option, product_kind: isDeposit ? "deposit" : "saving", base_rate_percent: baseRate, maximum_rate_percent: maximumRate },
    { ...facts, principal_krw: depositAmount, monthly_payment_krw: monthlyPayment, tax_rate_percent: taxRatePercent },
  );
  const outcome = outcomeDetail?.outcome ?? null;
  const baseOutcome = outcomeDetail?.financial_outcomes.base.outcome ?? null;
  const optimisticOutcome = outcomeDetail?.financial_outcomes.optimistic.outcome ?? null;
  const ranking = rankCandidate({ ...item, ...option, id: option.option_id ?? item.id, product_kind: isDeposit ? "deposit" : "saving" }, { ...facts, principal_krw: depositAmount, monthly_payment_krw: monthlyPayment, tax_rate_percent: taxRatePercent });
  const principal = outcome?.principal_krw ?? null;
  return comparisonCandidateAdapter({
    item_id: item.id,
    candidate_id: option.candidate_id ?? option.option_id ?? item.id,
    option_id: option.option_id ?? item.option_id,
    offer_id: item.offer_id,
    title: item.title,
    provider: item.provider,
    base_rate_percent: baseRate,
    maximum_rate_percent: maximumRate,
    achievable_rate_percent: achievableRate,
    matched_preferential_conditions: attainable.matched_conditions,
    unmatched_preferential_conditions: [],
    unknown_preferential_conditions: attainable.unknown_conditions,
    deposit_limit: option.maximum_deposit_krw,
    monthly_payment_limit: option.monthly_payment_max_krw,
    term_months: option.term_months,
    saving_method: option.saving_method,
    join_channel: option.join_channels ?? [],
    sales_verified_at: item.sales_verified_at,
    data_as_of: item.sales_verified_at ?? item.last_verified_at ?? item.source_basis_dates?.[0] ?? null,
    source: option.source_urls ?? item.source_urls ?? [],
    confidence: isVerifiedActive(item.sales_verification_status) ? "verified" : "insufficient_information",
    score_components: { achievable_rate_percent: achievableRate, source_verified: 1 },
    source_urls: option.source_urls,
    source_assertion_ids: item.source_assertion_ids ?? option.source_assertion_ids ?? [],
    source_assertions: item.source_assertions ?? option.source_assertions ?? [],
    source_basis_dates: item.source_basis_dates ?? [],
    comparison_basis_fields: item.comparison_basis_fields ?? [],
    comparison_object_version: COMPARISON_ENGINE_VERSION,
    comparison_field_verification_status: item.comparison_field_verification_status,
    comparison_field_verification: item.comparison_field_verification ?? {},
    missing_required_fields: (item.missing_required_fields ?? []).filter((field) => !(field === "sales_verification_status" && item.sales_verification_status === "verified_active")),
    principal_krw: principal,
    gross_interest_krw: outcome?.gross_interest_krw ?? null,
    tax_rate_percent: taxRatePercent,
    tax_withheld_krw: outcome?.tax_withheld_krw ?? null,
    net_interest_krw: outcome?.net_interest_krw ?? null,
    calculation_assumption: amountMissing ? (isDeposit ? "deposit_amount_required" : "monthly_payment_required") : outcome?.calculation_assumption,
    financial_outcomes: {
      attainable: { annual_rate_percent: achievableRate, outcome },
      base: { annual_rate_percent: option.base_rate_percent, outcome: baseOutcome },
      optimistic: { annual_rate_percent: maximumRate, outcome: optimisticOutcome },
      early_termination: outcomeDetail?.financial_outcomes.early_termination ?? { annual_rate_percent: null, outcome: null, limitations: ["verified early-termination rate is unavailable"] },
    },
    ranking_key: ranking.ranking_key,
    ranking_version: "openfin-ranking-v2",
    policy_version: "openfin-comparison-policy-v1",
  });
}

async function fetchItemGraph(env: Env, rawId: string, include: readonly string[] = [], signal?: AbortSignal): Promise<{ item: FinanceItem; itemsById: Map<string, FinanceItem> }> {
  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  const resolvedItemId = resolveItemId(rawId);
  const directExportId = exportIdForItemId(resolvedItemId);
  const exactItems = rawId.startsWith("missing.") ? undefined : await loadExactFetchItems(env, manifest, resolvedItemId, signal);
  let indexedItem = exactItems ? resolveCanonicalItemId(rawId, exactItems) : undefined;
  if (!indexedItem && exactItems === undefined && !rawId.startsWith("missing.")) {
    indexedItem = resolveCanonicalItemId(rawId, await loadSearchItemsForQuery(env, resolvedItemId, searchTypeForItemId(resolvedItemId), undefined, undefined, undefined, signal));
  }
  if (!indexedItem && exactItems === undefined && !rawId.startsWith("missing.")) {
    indexedItem = resolveCanonicalItemId(rawId, await loadSearchItems(env, signal));
  }
  if (!indexedItem && exactItems !== undefined) throw new Error(`Finance ontology item not found: ${rawId}`);
  const itemId = indexedItem?.id ?? resolvedItemId;
  if (rawId.startsWith("missing.")) throw new Error(`Finance ontology item not found: ${rawId}`);
  if (indexedItem?.type === "support-program") materializeSupportHotFields(indexedItem);
  // Summary/source/provenance fetches must stay on bounded hot/detail shards.
  // Full exports are reserved for explicit graph/raw expansion, which is the
  // only mode that needs the complete item graph or unprojected fields.
  const wantsFullDetail = include.includes("relations") || include.includes("raw");
  if (indexedItem && !wantsFullDetail) {
    if (needsSummaryDetailHydration(directExportId, indexedItem.provenance_shard)) {
      const detailed = await hydrateSearchItem(env, indexedItem, signal);
      return { item: detailed, itemsById: new Map([[detailed.id, detailed]]) };
    }
    return { item: indexedItem, itemsById: new Map([[indexedItem.id, indexedItem]]) };
  }
  // Non-product nodes are fully represented in the compact index when no
  // detail shard is declared; avoid loading every ontology export.
  if (indexedItem && (!directExportId || directExportId === "local-government-supports-ontology") && !["card-product", "bank-product", "insurance-product"].includes(indexedItem.type)) {
    return { item: indexedItem, itemsById: new Map([[indexedItem.id, indexedItem]]) };
  }
  const candidateExports = directExportId
    ? manifest.exports.filter((entry) => entry.id === directExportId)
    : indexedItem?.export_id
    ? manifest.exports.filter((entry) => entry.id === indexedItem.export_id)
    : manifest.exports;

  for (const entry of candidateExports) {
    const payloads = await loadOntologyExportPayloads(entry, manifestUrl, signal);
    const items = mergeOntologyExportItems(payloads) as FinanceItem[];
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const item = itemsById.get(itemId);
    if (item) {
      return {
        item: indexedItem?.canonical_product_id
          ? { ...item, ...indexedItem, criteria: item.criteria, options: item.options, benefits: item.benefits }
          : item,
        itemsById,
      };
    }
  }

  throw new Error(`Finance ontology item not found: ${rawId}`);
}

async function runtimeMetadata(env: Env, manifest: FinanceManifest, metadata: SearchIndexFile): Promise<Record<string, unknown>> {
  const itemCount = metadata.item_count ?? manifest.search_index?.item_count ?? 0;
  return {
    runtime_version: env.RUNTIME_VERSION ?? "openfin-mcp-dev",
    deployment_commit: env.DEPLOYMENT_COMMIT ?? "unknown",
    build_timestamp: env.BUILD_TIMESTAMP ?? null,
    artifact_generation: env.ARTIFACT_GENERATION ?? manifest.generation_id ?? null,
    manifest_version: manifest.version,
    loaded_index_checksum: metadata.export_checksum ?? manifest.search_index?.shards?.map((shard) => shard.export_checksum ?? "").join("") ?? null,
    loaded_item_count: itemCount,
  };
}

function financeKeyToken(value: unknown): string {
  return String(value).toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}

const MAX_FINANCE_INPUT_DEPTH = 12;
const MAX_FINANCE_INPUT_NODES = 1_000;
const MAX_FINANCE_OBJECT_KEYS = 100;
const MAX_FINANCE_ARRAY_ITEMS = 200;
const MAX_FINANCE_STRING_LENGTH = 4_096;

function assertFinanceSafe(value: unknown, path = "input", depth = 0, counter: { value: number } = { value: 0 }): void {
  if (depth > MAX_FINANCE_INPUT_DEPTH) throw new Error(`input nesting exceeds ${MAX_FINANCE_INPUT_DEPTH} levels at ${path}`);
  counter.value += 1;
  if (counter.value > MAX_FINANCE_INPUT_NODES) throw new Error(`input contains more than ${MAX_FINANCE_INPUT_NODES} values`);
  if (typeof value === "string") {
    if (value.length > MAX_FINANCE_STRING_LENGTH) throw new Error(`string exceeds ${MAX_FINANCE_STRING_LENGTH} characters at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_FINANCE_ARRAY_ITEMS) throw new Error(`array has more than ${MAX_FINANCE_ARRAY_ITEMS} items at ${path}`);
    value.forEach((child, index) => assertFinanceSafe(child, `${path}[${index}]`, depth + 1, counter));
    return;
  }
  if (!isRecord(value)) return;
  if (Object.keys(value).length > MAX_FINANCE_OBJECT_KEYS) throw new Error(`object has more than ${MAX_FINANCE_OBJECT_KEYS} keys at ${path}`);
  for (const [key, child] of Object.entries(value)) {
    const token = financeKeyToken(key);
    if (SENSITIVE_KEY_TOKENS.has(token) || ["password", "token", "secret", "privatekey"].some((suffix) => token.endsWith(suffix))) {
      throw new Error(`sensitive field is not accepted: ${path}.${key}`);
    }
    assertFinanceSafe(child, `${path}.${key}`, depth + 1, counter);
  }
}

function financeNumber(value: unknown, field: string, allowNegative = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || (!allowNegative && value < 0)) throw new Error(`${field} must be a finite ${allowNegative ? "" : "non-negative "}number`);
  return Math.round(value * 1_000_000) / 1_000_000;
}

function optionalFinanceNumber(value: unknown, field: string): number | null {
  return value === undefined || value === null || value === "" ? null : financeNumber(value, field);
}

function normalizeFinanceSnapshot(raw: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!raw) return {};
  assertFinanceSafe(raw);
  const expenses = isRecord(raw.expenses) ? raw.expenses : {};
  const firstNumber = (keys: readonly string[], field: string, source: Record<string, unknown> = raw): number | null => {
    const key = keys.find((candidate) => source[candidate] !== undefined && source[candidate] !== null && source[candidate] !== "");
    return key ? financeNumber(source[key], field) : null;
  };
  const rawLiabilities = raw.liabilities === undefined ? [] : Array.isArray(raw.liabilities) ? raw.liabilities : [raw.liabilities];
  const liabilities = rawLiabilities.map((value, index) => {
    if (!isRecord(value)) throw new Error(`liabilities[${index}] must be an object`);
    const balance = firstNumber(["balance_krw", "balance", "principal_krw"], `liabilities[${index}].balance_krw`, value);
    if (balance === null) throw new Error(`liabilities[${index}].balance_krw is required`);
    return {
      id: String(value.id ?? `liability-${index + 1}`), kind: String(value.kind ?? "unspecified"), balance_krw: balance,
      annual_rate_percent: optionalFinanceNumber(value.annual_rate_percent ?? value.rate_percent, `liabilities[${index}].annual_rate_percent`),
      monthly_payment_krw: optionalFinanceNumber(value.monthly_payment_krw ?? value.monthly_payment, `liabilities[${index}].monthly_payment_krw`),
    };
  });
  const goals = Array.isArray(raw.goals) ? raw.goals.map((value, index) => {
    if (!isRecord(value)) throw new Error(`goals[${index}] must be an object`);
    const target = firstNumber(["target_amount_krw", "amount_krw", "amount"], `goals[${index}].target_amount_krw`, value);
    if (target === null) throw new Error(`goals[${index}].target_amount_krw is required`);
    return { id: String(value.id ?? `goal-${index + 1}`), target_amount_krw: target, current_funding_krw: firstNumber(["current_funding_krw", "current_amount_krw", "current"], `goals[${index}].current_funding_krw`, value) ?? 0, target_date: value.target_date ?? null, liquidity_need: String(value.liquidity_need ?? "unknown") };
  }) : [];
  const snapshot: Record<string, unknown> = {
    as_of: raw.as_of ?? raw.profile_as_of ?? null, currency: String(raw.currency ?? "KRW").toUpperCase(),
    monthly_net_income_krw: firstNumber(["monthly_net_income_krw", "monthly_net_income", "monthly_income_krw", "monthly_income"], "monthly_net_income_krw"),
    essential_monthly_expenses_krw: firstNumber(["essential_monthly_expenses_krw", "essential_expenses_krw", "essential_monthly_expenses"], "essential_monthly_expenses_krw") ?? firstNumber(["essential_krw", "essential_monthly_krw", "essential"], "essential_monthly_expenses_krw", expenses),
    discretionary_monthly_expenses_krw: firstNumber(["discretionary_monthly_expenses_krw", "optional_monthly_expenses_krw", "discretionary_expenses_krw"], "discretionary_monthly_expenses_krw") ?? firstNumber(["discretionary_krw", "optional_krw", "discretionary"], "discretionary_monthly_expenses_krw", expenses) ?? 0,
    liquid_assets_krw: firstNumber(["liquid_assets_krw", "liquid_assets"], "liquid_assets_krw"), investment_assets_krw: firstNumber(["investment_assets_krw", "investment_assets"], "investment_assets_krw"), other_assets_krw: firstNumber(["other_assets_krw", "other_assets"], "other_assets_krw") ?? 0,
    liabilities, goals, dependents: Math.trunc(financeNumber(raw.dependents ?? 0, "dependents")), liquidity_requirement: raw.liquidity_requirement ?? null,
    risk_tolerance: String(raw.risk_tolerance ?? "unknown"), risk_capacity: String(raw.risk_capacity ?? "unknown"), constraints: isRecord(raw.constraints) ? raw.constraints : {}, asset_allocation: isRecord(raw.asset_allocation) ? raw.asset_allocation : {}, insurance_coverage: isRecord(raw.insurance_coverage) ? raw.insurance_coverage : {},
  };
  if (snapshot.as_of !== null && (typeof snapshot.as_of !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.as_of))) throw new Error("as_of must use YYYY-MM-DD");
  return snapshot;
}

function financeAuditId(...values: unknown[]): string {
  const stable = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(stable);
    if (isRecord(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
    return value;
  };
  const source = JSON.stringify(stable(values));
  let hash = 2166136261;
  for (const character of source) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return `fin-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function financeSafety(fields: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    mode: "decision_support", status: "ready", reason_codes: [], profile_as_of: null, data_as_of: null,
    assumptions: [], missing_information: [], financial_needs: [], candidates: [], decision_owner: "user", limitations: [], audit_id: financeAuditId(fields),
    as_of: null,
    source: [{ kind: "ontology_or_deterministic_runtime" }],
    confidence: "derived",
    ...fields,
  };
}

function standardResult(payload: Record<string, unknown>): Record<string, unknown> {
  return {
    ...payload,
    as_of: payload.as_of ?? payload.data_as_of ?? payload.profile_as_of ?? null,
    source: payload.source ?? [{ kind: "ontology_or_deterministic_runtime" }],
    confidence: payload.confidence ?? "declared",
    limitations: payload.limitations ?? [],
  };
}

const STANDARD_OUTPUT_SCHEMA = z.object({
  as_of: z.string().nullable(),
  source: z.array(z.record(z.string(), z.unknown())),
  confidence: z.string(),
  limitations: z.array(z.unknown()),
}).passthrough();

function financeMetric(name: string, value: number | null, formula: string, inputs: Record<string, unknown>, snapshot: Record<string, unknown>, assumptions: string[] = []): Record<string, unknown> {
  return { metric: name, value: value === null ? null : Math.round(value * 1_000_000) / 1_000_000, formula, inputs, assumptions, calculated_at: snapshot.as_of ?? "unspecified", policy_version: PERSONAL_FINANCE_POLICY_VERSION };
}

function financeMetrics(snapshot: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const liabilities = Array.isArray(snapshot.liabilities) ? snapshot.liabilities.filter(isRecord) : [];
  const debt = liabilities.reduce((sum, item) => sum + Number(item.balance_krw ?? 0), 0);
  const debtService = liabilities.reduce((sum, item) => sum + Number(item.monthly_payment_krw ?? 0), 0);
  const income = typeof snapshot.monthly_net_income_krw === "number" ? snapshot.monthly_net_income_krw : null;
  const essential = typeof snapshot.essential_monthly_expenses_krw === "number" ? snapshot.essential_monthly_expenses_krw : null;
  const discretionary = Number(snapshot.discretionary_monthly_expenses_krw ?? 0);
  const surplus = income === null || essential === null ? null : income - essential - discretionary - debtService;
  const liquid = typeof snapshot.liquid_assets_krw === "number" ? snapshot.liquid_assets_krw : null;
  const weightedItems = liabilities.filter((item) => typeof item.annual_rate_percent === "number");
  const weightedBalance = weightedItems.reduce((sum, item) => sum + Number(item.balance_krw ?? 0), 0);
  const weightedRate = weightedBalance ? weightedItems.reduce((sum, item) => sum + Number(item.balance_krw) * Number(item.annual_rate_percent), 0) / weightedBalance : null;
  const liquidity = isRecord(snapshot.liquidity_requirement) ? (typeof snapshot.liquidity_requirement.required_amount_krw === "number" ? snapshot.liquidity_requirement.required_amount_krw : typeof snapshot.liquidity_requirement.months === "number" && essential !== null ? snapshot.liquidity_requirement.months * essential : null) : typeof snapshot.liquidity_requirement === "number" ? snapshot.liquidity_requirement : null;
  const coverage = isRecord(snapshot.insurance_coverage) && typeof snapshot.insurance_coverage.required_coverage_krw === "number" ? Math.max(0, snapshot.insurance_coverage.required_coverage_krw - Number(snapshot.insurance_coverage.current_coverage_krw ?? 0)) : null;
  const assets = Number(snapshot.liquid_assets_krw ?? 0) + Number(snapshot.investment_assets_krw ?? 0) + Number(snapshot.other_assets_krw ?? 0);
  return {
    net_worth: financeMetric("net_worth", assets - debt, "liquid_assets + investment_assets + other_assets - liability_balances", { assets_krw: assets, liabilities_krw: debt }, snapshot),
    monthly_surplus: financeMetric("monthly_surplus", surplus, "net_income - essential_expenses - discretionary_expenses - debt_service", { income_krw: income, essential_krw: essential, discretionary_krw: discretionary, debt_service_krw: debtService }, snapshot),
    savings_rate: financeMetric("savings_rate", income && surplus !== null ? surplus / income : null, "monthly_surplus / monthly_net_income", { income_krw: income, surplus_krw: surplus }, snapshot, income ? [] : ["income must be positive"]),
    emergency_fund_months: financeMetric("emergency_fund_months", liquid !== null && essential ? liquid / essential : null, "liquid_assets / essential_monthly_expenses", { liquid_assets_krw: liquid, essential_krw: essential }, snapshot, ["only liquid assets are counted"]),
    debt_service_ratio: financeMetric("debt_service_ratio", income ? debtService / income : null, "monthly_debt_service / monthly_net_income", { debt_service_krw: debtService, income_krw: income }, snapshot),
    weighted_debt_rate_percent: financeMetric("weighted_debt_rate_percent", weightedRate, "sum(balance * annual_rate) / sum(balance)", { rate_known_balance_krw: weightedBalance, liability_count: weightedItems.length }, snapshot, ["liabilities without a known rate are excluded"]),
    liquidity_gap: financeMetric("liquidity_gap", liquidity !== null && liquid !== null ? Math.max(0, liquidity - liquid) : null, "max(0, required_liquidity - liquid_assets)", { required_liquidity_krw: liquidity, liquid_assets_krw: liquid }, snapshot),
    goal_funding_gap: financeMetric("goal_funding_gap", (Array.isArray(snapshot.goals) ? snapshot.goals.filter(isRecord) : []).reduce((sum, goal) => sum + Math.max(0, Number(goal.target_amount_krw) - Number(goal.current_funding_krw ?? 0)), 0), "sum(max(0, target_amount - current_funding))", { goal_count: Array.isArray(snapshot.goals) ? snapshot.goals.length : 0 }, snapshot),
    insurance_coverage_gap: financeMetric("insurance_coverage_gap", coverage, "max(0, required_coverage - current_coverage)", {}, snapshot, ["coverage need must be explicitly supplied"]),
  };
}

function financeNeeds(snapshot: Record<string, unknown>, metrics: Record<string, Record<string, unknown>>): Record<string, unknown>[] {
  const missing = ["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => snapshot[key] === null || snapshot[key] === undefined || snapshot[key] === "");
  const needs: Record<string, unknown>[] = missing.length ? [{ need_type: "information_completion", priority: 1, status: "blocked", evidence: missing, action: "request_missing_finance_snapshot_fields" }] : [];
  const add = (name: string, priority: number, evidence: Record<string, unknown>, action: string) => needs.push({ need_type: name, priority, status: "active", evidence, action });
  const value = (name: string) => metrics[name]?.value;
  if (typeof value("monthly_surplus") === "number" && Number(value("monthly_surplus")) < 0) add("cashflow_stabilization", 1, { monthly_surplus_krw: value("monthly_surplus") }, "reduce_deficit_before_product_selection");
  if (typeof value("weighted_debt_rate_percent") === "number" && Number(value("weighted_debt_rate_percent")) >= HIGH_INTEREST_DEBT_RATE_PERCENT) add("high_interest_debt", 2, { weighted_debt_rate_percent: value("weighted_debt_rate_percent") }, "compare_debt_paydown_scenarios");
  if (typeof value("emergency_fund_months") === "number" && Number(value("emergency_fund_months")) < MINIMUM_EMERGENCY_FUND_MONTHS) add("emergency_liquidity", 2, { emergency_fund_months: value("emergency_fund_months"), target_months: MINIMUM_EMERGENCY_FUND_MONTHS }, "protect_liquid_principal");
  if (typeof value("liquidity_gap") === "number" && Number(value("liquidity_gap")) > 0) add("liquidity_gap", 2, { liquidity_gap_krw: value("liquidity_gap") }, "avoid_locking_required_liquidity");
  if (typeof value("insurance_coverage_gap") === "number" && Number(value("insurance_coverage_gap")) > 0) add("insurance_coverage_gap", 3, { coverage_gap_krw: value("insurance_coverage_gap") }, "review_protection_gap_as_lookup_only");
  for (const goal of Array.isArray(snapshot.goals) ? snapshot.goals.filter(isRecord) : []) {
    const liquidityNeed = String(goal.liquidity_need ?? "unknown");
    if (["high", "short", "principal"].includes(liquidityNeed)) add("short_horizon_goal", 2, { goal_id: goal.id ?? null, target_date: goal.target_date ?? null }, "prefer_liquid_principal_preserving_options");
    if (["low", "long", "growth"].includes(liquidityNeed)) add("long_horizon_goal", 4, { goal_id: goal.id ?? null, target_date: goal.target_date ?? null }, "separate_long_horizon_risk_discussion");
  }
  return needs.sort((a, b) => Number(a.priority) - Number(b.priority) || String(a.need_type).localeCompare(String(b.need_type)));
}

function createServer(env: Env, diagnostics?: RequestDiagnostics, requestSignal?: AbortSignal): McpServer {
  const server = new McpServer({
    name: "finance",
    version: "0.2.0",
  });

  const mcpResult = (payload: Record<string, unknown>) => {
    const normalized = standardResult(payload);
    return { structuredContent: normalized, content: [{ type: "text" as const, text: jsonText(normalized) }] };
  };
  const financeResult = (payload: Record<string, unknown>) => mcpResult(financeSafety(payload));
  const toolContext = {
    server, env, mcpResult, financeResult, financeSafety, normalizeFinanceSnapshot, financeMetrics, financeNeeds,
    assertFinanceSafe, financeNumber, isRecord, evaluateEligibility, productDomain, financeAuditId,
    loadSearchItems: (requestEnv: Env) => loadSearchItems(requestEnv, requestSignal),
    hydrateSearchItem: (requestEnv: Env, item: FinanceItem) => hydrateSearchItem(requestEnv, item, requestSignal), PERSONAL_FINANCE_POLICY_VERSION, ADVICE_POLICY_VERSION,
    STANDARD_OUTPUT_SCHEMA, READ_ONLY_TOOL_ANNOTATIONS, jsonText,
    discoveryDomainForQuery, SUPPORT_INTENT_RE, dedupeProductItems,
    loadDetailedItemsForDomain: (requestEnv: Env, domain: string, asOf?: string) => loadDetailedItemsForDomain(requestEnv, domain, asOf, requestSignal),
    loadSearchItemsForQuery: (requestEnv: Env, query: string, type?: string, searchType?: string, productKind?: string) => loadSearchItemsForQuery(requestEnv, query, type, searchType, productKind, diagnostics, requestSignal),
    loadFinanceArtifacts, normalizeQuery, queryTokens, isNamedProductQuery, strictNamedProductPayload,
    isDiscoveryQuery, discoveryPayload, SEARCH_TYPE_GROUPS, inferredTypesForQuery,
    supportRegionForQuery, inferredSearchTypeForQuery, matchesSearchFilters, matchesSupportRegion,
    matchesSupportIntent, isPubliclySearchable, searchIncludes: searchTextIncludes, scoreItem, matchReasons, supportMatchTier,
    itemUrl, sourceHealth, reasonCounts, supportParsedQuery,
    loadFinanceManifest, evaluateReleaseGate,
    manifestChecksumContract: (manifest: Record<string, unknown>) => manifestChecksumContract(manifest as FinanceManifest),
    comparisonReleaseGate: (manifest: Record<string, unknown>, domain: string) => comparisonReleaseGate(manifest as FinanceManifest, domain),
    recommendationReadinessStates, nextRecommendationActions, nextRecommendationAction,
    buildRecommendationCandidates, domainMatches, recommendationReadiness, rankCandidate, explainCandidate,
    recommendationBlocker, EXCLUDED_SAMPLE_LIMIT,
    COMPARISON_ENGINE_VERSION,
    loadSearchIndexMetadata: (requestEnv: Env) => loadSearchIndexMetadata(requestEnv, requestSignal), comparisonBlocker, comparisonOptionCandidates, comparisonOptionBlocker, diversifyBroadResults,
    comparisonCandidate, comparisonBlockers,
    fetchItemGraph: (requestEnv: Env, rawId: string, include?: readonly string[]) => fetchItemGraph(requestEnv, rawId, include, requestSignal), resolveItemId, sourceItems, publicProvenance,
    loadProvenanceShard: (requestEnv: Env, manifest: Record<string, unknown>, shardId: string) => loadProvenanceShard(requestEnv, manifest as FinanceManifest, shardId), artifactErrors,
    loadFinanceArtifact: (requestEnv: Env, key: FinanceArtifactKey, manifest?: Record<string, unknown>) => loadFinanceArtifact(requestEnv, key, manifest as FinanceManifest | undefined), coverageReport,
    runtimeMetadata: (requestEnv: Env, manifest: Record<string, unknown>, metadata: { basis_date?: string }) => runtimeMetadata(requestEnv, manifest as FinanceManifest, metadata as SearchIndexFile),
  };

  registerPersonalFinanceTools(toolContext);
  server.registerTool("get_openfin_quality_status", {
    title: "Get OpenFin Quality Status",
    description: "Return manifest, index, and public-recommendation gate status without changing state.",
    inputSchema: {},
    annotations: { title: "Get OpenFin Quality Status", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async () => {
    const manifest = await loadFinanceManifest(env); const metadata = await loadSearchIndexMetadata(env);
    const [coverageArtifact, sourceRegistry, sourceStatus] = await Promise.all([
      loadFinanceArtifact(env, "provenance_coverage", manifest),
      loadFinanceArtifact(env, "source_registry", manifest),
      loadFinanceArtifact(env, "source_status", manifest),
    ]);
    const coverage = coverageReport(coverageArtifact);
    const live = manifest._live_regression ?? manifest.openfin_120_live_regression ?? {};
    const releaseStatus = asCapabilityStatus(manifest.capabilities?.search ?? manifest.core_search_status ?? manifest.platform_release_status ?? manifest.release_status);
    const blockingReasons = manifest.blocking_reasons ?? [];
    const releaseGate = evaluateReleaseGate({ manifest: manifest as unknown as Record<string, unknown>, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT });
    return financeResult(financeSafety({
      status: releaseGate.status === "ready" ? "ready" : "blocked",
      reason_codes: releaseGate.status === "ready" ? [] : ["QUALITY_RELEASE_BLOCKED", ...releaseGate.reasons],
      data_as_of: manifest.basis_date,
      missing_information: blockingReasons,
      assumptions: ["quality status reflects the loaded manifest and search index"],
      quality_status: { manifest_version: manifest.version, generation_id: manifest.generation_id ?? null, service_availability: asServiceAvailability(manifest.service_availability, "degraded"), core_search_status: releaseStatus, release_status: releaseStatus, comparison_status: asCapabilityStatus(manifest.capabilities?.comparison ?? manifest.comparison_status ?? manifest.comparison_release_status), recommendation_status: asCapabilityStatus(manifest.capabilities?.recommendation ?? manifest.recommendation_status ?? manifest.recommendation_release_status), basis_date: manifest.basis_date, search_index_item_count: metadata.item_count ?? null, loaded_index_checksum: metadata.export_checksum ?? null, quality_exports: manifest.quality_exports ?? [], openfin_120_live_regression: live, public_recommendation_enabled: Boolean(manifest.recommendation_enabled), release_gate: releaseGate, provenance_artifacts: { source_registry: manifest.source_registry ?? null, source_status: manifest.source_status ?? null, provenance_index: manifest.provenance_index ?? null, provenance_coverage: manifest.provenance_coverage ?? null, relationship_index: manifest.relationship_index ?? null }, source_health: { registry_loaded: sourceRegistry !== undefined, status_loaded: sourceStatus !== undefined, provenance_loaded: false, coverage_loaded: coverageArtifact !== undefined, relationships_loaded: false, coverage, artifact_errors: artifactErrors() } },
      limitations: ["quality status is not a product recommendation", ...blockingReasons],
    }));
  });

  server.registerTool("update_finance_snapshot", {
    title: "Update Personal Finance Snapshot",
    description: "Persistence is fail-closed: owner authentication, explicit confirmation, and an enabled persistence binding are all required, and this public Worker never persists snapshots.",
    inputSchema: { snapshot: PERSONAL_FINANCE_SNAPSHOT_SCHEMA, owner_authenticated: z.boolean(), explicit_confirmation: z.boolean(), persistence_enabled: z.boolean() },
    annotations: { title: "Update Personal Finance Snapshot", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot, owner_authenticated, explicit_confirmation, persistence_enabled }) => {
    assertFinanceSafe(snapshot); const reasons = [!owner_authenticated ? "OWNER_AUTH_REQUIRED" : null, !explicit_confirmation ? "EXPLICIT_CONFIRMATION_REQUIRED" : null, !persistence_enabled ? "PERSISTENCE_FLAG_REQUIRED" : null, "PERSISTENCE_BACKEND_NOT_CONFIGURED"].filter((value): value is string => Boolean(value));
    return financeResult(financeSafety({ status: "blocked", reason_codes: reasons, assumptions: ["the public Worker does not persist personal financial snapshots"], missing_information: reasons, financial_needs: [], candidates: [], limitations: ["no snapshot was written", "use a separately authenticated owner-controlled persistence service"] }));
  });

  registerSearchTool(toolContext);

  registerDiscoverTool(toolContext);

  registerRecommendTool(toolContext);

  registerRecommendShadowTool(toolContext);

  registerRecommendOwnerPilotTool(toolContext);

  registerCompareTool(toolContext);

  registerFetchTool(toolContext);

  registerExportsTool(toolContext);

  return server;
}

async function healthResponse(env: Env): Promise<Response> {
  try {
    const manifest = await loadFinanceManifest(env);
    return Response.json(livenessPayload(env, financeManifestUrl(env), {
      generation_id: manifest.generation_id ?? null,
      manifest_deployment_commit: manifest.deployment_commit ?? null,
      service_availability: asServiceAvailability(manifest.service_availability, "degraded"),
      source_head_commit: manifest.source_head_commit ?? null,
      release_candidate_commit: manifest.release_candidate_commit ?? null,
      production_commit: manifest.production_commit ?? null,
      production_deployed_at: manifest.production_deployed_at ?? null,
      core_search_status: asCapabilityStatus(manifest.capabilities?.search ?? manifest.core_search_status ?? manifest.platform_release_status ?? manifest.release_status),
      comparison_status: asCapabilityStatus(manifest.capabilities?.comparison ?? manifest.comparison_status ?? manifest.comparison_release_status),
      recommendation_status: asCapabilityStatus(manifest.capabilities?.recommendation ?? manifest.recommendation_status ?? manifest.recommendation_release_status),
      source_freshness_status: manifest.source_freshness_status ?? "degraded",
      artifact_contract: manifest.artifact_contract ?? null,
    }));
  } catch {
    return Response.json(livenessPayload(env, financeManifestUrl(env), { generation_id: null }));
  }
}

async function readyResponse(env: Env): Promise<Response> {
  let manifest: FinanceManifest | undefined;
  let metadata: SearchIndexFile | undefined;
  let artifactsLoaded = false;
  let checksumVerified = false;
  try {
    manifest = await loadFinanceManifest(env);
    metadata = await loadSearchIndexMetadata(env);
    const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status", "provenance_coverage"] , manifest);
    artifactsLoaded = artifacts.source_registry !== undefined && artifacts.source_status !== undefined && artifacts.provenance_coverage !== undefined;
    checksumVerified = manifestChecksumContract(manifest) && artifactsLoaded;
  } catch (error) {
    financeArtifactErrors.set("ready", { error: error instanceof Error ? error.message : String(error), failed_at: new Date().toISOString() });
  }
  const loadedAt = [cachedManifest?.loadedAt, cachedSearchIndexMetadata?.loadedAt].filter((value): value is number => typeof value === "number");
  const payload = readinessPayload({ env, manifest: manifest as unknown as Record<string, unknown> | undefined, metadata: metadata as unknown as Record<string, unknown> | undefined, artifactsLoaded, checksumVerified, cacheAgeMs: loadedAt.length ? Date.now() - Math.min(...loadedAt) : undefined, manifestUrl: financeManifestUrl(env) });
  return Response.json({ ...payload, artifact_errors: artifactErrors() }, { status: payload.capabilities.core === "ready" ? 200 : 503, headers: { "cache-control": "no-store" } });
}

function openAiAppsChallengeResponse(env: Env): Response {
  const token = env.OPENAI_APPS_CHALLENGE_TOKEN?.trim();
  if (!token) {
    return new Response("OpenAI Apps challenge token is not configured.", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  return new Response(token, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return healthResponse(env);
    }
    if (url.pathname === "/ready") {
      return readyResponse(env);
    }
    if (url.pathname === OPENAI_APPS_CHALLENGE_PATH) {
      return openAiAppsChallengeResponse(env);
    }

    const diagnostics = requestDiagnostics(request);
    const server = createServer(env, diagnostics, request.signal);
    // Keep the request promise open until the tool handler has produced its
    // result. Streamable SSE responses can otherwise be closed by the
    // stateless Worker runtime while a shard-backed tool is still hydrating.
    // JSON mode uses the same MCP transport and is accepted by the live client.
    const handler = createMcpHandler(server, { route: "/mcp", enableJsonResponse: true });
    try {
      const response = await handler(request, env, ctx);
      return diagnostics ? attachDiagnostics(response, diagnostics, env) : response;
    } finally {
      if (request.method === "POST") await server.close().catch(() => undefined);
    }
  },
} satisfies ExportedHandler<Env>;
