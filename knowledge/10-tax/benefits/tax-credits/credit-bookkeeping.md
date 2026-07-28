---
{
  "id": "credit.bookkeeping",
  "title": "기장세액공제",
  "type": "tax-credit",
  "description": "간편장부대상자가 복식부기에 따라 기장하여 소득금액을 계산한 경우 적용되는 세액공제입니다.",
  "folder": "20_Deductions/TaxCredits",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-07-28",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-07-28T00:00:00.000Z",
    "2026-07-28T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.tax-credits"
  ],
  "children": [],
  "related": [
    "filing.income-tax-return",
    "tax.income.comprehensive"
  ],
  "terms": [
    "term.tax-credit"
  ],
  "deadlines": [
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제56조의2",
  "tags": [
    "tax-credit"
  ],
  "criteria": [
    {
      "label": "공제율",
      "basis": "복식부기로 계산한 사업소득금액이 종합소득금액에서 차지하는 비율을 곱한 산출세액",
      "condition": "간편장부대상자가 복식부기로 기장한 경우",
      "source": "source.law.income-tax-act.deductions-credits",
      "basis_source": "source.law.income-tax-act.deductions-credits",
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "law_reference": "소득세법 제56조의2 제1항",
      "rate_percent": 20
    },
    {
      "label": "공제한도",
      "basis": "기장세액공제액",
      "condition": "공제세액이 한도를 초과하는 경우 한도까지만 공제",
      "source": "source.law.income-tax-act.deductions-credits",
      "basis_source": "source.law.income-tax-act.deductions-credits",
      "criteria_kind": "deduction",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "law_reference": "소득세법 제56조의2 제1항",
      "limit_krw": 1000000
    }
  ],
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
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-07-28T00:00:00.000Z",
      "reviewed_at": "2026-07-28T00:00:00.000Z",
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
        "provenance_shard",
        "source_registry_id",
        "source_registry_status"
      ],
      "source_published_at": null,
      "source_modified_at": null,
      "collected_at": "2026-07-28T00:00:00.000Z",
      "reviewed_at": "2026-07-28T00:00:00.000Z",
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
    "id": "credit.bookkeeping",
    "title": "기장세액공제",
    "type": "tax-credit",
    "description": "간편장부대상자가 복식부기에 따라 기장하여 소득금액을 계산한 경우 적용되는 세액공제입니다.",
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
      "2026-07-28T00:00:00.000Z",
      "2026-07-28T00:00:00.000Z"
    ],
    "structured_summary": {
      "tax": {
        "tax_year": 2026,
        "rates": {},
        "limits": {},
        "thresholds": {},
        "eligible_persons": [],
        "required_documents": [],
        "filing_deadlines": [
          "deadline.income-tax.2025-return"
        ],
        "law_references": [
          "소득세법 제56조의2"
        ]
      }
    },
    "search_facets": {
      "tax_type": "tax-credit",
      "applicable_year": 2026,
      "law_reference": "소득세법 제56조의2"
    },
    "search_text": "credit.bookkeeping 기장세액공제 tax-credit 간편장부대상자가 복식부기에 따라 기장하여 소득금액을 계산한 경우 적용되는 세액공제입니다.",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 712,
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.income-tax.2025-return"
      ],
      "law_references": [
        "소득세법 제56조의2"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax-credit",
    "applicable_year": 2026,
    "law_reference": "소득세법 제56조의2",
    "credit_or_deduction": "tax-credit"
  },
  "record_checksum": "sha256:1569d0fdf80e6b1c0404ce9b3f787d61cd02ddb0cb1331739571ac4f7e18c203"
}
---

# 기장세액공제

간편장부대상자가 복식부기에 따라 기장하여 소득금액을 계산한 경우 적용되는 세액공제입니다.
