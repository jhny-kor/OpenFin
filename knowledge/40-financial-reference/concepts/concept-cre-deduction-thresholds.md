---
{
  "id": "concept.cre-deduction-thresholds",
  "title": "종합부동산세 공제금액",
  "type": "concept",
  "description": "종합부동산세는 주택, 종합합산토지, 별도합산토지 등 과세대상별 공제금액을 먼저 차감한 뒤 과세표준을 계산합니다.",
  "folder": "10_Taxes/National/RealEstate",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
    "https://www.realtyprice.kr/"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "tax.comprehensive-real-estate"
  ],
  "children": [],
  "related": [
    "local.property"
  ],
  "terms": [
    "term.publicly-notified-price",
    "term.tax-base",
    "term.eligibility-threshold"
  ],
  "deadlines": [],
  "sources": [
    "source.nts.comprehensive-real-estate.overview",
    "source.molit.realtyprice"
  ],
  "law_reference": "",
  "tags": [],
  "criteria": [
    {
      "label": "주택 공제금액",
      "basis": "공시가격 합계액",
      "condition": "주택",
      "deduction_krw": 900000000,
      "note": "1세대 1주택자는 12억원",
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "1세대 1주택자 주택 공제금액",
      "basis": "공시가격 합계액",
      "condition": "1세대 1주택자",
      "deduction_krw": 1200000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "종합합산토지 공제금액",
      "basis": "공시가격 합계액",
      "condition": "종합합산토지",
      "deduction_krw": 500000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "별도합산토지 공제금액",
      "basis": "공시가격 합계액",
      "condition": "별도합산토지",
      "deduction_krw": 8000000000,
      "source": "source.nts.comprehensive-real-estate.overview",
      "criteria_kind": "deduction",
      "basis_category": "property-valuation",
      "basis_definition": "과세유형별 전국합산 공시가격에 감면율을 반영한 뒤 종합부동산세 공제금액을 적용하기 전의 부동산 가격 기준입니다.",
      "basis_lookup": "국토교통부 부동산공시가격 알리미에서 공동주택·개별주택·토지별 공시가격을 확인한 뒤 납세자와 과세유형별로 전국 합산합니다.",
      "selection_rule": "주택은 일반 9억원, 1세대 1주택 12억원, 법인 0원을 차감하고 60%를 적용합니다. 종합합산토지는 5억원, 별도합산토지는 80억원을 차감하고 100%를 적용합니다.",
      "basis_source": "source.molit.realtyprice",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.comprehensive-real-estate.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.comprehensive-real-estate.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
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
        "criteria",
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
        "criteria",
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
    "id": "concept.cre-deduction-thresholds",
    "title": "종합부동산세 공제금액",
    "type": "concept",
    "description": "종합부동산세는 주택, 종합합산토지, 별도합산토지 등 과세대상별 공제금액을 먼저 차감한 뒤 과세표준을 계산합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7733&mi=2351",
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
    "search_text": "concept.cre-deduction-thresholds 종합부동산세 공제금액 concept 종합부동산세는 주택, 종합합산토지, 별도합산토지 등 과세대상별 공제금액을 먼저 차감한 뒤 과세표준을 계산합니다. sour",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.comprehensive-real-estate.overview",
      "source.molit.realtyprice"
    ]
  },
  "search_shard": "reference",
  "search_position": 69,
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
  "record_checksum": "sha256:58ffa71f09a2ee9740106df01b75e1e2a54eca97027cac58fb42e277c3ca8a32"
}
---

# 종합부동산세 공제금액

종합부동산세는 주택, 종합합산토지, 별도합산토지 등 과세대상별 공제금액을 먼저 차감한 뒤 과세표준을 계산합니다.
