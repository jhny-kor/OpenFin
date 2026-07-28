---
{
  "id": "credit.special-tax",
  "title": "특별세액공제",
  "type": "tax-credit",
  "description": "근로소득자가 해당 과세기간에 지출한 일정 비용을 산출세액에서 공제하는 항목 묶음입니다.",
  "folder": "20_Deductions/TaxCredits",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239040&mi=40978",
    "https://www.law.go.kr/법령/소득세법",
    "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.tax-credits"
  ],
  "children": [
    "credit.insurance-premium",
    "credit.medical-expense",
    "credit.education-expense",
    "credit.donation"
  ],
  "related": [],
  "terms": [
    "term.tax-credit"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.special-credit",
    "source.nts.education-expense-credit",
    "source.nts.donation-credit",
    "source.law.income-tax-act.deductions-credits",
    "source.nts.employee-income-statement"
  ],
  "law_reference": "소득세법 제59조의4",
  "tags": [],
  "criteria": [
    {
      "label": "보장성보험료",
      "basis": "생명보험·상해보험 등 보장성보험료",
      "condition": "기본공제대상자를 위해 지급",
      "limit_krw": 1000000,
      "rate_percent": 12,
      "source": "source.nts.year-end-settlement.special-credit",
      "criteria_kind": "rate",
      "rate_basis": "생명보험·상해보험 등 보장성보험료",
      "basis_category": "person-status",
      "basis_definition": "세법 또는 지원제도에서 대상자로 인정하는 사람의 관계, 고용상태, 가족상태, 사회적 지위 기준입니다.",
      "basis_lookup": "가족관계증명, 주민등록, 재직·퇴직 자료, 지원기관 자격확인 서류에서 확인합니다.",
      "selection_rule": "대상자 지위가 condition에 맞는지 확인하고 소득·나이·기간 등 부가 요건을 함께 충족해야 합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "장애인전용 보장성보험료",
      "basis": "장애인을 피보험자 또는 수익자로 하는 장애인전용 보장성보험료",
      "condition": "장애인전용 보장성보험",
      "limit_krw": 1000000,
      "rate_percent": 15,
      "source": "source.nts.year-end-settlement.special-credit",
      "criteria_kind": "rate",
      "rate_basis": "장애인을 피보험자 또는 수익자로 하는 장애인전용 보장성보험료",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "의료비 공제 문턱",
      "basis": "총급여와 의료비 지출액",
      "condition": "총급여액의 3% 초과분",
      "criteria_kind": "threshold",
      "threshold_type": "gross_salary_ratio",
      "threshold_rate_percent": 3,
      "threshold_basis": "gross_salary",
      "amount_formula": "max(0, medical_expense - gross_salary * 0.03)",
      "note": "3%는 세액공제율이 아니라 공제대상 의료비를 산정하는 총급여 기준 문턱입니다.",
      "source": "source.nts.year-end-settlement.special-credit",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "소득세법 제59조의4"
    },
    {
      "label": "일반 의료비 세액공제율",
      "basis": "공제대상 의료비",
      "condition": "일반 의료비",
      "criteria_kind": "credit-rate",
      "rate_percent": 15,
      "rate_label": "세액공제율",
      "source": "source.nts.year-end-settlement.special-credit",
      "rate_basis": "공제대상 의료비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4",
      "amount_formula": "공제대상 의료비 × 세액공제율 15%"
    },
    {
      "label": "일반 의료비 한도",
      "basis": "일반 기본공제대상자 의료비",
      "condition": "연 700만원 한도",
      "limit_krw": 7000000,
      "source": "source.nts.year-end-settlement.special-credit",
      "criteria_kind": "limit",
      "basis_category": "person-status",
      "basis_definition": "세법 또는 지원제도에서 대상자로 인정하는 사람의 관계, 고용상태, 가족상태, 사회적 지위 기준입니다.",
      "basis_lookup": "가족관계증명, 주민등록, 재직·퇴직 자료, 지원기관 자격확인 서류에서 확인합니다.",
      "selection_rule": "대상자 지위가 condition에 맞는지 확인하고 소득·나이·기간 등 부가 요건을 함께 충족해야 합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4"
    },
    {
      "label": "본인·6세 이하·65세 이상·장애인 의료비",
      "basis": "해당 의료비",
      "condition": "한도 없음",
      "rate_percent": 15,
      "source": "source.nts.year-end-settlement.special-credit",
      "criteria_kind": "rate",
      "rate_basis": "해당 의료비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "해당 의료비 × 세액공제율 15%"
    },
    {
      "label": "난임시술비",
      "basis": "난임시술비",
      "condition": "한도 없음",
      "rate_percent": 30,
      "source": "source.nts.year-end-settlement.special-credit",
      "criteria_kind": "rate",
      "rate_basis": "난임시술비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.special-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "난임시술비 × 세액공제율 30%"
    },
    {
      "label": "본인 교육비",
      "basis": "근로자 본인 교육비",
      "condition": "한도 없음",
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "근로자 본인 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "근로자 본인 교육비 × 세액공제율 15%"
    },
    {
      "label": "취학전·초중고 교육비",
      "basis": "부양가족 1명당 교육비",
      "condition": "취학전 아동, 초·중·고등학생",
      "limit_krw": 3000000,
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "부양가족 1명당 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "대학생 교육비",
      "basis": "부양가족 1명당 교육비",
      "condition": "대학생",
      "limit_krw": 9000000,
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "부양가족 1명당 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "장애인 특수교육비",
      "basis": "장애인 특수교육비",
      "condition": "직계존속 포함, 소득제한 없음",
      "rate_percent": 15,
      "note": "한도 없음",
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "장애인 특수교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "장애인 특수교육비 × 세액공제율 15%"
    },
    {
      "label": "정치자금 10만원 이하",
      "basis": "정치자금기부금",
      "condition": "10만원 이하",
      "threshold_krw_max": 100000,
      "rate_percent": 90.91,
      "rate_label": "세액공제율",
      "note": "100/110 세액공제",
      "source": "source.nts.donation-credit",
      "criteria_kind": "rate",
      "rate_basis": "정치자금기부금",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.donation-credit",
      "law_reference": "소득세법 제59조의4"
    },
    {
      "label": "정치자금 10만원 초과",
      "basis": "정치자금기부금",
      "condition": "10만원 초과",
      "threshold_krw_min": 100000,
      "rate_percent": 15,
      "source": "source.nts.donation-credit",
      "criteria_kind": "rate",
      "rate_basis": "정치자금기부금",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.donation-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 12,
        "criterion_2": 15,
        "criterion_4": 15,
        "criterion_6": 15,
        "criterion_7": 30,
        "criterion_8": 15,
        "criterion_9": 15,
        "criterion_10": 15,
        "criterion_11": 15,
        "criterion_12": 90.91,
        "criterion_13": 15
      },
      "limits": {
        "criterion_1": 1000000,
        "criterion_2": 1000000,
        "criterion_5": 7000000,
        "criterion_9": 3000000,
        "criterion_10": 9000000
      },
      "thresholds": {
        "criterion_3": {
          "threshold_rate_percent": 3
        },
        "criterion_12": {
          "threshold_krw_max": 100000
        },
        "criterion_13": {
          "threshold_krw_min": 100000
        }
      },
      "eligible_persons": [
        "기본공제대상자를 위해 지급",
        "장애인전용 보장성보험",
        "총급여액의 3% 초과분",
        "일반 의료비",
        "연 700만원 한도",
        "한도 없음",
        "취학전 아동, 초·중·고등학생",
        "대학생",
        "직계존속 포함, 소득제한 없음",
        "10만원 이하",
        "10만원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제59조의4"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax-credit",
    "credit_or_deduction": "tax-credit",
    "applicable_year": 2026,
    "law_reference": "소득세법 제59조의4"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.special-credit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.special-credit",
      "original_url": "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.education-expense-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.donation-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.law.income-tax-act.deductions-credits",
      "original_url": "https://www.law.go.kr/법령/소득세법",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.employee-income-statement",
      "original_url": "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
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
      "valid_from": null,
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
    "id": "credit.special-tax",
    "title": "특별세액공제",
    "type": "tax-credit",
    "description": "근로소득자가 해당 과세기간에 지출한 일정 비용을 산출세액에서 공제하는 항목 묶음입니다.",
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
      "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239040&mi=40978",
      "https://www.law.go.kr/법령/소득세법",
      "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {
          "criterion_1": 12,
          "criterion_2": 15,
          "criterion_4": 15,
          "criterion_6": 15,
          "criterion_7": 30,
          "criterion_8": 15,
          "criterion_9": 15,
          "criterion_10": 15,
          "criterion_11": 15,
          "criterion_12": 90.91,
          "criterion_13": 15
        },
        "limits": {
          "criterion_1": 1000000,
          "criterion_2": 1000000,
          "criterion_5": 7000000,
          "criterion_9": 3000000,
          "criterion_10": 9000000
        },
        "thresholds": {
          "criterion_3": {
            "threshold_rate_percent": 3
          },
          "criterion_12": {
            "threshold_krw_max": 100000
          },
          "criterion_13": {
            "threshold_krw_min": 100000
          }
        },
        "eligible_persons": [
          "기본공제대상자를 위해 지급",
          "장애인전용 보장성보험",
          "총급여액의 3% 초과분",
          "일반 의료비",
          "연 700만원 한도",
          "한도 없음",
          "취학전 아동, 초·중·고등학생",
          "대학생",
          "직계존속 포함, 소득제한 없음",
          "10만원 이하",
          "10만원 초과"
        ],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제59조의4"
        ]
      }
    },
    "search_facets": {
      "tax_type": "tax-credit",
      "applicable_year": 2026,
      "law_reference": "소득세법 제59조의4"
    },
    "search_text": "credit.special-tax 특별세액공제 tax-credit 근로소득자가 해당 과세기간에 지출한 일정 비용을 산출세액에서 공제하는 항목 묶음입니다. 소득세법 제59조의4 source.nts.year-end-se",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.special-credit",
      "source.nts.education-expense-credit",
      "source.nts.donation-credit",
      "source.law.income-tax-act.deductions-credits",
      "source.nts.employee-income-statement"
    ]
  },
  "search_shard": "reference",
  "search_position": 119,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-03 확인"
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
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-03 확인"
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
  "record_checksum": "sha256:0355fd9aac00fcdb9965ce75578e80ce505ad536728c0f45d1b1e2ecce122055"
}
---

# 특별세액공제

근로소득자가 해당 과세기간에 지출한 일정 비용을 산출세액에서 공제하는 항목 묶음입니다.
