---
{
  "id": "deduction.housing-funds",
  "title": "주택자금공제",
  "type": "deduction",
  "description": "주택임차차입금 원리금상환액과 장기주택저당차입금 이자상환액 등 주택자금 관련 소득공제입니다.",
  "folder": "20_Deductions/IncomeDeductions",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
    "https://www.law.go.kr/법령/소득세법",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239021&mi=40629",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239020&mi=40630"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "deduction.special-income"
  ],
  "children": [],
  "related": [
    "required-document.lease-contract",
    "required-document.resident-registration-copy",
    "conflict-rule.monthly-rent-household-duplicate"
  ],
  "terms": [
    "term.income-deduction",
    "term.tax-base"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.deduction-limit",
    "source.law.income-tax-act.deductions-credits",
    "source.nts.housing-rent-principal-deduction",
    "source.nts.housing-mortgage-interest-deduction"
  ],
  "law_reference": "소득세법 제52조",
  "tags": [
    "income-deduction"
  ],
  "criteria": [
    {
      "label": "주택임차차입금 원리금",
      "basis": "원리금 상환액",
      "condition": "무주택 세대주 등, 국민주택규모 주택 임차",
      "rate_percent": 40,
      "limit_krw": 4000000,
      "note": "주택마련저축 공제금액과 합산 연 400만원 한도",
      "source": "source.nts.housing-rent-principal-deduction",
      "criteria_kind": "rate",
      "rate_basis": "원리금 상환액",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.housing-rent-principal-deduction",
      "law_reference": "소득세법 제52조",
      "rate_label": "소득공제율"
    },
    {
      "label": "장기주택저당차입금 10년 이상",
      "basis": "이자상환액",
      "condition": "상환기간 10년 이상, 고정금리 또는 비거치식 분할상환",
      "limit_krw": 6000000,
      "source": "source.nts.housing-mortgage-interest-deduction",
      "period_years_min": 10,
      "criteria_kind": "limit",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.housing-mortgage-interest-deduction",
      "law_reference": "소득세법 제52조"
    },
    {
      "label": "장기주택저당차입금 15년 이상",
      "basis": "이자상환액",
      "condition": "상환기간 15년 이상",
      "limit_krw": 8000000,
      "source": "source.nts.housing-mortgage-interest-deduction",
      "period_years_min": 15,
      "criteria_kind": "limit",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.housing-mortgage-interest-deduction",
      "law_reference": "소득세법 제52조"
    },
    {
      "label": "장기주택저당차입금 15년 이상 우대",
      "basis": "이자상환액",
      "condition": "상환기간 15년 이상, 고정금리 또는 비거치식 분할상환",
      "limit_krw": 18000000,
      "source": "source.nts.housing-mortgage-interest-deduction",
      "period_years_min": 15,
      "criteria_kind": "limit",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.housing-mortgage-interest-deduction",
      "law_reference": "소득세법 제52조"
    },
    {
      "label": "장기주택저당차입금 15년 이상 최우대",
      "basis": "이자상환액",
      "condition": "상환기간 15년 이상, 고정금리이고 비거치식 분할상환",
      "limit_krw": 20000000,
      "source": "source.nts.housing-mortgage-interest-deduction",
      "period_years_min": 15,
      "criteria_kind": "limit",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.housing-mortgage-interest-deduction",
      "law_reference": "소득세법 제52조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 40
      },
      "limits": {
        "criterion_1": 4000000,
        "criterion_2": 6000000,
        "criterion_3": 8000000,
        "criterion_4": 18000000,
        "criterion_5": 20000000
      },
      "thresholds": {},
      "eligible_persons": [
        "무주택 세대주 등, 국민주택규모 주택 임차",
        "상환기간 10년 이상, 고정금리 또는 비거치식 분할상환",
        "상환기간 15년 이상",
        "상환기간 15년 이상, 고정금리 또는 비거치식 분할상환",
        "상환기간 15년 이상, 고정금리이고 비거치식 분할상환"
      ],
      "required_documents": [
        "required-document.lease-contract",
        "required-document.resident-registration-copy"
      ],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제52조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "deduction",
    "credit_or_deduction": "deduction",
    "applicable_year": 2026,
    "law_reference": "소득세법 제52조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.deduction-limit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.deduction-limit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
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
      "source_id": "source.nts.housing-rent-principal-deduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
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
      "source_id": "source.nts.housing-mortgage-interest-deduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
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
    "id": "deduction.housing-funds",
    "title": "주택자금공제",
    "type": "deduction",
    "description": "주택임차차입금 원리금상환액과 장기주택저당차입금 이자상환액 등 주택자금 관련 소득공제입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
      "https://www.law.go.kr/법령/소득세법",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239021&mi=40629",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239020&mi=40630"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {
          "criterion_1": 40
        },
        "limits": {
          "criterion_1": 4000000,
          "criterion_2": 6000000,
          "criterion_3": 8000000,
          "criterion_4": 18000000,
          "criterion_5": 20000000
        },
        "thresholds": {},
        "eligible_persons": [
          "무주택 세대주 등, 국민주택규모 주택 임차",
          "상환기간 10년 이상, 고정금리 또는 비거치식 분할상환",
          "상환기간 15년 이상",
          "상환기간 15년 이상, 고정금리 또는 비거치식 분할상환",
          "상환기간 15년 이상, 고정금리이고 비거치식 분할상환"
        ],
        "required_documents": [
          "required-document.lease-contract",
          "required-document.resident-registration-copy"
        ],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제52조"
        ]
      }
    },
    "search_facets": {
      "tax_type": "deduction",
      "applicable_year": 2026,
      "law_reference": "소득세법 제52조"
    },
    "search_text": "deduction.housing-funds 주택자금공제 deduction 주택임차차입금 원리금상환액과 장기주택저당차입금 이자상환액 등 주택자금 관련 소득공제입니다. 소득세법 제52조 income-deduction s",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.deduction-limit",
      "source.law.income-tax-act.deductions-credits",
      "source.nts.housing-rent-principal-deduction",
      "source.nts.housing-mortgage-interest-deduction"
    ]
  },
  "search_shard": "reference",
  "search_position": 142,
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
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
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
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
    }
  ],
  "record_checksum": "sha256:83fe8923cc27d0d0136230875e0f4d30faae4642c3ab06f91205d4e589a7d0af"
}
---

# 주택자금공제

주택임차차입금 원리금상환액과 장기주택저당차입금 이자상환액 등 주택자금 관련 소득공제입니다.
