---
{
  "id": "filing.capital-gains-return",
  "title": "양도소득세 신고",
  "type": "filing",
  "description": "부동산, 주식 등 자산 양도 후 예정신고와 다음연도 확정신고 필요 여부를 구분해 관리하는 신고 절차입니다.",
  "folder": "50_Deadlines",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7713&mi=2371",
    "https://www.law.go.kr/법령/소득세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.filing-calendar",
    "tax.income.capital-gains"
  ],
  "children": [],
  "related": [
    "tax.securities-transaction",
    "concept.capital-gains.calculation-flow",
    "concept.capital-gains.stock-basic-deduction",
    "scenario.real-estate-transfer",
    "concept.additional-tax.general",
    "scenario.tax-penalty-risk"
  ],
  "terms": [
    "term.capital-gain",
    "term.tax-base",
    "term.deadline"
  ],
  "deadlines": [
    "deadline.capital-gains.preliminary",
    "deadline.capital-gains.final"
  ],
  "sources": [
    "source.nts.capital-gains.overview",
    "source.nts.capital-gains.deadline",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제105조 및 제110조",
  "tags": [],
  "criteria": [
    {
      "label": "양도소득세 예정신고",
      "basis": "양도일이 속하는 달의 말일",
      "condition": "자산 유형별 예정신고 기한 적용",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.capital-gains.deadline",
      "deadline_months_after_month_end": 2,
      "criteria_kind": "deadline",
      "basis_category": "deadline-anchor",
      "basis_definition": "신고·납부 또는 신청기한을 계산할 때 출발점이 되는 날짜 또는 과세기간 기준입니다.",
      "basis_lookup": "거래일, 사업개시일, 소득 지급일, 상속·증여 발생일, 과세기간 기록과 신고 안내에서 확인합니다.",
      "selection_rule": "기준일이 속하는 달·반기·과세기간의 말일을 확정한 뒤 deadline_* 필드의 월·일·개월 규칙을 적용합니다.",
      "basis_source": "source.nts.capital-gains.deadline",
      "law_reference": "소득세법 제105조 및 제110조"
    },
    {
      "label": "양도소득세 확정신고",
      "basis": "과세기간 다음연도 5월",
      "condition": "예정신고 대상 외 확정신고 필요 여부 확인",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.capital-gains.deadline",
      "deadline_start_month": 5,
      "deadline_start_day": 1,
      "deadline_end_month": 5,
      "deadline_end_day": 31,
      "criteria_kind": "deadline",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.capital-gains.deadline",
      "law_reference": "소득세법 제105조 및 제110조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "자산 유형별 예정신고 기한 적용",
        "예정신고 대상 외 확정신고 필요 여부 확인"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.capital-gains.preliminary",
        "deadline.capital-gains.final"
      ],
      "law_references": [
        "소득세법 제105조 및 제110조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "filing",
    "applicable_year": 2026,
    "law_reference": "소득세법 제105조 및 제110조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.capital-gains.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.capital-gains.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
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
      "source_id": "source.nts.capital-gains.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
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
    "id": "filing.capital-gains-return",
    "title": "양도소득세 신고",
    "type": "filing",
    "description": "부동산, 주식 등 자산 양도 후 예정신고와 다음연도 확정신고 필요 여부를 구분해 관리하는 신고 절차입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2308",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7713&mi=2371",
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
    "search_text": "filing.capital-gains-return 양도소득세 신고 filing 부동산, 주식 등 자산 양도 후 예정신고와 다음연도 확정신고 필요 여부를 구분해 관리하는 신고 절차입니다. 소득세법 제105조 및 제11",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.capital-gains.overview",
      "source.nts.capital-gains.deadline",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 172,
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
  "record_checksum": "sha256:8fb78a1b497e6c8b683c775a55c914955fe74cb5739774e0239817e053f7c450"
}
---

# 양도소득세 신고

부동산, 주식 등 자산 양도 후 예정신고와 다음연도 확정신고 필요 여부를 구분해 관리하는 신고 절차입니다.
