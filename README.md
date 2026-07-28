# OpenFin

독립 배포되는 OpenFin 금융 온톨로지 탐색기와 읽기 전용 Cloudflare Remote MCP입니다.

- 사이트: `https://jhny-kor.github.io/OpenFin/`
- MCP: `https://openfin-mcp.y2kthr.workers.dev/mcp`
- 상태 확인: `https://openfin-mcp.y2kthr.workers.dev/health`

## Structure

- `docs/`: GitHub Pages 정적 사이트 및 OpenFin 공개 데이터 스냅샷
- `mcp/`: Pages의 같은 데이터 스냅샷을 읽는 Cloudflare Worker Remote MCP
- `.github/workflows/deploy-pages.yml`: `main` 변경 시 GitHub Pages 배포

## Deploy

GitHub Pages는 `main` 푸시로 자동 배포됩니다. Cloudflare MCP는 별도 배포합니다.

```sh
cd mcp
npm ci
npm run deploy
npm run smoke
```

Worker는 `wrangler.toml`에 설정된 OpenFin Pages URL만 읽습니다. 데이터의 과거 provenance URL은 스냅샷 메타데이터로 보존되며, MCP 런타임 fetch에는 사용하지 않습니다.
