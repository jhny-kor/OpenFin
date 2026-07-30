import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const fixturePath = path.join(root, "tests/golden/openfin-120.jsonl");
const fixture = fs.readFileSync(fixturePath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const checksum = crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex");
const required = ["case_id", "category", "tool", "arguments", "expected_status", "required_fields", "forbidden_claims", "expected_reason_codes"];
const categoryMinimums = { exact_search: 20, alias_search: 10, ambiguous_query: 10, comparison: 15, eligibility: 15, freshness: 10, recommendation_gate: 15, security: 10, unknown: 10, deployment: 5 };
const ids = new Set();
const invalid = fixture.filter((entry) => !required.every((key) => key in entry) || ids.has(entry.case_id) || !ids.add(entry.case_id));
const semanticHash = (entry) => crypto.createHash("sha256").update(JSON.stringify({ tool: entry.tool, arguments: entry.arguments, expected_status: entry.expected_status, required_fields: entry.required_fields, expected_reason_codes: entry.expected_reason_codes, expected_paths: entry.expected_paths ?? null, expected_result_ids: entry.expected_result_ids ?? null, forbidden_result_ids: entry.forbidden_result_ids ?? null })).digest("hex");
const semanticHashes = fixture.map(semanticHash);
const categoryCounts = Object.fromEntries(Object.keys(categoryMinimums).map((category) => [category, fixture.filter((entry) => entry.category === category).length]));
const invalidCategories = Object.entries(categoryMinimums).filter(([category, minimum]) => (categoryCounts[category] ?? 0) < minimum).map(([category, minimum]) => `${category}:${categoryCounts[category] ?? 0}<${minimum}`);
const duplicateSemanticCount = semanticHashes.length - new Set(semanticHashes).size;
if (fixture.length !== 120 || invalid.length || duplicateSemanticCount || invalidCategories.length) throw new Error(`fixture must contain 120 unique semantic cases; got ${fixture.length}, invalid ${invalid.length}, duplicate_semantics ${duplicateSemanticCount}, categories ${invalidCategories.join(",")}`);
if (process.argv.includes("--validate-fixture")) { console.log(JSON.stringify({ ok: true, case_count: fixture.length, semantic_unique_case_count: new Set(semanticHashes).size, duplicate_ids: 0, duplicate_semantic_cases: duplicateSemanticCount, category_counts: categoryCounts, fixture_checksum: `sha256:${checksum}` }, null, 2)); process.exit(0); }

const endpoint = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev/mcp").replace(/\/$/, "");
const base = endpoint.replace(/\/mcp$/, "");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const metadataAttempts = Number(process.env.LIVE_METADATA_ATTEMPTS || 10);
const metadataDelayMs = Number(process.env.LIVE_METADATA_DELAY_MS || 3000);
let healthPayload;
let manifest;
let metadataError;
for (let attempt = 1; attempt <= metadataAttempts; attempt += 1) {
  try {
    const cacheBust = `live=${Date.now()}-${attempt}`;
    const health = await fetch(`${base}/health?${cacheBust}`, { headers: { "cache-control": "no-cache" } });
    if (!health.ok) throw new Error(`health failed: ${health.status}`);
    const candidateHealth = await health.json();
    const manifestResponse = await fetch(`${candidateHealth.finance_manifest_url}?${cacheBust}`, { headers: { "cache-control": "no-cache" } });
    if (!manifestResponse.ok) throw new Error(`manifest failed: ${manifestResponse.status}`);
    const candidateManifest = await manifestResponse.json();
    if (typeof candidateManifest.generation_id !== "string" || candidateHealth.deployment_commit === "unknown") throw new Error("deployment/manifest generation metadata is missing or inconsistent");
    if (candidateHealth.generation_id !== candidateManifest.generation_id) throw new Error("health/manifest generation mismatch");
    healthPayload = candidateHealth;
    manifest = candidateManifest;
    break;
  } catch (error) {
    metadataError = error;
    if (attempt < metadataAttempts) await wait(metadataDelayMs);
  }
}
if (!healthPayload || !manifest) throw metadataError || new Error("live deployment metadata unavailable");
let id = 0;
const rpc = async (method, params = {}) => {
  const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }) });
  let body; try { body = await response.json(); } catch { body = { error: { message: `${method}: ${response.status}` } }; }
  if (body.error) return { isError: true, error: body.error, http_status: response.status };
  if (!response.ok) return { isError: true, error: { message: `${method}: ${response.status}` }, http_status: response.status };
  return body.result;
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
  ...asArray(payload?.results).flatMap((item) => asArray(item?.source_ids)),
  ...asArray(payload?.candidates).flatMap((item) => asArray(item?.source_ids)),
].filter(Boolean).map(String))];
const results = [];
for (const entry of fixture) {
  try {
    const result = await rpc("tools/call", { name: entry.tool, arguments: entry.arguments });
    const text = result.content?.find((value) => value.type === "text")?.text;
    const payload = typeof text === "string" ? JSON.parse(text) : null;
    const expectedError = entry.expected_status === "error" || entry.expect_error === true;
    const actualStatus = result.isError ? "error" : payload?.status ?? "ok";
    if (actualStatus !== entry.expected_status) throw new Error(`status=${actualStatus}; expected=${entry.expected_status}`);
    if (expectedError) {
      if (!result.isError) throw new Error("expected tool error but received a success response");
      results.push({ case_id: entry.case_id, category: entry.category, semantic_hash: semanticHash(entry), status: "passed" });
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
    if (missing.length || forbidden.length || missingReasons.length || pathMismatches.length || missingResultIds.length || forbiddenResultIds.length || orderMismatch || missingSources.length || freshnessMismatch || missingUnknown.length || result.isError) throw new Error(JSON.stringify({ missing, forbidden, missingReasons, pathMismatches, missingResultIds, forbiddenResultIds, orderMismatch, missingSources, freshnessMismatch, missingUnknown }));
    results.push({ case_id: entry.case_id, category: entry.category, semantic_hash: semanticHash(entry), status: "passed" });
  } catch (error) { results.push({ case_id: entry.case_id, status: "failed", error: error instanceof Error ? error.message : String(error) }); }
}
const passed = results.filter((result) => result.status === "passed").length;
const report = { status: passed === fixture.length ? "current" : "failed", mode: "live", checked_at: new Date().toISOString(), endpoint, runtime_version: healthPayload.runtime_version ?? null, deployment_commit: healthPayload.deployment_commit ?? null, generation_id: manifest.generation_id ?? null, manifest_version: manifest.version ?? null, manifest_checksum: manifest.manifest_checksum ?? null, loaded_index_checksum: manifest.search_index?.export_checksum ?? null, source_status_checksum: manifest.source_status?.export_checksum ?? null, loaded_item_count: manifest.search_index?.item_count ?? null, fixture_checksum: `sha256:${checksum}`, semantic_unique_case_count: new Set(semanticHashes).size, category_counts: categoryCounts, test_count: fixture.length, passed_count: passed, failed_count: fixture.length - passed, skipped_count: 0, results };
console.log(JSON.stringify(report, null, 2));
if (passed !== fixture.length) process.exitCode = 1;
