import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";

const stable = (value) => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
    : JSON.stringify(value);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

test("release verification resolves live evidence beside the candidate manifest", async (t) => {
  const decision = { item_count: 1, items: [{ id: "decision.test" }] };
  const decisionContent = JSON.stringify(decision);
  const live = { status: "stale_fixture", generation_id: "generation.test" };
  const checksumEntry = { export_checksum: "present" };
  const manifest = {
    generation_id: "generation.test",
    service_availability: "available",
    release_status: "ready",
    recommendation_enabled: false,
    search_index: checksumEntry,
    source_registry: checksumEntry,
    source_status: checksumEntry,
    provenance_index: checksumEntry,
    provenance_coverage: checksumEntry,
    relationship_index: checksumEntry,
    decision_offers: {
      path: "opentax/decision.json",
      url: "https://production.invalid/decision.json",
      item_count: 1,
      content_checksum: sha256(decisionContent),
      export_checksum: sha256(stable(decision)),
    },
    live_regression_evidence: {
      path: "opentax/live.json",
      url: "https://production.invalid/live.json",
      export_checksum: sha256(stable(live)),
    },
    exports: [],
  };
  manifest.manifest_checksum = sha256(stable(manifest));

  const server = createServer((request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.url === "/manifest.json") response.end(JSON.stringify(manifest));
    else if (request.url === "/decision.json") response.end(decisionContent);
    else if (request.url === "/live.json") response.end(JSON.stringify(live));
    else response.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const { port } = server.address();

  const child = spawn(process.execPath, ["--experimental-strip-types", "scripts/verify-release.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, FINANCE_MANIFEST_URL: `http://127.0.0.1:${port}/manifest.json` },
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolve) => child.on("close", resolve));

  assert.equal(exitCode, 0, stderr);
  const result = JSON.parse(stdout);
  assert.equal(result.live_evidence_checksum_verified, true);
  assert.equal(result.gate.status, "blocked");
});
