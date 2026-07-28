---
{
  "id": "life-expense.education-costs",
  "title": "학원비·등록금·어린이집비",
  "type": "life-expense",
  "description": "학원비, 등록금, 어린이집비처럼 교육 관련 지출을 교육비 세액공제 후보로 연결하고 대상자 유형을 먼저 묻습니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612"
  ],
  "source_basis_dates": [
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.life-expenses"
  ],
  "children": [],
  "related": [
    "credit.education-expense",
    "eligibility-rule.education-dependent-type",
    "required-document.education-payment-certificate"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.education-expense-credit"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "education"
  ],
  "life_phrases": [
    "학원비",
    "등록금",
    "어린이집비",
    "유치원비",
    "대학등록금",
    "교복비",
    "교육비"
  ],
  "official_candidates": [
    {
      "target": "credit.education-expense",
      "confidence": 0.84,
      "confidence_label": "높음",
      "reason": "교육기관·대학·취학전 아동 교육비 표현은 교육비 세액공제 후보입니다.",
      "required_checks": [
        "대상자 유형",
        "대학원생 제외 여부",
        "1명당 한도",
        "교육비 납입증명서"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "교육비 대상자가 본인, 취학전 아동, 초·중·고등학생, 대학생, 장애인 특수교육비 중 어디에 해당하나요?",
      "answer_type": "choice",
      "target": "eligibility-rule.education-dependent-type",
      "criterion": "대상자 유형"
    },
    {
      "order": 2,
      "question": "부양가족 교육비라면 기본공제대상자 요건을 충족하나요?",
      "answer_type": "boolean",
      "target": "deduction.personal.basic",
      "criterion": "부양가족 요건"
    },
    {
      "order": 3,
      "question": "교육비 납입증명서를 준비할 수 있나요?",
      "answer_type": "boolean",
      "target": "required-document.education-payment-certificate",
      "criterion": "필요서류"
    },
    {
      "order": 4,
      "question": "대학원생 일반교육비처럼 제외되는 항목은 아닌가요?",
      "answer_type": "boolean",
      "target": "conflict-rule.education-nongrad",
      "criterion": "제외 항목"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.education-expense-credit",
  "source_registry_status": "registered",
  "provenance": [
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
    "id": "life-expense.education-costs",
    "title": "학원비·등록금·어린이집비",
    "type": "life-expense",
    "description": "학원비, 등록금, 어린이집비처럼 교육 관련 지출을 교육비 세액공제 후보로 연결하고 대상자 유형을 먼저 묻습니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612"
    ],
    "source_basis_dates": [
      "2026-05-03T00:00:00.000Z"
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
    "search_text": "life-expense.education-costs 학원비·등록금·어린이집비 life-expense 학원비, 등록금, 어린이집비처럼 교육 관련 지출을 교육비 세액공제 후보로 연결하고 대상자 유형을 먼저 묻습니다. l",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.education-expense-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 420,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-03 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-03 확인"
    }
  ],
  "record_checksum": "sha256:7415f5297e374ad661cc8d05778d550ac392814f66def0c0eb9b2158904d27ab"
}
---

# 학원비·등록금·어린이집비

학원비, 등록금, 어린이집비처럼 교육 관련 지출을 교육비 세액공제 후보로 연결하고 대상자 유형을 먼저 묻습니다.
