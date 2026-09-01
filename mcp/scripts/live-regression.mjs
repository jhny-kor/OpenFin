import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const fixturePath = path.join(root, "tests/golden/openfin-runtime-contract-120.jsonl");
const fixture = fs.readFileSync(fixturePath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const checksum = crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex");
const required = ["case_id", "category", "tool", "arguments", "expected_status", "required_fields", "forbidden_claims", "expected_reason_codes"];
const categoryMinimums = { exact_search: 20, alias_search: 10, ambiguous_query: 10, comparison: 15, eligibility: 15, freshness: 10, recommendation_gate: 15, security: 10, unknown: 10, deployment: 5 };
const ids = new Set();
const invalid = fixture.filter((entry) => !required.every((key) => key in entry) || ids.has(entry.case_id) || !ids.add(entry.case_id));
const semanticHash = (entry) => crypto.createHash("sha256").update(JSON.stringify({ tool: entry.tool, arguments: entry.arguments, expected_status: entry.expected_status, required_fields: entry.required_fields, expected_reason_codes: entry.expected_reason_codes, expected_paths: entry.expected_paths ?? null, expected_result_ids: entry.expected_result_ids ?? null, forbidden_result_ids: entry.forbidden_result_ids ?? null, semantic_search: entry.semantic_search ?? null })).digest("hex");
const semanticHashes = fixture.map(semanticHash);
const categoryCounts = Object.fromEntries(Object.keys(categoryMinimums).map((category) => [category, fixture.filter((entry) => entry.category === category).length]));
const invalidCategories = Object.entries(categoryMinimums).filter(([category, minimum]) => (categoryCounts[category] ?? 0) < minimum).map(([category, minimum]) => `${category}:${categoryCounts[category] ?? 0}<${minimum}`);
const semanticMinimums = { tax: ["live-001", 5], support: ["live-002", 5], card: ["live-003", 5], deposit: ["live-004", 5], saving: ["live-005", 5], loan: ["live-006", 5], insurance: ["live-007", 5], pension: ["live-008", 3], account: ["live-009", 3], reference: ["live-010", 4] };
const semanticCounts = Object.fromEntries(Object.entries(semanticMinimums).map(([domain, [caseId]]) => [domain, fixture.find((entry) => entry.case_id === caseId)?.semantic_search?.length ?? 0]));
const invalidSemanticDomains = Object.entries(semanticMinimums).filter(([domain, [, minimum]]) => semanticCounts[domain] < minimum).map(([domain, [, minimum]]) => `${domain}:${semanticCounts[domain]}<${minimum}`);
const semanticCases = fixture.flatMap((entry) => entry.semantic_search ?? []);
const invalidSemanticContracts = semanticCases.filter((entry) => !entry.expected_top_id || !entry.expected_title || !entry.expected_top_k_ids?.length || !entry.expected_result_ids?.length || !entry.expected_source_ids?.length || entry.require_freshness !== true || !entry.fetch_id).length;
const semanticQueryKeys = semanticCases.map((entry) => `${entry.type ?? ""}\u0000${entry.query}`);
const duplicateSemanticQueries = semanticQueryKeys.length - new Set(semanticQueryKeys).size;
const duplicateSemanticCount = semanticHashes.length - new Set(semanticHashes).size;
if (fixture.length !== 120 || invalid.length || duplicateSemanticCount || duplicateSemanticQueries || invalidCategories.length || invalidSemanticDomains.length || invalidSemanticContracts) throw new Error(`fixture must contain 120 unique cases and the required semantic domain coverage; got ${fixture.length}, invalid ${invalid.length}, duplicate_semantics ${duplicateSemanticCount}, duplicate_semantic_queries ${duplicateSemanticQueries}, invalid_semantic_contracts ${invalidSemanticContracts}, categories ${invalidCategories.join(",")}, semantic_domains ${invalidSemanticDomains.join(",")}`);
if (process.argv.includes("--validate-fixture")) { console.log(JSON.stringify({ ok: true, case_count: fixture.length, semantic_unique_case_count: new Set(semanticHashes).size, semantic_case_count: Object.values(semanticCounts).reduce((sum, count) => sum + count, 0), duplicate_ids: 0, duplicate_semantic_cases: duplicateSemanticCount, category_counts: categoryCounts, semantic_domain_counts: semanticCounts, fixture_checksum: `sha256:${checksum}` }, null, 2)); process.exit(0); }

const endpoint = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev/mcp").replace(/\/$/, "");
const base = endpoint.replace(/\/mcp$/, "");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const metadataAttempts = Number(process.env.LIVE_METADATA_ATTEMPTS || 60);
const metadataDelayMs = Number(process.env.LIVE_METADATA_DELAY_MS || 5000);
const requestTimeoutMs = Number(process.env.LIVE_REQUEST_TIMEOUT_MS || 10000);
const caseAttempts = Number(process.env.LIVE_CASE_ATTEMPTS || 3);
const caseRetryDelayMs = Number(process.env.LIVE_CASE_RETRY_DELAY_MS || 500);
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};
const readJsonWithTimeout = async response => {
  let timer;
  try {
    return await Promise.race([
      response.json(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`response body timeout after ${requestTimeoutMs}ms`)), requestTimeoutMs); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};
let healthPayload;
let manifest;
let metadataError;
for (let attempt = 1; attempt <= metadataAttempts; attempt += 1) {
  try {
    const cacheBust = `live=${Date.now()}-${attempt}`;
    const health = await fetchWithTimeout(`${base}/health?${cacheBust}`, { headers: { "cache-control": "no-cache" } });
    if (!health.ok) throw new Error(`health failed: ${health.status}`);
    const candidateHealth = await readJsonWithTimeout(health);
    const manifestResponse = await fetchWithTimeout(`${candidateHealth.finance_manifest_url}?${cacheBust}`, { headers: { "cache-control": "no-cache" } });
    if (!manifestResponse.ok) throw new Error(`manifest failed: ${manifestResponse.status}`);
    const candidateManifest = await readJsonWithTimeout(manifestResponse);
    if (typeof candidateManifest.generation_id !== "string" || candidateHealth.deployment_commit === "unknown" || candidateManifest.deployment_commit !== candidateHealth.deployment_commit) throw new Error("deployment/manifest generation metadata is missing or inconsistent");
    if (candidateHealth.generation_id !== candidateManifest.generation_id) throw new Error("health/manifest generation mismatch");
    healthPayload = candidateHealth;
    manifest = candidateManifest;
    break;
  } catch (error) {
    metadataError = error;
    if (attempt < metadataAttempts) await wait(metadataDelayMs);
  }
}
if (!healthPayload || !manifest) {
  const report = {
    status: "failed",
    mode: "live",
    failure_phase: "metadata",
    checked_at: new Date().toISOString(),
    endpoint,
    metadata_error: metadataError instanceof Error ? metadataError.message : String(metadataError || "live deployment metadata unavailable"),
    fixture_checksum: `sha256:${checksum}`,
    semantic_unique_case_count: new Set(semanticHashes).size,
    category_counts: categoryCounts,
    test_count: fixture.length,
    passed_count: 0,
    failed_count: fixture.length,
    skipped_count: 0,
    actual_status: null,
    actual_result_ids: [],
    actual_source_ids: [],
    actual_reason_codes: [],
    top_k_scores: [],
    retry_errors: [],
    results: [],
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}
let id = 0;
let currentCaseId = null;
let requestSequence = 0;
const transportMetadata = (response, startedAt, requestId) => {
  const rawDiagnostics = response.headers.get("x-openfin-diagnostics");
  let openfinDiagnostics = null;
  if (rawDiagnostics) {
    try { openfinDiagnostics = JSON.parse(rawDiagnostics); } catch { openfinDiagnostics = { parse_error: true }; }
  }
  return {
    request_id: requestId,
    case_id: currentCaseId,
    http_status: response.status,
    elapsed_ms: Math.round((performance.now() - startedAt) * 100) / 100,
    cf_ray: response.headers.get("cf-ray"),
    cf_cache_status: response.headers.get("cf-cache-status"),
    server_timing: response.headers.get("server-timing"),
    openfin: openfinDiagnostics,
  };
};
const rpc = async (method, params = {}) => {
  const startedAt = performance.now();
  const requestId = `live-${++requestSequence}`;
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18", "x-openfin-diagnostics": "1", "x-openfin-request-id": requestId };
  if (currentCaseId) headers["x-openfin-case-id"] = currentCaseId;
  if (typeof params?.name === "string") headers["x-openfin-tool"] = params.name;
  if (typeof params?.arguments?.query === "string") headers["x-openfin-query"] = params.arguments.query.slice(0, 256);
  if (params?.name === "search") headers["x-openfin-query-class"] = "search";
  if (params?.name === "fetch") headers["x-openfin-query-class"] = "fetch";
  let response;
  try {
    response = await fetchWithTimeout(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }) });
  } catch (error) {
    return { isError: true, error: { message: `${method}: ${error instanceof Error ? error.message : String(error)}` }, http_status: 0, _transport: { request_id: requestId, case_id: currentCaseId, http_status: 0, elapsed_ms: Math.round((performance.now() - startedAt) * 100) / 100, cf_ray: null, cf_cache_status: null, server_timing: null, openfin: null } };
  }
  const transport = transportMetadata(response, startedAt, requestId);
  let body; try { body = await readJsonWithTimeout(response); } catch (error) { body = { error: { message: `${method}: ${response.status}`, detail: error instanceof Error ? error.message : String(error) } }; }
  if (body.error) return { isError: true, error: body.error, http_status: response.status, _transport: transport };
  if (!response.ok) return { isError: true, error: { message: `${method}: ${response.status}` }, http_status: response.status, _transport: transport };
  if (body.result && typeof body.result === "object" && !Array.isArray(body.result)) return { ...body.result, _transport: transport };
  return { result: body.result, _transport: transport };
};
await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "openfin-live-regression", version: "1" } });
const getPath = (value, pathExpression) => {
  const pathParts = String(pathExpression).replace(/^\$\.?/, "").replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  return pathParts.reduce((current, part) => current == null ? undefined : current[part], value);
};
const asArray = (value) => Array.isArray(value) ? value : [];
const reasonCodes = (payload) => [...new Set([
  ...asArray(payload?.reason_codes),
  ...asArray(payload?.release_gate?.reasons),
  ...asArray(payload?.quality_status?.reason_codes),
  ...asArray(payload?.quality_status?.release_gate?.reasons),
  ...asArray(payload?.fit?.reason_codes),
  ...asArray(payload?.blockers),
].map(String))];
const resultIds = (payload) => asArray(payload?.results ?? payload?.candidates ?? payload?.recommendations).map((item) => item?.id ?? item?.item_id).filter(Boolean).map(String);
const sourceIds = (payload) => [...new Set([
  ...asArray(payload?.source_ids),
  ...asArray(payload?.sources).map((item) => item?.id ?? item),
  ...asArray(payload?.provenance).map((item) => item?.source_id ?? item?.id),
  ...asArray(payload?.source_assertions).map((item) => item?.source_id ?? item?.id),
  ...asArray(payload?.neighbors?.sources).map((item) => item?.id ?? item?.source_id ?? item),
  ...asArray(payload?.neighbors?.provenance).map((item) => item?.source_id ?? item?.id),
  ...asArray(payload?.results).flatMap((item) => asArray(item?.source_ids)),
  ...asArray(payload?.results).flatMap((item) => asArray(item?.sources).map((source) => source?.id ?? source)),
  ...asArray(payload?.results).flatMap((item) => asArray(item?.provenance).map((source) => source?.source_id ?? source?.id)),
  ...asArray(payload?.results).flatMap((item) => asArray(item?.neighbors?.sources).map((source) => source?.id ?? source?.source_id ?? source)),
  ...asArray(payload?.results).flatMap((item) => asArray(item?.neighbors?.provenance).map((source) => source?.source_id ?? source?.id)),
  ...asArray(payload?.candidates).flatMap((item) => asArray(item?.source_ids)),
  ...asArray(payload?.candidates).flatMap((item) => asArray(item?.sources).map((source) => source?.id ?? source)),
  ...asArray(payload?.candidates).flatMap((item) => asArray(item?.neighbors?.sources).map((source) => source?.id ?? source?.source_id ?? source)),
].filter(Boolean).map(String).filter((value) => value.startsWith("source.")))];
const freshnessPresent = (payload) => Boolean(
  payload?.freshness_status || payload?.source_freshness_status || payload?.last_source_checked_at ||
  payload?.provenance?.some((item) => item?.reviewed_at || item?.freshness_status) ||
  payload?.source_assertions?.some((item) => item?.observed_at || item?.freshness_status) ||
  [...asArray(payload?.results), ...asArray(payload?.candidates)].some((item) => item?.freshness_status || item?.source_freshness_status || item?.last_source_checked_at || item?.provenance?.some((entry) => entry?.reviewed_at || entry?.freshness_status) || item?.source_assertions?.some((entry) => entry?.observed_at || entry?.freshness_status))
);
const resultEvidence = (payload) => [...asArray(payload?.results ?? payload?.candidates ?? payload?.recommendations)].map((item) => ({
  id: item?.id ?? item?.item_id ?? null,
  title: item?.title ?? null,
  type: item?.type ?? item?.product_kind ?? null,
  provider: item?.provider ?? null,
  source_ids: sourceIds(item),
  freshness_status: item?.freshness_status ?? item?.source_freshness_status ?? null,
  score: item?.match_score ?? item?.score ?? item?.relevance_score ?? null,
}));
const contractFailures = (contract, payload) => {
  if (!contract) return [];
  const items = [...asArray(payload?.results ?? payload?.candidates ?? payload?.recommendations)];
  const evidence = resultEvidence(payload);
  const failures = [];
  if (contract.minimum_result_count !== undefined && items.length < contract.minimum_result_count) failures.push(`minimum_result_count=${items.length}<${contract.minimum_result_count}`);
  if (contract.allowed_types?.length && items.some((item) => !contract.allowed_types.includes(item?.type))) failures.push(`allowed_types=${JSON.stringify(contract.allowed_types)}`);
  if (contract.forbidden_types?.length && items.some((item) => contract.forbidden_types.includes(item?.type))) failures.push(`forbidden_types=${JSON.stringify(contract.forbidden_types)}`);
  if (contract.provider_diversity_count !== undefined && new Set(items.map((item) => item?.provider).filter(Boolean)).size < contract.provider_diversity_count) failures.push(`provider_diversity=${new Set(items.map((item) => item?.provider).filter(Boolean)).size}<${contract.provider_diversity_count}`);
  const actualSources = new Set(evidence.flatMap((item) => item.source_ids));
  const missingSources = asArray(contract.require_source_ids).filter((id) => !actualSources.has(String(id)));
  if (missingSources.length) failures.push(`missing_sources=${JSON.stringify(missingSources)}`);
  if (contract.require_freshness && items.some((item) => !item?.freshness_status)) failures.push("freshness=missing");
  if (contract.freshness_status !== undefined && items.some((item) => item?.freshness_status !== contract.freshness_status)) failures.push(`freshness=${contract.freshness_status}`);
  return failures;
};
const semanticRpc = async (name, arguments_) => {
  let result;
  const transportAttempts = [];
  for (let attempt = 1; attempt <= caseAttempts; attempt += 1) {
    try {
      result = await rpc("tools/call", { name, arguments: arguments_ });
    } catch (error) {
      result = { isError: true, error: { message: error instanceof Error ? error.message : String(error) } };
    }
    if (result?._transport) transportAttempts.push(result._transport);
    if (!result?.isError || attempt === caseAttempts) return { ...result, _transport_attempts: transportAttempts };
    await wait(caseRetryDelayMs);
  }
  return { ...result, _transport_attempts: transportAttempts };
};
const results = [];
for (const entry of fixture) {
  currentCaseId = entry.case_id;
  let diagnostic = { actual_status: null, actual_result_ids: [], actual_source_ids: [], actual_reason_codes: [], top_k_scores: [], retry_errors: [], transport_diagnostics: [] };
  let failurePhase = null;
  const recordTransport = (phase, tool, result) => {
    const attempts = Array.isArray(result?._transport_attempts) ? result._transport_attempts : result?._transport ? [result._transport] : [];
    for (const transport of attempts) {
      if (diagnostic.transport_diagnostics.length >= 32) break;
      diagnostic.transport_diagnostics.push({ phase, tool, ...transport });
    }
  };
  const recordFailureDiagnostic = (error) => {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const details = JSON.parse(message);
      failurePhase = details.phase ?? failurePhase;
      const actual = details.actual;
      if (actual && !Array.isArray(actual)) {
        diagnostic = { ...diagnostic, actual_status: actual.status ?? diagnostic.actual_status, actual_result_ids: actual.id ? [actual.id] : (actual.result_ids ?? diagnostic.actual_result_ids), actual_source_ids: actual.source_ids ?? diagnostic.actual_source_ids, actual_reason_codes: actual.reason_codes ?? diagnostic.actual_reason_codes, top_k_scores: actual.top_k_scores ?? diagnostic.top_k_scores };
      } else if (Array.isArray(actual)) {
        diagnostic = { ...diagnostic, actual_result_ids: actual.map((item) => item?.id).filter(Boolean), actual_source_ids: actual.flatMap((item) => item?.source_ids ?? []), top_k_scores: actual.map((item) => ({ id: item?.id ?? null, score: item?.score ?? null })) };
      }
    } catch { /* retain the generic diagnostic fields for non-JSON failures */ }
    return message;
  };
  try {
    let result;
    const retryErrors = [];
    const expectedError = entry.expected_status === "error" || entry.expect_error === true;
    for (let attempt = 1; attempt <= caseAttempts; attempt += 1) {
      try {
        result = await rpc("tools/call", { name: entry.tool, arguments: entry.arguments });
      } catch (error) {
        result = { isError: true, http_status: 503, error: { message: error instanceof Error ? error.message : String(error) } };
      }
      recordTransport("base", entry.tool, result);
      const retryable = !expectedError && result?.isError;
      if (!retryable || attempt === caseAttempts) break;
      try { recordTransport("retry_initialize", "initialize", await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "openfin-live-regression", version: "1" } })); } catch (error) { retryErrors.push(error instanceof Error ? error.message : String(error)); }
      await wait(caseRetryDelayMs);
    }
    const text = result.content?.find((value) => value.type === "text")?.text;
    let payload = null;
    let parseError;
    if (typeof text === "string") {
      try { payload = JSON.parse(text); } catch (error) { parseError = error; }
    }
    const actualStatus = result.isError || (expectedError && parseError) ? "error" : payload?.status ?? "ok";
    diagnostic = {
      actual_status: actualStatus,
      actual_result_ids: resultIds(payload),
      actual_source_ids: sourceIds(payload),
      actual_reason_codes: reasonCodes(payload),
      top_k_scores: resultEvidence(payload).map(({ id, score }) => ({ id, score })),
      retry_errors: retryErrors,
      transport_diagnostics: diagnostic.transport_diagnostics,
    };
    if (actualStatus !== entry.expected_status) throw new Error(`status=${actualStatus}; expected=${entry.expected_status}; http_status=${result?.http_status ?? "n/a"}; error=${result?.error?.message ?? "n/a"}`);
    if (expectedError) {
      if (!result.isError && !parseError) throw new Error("expected tool error but received a structured success response");
      results.push({ case_id: entry.case_id, category: entry.category, semantic_hash: semanticHash(entry), status: "passed", ...diagnostic });
      continue;
    }
    const missing = entry.required_fields.filter((field) => !payload || !(field in payload));
    const forbidden = entry.forbidden_claims.filter((claim) => JSON.stringify(payload).toLocaleLowerCase("en-US").includes(claim.toLocaleLowerCase("en-US")));
    const actualReasons = reasonCodes(payload);
    const missingReasons = asArray(entry.expected_reason_codes).filter((code) => !actualReasons.includes(String(code)));
    const pathMismatches = Object.entries(entry.expected_paths ?? {}).filter(([pathExpression, expected]) => JSON.stringify(getPath(payload, pathExpression)) !== JSON.stringify(expected));
    const actualResultIds = resultIds(payload);
    const missingResultIds = asArray(entry.expected_result_ids).filter((id) => !actualResultIds.includes(String(id)));
    const forbiddenResultIds = asArray(entry.forbidden_result_ids).filter((id) => actualResultIds.includes(String(id)));
    const expectedOrder = asArray(entry.expected_candidate_order);
    const orderMismatch = expectedOrder.length && JSON.stringify(actualResultIds.slice(0, expectedOrder.length)) !== JSON.stringify(expectedOrder.map(String));
    const actualSources = sourceIds(payload);
    const missingSources = asArray(entry.expected_source_ids).filter((id) => !actualSources.includes(String(id)));
    const actualFreshness = getPath(payload, entry.freshness_path ?? "freshness_status") ?? getPath(payload, "source_freshness_status");
    const freshnessMismatch = entry.expected_freshness_status !== undefined && actualFreshness !== entry.expected_freshness_status;
    const actualUnknown = [...new Set([...asArray(payload?.unknown_conditions), ...asArray(payload?.fit?.unknown_conditions)])].map(String);
    const missingUnknown = asArray(entry.expected_unknown_conditions).filter((condition) => !actualUnknown.includes(String(condition)));
    const failures = [];
    const baseContractFailures = contractFailures(entry.search_contract, payload);
    if (missing.length || forbidden.length || missingReasons.length || pathMismatches.length || missingResultIds.length || forbiddenResultIds.length || orderMismatch || missingSources.length || freshnessMismatch || missingUnknown.length || baseContractFailures.length || result.isError) failures.push(JSON.stringify({ phase: "base", missing, forbidden, missingReasons, pathMismatches, missingResultIds, forbiddenResultIds, orderMismatch, missingSources, freshnessMismatch, missingUnknown, contract: baseContractFailures, actual: resultEvidence(payload), error: result?.error?.message ?? null }));
    for (const semantic of asArray(entry.semantic_search)) {
      try {
        const searchResult = await semanticRpc("search", { query: semantic.query, ...(semantic.type ? { type: semantic.type } : {}), limit: Math.max(semantic.expected_result_ids?.length ?? 0, semantic.category_contract?.minimum_result_count ?? 0, 3) });
        recordTransport("semantic_search", "search", searchResult);
        const searchText = searchResult.content?.find((value) => value.type === "text")?.text;
        const searchPayload = typeof searchText === "string" ? JSON.parse(searchText) : null;
        const searchIds = resultIds(searchPayload);
        const expectedSearchItems = asArray(semantic.expected_result_ids).map((id) => searchPayload?.results?.find((item) => item?.id === id));
        const expectedAny = asArray(semantic.expected_result_ids_any);
        const intentFailures = semantic.intent_contract ? [
          ...(!semantic.intent_contract.expected_result_ids?.every((id) => searchIds.includes(String(id))) ? ["missing_expected_ids"] : []),
          ...(expectedAny.length && !expectedAny.some((id) => searchIds.includes(String(id))) ? ["missing_expected_id_set_member"] : []),
        ] : [];
        const categoryFailures = contractFailures(semantic.category_contract, searchPayload);
        const legacyFailures = !semantic.category_contract && !semantic.intent_contract ? [
          ...(searchPayload?.result_count < 1 ? ["empty_results"] : []),
          ...(semantic.expected_top_id && searchIds[0] !== semantic.expected_top_id ? ["top_id_mismatch"] : []),
          ...(expectedSearchItems.some((item) => !item || !sourceIds(item).length || !freshnessPresent(item)) ? ["missing_source_or_freshness"] : []),
        ] : [];
        const expectedTopK = asArray(semantic.expected_top_k_ids);
        const topKFailure = expectedTopK.length && JSON.stringify(searchIds.slice(0, expectedTopK.length)) !== JSON.stringify(expectedTopK.map(String)) ? ["top_k_mismatch"] : [];
        const expectedSources = asArray(semantic.expected_source_ids).map(String).sort();
        const actualExpectedSources = [...new Set(expectedSearchItems.flatMap((item) => sourceIds(item)))].sort();
        const sourceFailure = expectedSources.length && JSON.stringify(actualExpectedSources) !== JSON.stringify(expectedSources) ? ["source_ids_mismatch"] : [];
        const freshnessFailure = [
          ...(semantic.require_freshness && expectedSearchItems.some((item) => !freshnessPresent(item)) ? ["freshness_missing"] : []),
          ...(semantic.expected_freshness_status !== undefined && expectedSearchItems.some((item) => (item?.freshness_status ?? item?.source_freshness_status ?? null) !== semantic.expected_freshness_status) ? ["freshness_mismatch"] : []),
        ];
        if (searchResult.isError || !searchPayload || intentFailures.length || categoryFailures.length || legacyFailures.length || topKFailure.length || sourceFailure.length || freshnessFailure.length) throw new Error(JSON.stringify({ phase: "semantic_search", query: semantic.query, expected_top_id: semantic.expected_top_id ?? null, expected_top_k_ids: expectedTopK, expected_result_ids: semantic.expected_result_ids ?? [], expected_result_ids_any: expectedAny, expected_source_ids: expectedSources, expected_freshness_status: semantic.expected_freshness_status ?? null, actual: resultEvidence(searchPayload), failures: [...intentFailures, ...categoryFailures, ...legacyFailures, ...topKFailure, ...sourceFailure, ...freshnessFailure], error: searchResult.error?.message ?? null }));
        if (!semantic.fetch_id) continue;
        const fetchedResult = await semanticRpc("fetch", { id: semantic.fetch_id });
        recordTransport("semantic_fetch", "fetch", fetchedResult);
        const fetchedText = fetchedResult.content?.find((value) => value.type === "text")?.text;
        const fetchedPayload = typeof fetchedText === "string" ? JSON.parse(fetchedText) : null;
        const searchTitle = searchPayload.results?.find((item) => item?.id === semantic.fetch_id)?.title;
        const topTitle = searchPayload.results?.[0]?.title;
        if (fetchedResult.isError || !fetchedPayload || fetchedPayload.id !== semantic.fetch_id || !sourceIds(fetchedPayload).length || !freshnessPresent(fetchedPayload) || !semantic.expected_title || topTitle !== semantic.expected_title || !searchTitle || searchTitle !== semantic.expected_title || fetchedPayload.title !== semantic.expected_title) throw new Error(JSON.stringify({ phase: "semantic_fetch", query: semantic.query, fetch_id: semantic.fetch_id, expected_title: semantic.expected_title ?? null, top_title: topTitle ?? null, search_title: searchTitle ?? null, actual: resultEvidence({ results: [fetchedPayload] })[0] ?? null, error: fetchedResult.error?.message ?? null }));
      } catch (error) {
        failures.push(recordFailureDiagnostic(error));
      }
    }
    if (failures.length) throw new Error(failures.join(" | "));
    results.push({ case_id: entry.case_id, category: entry.category, semantic_hash: semanticHash(entry), status: "passed", ...diagnostic });
  } catch (error) { results.push({ case_id: entry.case_id, category: entry.category, status: "failed", failure_phase: failurePhase ?? "base", error: error instanceof Error ? error.message : String(error), ...diagnostic }); }
}
currentCaseId = null;
const passed = results.filter((result) => result.status === "passed").length;
const transportDiagnostics = results.flatMap((result) => result.transport_diagnostics ?? []);
const report = { status: passed === fixture.length ? "current" : "failed", mode: "live", checked_at: new Date().toISOString(), endpoint, runtime_version: healthPayload.runtime_version ?? null, deployment_commit: healthPayload.deployment_commit ?? null, generation_id: manifest.generation_id ?? null, manifest_version: manifest.version ?? null, manifest_checksum: manifest.manifest_checksum ?? null, loaded_index_checksum: manifest.search_index?.export_checksum ?? null, source_status_checksum: manifest.source_status?.export_checksum ?? null, loaded_item_count: manifest.search_index?.item_count ?? null, fixture_checksum: `sha256:${checksum}`, semantic_unique_case_count: new Set(semanticHashes).size, category_counts: categoryCounts, transport_error_count: transportDiagnostics.filter((entry) => entry.http_status === 0 || entry.http_status >= 500).length, test_count: fixture.length, passed_count: passed, failed_count: fixture.length - passed, skipped_count: 0, results };
console.log(JSON.stringify(report, null, 2));
if (passed !== fixture.length) process.exitCode = 1;
