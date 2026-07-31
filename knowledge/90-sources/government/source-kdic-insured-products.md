---
{
  "id": "source.kdic.insured-products",
  "title": "예금보험공사 예금자보호 금융상품",
  "type": "source",
  "description": "금융회사별 예금자보호 대상 금융상품명, 금융회사명, 상품판매중단일자, 등록일을 제공하는 예금자보호 리스크 보강 API 후보입니다.",
  "basis_year": null,
  "parents": [],
  "children": [],
  "related": [],
  "terms": [],
  "deadlines": [],
  "sources": [],
  "tags": [
    "official-source",
    "finance-source"
  ],
  "url": "https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y",
  "basis_date": "2026-07-03T00:00:00.000Z",
  "source_urls": [
    "https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y"
  ],
  "source_basis_dates": [
    "2026-07-03T00:00:00.000Z"
  ],
  "provenance_shard": "reference",
  "publisher": "예금보험공사",
  "authority_class": "government_official",
  "domains": [
    "finance-reference"
  ],
  "urls": {
    "canonical": "https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y",
    "api": "https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y",
    "documentation": null
  },
  "access": {
    "method": "api",
    "parser_id": "api:source-kdic-insured-products",
    "requires_secret": true,
    "request_url": "https://apis.data.go.kr/B190017/service/GetInsuredProductService202008/getProductList202008",
    "request_query": {
      "pageNo": 1,
      "numOfRows": 1,
      "_type": "json"
    },
    "credential_env": "DATA_GO_KR_SERVICE_KEY",
    "credential_query_param": "serviceKey"
  },
  "refresh": {
    "sla_hours": 168,
    "change_detection": "http-checksum"
  },
  "usage_terms": {
    "license_or_terms": "이용조건 미확인 - 원문 이용약관 검토 필요",
    "terms_status": "review_required",
    "raw_snapshot_allowed": false
  },
  "recommendation_eligible": false,
  "status": "active",
  "provenance": [],
  "publication_memberships": [
    "korea-finance-reference-ontology-2026.json"
  ],
  "search_projection": {
    "id": "source.kdic.insured-products",
    "title": "예금보험공사 예금자보호 금융상품",
    "type": "source",
    "description": "금융회사별 예금자보호 대상 금융상품명, 금융회사명, 상품판매중단일자, 등록일을 제공하는 예금자보호 리스크 보강 API 후보입니다.",
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
    "export_id": "finance-reference-ontology",
    "source_checksum": null,
    "source_urls": [
      "https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y"
    ],
    "source_basis_dates": [
      "2026-07-03T00:00:00.000Z"
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
    "search_text": "source.kdic.insured-products 예금보험공사 예금자보호 금융상품 source 금융회사별 예금자보호 대상 금융상품명, 금융회사명, 상품판매중단일자, 등록일을 제공하는 예금자보호 리스크 보강 api ",
    "provenance_shard": "reference",
    "source_ids": []
  },
  "search_shard": "reference",
  "search_position": 532,
  "legacy_compatibility_dates": [
    {
      "path": [
        "basis_date"
      ],
      "value": "2026-07-03 확인"
    },
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-07-03 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-07-03 확인"
    }
  ],
  "record_checksum": "sha256:b1671ba75eb0c0d24e3bc97c0bedcd6f6476006d46c5d9dfe760250ce09b6445"
}
---

# 예금보험공사 예금자보호 금융상품

금융회사별 예금자보호 대상 금융상품명, 금융회사명, 상품판매중단일자, 등록일을 제공하는 예금자보호 리스크 보강 API 후보입니다.
