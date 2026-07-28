# openfin-mcp

`openfin-mcp` is a Cloudflare Worker Remote MCP adapter for the OpenFin ontology snapshot.

The Worker is bounded to the OpenFin personal-finance contexts (`tax`, `public-support`, `financial-products`, `financial-reference`, and `life-context`). It reads only the OpenFin Pages manifest and verifies artifact checksums before treating data as ready. `/health` is liveness; `/ready` is data readiness and returns HTTP 503 while the release gate is degraded.

It exposes read-only MCP tools for ChatGPT and other remote MCP clients:

- `search`: search tax, deduction, support, local-government support, card, bank, insurance, filing, concept, deadline, and source nodes.
- `fetch`: fetch one ontology item with criteria, product metadata, source URLs, and neighboring node ids.
- `exports`: list ontology exports loaded by the MCP adapter.
- Optional provenance artifacts add source registry/status, field provenance, coverage, and relationship metadata without changing the legacy export contract. Missing artifacts are ignored for backward compatibility.

The Worker reads the canonical manifest from GitHub Pages:

```text
https://jhny-kor.github.io/OpenFin/opentax/finance-ontology-manifest.json
```

The manifest can point to separate ontology JSON files, for example:

```text
https://jhny-kor.github.io/OpenFin/opentax/korea-tax-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-local-government-supports-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-card-products-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-deposit-products-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-saving-products-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-loan-products-ontology-2026.json
https://jhny-kor.github.io/OpenFin/opentax/korea-insurance-products-ontology-2026.json
```

## Local Development

```sh
cd mcp
npm install
npm run dev
```

Local MCP endpoint:

```text
http://localhost:8787/mcp
```

Test with MCP Inspector:

```sh
npx @modelcontextprotocol/inspector@latest
```

## Deploy

Create a Cloudflare API token with at least:

- Account: Workers Scripts: Edit
- Account: Account Settings: Read
- User: User Details: Read
- User: Memberships: Read

Store the token locally in `.env`:

```sh
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

```sh
cd mcp
npm run deploy
```

`npm run verify:release`는 manifest와 release gate를 검사합니다. 추천이 manifest에서 활성화된 경우 gate 실패로 배포를 중단하고, 현재처럼 fail-closed degraded 상태인 경우에는 조회 표면을 배포할 수 있습니다.

The deployed MCP endpoint will be:

```text
https://openfin-mcp.<cloudflare-account>.workers.dev/mcp
```

## ChatGPT Connector

Register the deployed `/mcp` URL as a custom MCP connector in ChatGPT.

Recommended first deployment is public and read-only. If write tools are added
later, add OAuth or Cloudflare Access before exposing them.

## Finance Product Imports

Finance products are split from the tax ontology because product values change
frequently. Use the official importer when a FinLife API key is available:

```sh
FINLIFE_API_KEY=... python3 ontology/scripts/import_finance_products.py
python3 ontology/scripts/verify_openfin_release.py --build
```

The generated product nodes must keep provider, product code, sale status,
collected date, source URLs, and source basis dates so stale or ended products
can be checked later.
