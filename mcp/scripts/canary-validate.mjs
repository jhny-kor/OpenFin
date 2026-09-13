const endpoint = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev").replace(/\/$/, "");
const workerName = process.env.CLOUDFLARE_WORKER_NAME || "openfin-mcp";
const versionId = process.env.CANARY_VERSION_ID || "";
const expectedCommit = process.env.EXPECTED_DEPLOYMENT_COMMIT || "";
const expectedGeneration = process.env.EXPECTED_GENERATION || "";
const requests = Number(process.env.CANARY_REQUESTS || 12);
if (!Number.isInteger(requests) || requests < 1 || requests > 120) throw new Error("CANARY_REQUESTS must be an integer from 1 to 120");
if (!versionId || !expectedCommit || !expectedGeneration) throw new Error("CANARY_VERSION_ID, EXPECTED_DEPLOYMENT_COMMIT, and EXPECTED_GENERATION are required");

const override = `${workerName}="${versionId}"`;
const errors = [];
const call = async (tool, args, index) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.LIVE_REQUEST_TIMEOUT_MS || 15000));
  let response;
  try {
    response = await fetch(`${endpoint}/mcp?canary=${Date.now()}-${index}`, { method: "POST", signal: controller.signal, headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18", "Cloudflare-Workers-Version-Overrides": override }, body: JSON.stringify({ jsonrpc: "2.0", id: index + 1, method: "tools/call", params: { name: tool, arguments: args } }) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error || !payload.result || payload.result.isError) throw new Error(`${tool} contract failure`);
  } finally { clearTimeout(timer); }
};
for (let index = 0; index < requests; index += 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.LIVE_REQUEST_TIMEOUT_MS || 15000));
  try {
    const response = await fetch(`${endpoint}/health?canary=${Date.now()}-${index}`, {
      headers: { accept: "application/json", "cache-control": "no-cache", "Cloudflare-Workers-Version-Overrides": override },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const health = await response.json();
    if (health.status !== "ok" || health.deployment_commit !== expectedCommit || health.generation_id !== expectedGeneration || health.artifact_generation !== expectedGeneration) throw new Error("candidate binding mismatch");
    if (!health.runtime_version || /(?:^|[-_])dev(?:$|[-_])/i.test(health.runtime_version) || !health.build_timestamp || !Number.isFinite(Date.parse(health.build_timestamp))) throw new Error("runtime contract invalid");
    await call("search", { query: "청년 주택드림 청약통장", limit: 1 }, index);
    await call("fetch", { id: "finance.account.housing-subscription.nhuf.youth-dream" }, index);
  } catch (error) {
    errors.push(error?.name === "AbortError" ? "timeout" : error instanceof TypeError ? `aborted:${error.message}` : error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timer);
  }
}
const report = { status: errors.length ? "failed" : "current", endpoint, version_id: versionId, requests, traffic_observed: requests - errors.length, http_5xx: errors.filter((error) => /HTTP 5\d\d/.test(error)).length, http_4xx: errors.filter((error) => /HTTP 4\d\d/.test(error)).length, abort: errors.filter((error) => error.startsWith("aborted")).length, timeout: errors.filter((error) => error === "timeout").length, contract_failure: errors.filter((error) => !/^HTTP \d+$/.test(error) && !error.startsWith("aborted") && error !== "timeout").length, errors };
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === "current" && report.traffic_observed > 0 ? 0 : 1);
