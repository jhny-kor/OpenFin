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
console.log(JSON.stringify({ health: healthPayload, ready: readyPayload }, null, 2));
