# Live regression evidence

`npm run live-regression -- --validate-fixture` verifies the checked-in 120-case contract.
The CI runner writes a generation-stamped report as an artifact. Only a reviewed report may be promoted to `current.json`; the knowledge build never reads a report from `docs/`.
