#!/usr/bin/env node
/** Verify the checked-in MCP input contract and, when supplied, a tools/list snapshot. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { z } from "zod";

const root = fileURLToPath(new URL("../..", import.meta.url));
const files = { compare: "schemas/mcp-tools/compare-v2.schema.json", recommend: "schemas/mcp-tools/recommend-v2.schema.json" };
const snapshotPath = process.env.TOOLS_LIST_FILE;
const mcpUrl = process.env.MCP_URL;
const hashPath = "schemas/mcp-tools/schema-hashes.json";

const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const load = async (path) => readFile(resolve(root, path), "utf8");
const metadataKeys = new Set(["$schema", "$id", "title", "description"]);
const normalize = (value) => Array.isArray(value)
  ? value.map(normalize)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.entries(value).filter(([key]) => !metadataKeys.has(key)).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, normalize(item)]))
    : value;
const serialize = (value) => JSON.stringify(normalize(value));
const runtimeSchema = (schema) => z.toJSONSchema(z.fromJSONSchema(schema), { target: "draft-7" });

const expectedInput = { compare: "compare", recommend: "recommend" };
const validate = (schemas) => {
  if (!schemas.compare || !schemas.recommend) throw new Error("canonical compare/recommend schemas are required");
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.type !== "object" || schema.additionalProperties !== false) throw new Error(`${name} schema must be a closed object`);
  }
  if (!schemas.compare.properties.context || !schemas.compare.properties.as_of) throw new Error("compare must expose top-level as_of and context");
  if (!schemas.recommend.properties.context) throw new Error("recommend must expose canonical context");
};

const canonicalSchemas = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([name, path]) => [name, JSON.parse(await load(path))])));
validate(canonicalSchemas);
const expectedRuntime = Object.fromEntries(Object.entries(canonicalSchemas).map(([name, schema]) => [name, runtimeSchema(schema)]));
const hashes = Object.fromEntries(Object.entries(files).map(([name, path]) => [name, { path, hash: sha256(serialize(expectedRuntime[name])) }]));
const expectedHashes = JSON.parse(await load(hashPath));
for (const name of Object.keys(files)) if (expectedHashes[name] !== hashes[name].hash) throw new Error(`${name} canonical schema hash is stale`);

let snapshot = null;
if (snapshotPath) snapshot = JSON.parse(await readFile(resolve(process.cwd(), snapshotPath), "utf8"));
if (mcpUrl) {
  const endpoint = mcpUrl.endsWith("/mcp") ? mcpUrl : `${mcpUrl.replace(/\/$/, "")}/mcp`;
  const response = await fetch(endpoint, { method: "POST", headers: { accept: "application/json, text/event-stream", "content-type": "application/json", "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: "schema-contract", method: "tools/list", params: {} }) });
  if (!response.ok) throw new Error(`tools/list failed: ${response.status}`);
  const body = await response.text();
  try { snapshot = JSON.parse(body); }
  catch { snapshot = JSON.parse(body.split(/\r?\n/).find((line) => line.startsWith("data:"))?.slice(5).trim() ?? "null"); }
}

if (snapshot) {
  const tools = Array.isArray(snapshot) ? snapshot : snapshot.tools ?? snapshot.result?.tools;
  if (!Array.isArray(tools)) throw new Error("tools/list snapshot must contain a tools array");
  for (const [name, toolName] of Object.entries(expectedInput)) {
    const tool = tools.find((candidate) => candidate.name === toolName);
    if (!tool?.inputSchema) throw new Error(`tools/list is missing ${toolName}`);
    if (serialize(tool.inputSchema) !== serialize(expectedRuntime[name])) throw new Error(`${toolName} tools/list input schema differs from canonical schema`);
  }
}

console.log(JSON.stringify({ status: "pass", schemas: hashes, tools_list_checked: Boolean(snapshot) }, null, 2));
