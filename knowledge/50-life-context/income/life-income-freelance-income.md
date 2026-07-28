---
{
  "id": "life-income.freelance-income",
  "title": "프리랜서·3.3%",
  "type": "life-income",
  "description": "프리랜서, 3.3%, 강사료, 원고료처럼 원천징수 대상 사업소득 또는 기타소득으로 들어오는 생활어를 종합소득세 신고 후보로 연결합니다.",
  "folder": "80_LifeLanguage/Incomes",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
    "https://www.hometax.go.kr"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.life-incomes"
  ],
  "children": [],
  "related": [
    "filing.business-income-withholding",
    "tax.income.comprehensive",
    "application-channel.hometax-income-tax",
    "scenario.freelancer.income-tax",
    "filing.payment-statement-submission",
    "scenario.payment-statement-submission"
  ],
  "terms": [],
  "deadlines": [
    "deadline.income-tax.2025-return",
    "deadline.withholding.monthly"
  ],
  "sources": [
    "source.nts.business-income.withholding",
    "source.nts.income-tax.deadline",
    "source.hometax.main"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "income",
    "freelance"
  ],
  "life_phrases": [
    "프리랜서",
    "3.3%",
    "강사료",
    "원고료",
    "외주",
    "용역비",
    "사업소득"
  ],
  "official_candidates": [
    {
      "target": "filing.business-income-withholding",
      "confidence": 0.78,
      "confidence_label": "중간",
      "reason": "3.3% 원천징수 표현은 사업소득 원천징수 흐름일 가능성이 큽니다.",
      "required_checks": [
        "지급자가 원천징수했는지",
        "사업소득인지 기타소득인지",
        "지급명세서 제출 여부"
      ]
    },
    {
      "target": "tax.income.comprehensive",
      "confidence": 0.82,
      "confidence_label": "높음",
      "reason": "프리랜서 소득은 다음연도 종합소득세 확정신고에서 합산 여부를 확인해야 합니다.",
      "required_checks": [
        "수입금액",
        "필요경비",
        "원천징수세액",
        "다른 소득 합산 여부"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "지급받을 때 3.3% 원천징수가 되었나요?",
      "answer_type": "boolean",
      "target": "filing.business-income-withholding",
      "criterion": "원천징수 여부"
    },
    {
      "order": 2,
      "question": "소득 유형이 사업소득인가요, 기타소득인가요?",
      "answer_type": "choice",
      "target": "tax.income.comprehensive",
      "criterion": "소득 구분"
    },
    {
      "order": 3,
      "question": "다음연도 5월 종합소득세 확정신고 대상인지 확인했나요?",
      "answer_type": "boolean",
      "target": "application-channel.hometax-income-tax",
      "criterion": "신고 경로"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.business-income.withholding",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.business-income.withholding",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
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
      "source_id": "source.nts.income-tax.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
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
    "id": "life-income.freelance-income",
    "title": "프리랜서·3.3%",
    "type": "life-income",
    "description": "프리랜서, 3.3%, 강사료, 원고료처럼 원천징수 대상 사업소득 또는 기타소득으로 들어오는 생활어를 종합소득세 신고 후보로 연결합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
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
    "search_text": "life-income.freelance-income 프리랜서·3.3% life-income 프리랜서, 3.3%, 강사료, 원고료처럼 원천징수 대상 사업소득 또는 기타소득으로 들어오는 생활어를 종합소득세 신고 후보로 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.business-income.withholding",
      "source.nts.income-tax.deadline",
      "source.hometax.main"
    ]
  },
  "search_shard": "reference",
  "search_position": 425,
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
  "record_checksum": "sha256:9420c8de8d1ea82a729a8d67dc186f89d4de196f13369fdcaec24c76fc468ac8",
  "available_in": [
    "application-channel.hometax-income-tax"
  ]
}
---

# 프리랜서·3.3%

프리랜서, 3.3%, 강사료, 원고료처럼 원천징수 대상 사업소득 또는 기타소득으로 들어오는 생활어를 종합소득세 신고 후보로 연결합니다.
