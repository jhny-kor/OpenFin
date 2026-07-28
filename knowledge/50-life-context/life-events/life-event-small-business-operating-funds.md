---
{
  "id": "life-event.small-business-operating-funds",
  "title": "소상공인 운영자금·지원금",
  "type": "life-event",
  "description": "사업자금, 운영자금, 소상공인 지원금, 바우처처럼 세금신고와 사업자 지원 제도를 함께 판단해야 하는 생활사건입니다.",
  "folder": "80_LifeLanguage/Events",
  "parents": [
    "category.life-events"
  ],
  "related": [
    "support.small-business-policy-fund",
    "support.small-business-management-stability-voucher",
    "support.small-business-leap",
    "tax.value-added",
    "tax.income.comprehensive",
    "scenario.small-business-policy-fund"
  ],
  "sources": [
    "source.bizinfo.small-business-policy-fund.2026",
    "source.bizinfo.small-business-management-voucher.2026",
    "source.bizinfo.small-business-leap.2026"
  ],
  "tags": [
    "life-language",
    "small-business",
    "support",
    "custom-overlay"
  ],
  "life_phrases": [
    "소상공인 지원금",
    "사업자금",
    "운영자금",
    "가게 지원",
    "자영업자 대출",
    "정책자금",
    "경영안정 바우처",
    "소상공인 바우처"
  ],
  "official_candidates": [
    {
      "target": "support.small-business-policy-fund",
      "confidence": 0.86,
      "confidence_label": "높음",
      "reason": "정책자금·운영자금 표현은 소상공인 정책자금 후보입니다.",
      "required_checks": [
        "소상공인 여부",
        "자금 목적",
        "대출잔액",
        "세금 체납 여부",
        "직접대출·대리대출"
      ]
    },
    {
      "target": "support.small-business-management-stability-voucher",
      "confidence": 0.74,
      "confidence_label": "중간",
      "reason": "공과금·4대보험료 부담 표현은 경영안정 바우처 후보입니다.",
      "required_checks": [
        "2025년 연 매출",
        "영업 중 여부",
        "사용처"
      ]
    },
    {
      "target": "tax.value-added",
      "confidence": 0.5,
      "confidence_label": "낮음",
      "reason": "사업자 지원 판단 전에 부가가치세 과세유형과 신고 상태도 함께 확인해야 합니다.",
      "required_checks": [
        "사업자등록",
        "일반·간이과세",
        "체납 여부"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "현재 정상 영업 중인 소상공인인가요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.small-business-basic",
      "criterion": "지원대상"
    },
    {
      "order": 2,
      "question": "운전자금, 대환, 재도전, 성장기반 중 필요한 자금 목적은 무엇인가요?",
      "answer_type": "choice",
      "target": "support.small-business-policy-fund",
      "criterion": "자금유형"
    },
    {
      "order": 3,
      "question": "국세나 지방세 체납이 있나요?",
      "answer_type": "boolean",
      "target": "eligibility-rule.tax-delinquency-exclusion",
      "criterion": "제외대상"
    },
    {
      "order": 4,
      "question": "2025년 연 매출이 1억400만원 미만인가요?",
      "answer_type": "boolean",
      "target": "support.small-business-management-stability-voucher",
      "criterion": "바우처 매출요건"
    },
    {
      "order": 5,
      "question": "소상공인24 또는 정책자금 사이트에서 신청할 예정인가요?",
      "answer_type": "choice",
      "target": "application-channel.small-business-policy-fund-site",
      "criterion": "신청경로"
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120930",
    "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000117908",
    "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120120"
  ],
  "source_basis_dates": [
    "2026-04-17",
    "2026-01-28",
    "2026-03-30"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.bizinfo.small-business-policy-fund.2026",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.bizinfo.small-business-policy-fund.2026",
      "original_url": "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120930",
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
      "source_id": "source.bizinfo.small-business-management-voucher.2026",
      "original_url": "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120930",
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
      "source_id": "source.bizinfo.small-business-leap.2026",
      "original_url": "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120930",
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
    "id": "life-event.small-business-operating-funds",
    "title": "소상공인 운영자금·지원금",
    "type": "life-event",
    "description": "사업자금, 운영자금, 소상공인 지원금, 바우처처럼 세금신고와 사업자 지원 제도를 함께 판단해야 하는 생활사건입니다.",
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
      "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120930",
      "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000117908",
      "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120120"
    ],
    "source_basis_dates": [
      "2026-04-17",
      "2026-01-28",
      "2026-03-30"
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
    "search_text": "life-event.small-business-operating-funds 소상공인 운영자금·지원금 life-event 사업자금, 운영자금, 소상공인 지원금, 바우처처럼 세금신고와 사업자 지원 제도를 함께 판단해야 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.bizinfo.small-business-policy-fund.2026",
      "source.bizinfo.small-business-management-voucher.2026",
      "source.bizinfo.small-business-leap.2026"
    ]
  },
  "search_shard": "reference",
  "search_position": 417,
  "record_checksum": "sha256:02aba8586dc051c1508312daf13c62d1f6674af02b37630f572c2f361cf5f6ee"
}
---

# 소상공인 운영자금·지원금

사업자금, 운영자금, 소상공인 지원금, 바우처처럼 세금신고와 사업자 지원 제도를 함께 판단해야 하는 생활사건입니다.
