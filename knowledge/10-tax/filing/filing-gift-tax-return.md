---
{
  "id": "filing.gift-tax-return",
  "title": "증여세 신고",
  "type": "filing",
  "description": "증여받은 날이 속하는 달의 말일부터 일반 증여 3개월 기한을 기준으로 신고·납부를 관리하는 절차입니다.",
  "folder": "50_Deadlines",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7727&mi=2339",
    "https://www.law.go.kr/법령/상속세및증여세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.filing-calendar",
    "tax.gift"
  ],
  "children": [],
  "related": [],
  "terms": [
    "term.donee",
    "term.tax-base",
    "term.deadline"
  ],
  "deadlines": [
    "deadline.gift.general"
  ],
  "sources": [
    "source.nts.gift.deadline",
    "source.law.inheritance-gift-tax-act.rates"
  ],
  "law_reference": "상속세 및 증여세법 제68조",
  "tags": [],
  "criteria": [
    {
      "label": "증여세 신고기한",
      "basis": "증여받은 날이 속하는 달의 말일",
      "condition": "일반 증여 3개월",
      "amount_applicability": "정액 금액 기준 없음",
      "source": "source.nts.gift.deadline",
      "deadline_months_after_month_end": 3,
      "criteria_kind": "deadline",
      "basis_category": "deadline-anchor",
      "basis_definition": "신고·납부 또는 신청기한을 계산할 때 출발점이 되는 날짜 또는 과세기간 기준입니다.",
      "basis_lookup": "거래일, 사업개시일, 소득 지급일, 상속·증여 발생일, 과세기간 기록과 신고 안내에서 확인합니다.",
      "selection_rule": "기준일이 속하는 달·반기·과세기간의 말일을 확정한 뒤 deadline_* 필드의 월·일·개월 규칙을 적용합니다.",
      "basis_source": "source.nts.gift.deadline",
      "law_reference": "상속세 및 증여세법 제68조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "일반 증여 3개월"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.gift.general"
      ],
      "law_references": [
        "상속세 및 증여세법 제68조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "filing",
    "applicable_year": 2026,
    "law_reference": "상속세 및 증여세법 제68조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.gift.deadline",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.gift.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7727&mi=2339",
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
      "source_id": "source.law.inheritance-gift-tax-act.rates",
      "original_url": "https://www.law.go.kr/법령/상속세및증여세법",
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
    "id": "filing.gift-tax-return",
    "title": "증여세 신고",
    "type": "filing",
    "description": "증여받은 날이 속하는 달의 말일부터 일반 증여 3개월 기한을 기준으로 신고·납부를 관리하는 절차입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7727&mi=2339",
      "https://www.law.go.kr/법령/상속세및증여세법"
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
    "search_text": "filing.gift-tax-return 증여세 신고 filing 증여받은 날이 속하는 달의 말일부터 일반 증여 3개월 기한을 기준으로 신고·납부를 관리하는 절차입니다. 상속세 및 증여세법 제68조 source.nt",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.gift.deadline",
      "source.law.inheritance-gift-tax-act.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 173,
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
  "record_checksum": "sha256:a1e3e7099266614ae6ff80614e41772a0c4181b4b0990b95b212083350057d11"
}
---

# 증여세 신고

증여받은 날이 속하는 달의 말일부터 일반 증여 3개월 기한을 기준으로 신고·납부를 관리하는 절차입니다.
