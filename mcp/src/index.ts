import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generationCacheKey, isCurrentGeneration, SingleFlight } from "./generation-cache";
import { resolveSourceStatus } from "./source-status";
import { evaluateReleaseGate } from "./release-gate";
import { evaluateEligibility, productDomain, recommendationFields } from "./recommendation/policy";
import { explainCandidate } from "./recommendation/explanation";
import { rankCandidate } from "./recommendation/ranking";
import { buildRecommendationCandidates } from "./tools/recommend";
import { registerPersonalFinanceTools } from "./tools/personal-finance";
import { registerSearchTool } from "./tools/search";
import { registerDiscoverTool } from "./tools/discover";
import { registerRecommendTool } from "./tools/recommend-handler";
import { registerCompareTool } from "./tools/compare";
import { registerFetchTool } from "./tools/fetch";
import { registerExportsTool } from "./tools/exports";
import { livenessPayload, readinessPayload } from "./health";
import { isVerifiedActive } from "./product-status";
import { calculateDepositReturn } from "./calculators/deposit";
import { calculateSavingReturn } from "./calculators/saving";

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
  provenance?: Record<string, unknown>[];
  provenance_shard?: string;
  shard_id?: string;
  promotion_receipt?: Record<string, unknown>;
  risk_level?: string;
  structured_summary?: Record<string, unknown>;
  search_facets?: Record<string, unknown>;
};

type OntologyExport = {
  version: string;
  basis_date: string;
  domain?: string;
  items: FinanceItem[];
  reference_items?: FinanceItem[];
};

type ManifestEntry = {
  id: string;
  domain: string;
  path: string;
  url?: string;
  web_url?: string;
  item_count?: number;
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
  release_status?: string;
  core_search_status?: string;
  platform_release_status?: string;
  comparison_release_status?: string;
  comparison_status?: string;
  recommendation_release_status?: string;
  recommendation_status?: string;
  generation_id?: string;
  deployment_commit?: string;
  source_freshness_status?: string;
  artifact_contract?: Record<string, unknown>;
  recommendation_enabled?: boolean;
  blocking_reasons?: string[];
  openfin_120_live_regression?: Record<string, unknown>;
  runtime_quality_metrics?: Record<string, unknown>;
  search_index?: ManifestEntry;
  quality_exports?: ManifestEntry[];
  source_registry?: ManifestEntry;
  source_status?: ManifestEntry;
  provenance_index?: ManifestEntry;
  provenance_coverage?: ManifestEntry;
  relationship_index?: ManifestEntry;
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
  readonly loadedAt: number;
  readonly generation: string;
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
const ENABLE_DEPOSIT_COMPARISON = true;
const ENABLE_SAVING_COMPARISON = true;
const EXCLUDED_SAMPLE_LIMIT = 10;
const QUERY_PARSER_VERSION = "openfin-query-parser-v1.3.0";
const FIELD_EXTRACTOR_VERSION = "openfin-field-extractor-v1.1.0";
const DISCOVERY_ENGINE_VERSION = "openfin-discovery-v1.3.0";
const COMPARISON_ENGINE_VERSION = "openfin-comparison-v1.1.0";
const PERSONAL_FINANCE_POLICY_VERSION = "openfin-personal-finance-v1.0.0";
const ADVICE_POLICY_VERSION = "openfin-advice-policy-v1.0.0";
const MINIMUM_EMERGENCY_FUND_MONTHS = 3;
const HIGH_INTEREST_DEBT_RATE_PERCENT = 15;
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
const cachedSearchShards = new Map<string, CachedSearchItems>();
const inFlightSearchShards = new Map<string, Promise<readonly FinanceItem[]>>();
const cachedFinanceArtifacts = new Map<string, CachedFinanceArtifact>();
const inFlightFinanceArtifacts = new Map<string, Promise<unknown>>();
const financeArtifactErrors = new Map<string, Record<string, unknown>>();

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
  return [item.jurisdiction, item.jurisdiction_code, item.parent_jurisdiction_code, ...(item.jurisdiction_aliases ?? [])]
    .some((value) => normalizeQuery(value ?? "").includes(region));
}

