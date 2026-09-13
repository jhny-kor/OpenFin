import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const baseEnv = { CANARY_VERSION_ID: "11111111-1111-4111-8111-111111111111", EXPECTED_DEPLOYMENT_COMMIT: "a".repeat(40), EXPECTED_GENERATION: "b".repeat(64), CANARY_REQUESTS: "1", LIVE_REQUEST_TIMEOUT_MS: "100" };
async function invoke(mode) {
  const server = createServer((request, response) => {
    if (request.url.startsWith("/health")) {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ status: "ok", runtime_version: "openfin-mcp-release", build_timestamp: new Date().toISOString(), deployment_commit: baseEnv.EXPECTED_DEPLOYMENT_COMMIT, generation_id: mode === "generation" ? "c".repeat(64) : baseEnv.EXPECTED_GENERATION, artifact_generation: baseEnv.EXPECTED_GENERATION }));
    } else if (mode === "stalled-body") { response.writeHead(200, { "content-type": "application/json" }); response.write("{");
    } else if (mode === "stalled") { /* leave the body open until the client times out */
    } else if (mode === "http500") { response.statusCode = 500; response.end("upstream failure");
    } else {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ jsonrpc: "2.0", id: 1, result: mode === "isError" ? { isError: true } : { content: [{ type: "text", text: "{}" }] } }));
    }
  });
  await new Promise((resolve) => server.listen(0, resolve));
  try { return await run("node", ["scripts/canary-validate.mjs"], { cwd: new URL("..", import.meta.url).pathname, env: { ...process.env, ...baseEnv, MCP_URL: `http://127.0.0.1:${server.address().port}` } }); }
  catch (error) { return error; }
  finally { server.closeAllConnections(); server.close(); }
}

test("canary validator accepts a bound candidate", async () => { const result = await invoke("ok"); assert.equal(result.stderr, ""); });
for (const mode of ["generation", "isError", "stalled", "stalled-body", "http500"]) test(`canary validator rejects ${mode}`, async () => { const result = await invoke(mode); assert.notEqual(result.code, 0); });
