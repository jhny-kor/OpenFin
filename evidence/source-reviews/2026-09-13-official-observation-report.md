# 2026-09-13 공식 원천 검토 증빙 — 예금 5건·적금 5건

## 범위와 판정

- 관찰 시각: `2026-09-13T14:56:54.354Z`.
- 목적: 공개 비교에 필요한 시장 사실을 공식 원천과 assertion 단위 영수증으로 대조하는 것.
- 검토자: `Codex automated official-source reviewer` (`automated_official_source_reviewer`). 권한 범위는 `user-authorized:official-source-review:market-comparison`이다. 이는 사람의 투자·금융 적합성 판단이나 공개 추천 승인이 아니다.
- 결과: 예금 5건과 적금 5건의 구조화 필드가 현재 공식 관찰과 정확히 결합되어 검증되었다. 옵션 기준 시장비교 승인은 예금 14건, 적금 19건이며 `recommendation_approved`는 모두 `false`다.

## 검토한 상품

| 구분 | 상품 코드 | 금융회사 / 상품 |
| --- | --- | --- |
| 예금 | `TD11300027000` | 광주은행 / 미즈월복리정기예금 |
| 예금 | `TD11300035000` | 광주은행 / 굿스타트예금 |
| 예금 | `TD11300036000` | 광주은행 / The플러스예금 |
| 예금 | `21001115` | 경남은행 / BNK더조은정기예금 |
| 예금 | `21001280` | 경남은행 / The든든예금(시즌2) |
| 적금 | `TD11330029000` | 광주은행 / 해피라이프_여행스케치적금V |
| 적금 | `TD11330031000` | 광주은행 / VIP플러스적금 |
| 적금 | `21000111` | 경남은행 / 행복 DREAM 적금 |
| 적금 | `21001199` | 경남은행 / BNK 위더스자유적금 |
| 적금 | `21001292` | 경남은행 / 오면우대! 하면우대! 정기적금 |

## 공식 원천과 증빙

- 금융감독원 FinLife 예금 응답: [depositProductsSearch](https://finlife.fss.or.kr/finlifeapi/depositProductsSearch.json), 응답 체크섬 `sha256:186db4f2b35b1cc1a317df086eb7c2b12c138a3057279c6172b5f635c0ed9c8e`.
- 금융감독원 FinLife 적금 응답: [savingProductsSearch](https://finlife.fss.or.kr/finlifeapi/savingProductsSearch.json), 응답 체크섬 `sha256:08d19f83bd19365746467f335b8a579ea2603699ee4c21fa900b92d9b49bfeba`.
- 각 상품의 가입채널, 가입대상, 기간별 기본·최고금리, 저축방식과 한도는 FinLife의 `baseList` 및 `optionList`에서 상품코드와 금융회사 코드로 위치를 고정했다. 상품별 원문·locator·체크섬은 [canonical observations](2026-09-13-canonical-official-source-observations.json)에 있다.
- 각 금융회사 상품 페이지는 상품별 예금자보호법 고지를 제공했고, 10건 모두 “원금과 소정의 이자를 합하여 1인당 1억원까지”라는 보호 범위를 명시했다. 해당 페이지 URL, 보호 고지 locator, 페이지 체크섬도 같은 관찰 파일에 있다.
- assertion별 공식 원천 검토 영수증은 [canonical market reviews](2026-09-13-canonical-market-reviews.jsonl)에 344건, 중첩 규칙 검토 상태를 상위 assertion에 반영한 [reconciliation reviews](2026-09-13-nested-rule-reconciliation-reviews.jsonl)에 19건이 있다. 후자는 같은 공식 원천·URL·locator·검토자 관찰을 사용하며 바뀐 assertion 값 해시와 영수증 체크섬만 새로 결합한다.

## 검증 경계

- KDIC 데이터셋 엔드포인트는 같은 관찰에서 `HTTP 400` / `NO_OPENAPI_SERVICE_ERROR`로 사용할 수 없었다(오류 체크섬 `sha256:b756a98df9390986ef9f8bda49d8b8d0ce48d0f783c2d543ad522efc6c25125d`). 따라서 KDIC 응답을 보호 검증 근거로 사용하지 않았다. 보호 상태는 상품별 은행 공식 고지로만 확인했다.
- FinLife나 은행 페이지에 없는 일수계산, 반올림, 지급시점 등의 값을 추론하여 assertion으로 추가하지 않았다.
- 이 검토는 개인의 자격 충족, 금융 적합성, 계약 체결 가능성, 공개 추천을 보증하지 않는다. 공개 추천은 별도 승인 절차가 필요하며 현재 비활성 상태다.
