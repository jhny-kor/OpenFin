---
{
  "id": "scenario.payment-statement-submission",
  "title": "지급명세서 제출 경로",
  "type": "scenario",
  "description": "프리랜서·부업·직원 급여를 지급한 사업자가 원천세 신고 후 지급명세서 제출기한을 놓치지 않도록 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "parents": [
    "category.user-scenarios"
  ],
  "related": [
    "filing.payment-statement-submission",
    "filing.withholding-tax",
    "life-income.freelance-income",
    "life-income.side-job-income"
  ],
  "sources": [
    "source.nts.payment-statement.deadlines",
    "source.nts.withholding.deadlines"
  ],
  "tags": [
    "scenario",
    "withholding",
    "deadline",
    "custom-overlay"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "소득 지급 여부",
      "target": "filing.withholding-tax",
      "reason": "근로·사업·기타·일용 소득을 지급했는지 확인합니다."
    },
    {
      "order": 2,
      "label": "원천세 신고",
      "target": "filing.withholding-tax",
      "reason": "다음 달 10일 또는 반기별 납부 기한을 확인합니다."
    },
    {
      "order": 3,
      "label": "지급명세서",
      "target": "filing.payment-statement-submission",
      "reason": "소득 종류별 지급명세서 제출기한을 확인합니다."
    },
    {
      "order": 4,
      "label": "프리랜서 자료",
      "target": "life-income.freelance-income",
      "reason": "3.3% 사업소득 지급자료와 종합소득세 신고자료의 연결을 확인합니다."
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
    "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290"
  ],
  "source_basis_dates": [
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.payment-statement.deadlines",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.payment-statement.deadlines",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
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
      "source_id": "source.nts.withholding.deadlines",
      "original_url": "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
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
    "id": "scenario.payment-statement-submission",
    "title": "지급명세서 제출 경로",
    "type": "scenario",
    "description": "프리랜서·부업·직원 급여를 지급한 사업자가 원천세 신고 후 지급명세서 제출기한을 놓치지 않도록 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
      "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290"
    ],
    "source_basis_dates": [
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
    "search_text": "scenario.payment-statement-submission 지급명세서 제출 경로 scenario 프리랜서·부업·직원 급여를 지급한 사업자가 원천세 신고 후 지급명세서 제출기한을 놓치지 않도록 확인하는 경로입",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.payment-statement.deadlines",
      "source.nts.withholding.deadlines"
    ]
  },
  "search_shard": "reference",
  "search_position": 468,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    }
  ],
  "record_checksum": "sha256:0d7514706cf1d85e8b6c33d80ab5fb3b7b138879372b2159733c4fd6a49c4e35"
}
---

# 지급명세서 제출 경로

프리랜서·부업·직원 급여를 지급한 사업자가 원천세 신고 후 지급명세서 제출기한을 놓치지 않도록 확인하는 경로입니다.
