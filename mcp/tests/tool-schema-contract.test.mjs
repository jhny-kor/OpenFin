import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
test("canonical compare/recommend MCP schemas satisfy the compatibility contract", () => {
  const result = JSON.parse(execFileSync(process.execPath, ["scripts/tool-schema-contract.mjs"], { cwd: resolve(root, "mcp"), encoding: "utf8" }));
  assert.equal(result.status, "pass");
  assert.equal(result.tools_list_checked, false);
  assert.match(readFileSync(resolve(root, "schemas/mcp-tools/compare-v2.schema.json"), "utf8"), /"as_of"/);
});
