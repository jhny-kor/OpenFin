---
{
  "id": "scenario.freelancer.income-tax",
  "title": "프리랜서 종합소득세 경로",
  "type": "scenario",
  "description": "프리랜서가 3.3% 원천징수, 수입금액, 필요경비, 종합소득세 확정신고를 순서대로 확인하는 경로입니다.",
  "folder": "70_Scenarios",
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
    "category.user-scenarios"
  ],
  "children": [],
  "related": [
    "life-income.freelance-income",
    "filing.business-income-withholding",
    "tax.income.comprehensive"
  ],
  "terms": [],
  "deadlines": [
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.business-income.withholding",
    "source.nts.income-tax.deadline",
    "source.hometax.main"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "freelancer",
    "income-tax"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "3.3% 소득 확인",
      "target": "life-income.freelance-income",
      "reason": "프리랜서 표현을 사업소득 원천징수와 종합소득세 후보로 연결합니다."
    },
    {
      "order": 2,
      "label": "원천징수 확인",
      "target": "filing.business-income-withholding",
      "reason": "지급자가 원천징수한 소득세와 지방소득세를 확인합니다."
    },
    {
      "order": 3,
      "label": "종합소득세 계산",
      "target": "tax.income.comprehensive",
      "reason": "사업소득과 다른 소득을 합산해 과세표준과 세율을 확인합니다."
    },
    {
      "order": 4,
      "label": "홈택스 신고",
      "target": "application-channel.hometax-income-tax",
      "reason": "다음연도 5월 확정신고 경로로 연결합니다."
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
        "path_steps",
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
        "path_steps",
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
        "path_steps",
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
    "id": "scenario.freelancer.income-tax",
    "title": "프리랜서 종합소득세 경로",
    "type": "scenario",
    "description": "프리랜서가 3.3% 원천징수, 수입금액, 필요경비, 종합소득세 확정신고를 순서대로 확인하는 경로입니다.",
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
    "search_text": "scenario.freelancer.income-tax 프리랜서 종합소득세 경로 scenario 프리랜서가 3.3% 원천징수, 수입금액, 필요경비, 종합소득세 확정신고를 순서대로 확인하는 경로입니다. scenario",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.business-income.withholding",
      "source.nts.income-tax.deadline",
      "source.hometax.main"
    ]
  },
  "search_shard": "reference",
  "search_position": 462,
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
  "record_checksum": "sha256:f8578436191b7a9925b4c9cf37bcf2f6e7500c080d1cb6c2cde116d34b0bf3fb"
}
---

# 프리랜서 종합소득세 경로

프리랜서가 3.3% 원천징수, 수입금액, 필요경비, 종합소득세 확정신고를 순서대로 확인하는 경로입니다.
