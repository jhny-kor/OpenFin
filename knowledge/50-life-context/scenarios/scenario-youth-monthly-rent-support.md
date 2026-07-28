---
{
  "id": "scenario.youth-monthly-rent-support",
  "title": "청년 월세지원 판단 경로",
  "type": "scenario",
  "description": "자취 월세 부담을 말한 청년에게 월세액 세액공제와 청년월세 지원사업, 주거급여 후보를 분리해 판단하는 경로입니다.",
  "folder": "70_Scenarios",
  "parents": [
    "category.user-scenarios"
  ],
  "related": [
    "life-expense.monthly-rent-support",
    "support.youth-monthly-rent-special",
    "support.housing-benefit",
    "credit.monthly-rent"
  ],
  "sources": [
    "source.korea.youth-monthly-rent.2026",
    "source.myhome.youth-monthly-rent.2026",
    "source.nts.monthly-rent-credit"
  ],
  "tags": [
    "scenario",
    "youth",
    "housing",
    "custom-overlay"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "생활어 분류",
      "target": "life-expense.monthly-rent-support",
      "reason": "월세지원·자취 월세 표현을 세액공제와 현금성 지원 후보로 나눕니다."
    },
    {
      "order": 2,
      "label": "청년월세 지원",
      "target": "support.youth-monthly-rent-special",
      "reason": "만 19~34세, 무주택, 소득·재산, 중복지원 여부를 확인합니다."
    },
    {
      "order": 3,
      "label": "주거급여 후보",
      "target": "support.housing-benefit",
      "reason": "소득인정액이 기준 중위소득 48% 이하인지 확인합니다."
    },
    {
      "order": 4,
      "label": "월세액 세액공제",
      "target": "credit.monthly-rent",
      "reason": "근로자라면 연말정산 월세액 세액공제 조건도 별도로 판단합니다."
    },
    {
      "order": 5,
      "label": "신청 채널",
      "target": "application-channel.bokjiro",
      "reason": "복지로·행정복지센터 신청 경로로 연결합니다."
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
    "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
  ],
  "source_basis_dates": [
    "2026-03-19",
    "2026-05-04T00:00:00.000Z",
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.korea.youth-monthly-rent.2026",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.korea.youth-monthly-rent.2026",
      "original_url": "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "path_steps",
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
      "source_id": "source.myhome.youth-monthly-rent.2026",
      "original_url": "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "path_steps",
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
      "source_id": "source.nts.monthly-rent-credit",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025",
      "source_record_id": null,
      "locator": null,
      "supported_fields": [
        "title",
        "type",
        "description",
        "folder",
        "path_steps",
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
    "id": "scenario.youth-monthly-rent-support",
    "title": "청년 월세지원 판단 경로",
    "type": "scenario",
    "description": "자취 월세 부담을 말한 청년에게 월세액 세액공제와 청년월세 지원사업, 주거급여 후보를 분리해 판단하는 경로입니다.",
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
      "https://www.korea.kr/news/policyNewsView.do?newsId=148961092",
      "https://www.myhome.go.kr/hws/portal/dgn/selectSelfDiagnosisYouthHousView.do",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239025"
    ],
    "source_basis_dates": [
      "2026-03-19",
      "2026-05-04T00:00:00.000Z",
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
    "search_text": "scenario.youth-monthly-rent-support 청년 월세지원 판단 경로 scenario 자취 월세 부담을 말한 청년에게 월세액 세액공제와 청년월세 지원사업, 주거급여 후보를 분리해 판단하는 경로입니",
    "provenance_shard": "reference",
    "source_ids": [
      "source.korea.youth-monthly-rent.2026",
      "source.myhome.youth-monthly-rent.2026",
      "source.nts.monthly-rent-credit"
    ]
  },
  "search_shard": "reference",
  "search_position": 475,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "source_basis_dates",
        2
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
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "2026-05-02 확인"
    }
  ],
  "record_checksum": "sha256:b42a155a42e270e6c385a28a5891e2f7f1a093de5d620baaa3f7f54bc2de812e"
}
---

# 청년 월세지원 판단 경로

자취 월세 부담을 말한 청년에게 월세액 세액공제와 청년월세 지원사업, 주거급여 후보를 분리해 판단하는 경로입니다.
