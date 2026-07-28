---
{
  "id": "scenario.tax-penalty-risk",
  "title": "신고 지연·가산세 리스크 경로",
  "type": "scenario",
  "description": "신고기한을 놓쳤거나 과소신고·미납부가 의심될 때 종합소득세, 부가가치세, 양도소득세 가산세 후보를 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "parents": [
    "category.user-scenarios"
  ],
  "related": [
    "concept.additional-tax.general",
    "filing.income-tax-return",
    "filing.vat-return",
    "filing.capital-gains-return"
  ],
  "sources": [
    "source.nts.income-tax.additional-tax",
    "source.nts.vat.additional-tax",
    "source.nts.capital-gains.additional-tax"
  ],
  "tags": [
    "scenario",
    "additional-tax",
    "deadline",
    "custom-overlay"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "세목 구분",
      "target": "concept.additional-tax.general",
      "reason": "종합소득세, 부가가치세, 양도소득세 중 어떤 신고가 지연됐는지 구분합니다."
    },
    {
      "order": 2,
      "label": "신고기한 확인",
      "target": "category.filing-calendar",
      "reason": "원래 법정신고기한과 기한의 특례를 확인합니다."
    },
    {
      "order": 3,
      "label": "무신고·과소신고",
      "target": "concept.additional-tax.general",
      "reason": "무신고 20%, 과소신고 10% 등 세목별 가산세율을 확인합니다."
    },
    {
      "order": 4,
      "label": "납부지연",
      "target": "concept.additional-tax.general",
      "reason": "미납세액과 경과일수 기준의 납부지연 가산세를 확인합니다."
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7668&mi=2228",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7697&mi=2405",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7712&mi=2313"
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
  "source_registry_id": "source.nts.income-tax.additional-tax",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.income-tax.additional-tax",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7668&mi=2228",
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
      "source_id": "source.nts.vat.additional-tax",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7668&mi=2228",
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
      "source_id": "source.nts.capital-gains.additional-tax",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7668&mi=2228",
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
    "id": "scenario.tax-penalty-risk",
    "title": "신고 지연·가산세 리스크 경로",
    "type": "scenario",
    "description": "신고기한을 놓쳤거나 과소신고·미납부가 의심될 때 종합소득세, 부가가치세, 양도소득세 가산세 후보를 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7668&mi=2228",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7697&mi=2405",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7712&mi=2313"
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
    "search_text": "scenario.tax-penalty-risk 신고 지연·가산세 리스크 경로 scenario 신고기한을 놓쳤거나 과소신고·미납부가 의심될 때 종합소득세, 부가가치세, 양도소득세 가산세 후보를 확인하는 경로입니다. s",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.income-tax.additional-tax",
      "source.nts.vat.additional-tax",
      "source.nts.capital-gains.additional-tax"
    ]
  },
  "search_shard": "reference",
  "search_position": 474,
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
  "record_checksum": "sha256:5086dfb6b6031058283b9f4170e5d42b6cd4053f933b67a03fa930e313f7d963"
}
---

# 신고 지연·가산세 리스크 경로

신고기한을 놓쳤거나 과소신고·미납부가 의심될 때 종합소득세, 부가가치세, 양도소득세 가산세 후보를 확인하는 경로입니다.
