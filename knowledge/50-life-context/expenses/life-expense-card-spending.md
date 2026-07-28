---
{
  "id": "life-expense.card-spending",
  "title": "카드값·체크카드·현금영수증",
  "type": "life-expense",
  "description": "카드값, 체크카드, 현금영수증, 대중교통비, 전통시장 사용액을 신용카드 등 사용금액 소득공제 후보로 연결합니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
    "https://www.hometax.go.kr"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.life-expenses"
  ],
  "children": [],
  "related": [
    "deduction.credit-card-use",
    "eligibility-rule.credit-card-floor",
    "application-channel.hometax-simplification",
    "scenario.employee.thirties-year-end-settlement"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.credit-card-deduction",
    "source.hometax.main"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "card"
  ],
  "life_phrases": [
    "카드값",
    "신용카드",
    "체크카드",
    "현금영수증",
    "대중교통비",
    "전통시장",
    "도서공연비"
  ],
  "official_candidates": [
    {
      "target": "deduction.credit-card-use",
      "confidence": 0.86,
      "confidence_label": "높음",
      "reason": "결제수단별 소비 지출은 공식 항목상 신용카드 등 사용금액 소득공제 후보입니다.",
      "required_checks": [
        "총급여 25% 초과 여부",
        "결제수단 구분",
        "전통시장·대중교통 등 추가공제 구분",
        "공제한도"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "신용카드 등 사용금액 합계가 총급여액의 25%를 초과하나요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.credit-card-floor",
      "criterion": "최저사용금액"
    },
    {
      "order": 2,
      "question": "지출이 신용카드, 체크카드, 현금영수증, 전통시장, 대중교통 중 어디에 해당하나요?",
      "answer_type": "choice",
      "target": "deduction.credit-card-use",
      "criterion": "공제율 구분"
    },
    {
      "order": 3,
      "question": "연말정산 간소화 자료에 조회되지 않는 사용액이 있나요?",
      "answer_type": "boolean",
      "target": "application-channel.hometax-simplification",
      "criterion": "자료 확인"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.credit-card-deduction",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.credit-card-deduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
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
    },
    {
      "source_id": "source.hometax.main",
      "original_url": "https://www.hometax.go.kr",
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
    "id": "life-expense.card-spending",
    "title": "카드값·체크카드·현금영수증",
    "type": "life-expense",
    "description": "카드값, 체크카드, 현금영수증, 대중교통비, 전통시장 사용액을 신용카드 등 사용금액 소득공제 후보로 연결합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
      "https://www.hometax.go.kr"
    ],
    "source_basis_dates": [
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
    "search_text": "life-expense.card-spending 카드값·체크카드·현금영수증 life-expense 카드값, 체크카드, 현금영수증, 대중교통비, 전통시장 사용액을 신용카드 등 사용금액 소득공제 후보로 연결합니다. li",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.credit-card-deduction",
      "source.hometax.main"
    ]
  },
  "search_shard": "reference",
  "search_position": 418,
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
  "record_checksum": "sha256:30f177c4dedfa60f3c2a3e97f79f80309d37b6fa23317af5d0422bdc67a49ef6"
}
---

# 카드값·체크카드·현금영수증

카드값, 체크카드, 현금영수증, 대중교통비, 전통시장 사용액을 신용카드 등 사용금액 소득공제 후보로 연결합니다.
