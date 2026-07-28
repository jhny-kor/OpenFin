---
{
  "id": "credit.medical-expense",
  "title": "의료비 세액공제",
  "type": "tax-credit",
  "description": "총급여액의 일정 비율 초과 의료비 등에 대한 특별세액공제입니다.",
  "folder": "20_Deductions/TaxCredits",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
    "https://www.law.go.kr/법령/소득세법",
    "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "credit.special-tax"
  ],
  "children": [],
  "related": [
    "required-document.medical-expense-statement",
    "required-document.medical-receipt",
    "required-document.eyeglasses-receipt",
    "eligibility-rule.medical-expense-floor",
    "life-expense.medical-costs",
    "scenario.dual-income-personal-deduction"
  ],
  "terms": [
    "term.tax-credit",
    "term.eligibility-threshold"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.special-credit",
    "source.law.income-tax-act.deductions-credits",
    "source.nts.employee-income-statement"
  ],
  "law_reference": "소득세법 제59조의4",
  "tags": [
    "tax-credit"
  ],
  "criteria": [
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
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_2": 15,
        "criterion_4": 15,
        "criterion_5": 30
      },
      "limits": {
        "criterion_3": 7000000
      },
      "thresholds": {
        "criterion_1": {
          "threshold_rate_percent": 3
        }
      },
      "eligible_persons": [
        "총급여액의 3% 초과분",
        "일반 의료비",
        "연 700만원 한도",
        "한도 없음"
      ],
      "required_documents": [
        "required-document.medical-expense-statement",
        "required-document.medical-receipt",
        "required-document.eyeglasses-receipt"
      ],
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
    "id": "credit.medical-expense",
    "title": "의료비 세액공제",
    "type": "tax-credit",
    "description": "총급여액의 일정 비율 초과 의료비 등에 대한 특별세액공제입니다.",
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
    "search_aliases": [
      "연말정산 의료비 세액공제 한도 대상",
      "의료비 세액공제 한도 대상"
    ],
    "aliases": [
      "연말정산 의료비 세액공제 한도 대상",
      "의료비 세액공제 한도 대상"
    ],
    "export_id": "tax-ontology",
    "source_checksum": null,
    "source_urls": [
      "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
      "https://www.law.go.kr/법령/소득세법",
      "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {
          "criterion_2": 15,
          "criterion_4": 15,
          "criterion_5": 30
        },
        "limits": {
          "criterion_3": 7000000
        },
        "thresholds": {
          "criterion_1": {
            "threshold_rate_percent": 3
          }
        },
        "eligible_persons": [
          "총급여액의 3% 초과분",
          "일반 의료비",
          "연 700만원 한도",
          "한도 없음"
        ],
        "required_documents": [
          "required-document.medical-expense-statement",
          "required-document.medical-receipt",
          "required-document.eyeglasses-receipt"
        ],
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
    "search_text": "연말정산 의료비 세액공제 한도 대상 의료비 세액공제 한도 대상 credit.medical-expense 의료비 세액공제 tax-credit 총급여액의 일정 비율 초과 의료비 등에 대한 특별세액공제입니다. 소득세법 제",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.special-credit",
      "source.law.income-tax-act.deductions-credits",
      "source.nts.employee-income-statement"
    ]
  },
  "search_shard": "reference",
  "search_position": 115,
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
      "value": "2026-05-04 확인"
    }
  ],
  "record_checksum": "sha256:c7bac6dcdd227330d437c76269f3b5c437cade3ae86f1b16c16c57a21dc3c054",
  "requires": [
    "eligibility-rule.medical-expense-floor",
    "required-document.eyeglasses-receipt",
    "required-document.medical-expense-statement",
    "required-document.medical-receipt"
  ]
}
---

# 의료비 세액공제

총급여액의 일정 비율 초과 의료비 등에 대한 특별세액공제입니다.
