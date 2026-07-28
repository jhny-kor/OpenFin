const base = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev").replace(/\/$/, "");
const attempts = Number(process.env.SMOKE_ATTEMPTS || 8);
const delayMs = Number(process.env.SMOKE_DELAY_MS || 3000);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let healthPayload;
let ready;
let readyPayload;
let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const health = await fetch(`${base}/health`, { headers: { accept: "application/json" } });
    if (!health.ok) throw new Error(`/health failed: ${health.status}`);
    healthPayload = await health.json();
    if (healthPayload.status !== "ok") throw new Error("/health is not live");
    ready = await fetch(`${base}/ready`, { headers: { accept: "application/json" } });
    if (![200, 503].includes(ready.status)) throw new Error(`/ready unexpected status: ${ready.status}`);
    readyPayload = await ready.json();
    if (!["ready", "degraded"].includes(readyPayload.status)) throw new Error("/ready missing readiness status");
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
const search = toolPayload(await rpc("tools/call", { name: "search", arguments: { query: "청년 주택드림 청약통장", limit: 1 } }), "search");
if (!Array.isArray(search.results) || typeof search.result_count !== "number") throw new Error("representative search is incomplete");
const fetched = toolPayload(await rpc("tools/call", { name: "fetch", arguments: { id: "finance.account.housing-subscription.nhuf.youth-dream" } }), "fetch");
if (fetched.id !== "finance.account.housing-subscription.nhuf.youth-dream") throw new Error("representative fetch returned the wrong item");

console.log(JSON.stringify({
  health: healthPayload,
  ready: { status: readyPayload.status, ready: readyPayload.ready, release_status: readyPayload.release_status, recommendation_enabled: readyPayload.recommendation_enabled, checksum_verified: readyPayload.checksum_verified },
  mcp: { initialized: true, quality_status: quality.quality_status.release_status, search_result_count: search.result_count, fetched_id: fetched.id },
}, null, 2));
