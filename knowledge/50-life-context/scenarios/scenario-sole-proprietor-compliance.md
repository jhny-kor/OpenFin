---
{
  "id": "scenario.sole-proprietor.compliance",
  "title": "개인사업자 신고 경로",
  "type": "scenario",
  "description": "개인사업자가 사업자등록, 부가가치세 과세유형, 원천세, 종합소득세 신고를 순서대로 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.user-scenarios"
  ],
  "children": [],
  "related": [
    "category.business-tax-compliance",
    "tax.value-added",
    "tax.income.comprehensive"
  ],
  "terms": [
    "term.general-vat-taxpayer",
    "term.simple-vat-taxpayer",
    "term.withholding-obligor"
  ],
  "deadlines": [
    "deadline.business-registration.application",
    "deadline.vat.periodic",
    "deadline.withholding.monthly",
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.business-registration.application",
    "source.nts.vat.filing-duty",
    "source.nts.withholding.deadlines",
    "source.nts.income-tax.deadline"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "business"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "사업자등록",
      "target": "filing.business-registration",
      "reason": "사업 개시 전 또는 개시일부터 20일 이내 등록하고 과세유형 선택을 확인합니다."
    },
    {
      "order": 2,
      "label": "부가가치세 과세유형",
      "target": "tax.value-added",
      "reason": "일반과세자·간이과세자 기준, 납부면제, 예정신고 예외를 매출 기준으로 판정합니다."
    },
    {
      "order": 3,
      "label": "원천세 반복 신고",
      "target": "filing.withholding-tax",
      "reason": "인건비나 사업소득 지급이 있으면 다음 달 10일 또는 반기별 납부 반복 규칙을 관리합니다."
    },
    {
      "order": 4,
      "label": "종합소득세 확정신고",
      "target": "filing.income-tax-return",
      "reason": "사업소득을 포함한 종합소득은 다음연도 5월 확정신고 경로로 연결합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.business-registration.application",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.business-registration.application",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
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
      "source_id": "source.nts.vat.filing-duty",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
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
      "source_id": "source.nts.income-tax.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
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
    "id": "scenario.sole-proprietor.compliance",
    "title": "개인사업자 신고 경로",
    "type": "scenario",
    "description": "개인사업자가 사업자등록, 부가가치세 과세유형, 원천세, 종합소득세 신고를 순서대로 확인하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
      "https://sc.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7702&mi=2290",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225"
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
    "search_text": "scenario.sole-proprietor.compliance 개인사업자 신고 경로 scenario 개인사업자가 사업자등록, 부가가치세 과세유형, 원천세, 종합소득세 신고를 순서대로 확인하는 경로입니다. scena",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.business-registration.application",
      "source.nts.vat.filing-duty",
      "source.nts.withholding.deadlines",
      "source.nts.income-tax.deadline"
    ]
  },
  "search_shard": "reference",
  "search_position": 473,
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
  "record_checksum": "sha256:2568386faac776af9f7652bc27745b3713851c4a824387e9fedfc694d4c24ab3"
}
---

# 개인사업자 신고 경로

개인사업자가 사업자등록, 부가가치세 과세유형, 원천세, 종합소득세 신고를 순서대로 확인하는 경로입니다.
