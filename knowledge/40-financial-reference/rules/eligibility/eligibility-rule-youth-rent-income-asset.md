---
{
  "id": "eligibility-rule.youth-rent-income-asset",
  "title": "청년월세 소득·재산 요건",
  "type": "eligibility-rule",
  "description": "청년월세지원에서 청년가구와 원가구의 기준 중위소득, 총재산가액, 무주택·분리거주 여부를 함께 판단하는 규칙입니다.",
  "folder": "81_Rules/Eligibility",
  "parents": [
    "category.eligibility-rules"
  ],
  "related": [
    "support.youth-monthly-rent-special",
    "life-expense.monthly-rent-support"
  ],
  "sources": [
    "source.korea.youth-monthly-rent.2026",
    "source.myhome.youth-monthly-rent.2026",
    "source.govkr.basic-livelihood-benefit"
  ],
  "criteria": [
    {
      "label": "청년 연령",
      "basis": "만 나이",
      "condition": "19세 이상 34세 이하",
      "age_min": 19,
      "age_max": 34,
      "source": "source.korea.youth-monthly-rent.2026",
      "criteria_kind": "eligibility",
      "basis_category": "age",
      "basis_definition": "신청일, 계좌개설일 또는 과세기간 기준으로 대상자의 만 나이를 계산한 선정 기준입니다.",
      "basis_lookup": "주민등록상 생년월일과 해당 제도의 기준일로 확인합니다.",
      "selection_rule": "age_min과 age_max가 있으면 해당 나이 범위에 포함되는지 판정하고 병역기간 차감 등 특례가 있으면 note를 함께 적용합니다.",
      "basis_source": "source.korea.youth-monthly-rent.2026",
      "amount_applicability": "정액 금액 기준 없음"
    },
    {
      "label": "청년가구 소득",
      "basis": "기준 중위소득",
      "condition": "60% 이하",
      "median_income_percent_max": 60,
      "threshold_krw_max": 1538543,
      "note": "1인 가구 2026년 기준",
      "source": "source.myhome.youth-monthly-rent.2026",
      "criteria_kind": "eligibility",
      "basis_category": "median-income",
      "basis_definition": "복지·정책금융 지원대상 선정을 위해 가구원 수별 기준 중위소득에 일정 비율을 곱해 산정하는 소득 기준입니다.",
      "basis_lookup": "정부24·금융위원회·지원기관의 해당 연도 가구원 수별 기준 중위소득 표에서 확인합니다.",
      "selection_rule": "가구원 수를 확정한 뒤 median_income_percent_max 이하인지 확인합니다.",
      "basis_source": "source.govkr.basic-livelihood-benefit"
    },
    {
      "label": "원가구 소득",
      "basis": "기준 중위소득",
      "condition": "100% 이하",
      "median_income_percent_max": 100,
      "threshold_krw_max": 2564238,
      "note": "1인 가구 2026년 기준",
      "source": "source.myhome.youth-monthly-rent.2026",
      "criteria_kind": "eligibility",
      "basis_category": "median-income",
      "basis_definition": "복지·정책금융 지원대상 선정을 위해 가구원 수별 기준 중위소득에 일정 비율을 곱해 산정하는 소득 기준입니다.",
      "basis_lookup": "정부24·금융위원회·지원기관의 해당 연도 가구원 수별 기준 중위소득 표에서 확인합니다.",
      "selection_rule": "가구원 수를 확정한 뒤 median_income_percent_max 이하인지 확인합니다.",
      "basis_source": "source.govkr.basic-livelihood-benefit"
    },
    {
      "label": "청년가구 재산",
      "basis": "총재산가액",
      "condition": "1.22억원 이하",
      "threshold_krw_max": 122000000,
      "source": "source.myhome.youth-monthly-rent.2026",
      "criteria_kind": "threshold",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.myhome.youth-monthly-rent.2026"
    },
    {
      "label": "원가구 재산",
      "basis": "총재산가액",
      "condition": "4.7억원 이하",
      "threshold_krw_max": 470000000,
      "source": "source.myhome.youth-monthly-rent.2026",
      "criteria_kind": "threshold",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.myhome.youth-monthly-rent.2026"
    }
  ],
  "tags": [
    "eligibility-rule",
    "youth",
    "housing",
    "custom-overlay"
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
    "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
    "https://www.gov.kr/portal/service/serviceInfo/WII000001410"
  ],
  "source_basis_dates": [
    "2026-03-19",
    "2026-05-04T00:00:00.000Z",
    "2026-02-09T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.korea.youth-monthly-rent.2026",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.korea.youth-monthly-rent.2026",
      "original_url": "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
      "source_id": "source.myhome.youth-monthly-rent.2026",
      "original_url": "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
      "source_id": "source.govkr.basic-livelihood-benefit",
      "original_url": "https://www.gov.kr/portal/service/serviceInfo/WII000001410",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "criteria",
        "basis_year",
        "reviewed_at",
        "abolition_status",
        "revision_status",
        "law_reference",
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
    "id": "eligibility-rule.youth-rent-income-asset",
    "title": "청년월세 소득·재산 요건",
    "type": "eligibility-rule",
    "description": "청년월세지원에서 청년가구와 원가구의 기준 중위소득, 총재산가액, 무주택·분리거주 여부를 함께 판단하는 규칙입니다.",
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
      "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "https://www.gov.kr/portal/service/serviceInfo/WII000001410"
    ],
    "source_basis_dates": [
      "2026-03-19",
      "2026-05-04T00:00:00.000Z",
      "2026-02-09T00:00:00.000Z"
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
    "search_text": "eligibility-rule.youth-rent-income-asset 청년월세 소득·재산 요건 eligibility-rule 청년월세지원에서 청년가구와 원가구의 기준 중위소득, 총재산가액, 무주택·분리거주 여부를",
    "provenance_shard": "reference",
    "source_ids": [
      "source.korea.youth-monthly-rent.2026",
      "source.myhome.youth-monthly-rent.2026",
      "source.govkr.basic-livelihood-benefit"
    ]
  },
  "search_shard": "reference",
  "search_position": 169,
  "legacy_compatibility_dates": [
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
      "value": "최종수정일 2026-02-09"
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
      "value": "최종수정일 2026-02-09"
    }
  ],
  "record_checksum": "sha256:2781cb9ab64628ec8f4fe413783e96a5eebc5a5fc5af789b3bcef3462eb95327"
}
---

# 청년월세 소득·재산 요건

청년월세지원에서 청년가구와 원가구의 기준 중위소득, 총재산가액, 무주택·분리거주 여부를 함께 판단하는 규칙입니다.
