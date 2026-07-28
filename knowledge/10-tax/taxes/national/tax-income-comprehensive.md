---
{
  "id": "tax.income.comprehensive",
  "title": "종합소득세",
  "type": "tax",
  "description": "이자·배당·사업·근로·연금·기타소득 등 종합소득금액에 대해 확정신고하는 소득세 흐름입니다.",
  "folder": "10_Taxes/National",
  "basis_year": 2025,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7667&mi=2223",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "tax.income"
  ],
  "children": [
    "concept.financial-income-comprehensive-taxation"
  ],
  "related": [
    "support.earned-income-tax-credit",
    "filing.income-tax-return",
    "filing.business-income-withholding",
    "scenario.sole-proprietor.compliance",
    "life-income.freelance-income",
    "life-income.side-job-income",
    "scenario.freelancer.income-tax",
    "scenario.employee.side-job-income",
    "concept.additional-tax.general",
    "concept.financial-income-comprehensive-taxation",
    "support.small-business-policy-fund",
    "life-event.small-business-operating-funds"
  ],
  "terms": [
    "term.tax-base",
    "term.tax-rate",
    "term.progressive-deduction",
    "term.deadline-special-rule"
  ],
  "deadlines": [
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.income-tax.deadline",
    "source.nts.income-tax.rates",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제55조 및 제70조",
  "tags": [],
  "criteria": [
    {
      "label": "1,400만원 이하",
      "basis": "과세표준",
      "condition": "1,400만원 이하",
      "threshold_krw_max": 14000000,
      "rate_percent": 6,
      "progressive_deduction_krw": 0,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "1,400만원 초과 5,000만원 이하",
      "basis": "과세표준",
      "condition": "1,400만원 초과 5,000만원 이하",
      "threshold_krw_min": 14000000,
      "threshold_krw_max": 50000000,
      "rate_percent": 15,
      "progressive_deduction_krw": 1260000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "5,000만원 초과 8,800만원 이하",
      "basis": "과세표준",
      "condition": "5,000만원 초과 8,800만원 이하",
      "threshold_krw_min": 50000000,
      "threshold_krw_max": 88000000,
      "rate_percent": 24,
      "progressive_deduction_krw": 5760000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "8,800만원 초과 1억5,000만원 이하",
      "basis": "과세표준",
      "condition": "8,800만원 초과 1억5,000만원 이하",
      "threshold_krw_min": 88000000,
      "threshold_krw_max": 150000000,
      "rate_percent": 35,
      "progressive_deduction_krw": 15440000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "1억5,000만원 초과 3억원 이하",
      "basis": "과세표준",
      "condition": "1억5,000만원 초과 3억원 이하",
      "threshold_krw_min": 150000000,
      "threshold_krw_max": 300000000,
      "rate_percent": 38,
      "progressive_deduction_krw": 19940000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "3억원 초과 5억원 이하",
      "basis": "과세표준",
      "condition": "3억원 초과 5억원 이하",
      "threshold_krw_min": 300000000,
      "threshold_krw_max": 500000000,
      "rate_percent": 40,
      "progressive_deduction_krw": 25940000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "5억원 초과 10억원 이하",
      "basis": "과세표준",
      "condition": "5억원 초과 10억원 이하",
      "threshold_krw_min": 500000000,
      "threshold_krw_max": 1000000000,
      "rate_percent": 42,
      "progressive_deduction_krw": 35940000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "10억원 초과",
      "basis": "과세표준",
      "condition": "10억원 초과",
      "threshold_krw_min": 1000000000,
      "rate_percent": 45,
      "progressive_deduction_krw": 65940000,
      "source": "source.nts.income-tax.rates",
      "criteria_kind": "rate",
      "rate_basis": "과세표준",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.income-tax.rates",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2025,
      "rates": {
        "criterion_1": 6,
        "criterion_2": 15,
        "criterion_3": 24,
        "criterion_4": 35,
        "criterion_5": 38,
        "criterion_6": 40,
        "criterion_7": 42,
        "criterion_8": 45
      },
      "limits": {},
      "thresholds": {
        "criterion_1": {
          "threshold_krw_max": 14000000
        },
        "criterion_2": {
          "threshold_krw_min": 14000000,
          "threshold_krw_max": 50000000
        },
        "criterion_3": {
          "threshold_krw_min": 50000000,
          "threshold_krw_max": 88000000
        },
        "criterion_4": {
          "threshold_krw_min": 88000000,
          "threshold_krw_max": 150000000
        },
        "criterion_5": {
          "threshold_krw_min": 150000000,
          "threshold_krw_max": 300000000
        },
        "criterion_6": {
          "threshold_krw_min": 300000000,
          "threshold_krw_max": 500000000
        },
        "criterion_7": {
          "threshold_krw_min": 500000000,
          "threshold_krw_max": 1000000000
        },
        "criterion_8": {
          "threshold_krw_min": 1000000000
        }
      },
      "eligible_persons": [
        "1,400만원 이하",
        "1,400만원 초과 5,000만원 이하",
        "5,000만원 초과 8,800만원 이하",
        "8,800만원 초과 1억5,000만원 이하",
        "1억5,000만원 초과 3억원 이하",
        "3억원 초과 5억원 이하",
        "5억원 초과 10억원 이하",
        "10억원 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.income-tax.2025-return"
      ],
      "law_references": [
        "소득세법 제55조 및 제70조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2025,
    "law_reference": "소득세법 제55조 및 제70조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.income-tax.deadline",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.income-tax.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
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
      "source_id": "source.nts.income-tax.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
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
      "source_id": "source.law.income-tax-act.deductions-credits",
      "original_url": "https://www.law.go.kr/법령/소득세법",
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
    "id": "tax.income.comprehensive",
    "title": "종합소득세",
    "type": "tax",
    "description": "이자·배당·사업·근로·연금·기타소득 등 종합소득금액에 대해 확정신고하는 소득세 흐름입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7667&mi=2223",
      "https://www.law.go.kr/법령/소득세법"
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
    "search_text": "tax.income.comprehensive 종합소득세 tax 이자·배당·사업·근로·연금·기타소득 등 종합소득금액에 대해 확정신고하는 소득세 흐름입니다. 소득세법 제55조 및 제70조 source.nts.income",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.income-tax.deadline",
      "source.nts.income-tax.rates",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 628,
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
  "record_checksum": "sha256:d2a600924fb9beceaa70cc5f459d92beb1c5e9caa4606b1eefe59dac463c7938"
}
---

# 종합소득세

이자·배당·사업·근로·연금·기타소득 등 종합소득금액에 대해 확정신고하는 소득세 흐름입니다.
