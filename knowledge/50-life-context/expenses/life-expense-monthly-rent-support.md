---
{
  "id": "life-expense.monthly-rent-support",
  "title": "월세지원·주거비 부담",
  "type": "life-expense",
  "description": "월세지원, 주거비, 청년월세, 월세 보조처럼 세액공제뿐 아니라 현금성 주거지원 후보까지 함께 판단해야 하는 생활어입니다.",
  "folder": "80_LifeLanguage/Expenses",
  "parents": [
    "category.life-expenses"
  ],
  "related": [
    "support.youth-monthly-rent-special",
    "support.housing-benefit",
    "credit.monthly-rent",
    "conflict-rule.youth-rent-cash-support-duplicate",
    "eligibility-rule.youth-rent-income-asset",
    "scenario.youth-monthly-rent-support"
  ],
  "sources": [
    "source.korea.youth-monthly-rent.2026",
    "source.myhome.youth-monthly-rent.2026",
    "source.nts.monthly-rent-credit"
  ],
  "tags": [
    "life-language",
    "housing",
    "support",
    "custom-overlay"
  ],
  "life_phrases": [
    "월세지원",
    "월세 지원금",
    "청년월세",
    "월세 보조",
    "주거비 지원",
    "월세 부담",
    "자취 월세 지원"
  ],
  "official_candidates": [
    {
      "target": "support.youth-monthly-rent-special",
      "confidence": 0.88,
      "confidence_label": "높음",
      "reason": "청년월세·월세지원금 표현은 청년월세 지원사업 후보일 가능성이 큽니다.",
      "required_checks": [
        "만 19~34세",
        "부모와 별도 거주",
        "무주택",
        "청년가구·원가구 소득",
        "재산 기준",
        "중복 월세지원 여부"
      ]
    },
    {
      "target": "support.housing-benefit",
      "confidence": 0.68,
      "confidence_label": "중간",
      "reason": "저소득 주거비 부담 표현은 주거급여 후보도 함께 확인해야 합니다.",
      "required_checks": [
        "가구원 수",
        "소득인정액",
        "임차가구 또는 자가가구",
        "기준임대료"
      ]
    },
    {
      "target": "credit.monthly-rent",
      "confidence": 0.62,
      "confidence_label": "중간",
      "reason": "근로자가 월세를 냈다는 표현은 월세액 세액공제 후보와도 연결됩니다.",
      "required_checks": [
        "근로자 여부",
        "총급여",
        "무주택",
        "전입신고",
        "계약서·이체내역"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "만 19세 이상 34세 이하 청년인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.youth-rent-income-asset",
      "criterion": "연령"
    },
    {
      "order": 2,
      "question": "부모와 별도로 거주하는 무주택 청년인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.homeless-household",
      "criterion": "거주·무주택"
    },
    {
      "order": 3,
      "question": "청년가구와 원가구의 소득·재산 기준을 확인했나요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.youth-rent-income-asset",
      "criterion": "소득·재산"
    },
    {
      "order": 4,
      "question": "국토부나 지자체 현금성 월세지원을 이미 받고 있나요?",
      "answer_type": "boolean",
      "target": "conflict-rule.youth-rent-cash-support-duplicate",
      "criterion": "중복지원"
    },
    {
      "order": 5,
      "question": "월세액 세액공제도 함께 판단해야 하는 근로자인가요?",
      "answer_type": "boolean",
      "target": "credit.monthly-rent",
      "criterion": "세액공제 후보"
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
    "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
  ],
  "source_basis_dates": [
    "2026-03-19",
    "2026-05-04T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.korea.youth-monthly-rent.2026",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.korea.youth-monthly-rent.2026",
      "original_url": "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
      "source_id": "source.myhome.youth-monthly-rent.2026",
      "original_url": "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
      "source_id": "source.nts.monthly-rent-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
    "id": "life-expense.monthly-rent-support",
    "title": "월세지원·주거비 부담",
    "type": "life-expense",
    "description": "월세지원, 주거비, 청년월세, 월세 보조처럼 세액공제뿐 아니라 현금성 주거지원 후보까지 함께 판단해야 하는 생활어입니다.",
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
      "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
    ],
    "source_basis_dates": [
      "2026-03-19",
      "2026-05-04T00:00:00.000Z",
      "2026-05-02T00:00:00.000Z"
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
    "search_text": "life-expense.monthly-rent-support 월세지원·주거비 부담 life-expense 월세지원, 주거비, 청년월세, 월세 보조처럼 세액공제뿐 아니라 현금성 주거지원 후보까지 함께 판단해야 하는 생",
    "provenance_shard": "reference",
    "source_ids": [
      "source.korea.youth-monthly-rent.2026",
      "source.myhome.youth-monthly-rent.2026",
      "source.nts.monthly-rent-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 424,
  "legacy_compatibility_dates": [
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
      "value": "2026-05-02 확인"
    }
  ],
  "record_checksum": "sha256:835c5b84885453130e558814c9780835de856ec710f87ccc1b8d986e25b16ceb"
}
---

# 월세지원·주거비 부담

월세지원, 주거비, 청년월세, 월세 보조처럼 세액공제뿐 아니라 현금성 주거지원 후보까지 함께 판단해야 하는 생활어입니다.
