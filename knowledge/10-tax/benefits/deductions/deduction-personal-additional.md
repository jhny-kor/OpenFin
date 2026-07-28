---
{
  "id": "deduction.personal.additional",
  "title": "추가공제",
  "type": "deduction",
  "description": "경로우대, 장애인, 부녀자, 한부모 등 추가 요건에 따른 인적공제입니다.",
  "folder": "20_Deductions/IncomeDeductions",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "deduction.personal"
  ],
  "children": [],
  "related": [],
  "terms": [
    "term.income-deduction",
    "term.tax-base"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제51조",
  "tags": [
    "income-deduction"
  ],
  "criteria": [
    {
      "label": "경로우대",
      "basis": "기본공제대상자",
      "condition": "70세 이상",
      "deduction_krw": 1000000,
      "source": "source.nts.year-end-settlement.calculation",
      "age_min": 70,
      "criteria_kind": "deduction",
      "basis_category": "person-status",
      "basis_definition": "세법 또는 지원제도에서 대상자로 인정하는 사람의 관계, 고용상태, 가족상태, 사회적 지위 기준입니다.",
      "basis_lookup": "가족관계증명, 주민등록, 재직·퇴직 자료, 지원기관 자격확인 서류에서 확인합니다.",
      "selection_rule": "대상자 지위가 condition에 맞는지 확인하고 소득·나이·기간 등 부가 요건을 함께 충족해야 합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제50조 및 제51조"
    },
    {
      "label": "장애인",
      "basis": "기본공제대상자",
      "condition": "장애인",
      "deduction_krw": 2000000,
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "person-status",
      "basis_definition": "세법 또는 지원제도에서 대상자로 인정하는 사람의 관계, 고용상태, 가족상태, 사회적 지위 기준입니다.",
      "basis_lookup": "가족관계증명, 주민등록, 재직·퇴직 자료, 지원기관 자격확인 서류에서 확인합니다.",
      "selection_rule": "대상자 지위가 condition에 맞는지 확인하고 소득·나이·기간 등 부가 요건을 함께 충족해야 합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제50조 및 제51조"
    },
    {
      "label": "부녀자",
      "basis": "종합소득금액",
      "condition": "3,000만원 이하 등 요건 충족",
      "threshold_krw_max": 30000000,
      "deduction_krw": 500000,
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "income",
      "basis_definition": "지원금·공제·금융상품의 신청자 또는 가구 소득요건을 판단하기 위해 합산하는 소득 기준입니다.",
      "basis_lookup": "국세청 소득자료, 원천징수영수증, 종합소득세 신고서, 지원기관 신청서류에서 확인합니다.",
      "selection_rule": "신청자 개인 기준인지 부부합산 또는 가구 기준인지 먼저 구분하고 threshold_krw_max 이하인지 판정합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제50조 및 제51조"
    },
    {
      "label": "한부모",
      "basis": "배우자가 없는 기본공제대상자",
      "condition": "기본공제대상 직계비속 또는 입양자 있음",
      "deduction_krw": 1000000,
      "note": "부녀자공제와 중복 시 한부모공제 적용",
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "person-status",
      "basis_definition": "세법 또는 지원제도에서 대상자로 인정하는 사람의 관계, 고용상태, 가족상태, 사회적 지위 기준입니다.",
      "basis_lookup": "가족관계증명, 주민등록, 재직·퇴직 자료, 지원기관 자격확인 서류에서 확인합니다.",
      "selection_rule": "대상자 지위가 condition에 맞는지 확인하고 소득·나이·기간 등 부가 요건을 함께 충족해야 합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제50조 및 제51조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {
        "criterion_3": {
          "threshold_krw_max": 30000000
        }
      },
      "eligible_persons": [
        "70세 이상",
        "장애인",
        "3,000만원 이하 등 요건 충족",
        "기본공제대상 직계비속 또는 입양자 있음"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제51조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "deduction",
    "credit_or_deduction": "deduction",
    "applicable_year": 2026,
    "law_reference": "소득세법 제51조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.calculation",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.calculation",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
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
    "id": "deduction.personal.additional",
    "title": "추가공제",
    "type": "deduction",
    "description": "경로우대, 장애인, 부녀자, 한부모 등 추가 요건에 따른 인적공제입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
      "https://www.law.go.kr/법령/소득세법"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {},
        "limits": {},
        "thresholds": {
          "criterion_3": {
            "threshold_krw_max": 30000000
          }
        },
        "eligible_persons": [
          "70세 이상",
          "장애인",
          "3,000만원 이하 등 요건 충족",
          "기본공제대상 직계비속 또는 입양자 있음"
        ],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제51조"
        ]
      }
    },
    "search_facets": {
      "tax_type": "deduction",
      "applicable_year": 2026,
      "law_reference": "소득세법 제51조"
    },
    "search_text": "deduction.personal.additional 추가공제 deduction 경로우대, 장애인, 부녀자, 한부모 등 추가 요건에 따른 인적공제입니다. 소득세법 제51조 income-deduction source.",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 150,
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
  "record_checksum": "sha256:01887d48d6f07672b6882c5bff27c0e4a5d4a93bef7168ed2d54a1da41c3afe3"
}
---

# 추가공제

경로우대, 장애인, 부녀자, 한부모 등 추가 요건에 따른 인적공제입니다.
