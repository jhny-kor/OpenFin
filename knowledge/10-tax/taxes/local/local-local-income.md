---
{
  "id": "local.local-income",
  "title": "지방소득세",
  "type": "tax",
  "description": "소득세·법인세 과세표준이 되는 소득과 연결되는 지방 보통세입니다.",
  "folder": "10_Taxes/Local",
  "basis_year": 2026,
  "effective_date": "2026-02-05",
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
    "https://www.law.go.kr/법령/지방세법"
  ],
  "source_basis_dates": [
    "2026-02-05T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.local-ordinary-taxes"
  ],
  "children": [],
  "related": [
    "tax.income",
    "tax.corporate"
  ],
  "terms": [
    "term.local-tax"
  ],
  "deadlines": [],
  "sources": [
    "source.local-tax-framework-act.2026.article8",
    "source.law.local-tax-act.rates"
  ],
  "law_reference": "지방세기본법 제8조",
  "tags": [
    "local-tax"
  ],
  "criteria": [
    {
      "label": "지방소득세 산식",
      "basis": "개인·법인 소득 과세표준",
      "condition": "소득세·법인세와 연결",
      "amount_formula": "지방소득세 과세표준 × 지방세법상 세율",
      "source": "source.law.local-tax-act.rates",
      "criteria_kind": "formula",
      "basis_category": "tax-base",
      "basis_definition": "공제와 필요경비 등을 반영한 뒤 세율을 적용하는 최종 세액 계산 기준금액입니다.",
      "basis_lookup": "해당 세목의 신고서, 계산명세서, 국세청 세율 안내에서 확인합니다.",
      "selection_rule": "구간별 하한·상한을 비교해 해당 과세표준이 들어가는 세율 구간을 선택하고 누진공제액을 함께 적용합니다.",
      "basis_source": "source.law.local-tax-act.rates",
      "law_reference": "지방세기본법 제8조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "소득세·법인세와 연결"
      ],
      "required_documents": [],
      "filing_deadlines": [],
      "law_references": [
        "지방세기본법 제8조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "tax",
    "applicable_year": 2026,
    "law_reference": "지방세기본법 제8조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.local-tax-framework-act.2026.article8",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.local-tax-framework-act.2026.article8",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
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
      "valid_from": "2026-02-05T00:00:00.000Z",
      "valid_to": null,
      "checksum": null,
      "checksum_scope": null,
      "verification_status": "reference_only"
    },
    {
      "source_id": "source.law.local-tax-act.rates",
      "original_url": "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "basis_year",
        "effective_date",
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
      "valid_from": "2026-02-05T00:00:00.000Z",
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
    "id": "local.local-income",
    "title": "지방소득세",
    "type": "tax",
    "description": "소득세·법인세 과세표준이 되는 소득과 연결되는 지방 보통세입니다.",
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
      "https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000903169",
      "https://www.law.go.kr/법령/지방세법"
    ],
    "source_basis_dates": [
      "2026-02-05T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z"
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
    "search_text": "local.local-income 지방소득세 tax 소득세·법인세 과세표준이 되는 소득과 연결되는 지방 보통세입니다. 지방세기본법 제8조 local-tax source.local-tax-framework-act.20",
    "provenance_shard": "reference",
    "source_ids": [
      "source.local-tax-framework-act.2026.article8",
      "source.law.local-tax-act.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 432,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-02-05"
    },
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-03 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "시행 2026-02-05"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "2026-05-03 확인"
    }
  ],
  "record_checksum": "sha256:fd0fc4ee0e1b363745b4cf7d54bf1d4263abdca5fa6edddc671fdf36b0c553da"
}
---

# 지방소득세

소득세·법인세 과세표준이 되는 소득과 연결되는 지방 보통세입니다.
