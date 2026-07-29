import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const fixturePath = path.join(root, "tests/golden/openfin-120.jsonl");
const fixture = fs.readFileSync(fixturePath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
const checksum = crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex");
const required = ["case_id", "category", "tool", "arguments", "expected_status", "required_fields", "forbidden_claims", "expected_reason_codes"];
const ids = new Set();
const invalid = fixture.filter((entry) => !required.every((key) => key in entry) || ids.has(entry.case_id) || !ids.add(entry.case_id));
if (fixture.length !== 120 || invalid.length) throw new Error(`fixture must contain 120 unique valid cases; got ${fixture.length}, invalid ${invalid.length}`);
if (process.argv.includes("--validate-fixture")) { console.log(JSON.stringify({ ok: true, case_count: fixture.length, duplicate_ids: 0, fixture_checksum: `sha256:${checksum}` }, null, 2)); process.exit(0); }

const endpoint = (process.env.MCP_URL || "https://openfin-mcp.y2kthr.workers.dev/mcp").replace(/\/$/, "");
const base = endpoint.replace(/\/mcp$/, "");
const health = await fetch(`${base}/health`); if (!health.ok) throw new Error(`health failed: ${health.status}`);
const healthPayload = await health.json();
const manifestResponse = await fetch(healthPayload.finance_manifest_url); if (!manifestResponse.ok) throw new Error(`manifest failed: ${manifestResponse.status}`);
const manifest = await manifestResponse.json();
let id = 0;
const rpc = async (method, params = {}) => {
  const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }) });
  if (!response.ok) throw new Error(`${method}: ${response.status}`);
  const body = await response.json(); if (body.error) throw new Error(body.error.message); return body.result;
};
await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "openfin-live-regression", version: "1" } });
const results = [];
for (const entry of fixture) {
  try {
    const result = await rpc("tools/call", { name: entry.tool, arguments: entry.arguments });
    const text = result.content?.find((value) => value.type === "text")?.text;
    const payload = typeof text === "string" ? JSON.parse(text) : null;
    const missing = entry.required_fields.filter((field) => !payload || !(field in payload));
    const forbidden = entry.forbidden_claims.filter((claim) => JSON.stringify(payload).toLocaleLowerCase("en-US").includes(claim.toLocaleLowerCase("en-US")));
    if (missing.length || forbidden.length || result.isError) throw new Error(`missing=${missing.join(",")}; forbidden=${forbidden.join(",")}`);
    results.push({ case_id: entry.case_id, status: "passed" });
  } catch (error) { results.push({ case_id: entry.case_id, status: "failed", error: error instanceof Error ? error.message : String(error) }); }
}
const passed = results.filter((result) => result.status === "passed").length;
const report = { status: passed === fixture.length ? "current" : "failed", mode: "live", checked_at: new Date().toISOString(), endpoint, runtime_version: healthPayload.runtime_version ?? null, deployment_commit: healthPayload.deployment_commit ?? null, manifest_version: manifest.version ?? null, manifest_checksum: manifest.manifest_checksum ?? null, loaded_index_checksum: manifest.search_index?.export_checksum ?? null, loaded_item_count: manifest.search_index?.item_count ?? null, fixture_checksum: `sha256:${checksum}`, test_count: fixture.length, passed_count: passed, failed_count: fixture.length - passed, skipped_count: 0, results };
console.log(JSON.stringify(report, null, 2));
if (passed !== fixture.length) process.exitCode = 1;
