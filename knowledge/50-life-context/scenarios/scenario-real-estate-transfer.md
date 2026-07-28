---
{
  "id": "scenario.real-estate-transfer",
  "title": "부동산 양도 경로",
  "type": "scenario",
  "description": "부동산을 양도한 사용자가 양도차익 계산, 기본공제, 예정·확정신고 기한을 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7713&mi=2371",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7711&mi=2312"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.user-scenarios"
  ],
  "children": [],
  "related": [
    "tax.income.capital-gains",
    "filing.capital-gains-return"
  ],
  "terms": [
    "term.capital-gain",
    "term.tax-base",
    "term.deadline"
  ],
  "deadlines": [
    "deadline.capital-gains.preliminary",
    "deadline.capital-gains.final"
  ],
  "sources": [
    "source.nts.capital-gains.overview",
    "source.nts.capital-gains.deadline",
    "source.nts.capital-gains.rates"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "capital-gains"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "양도차익 계산",
      "target": "concept.capital-gains.calculation-flow",
      "reason": "양도가액, 취득가액, 필요경비와 공제를 거쳐 양도소득 과세표준을 계산합니다."
    },
    {
      "order": 2,
      "label": "양도소득세율 확인",
      "target": "tax.income.capital-gains",
      "reason": "기본세율과 자산 유형별 특례세율을 분리해 산출세액을 확인합니다."
    },
    {
      "order": 3,
      "label": "예정신고",
      "target": "deadline.capital-gains.preliminary",
      "reason": "토지·건물 등은 양도일이 속하는 달의 말일부터 2개월 이내 예정신고 여부를 확인합니다."
    },
    {
      "order": 4,
      "label": "확정신고",
      "target": "deadline.capital-gains.final",
      "reason": "복수 양도 등 확정신고 대상은 다음연도 5월 신고 경로로 연결합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.capital-gains.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.capital-gains.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
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
      "source_id": "source.nts.capital-gains.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
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
      "source_id": "source.nts.capital-gains.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
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
    "id": "scenario.real-estate-transfer",
    "title": "부동산 양도 경로",
    "type": "scenario",
    "description": "부동산을 양도한 사용자가 양도차익 계산, 기본공제, 예정·확정신고 기한을 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7713&mi=2371",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7711&mi=2312"
    ],
    "source_basis_dates": [
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
    "search_text": "scenario.real-estate-transfer 부동산 양도 경로 scenario 부동산을 양도한 사용자가 양도차익 계산, 기본공제, 예정·확정신고 기한을 확인하는 경로입니다. scenario capital-g",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.capital-gains.overview",
      "source.nts.capital-gains.deadline",
      "source.nts.capital-gains.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 469,
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
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-02 확인"
    }
  ],
  "record_checksum": "sha256:d1767a44e0de1e1f57be67c429272c8ae6616f2613af7d2c873d142b683cd1d7"
}
---

# 부동산 양도 경로

부동산을 양도한 사용자가 양도차익 계산, 기본공제, 예정·확정신고 기한을 확인하는 경로입니다.
