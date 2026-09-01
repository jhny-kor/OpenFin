import assert from "node:assert/strict";
import test from "node:test";

import { CacheBudget } from "../src/cache-budget.ts";

const limits = { maxTotalBytes: 12, maxSingleEntryBytes: 8, maxDecodedRows: 10, maxInflightBytes: 6 };

test("byte and decoded-row ceilings evict the least-recently-used entry", () => {
  const budget = new CacheBudget(limits);
  assert.equal(budget.admit("a", 6, 4).accepted, true);
  assert.equal(budget.admit("b", 4, 4).accepted, true);
  assert.equal(budget.touch("a"), true);
  const admission = budget.admit("c", 5, 2);
  assert.deepEqual(admission.evicted, ["b"]);
  assert.deepEqual(budget.snapshot(), { bytes: 11, decodedRows: 6, inflightBytes: 0, entries: 2, evictions: 1 });
});

test("oversized entries are rejected without changing the ledger", () => {
  const budget = new CacheBudget(limits);
  const admission = budget.admit("large", 9, 1);
  assert.equal(admission.accepted, false);
  assert.equal(admission.reason, "single_entry_bytes");
  assert.deepEqual(budget.snapshot(), { bytes: 0, decodedRows: 0, inflightBytes: 0, entries: 0, evictions: 0 });
});

test("in-flight reservations enforce their independent byte ceiling", () => {
  const budget = new CacheBudget(limits);
  assert.equal(budget.reserveInflight("a", 6), true);
  assert.equal(budget.reserveInflight("b", 1), false);
  budget.releaseInflight("a");
  assert.equal(budget.reserveInflight("b", 1), true);
});
