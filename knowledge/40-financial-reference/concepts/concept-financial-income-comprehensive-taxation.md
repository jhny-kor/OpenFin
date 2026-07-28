---
{
  "id": "concept.financial-income-comprehensive-taxation",
  "title": "금융소득 종합과세 확인",
  "type": "concept",
  "description": "이자·배당소득이 원천징수로 끝나는지, 종합소득 과세표준에 합산되는지 판단하는 금융소득 확인 노드입니다.",
  "folder": "40_Terms/Concepts",
  "parents": [
    "tax.income.comprehensive"
  ],
  "related": [
    "support.youth-leap-account",
    "support.isa",
    "tax.income.comprehensive"
  ],
  "terms": [
    "term.total-income"
  ],
  "sources": [
    "source.nts.income-tax.overview",
    "source.nts.financial-income"
  ],
  "criteria": [
    {
      "label": "원천징수된 금융소득",
      "basis": "이자·배당소득 지급 방식",
      "condition": "원천징수된 경우 분리과세 또는 종합과세 여부 확인",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.financial-income",
      "criteria_kind": "reference",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.financial-income"
    },
    {
      "label": "원천징수되지 않은 금융소득",
      "basis": "이자·배당소득 지급 방식",
      "condition": "원천징수되지 않은 경우 종합소득 과세표준에 합산",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.financial-income",
      "criteria_kind": "reference",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.nts.financial-income"
    }
  ],
  "tags": [
    "concept",
    "financial-income",
    "custom-overlay"
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7666&mi=2224",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7896&mi=6471"
  ],
  "source_basis_dates": [
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.income-tax.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.income-tax.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7666&mi=2224",
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
      "source_id": "source.nts.financial-income",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7666&mi=2224",
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
    "id": "concept.financial-income-comprehensive-taxation",
    "title": "금융소득 종합과세 확인",
    "type": "concept",
    "description": "이자·배당소득이 원천징수로 끝나는지, 종합소득 과세표준에 합산되는지 판단하는 금융소득 확인 노드입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7666&mi=2224",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7896&mi=6471"
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
    "search_text": "concept.financial-income-comprehensive-taxation 금융소득 종합과세 확인 concept 이자·배당소득이 원천징수로 끝나는지, 종합소득 과세표준에 합산되는지 판단하는 금융소득 확인 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.income-tax.overview",
      "source.nts.financial-income"
    ]
  },
  "search_shard": "reference",
  "search_position": 71,
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
  "record_checksum": "sha256:b97fc777a32f087f232618dfcb6d35298c31db02884fad8cc3d67ea6c930756e"
}
---

# 금융소득 종합과세 확인

이자·배당소득이 원천징수로 끝나는지, 종합소득 과세표준에 합산되는지 판단하는 금융소득 확인 노드입니다.
