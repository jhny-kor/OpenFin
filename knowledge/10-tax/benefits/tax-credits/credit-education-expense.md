---
{
  "id": "credit.education-expense",
  "title": "교육비 세액공제",
  "type": "tax-credit",
  "description": "본인과 기본공제대상자 교육비 등에 대한 특별세액공제입니다.",
  "folder": "20_Deductions/TaxCredits",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
    "https://www.law.go.kr/법령/소득세법",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "credit.special-tax"
  ],
  "children": [],
  "related": [
    "required-document.education-payment-certificate",
    "eligibility-rule.education-dependent-type",
    "conflict-rule.education-nongrad",
    "life-expense.education-costs",
    "scenario.dual-income-personal-deduction"
  ],
  "terms": [
    "term.tax-credit"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.special-credit",
    "source.law.income-tax-act.deductions-credits",
    "source.nts.education-expense-credit"
  ],
  "law_reference": "소득세법 제59조의4",
  "tags": [
    "tax-credit"
  ],
  "criteria": [
    {
      "label": "본인 교육비",
      "basis": "근로자 본인 교육비",
      "condition": "한도 없음",
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "근로자 본인 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "근로자 본인 교육비 × 세액공제율 15%"
    },
    {
      "label": "취학전·초중고 교육비",
      "basis": "부양가족 1명당 교육비",
      "condition": "취학전 아동, 초·중·고등학생",
      "limit_krw": 3000000,
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "부양가족 1명당 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "대학생 교육비",
      "basis": "부양가족 1명당 교육비",
      "condition": "대학생",
      "limit_krw": 9000000,
      "rate_percent": 15,
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "부양가족 1명당 교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율"
    },
    {
      "label": "장애인 특수교육비",
      "basis": "장애인 특수교육비",
      "condition": "직계존속 포함, 소득제한 없음",
      "rate_percent": 15,
      "note": "한도 없음",
      "source": "source.nts.education-expense-credit",
      "criteria_kind": "rate",
      "rate_basis": "장애인 특수교육비",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.education-expense-credit",
      "law_reference": "소득세법 제59조의4",
      "rate_label": "세액공제율",
      "amount_formula": "장애인 특수교육비 × 세액공제율 15%"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_1": 15,
        "criterion_2": 15,
        "criterion_3": 15,
        "criterion_4": 15
      },
      "limits": {
        "criterion_2": 3000000,
        "criterion_3": 9000000
      },
      "thresholds": {},
      "eligible_persons": [
        "한도 없음",
        "취학전 아동, 초·중·고등학생",
        "대학생",
        "직계존속 포함, 소득제한 없음"
      ],
      "required_documents": [
        "required-document.education-payment-certificate"
      ],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제59조의4"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax-credit",
    "credit_or_deduction": "tax-credit",
    "applicable_year": 2026,
    "law_reference": "소득세법 제59조의4"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.special-credit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.special-credit",
      "original_url": "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
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
    },
    {
      "source_id": "source.nts.education-expense-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612",
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
    "id": "credit.education-expense",
    "title": "교육비 세액공제",
    "type": "tax-credit",
    "description": "본인과 기본공제대상자 교육비 등에 대한 특별세액공제입니다.",
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
      "교육비 세액공제 대상"
    ],
    "aliases": [
      "교육비 세액공제 대상"
    ],
    "export_id": "tax-ontology",
    "source_checksum": null,
    "source_urls": [
      "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
      "https://www.law.go.kr/법령/소득세법",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239024&mi=40612"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {
          "criterion_1": 15,
          "criterion_2": 15,
          "criterion_3": 15,
          "criterion_4": 15
        },
        "limits": {
          "criterion_2": 3000000,
          "criterion_3": 9000000
        },
        "thresholds": {},
        "eligible_persons": [
          "한도 없음",
          "취학전 아동, 초·중·고등학생",
          "대학생",
          "직계존속 포함, 소득제한 없음"
        ],
        "required_documents": [
          "required-document.education-payment-certificate"
        ],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제59조의4"
        ]
      }
    },
    "search_facets": {
      "tax_type": "tax-credit",
      "applicable_year": 2026,
      "law_reference": "소득세법 제59조의4"
    },
    "search_text": "교육비 세액공제 대상 credit.education-expense 교육비 세액공제 tax-credit 본인과 기본공제대상자 교육비 등에 대한 특별세액공제입니다. 소득세법 제59조의4 tax-credit source.",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.special-credit",
      "source.law.income-tax-act.deductions-credits",
      "source.nts.education-expense-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 111,
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
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-04 확인"
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
  "record_checksum": "sha256:58fefd6365e84bbd313d5b7c5bfcfc6254710d60e02be3562414954d728d044f",
  "requires": [
    "eligibility-rule.education-dependent-type",
    "required-document.education-payment-certificate"
  ],
  "conflicts_with": [
    "conflict-rule.education-nongrad"
  ]
}
---

# 교육비 세액공제

본인과 기본공제대상자 교육비 등에 대한 특별세액공제입니다.
