---
{
  "id": "filing.withholding-tax",
  "title": "원천세 신고 납부 절차",
  "type": "filing",
  "description": "원천징수의무자가 원천징수한 세액을 신고·납부하는 절차입니다. 매월 납부와 반기별 납부를 모두 연결해 급여·사업소득 지급자의 반복 업무로 관리합니다.",
  "folder": "50_Deadlines",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7701&mi=2289",
    "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
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
    "category.business-tax-compliance"
  ],
  "children": [
    "filing.business-income-withholding",
    "filing.payment-statement-submission"
  ],
  "related": [
    "filing.business-income-withholding",
    "scenario.payment-statement-submission"
  ],
  "terms": [
    "term.withholding",
    "term.withholding-obligor",
    "term.deadline-special-rule"
  ],
  "deadlines": [
    "deadline.withholding.monthly",
    "deadline.withholding.semiannual"
  ],
  "sources": [
    "source.nts.tax-calendar.2026",
    "source.nts.withholding.overview",
    "source.nts.withholding.deadlines",
    "source.nts.business-income.withholding",
    "source.law.income-tax-act.deductions-credits"
  ],
  "law_reference": "소득세법 제128조",
  "tags": [],
  "criteria": [
    {
      "label": "원천세 월별 납부",
      "basis": "원천징수일",
      "condition": "징수일이 속하는 달의 다음달 10일까지",
      "amount_formula": "원천징수 대상 지급액 × 소득별 원천징수세율",
      "source": "source.nts.withholding.overview",
      "deadline_day": 10,
      "deadline_relative": "징수일이 속하는 달의 다음 달",
      "criteria_kind": "deadline",
      "basis_category": "deadline-anchor",
      "basis_definition": "신고·납부 또는 신청기한을 계산할 때 출발점이 되는 날짜 또는 과세기간 기준입니다.",
      "basis_lookup": "거래일, 사업개시일, 소득 지급일, 상속·증여 발생일, 과세기간 기록과 신고 안내에서 확인합니다.",
      "selection_rule": "기준일이 속하는 달·반기·과세기간의 말일을 확정한 뒤 deadline_* 필드의 월·일·개월 규칙을 적용합니다.",
      "basis_source": "source.nts.withholding.overview",
      "law_reference": "소득세법 제128조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "징수일이 속하는 달의 다음달 10일까지"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.withholding.monthly",
        "deadline.withholding.semiannual"
      ],
      "law_references": [
        "소득세법 제128조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "filing",
    "applicable_year": 2026,
    "law_reference": "소득세법 제128조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.tax-calendar.2026",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.tax-calendar.2026",
      "original_url": "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
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
      "source_id": "source.nts.withholding.overview",
      "original_url": "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
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
      "source_id": "source.nts.withholding.deadlines",
      "original_url": "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
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
      "source_id": "source.nts.business-income.withholding",
      "original_url": "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
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
    "id": "filing.withholding-tax",
    "title": "원천세 신고 납부 절차",
    "type": "filing",
    "description": "원천징수의무자가 원천징수한 세액을 신고·납부하는 절차입니다. 매월 납부와 반기별 납부를 모두 연결해 급여·사업소득 지급자의 반복 업무로 관리합니다.",
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
      "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7701&mi=2289",
      "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7902&mi=6466",
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
    "search_text": "filing.withholding-tax 원천세 신고 납부 절차 filing 원천징수의무자가 원천징수한 세액을 신고·납부하는 절차입니다. 매월 납부와 반기별 납부를 모두 연결해 급여·사업소득 지급자의 반복 업무로 관",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.tax-calendar.2026",
      "source.nts.withholding.overview",
      "source.nts.withholding.deadlines",
      "source.nts.business-income.withholding",
      "source.law.income-tax-act.deductions-credits"
    ]
  },
  "search_shard": "reference",
  "search_position": 179,
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
  "record_checksum": "sha256:637016d6b9bc42b5a016d4d2f81a5758b9e1687017ab76a0c3a5a62ce37b19de"
}
---

# 원천세 신고 납부 절차

원천징수의무자가 원천징수한 세액을 신고·납부하는 절차입니다. 매월 납부와 반기별 납부를 모두 연결해 급여·사업소득 지급자의 반복 업무로 관리합니다.
