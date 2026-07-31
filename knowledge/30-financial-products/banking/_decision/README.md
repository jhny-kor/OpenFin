# Strict OfferSnapshot decision layer

`deposit-offers.jsonl` and `saving-offers.jsonl` are generated from the
canonical bank-product records by `scripts/knowledge/build-decision-snapshots.mjs`.
Only options with complete, official, verified, current field assertions are
emitted. The legacy catalog is never mutated or promoted by this generator.

An empty file is an intentional fail-closed result when source status is stale,
unreachable, conflicting, or missing. The current source-status report therefore
blocks public comparison and recommendation until a live source check succeeds.
