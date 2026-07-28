---
{
  "id": "life-expense.monthly-rent",
  "title": "월세·방값",
  "type": "life-expense",
  "description": "월세, 방값, 자취방, 원룸비처럼 주거 임차료를 뜻하는 생활어를 월세액 세액공제 후보로 연결합니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
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
    "credit.monthly-rent",
    "eligibility-rule.monthly-rent-address-match",
    "required-document.lease-contract",
    "application-channel.company-year-end-settlement",
    "scenario.employee.thirties-year-end-settlement",
    "scenario.monthly-rent-tenant-credit"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.monthly-rent-credit",
    "source.hometax.main"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "monthly-rent"
  ],
  "life_phrases": [
    "월세",
    "방값",
    "자취방",
    "원룸비",
    "고시원비",
    "오피스텔 월세"
  ],
  "official_candidates": [
    {
      "target": "credit.monthly-rent",
      "confidence": 0.9,
      "confidence_label": "높음",
      "reason": "주거용 임차료 표현은 공식 항목상 월세액 세액공제와 직접 연결됩니다.",
      "required_checks": [
        "무주택 여부",
        "총급여 또는 종합소득금액",
        "전입신고와 주소 일치",
        "주택 규모 또는 기준시가",
        "임대차계약서와 지급 증빙"
      ]
    },
    {
      "target": "deduction.housing-funds",
      "confidence": 0.45,
      "confidence_label": "낮음",
      "reason": "월세가 아니라 전세자금 대출 원리금 상환액을 말한 경우 주택자금공제 후보가 됩니다.",
      "required_checks": [
        "대출 원리금 상환 여부",
        "국민주택규모",
        "무주택 세대주 또는 세대원 여부"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "과세기간 종료일 기준 무주택 세대의 세대주 또는 요건을 충족한 세대원인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.homeless-household",
      "criterion": "무주택 세대"
    },
    {
      "order": 2,
      "question": "총급여가 8,000만원 이하이거나 종합소득금액이 7,000만원 이하인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.gross-pay-income-threshold",
      "criterion": "소득요건"
    },
    {
      "order": 3,
      "question": "임대차계약증서 주소와 주민등록표상 주소가 같고 전입신고가 되어 있나요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.monthly-rent-address-match",
      "criterion": "전입·주소 일치"
    },
    {
      "order": 4,
      "question": "임차 주택이 국민주택규모 또는 기준시가 4억원 이하인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.monthly-rent-house-standard",
      "criterion": "주택요건"
    },
    {
      "order": 5,
      "question": "임대차계약서, 주민등록표등본, 월세 이체내역을 준비할 수 있나요?",
      "answer_type": "boolean",
      "target": "required-document.lease-contract",
      "criterion": "필요서류"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.monthly-rent-credit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.monthly-rent-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
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
    "id": "life-expense.monthly-rent",
    "title": "월세·방값",
    "type": "life-expense",
    "description": "월세, 방값, 자취방, 원룸비처럼 주거 임차료를 뜻하는 생활어를 월세액 세액공제 후보로 연결합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
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
    "search_text": "life-expense.monthly-rent 월세·방값 life-expense 월세, 방값, 자취방, 원룸비처럼 주거 임차료를 뜻하는 생활어를 월세액 세액공제 후보로 연결합니다. life-language expen",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.monthly-rent-credit",
      "source.hometax.main"
    ]
  },
  "search_shard": "reference",
  "search_position": 423,
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
  "record_checksum": "sha256:fc857613cf426fb9e09545ca165a5dcc1034d7bf60292a571c79d7cab8f5e988"
}
---

# 월세·방값

월세, 방값, 자취방, 원룸비처럼 주거 임차료를 뜻하는 생활어를 월세액 세액공제 후보로 연결합니다.
