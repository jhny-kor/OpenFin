---
{
  "id": "tax.income.retirement",
  "title": "퇴직소득세",
  "type": "tax",
  "description": "퇴직으로 받는 소득에 대해 별도 계산 구조를 가지는 소득세입니다.",
  "folder": "10_Taxes/National",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900637068",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7880&mi=6444",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-01-01T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "tax.income"
  ],
  "children": [],
  "related": [],
  "terms": [
    "term.withholding"
  ],
  "deadlines": [],
  "sources": [
    "source.national-tax-framework-act.2026.article2",
    "source.nts.retirement-income.calculation",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문",
  "tags": [],
  "criteria": [
    {
      "label": "퇴직소득세 계산 산식",
      "basis": "퇴직소득 과세표준",
      "condition": "2020년 이후 퇴직분",
      "amount_formula": "(과세표준 × 기본세율 - 누진공제액) ÷ 12 × 근속연수",
      "source": "source.nts.retirement-income.calculation",
      "criteria_kind": "formula",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.retirement-income.calculation",
      "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
    },
    {
      "label": "근속연수 5년 이하 공제",
      "basis": "근속연수공제",
      "condition": "5년 이하",
      "amount_formula": "근속연수 × 1,000,000원",
      "source": "source.nts.retirement-income.calculation",
      "years_of_service_max": 5,
      "per_year_deduction_krw": 1000000,
      "criteria_kind": "deduction",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.retirement-income.calculation",
      "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
    },
    {
      "label": "근속연수 10년 이하 공제",
      "basis": "근속연수공제",
      "condition": "5년 초과 10년 이하",
      "amount_formula": "5,000,000원 + (근속연수 - 5년) × 2,000,000원",
      "source": "source.nts.retirement-income.calculation",
      "years_of_service_min": 5,
      "years_of_service_max": 10,
      "base_deduction_krw": 5000000,
      "per_year_deduction_krw": 2000000,
      "period_years_min": 5,
      "period_years_max": 10,
      "criteria_kind": "deduction",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.retirement-income.calculation",
      "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
    },
    {
      "label": "근속연수 20년 이하 공제",
      "basis": "근속연수공제",
      "condition": "10년 초과 20년 이하",
      "amount_formula": "15,000,000원 + (근속연수 - 10년) × 2,500,000원",
      "source": "source.nts.retirement-income.calculation",
      "years_of_service_min": 10,
      "years_of_service_max": 20,
      "base_deduction_krw": 15000000,
      "per_year_deduction_krw": 2500000,
      "period_years_min": 10,
      "period_years_max": 20,
      "criteria_kind": "deduction",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.retirement-income.calculation",
      "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
    },
    {
      "label": "근속연수 20년 초과 공제",
      "basis": "근속연수공제",
      "condition": "20년 초과",
      "amount_formula": "40,000,000원 + (근속연수 - 20년) × 3,000,000원",
      "source": "source.nts.retirement-income.calculation",
      "years_of_service_min": 20,
      "base_deduction_krw": 40000000,
      "per_year_deduction_krw": 3000000,
      "criteria_kind": "deduction",
      "basis_category": "period",
      "basis_definition": "공제액, 감면기간, 금융상품 만기, 채무조정 요건을 결정하는 기간 기준입니다.",
      "basis_lookup": "재직증명, 퇴직소득 지급자료, 계좌 계약자료, 대출·채무조정 약정서에서 확인합니다.",
      "selection_rule": "기간의 시작일과 종료일을 확정한 뒤 period_* 또는 years_of_service_* 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.retirement-income.calculation",
      "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "2020년 이후 퇴직분",
        "5년 이하",
        "5년 초과 10년 이하",
        "10년 초과 20년 이하",
        "20년 초과"
      ],
      "required_documents": [],
      "filing_deadlines": [],
      "law_references": [
        "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "소득세법 제48조·제55조 및 퇴직소득세액 계산 조문"
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
      "source_id": "source.nts.retirement-income.calculation",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7880&mi=6444",
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
    "id": "tax.income.retirement",
    "title": "퇴직소득세",
    "type": "tax",
    "description": "퇴직으로 받는 소득에 대해 별도 계산 구조를 가지는 소득세입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7880&mi=6444",
      "https://www.law.go.kr/법령/소득세법"
    ],
    "source_basis_dates": [
      "2026-01-01T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z",
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
    "search_text": "tax.income.retirement 퇴직소득세 tax 퇴직으로 받는 소득에 대해 별도 계산 구조를 가지는 소득세입니다. 소득세법 제48조·제55조 및 퇴직소득세액 계산 조문 source.national-tax-f",
    "provenance_shard": "reference",
    "source_ids": [
      "source.national-tax-framework-act.2026.article2",
      "source.nts.retirement-income.calculation",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 629,
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
      "value": "2026-05-03 확인"
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
      "value": "2026-05-03 확인"
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
  "record_checksum": "sha256:f32877ebca94da04edc9171729712c97688ba29db93d6daed6176ba2f94496c7"
}
---

# 퇴직소득세

퇴직으로 받는 소득에 대해 별도 계산 구조를 가지는 소득세입니다.
