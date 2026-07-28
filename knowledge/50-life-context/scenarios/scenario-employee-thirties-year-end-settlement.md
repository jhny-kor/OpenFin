---
{
  "id": "scenario.employee.thirties-year-end-settlement",
  "title": "30대 직장인 연말정산 경로",
  "type": "scenario",
  "description": "30대 근로자가 카드 사용, 월세, 청약, 의료비, 기부금 등 생활비 표현에서 공식 연말정산 공제 후보로 이동하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202"
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
    "scenario.employee.year-end-settlement",
    "life-expense.card-spending",
    "life-expense.monthly-rent",
    "life-expense.housing-subscription"
  ],
  "terms": [
    "term.employee",
    "term.income-deduction",
    "term.tax-credit"
  ],
  "deadlines": [
    "deadline.year-end-settlement"
  ],
  "sources": [
    "source.nts.year-end-settlement.calculation",
    "source.nts.monthly-rent-credit",
    "source.nts.credit-card-deduction"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "employee",
    "life-language"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "근로자 여부",
      "target": "term.employee",
      "reason": "연말정산 대상 근로소득자인지 먼저 확인합니다."
    },
    {
      "order": 2,
      "label": "카드값",
      "target": "life-expense.card-spending",
      "reason": "총급여 25% 초과 여부와 결제수단별 공제율을 확인합니다."
    },
    {
      "order": 3,
      "label": "월세·방값",
      "target": "life-expense.monthly-rent",
      "reason": "무주택, 소득, 전입신고, 주택요건과 필요서류를 확인합니다."
    },
    {
      "order": 4,
      "label": "청약통장",
      "target": "life-expense.housing-subscription",
      "reason": "총급여 7,000만원 이하 근로자와 무주택 세대 요건을 확인합니다."
    },
    {
      "order": 5,
      "label": "회사 제출",
      "target": "application-channel.company-year-end-settlement",
      "reason": "간소화 자료와 누락 증빙을 회사 연말정산 경로로 제출합니다."
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
      "source_id": "source.nts.monthly-rent-credit",
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
      "source_id": "source.nts.credit-card-deduction",
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
    "id": "scenario.employee.thirties-year-end-settlement",
    "title": "30대 직장인 연말정산 경로",
    "type": "scenario",
    "description": "30대 근로자가 카드 사용, 월세, 청약, 의료비, 기부금 등 생활비 표현에서 공식 연말정산 공제 후보로 이동하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794&mi=2202"
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
    "search_text": "scenario.employee.thirties-year-end-settlement 30대 직장인 연말정산 경로 scenario 30대 근로자가 카드 사용, 월세, 청약, 의료비, 기부금 등 생활비 표현에서 공식 연",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.year-end-settlement.calculation",
      "source.nts.monthly-rent-credit",
      "source.nts.credit-card-deduction"
    ]
  },
  "search_shard": "reference",
  "search_position": 459,
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
  "record_checksum": "sha256:0121c8bae2374ab9a10fe3bed1c205d03b6b89b0b1578b2adc78141eaccab749"
}
---

# 30대 직장인 연말정산 경로

30대 근로자가 카드 사용, 월세, 청약, 의료비, 기부금 등 생활비 표현에서 공식 연말정산 공제 후보로 이동하는 경로입니다.
