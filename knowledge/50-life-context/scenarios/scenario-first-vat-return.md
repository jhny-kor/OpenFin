---
{
  "id": "scenario.first-vat-return",
  "title": "개인사업자 첫 부가세 신고 경로",
  "type": "scenario",
  "description": "처음 부가가치세를 신고하는 개인사업자가 사업자등록, 과세유형, 신고기한, 홈택스 제출을 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444"
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
    "life-event.first-vat-return",
    "filing.vat-return",
    "concept.simple-vat-taxpayer"
  ],
  "terms": [],
  "deadlines": [
    "deadline.vat.periodic",
    "deadline.vat.simplified.annual"
  ],
  "sources": [
    "source.nts.vat.filing-duty",
    "source.nts.business-registration.application"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "vat",
    "business"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "생활사건",
      "target": "life-event.first-vat-return",
      "reason": "첫 부가세 신고 표현을 신고 절차 후보로 매핑합니다."
    },
    {
      "order": 2,
      "label": "과세유형",
      "target": "eligibility-rule.vat-taxpayer-type",
      "reason": "일반과세자·간이과세자·납부의무 면제를 매출 기준으로 판단합니다."
    },
    {
      "order": 3,
      "label": "신고기한",
      "target": "filing.vat-return",
      "reason": "과세기간별 신고·납부 기한을 확인합니다."
    },
    {
      "order": 4,
      "label": "홈택스",
      "target": "application-channel.hometax-vat",
      "reason": "전자 신고 채널로 연결합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.vat.filing-duty",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.vat.filing-duty",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
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
      "source_id": "source.nts.business-registration.application",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
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
    "id": "scenario.first-vat-return",
    "title": "개인사업자 첫 부가세 신고 경로",
    "type": "scenario",
    "description": "처음 부가가치세를 신고하는 개인사업자가 사업자등록, 과세유형, 신고기한, 홈택스 제출을 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444"
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
    "search_text": "scenario.first-vat-return 개인사업자 첫 부가세 신고 경로 scenario 처음 부가가치세를 신고하는 개인사업자가 사업자등록, 과세유형, 신고기한, 홈택스 제출을 확인하는 경로입니다. scenar",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.vat.filing-duty",
      "source.nts.business-registration.application"
    ]
  },
  "search_shard": "reference",
  "search_position": 461,
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
  "record_checksum": "sha256:beeaac37bc35d7fa49f08ced79a23d4b520bdf972e9fcf9aac724070d8a3551f"
}
---

# 개인사업자 첫 부가세 신고 경로

처음 부가가치세를 신고하는 개인사업자가 사업자등록, 과세유형, 신고기한, 홈택스 제출을 확인하는 경로입니다.
