---
{
  "id": "deduction.credit-card-use",
  "title": "신용카드 등 사용금액",
  "type": "deduction",
  "description": "신용카드, 직불카드, 현금영수증 등 사용금액에 대한 소득공제입니다.",
  "folder": "20_Deductions/IncomeDeductions",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
    "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "deduction.other-income"
  ],
  "children": [],
  "related": [
    "eligibility-rule.credit-card-floor",
    "life-expense.card-spending"
  ],
  "terms": [
    "term.income-deduction",
    "term.deduction-limit",
    "term.eligibility-threshold"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.credit-card-deduction",
    "source.nts.year-end-settlement.deduction-limit",
    "source.nts.employee-income-statement"
  ],
  "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문",
  "tags": [
    "income-deduction"
  ],
  "criteria": [
    {
      "label": "사용금액 문턱",
      "basis": "신용카드 등 사용금액",
      "condition": "총급여액의 25% 초과분",
      "rate_percent": 25,
      "note": "공제 대상 사용금액 산정 기준",
      "source": "source.nts.credit-card-deduction",
      "criteria_kind": "rate",
      "rate_basis": "신용카드 등 사용금액",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문",
      "rate_label": "소득공제율",
      "amount_formula": "신용카드 등 사용금액 × 소득공제율 25%"
    },
    {
      "label": "신용카드 공제율",
      "basis": "신용카드 사용금액",
      "condition": "총급여 25% 초과분 중 신용카드",
      "rate_percent": 15,
      "source": "source.nts.credit-card-deduction",
      "criteria_kind": "rate",
      "rate_basis": "신용카드 사용금액",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문",
      "rate_label": "소득공제율",
      "amount_formula": "신용카드 사용금액 × 소득공제율 15%"
    },
    {
      "label": "현금영수증·직불카드 공제율",
      "basis": "현금영수증·직불카드 등",
      "condition": "총급여 25% 초과분 중 현금영수증·직불카드",
      "rate_percent": 30,
      "source": "source.nts.credit-card-deduction",
      "criteria_kind": "rate",
      "rate_basis": "현금영수증·직불카드 등",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문",
      "rate_label": "소득공제율",
      "amount_formula": "현금영수증·직불카드 등 × 소득공제율 30%"
    },
    {
      "label": "전통시장·대중교통 공제율",
      "basis": "전통시장·대중교통 사용금액",
      "condition": "총급여 25% 초과분 중 전통시장·대중교통",
      "rate_percent": 40,
      "source": "source.nts.credit-card-deduction",
      "criteria_kind": "rate",
      "rate_basis": "전통시장·대중교통 사용금액",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문",
      "rate_label": "소득공제율",
      "amount_formula": "전통시장·대중교통 사용금액 × 소득공제율 40%"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 25,
        "criterion_2": 15,
        "criterion_3": 30,
        "criterion_4": 40
      },
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "총급여액의 25% 초과분",
        "총급여 25% 초과분 중 신용카드",
        "총급여 25% 초과분 중 현금영수증·직불카드",
        "총급여 25% 초과분 중 전통시장·대중교통"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "조세특례제한법 신용카드 등 사용금액 소득공제 조문"
      ]
    }
  },
  "search_facets": {
    "tax_type": "deduction",
    "credit_or_deduction": "deduction",
    "applicable_year": 2026,
    "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.credit-card-deduction",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.credit-card-deduction",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
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
      "source_id": "source.nts.year-end-settlement.deduction-limit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
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
    "id": "deduction.credit-card-use",
    "title": "신용카드 등 사용금액",
    "type": "deduction",
    "description": "신용카드, 직불카드, 현금영수증 등 사용금액에 대한 소득공제입니다.",
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
    "search_aliases": [
      "신용카드 소득공제 한도",
      "신용카드 등 사용금액 소득공제 한도"
    ],
    "aliases": [
      "신용카드 소득공제 한도",
      "신용카드 등 사용금액 소득공제 한도"
    ],
    "export_id": "tax-ontology",
    "source_checksum": null,
    "source_urls": [
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594",
      "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {
          "criterion_1": 25,
          "criterion_2": 15,
          "criterion_3": 30,
          "criterion_4": 40
        },
        "limits": {},
        "thresholds": {},
        "eligible_persons": [
          "총급여액의 25% 초과분",
          "총급여 25% 초과분 중 신용카드",
          "총급여 25% 초과분 중 현금영수증·직불카드",
          "총급여 25% 초과분 중 전통시장·대중교통"
        ],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "조세특례제한법 신용카드 등 사용금액 소득공제 조문"
        ]
      }
    },
    "search_facets": {
      "tax_type": "deduction",
      "applicable_year": 2026,
      "law_reference": "조세특례제한법 신용카드 등 사용금액 소득공제 조문"
    },
    "search_text": "신용카드 소득공제 한도 신용카드 등 사용금액 소득공제 한도 deduction.credit-card-use 신용카드 등 사용금액 deduction 신용카드, 직불카드, 현금영수증 등 사용금액에 대한 소득공제입니다. 조",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.credit-card-deduction",
      "source.nts.year-end-settlement.deduction-limit",
      "source.nts.employee-income-statement"
    ]
  },
  "search_shard": "reference",
  "search_position": 138,
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
  "record_checksum": "sha256:d9fdca4eef492fa422b75cfdd9140f2cf85225f78e909a581a6477364b41a758",
  "requires": [
    "eligibility-rule.credit-card-floor"
  ]
}
---

# 신용카드 등 사용금액

신용카드, 직불카드, 현금영수증 등 사용금액에 대한 소득공제입니다.
