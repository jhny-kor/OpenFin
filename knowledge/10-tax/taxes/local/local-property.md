---
{
  "id": "local.property",
  "title": "재산세",
  "type": "tax",
  "description": "토지, 건축물, 주택 등 재산 보유에 대해 과세되는 지방 보통세입니다.",
  "folder": "10_Taxes/Local",
  "basis_year": 2026,
  "effective_date": "2026-02-05",
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
    "https://www.law.go.kr/법령/지방세법"
  ],
  "source_basis_dates": [
    "2026-02-05T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.local-ordinary-taxes"
  ],
  "children": [],
  "related": [
    "tax.comprehensive-real-estate",
    "concept.cre-tax-base-date",
    "concept.cre-deduction-thresholds",
    "scenario.homeowner.real-estate-tax"
  ],
  "terms": [
    "term.local-tax",
    "term.publicly-notified-price",
    "term.tax-rate"
  ],
  "deadlines": [
    "deadline.local.property.first",
    "deadline.local.property.second"
  ],
  "sources": [
    "source.local-tax-framework-act.2026.article8",
    "source.nts.real-estate-tax.faq",
    "source.law.local-tax-act.rates"
  ],
  "law_reference": "지방세기본법 제8조",
  "tags": [
    "local-tax"
  ],
  "criteria": [
    {
      "label": "주택 6천만원 이하",
      "basis": "재산세 과세표준",
      "condition": "주택 6천만원 이하",
      "threshold_krw_max": 60000000,
      "rate_percent": 0.1,
      "progressive_deduction_krw": 0,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "주택 1억5천만원 이하",
      "basis": "재산세 과세표준",
      "condition": "주택 1억5천만원 이하",
      "threshold_krw_max": 150000000,
      "rate_percent": 0.15,
      "progressive_deduction_krw": 30000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "주택 3억원 이하",
      "basis": "재산세 과세표준",
      "condition": "주택 3억원 이하",
      "threshold_krw_max": 300000000,
      "rate_percent": 0.25,
      "progressive_deduction_krw": 180000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "주택 3억원 초과",
      "basis": "재산세 과세표준",
      "condition": "주택 3억원 초과",
      "threshold_krw_min": 300000000,
      "rate_percent": 0.4,
      "progressive_deduction_krw": 630000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "종합합산 5천만원 이하",
      "basis": "재산세 과세표준",
      "condition": "종합합산 5천만원 이하",
      "threshold_krw_max": 50000000,
      "rate_percent": 0.2,
      "progressive_deduction_krw": 0,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "종합합산 1억원 이하",
      "basis": "재산세 과세표준",
      "condition": "종합합산 1억원 이하",
      "threshold_krw_max": 100000000,
      "rate_percent": 0.3,
      "progressive_deduction_krw": 50000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "종합합산 1억원 초과",
      "basis": "재산세 과세표준",
      "condition": "종합합산 1억원 초과",
      "threshold_krw_min": 100000000,
      "rate_percent": 0.5,
      "progressive_deduction_krw": 250000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "별도합산 2억원 이하",
      "basis": "재산세 과세표준",
      "condition": "별도합산 2억원 이하",
      "threshold_krw_max": 200000000,
      "rate_percent": 0.2,
      "progressive_deduction_krw": 0,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "별도합산 10억원 이하",
      "basis": "재산세 과세표준",
      "condition": "별도합산 10억원 이하",
      "threshold_krw_max": 1000000000,
      "rate_percent": 0.3,
      "progressive_deduction_krw": 200000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    },
    {
      "label": "별도합산 10억원 초과",
      "basis": "재산세 과세표준",
      "condition": "별도합산 10억원 초과",
      "threshold_krw_min": 1000000000,
      "rate_percent": 0.4,
      "progressive_deduction_krw": 1200000,
      "source": "source.nts.real-estate-tax.faq",
      "criteria_kind": "rate",
      "rate_basis": "재산세 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.real-estate-tax.faq",
      "law_reference": "지방세기본법 제8조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 0.1,
        "criterion_2": 0.15,
        "criterion_3": 0.25,
        "criterion_4": 0.4,
        "criterion_5": 0.2,
        "criterion_6": 0.3,
        "criterion_7": 0.5,
        "criterion_8": 0.2,
        "criterion_9": 0.3,
        "criterion_10": 0.4
      },
      "limits": {},
      "thresholds": {
        "criterion_1": {
          "threshold_krw_max": 60000000
        },
        "criterion_2": {
          "threshold_krw_max": 150000000
        },
        "criterion_3": {
          "threshold_krw_max": 300000000
        },
        "criterion_4": {
          "threshold_krw_min": 300000000
        },
        "criterion_5": {
          "threshold_krw_max": 50000000
        },
        "criterion_6": {
          "threshold_krw_max": 100000000
        },
        "criterion_7": {
          "threshold_krw_min": 100000000
        },
        "criterion_8": {
          "threshold_krw_max": 200000000
        },
        "criterion_9": {
          "threshold_krw_max": 1000000000
        },
        "criterion_10": {
          "threshold_krw_min": 1000000000
        }
      },
      "eligible_persons": [
        "주택 6천만원 이하",
        "주택 1억5천만원 이하",
        "주택 3억원 이하",
        "주택 3억원 초과",
        "종합합산 5천만원 이하",
        "종합합산 1억원 이하",
        "종합합산 1억원 초과",
        "별도합산 2억원 이하",
        "별도합산 10억원 이하",
        "별도합산 10억원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [],
      "law_references": [
        "지방세기본법 제8조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "지방세기본법 제8조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.local-tax-framework-act.2026.article8",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.local-tax-framework-act.2026.article8",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-02-05T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
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
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-02-05T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.law.local-tax-act.rates",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
        "criteria",
        "structured_summary",
        "search_facets",
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-05-04T00:00:00.000Z",
      "reviewed_at": "2026-05-04T00:00:00.000Z",
      "valid_from": "2026-02-05T00:00:00.000Z",
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
    "id": "local.property",
    "title": "재산세",
    "type": "tax",
    "description": "토지, 건축물, 주택 등 재산 보유에 대해 과세되는 지방 보통세입니다.",
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
      "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7739&mi=2357",
      "https://www.law.go.kr/법령/지방세법"
    ],
    "source_basis_dates": [
      "2026-02-05T00:00:00.000Z",
      "2026-05-02T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z"
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
    "search_text": "local.property 재산세 tax 토지, 건축물, 주택 등 재산 보유에 대해 과세되는 지방 보통세입니다. 지방세기본법 제8조 local-tax source.local-tax-framework-act.2026.",
    "provenance_shard": "reference",
    "source_ids": [
      "source.local-tax-framework-act.2026.article8",
      "source.nts.real-estate-tax.faq",
      "source.law.local-tax-act.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 433,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-02-05"
    },
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-02-05"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
    }
  ],
  "record_checksum": "sha256:bf1dd396df423fdf4cdb4a44e01a8b8559c80ee70e21fbf9394368f2a3731fda"
}
---

# 재산세

토지, 건축물, 주택 등 재산 보유에 대해 과세되는 지방 보통세입니다.
