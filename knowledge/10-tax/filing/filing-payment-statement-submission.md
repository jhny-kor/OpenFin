---
{
  "id": "filing.payment-statement-submission",
  "title": "지급명세서 제출",
  "type": "filing",
  "description": "근로·퇴직·사업·종교인·연금계좌, 일용근로, 간이지급명세서, 이자·배당·기타소득 지급자료를 제출기한별로 관리하는 원천징수 후속 신고입니다.",
  "folder": "50_Deadlines",
  "parents": [
    "category.filing-calendar",
    "filing.withholding-tax"
  ],
  "related": [
    "filing.business-income-withholding",
    "life-income.freelance-income",
    "life-income.side-job-income",
    "scenario.payment-statement-submission"
  ],
  "terms": [
    "term.withholding",
    "term.withholding-obligor",
    "term.deadline"
  ],
  "sources": [
    "source.nts.payment-statement.deadlines",
    "source.nts.withholding.deadlines",
    "source.nts.employee-income-statement"
  ],
  "law_reference": "소득세법 지급명세서 제출 조문",
  "criteria": [
    {
      "label": "근로·퇴직·사업·종교인·연금계좌",
      "basis": "소득지급시기",
      "condition": "1월~12월 지급분",
      "deadline_month": 3,
      "deadline_day": 10,
      "source": "source.nts.payment-statement.deadlines",
      "criteria_kind": "deadline",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.payment-statement.deadlines",
      "law_reference": "소득세법 지급명세서 제출 조문",
      "amount_applicability": "정액 금액 기준 없음"
    },
    {
      "label": "일용근로소득",
      "basis": "지급일",
      "condition": "지급일이 속하는 달의 다음달 말일",
      "deadline_relative": "지급월 다음달 말일",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.payment-statement.deadlines",
      "criteria_kind": "deadline",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "소득세법 지급명세서 제출 조문"
    },
    {
      "label": "간이지급명세서 근로소득 상반기",
      "basis": "1월~6월 지급분",
      "condition": "7월 말일까지",
      "deadline_month": 7,
      "deadline_relative": "상반기 다음 달 말일",
      "source": "source.nts.payment-statement.deadlines",
      "criteria_kind": "deadline",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "소득세법 지급명세서 제출 조문",
      "amount_applicability": "정액 금액 기준 없음"
    },
    {
      "label": "간이지급명세서 근로소득 하반기",
      "basis": "7월~12월 지급분",
      "condition": "다음연도 1월 말일까지",
      "deadline_month": 1,
      "deadline_relative": "하반기 다음 해 1월 말일",
      "source": "source.nts.payment-statement.deadlines",
      "criteria_kind": "deadline",
      "basis_category": "earned-income",
      "basis_definition": "근로자가 과세기간 동안 지급받은 근로소득 또는 이를 기준으로 산정한 소득요건입니다.",
      "basis_lookup": "근로소득 원천징수영수증, 지급명세서, 연말정산 간소화·신고 자료에서 확인합니다.",
      "selection_rule": "근로소득이 있는 거주자와 일용근로자 여부를 먼저 구분하고 총급여·소득금액이 기준금액 이하인지 판정합니다.",
      "basis_source": "source.nts.employee-income-statement",
      "law_reference": "소득세법 지급명세서 제출 조문",
      "amount_applicability": "정액 금액 기준 없음"
    },
    {
      "label": "이자·배당·기타소득 등",
      "basis": "1월~12월 지급분",
      "condition": "다음연도 2월 말일까지",
      "deadline_month": 2,
      "deadline_relative": "다음연도 2월 말일",
      "source": "source.nts.payment-statement.deadlines",
      "criteria_kind": "deadline",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.payment-statement.deadlines",
      "law_reference": "소득세법 지급명세서 제출 조문",
      "amount_applicability": "정액 금액 기준 없음"
    }
  ],
  "tags": [
    "filing",
    "withholding",
    "deadline",
    "custom-overlay"
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
    "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
    "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
  ],
  "source_basis_dates": [
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "deadlines": [],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "1월~12월 지급분",
        "지급일이 속하는 달의 다음달 말일",
        "7월 말일까지",
        "다음연도 1월 말일까지",
        "다음연도 2월 말일까지"
      ],
      "required_documents": [],
      "filing_deadlines": [],
      "law_references": [
        "소득세법 지급명세서 제출 조문"
      ]
    }
  },
  "search_facets": {
    "tax_type": "filing",
    "applicable_year": 2026,
    "law_reference": "소득세법 지급명세서 제출 조문"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.payment-statement.deadlines",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.payment-statement.deadlines",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "law_reference",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
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
        "law_reference",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
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
        "law_reference",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
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
    "id": "filing.payment-statement-submission",
    "title": "지급명세서 제출",
    "type": "filing",
    "description": "근로·퇴직·사업·종교인·연금계좌, 일용근로, 간이지급명세서, 이자·배당·기타소득 지급자료를 제출기한별로 관리하는 원천징수 후속 신고입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8631&mi=12242",
      "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
      "https://d.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239032&mi=40678"
    ],
    "source_basis_dates": [
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
    "search_text": "filing.payment-statement-submission 지급명세서 제출 filing 근로·퇴직·사업·종교인·연금계좌, 일용근로, 간이지급명세서, 이자·배당·기타소득 지급자료를 제출기한별로 관리하는 원천징수 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.payment-statement.deadlines",
      "source.nts.withholding.deadlines",
      "source.nts.employee-income-statement"
    ]
  },
  "search_shard": "reference",
  "search_position": 177,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    }
  ],
  "record_checksum": "sha256:398cdbb15769d2b84bc88883a4aef2031683b5fdfc3e3abe7a1d3badf194efd1"
}
---

# 지급명세서 제출

근로·퇴직·사업·종교인·연금계좌, 일용근로, 간이지급명세서, 이자·배당·기타소득 지급자료를 제출기한별로 관리하는 원천징수 후속 신고입니다.
