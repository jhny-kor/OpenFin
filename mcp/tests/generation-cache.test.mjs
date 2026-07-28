import assert from "node:assert/strict";
import test from "node:test";

import { generationCacheKey, isCurrentGeneration, SingleFlight } from "../src/generation-cache.ts";

test("manifest generations isolate concurrent artifact requests", async () => {
  const inFlight = new Map();
  const oldKey = generationCacheKey("generation-a", "source_status");
  const newKey = generationCacheKey("generation-b", "source_status");
  let finishOld;
  const oldRequest = new Promise((resolve) => { finishOld = resolve; });
  const newRequest = Promise.resolve("new-status");

  inFlight.set(oldKey, oldRequest);
  assert.equal(inFlight.get(newKey), undefined);
  inFlight.set(newKey, newRequest);
  finishOld("old-status");
  await oldRequest;
  inFlight.delete(oldKey);

  assert.equal(await inFlight.get(newKey), "new-status");
  assert.equal(isCurrentGeneration("generation-a", "generation-b"), false);
  assert.equal(isCurrentGeneration("generation-b", "generation-b"), true);
});

test("manifest refreshes are single-flight and cannot resolve out of order", async () => {
  const singleFlight = new SingleFlight();
  let calls = 0;
  let finish;
  const first = singleFlight.run(() => {
    calls += 1;
    return new Promise((resolve) => { finish = resolve; });
  });
  const concurrent = singleFlight.run(async () => {
    calls += 1;
    return "unexpected";
  });

  assert.equal(first, concurrent);
  assert.equal(calls, 1);
  finish("manifest-a");
  assert.equal(await concurrent, "manifest-a");
  assert.equal(await singleFlight.run(async () => {
    calls += 1;
    return "manifest-b";
  }), "manifest-b");
  assert.equal(calls, 2);
});
