---
{
  "id": "life-expense.medical-costs",
  "title": "병원비·약값",
  "type": "life-expense",
  "description": "병원비, 약값, 치과비, 안경값처럼 의료비 지출을 뜻하는 생활어를 의료비 세액공제 후보로 연결합니다.",
  "folder": "80_LifeLanguage/Expenses",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
    "https://call.nts.go.kr/call/qna/selectQnaInfo.do?ctgId=CTG11786&mi=1441"
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
    "credit.medical-expense",
    "eligibility-rule.medical-expense-floor",
    "required-document.medical-receipt",
    "required-document.eyeglasses-receipt"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.year-end-settlement.special-credit",
    "source.call.nts.medical-expense-documents"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "expense",
    "medical"
  ],
  "life_phrases": [
    "병원비",
    "약값",
    "치과비",
    "안경값",
    "렌즈값",
    "난임시술비",
    "의료비"
  ],
  "official_candidates": [
    {
      "target": "credit.medical-expense",
      "confidence": 0.88,
      "confidence_label": "높음",
      "reason": "의료기관·약국·시력교정용 안경 등 의료 지출 표현은 의료비 세액공제 후보입니다.",
      "required_checks": [
        "총급여 3% 초과 여부",
        "공제대상자 범위",
        "일반 의료비 한도",
        "난임시술비·본인 등 한도 예외",
        "증빙서류"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "해당 의료비가 총급여액의 3%를 초과하나요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.medical-expense-floor",
      "criterion": "총급여 3% 초과"
    },
    {
      "order": 2,
      "question": "본인, 기본공제대상자, 6세 이하, 65세 이상, 장애인, 난임시술비 중 어느 유형인가요?",
      "answer_type": "choice",
      "target": "credit.medical-expense",
      "criterion": "대상자·비용 유형"
    },
    {
      "order": 3,
      "question": "진료비·약제비 영수증 또는 의료비 지급명세서를 준비할 수 있나요?",
      "answer_type": "boolean",
      "target": "required-document.medical-receipt",
      "criterion": "필요서류"
    },
    {
      "order": 4,
      "question": "안경·콘택트렌즈라면 시력교정용임을 확인한 영수증이 있나요?",
      "answer_type": "boolean",
      "target": "required-document.eyeglasses-receipt",
      "criterion": "안경 증빙"
    }
  ],
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
      "source_id": "source.call.nts.medical-expense-documents",
      "original_url": "https://call.nts.go.kr/call/qna/selectQnaInfo.do?ctgId=CTG11786&mi=1441",
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
    "id": "life-expense.medical-costs",
    "title": "병원비·약값",
    "type": "life-expense",
    "description": "병원비, 약값, 치과비, 안경값처럼 의료비 지출을 뜻하는 생활어를 의료비 세액공제 후보로 연결합니다.",
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
      "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
      "https://call.nts.go.kr/call/qna/selectQnaInfo.do?ctgId=CTG11786&mi=1441"
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
    "search_text": "life-expense.medical-costs 병원비·약값 life-expense 병원비, 약값, 치과비, 안경값처럼 의료비 지출을 뜻하는 생활어를 의료비 세액공제 후보로 연결합니다. life-language ex",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.special-credit",
      "source.call.nts.medical-expense-documents"
    ]
  },
  "search_shard": "reference",
  "search_position": 422,
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
  "record_checksum": "sha256:5880156a6fb47c0c7f74e5c606ad01c5796205ef2ba8230a8b1ea24b145fb248"
}
---

# 병원비·약값

병원비, 약값, 치과비, 안경값처럼 의료비 지출을 뜻하는 생활어를 의료비 세액공제 후보로 연결합니다.
