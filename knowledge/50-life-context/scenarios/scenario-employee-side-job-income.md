---
{
  "id": "scenario.employee.side-job-income",
  "title": "직장인 부업 소득 신고 경로",
  "type": "scenario",
  "description": "직장인이 근로소득 외 부업·플랫폼 소득을 얻었을 때 연말정산과 종합소득세 신고를 분리해 판단하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225"
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
    "life-income.side-job-income",
    "filing.year-end-settlement",
    "tax.income.comprehensive"
  ],
  "terms": [],
  "deadlines": [
    "deadline.year-end-settlement",
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.nts.income-tax.deadline"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "employee",
    "side-job"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "근로소득 정산",
      "target": "filing.year-end-settlement",
      "reason": "회사에서 근로소득 연말정산을 먼저 진행합니다."
    },
    {
      "order": 2,
      "label": "부업 소득 구분",
      "target": "life-income.side-job-income",
      "reason": "사업소득·기타소득·금융소득 등 근로 외 소득 종류를 구분합니다."
    },
    {
      "order": 3,
      "label": "종합소득세 합산",
      "target": "tax.income.comprehensive",
      "reason": "근로 외 소득을 다음연도 5월 신고해야 하는지 확인합니다."
    },
    {
      "order": 4,
      "label": "전자 신고",
      "target": "application-channel.hometax-income-tax",
      "reason": "필요하면 홈택스 종합소득세 신고로 연결합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.year-end-settlement.calculation",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.year-end-settlement.calculation",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
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
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
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
    "id": "scenario.employee.side-job-income",
    "title": "직장인 부업 소득 신고 경로",
    "type": "scenario",
    "description": "직장인이 근로소득 외 부업·플랫폼 소득을 얻었을 때 연말정산과 종합소득세 신고를 분리해 판단하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225"
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
    "search_text": "scenario.employee.side-job-income 직장인 부업 소득 신고 경로 scenario 직장인이 근로소득 외 부업·플랫폼 소득을 얻었을 때 연말정산과 종합소득세 신고를 분리해 판단하는 경로입니다. ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.nts.income-tax.deadline"
    ]
  },
  "search_shard": "reference",
  "search_position": 458,
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
  "record_checksum": "sha256:d6e68029a18a106dfb0434223679e609f95592511b54acb228c096d4f4a1f3b5"
}
---

# 직장인 부업 소득 신고 경로

직장인이 근로소득 외 부업·플랫폼 소득을 얻었을 때 연말정산과 종합소득세 신고를 분리해 판단하는 경로입니다.
