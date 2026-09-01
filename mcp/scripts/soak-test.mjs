import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const fixturePath = path.join(root, "tests/golden/openfin-runtime-contract-120.jsonl");
const fixture = fs.readFileSync(fixturePath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const fixtureChecksum = crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex");

const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const durationMinutes = Number(option("--duration-minutes", process.env.OPENFIN_SOAK_DURATION_MINUTES || "30"));
const durationSeconds = Number(option("--duration-seconds", "0"));
const concurrency = Math.max(1, Math.floor(Number(option("--concurrency", process.env.OPENFIN_SOAK_CONCURRENCY || "4"))));
const requestTimeoutMs = Math.max(1000, Math.floor(Number(process.env.LIVE_REQUEST_TIMEOUT_MS || "15000")));
const endpoint = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev/mcp").replace(/\/$/, "");
const dryRun = process.argv.includes("--dry-run");
const diagnosticQuery = value => encodeURIComponent(value.slice(0, 24));
if (!Number.isFinite(durationMinutes) || durationMinutes < 0 || !Number.isFinite(durationSeconds) || durationSeconds < 0) throw new Error("duration must be non-negative");

const semanticTasks = fixture.flatMap((entry) => (entry.semantic_search || []).map((semantic, index) => ({
  caseId: `${entry.case_id}-semantic-${index + 1}`,
  tool: "search",
  arguments: { query: semantic.query, type: semantic.type, limit: Math.min(5, semantic.limit || 5) },
})));
const baseTasks = fixture.map((entry) => ({ caseId: entry.case_id, tool: entry.tool, arguments: entry.arguments }));
const tasks = [...baseTasks, ...semanticTasks];
const taskDigest = crypto.createHash("sha256").update(JSON.stringify(tasks.map(({ tool, arguments: args }) => ({ tool, arguments: args })))).digest("hex");

if (dryRun) {
  console.log(JSON.stringify({ ok: true, endpoint, duration_minutes: durationMinutes, duration_seconds: durationSeconds, concurrency, task_count: tasks.length, fixture_checksum: `sha256:${fixtureChecksum}`, task_digest: taskDigest }, null, 2));
  process.exit(0);
}

const metrics = {
  total: 0, ok: 0, http_5xx: 0, http_4xx: 0, abort: 0, timeout: 0, contract_failure: 0,
  cache_evictions: 0, cache_budget_exceeded: 0, latencies_ms: [], errors: [],
};
let sequence = 0;
let taskIndex = 0;
const startedAt = Date.now();
const durationMs = durationSeconds > 0 ? durationSeconds * 1000 : durationMinutes * 60 * 1000;
const deadline = startedAt + durationMs;

const record = (value) => {
  metrics.total += 1;
  if (metrics.latencies_ms.length < 10000) metrics.latencies_ms.push(value.elapsedMs);
  if (value.status >= 500) metrics.http_5xx += 1;
  else if (value.status >= 400) metrics.http_4xx += 1;
  else if (value.aborted) metrics.abort += 1;
  else if (value.timedOut) metrics.timeout += 1;
  else if (value.contractFailure) metrics.contract_failure += 1;
  else metrics.ok += 1;
  if (value.diagnostics) {
    metrics.cache_evictions += Number(value.diagnostics.evictions || 0);
    if (value.diagnostics.cache_budget?.search?.bytes > value.diagnostics.cache_budget?.max_search_bytes || value.diagnostics.cache_budget?.artifact?.bytes > value.diagnostics.cache_budget?.max_artifact_bytes) metrics.cache_budget_exceeded += 1;
  }
  if (value.error && metrics.errors.length < 20) metrics.errors.push(value.error);
};

const call = async (task) => {
  const requestId = `soak-${++sequence}`;
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-06-18",
        "x-openfin-diagnostics": "1",
        "x-openfin-request-id": requestId,
        "x-openfin-case-id": task.caseId,
        "x-openfin-tool": task.tool,
        "x-openfin-query-class": task.tool === "search" ? "search" : task.tool === "fetch" ? "fetch" : "other",
        ...(typeof task.arguments?.query === "string" ? { "x-openfin-query": diagnosticQuery(task.arguments.query) } : {}),
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: sequence, method: "tools/call", params: { name: task.tool, arguments: task.arguments || {} } }),
    });
    const rawDiagnostics = response.headers.get("x-openfin-diagnostics");
    let diagnostics;
    if (rawDiagnostics) { try { diagnostics = JSON.parse(rawDiagnostics); } catch { diagnostics = undefined; } }
    let payload;
    try { payload = await response.json(); } catch { payload = undefined; }
    const contractFailure = response.ok && (!payload || payload.error || !payload.result);
    record({ status: response.status, elapsedMs: Math.round((performance.now() - started) * 100) / 100, diagnostics, contractFailure, error: response.ok && contractFailure ? `${task.caseId}: invalid MCP response` : response.ok ? undefined : `${task.caseId}: HTTP ${response.status}` });
  } catch (error) {
    const aborted = error?.name === "AbortError";
    record({ status: 0, elapsedMs: Math.round((performance.now() - started) * 100) / 100, aborted: !aborted, timedOut: aborted, error: `${task.caseId}: ${error instanceof Error ? error.message : String(error)}` });
  } finally {
    clearTimeout(timer);
  }
};

const worker = async () => {
  while (Date.now() < deadline) {
    const task = tasks[taskIndex++ % tasks.length];
    await call(task);
  }
};
await Promise.all(Array.from({ length: concurrency }, worker));

const sorted = [...metrics.latencies_ms].sort((a, b) => a - b);
const percentile = (fraction) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))] : null;
const report = {
  status: metrics.http_5xx || metrics.abort || metrics.timeout || metrics.contract_failure ? "failed" : "current",
  mode: "soak",
  endpoint,
  checked_at: new Date().toISOString(),
  duration_ms: Date.now() - startedAt,
  concurrency,
  task_count: tasks.length,
  fixture_checksum: `sha256:${fixtureChecksum}`,
  task_digest: taskDigest,
  total: metrics.total,
  ok: metrics.ok,
  http_5xx: metrics.http_5xx,
  http_4xx: metrics.http_4xx,
  abort: metrics.abort,
  timeout: metrics.timeout,
  contract_failure: metrics.contract_failure,
  retry_rate: 0,
  cache_evictions: metrics.cache_evictions,
  cache_budget_exceeded: metrics.cache_budget_exceeded,
  p50_ms: percentile(0.5),
  p95_ms: percentile(0.95),
  p99_ms: percentile(0.99),
  errors: metrics.errors,
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === "current" ? 0 : 1);
