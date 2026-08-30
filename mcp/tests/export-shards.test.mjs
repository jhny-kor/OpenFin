import assert from "node:assert/strict";
import test from "node:test";
import { mergeOntologyExportItems, recombineOntologyExportPayloads } from "../src/export-shards.ts";

test("full export shards recombine in order and keep the first duplicate", () => {
  const items = mergeOntologyExportItems([
    { items: [{ id: "item.1", title: "first" }] },
    { reference_items: [{ id: "reference.1", title: "Reference" }], items: [{ id: "item.1", title: "duplicate" }, { id: "item.2", title: "second" }] },
  ]);

  assert.deepEqual(items.map(({ id, title }) => ({ id, title })), [
    { id: "reference.1", title: "Reference" },
    { id: "item.1", title: "first" },
    { id: "item.2", title: "second" },
  ]);
});

test("full export shards preserve checksum arrays and reject malformed items", () => {
  assert.deepEqual(recombineOntologyExportPayloads([
    { items: [{ id: "item.1" }] },
    { reference_items: [{ id: "reference.1" }], items: [{ id: "item.2" }] },
  ]), {
    items: [{ id: "item.1" }, { id: "item.2" }],
    reference_items: [{ id: "reference.1" }],
  });
  assert.throws(() => recombineOntologyExportPayloads([{ items: [{}] }]), /id must be a non-empty string/);
});
