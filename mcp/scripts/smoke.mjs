const base = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev").replace(/\/$/, "");
// Pages and the Worker deploy independently; allow their manifests to converge.
const attempts = Number(process.env.SMOKE_ATTEMPTS || 60);
const delayMs = Number(process.env.SMOKE_DELAY_MS || 5000);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let healthPayload;
let ready;
let readyPayload;
let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const cacheBust = `smoke=${Date.now()}-${attempt}`;
    const health = await fetch(`${base}/health?${cacheBust}`, { headers: { accept: "application/json", "cache-control": "no-cache" } });
    if (!health.ok) throw new Error(`/health failed: ${health.status}`);
    healthPayload = await health.json();
    if (healthPayload.status !== "ok") throw new Error("/health is not live");
    ready = await fetch(`${base}/ready?${cacheBust}`, { headers: { accept: "application/json", "cache-control": "no-cache" } });
    if (ready.status !== 200) throw new Error(`/ready failed: ${ready.status}`);
    readyPayload = await ready.json();
    if (readyPayload.status !== "ready" || readyPayload.capabilities?.core !== "ready" || readyPayload.capabilities?.search !== "ready") throw new Error("/ready core capabilities are not ready");
    if (readyPayload.capabilities?.recommendation !== "blocked") throw new Error("recommendation must remain blocked by current policy");
    if (healthPayload.deployment_commit === "unknown") throw new Error("/health deployment_commit is unknown");
    if (!healthPayload.generation_id || healthPayload.generation_id !== readyPayload.generation_id) throw new Error("health/ready generation_id mismatch");
    if (!healthPayload.artifact_contract || healthPayload.artifact_contract.generation_id !== healthPayload.generation_id || healthPayload.artifact_contract.deployment_commit !== healthPayload.manifest_deployment_commit) throw new Error("health artifact contract is incomplete");
    if (!readyPayload.artifact_contract || readyPayload.artifact_contract.generation_id !== readyPayload.generation_id || readyPayload.artifact_contract.search_index_checksum !== readyPayload.loaded_index_checksum) throw new Error("ready artifact contract is incomplete");
    if (readyPayload.capabilities?.recommendation === "ready" && readyPayload.live_regression?.generation_id && readyPayload.live_regression.generation_id !== healthPayload.generation_id) throw new Error("live evidence generation mismatch");
    if (process.env.EXPECTED_DEPLOYMENT_COMMIT && healthPayload.deployment_commit !== process.env.EXPECTED_DEPLOYMENT_COMMIT) throw new Error(`/health deployment_commit mismatch: ${healthPayload.deployment_commit}`);
    break;
  } catch (error) {
    lastError = error;
    if (attempt === attempts) throw error;
    await wait(delayMs);
  }
}
if (!healthPayload || !ready || !readyPayload) throw lastError || new Error("smoke test did not receive a response");
const endpoint = `${base}/mcp`;
let requestId = 0;
async function rpc(method, params = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++requestId, method, params }),
  });
  if (!response.ok) throw new Error(`${method} failed: ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`${method} JSON-RPC error: ${payload.error.message || JSON.stringify(payload.error)}`);
  if (!payload.result) throw new Error(`${method} missing result`);
  return payload.result;
}

function toolPayload(result, toolName) {
  if (result.isError) throw new Error(`${toolName} returned isError`);
  const text = result.content?.find((entry) => entry.type === "text")?.text;
  if (typeof text !== "string") throw new Error(`${toolName} missing text content`);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${toolName} returned invalid JSON content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const initialized = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "openfin-release-smoke", version: "1.0.0" },
});
if (initialized.serverInfo?.name !== "finance") throw new Error("initialize returned an unexpected server");
const quality = toolPayload(await rpc("tools/call", { name: "get_openfin_quality_status", arguments: {} }), "get_openfin_quality_status");
if (!quality.quality_status || typeof quality.quality_status.release_status !== "string") throw new Error("quality status is incomplete");
if (quality.quality_status.core_search_status !== "ready" || quality.quality_status.recommendation_status !== "blocked") throw new Error("quality capability status is incomplete");
const search = toolPayload(await rpc("tools/call", { name: "search", arguments: { query: "청년 주택드림 청약통장", limit: 1 } }), "search");
if (!Array.isArray(search.results) || typeof search.result_count !== "number") throw new Error("representative search is incomplete");
const fetched = toolPayload(await rpc("tools/call", { name: "fetch", arguments: { id: "finance.account.housing-subscription.nhuf.youth-dream" } }), "fetch");
if (fetched.id !== "finance.account.housing-subscription.nhuf.youth-dream") throw new Error("representative fetch returned the wrong item");
const comparison = toolPayload(await rpc("tools/call", { name: "compare", arguments: { domain: "deposit", term_months: 12, limit: 1 } }), "compare");
if ((comparison.status === "blocked" && !Array.isArray(comparison.reason_codes)) || (!comparison.status && !Array.isArray(comparison.blockers))) throw new Error("compare readiness reason is incomplete");
const recommendation = toolPayload(await rpc("tools/call", { name: "recommend", arguments: { domain: "deposit", limit: 1 } }), "recommend");
if (recommendation.status !== "blocked" || recommendation.result_count !== 0 || !Array.isArray(recommendation.reason_codes) || !recommendation.reason_codes.length) throw new Error("blocked recommendation contract is incomplete");

console.log(JSON.stringify({
  health: healthPayload,
  ready: { status: readyPayload.status, ready: readyPayload.ready, release_status: readyPayload.release_status, recommendation_enabled: readyPayload.recommendation_enabled, checksum_verified: readyPayload.checksum_verified },
  mcp: { initialized: true, quality_status: quality.quality_status.release_status, search_result_count: search.result_count, fetched_id: fetched.id, comparison_status: comparison.status, recommendation_status: recommendation.status, recommendation_result_count: recommendation.result_count },
}, null, 2));
