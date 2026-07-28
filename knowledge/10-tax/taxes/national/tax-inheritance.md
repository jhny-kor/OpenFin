---
{
  "id": "tax.inheritance",
  "title": "상속세",
  "type": "tax",
  "description": "사망으로 이전되는 재산에 과세되는 세금입니다.",
  "folder": "10_Taxes/National",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7957&mi=6529",
    "https://www.law.go.kr/법령/상속세및증여세법"
  ],
  "source_basis_dates": [
    "2026-01-01T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "tax.inheritance-and-gift"
  ],
  "children": [
    "filing.inheritance-tax-return"
  ],
  "related": [
    "scenario.inheritance-gift"
  ],
  "terms": [
    "term.tax-base",
    "term.heir",
    "term.tax-rate",
    "term.progressive-deduction"
  ],
  "deadlines": [
    "deadline.inheritance.resident",
    "deadline.inheritance.nonresident"
  ],
  "sources": [
    "source.national-tax-framework-act.2026.article2",
    "source.nts.inheritance.overview",
    "source.nts.inheritance.rates",
    "source.law.inheritance-gift-tax-act.rates"
  ],
  "law_reference": "상속세 및 증여세법 제26조 및 제67조",
  "tags": [],
  "criteria": [
    {
      "label": "1억원 이하",
      "basis": "과세표준",
      "condition": "1억원 이하",
      "threshold_krw_max": 100000000,
      "rate_percent": 10,
      "progressive_deduction_krw": 0,
      "source": "source.nts.inheritance.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.inheritance.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "1억원 초과 5억원 이하",
      "basis": "과세표준",
      "condition": "1억원 초과 5억원 이하",
      "threshold_krw_min": 100000000,
      "threshold_krw_max": 500000000,
      "rate_percent": 20,
      "progressive_deduction_krw": 10000000,
      "source": "source.nts.inheritance.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.inheritance.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "5억원 초과 10억원 이하",
      "basis": "과세표준",
      "condition": "5억원 초과 10억원 이하",
      "threshold_krw_min": 500000000,
      "threshold_krw_max": 1000000000,
      "rate_percent": 30,
      "progressive_deduction_krw": 60000000,
      "source": "source.nts.inheritance.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.inheritance.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "10억원 초과 30억원 이하",
      "basis": "과세표준",
      "condition": "10억원 초과 30억원 이하",
      "threshold_krw_min": 1000000000,
      "threshold_krw_max": 3000000000,
      "rate_percent": 40,
      "progressive_deduction_krw": 160000000,
      "source": "source.nts.inheritance.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.inheritance.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "30억원 초과",
      "basis": "과세표준",
      "condition": "30억원 초과",
      "threshold_krw_min": 3000000000,
      "rate_percent": 50,
      "progressive_deduction_krw": 460000000,
      "source": "source.nts.inheritance.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.inheritance.rates",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 10,
        "criterion_2": 20,
        "criterion_3": 30,
        "criterion_4": 40,
        "criterion_5": 50
      },
      "limits": {},
      "thresholds": {
        "criterion_1": {
          "threshold_krw_max": 100000000
        },
        "criterion_2": {
          "threshold_krw_min": 100000000,
          "threshold_krw_max": 500000000
        },
        "criterion_3": {
          "threshold_krw_min": 500000000,
          "threshold_krw_max": 1000000000
        },
        "criterion_4": {
          "threshold_krw_min": 1000000000,
          "threshold_krw_max": 3000000000
        },
        "criterion_5": {
          "threshold_krw_min": 3000000000
        }
      },
      "eligible_persons": [
        "1억원 이하",
        "1억원 초과 5억원 이하",
        "5억원 초과 10억원 이하",
        "10억원 초과 30억원 이하",
        "30억원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.inheritance.resident",
        "deadline.inheritance.nonresident"
      ],
      "law_references": [
        "상속세 및 증여세법 제26조 및 제67조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "상속세 및 증여세법 제26조 및 제67조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.national-tax-framework-act.2026.article2",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.national-tax-framework-act.2026.article2",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.inheritance.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.nts.inheritance.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
      "valid_from": null,
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.law.inheritance-gift-tax-act.rates",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
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
    "id": "tax.inheritance",
    "title": "상속세",
    "type": "tax",
    "description": "사망으로 이전되는 재산에 과세되는 세금입니다.",
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
      "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7957&mi=6529",
      "https://www.law.go.kr/법령/상속세및증여세법"
    ],
    "source_basis_dates": [
      "2026-01-01T00:00:00.000Z",
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
    "search_text": "tax.inheritance 상속세 tax 사망으로 이전되는 재산에 과세되는 세금입니다. 상속세 및 증여세법 제26조 및 제67조 source.national-tax-framework-act.2026.article2",
    "provenance_shard": "reference",
    "source_ids": [
      "source.national-tax-framework-act.2026.article2",
      "source.nts.inheritance.overview",
      "source.nts.inheritance.rates",
      "source.law.inheritance-gift-tax-act.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 631,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-01-01"
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
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-01-01"
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
      "value": "2026-05-04 확인"
    }
  ],
  "record_checksum": "sha256:ddd334363a34e49a8deed559cce33fa9c04a63c33e872844179502d583f63c0c"
}
---

# 상속세

사망으로 이전되는 재산에 과세되는 세금입니다.
