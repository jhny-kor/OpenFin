---
{
  "id": "reduction.sme-employment-income",
  "title": "중소기업 취업자 소득세 감면",
  "type": "tax-reduction",
  "description": "청년 등 중소기업 취업자의 소득세를 일정 요건에서 감면하는 항목입니다.",
  "folder": "20_Deductions/TaxReductions",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239023&mi=40611",
    "https://www.law.go.kr/법령/조세특례제한법",
    "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
  ],
  "source_basis_dates": [
    "2026-05-03T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.tax-reductions"
  ],
  "children": [],
  "related": [],
  "terms": [
    "term.tax-reduction"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.sme-employment-income-reduction",
    "source.law.tax-special-treatment-restriction-act.reliefs",
    "source.nts.employee-income-statement"
  ],
  "law_reference": "조세특례제한법 제30조",
  "tags": [],
  "criteria": [
    {
      "label": "청년",
      "basis": "중소기업 취업자 근로소득세",
      "condition": "근로계약 체결일 현재 15~34세 이하",
      "rate_percent": 90,
      "rate_label": "감면율",
      "limit_krw": 2000000,
      "note": "감면기간 5년",
      "source": "source.nts.sme-employment-income-reduction",
      "age_max": 34,
      "criteria_kind": "rate",
      "rate_basis": "중소기업 취업자 근로소득세",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 제30조"
    },
    {
      "label": "고령자",
      "basis": "중소기업 취업자 근로소득세",
      "condition": "근로계약 체결일 현재 60세 이상",
      "rate_percent": 70,
      "rate_label": "감면율",
      "limit_krw": 2000000,
      "note": "감면기간 3년",
      "source": "source.nts.sme-employment-income-reduction",
      "age_min": 60,
      "criteria_kind": "rate",
      "rate_basis": "중소기업 취업자 근로소득세",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 제30조"
    },
    {
      "label": "장애인·경력단절근로자",
      "basis": "중소기업 취업자 근로소득세",
      "condition": "장애인 또는 경력단절근로자 요건 충족",
      "rate_percent": 70,
      "rate_label": "감면율",
      "limit_krw": 2000000,
      "note": "감면기간 3년",
      "source": "source.nts.sme-employment-income-reduction",
      "criteria_kind": "rate",
      "rate_basis": "중소기업 취업자 근로소득세",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 제30조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 90,
        "criterion_2": 70,
        "criterion_3": 70
      },
      "limits": {
        "criterion_1": 2000000,
        "criterion_2": 2000000,
        "criterion_3": 2000000
      },
      "thresholds": {},
      "eligible_persons": [
        "근로계약 체결일 현재 15~34세 이하",
        "근로계약 체결일 현재 60세 이상",
        "장애인 또는 경력단절근로자 요건 충족"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "조세특례제한법 제30조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax-reduction",
    "credit_or_deduction": "tax-reduction",
    "applicable_year": 2026,
    "law_reference": "조세특례제한법 제30조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.sme-employment-income-reduction",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.sme-employment-income-reduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239023&mi=40611",
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
      "source_id": "source.law.tax-special-treatment-restriction-act.reliefs",
      "original_url": "https://www.law.go.kr/법령/조세특례제한법",
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
      "source_id": "source.nts.employee-income-statement",
      "original_url": "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678",
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
    "id": "reduction.sme-employment-income",
    "title": "중소기업 취업자 소득세 감면",
    "type": "tax-reduction",
    "description": "청년 등 중소기업 취업자의 소득세를 일정 요건에서 감면하는 항목입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239023&mi=40611",
      "https://www.law.go.kr/법령/조세특례제한법",
      "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
    ],
    "source_basis_dates": [
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
    "search_text": "reduction.sme-employment-income 중소기업 취업자 소득세 감면 tax-reduction 청년 등 중소기업 취업자의 소득세를 일정 요건에서 감면하는 항목입니다. 조세특례제한법 제30조 sourc",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.sme-employment-income-reduction",
      "source.law.tax-special-treatment-restriction-act.reliefs",
      "source.nts.employee-income-statement"
    ]
  },
  "search_shard": "reference",
  "search_position": 439,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-03 확인"
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
      "value": "2026-05-03 확인"
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
  "record_checksum": "sha256:1406f4317b6e9d908803276db802dedf0e0217c9267d1e9086ef0195bf9a3900"
}
---

# 중소기업 취업자 소득세 감면

청년 등 중소기업 취업자의 소득세를 일정 요건에서 감면하는 항목입니다.
