---
{
  "id": "tax.corporate",
  "title": "법인세",
  "type": "tax",
  "description": "법인의 각 사업연도 소득 등에 과세되는 국세이며 법인세 공제·감면 지원제도와 직접 연결됩니다.",
  "folder": "10_Taxes/National",
  "basis_year": 2026,
  "effective_date": "2026-01-01",
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7975&mi=6549",
    "https://www.law.go.kr/법령/법인세법"
  ],
  "source_basis_dates": [
    "2026-01-01T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.national-taxes"
  ],
  "children": [],
  "related": [
    "category.corporate-tax-supports",
    "local.local-income",
    "scenario.corporate-tax-manager"
  ],
  "terms": [
    "term.national-tax",
    "term.tax-law",
    "term.tax-base",
    "term.tax-rate",
    "term.progressive-deduction"
  ],
  "deadlines": [
    "deadline.corporate-tax.return"
  ],
  "sources": [
    "source.national-tax-framework-act.2026.article2",
    "source.nts.corporate-tax.rates",
    "source.nts.corporate-tax.filing-procedure",
    "source.law.corporate-tax-act.credits"
  ],
  "law_reference": "국세기본법 제2조 제1호",
  "tags": [
    "national-tax"
  ],
  "criteria": [
    {
      "label": "2억원 이하",
      "basis": "각 사업연도 소득 과세표준",
      "condition": "2억원 이하",
      "threshold_krw_max": 200000000,
      "rate_percent": 10,
      "progressive_deduction_krw": 0,
      "note": "2026.1.1. 이후 개시 사업연도 기준",
      "source": "source.nts.corporate-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "각 사업연도 소득 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "법인의 각 사업연도 소득금액에서 세법상 조정과 공제를 반영한 법인세 세율 적용 기준입니다.",
      "basis_lookup": "법인세 신고서와 세무조정계산서의 각 사업연도 소득 과세표준에서 확인합니다.",
      "selection_rule": "과세표준이 2억원, 200억원, 3,000억원 경계 중 어디에 속하는지에 따라 세율과 누진공제액을 선택합니다.",
      "basis_source": "source.nts.corporate-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "2억원 초과 200억원 이하",
      "basis": "각 사업연도 소득 과세표준",
      "condition": "2억원 초과 200억원 이하",
      "threshold_krw_min": 200000000,
      "threshold_krw_max": 20000000000,
      "rate_percent": 20,
      "progressive_deduction_krw": 20000000,
      "note": "2026.1.1. 이후 개시 사업연도 기준",
      "source": "source.nts.corporate-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "각 사업연도 소득 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "법인의 각 사업연도 소득금액에서 세법상 조정과 공제를 반영한 법인세 세율 적용 기준입니다.",
      "basis_lookup": "법인세 신고서와 세무조정계산서의 각 사업연도 소득 과세표준에서 확인합니다.",
      "selection_rule": "과세표준이 2억원, 200억원, 3,000억원 경계 중 어디에 속하는지에 따라 세율과 누진공제액을 선택합니다.",
      "basis_source": "source.nts.corporate-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "200억원 초과 3,000억원 이하",
      "basis": "각 사업연도 소득 과세표준",
      "condition": "200억원 초과 3,000억원 이하",
      "threshold_krw_min": 20000000000,
      "threshold_krw_max": 300000000000,
      "rate_percent": 22,
      "progressive_deduction_krw": 420000000,
      "note": "2026.1.1. 이후 개시 사업연도 기준",
      "source": "source.nts.corporate-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "각 사업연도 소득 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "법인의 각 사업연도 소득금액에서 세법상 조정과 공제를 반영한 법인세 세율 적용 기준입니다.",
      "basis_lookup": "법인세 신고서와 세무조정계산서의 각 사업연도 소득 과세표준에서 확인합니다.",
      "selection_rule": "과세표준이 2억원, 200억원, 3,000억원 경계 중 어디에 속하는지에 따라 세율과 누진공제액을 선택합니다.",
      "basis_source": "source.nts.corporate-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "3,000억원 초과",
      "basis": "각 사업연도 소득 과세표준",
      "condition": "3,000억원 초과",
      "threshold_krw_min": 300000000000,
      "rate_percent": 25,
      "progressive_deduction_krw": 9420000000,
      "note": "2026.1.1. 이후 개시 사업연도 기준",
      "source": "source.nts.corporate-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "각 사업연도 소득 과세표준",
      "basis_category": "tax-base",
      "basis_definition": "법인의 각 사업연도 소득금액에서 세법상 조정과 공제를 반영한 법인세 세율 적용 기준입니다.",
      "basis_lookup": "법인세 신고서와 세무조정계산서의 각 사업연도 소득 과세표준에서 확인합니다.",
      "selection_rule": "과세표준이 2억원, 200억원, 3,000억원 경계 중 어디에 속하는지에 따라 세율과 누진공제액을 선택합니다.",
      "basis_source": "source.nts.corporate-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 10,
        "criterion_2": 20,
        "criterion_3": 22,
        "criterion_4": 25
      },
      "limits": {},
      "thresholds": {
        "criterion_1": {
          "threshold_krw_max": 200000000
        },
        "criterion_2": {
          "threshold_krw_min": 200000000,
          "threshold_krw_max": 20000000000
        },
        "criterion_3": {
          "threshold_krw_min": 20000000000,
          "threshold_krw_max": 300000000000
        },
        "criterion_4": {
          "threshold_krw_min": 300000000000
        }
      },
      "eligible_persons": [
        "2억원 이하",
        "2억원 초과 200억원 이하",
        "200억원 초과 3,000억원 이하",
        "3,000억원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.corporate-tax.return"
      ],
      "law_references": [
        "국세기본법 제2조 제1호"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "국세기본법 제2조 제1호"
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
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
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
      "valid_from": "2026-01-01T00:00:00.000Z",
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
      "valid_from": "2026-01-01T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.law.corporate-tax-act.credits",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
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
      "valid_from": "2026-01-01T00:00:00.000Z",
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
    "id": "tax.corporate",
    "title": "법인세",
    "type": "tax",
    "description": "법인의 각 사업연도 소득 등에 과세되는 국세이며 법인세 공제·감면 지원제도와 직접 연결됩니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7975&mi=6549",
      "https://www.law.go.kr/법령/법인세법"
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
    "search_text": "tax.corporate 법인세 tax 법인의 각 사업연도 소득 등에 과세되는 국세이며 법인세 공제·감면 지원제도와 직접 연결됩니다. 국세기본법 제2조 제1호 national-tax source.national-ta",
    "provenance_shard": "reference",
    "source_ids": [
      "source.national-tax-framework-act.2026.article2",
      "source.nts.corporate-tax.rates",
      "source.nts.corporate-tax.filing-procedure",
      "source.law.corporate-tax-act.credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 622,
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
  "record_checksum": "sha256:e3dc85ff050ea02d5f0f384a72c8f9cb7db28d25e4b08d5ef46306e1c407b7f3"
}
---

# 법인세

법인의 각 사업연도 소득 등에 과세되는 국세이며 법인세 공제·감면 지원제도와 직접 연결됩니다.
