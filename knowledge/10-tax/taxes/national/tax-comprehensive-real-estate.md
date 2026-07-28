---
{
  "id": "tax.comprehensive-real-estate",
  "title": "종합부동산세",
  "type": "tax",
  "description": "일정 기준을 넘는 주택·토지 보유에 대해 과세되는 국세입니다.",
  "folder": "10_Taxes/National",
  "basis_year": 2026,
  "effective_date": "2026-01-01",
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7736&mi=40378",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
    "https://www.realtyprice.kr/"
  ],
  "source_basis_dates": [
    "2026-01-01T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.national-taxes"
  ],
  "children": [
    "concept.cre-tax-base-date",
    "concept.cre-deduction-thresholds"
  ],
  "related": [
    "local.property",
    "support.didimdol-loan",
    "scenario.homeowner.real-estate-tax"
  ],
  "terms": [
    "term.national-tax",
    "term.tax-law",
    "term.publicly-notified-price",
    "term.tax-rate",
    "term.eligibility-threshold"
  ],
  "deadlines": [
    "deadline.comprehensive-real-estate.payment"
  ],
  "sources": [
    "source.national-tax-framework-act.2026.article2",
    "source.nts.comprehensive-real-estate.overview",
    "source.nts.comprehensive-real-estate.rates",
    "source.nts.real-estate-tax.faq",
    "source.molit.realtyprice"
  ],
  "law_reference": "국세기본법 제2조 제1호",
  "tags": [
    "national-tax"
  ],
  "criteria": [
    {
      "label": "주택 공제금액",
      "basis": "공시가격 합계액",
      "condition": "주택",
      "deduction_krw": 900000000,
      "note": "1세대 1주택자는 12억원",
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "1세대 1주택자 주택 공제금액",
      "basis": "공시가격 합계액",
      "condition": "1세대 1주택자",
      "deduction_krw": 1200000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "종합합산토지 공제금액",
      "basis": "공시가격 합계액",
      "condition": "종합합산토지",
      "deduction_krw": 500000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "별도합산토지 공제금액",
      "basis": "공시가격 합계액",
      "condition": "별도합산토지",
      "deduction_krw": 8000000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 3억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 3억원 이하",
      "threshold_krw_max": 300000000,
      "rate_percent": 0.5,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 6억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 6억원 이하",
      "threshold_krw_max": 600000000,
      "rate_percent": 0.7,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 12억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 12억원 이하",
      "threshold_krw_max": 1200000000,
      "rate_percent": 1,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 25억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 25억원 이하",
      "threshold_krw_max": 2500000000,
      "rate_percent": 1.3,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 50억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 50억원 이하",
      "threshold_krw_max": 5000000000,
      "rate_percent": 1.5,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 94억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 94억원 이하",
      "threshold_krw_max": 9400000000,
      "rate_percent": 2,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 2주택 이하 94억원 초과",
      "basis": "종부세 과세표준",
      "condition": "주택 2주택 이하, 94억원 초과",
      "threshold_krw_min": 9400000000,
      "rate_percent": 2.7,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 3주택 이상 25억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 3주택 이상, 25억원 이하",
      "threshold_krw_max": 2500000000,
      "rate_percent": 2,
      "note": "3억원 이하 0.5%, 6억원 이하 0.7%, 12억원 이하 1.0%",
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 3주택 이상 50억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 3주택 이상, 50억원 이하",
      "threshold_krw_max": 5000000000,
      "rate_percent": 3,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 3주택 이상 94억원 이하",
      "basis": "종부세 과세표준",
      "condition": "주택 3주택 이상, 94억원 이하",
      "threshold_krw_max": 9400000000,
      "rate_percent": 4,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "주택 3주택 이상 94억원 초과",
      "basis": "종부세 과세표준",
      "condition": "주택 3주택 이상, 94억원 초과",
      "threshold_krw_min": 9400000000,
      "rate_percent": 5,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "종합합산토지 15억원 이하",
      "basis": "종부세 과세표준",
      "condition": "종합합산토지 15억원 이하",
      "threshold_krw_max": 1500000000,
      "rate_percent": 1,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "종합합산토지 45억원 이하",
      "basis": "종부세 과세표준",
      "condition": "종합합산토지 45억원 이하",
      "threshold_krw_max": 4500000000,
      "rate_percent": 2,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "종합합산토지 45억원 초과",
      "basis": "종부세 과세표준",
      "condition": "종합합산토지 45억원 초과",
      "threshold_krw_min": 4500000000,
      "rate_percent": 3,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "별도합산토지 200억원 이하",
      "basis": "종부세 과세표준",
      "condition": "별도합산토지 200억원 이하",
      "threshold_krw_max": 20000000000,
      "rate_percent": 0.5,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "별도합산토지 400억원 이하",
      "basis": "종부세 과세표준",
      "condition": "별도합산토지 400억원 이하",
      "threshold_krw_max": 40000000000,
      "rate_percent": 0.6,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "별도합산토지 400억원 초과",
      "basis": "종부세 과세표준",
      "condition": "별도합산토지 400억원 초과",
      "threshold_krw_min": 40000000000,
      "rate_percent": 0.7,
      "source": "source.nts.comprehensive-real-estate.rates",
      "criteria_kind": "rate",
      "rate_basis": "종부세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공시가격 합계액에서 과세유형별 공제금액을 차감하고 공정시장가액비율을 곱한 종합부동산세 세율 적용 기준입니다.",
      "basis_lookup": "종합부동산세 과세표준 계산식은 국세청 종합부동산세 안내와 공시가격 자료를 함께 사용해 산정합니다.",
      "selection_rule": "주택 수가 2주택 이하인지 3주택 이상인지, 토지가 종합합산인지 별도합산인지 먼저 구분한 뒤 과세표준 금액이 속하는 세율 구간을 선택합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_5": 0.5,
        "criterion_6": 0.7,
        "criterion_7": 1,
        "criterion_8": 1.3,
        "criterion_9": 1.5,
        "criterion_10": 2,
        "criterion_11": 2.7,
        "criterion_12": 2,
        "criterion_13": 3,
        "criterion_14": 4,
        "criterion_15": 5,
        "criterion_16": 1,
        "criterion_17": 2,
        "criterion_18": 3,
        "criterion_19": 0.5,
        "criterion_20": 0.6,
        "criterion_21": 0.7
      },
      "limits": {},
      "thresholds": {
        "criterion_5": {
          "threshold_krw_max": 300000000
        },
        "criterion_6": {
          "threshold_krw_max": 600000000
        },
        "criterion_7": {
          "threshold_krw_max": 1200000000
        },
        "criterion_8": {
          "threshold_krw_max": 2500000000
        },
        "criterion_9": {
          "threshold_krw_max": 5000000000
        },
        "criterion_10": {
          "threshold_krw_max": 9400000000
        },
        "criterion_11": {
          "threshold_krw_min": 9400000000
        },
        "criterion_12": {
          "threshold_krw_max": 2500000000
        },
        "criterion_13": {
          "threshold_krw_max": 5000000000
        },
        "criterion_14": {
          "threshold_krw_max": 9400000000
        },
        "criterion_15": {
          "threshold_krw_min": 9400000000
        },
        "criterion_16": {
          "threshold_krw_max": 1500000000
        },
        "criterion_17": {
          "threshold_krw_max": 4500000000
        },
        "criterion_18": {
          "threshold_krw_min": 4500000000
        },
        "criterion_19": {
          "threshold_krw_max": 20000000000
        },
        "criterion_20": {
          "threshold_krw_max": 40000000000
        },
        "criterion_21": {
          "threshold_krw_min": 40000000000
        }
      },
      "eligible_persons": [
        "주택",
        "1세대 1주택자",
        "종합합산토지",
        "별도합산토지",
        "주택 2주택 이하, 3억원 이하",
        "주택 2주택 이하, 6억원 이하",
        "주택 2주택 이하, 12억원 이하",
        "주택 2주택 이하, 25억원 이하",
        "주택 2주택 이하, 50억원 이하",
        "주택 2주택 이하, 94억원 이하",
        "주택 2주택 이하, 94억원 초과",
        "주택 3주택 이상, 25억원 이하",
        "주택 3주택 이상, 50억원 이하",
        "주택 3주택 이상, 94억원 이하",
        "주택 3주택 이상, 94억원 초과",
        "종합합산토지 15억원 이하",
        "종합합산토지 45억원 이하",
        "종합합산토지 45억원 초과",
        "별도합산토지 200억원 이하",
        "별도합산토지 400억원 이하",
        "별도합산토지 400억원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [],
      "law_references": [
        "국세기본법 제2조 제1호"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "국세기본법 제2조 제1호"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.national-tax-framework-act.2026.article2",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.national-tax-framework-act.2026.article2",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.comprehensive-real-estate.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.comprehensive-real-estate.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.real-estate-tax.faq",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.molit.realtyprice",
      "original_url": "https://www.realtyprice.kr/",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    }
  ],
  "publication_memberships": [
    "korea-tax-ontology-2026.json"
  ],
  "search_projection": {
    "id": "tax.comprehensive-real-estate",
    "title": "종합부동산세",
    "type": "tax",
    "description": "일정 기준을 넘는 주택·토지 보유에 대해 과세되는 국세입니다.",
    "provider": null,
    "product_kind": null,
    "search_type": null,
    "product_status": null,
    "sales_status": null,
    "source_listing_status": null,
    "sales_verification_status": null,
    "sales_verified_at": null,
    "condition_verification_status": null,
    "source_freshness_status": null,
    "status": null,
    "status_reason": null,
    "recommendation_status": null,
    "recommendation_scope": null,
    "catalog_recommendation_status": null,
    "catalog_recommendation_scope": null,
    "canonical_product_id": null,
    "resolved_canonical_product_id": null,
    "external_product_ids": [],
    "provider_external_ids": [],
    "provider_roles": [],
    "source_records": [],
    "preferred_source": null,
    "merged_fields": {},
    "field_provenance": {},
    "field_conflicts": {},
    "recommendation_model_version": "openfin-recommendation-v0.1.0",
    "recommendation_exclusion_reasons": [],
    "recommendation_basis_fields": [],
    "verification_evidence": null,
    "verification_status": null,
    "quality_flags": [],
    "last_verified_at": null,
    "last_source_checked_at": null,
    "last_reviewed_at": null,
    "public_recommendation_exclusion_reasons": [],
    "comparison_exclusion_reasons": [],
    "discovery_limitations": [],
    "missing_required_fields": [],
    "missing_in_source_fields": [],
    "unmapped_existing_fields": [],
    "unverified_fields": [],
    "discovery_evidence_fields": [],
    "completeness_ratio": null,
    "source_completeness_ratio": null,
    "normalized_completeness_ratio": null,
    "verified_completeness_ratio": null,
    "required_field_count": null,
    "completed_field_count": null,
    "domain_gate_passed": null,
    "comparison_engine_gate_passed": null,
    "comparison_field_verification_status": null,
    "comparison_field_verification": {},
    "comparison_basis_fields": [],
    "comparison_options": [],
    "application_status": null,
    "is_currently_applicable": null,
    "application_open_from": null,
    "application_open_to": null,
    "application_window": {},
    "jurisdiction": null,
    "jurisdiction_code": null,
    "jurisdiction_aliases": [],
    "parent_jurisdiction_code": null,
    "administrative_history": [],
    "target_group": [],
    "support_category": [],
    "last_status_checked_at": null,
    "freshness_status": null,
    "collection_status": null,
    "legacy_ids": [],
    "search_aliases": [],
    "aliases": [],
    "export_id": "tax-ontology",
    "source_checksum": null,
    "source_urls": [
      "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7736&mi=40378",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
      "https://www.realtyprice.kr/"
    ],
    "source_basis_dates": [
      "2026-01-01T00:00:00.000Z",
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "rates": {},
      "limits": {},
      "periods": {},
      "card": {},
      "insurance": {},
      "support": {
        "application_window": {}
      }
    },
    "search_facets": {},
    "search_text": "tax.comprehensive-real-estate 종합부동산세 tax 일정 기준을 넘는 주택·토지 보유에 대해 과세되는 국세입니다. 국세기본법 제2조 제1호 national-tax source.national-t",
    "provenance_shard": "reference",
    "source_ids": [
      "source.national-tax-framework-act.2026.article2",
      "source.nts.comprehensive-real-estate.overview",
      "source.nts.comprehensive-real-estate.rates",
      "source.nts.real-estate-tax.faq",
      "source.molit.realtyprice"
    ]
  },
  "search_shard": "reference",
  "search_position": 621,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-01-01"
    },
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "source_basis_dates",
        2
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-01-01"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "2026-05-04 확인"
    }
  ],
  "record_checksum": "sha256:75794ba7ad3da0fd65c9daf15457894326013cc481b9dadfd052c4406291fd47"
}
---

# 종합부동산세

일정 기준을 넘는 주택·토지 보유에 대해 과세되는 국세입니다.
