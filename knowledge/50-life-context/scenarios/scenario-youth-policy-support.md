---
{
  "id": "scenario.youth-policy-support",
  "title": "청년 정책지원 탐색 경로",
  "type": "scenario",
  "description": "청년 사용자가 자산형성, 주거금융, 서민금융 지원의 나이·소득·재산·한도 기준을 비교하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.fsc.go.kr/no040101?cnId=2983",
    "https://ylaccount.kinfa.or.kr/main",
    "https://www.kinfa.or.kr/financialProduct/hessalLoanYoos.do",
    "https://www.hf.go.kr/ko/sub02/sub02_01_04.do"
  ],
  "source_basis_dates": [
    "2025-12-11",
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.user-scenarios"
  ],
  "children": [],
  "related": [
    "support.youth-future-savings",
    "support.youth-leap-account",
    "support.hessal-loan-youth",
    "support.youth-special-rent-guarantee",
    "scenario.homeless-youth-support"
  ],
  "terms": [
    "term.policy-finance",
    "term.policy-loan",
    "term.eligibility-threshold",
    "term.median-income"
  ],
  "deadlines": [],
  "sources": [
    "source.fsc.youth-future-savings",
    "source.kinfa.youth-leap",
    "source.kinfa.hessal-loan-youth",
    "source.hf.special-rent-guarantee"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "youth",
    "policy-support"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "자산형성 계좌",
      "target": "support.youth-future-savings",
      "reason": "2026년 출시 예정 청년미래적금의 나이, 개인소득, 가구소득, 납입한도와 기여금 기준을 확인합니다."
    },
    {
      "order": 2,
      "label": "청년도약계좌",
      "target": "support.youth-leap-account",
      "reason": "개인소득, 가구소득, 금융소득종합과세 제외 요건을 확인합니다."
    },
    {
      "order": 3,
      "label": "청년 서민금융",
      "target": "support.hessal-loan-youth",
      "reason": "만 19~34세와 연소득 기준, 동일인 보증한도 및 용도별 한도를 확인합니다."
    },
    {
      "order": 4,
      "label": "전세자금보증",
      "target": "support.youth-special-rent-guarantee",
      "reason": "무주택 청년의 나이, 소득, 보증한도 기준을 확인합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.fsc.youth-future-savings",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.fsc.youth-future-savings",
      "original_url": "https://www.fsc.go.kr/no040101?cnId=2983",
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
        "path_steps",
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
      "source_id": "source.kinfa.youth-leap",
      "original_url": "https://ylaccount.kinfa.or.kr/main",
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
        "path_steps",
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
      "source_id": "source.kinfa.hessal-loan-youth",
      "original_url": "https://www.kinfa.or.kr/financialProduct/hessalLoanYoos.do",
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
        "path_steps",
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
      "source_id": "source.hf.special-rent-guarantee",
      "original_url": "https://www.hf.go.kr/ko/sub02/sub02_01_04.do",
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
        "path_steps",
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
    "id": "scenario.youth-policy-support",
    "title": "청년 정책지원 탐색 경로",
    "type": "scenario",
    "description": "청년 사용자가 자산형성, 주거금융, 서민금융 지원의 나이·소득·재산·한도 기준을 비교하는 경로입니다.",
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
      "https://www.fsc.go.kr/no040101?cnId=2983",
      "https://ylaccount.kinfa.or.kr/main",
      "https://www.kinfa.or.kr/financialProduct/hessalLoanYoos.do",
      "https://www.hf.go.kr/ko/sub02/sub02_01_04.do"
    ],
    "source_basis_dates": [
      "2025-12-11",
      "2026-05-02T00:00:00.000Z"
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
    "search_text": "scenario.youth-policy-support 청년 정책지원 탐색 경로 scenario 청년 사용자가 자산형성, 주거금융, 서민금융 지원의 나이·소득·재산·한도 기준을 비교하는 경로입니다. scenario y",
    "provenance_shard": "reference",
    "source_ids": [
      "source.fsc.youth-future-savings",
      "source.kinfa.youth-leap",
      "source.kinfa.hessal-loan-youth",
      "source.hf.special-rent-guarantee"
    ]
  },
  "search_shard": "reference",
  "search_position": 476,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-02 확인"
    }
  ],
  "record_checksum": "sha256:934a7b679dceb11a4a2b9ca85615c91883eb7a61be7ea7a9de815641c42699a4"
}
---

# 청년 정책지원 탐색 경로

청년 사용자가 자산형성, 주거금융, 서민금융 지원의 나이·소득·재산·한도 기준을 비교하는 경로입니다.
