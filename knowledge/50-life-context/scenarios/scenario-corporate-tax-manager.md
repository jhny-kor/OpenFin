---
{
  "id": "scenario.corporate-tax-manager",
  "title": "법인 세무담당자 경로",
  "type": "scenario",
  "description": "법인 세무담당자가 법인세율, 신고기한, 공제·감면 지원제도를 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7975&mi=6549",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561"
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
    "tax.corporate",
    "category.corporate-tax-supports"
  ],
  "terms": [
    "term.tax-rate",
    "term.tax-credit",
    "term.tax-reduction",
    "term.deadline"
  ],
  "deadlines": [
    "deadline.corporate-tax.return"
  ],
  "sources": [
    "source.nts.corporate-tax.rates",
    "source.nts.corporate-tax.filing-procedure",
    "source.nts.corporate-tax.reliefs"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "corporate-tax"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "법인세율 구간",
      "target": "tax.corporate",
      "reason": "각 사업연도 소득 과세표준 구간별 세율과 누진공제액을 확인합니다."
    },
    {
      "order": 2,
      "label": "신고기한",
      "target": "deadline.corporate-tax.return",
      "reason": "사업연도 종료일이 속하는 달의 말일부터 3개월 이내 신고·납부 반복 규칙을 확인합니다."
    },
    {
      "order": 3,
      "label": "공제·감면 목록",
      "target": "category.corporate-tax-supports",
      "reason": "중소기업, R&D, 고용, 투자, 지역 이전 등 법인세 지원제도를 검토합니다."
    },
    {
      "order": 4,
      "label": "세액공제 한도·산식",
      "target": "credit.foreign-tax-paid",
      "reason": "외국납부세액공제처럼 산식 기반 한도는 criteria의 금액·적용 산식으로 확인합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.corporate-tax.rates",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.corporate-tax.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
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
      "source_id": "source.nts.corporate-tax.filing-procedure",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
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
      "source_id": "source.nts.corporate-tax.reliefs",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
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
    "id": "scenario.corporate-tax-manager",
    "title": "법인 세무담당자 경로",
    "type": "scenario",
    "description": "법인 세무담당자가 법인세율, 신고기한, 공제·감면 지원제도를 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7975&mi=6549",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561"
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
    "search_text": "scenario.corporate-tax-manager 법인 세무담당자 경로 scenario 법인 세무담당자가 법인세율, 신고기한, 공제·감면 지원제도를 확인하는 경로입니다. scenario corporate-tax",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.corporate-tax.rates",
      "source.nts.corporate-tax.filing-procedure",
      "source.nts.corporate-tax.reliefs"
    ]
  },
  "search_shard": "reference",
  "search_position": 456,
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
  "record_checksum": "sha256:753a3389adb539fc7db0064a64f3fb7d70e58c16d2f73a7b768e9cf0cc87ff80"
}
---

# 법인 세무담당자 경로

법인 세무담당자가 법인세율, 신고기한, 공제·감면 지원제도를 확인하는 경로입니다.
