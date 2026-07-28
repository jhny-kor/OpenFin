---
{
  "id": "scenario.dual-income-personal-deduction",
  "title": "맞벌이 부부 인적공제 판단 경로",
  "type": "scenario",
  "description": "맞벌이 부부가 배우자·부양가족 기본공제, 자녀, 의료비·교육비·기부금 공제를 누구에게 배분할지 판단하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438"
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
    "deduction.personal",
    "credit.child",
    "credit.medical-expense",
    "credit.education-expense",
    "credit.donation"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.nts.year-end-settlement.special-credit"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "employee",
    "dual-income"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "부양가족 소득요건",
      "target": "deduction.personal.basic",
      "reason": "연간 소득금액 100만원 이하 등 기본공제 대상 여부를 먼저 확인합니다."
    },
    {
      "order": 2,
      "label": "자녀 공제",
      "target": "credit.child",
      "reason": "자녀 세액공제를 어느 근로자가 적용할지 확인합니다."
    },
    {
      "order": 3,
      "label": "특별세액공제",
      "target": "credit.special-tax",
      "reason": "의료비·교육비·기부금의 지출자와 대상자 요건을 확인합니다."
    },
    {
      "order": 4,
      "label": "회사 제출",
      "target": "application-channel.company-year-end-settlement",
      "reason": "배분 결과에 맞게 각 회사 연말정산 자료를 제출합니다."
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
      "source_id": "source.nts.year-end-settlement.special-credit",
      "original_url": "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438",
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
    "id": "scenario.dual-income-personal-deduction",
    "title": "맞벌이 부부 인적공제 판단 경로",
    "type": "scenario",
    "description": "맞벌이 부부가 배우자·부양가족 기본공제, 자녀, 의료비·교육비·기부금 공제를 누구에게 배분할지 판단하는 경로입니다.",
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
      "https://kids.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6438"
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
    "search_text": "scenario.dual-income-personal-deduction 맞벌이 부부 인적공제 판단 경로 scenario 맞벌이 부부가 배우자·부양가족 기본공제, 자녀, 의료비·교육비·기부금 공제를 누구에게 배분할지 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.nts.year-end-settlement.special-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 457,
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
  "record_checksum": "sha256:153e3fcc5121625f1c8cd3352fe42511b1ad64aab52055b0f78b7a540a6e6202"
}
---

# 맞벌이 부부 인적공제 판단 경로

맞벌이 부부가 배우자·부양가족 기본공제, 자녀, 의료비·교육비·기부금 공제를 누구에게 배분할지 판단하는 경로입니다.
