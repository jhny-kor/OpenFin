---
{
  "id": "life-expense.donation",
  "title": "기부·후원·고향사랑기부",
  "type": "life-expense",
  "description": "기부, 후원, 고향사랑기부, 정치후원금 같은 표현을 기부금 세액공제 후보로 연결하고 기부금 유형을 구분합니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239040&mi=40978"
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
    "credit.donation",
    "eligibility-rule.donation-type",
    "required-document.donation-receipt",
    "conflict-rule.donation-carryover"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.donation-credit"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "donation"
  ],
  "life_phrases": [
    "기부",
    "후원",
    "고향사랑기부",
    "정치후원금",
    "종교단체 기부",
    "후원금",
    "기부금"
  ],
  "official_candidates": [
    {
      "target": "credit.donation",
      "confidence": 0.89,
      "confidence_label": "높음",
      "reason": "기부·후원 표현은 공식 항목상 기부금 세액공제 후보이며 유형별 공제율과 이월 여부가 갈립니다.",
      "required_checks": [
        "기부금 유형",
        "본인 또는 기본공제대상자 지출 여부",
        "공제한도",
        "이월공제 가능 여부",
        "기부금 영수증"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "기부금이 정치자금, 고향사랑, 특례, 우리사주조합, 일반기부금 중 어디에 해당하나요?",
      "answer_type": "choice",
      "target": "eligibility-rule.donation-type",
      "criterion": "기부금 유형"
    },
    {
      "order": 2,
      "question": "본인이 낸 기부금인가요, 기본공제대상자가 낸 기부금인가요?",
      "answer_type": "choice",
      "target": "credit.donation",
      "criterion": "공제대상자"
    },
    {
      "order": 3,
      "question": "기부금 영수증 또는 기부금명세서를 준비할 수 있나요?",
      "answer_type": "boolean",
      "target": "required-document.donation-receipt",
      "criterion": "필요서류"
    },
    {
      "order": 4,
      "question": "이월기부금이 있거나 정치자금·고향사랑처럼 이월 제한이 있는 유형인가요?",
      "answer_type": "boolean",
      "target": "conflict-rule.donation-carryover",
      "criterion": "이월공제 제한"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.donation-credit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.donation-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239040&mi=40978",
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
    "id": "life-expense.donation",
    "title": "기부·후원·고향사랑기부",
    "type": "life-expense",
    "description": "기부, 후원, 고향사랑기부, 정치후원금 같은 표현을 기부금 세액공제 후보로 연결하고 기부금 유형을 구분합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239040&mi=40978"
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
    "search_text": "life-expense.donation 기부·후원·고향사랑기부 life-expense 기부, 후원, 고향사랑기부, 정치후원금 같은 표현을 기부금 세액공제 후보로 연결하고 기부금 유형을 구분합니다. life-langu",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.donation-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 419,
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
  "record_checksum": "sha256:8a755f455cc65ce0e697dd73726ac4db353bbdb51d63be035997dd23de657995"
}
---

# 기부·후원·고향사랑기부

기부, 후원, 고향사랑기부, 정치후원금 같은 표현을 기부금 세액공제 후보로 연결하고 기부금 유형을 구분합니다.
