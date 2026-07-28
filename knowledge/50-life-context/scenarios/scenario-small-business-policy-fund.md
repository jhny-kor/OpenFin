---
{
  "id": "scenario.small-business-policy-fund",
  "title": "소상공인 정책자금·바우처 판단 경로",
  "type": "scenario",
  "description": "자영업자·소상공인이 운영자금, 바우처, 도약 지원사업을 찾을 때 사업자등록, 매출, 체납, 자금 목적을 순서대로 판단하는 경로입니다.",
  "folder": "70_Scenarios",
  "parents": [
    "category.user-scenarios"
  ],
  "related": [
    "life-event.small-business-operating-funds",
    "support.small-business-policy-fund",
    "support.small-business-management-stability-voucher"
  ],
  "sources": [
    "source.bizinfo.small-business-policy-fund.2026",
    "source.bizinfo.small-business-management-voucher.2026",
    "source.bizinfo.small-business-leap.2026"
  ],
  "tags": [
    "scenario",
    "small-business",
    "support",
    "custom-overlay"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "생활사건 분류",
      "target": "life-event.small-business-operating-funds",
      "reason": "사업자금·소상공인 지원금 표현을 정책자금과 바우처 후보로 분류합니다."
    },
    {
      "order": 2,
      "label": "소상공인 여부",
      "target": "eligibility-rule.small-business-basic",
      "reason": "정상 영업 중인 소상공인인지 확인합니다."
    },
    {
      "order": 3,
      "label": "세금 체납",
      "target": "eligibility-rule.tax-delinquency-exclusion",
      "reason": "정책자금 융자 제한 사유가 될 수 있는 체납 여부를 확인합니다."
    },
    {
      "order": 4,
      "label": "정책자금",
      "target": "support.small-business-policy-fund",
      "reason": "운전자금, 대환대출, 재도전, 성장기반 자금 중 맞는 유형을 고릅니다."
    },
    {
      "order": 5,
      "label": "바우처",
      "target": "support.small-business-management-stability-voucher",
      "reason": "연 매출 1억400만원 미만이면 경영안정 바우처 후보를 확인합니다."
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
        "path_steps",
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
        "path_steps",
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
        "path_steps",
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
    "id": "scenario.small-business-policy-fund",
    "title": "소상공인 정책자금·바우처 판단 경로",
    "type": "scenario",
    "description": "자영업자·소상공인이 운영자금, 바우처, 도약 지원사업을 찾을 때 사업자등록, 매출, 체납, 자금 목적을 순서대로 판단하는 경로입니다.",
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
    "search_text": "scenario.small-business-policy-fund 소상공인 정책자금·바우처 판단 경로 scenario 자영업자·소상공인이 운영자금, 바우처, 도약 지원사업을 찾을 때 사업자등록, 매출, 체납, 자금 목",
    "provenance_shard": "reference",
    "source_ids": [
      "source.bizinfo.small-business-policy-fund.2026",
      "source.bizinfo.small-business-management-voucher.2026",
      "source.bizinfo.small-business-leap.2026"
    ]
  },
  "search_shard": "reference",
  "search_position": 472,
  "record_checksum": "sha256:5ab5a70e1a9a2811021d55a7c1013a6ed4fdf62123831ed0658634dca03e329c"
}
---

# 소상공인 정책자금·바우처 판단 경로

자영업자·소상공인이 운영자금, 바우처, 도약 지원사업을 찾을 때 사업자등록, 매출, 체납, 자금 목적을 순서대로 판단하는 경로입니다.
