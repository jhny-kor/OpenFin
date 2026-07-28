---
{
  "id": "life-expense.housing-subscription",
  "title": "청약·주택청약·청약통장",
  "type": "life-expense",
  "description": "청약, 주택청약, 청약통장 납입액을 주택마련저축 소득공제 후보로 연결합니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239022&mi=40610"
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
    "deduction.housing-savings",
    "eligibility-rule.housing-savings-employee-household",
    "required-document.housing-savings-payment-certificate",
    "scenario.employee.thirties-year-end-settlement"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.housing-savings-deduction"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "housing"
  ],
  "life_phrases": [
    "청약",
    "주택청약",
    "청약통장",
    "주택청약종합저축",
    "청년우대형 청약"
  ],
  "official_candidates": [
    {
      "target": "deduction.housing-savings",
      "confidence": 0.87,
      "confidence_label": "높음",
      "reason": "청약저축 납입액 표현은 공식 항목상 주택마련저축 소득공제 후보입니다.",
      "required_checks": [
        "총급여 7,000만원 이하 근로자",
        "무주택 세대주 또는 배우자",
        "본인 명의 저축",
        "연 납입액 한도",
        "납입증명서"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "총급여액 7,000만원 이하 근로자인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.housing-savings-employee-household",
      "criterion": "소득·근로자 요건"
    },
    {
      "order": 2,
      "question": "과세연도 중 주택을 소유하지 않은 세대의 세대주 또는 배우자인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.homeless-household",
      "criterion": "무주택 요건"
    },
    {
      "order": 3,
      "question": "본인 명의 주택마련저축에 납입했나요?",
      "answer_type": "boolean",
      "target": "deduction.housing-savings",
      "criterion": "저축 명의"
    },
    {
      "order": 4,
      "question": "납입증명서 또는 통장 사본을 준비할 수 있나요?",
      "answer_type": "boolean",
      "target": "required-document.housing-savings-payment-certificate",
      "criterion": "필요서류"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.housing-savings-deduction",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.housing-savings-deduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239022&mi=40610",
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
    "id": "life-expense.housing-subscription",
    "title": "청약·주택청약·청약통장",
    "type": "life-expense",
    "description": "청약, 주택청약, 청약통장 납입액을 주택마련저축 소득공제 후보로 연결합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239022&mi=40610"
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
    "search_text": "life-expense.housing-subscription 청약·주택청약·청약통장 life-expense 청약, 주택청약, 청약통장 납입액을 주택마련저축 소득공제 후보로 연결합니다. life-language exp",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.housing-savings-deduction"
    ]
  },
  "search_shard": "reference",
  "search_position": 421,
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
  "record_checksum": "sha256:b25a061f87e66c696d0e22b5b47caccd9b4abe1eb1f1d48b704273bef385b1f7"
}
---

# 청약·주택청약·청약통장

청약, 주택청약, 청약통장 납입액을 주택마련저축 소득공제 후보로 연결합니다.
