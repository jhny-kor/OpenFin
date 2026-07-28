---
{
  "id": "credit.child",
  "title": "자녀 세액공제",
  "type": "tax-credit",
  "description": "자녀 수 등 요건에 따라 산출세액에서 차감되는 세액공제입니다.",
  "folder": "20_Deductions/TaxCredits",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.tax-credits"
  ],
  "children": [],
  "related": [
    "support.child-tax-credit",
    "scenario.dual-income-personal-deduction"
  ],
  "terms": [
    "term.tax-credit"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제59조의2",
  "tags": [
    "tax-credit"
  ],
  "criteria": [
    {
      "label": "자녀 1명",
      "basis": "8세 이상 기본공제대상 자녀·손자녀",
      "condition": "1명",
      "deduction_krw": 250000,
      "source": "source.nts.year-end-settlement.calculation",
      "age_min": 8,
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    },
    {
      "label": "자녀 2명",
      "basis": "8세 이상 기본공제대상 자녀·손자녀",
      "condition": "2명",
      "deduction_krw": 550000,
      "source": "source.nts.year-end-settlement.calculation",
      "age_min": 8,
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    },
    {
      "label": "자녀 3명 이상",
      "basis": "8세 이상 기본공제대상 자녀·손자녀",
      "condition": "3명 이상",
      "deduction_krw": 550000,
      "note": "2명을 초과하는 1명당 40만원 추가",
      "source": "source.nts.year-end-settlement.calculation",
      "age_min": 8,
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    },
    {
      "label": "출산·입양 첫째",
      "basis": "출산·입양 신고 자녀",
      "condition": "첫째",
      "deduction_krw": 300000,
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    },
    {
      "label": "출산·입양 둘째",
      "basis": "출산·입양 신고 자녀",
      "condition": "둘째",
      "deduction_krw": 500000,
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    },
    {
      "label": "출산·입양 셋째 이상",
      "basis": "출산·입양 신고 자녀",
      "condition": "셋째 이상",
      "deduction_krw": 700000,
      "source": "source.nts.year-end-settlement.calculation",
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.year-end-settlement.calculation",
      "law_reference": "소득세법 제59조의2"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "1명",
        "2명",
        "3명 이상",
        "첫째",
        "둘째",
        "셋째 이상"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.year-end-settlement"
      ],
      "law_references": [
        "소득세법 제59조의2"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax-credit",
    "credit_or_deduction": "tax-credit",
    "applicable_year": 2026,
    "law_reference": "소득세법 제59조의2"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.calculation",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.calculation",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
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
    "id": "credit.child",
    "title": "자녀 세액공제",
    "type": "tax-credit",
    "description": "자녀 수 등 요건에 따라 산출세액에서 차감되는 세액공제입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
      "https://www.law.go.kr/법령/소득세법"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {},
        "limits": {},
        "thresholds": {},
        "eligible_persons": [
          "1명",
          "2명",
          "3명 이상",
          "첫째",
          "둘째",
          "셋째 이상"
        ],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.year-end-settlement"
        ],
        "law_references": [
          "소득세법 제59조의2"
        ]
      }
    },
    "search_facets": {
      "tax_type": "tax-credit",
      "applicable_year": 2026,
      "law_reference": "소득세법 제59조의2"
    },
    "search_text": "credit.child 자녀 세액공제 tax-credit 자녀 수 등 요건에 따라 산출세액에서 차감되는 세액공제입니다. 소득세법 제59조의2 tax-credit source.nts.year-end-settlement",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 108,
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
  "record_checksum": "sha256:ea55f1520ab97f9b858452d31a2705137a109e5008dd955fe8a45cf57e98a316"
}
---

# 자녀 세액공제

자녀 수 등 요건에 따라 산출세액에서 차감되는 세액공제입니다.
