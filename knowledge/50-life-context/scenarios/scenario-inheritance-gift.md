---
{
  "id": "scenario.inheritance-gift",
  "title": "상속·증여 신고 경로",
  "type": "scenario",
  "description": "상속인 또는 수증자가 과세표준, 세율, 신고기한을 순서대로 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7957&mi=6529",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7727&mi=2339",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7960&mi=2227"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.user-scenarios"
  ],
  "children": [],
  "related": [
    "tax.inheritance",
    "tax.gift"
  ],
  "terms": [
    "term.heir",
    "term.donee",
    "term.tax-rate",
    "term.deadline"
  ],
  "deadlines": [
    "deadline.inheritance.resident",
    "deadline.inheritance.nonresident",
    "deadline.gift.general"
  ],
  "sources": [
    "source.nts.inheritance.overview",
    "source.nts.inheritance.rates",
    "source.nts.gift.deadline",
    "source.nts.gift.rates"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "inheritance",
    "gift"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "상속·증여 유형 구분",
      "target": "tax.inheritance-and-gift",
      "reason": "사망에 따른 이전인지 생전 무상이전인지에 따라 납세의무자와 신고기한이 달라집니다."
    },
    {
      "order": 2,
      "label": "세율표 확인",
      "target": "tax.inheritance-and-gift",
      "reason": "상속세와 증여세는 같은 5단계 초과누진세율 구조를 사용합니다."
    },
    {
      "order": 3,
      "label": "상속세 신고기한",
      "target": "filing.inheritance-tax-return",
      "reason": "거주자 6개월, 비거주자 9개월 기한을 상속개시일이 속하는 달의 말일부터 계산합니다."
    },
    {
      "order": 4,
      "label": "증여세 신고기한",
      "target": "filing.gift-tax-return",
      "reason": "일반 증여는 증여받은 날이 속하는 달의 말일부터 3개월 이내 신고합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.inheritance.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.inheritance.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
      "source_id": "source.nts.inheritance.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
      "source_id": "source.nts.gift.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
      "source_id": "source.nts.gift.rates",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
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
    "id": "scenario.inheritance-gift",
    "title": "상속·증여 신고 경로",
    "type": "scenario",
    "description": "상속인 또는 수증자가 과세표준, 세율, 신고기한을 순서대로 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7719&mi=2324",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7957&mi=6529",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7727&mi=2339",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7960&mi=2227"
    ],
    "source_basis_dates": [
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
    "search_text": "scenario.inheritance-gift 상속·증여 신고 경로 scenario 상속인 또는 수증자가 과세표준, 세율, 신고기한을 순서대로 확인하는 경로입니다. scenario inheritance gift so",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.inheritance.overview",
      "source.nts.inheritance.rates",
      "source.nts.gift.deadline",
      "source.nts.gift.rates"
    ]
  },
  "search_shard": "reference",
  "search_position": 465,
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
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-02 확인"
    }
  ],
  "record_checksum": "sha256:96829fcf05fc6893c27f9f587a3629aefd3f5f8df5ed956a3b10b45c49168847"
}
---

# 상속·증여 신고 경로

상속인 또는 수증자가 과세표준, 세율, 신고기한을 순서대로 확인하는 경로입니다.