function matchesSupportIntent(item: FinanceItem, query: string): boolean {
  if (item.type !== "support-program" || !SUPPORT_INTENT_RE.test(query)) return true;
  const targetGroups = new Set((item.target_group ?? []).map(normalizeQuery));
  const categories = new Set((item.support_category ?? []).map(normalizeQuery));
  const requiresYouth = query.includes("청년");
  const requiresRent = /월세/.test(query);
  const requiresHousing = /(월세|주거|전세|임대|보증금|입주|공급|수선)/.test(query);
  const requiresEmployment = /(취업|일자리|구직)/.test(query);
  const requiresEducation = /교육/.test(query);
  const requiresHealth = /(의료|건강)/.test(query);
  const requiresCulture = /(문화|예술)/.test(query);
  const requiresBusiness = /(창업|사업|소상공인)/.test(query);
  const requiresCurrentAvailability = /(지원|보조금|신청|월세|주거)/.test(query);
  const currentlyAvailable = item.is_currently_applicable === true || ["open", "always_open"].includes(item.application_status ?? "");
  return (!requiresYouth || targetGroups.has("youth"))
    && (!requiresRent || categories.has("housing") || categories.has("rent"))
    && (!requiresHousing || categories.has("housing") || categories.has("rent") || categories.has("lease_deposit") || categories.has("deposit_guarantee") || categories.has("housing_supply") || categories.has("housing_repair"))
    && (!requiresEmployment || categories.has("employment"))
    && (!requiresEducation || categories.has("education"))
    && (!requiresHealth || categories.has("health"))
    && (!requiresCulture || categories.has("culture"))
    && (!requiresBusiness || categories.has("business"))
    && (!requiresCurrentAvailability || currentlyAvailable);
}

