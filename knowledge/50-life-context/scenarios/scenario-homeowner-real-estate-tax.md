---
{
  "id": "scenario.homeowner.real-estate-tax",
  "title": "주택 보유자 보유세 경로",
  "type": "scenario",
  "description": "주택 보유자가 공시가격 합계액, 과세기준일, 재산세, 종합부동산세 구간을 순서대로 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7736&mi=40378",
    "https://www.realtyprice.kr/"
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
    "tax.comprehensive-real-estate",
    "local.property"
  ],
  "terms": [
    "term.publicly-notified-price",
    "term.tax-base",
    "term.tax-rate"
  ],
  "deadlines": [],
  "sources": [
    "source.nts.real-estate-tax.faq",
    "source.nts.comprehensive-real-estate.overview",
    "source.nts.comprehensive-real-estate.rates",
    "source.molit.realtyprice"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "real-estate"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "공시가격 확인",
      "target": "term.publicly-notified-price",
      "reason": "국토교통부 부동산공시가격 알리미에서 주택별 공시가격을 확인한 뒤 소유 주택을 합산합니다."
    },
    {
      "order": 2,
      "label": "과세기준일 확인",
      "target": "concept.cre-tax-base-date",
      "reason": "종합부동산세는 매년 6월 1일 현재 보유 여부로 과세대상을 판정합니다."
    },
    {
      "order": 3,
      "label": "공제금액 차감",
      "target": "concept.cre-deduction-thresholds",
      "reason": "주택 9억원, 1세대 1주택 12억원 등 과세유형별 공제금액을 먼저 차감합니다."
    },
    {
      "order": 4,
      "label": "세율 구간 선택",
      "target": "tax.comprehensive-real-estate",
      "reason": "공제 후 공정시장가액비율을 적용한 과세표준으로 주택 수·토지 유형별 세율표 구간을 선택합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.real-estate-tax.faq",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.real-estate-tax.faq",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
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
      "source_id": "source.nts.comprehensive-real-estate.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
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
      "source_id": "source.nts.comprehensive-real-estate.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
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
      "source_id": "source.molit.realtyprice",
      "original_url": "https://www.realtyprice.kr/",
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
    "id": "scenario.homeowner.real-estate-tax",
    "title": "주택 보유자 보유세 경로",
    "type": "scenario",
    "description": "주택 보유자가 공시가격 합계액, 과세기준일, 재산세, 종합부동산세 구간을 순서대로 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7736&mi=40378",
      "https://www.realtyprice.kr/"
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
    "search_text": "scenario.homeowner.real-estate-tax 주택 보유자 보유세 경로 scenario 주택 보유자가 공시가격 합계액, 과세기준일, 재산세, 종합부동산세 구간을 순서대로 확인하는 경로입니다. scen",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.real-estate-tax.faq",
      "source.nts.comprehensive-real-estate.overview",
      "source.nts.comprehensive-real-estate.rates",
      "source.molit.realtyprice"
    ]
  },
  "search_shard": "reference",
  "search_position": 464,
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
  "record_checksum": "sha256:7f4a36157bf40891532e4d3cc0c5ccb685f4cf330c575326619c5c37c45303d4"
}
---

# 주택 보유자 보유세 경로

주택 보유자가 공시가격 합계액, 과세기준일, 재산세, 종합부동산세 구간을 순서대로 확인하는 경로입니다.
