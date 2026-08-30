import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { compactSupportProvenance, decodeTargetedExactRows, exactFetchShardId, needsSummaryDetailHydration, selectFetchSections } from "../src/tools/fetch.ts";

const identity = { requested_id: "item.1", id: "item.1" };
const sections = {
  summary: { title: "Item", freshness_status: "current" },
  sources: { source_ids: ["source.1"] },
  provenance: { provenance: [{ source_id: "source.1" }] },
  relations: { neighbors: { related: ["item.2"] } },
  raw: { raw: { internal: true } },
};

test("fetch defaults to summary and sources while expansions require opt-in", () => {
  const compact = selectFetchSections(identity, sections);
  assert.equal(compact.title, "Item");
  assert.deepEqual(compact.source_ids, ["source.1"]);
  assert.equal("provenance" in compact, false);
  assert.equal("neighbors" in compact, false);
  assert.equal("raw" in compact, false);

  const expanded = selectFetchSections(identity, sections, ["provenance", "relations", "raw"]);
  assert.deepEqual(expanded.provenance, [{ source_id: "source.1" }]);
  assert.deepEqual(expanded.neighbors, { related: ["item.2"] });
  assert.deepEqual(expanded.raw, { internal: true });
  assert.equal("title" in expanded, false);
});

test("product summaries stay on the bounded hot shard", () => {
  assert.equal(needsSummaryDetailHydration("card-products-ontology", "card-products"), false);
  assert.equal(needsSummaryDetailHydration("deposit-products-ontology", "bank-products"), false);
  assert.equal(needsSummaryDetailHydration("insurance-products-ontology", "insurance-products"), false);
  assert.equal(needsSummaryDetailHydration("finance-reference-ontology", "reference"), true);
});

test("exact fetch ids route deterministically to one of 512 shards", async () => {
  const itemId = " Finance.Loan.Credit-Loan.0010002.SC001217 ";
  const hashPrefix = crypto.createHash("sha256").update(itemId.trim().toLocaleLowerCase("ko-KR")).digest().readUInt16BE(0);
  assert.equal(await exactFetchShardId(itemId), `exact-${(hashPrefix % 512).toString(16).padStart(3, "0")}`);
});

test("exact fetch selects only the requested identity and its canonical peers", () => {
  const fields = ["id", "title", "type", "canonical_product_id", "resolved_canonical_product_id", "legacy_ids", "search_aliases", "aliases"];
  const rows = [
    ["finance.card.legacy", "Legacy Card", "card-product", "finance.card.canonical", "finance.card.canonical", ["legacy-card-id"], [], []],
    ["finance.card.canonical", "Canonical Card", "card-product", "finance.card.canonical", "finance.card.canonical", [], [], []],
    ["finance.card.other", "Other Card", "card-product", "finance.card.other", "finance.card.other", [], ["other-card"], []],
  ];
  const vocabulary = ["legacy", "canonical", "other"];
  const searchTerms = [[0], [1], [2]];
  assert.deepEqual(decodeTargetedExactRows(fields, vocabulary, searchTerms, rows, " LEGACY-CARD-ID ").map(({ id, search_text }) => ({ id, search_text })), [
    { id: "finance.card.legacy", search_text: "legacy" },
    { id: "finance.card.canonical", search_text: "canonical" },
  ]);
  assert.deepEqual(decodeTargetedExactRows(fields, vocabulary, searchTerms, rows, "other-card").map(({ id }) => id), ["finance.card.other"]);
  assert.deepEqual(decodeTargetedExactRows(fields, vocabulary, searchTerms, rows, "missing-card"), []);
  assert.throws(() => decodeTargetedExactRows(fields, vocabulary, searchTerms, [rows[0], rows[1], ["finance.card.invalid", null, "card-product", "finance.card.invalid", "finance.card.invalid", [], [], []]], "legacy-card-id"), /exact row 2 is not a finance item/);
});

test("support provenance stays explicit without loading the full provenance shard", () => {
  assert.deepEqual(compactSupportProvenance({
    type: "support-program",
    source_ids: ["source.1", "source.2"],
    source_urls: ["https://example.test/one"],
  }), [
    { source_id: "source.1", original_url: "https://example.test/one", supported_fields: [], verification_status: "reference_only" },
    { source_id: "source.2", supported_fields: [], verification_status: "reference_only" },
  ]);
  assert.deepEqual(compactSupportProvenance({ type: "support-program", provenance: [{ source_id: "source.1" }] }), []);
});

test("support provenance resolves each source id from the canonical registry", () => {
  assert.deepEqual(compactSupportProvenance({ type: "support-program", source_ids: ["source.1", "source.2"], source_urls: ["https://unrelated.test/one"] }, {
    records: [
      { id: "source.1", url: "https://official.test/one" },
      { id: "source.2", url: "https://official.test/two" },
    ],
  }), [
    { source_id: "source.1", original_url: "https://unrelated.test/one", supported_fields: [], verification_status: "reference_only" },
    { source_id: "source.2", original_url: "https://official.test/two", supported_fields: [], verification_status: "reference_only" },
  ]);
  assert.deepEqual(compactSupportProvenance({ type: "support-program", source_ids: ["source.3"] }, {
    sources: [{ id: "source.3", urls: { canonical: "https://official.test/three", all: ["https://official.test/three"] } }],
  }), [
    { source_id: "source.3", original_url: "https://official.test/three", supported_fields: [], verification_status: "reference_only" },
  ]);
});
