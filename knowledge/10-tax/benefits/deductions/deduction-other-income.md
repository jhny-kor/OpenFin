---
{
  "id": "deduction.other-income",
  "title": "그 밖의 소득공제",
  "type": "deduction",
  "description": "과세표준 계산 전 추가로 반영되는 소득공제 항목 묶음입니다.",
  "folder": "20_Deductions/IncomeDeductions",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239022&mi=40610",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.income-deductions"
  ],
  "children": [
    "deduction.personal-pension-savings",
    "deduction.small-business-mutual-aid",
    "deduction.housing-savings",
    "deduction.investment-association",
    "deduction.credit-card-use",
    "deduction.employee-stock-ownership",
    "deduction.employment-maintenance-worker",
    "deduction.long-term-fund",
    "deduction.youth-long-term-fund"
  ],
  "related": [],
  "terms": [
    "term.income-deduction",
    "term.deduction-limit"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.deduction-limit",
    "source.nts.housing-savings-deduction",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문",
  "tags": [],
  "criteria": [
    {
      "label": "소득공제 종합한도",
      "basis": "종합한도 적용 소득공제 합계",
      "condition": "2,500만원 초과액은 과세표준에 합산",
      "limit_krw": 25000000,
      "source": "source.nts.year-end-settlement.deduction-limit",
      "criteria_kind": "limit",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.year-end-settlement.deduction-limit",
      "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문"
    },
    {
      "label": "주택자금·주택마련저축",
      "basis": "주택자금공제와 주택마련저축",
      "condition": "종합한도 적용 대상",
      "benefit": "종합한도 내 소득공제",
      "source": "source.nts.year-end-settlement.deduction-limit",
      "criteria_kind": "eligibility",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.deduction-limit",
      "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문",
      "amount_applicability": "정액 금액 기준 없음"
    },
    {
      "label": "투자·우리사주·장기저축",
      "basis": "중소기업창업투자조합 출자 등, 우리사주조합 출연금, 장기집합투자증권저축",
      "condition": "일부 벤처투자 예외를 제외하고 종합한도 적용 대상",
      "benefit": "종합한도 내 소득공제",
      "source": "source.nts.year-end-settlement.deduction-limit",
      "criteria_kind": "eligibility",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.deduction-limit",
      "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문",
      "amount_applicability": "정액 금액 기준 없음"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {
        "criterion_1": 25000000
      },
      "thresholds": {},
      "eligible_persons": [
        "2,500만원 초과액은 과세표준에 합산",
        "종합한도 적용 대상",
        "일부 벤처투자 예외를 제외하고 종합한도 적용 대상"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문"
      ]
    }
  },
  "search_facets": {
    "tax_type": "deduction",
    "credit_or_deduction": "deduction",
    "applicable_year": 2026,
    "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문"
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
      "source_id": "source.nts.housing-savings-deduction",
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
    }
  ],
  "publication_memberships": [
    "korea-tax-ontology-2026.json"
  ],
  "search_projection": {
    "id": "deduction.other-income",
    "title": "그 밖의 소득공제",
    "type": "deduction",
    "description": "과세표준 계산 전 추가로 반영되는 소득공제 항목 묶음입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239022&mi=40610",
      "https://www.law.go.kr/법령/소득세법"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {},
        "limits": {
          "criterion_1": 25000000
        },
        "thresholds": {},
        "eligible_persons": [
          "2,500만원 초과액은 과세표준에 합산",
          "종합한도 적용 대상",
          "일부 벤처투자 예외를 제외하고 종합한도 적용 대상"
        ],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문"
        ]
      }
    },
    "search_facets": {
      "tax_type": "deduction",
      "applicable_year": 2026,
      "law_reference": "소득세법 제52조 및 조세특례제한법 소득공제 특례 조문"
    },
    "search_text": "deduction.other-income 그 밖의 소득공제 deduction 과세표준 계산 전 추가로 반영되는 소득공제 항목 묶음입니다. 소득세법 제52조 및 조세특례제한법 소득공제 특례 조문 source.nts.y",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.deduction-limit",
      "source.nts.housing-savings-deduction",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 146,
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
  "record_checksum": "sha256:a56ae9ca88a3e7272a760c87b6a0c8a0e3175a4e8d7282e99ff99abf962ba9d9"
}
---

# 그 밖의 소득공제

과세표준 계산 전 추가로 반영되는 소득공제 항목 묶음입니다.