function supportMatchTier(item: FinanceItem, query: string): "exact" | "partial" | "related" | undefined {
  if (item.type !== "support-program" || !SUPPORT_INTENT_RE.test(query)) return undefined;
  const text = itemSearchText(item);
  const categories = new Set((item.support_category ?? []).map(normalizeQuery));
  const youthRequested = query.includes("청년");
  const youthMatched = !youthRequested || (item.target_group ?? []).map(normalizeQuery).includes("youth");
  const rentRequested = query.includes("월세");
  const rentMatched = categories.has("rent") || text.includes("월세");
  const housingMatched = categories.has("housing") || categories.has("lease_deposit") || categories.has("deposit_guarantee") || categories.has("housing_supply") || categories.has("housing_repair");
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

function supportExcludedSummary(
  items: readonly FinanceItem[],
  query: string,
  supportRegion: string | undefined,
  filters: SearchFilters,
  allowedTypes: Set<string> | null,
  returnedIds: ReadonlySet<string>,
  maxResults: number,
): Record<string, number> {
  if (!SUPPORT_INTENT_RE.test(query)) return {};
  const counts: Record<string, number> = {};
  const add = (reason: string) => { counts[reason] = (counts[reason] ?? 0) + 1; };
  for (const item of items.filter((candidate) => candidate.type === "support-program")) {
    if (returnedIds.has(item.id)) continue;
    if (!isPubliclySearchable(item)) { add("not_publicly_searchable"); continue; }
    if (allowedTypes && !allowedTypes.has(item.type)) { add("type_filter"); continue; }
    if (!matchesSearchFilters(item, filters)) { add("filter_mismatch"); continue; }
    if (!matchesSupportRegion(item, supportRegion)) { add("region_mismatch"); continue; }
    if (!matchesSupportIntent(item, query)) { add("support_intent_mismatch"); continue; }
    if (scoreItem(item, query) <= 0) { add("query_mismatch"); continue; }
    if (maxResults > 0) add("result_limit");
  }
  return counts;
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
  if (item.search_text) {
    return item.search_text.toLocaleLowerCase("ko-KR");
  }
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

function matchesSearchFilters(item: FinanceItem, filters: SearchFilters, artifacts?: FinanceArtifacts): boolean {
  const equals = (value: string | undefined, expected: string | undefined): boolean =>
    expected === undefined || normalizeQuery(value ?? "") === normalizeQuery(expected);
  const region = normalizeQuery(filters.region ?? "");
  return (
    equals(item.search_type, filters.searchType) &&
    equals(item.product_kind, filters.productKind) &&
    equals(item.recommendation_status, filters.recommendationStatus) &&
    equals(item.recommendation_scope, filters.recommendationScope) &&
    equals(item.sales_status, filters.salesStatus) &&
    equals(item.application_status, filters.applicationStatus) &&
    equals(item.provider, filters.provider) &&
    equals(artifacts ? (sourceHealth(item, artifacts).freshness_status as string | null ?? undefined) : item.freshness_status, filters.freshnessStatus) &&
    (!region || [item.jurisdiction, item.jurisdiction_code, ...(item.jurisdiction_aliases ?? [])]
      .some((value) => normalizeQuery(value ?? "").includes(region)))
  );
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

function isDiscoveryCandidate(item: FinanceItem, domain: DiscoveryDomain, artifacts?: FinanceArtifacts): boolean {
  if (discoveryDomainForItem(item) !== domain) return false;
  const effectiveFreshness = artifacts ? sourceHealth(item, artifacts).freshness_status : item.source_freshness_status ?? item.freshness_status;
  if (item.product_status !== "active" || item.status !== "active" || effectiveFreshness !== "current") return false;
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
  return providerForQuery(query) ?? [...new Set(items.map((item) => item.provider).filter((value): value is string => Boolean(value)))]
    .filter((provider) => compactProductText(query).includes(compactProductText(provider)))
    .sort((left, right) => compactProductText(right).length - compactProductText(left).length)[0];
}

function isNamedProductQuery(query: string): boolean {
  const provider = providerForQuery(query);
  return Boolean(requestedProductKind(query) && productNameTokens(query, provider).length);
}

function strictNamedProductPayload(query: string, items: readonly FinanceItem[], limit: number, env: Env): Record<string, unknown> | undefined {
  const parts = namedQueryParts(query);
  const provider = providerForNamedQuery(parts.cleanQuery, items);
  const productKind = requestedProductKind(parts.cleanQuery);
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
  const matches = dedupeProductItems(items).filter((item) => {
    if (!item.provider || compactProductText(item.provider) !== compactProductText(provider)) return false;
    if (item.product_kind !== productKind) return false;
    const text = compactProductText([item.title, ...(item.search_aliases ?? []), ...(item.aliases ?? [])].join(" "));
    return compactNames.every((token) => text.includes(token));
  });
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
  for (const item of items) {
    if (discoveryDomainForItem(item) !== domain) {
      excludedSummary.domain_mismatch = (excludedSummary.domain_mismatch ?? 0) + 1;
      continue;
    }
    if (!isDiscoveryCandidate(item, domain, artifacts)) {
      excludedSummary.inactive_or_unlisted = (excludedSummary.inactive_or_unlisted ?? 0) + 1;
      continue;
    }
    const text = discoveryItemText(item);
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

function scoreItem(item: FinanceItem, query: string): number {
  const normalizedTitle = normalizeQuery(item.title);
  const normalizedId = normalizeQuery(item.id);
  const searchType = normalizeQuery(item.search_type ?? item.product_kind ?? "");
  const status = normalizeQuery(item.status ?? item.product_status ?? "");
  const recommendationStatus = normalizeQuery(item.recommendation_status ?? "");
  const applicationStatus = normalizeQuery(item.application_status ?? "");
  const tokens = queryTokens(query);
  const titleTokens = queryTokens(normalizedTitle);
  const rateIntent = RATE_QUERY_RE.test(query);

  if (searchType === "deposit-protection" && rateIntent && !PROTECTION_QUERY_RE.test(query)) {
    return 0;
  }
  if (RECOMMENDATION_QUERY_RE.test(query)) {
    const intentTokens = tokens.filter((token) => !RECOMMENDATION_QUERY_RE.test(token));
    if (
      !isRecommendationSearchEligible(item) ||
      !matchesRecommendationDomain(item, query, searchType) ||
      !intentTokens.length
    ) {
      return 0;
    }
  }
  if (
    item.type === "support-program" &&
    (status === "closed" || status === "ended" || applicationStatus === "closed" || recommendationStatus === "reference_only") &&
    !INACTIVE_QUERY_RE.test(query)
  ) {
    return 0;
  }

  const text = itemSearchText(item);
  if (RECOMMENDATION_QUERY_RE.test(query)) {
    const intentTokens = tokens.filter((token) => !RECOMMENDATION_QUERY_RE.test(token));
    if (!intentTokens.every((token) => text.includes(token))) {
      return 0;
    }
  }
  let score = 0;
  const aliases = (item.search_aliases ?? []).map((alias) => normalizeQuery(alias));
  if (aliases.includes(query)) {
    score = 95;
  } else if (normalizedId === query || normalizedTitle === query) {
    score = 100;
  } else if (normalizedId.includes(query)) {
    score = 80;
  } else if (query.includes(normalizedTitle)) {
    const base = GENERIC_SEARCH_TYPES.has(item.type) && titleTokens.length < tokens.length ? 35 : 75;
    score = base + titleTokens.length;
  } else if (normalizedTitle.includes(query)) {
    score = 70;
  } else if (text.includes(query)) {
    score = 40;
  }
  if (tokens.length > 1) {
    const matchedTokens = tokens.filter((token) => text.includes(token));
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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "finance-mcp-cloudflare-worker",
    },
  });

  if (!response.ok) {
    throw new Error(`Finance ontology fetch failed: ${url} ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "finance-mcp-cloudflare-worker",
    },
  });
  if (!response.ok) throw new Error(`Finance ontology fetch failed: ${url} ${response.status} ${response.statusText}`);
  return response.text();
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
      exports: manifest.exports.map((entry) => [entry.id, entry.path, entry.url, entry.web_url, (entry as ManifestEntry & { export_checksum?: string }).export_checksum]),
      artifacts: [manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index]
        .map((entry) => entry ? [entry.id, entry.path, entry.url, entry.web_url, (entry as ManifestEntry & { export_checksum?: string }).export_checksum] : null),
    });
    if (manifestGeneration !== "uninitialized" && manifestGeneration !== generation) {
      cachedGraph = undefined;
      cachedSearchIndexMetadata = undefined;
      cachedSearchItems = undefined;
      cachedSearchShards.clear();
      cachedFinanceArtifacts.clear();
    }
    manifestGeneration = generation;
    cachedManifest = { data: manifest, loadedAt: Date.now() };
    return manifest;
  });
}

function manifestChecksumContract(manifest: FinanceManifest): boolean {
  const entries = [manifest.search_index, manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index, ...(manifest.exports ?? [])];
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
        cachedFinanceArtifacts.set(cacheKey, { data, loadedAt: Date.now(), generation: requestGeneration });
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
  const sourceIds = new Set([
    ...(item.sources ?? []),
    ...(item.source_ids ?? []),
    ...provenance.map((entry) => entry.source_id).filter((value): value is string => typeof value === "string"),
  ]);
  const resolution = resolveSourceStatus({
    sourceIds: [...sourceIds],
    sourceUrlCount: item.source_urls?.length ?? 0,
    sourceStatusArtifact: artifacts?.source_status,
    staticFreshness: item.freshness_status ?? item.source_freshness_status,
  });
  const { statuses } = resolution;
  const statusVerifiedAt = statuses.map((status) => status.last_successful_checked_at).find((value): value is string => typeof value === "string");
  return {
    source_count: sourceIds.size || (item.source_urls?.length ?? 0),
    last_verified_at: item.last_verified_at ?? item.verified_at ?? item.last_source_checked_at ?? statusVerifiedAt ?? null,
    freshness_status: resolution.freshnessStatus,
    source_status: statuses.length ? statuses : undefined,
    source_status_resolution: resolution.resolution,
    source_status_reason: resolution.reason,
    artifact_errors: artifactErrors(),
  };
}

function enrichSearchPayload(payload: Record<string, unknown>, items: readonly FinanceItem[], artifacts: FinanceArtifacts): Record<string, unknown> {
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const key of ["results", "exact_results", "partial_results", "exact_candidates", "partial_candidates", "related_candidates", "related_results"]) {
    const values = payload[key];
    if (!Array.isArray(values)) continue;
    payload[key] = values.map((value) => {
      if (!isRecord(value) || typeof value.id !== "string") return value;
      const item = byId.get(value.id);
      return item ? { ...value, ...sourceHealth(item, artifacts) } : value;
    });
  }
  return payload;
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

function isFinanceItem(value: unknown): value is FinanceItem {
  return isRecord(value) && typeof value.id === "string" && typeof value.title === "string" && typeof value.type === "string";
}

function parseSearchItems(value: unknown, source: string): readonly FinanceItem[] {
  const items = Array.isArray(value) ? value : isRecord(value) ? value.items : undefined;
  if (!Array.isArray(items) || !items.every(isFinanceItem)) {
    throw new SearchIndexContractError(`${source} must be a raw item array or an object with an items array`);
  }
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

function assertEmbeddedItemCount(value: unknown, items: readonly FinanceItem[], source: string): void {
  if (!isRecord(value) || value.item_count === undefined) return;
  if (typeof value.item_count !== "number") {
    throw new SearchIndexContractError(`${source}.item_count must be an integer when present`);
  }
  assertSearchItemCount(items.length, value.item_count, source);
}

async function loadSearchIndexMetadata(env: Env): Promise<SearchIndexFile> {
  const now = Date.now();
  if (cachedSearchIndexMetadata && cachedSearchIndexMetadata.generation === manifestGeneration && now - cachedSearchIndexMetadata.loadedAt < CACHE_TTL_MS) {
    return cachedSearchIndexMetadata.data;
  }
  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  if (!manifest.search_index) {
    throw new SearchIndexContractError("finance manifest is missing search_index metadata");
  }
  const indexUrl = resolveExportUrl(manifest.search_index, manifestUrl);
  const rawText = await fetchText(indexUrl);
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

async function loadSearchItems(env: Env): Promise<readonly FinanceItem[]> {
  const now = Date.now();
  if (cachedSearchItems && cachedSearchItems.generation === manifestGeneration && now - cachedSearchItems.loadedAt < CACHE_TTL_MS) {
    return cachedSearchItems.items;
  }

  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  const metadata = await loadSearchIndexMetadata(env);
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
    return loadSearchShard(env, shard);
  }));
  const items = shardItems.flat();
  assertSearchItemCount(items.length, metadata.item_count, "search-index root");
  assertSearchItemCount(items.length, manifest.search_index?.item_count, "finance manifest search_index");
  cachedSearchItems = { items, loadedAt: now, generation: manifestGeneration };
  return items;
}

async function loadSearchShard(env: Env, shard: SearchIndexShard): Promise<readonly FinanceItem[]> {
  const now = Date.now();
  const key = shard.shard_id;
  const requestGeneration = manifestGeneration;
  const pendingKey = generationCacheKey(requestGeneration, key);
  const cached = cachedSearchShards.get(key);
  if (cached && cached.generation === manifestGeneration && now - cached.loadedAt < CACHE_TTL_MS) return cached.items;
  const pending = inFlightSearchShards.get(pendingKey);
  if (pending) return pending;
  const request = (async () => {
    const url = resolveExportUrl(shard, financeManifestUrl(env));
    const rawText = await fetchText(url);
    if (shard.content_checksum && !(await verifyTextChecksum(rawText, shard.content_checksum))) {
      throw new SearchIndexContractError(`search-index shard ${shard.shard_id} content checksum mismatch`);
    }
    let payload: unknown;
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      throw new SearchIndexContractError(`search-index shard ${shard.shard_id} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    const checksumPayload = isRecord(payload) && Array.isArray(payload.items) ? payload.items : payload;
    if (!shard.content_checksum && !(await verifySearchChecksum(checksumPayload, shard.export_checksum))) {
      throw new SearchIndexContractError(`search-index shard ${shard.shard_id} checksum mismatch`);
    }
    const items = parseSearchItems(payload, url);
    assertSearchItemCount(items.length, shard.item_count, `search-index shard ${shard.shard_id}`);
    assertEmbeddedItemCount(payload, items, `search-index shard ${shard.shard_id}`);
    if (requestGeneration !== "uninitialized" && isCurrentGeneration(requestGeneration, manifestGeneration)) {
      cachedSearchShards.set(key, { items, loadedAt: Date.now(), generation: requestGeneration });
    }
    return items;
  })().finally(() => inFlightSearchShards.delete(pendingKey));
  inFlightSearchShards.set(pendingKey, request);
  return request;
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
  if (type === "account-product" || productKind === "housing-subscription" || /청약통장|주택드림|isa|개인종합자산관리/.test(normalized)) return "account-products";
  if (type === "support-program" || SUPPORT_INTENT_RE.test(normalized)) return "support";
  if (type === "card-product" || /카드|마일리지|전월실적|연회비/.test(normalized)) return "card-products";
  if (type === "insurance-product" || /보험|실손|실비/.test(normalized)) return "insurance-products";
  if (type === "bank-product" || ["deposit", "saving", "loan"].includes(searchType ?? "") || /대출|예금|적금|은행|bank-products/.test(normalized)) return "bank-products";
  if (type === "financial-product" || PROTECTION_QUERY_RE.test(normalized)) return "deposit-protection";
  if (type && (SEARCH_TYPE_GROUPS[type] || ["tax", "term", "concept", "category", "source", "filing", "deadline"].includes(type))) return "reference";
  if (TAX_INTENT_RE.test(normalized)) return "reference";
  return undefined;
}

async function loadDetailedItemsForDomain(env: Env, domain: string): Promise<readonly FinanceItem[]> {
  const manifest = await loadFinanceManifest(env);
  const metadata = await loadSearchIndexMetadata(env);
  const shardId = SEARCH_SHARD_BY_DOMAIN[domain];
  const shard = (metadata.shards ?? manifest.search_index?.shards)?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  return shard ? loadSearchShard(env, shard) : loadSearchItems(env);
}

async function loadSearchItemsForQuery(
  env: Env,
  query: string,
  type?: string,
  searchType?: string,
  productKind?: string,
): Promise<readonly FinanceItem[]> {
  const manifest = await loadFinanceManifest(env);
  const metadata = await loadSearchIndexMetadata(env);
  const shardId = searchShardForQuery(query, type, searchType, productKind);
  if (!shardId) {
    const reference = (metadata.shards ?? manifest.search_index?.shards)?.find((candidate) => candidate.shard_id === "reference" || candidate.id === "reference");
    return reference ? loadSearchShard(env, reference) : loadSearchItems(env);
  }
  const shard = (metadata.shards ?? manifest.search_index?.shards)?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  return shard ? loadSearchShard(env, shard) : loadSearchItems(env);
}

async function hydrateSearchItem(env: Env, item: FinanceItem): Promise<FinanceItem> {
  const manifest = await loadFinanceManifest(env);
  const metadata = await loadSearchIndexMetadata(env);
  const shardId = item.provenance_shard ?? item.shard_id;
  const shard = shardId && (metadata.shards ?? manifest.search_index?.shards)?.find((candidate) => candidate.shard_id === shardId || candidate.id === shardId);
  if (!shard) return item;
  const detailed = (await loadSearchShard(env, shard)).find((candidate) => candidate.id === item.id);
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
    const exportUrl = resolveExportUrl(entry, manifestUrl);
    const payload = await fetchJson<OntologyExport>(exportUrl);
    for (const item of [...(payload.reference_items ?? []), ...(payload.items ?? [])]) {
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

function directExportIdForItem(rawId: string): string | undefined {
  const itemId = resolveItemId(rawId);
  if (/^(credit|deduction|tax)\./.test(itemId)) return "tax-ontology";
  if (itemId.startsWith("support.local-gov.")) return "local-government-supports-ontology";
  if (itemId.startsWith("finance.card.")) return "card-products-ontology";
  if (itemId.startsWith("finance.bank.deposit.")) return "deposit-products-ontology";
  if (itemId.startsWith("finance.bank.saving.")) return "saving-products-ontology";
  if (itemId.startsWith("finance.bank.loan.")) return "loan-products-ontology";
  if (itemId.startsWith("finance.insurance.")) return "insurance-products-ontology";
  if (itemId.startsWith("finance.pension.")) return "pension-products-ontology";
  if (itemId.startsWith("finance.account.")) return "tax-advantaged-accounts-ontology";
  if (itemId.startsWith("finance.reference.") || itemId.startsWith("finance.term.")) return "finance-reference-ontology";
  return undefined;
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
    if (itemSearchText(item).includes(token)) {
      reasons.push(`token:${token}`);
    }
  }
  return [...new Set(reasons)].slice(0, 10);
}

function domainMatches(item: FinanceItem, domain: string): boolean {
  const normalizedDomain = normalizeQuery(domain);
  if (normalizedDomain === "deposit") {
    return item.type === "bank-product" && item.search_type === "deposit";
  }
  if (normalizedDomain === "saving") {
    return item.type === "bank-product" && item.search_type === "saving";
  }
  if (normalizedDomain === "loan") {
    return item.type === "bank-product" && item.search_type === "loan";
  }
  if (normalizedDomain === "card") {
    return item.type === "card-product";
  }
  if (normalizedDomain === "insurance") {
    return item.type === "insurance-product";
  }
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
  if (item.recommendation_status !== "verified_recommendation_candidate") return "not_verified_recommendation_candidate";
  if (item.recommendation_scope !== "public_recommendation") return "not_public_recommendation_scope";
  if (item.sales_status !== "active" || !isVerifiedActive(item.sales_verification_status)) return "sales_not_verified";
  if (artifacts && sourceHealth(item, artifacts).freshness_status !== "current") return "stale_source";
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
  const selected = new Map<string, FinanceItem>();
  for (const item of items) {
    const key = item.type === "card-product" || item.type === "bank-product" || item.type === "insurance-product"
      ? item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id
      : item.id;
    const previous = selected.get(key);
    if (!previous || productQualityScore(item) > productQualityScore(previous)) selected.set(key, item);
  }
  return [...selected.values()];
}

function minimumVerifiedCount(domain: string): number {
  if (domain === "deposit" || domain === "saving") return 30;
  if (domain === "card" || domain === "loan" || domain === "insurance") return 20;
  return 0;
}

function recommendationReadiness(domain: string, items: readonly FinanceItem[]): Record<string, number> {
  return {
    verified_active_product_count: items.filter((item) => item.sales_verification_status === "verified_active").length,
    verification_evidence_product_count: items.filter((item) => isRecord(item.verification_evidence)).length,
    comparison_engine_product_count: items.filter((item) => item.comparison_engine_gate_passed === true).length,
    verified_completeness_product_count: items.filter((item) => item.verified_completeness_ratio === 1).length,
    public_recommendation_candidate_count: items.filter((item) => recommendationBlocker(item) === undefined).length,
    minimum_required_count: minimumVerifiedCount(domain),
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

function comparisonBlocker(item: FinanceItem, artifacts?: FinanceArtifacts): string | undefined {
  if (item.comparison_exclusion_reasons?.length) return "comparison_excluded";
  if (item.recommendation_scope !== "comparison_only") return "not_comparison_scope";
  if (item.source_listing_status !== "listed") return "source_not_listed";
  if (!isVerifiedActive(item.sales_verification_status)) return "sales_not_verified";
  if ((artifacts ? sourceHealth(item, artifacts).freshness_status : item.source_freshness_status) !== "current") return "stale_source";
  const verifiedAt = Date.parse(`${item.sales_verified_at ?? ""}T00:00:00Z`);
  if (!Number.isFinite(verifiedAt) || verifiedAt > Date.now() || Date.now() - verifiedAt > 31 * 24 * 60 * 60 * 1000) return "stale_source";
  if (item.verification_status !== "verified") return "not_verified";
  const evidenceBlocker = verificationEvidenceBlocker(item);
  if (evidenceBlocker) return evidenceBlocker;
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

function comparisonCandidate(item: FinanceItem, option: Record<string, unknown>, eligibleConditions: ReadonlySet<string>, depositAmount: number | undefined, monthlyPayment: number | undefined, taxRatePercent: number): Record<string, unknown> {
  const baseRate = option.base_rate_percent;
  const maximumRate = typeof option.maximum_rate_percent === "number" ? option.maximum_rate_percent : baseRate;
  if (typeof baseRate !== "number" || typeof maximumRate !== "number") throw new Error("Comparison option has invalid rate fields");
  const conditions = Array.isArray(option.preferential_rate_conditions) ? option.preferential_rate_conditions.filter(isRecord) : [];
  const matched = conditions.filter((condition) => typeof condition.condition_id === "string" && eligibleConditions.has(condition.condition_id));
  const unmatched = conditions.filter((condition) => typeof condition.condition_id === "string" && !eligibleConditions.has(condition.condition_id));
  const additionalRate = matched.reduce((total, condition) => total + (typeof condition.additional_rate_percent === "number" ? condition.additional_rate_percent : 0), 0);
  const achievableRate = Math.min(baseRate + additionalRate, maximumRate);
  const termMonths = typeof option.term_months === "number" ? option.term_months : 0;
  const isDeposit = item.search_type === "deposit";
  const amountMissing = isDeposit ? depositAmount === undefined : monthlyPayment === undefined;
  const outcome = amountMissing ? null : isDeposit
    ? calculateDepositReturn({ principal_krw: depositAmount, annual_rate_percent: achievableRate, term_months: termMonths, tax_rate_percent: taxRatePercent, interest_method: option.interest_method })
    : calculateSavingReturn({ monthly_payment_krw: monthlyPayment, annual_rate_percent: achievableRate, term_months: termMonths, tax_rate_percent: taxRatePercent });
  const principal = outcome?.principal_krw ?? null;
  return {
    item_id: item.id,
    title: item.title,
    provider: item.provider,
    base_rate_percent: baseRate,
    maximum_rate_percent: maximumRate,
    achievable_rate_percent: achievableRate,
    matched_preferential_conditions: matched.map((condition) => condition.condition_id),
    unmatched_preferential_conditions: unmatched.map((condition) => condition.condition_id),
    unknown_preferential_conditions: conditions.filter((condition) => typeof condition.condition_id !== "string").map((condition) => condition.description ?? "unidentified_preferential_condition"),
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
  };
}

async function fetchItemGraph(env: Env, rawId: string): Promise<{ item: FinanceItem; itemsById: Map<string, FinanceItem> }> {
  const manifestUrl = financeManifestUrl(env);
  const manifest = await loadFinanceManifest(env);
  const directExportId = directExportIdForItem(rawId);
  const indexedItem = directExportId || rawId.startsWith("missing.") ? undefined : resolveCanonicalItemId(rawId, await loadSearchItems(env));
  const itemId = indexedItem?.id ?? resolveItemId(rawId);
  // Non-product nodes are fully represented in the compact index when no
  // detail shard is declared; avoid loading every ontology export.
  if (indexedItem && !["card-product", "bank-product", "insurance-product"].includes(indexedItem.type)) {
    return { item: indexedItem, itemsById: new Map([[indexedItem.id, indexedItem]]) };
  }
  const candidateExports = directExportId
    ? manifest.exports.filter((entry) => entry.id === directExportId)
    : indexedItem?.export_id
    ? manifest.exports.filter((entry) => entry.id === indexedItem.export_id)
    : manifest.exports;

  for (const entry of candidateExports) {
    const payload = await fetchJson<OntologyExport>(resolveExportUrl(entry, manifestUrl));
    const items = [...(payload.reference_items ?? []), ...(payload.items ?? [])];
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
    runtime_version: env.RUNTIME_VERSION ?? "openfin-mcp-2026.07.18.1",
    deployment_commit: env.DEPLOYMENT_COMMIT ?? "unknown",
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

function createServer(env: Env): McpServer {
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
    loadSearchItems, hydrateSearchItem, PERSONAL_FINANCE_POLICY_VERSION, ADVICE_POLICY_VERSION,
    STANDARD_OUTPUT_SCHEMA, READ_ONLY_TOOL_ANNOTATIONS, jsonText,
    discoveryDomainForQuery, SUPPORT_INTENT_RE, dedupeProductItems, loadDetailedItemsForDomain,
    loadSearchItemsForQuery, loadFinanceArtifacts, normalizeQuery, isNamedProductQuery, strictNamedProductPayload,
    enrichSearchPayload, isDiscoveryQuery, discoveryPayload, SEARCH_TYPE_GROUPS, inferredTypesForQuery,
    supportRegionForQuery, inferredSearchTypeForQuery, matchesSearchFilters, matchesSupportRegion,
    matchesSupportIntent, isPubliclySearchable, scoreItem, matchReasons, supportMatchTier,
    itemUrl, sourceHealth, reasonCounts, supportParsedQuery, supportExcludedSummary,
    loadFinanceManifest, evaluateReleaseGate, manifestChecksumContract, minimumVerifiedCount,
    recommendationReadinessStates, nextRecommendationActions, nextRecommendationAction,
    buildRecommendationCandidates, domainMatches, recommendationReadiness, rankCandidate, explainCandidate,
    recommendationBlocker, EXCLUDED_SAMPLE_LIMIT,
    ENABLE_DEPOSIT_COMPARISON, ENABLE_SAVING_COMPARISON, COMPARISON_ENGINE_VERSION,
    loadSearchIndexMetadata, comparisonBlocker, comparisonOptionCandidates, comparisonOptionBlocker,
    comparisonCandidate, comparisonBlockers,
    fetchItemGraph, resolveItemId, sourceItems, publicProvenance, loadProvenanceShard, artifactErrors,
    loadFinanceArtifact, coverageReport, runtimeMetadata,
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
    const live = manifest.openfin_120_live_regression ?? {};
    const releaseStatus = manifest.core_search_status ?? manifest.platform_release_status ?? manifest.release_status ?? "unknown";
    const blockingReasons = manifest.blocking_reasons ?? [];
    const releaseGate = evaluateReleaseGate({ manifest: manifest as unknown as Record<string, unknown>, checksumVerified: manifestChecksumContract(manifest), deploymentCommit: env.DEPLOYMENT_COMMIT });
    return financeResult(financeSafety({
      status: releaseGate.status === "ready" ? "ready" : "blocked",
      reason_codes: releaseGate.status === "ready" ? [] : ["QUALITY_RELEASE_BLOCKED", ...releaseGate.reasons],
      data_as_of: manifest.basis_date,
      missing_information: blockingReasons,
      assumptions: ["quality status reflects the loaded manifest and search index"],
      quality_status: { manifest_version: manifest.version, generation_id: manifest.generation_id ?? null, core_search_status: releaseStatus, comparison_status: manifest.comparison_status ?? manifest.comparison_release_status ?? "unknown", recommendation_status: manifest.recommendation_status ?? manifest.recommendation_release_status ?? "unknown", release_status: releaseStatus, release_status_deprecated: true, basis_date: manifest.basis_date, search_index_item_count: metadata.item_count ?? null, loaded_index_checksum: metadata.export_checksum ?? null, quality_exports: manifest.quality_exports ?? [], openfin_120_live_regression: live, public_recommendation_enabled: Boolean(manifest.recommendation_enabled), release_gate: releaseGate, provenance_artifacts: { source_registry: manifest.source_registry ?? null, source_status: manifest.source_status ?? null, provenance_index: manifest.provenance_index ?? null, provenance_coverage: manifest.provenance_coverage ?? null, relationship_index: manifest.relationship_index ?? null }, source_health: { registry_loaded: sourceRegistry !== undefined, status_loaded: sourceStatus !== undefined, provenance_loaded: false, coverage_loaded: coverageArtifact !== undefined, relationships_loaded: false, coverage, artifact_errors: artifactErrors() } },
      limitations: ["quality status is not a product recommendation", ...blockingReasons],
    }));
  });

  server.registerTool("update_finance_snapshot", {
    title: "Update Personal Finance Snapshot",
    description: "Persistence is fail-closed: owner authentication, explicit confirmation, and an enabled persistence binding are all required, and this public Worker never persists snapshots.",
    inputSchema: { snapshot: z.record(z.string(), z.unknown()), owner_authenticated: z.boolean(), explicit_confirmation: z.boolean(), persistence_enabled: z.boolean() },
    annotations: { title: "Update Personal Finance Snapshot", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot, owner_authenticated, explicit_confirmation, persistence_enabled }) => {
    assertFinanceSafe(snapshot); const reasons = [!owner_authenticated ? "OWNER_AUTH_REQUIRED" : null, !explicit_confirmation ? "EXPLICIT_CONFIRMATION_REQUIRED" : null, !persistence_enabled ? "PERSISTENCE_FLAG_REQUIRED" : null, "PERSISTENCE_BACKEND_NOT_CONFIGURED"].filter((value): value is string => Boolean(value));
    return financeResult(financeSafety({ status: "blocked", reason_codes: reasons, assumptions: ["the public Worker does not persist personal financial snapshots"], missing_information: reasons, financial_needs: [], candidates: [], limitations: ["no snapshot was written", "use a separately authenticated owner-controlled persistence service"] }));
  });

  registerSearchTool(toolContext);

  registerDiscoverTool(toolContext);

  registerRecommendTool(toolContext);

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
      core_search_status: manifest.core_search_status ?? manifest.platform_release_status ?? manifest.release_status ?? "unknown",
      comparison_status: manifest.comparison_status ?? manifest.comparison_release_status ?? "unknown",
      recommendation_status: manifest.recommendation_status ?? manifest.recommendation_release_status ?? "unknown",
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

    const server = createServer(env);
    // Keep the request promise open until the tool handler has produced its
    // result. Streamable SSE responses can otherwise be closed by the
    // stateless Worker runtime while a shard-backed tool is still hydrating.
    // JSON mode uses the same MCP transport and is accepted by the live client.
    return createMcpHandler(server, { route: "/mcp", enableJsonResponse: true })(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
