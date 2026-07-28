# OpenFin Knowledge and Provenance Platform

## Value Proposition

OpenFin is the canonical, public source for Korean tax, public-support, and financial-product knowledge. It replaces the copied TaxMeter OpenFin surface with a domain-oriented, reviewable knowledge repository that preserves every public Pages and MCP compatibility contract.

## Scope decision and bounded contexts

OpenFin is a personal-finance platform knowledge layer, not an unconstrained financial adviser. Its bounded contexts are `tax`, `public-support`, `financial-products`, `financial-reference`, and `life-context`. Each context has independent source freshness and release readiness; a context that is not ready remains searchable as reference data and cannot silently enter comparison or recommendation output. The `/opentax` paths are compatibility adapters for the existing public export contract, not a separate source of truth.

Target users are people and AI assistants that need source-backed Korean financial information. The core problem is that the current flat generated JSON is difficult to maintain, duplicate source nodes are hard to refresh consistently, and most collected records lack normalized field-level provenance and change receipts.

**Core actions**:

1. Search and fetch financial knowledge with original source evidence.
2. Inspect source freshness, provenance, and release quality.
3. Refresh source-backed datasets without widening recommendation eligibility.

## Why an LLM and MCP

**Conversational win**: Users can ask natural Korean questions about taxes, public support, and products without knowing dataset names or identifiers.

**LLM adds**: Intent classification, cross-domain discovery, and plain-language explanation of structured evidence.

**What the LLM lacks**: Current official-source records, deterministic comparison rules, source freshness, and safe recommendation eligibility. The MCP supplies these as read-only, source-backed data.

## User Experience

**First view**: The GitHub Pages site provides search, browse, source links, freshness, and quality status.

**Search and fetch**: Existing MCP `search`, `fetch`, and `exports` tools remain compatible. Results add source count, source status, collection/review timestamps, locators, and checksums.

**End state**: The user receives a source-backed result or an explicit fail-closed blocker. No result becomes a public recommendation without current official evidence and a passing release gate.

## UX Flows

Search financial knowledge:

1. Ask a Korean finance, tax, or public-support question.
2. Receive source-backed matches with freshness and verification metadata.
3. Fetch one exact item when more evidence is needed.

Inspect one knowledge item:

1. Provide an item ID, finance URI, OpenTax URI, or Pages hash URL.
2. Receive the canonical item, graph neighbors, original sources, provenance locators, timestamps, and source status.

Inspect publication quality:

1. Request exports or quality status.
2. Receive manifest version, public artifact URLs/checksums, provenance coverage, source status, and fail-closed release blockers.

These flows remain tool-only. Their inputs are naturally conversational and the structured outputs are concise enough for the assistant and existing Pages site; no new MCP view is required.

## MCP Tools

**Tool: `search`**

- Existing input and output compatibility is preserved.
- Each result adds `source_count`, `last_verified_at`, and `freshness_status`.

**Tool: `fetch`**

- Existing ID and URL input compatibility is preserved.
- Output adds provenance assertions, original URLs, locators, timestamps, checksums, and current source status.

**Tool: `exports`**

- Existing manifest and export list is preserved.
- Output adds source registry, source status, provenance coverage, provenance index, and relationship index artifacts.

**Tool: `get_openfin_quality_status`**

- Continues reporting the release gate.
- Adds provenance coverage and source-health blockers without enabling recommendation.

## Canonical Knowledge Model

- Domain folders under `knowledge/` embody the primary taxonomy. There are no `taxonomy/`, `ontology/`, or `topology/` top-level folders.
- There is exactly one taxonomy. Every `category`/`domain` node declares `canonical_folder` and physically lives there, alongside the records it classifies. `_index.md` is a folder README, never a node.
- Every classification node declares `population_status`. A `planned` class has no instances yet and must state a `population_reason`; a `populated` class must have at least one. Declared-but-empty classes never inflate the published counts silently.
- Relations are typed. `requires`, `conflicts_with`, and `available_in` carry eligibility rules, required documents, conflict rules, and application channels; `related` remains the untyped compatibility superset.
- Every relation target resolves to a canonical node. Baseline record, source, and export counts are floors, not equalities: curation may add rows, never drop them.
- Curated knowledge is authored as Markdown with strict JSON frontmatter.
- Homogeneous high-volume records are canonical JSONL within domain `_records/` folders.
- Stable IDs, explicit properties, typed relations, source nodes, and provenance assertions form the semantic model.
- Each ID has exactly one canonical owner. Other exports reference that owner.
- Every external factual record has at least one valid original HTTP(S) URL and a resolvable source ID.
- Structural category indexes are authored classification nodes and do not require external factual provenance.

## Source and Provenance Contract

- Every unique source is authored once under `knowledge/90-sources/`.
- Source documents define publisher, authority class, domains, canonical/API/documentation URLs, access method, parser, refresh SLA, terms, recommendation eligibility, and lifecycle status.
- Record provenance defines source ID, original URL, source record ID, locator, supported fields, source dates, collection/review dates, checksum, and verification status.
- Secrets are never committed. Credential-bearing URLs use placeholders and runtime secrets.
- Source checks run on a daily schedule but only inspect sources that are due by their individual SLA.
- Failed, stale, changed, or conflicting sources never delete the last known-good record and never promote recommendation eligibility.

## Public Compatibility

- Keep the existing ten `korea-*-ontology-2026.json` exports, search indexes, `finance-ontology-manifest.json`, and `/OpenFin/opentax/*.json` URLs.
- Keep MCP tool names `search`, `fetch`, and `exports`.
- Add source registry, source status, provenance index, provenance coverage, and relationship index public artifacts.
- GitHub Pages publishes validated generated artifacts from `main`.
- The Cloudflare Worker reads the Pages manifest and observes data-only changes after its five-minute cache expires.

## Safety and Quality Gates

- Public recommendation remains disabled and the current degraded release state is preserved.
- Release status, recommendation status, domain readiness, counts, and built-at values are derived from canonical records, source artifacts, search/relationship indexes, and the current live regression report.
- The MCP exposes liveness at `/health` and data/readiness at `/ready`; a degraded readiness response is HTTP 503 and includes manifest, checksum, cache-age, and blocker metadata.
- Recommendation policy is deterministic: eligibility, ranking, and explanation consume explicit constraints, preferences, and decision context. Missing, stale, or unverified fields become unknown and are excluded.
- A missing, stale, conflicting, or non-official assertion remains `reference_only` or `listing_only`.
- Generated artifacts are deterministic and never edited as canonical input.
- Publication requires schema, ID, relation, source URL, provenance, deterministic-build, compatibility, Pages, and MCP regression checks.
- Recommendation cannot be enabled before a current-runtime 120/120 live regression succeeds.

## Deployment Context

- Repository: `jhny-kor/OpenFin`, branch `main`.
- Pages: `https://jhny-kor.github.io/OpenFin/`.
- MCP: `https://openfin-mcp.y2kthr.workers.dev/mcp`.
- The repository is public; raw third-party bodies are not committed unless their terms explicitly allow redistribution.
