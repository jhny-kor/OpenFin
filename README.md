# OpenFin

OpenFin은 금융 도메인 지식과 상품 데이터를 같은 출처·관계 계약으로 공개하는 읽기 전용 탐색기와 Cloudflare Remote MCP입니다.

범위 결정은 개인 금융 플랫폼 전체를 하나의 추천기로 만드는 것이 아니라, `tax`, `public-support`, `financial-products`, `financial-reference`, `life-context` bounded context를 각각 출처·신선도·공개등급으로 운영하는 방식입니다. 현재 공개 기능은 조회·탐색·비교 중심이며 추천은 release gate와 최신 120/120 live regression을 통과하기 전까지 fail-closed입니다.

- 사이트: <https://jhny-kor.github.io/OpenFin/>
- MCP: <https://openfin-mcp.y2kthr.workers.dev/mcp>
- 상태 확인: <https://openfin-mcp.y2kthr.workers.dev/health>

## Source of truth

원본 지식은 `knowledge/`에 금융 의미를 기준으로 배치합니다. `10-tax`, `20-public-support`, `30-financial-products`, `40-financial-reference`, `50-life-context`, `90-sources` 같은 도메인 폴더가 분류 체계입니다. `taxonomy/`, `ontology/`, `topology/` 폴더는 만들지 않습니다.

- 사람이 검토하는 규칙·개념·용어·시나리오는 Markdown으로 관리합니다.
- 반복 구조의 상품·지원사업 대량 데이터는 JSONL로 관리합니다.
- 각 항목은 안정적인 `id`, `type`, `relations`, `provenance`를 가집니다.
- 모든 외부 사실은 `source_id`, 원본 `original_url`, 원본 레코드/locator, 수집·검토시각, freshness 상태와 체크섬을 기록합니다.
- `90-sources/`에는 발행기관·공식 URL·접근방식·갱신 SLA·이용조건을 기록합니다. 비밀키와 토큰은 저장하지 않습니다.
- 출처 확인 실패나 체크섬 충돌은 기존 데이터를 삭제하거나 추천으로 승격하지 않고 `stale`, `unreachable`, `conflict`, `reference_only`로 fail-closed 처리합니다.

`schemas/`는 entity/source/provenance/relation 계약을 정의하고, `evidence/source-receipts/YYYY-MM/`에는 원본 콘텐츠 대신 갱신 확인 결과를 누적합니다. 산출물은 결정적 빌드로 `docs/opentax/`에 생성됩니다.

## Local commands

```sh
npm ci
npm run knowledge:validate
npm run knowledge:build
npm run knowledge:schema-validate
npm run knowledge:derive-quality:check
npm run knowledge:track-sources -- --dry-run --report-dir .reports/source-tracking
npm test
```

`knowledge:track-sources`는 기본적으로 읽기 전용입니다. 로컬 상태·영수증을 저장하려면 `npm run knowledge:track-sources:write`를 명시적으로 사용합니다. 사람이 검토하기 전에는 원본 지식이나 추천 설정을 자동 변경하지 않습니다.

## Deployment

`main`에 푸시하면 Pages workflow가 의존성 설치 → 지식 검증 → 결정적 export 빌드 → 회귀 테스트를 통과한 뒤 `docs/`를 GitHub Pages에 배포합니다. 데이터 변경은 Pages 산출물만 갱신합니다.

Pages manifest는 구조화 수, 값 완결 수, 필드 출처 검증 수, runtime 비교 가능 수, 공개 가능 수를 구분합니다. provenance 연결률은 필드 출처 검증률이 아니며, 현재 세대 120/120 live regression과 공개 승인 receipt가 없으면 추천은 활성화되지 않습니다.

매일 실행되는 `Track OpenFin Sources` workflow와 수동 `workflow_dispatch`는 SLA가 도래한 출처를 점검하고 결과를 artifact로 업로드합니다. `changed`, `stale`, `unreachable`, `conflict`, `retired` 상태가 감지되면 상태 영수증과 영향받는 canonical ID·필드 보고서를 `automation/source-tracking` 검토 브랜치에 남깁니다. PR 생성이 repository 정책상 막힌 경우에는 review issue로 같은 branch와 report 경로를 남깁니다. 원본 지식과 추천 자격은 자동 수정하지 않으며, 일시적인 원본 오류가 있어도 마지막 정상 데이터는 보존됩니다.

Cloudflare Worker는 별도 배포 대상이며 데이터만 변경된 경우 재배포하지 않습니다. Worker 코드를 바꿀 때만 다음을 실행합니다.

```sh
cd mcp
npm ci
npm run deploy
npm run smoke
```

Worker는 OpenFin Pages의 manifest와 공개 JSON만 읽습니다. 캐시는 5분 이내 만료되므로 `main` 푸시 후 Pages가 갱신되면 MCP도 최신 manifest를 바라봅니다. 역사적 provenance URL은 출처 추적용으로 보존하며 Worker 런타임의 데이터 원본으로 사용하지 않습니다.

기존 `/OpenFin/opentax/*.json`, `finance-ontology-manifest.json`, MCP `search`·`fetch`·`exports` 인터페이스는 호환성을 위해 유지합니다. 출처 registry, 상태, provenance coverage, 관계 인덱스는 추가 공개 산출물로 제공합니다. 추천 기능은 품질 게이트와 최신 전체 live regression을 통과하기 전까지 비활성 상태입니다.
