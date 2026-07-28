---
{
  "id": "scenario.monthly-rent-tenant-credit",
  "title": "월세 거주자 세액공제 경로",
  "type": "scenario",
  "description": "자취방·원룸 월세를 낸 근로자가 월세액 세액공제 적용 가능성과 필요서류를 판단하는 경로입니다.",
  "folder": "70_Scenarios",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
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
    "life-expense.monthly-rent",
    "credit.monthly-rent",
    "conflict-rule.monthly-rent-household-duplicate"
  ],
  "terms": [],
  "deadlines": [],
  "sources": [
    "source.nts.monthly-rent-credit"
  ],
  "law_reference": "",
  "tags": [
    "scenario",
    "monthly-rent",
    "tenant"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "생활어 입력",
      "target": "life-expense.monthly-rent",
      "reason": "월세·방값 표현을 월세액 세액공제 후보로 매핑합니다."
    },
    {
      "order": 2,
      "label": "공식 항목",
      "target": "credit.monthly-rent",
      "reason": "총급여, 종합소득금액, 주택, 공제율, 한도를 확인합니다."
    },
    {
      "order": 3,
      "label": "주소·무주택",
      "target": "eligibility-rule.monthly-rent-address-match",
      "reason": "전입신고와 주소 일치, 무주택 세대 요건을 확인합니다."
    },
    {
      "order": 4,
      "label": "필요서류",
      "target": "required-document.rent-payment-proof",
      "reason": "주민등록표등본, 임대차계약서, 지급 증빙을 준비합니다."
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.monthly-rent-credit",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.monthly-rent-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
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
    "id": "scenario.monthly-rent-tenant-credit",
    "title": "월세 거주자 세액공제 경로",
    "type": "scenario",
    "description": "자취방·원룸 월세를 낸 근로자가 월세액 세액공제 적용 가능성과 필요서류를 판단하는 경로입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
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
    "search_text": "scenario.monthly-rent-tenant-credit 월세 거주자 세액공제 경로 scenario 자취방·원룸 월세를 낸 근로자가 월세액 세액공제 적용 가능성과 필요서류를 판단하는 경로입니다. scenari",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.monthly-rent-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 467,
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
  "record_checksum": "sha256:f33211dd0acfc228dac5dc54cf3d15ec5fb3043388e844e2e96c661b4f346a8b"
}
---

# 월세 거주자 세액공제 경로

자취방·원룸 월세를 낸 근로자가 월세액 세액공제 적용 가능성과 필요서류를 판단하는 경로입니다.
