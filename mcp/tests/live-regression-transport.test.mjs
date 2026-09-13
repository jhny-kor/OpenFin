import assert from "node:assert/strict";
import test from "node:test";
import { readBodyText, transportErrorCount } from "../scripts/live-regression-transport.mjs";

test("transport body reader preserves large successful JSON within its ceiling", async () => {
  const body = JSON.stringify({ value: "x".repeat(100_000) });
  assert.equal(await readBodyText(new Response(body), 1000, 16 * 1024 * 1024), body);
  assert.equal(await readBodyText(new Response(body, {status:503}), 1000, 16 * 1024 * 1024), body);
});

test("transport body reader bounds oversized edge bodies", async () => {
  const body = "x".repeat(20_000);
  const result = await readBodyText(new Response(body), 1000, 16 * 1024);
  assert.match(result, /response body exceeded 16384 bytes/);
  assert.ok(result.startsWith("x"));
});

test("transport body reader reports a stalled response before the deadline", async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode("{")); } });
  const started = Date.now();
  const result = await readBodyText(new Response(stream), 25, 16 * 1024);
  assert.match(result, /response body timeout after 25ms/);
  assert.ok(Date.now() - started < 500);
});

test("a successful retry does not erase transport or body failure", () => {
  assert.equal(transportErrorCount([{http_status:503},{http_status:200},{http_status:200,body_error:true},{http_status:0}]),3);
});
