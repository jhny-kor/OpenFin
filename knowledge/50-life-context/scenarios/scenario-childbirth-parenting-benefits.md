---
{
  "id": "scenario.childbirth-parenting-benefits",
  "title": "출산·양육 지원금 판단 경로",
  "type": "scenario",
  "description": "출산 또는 육아 지원을 묻는 사용자가 첫만남이용권, 부모급여, 아동수당을 출생순위와 아동 월령 기준으로 확인하는 경로입니다.",
  "folder": "70_Scenarios",
  "parents": [
    "category.user-scenarios"
  ],
  "related": [
    "life-event.childbirth-parenting",
    "support.first-meeting-voucher",
    "support.parent-benefit",
    "support.child-allowance"
  ],
  "sources": [
    "source.mohw.first-meeting-voucher",
    "source.mohw.parent-benefit.2026",
    "source.mohw.child-allowance.2026"
  ],
  "tags": [
    "scenario",
    "childcare",
    "support",
    "custom-overlay"
  ],
  "path_steps": [
    {
      "order": 1,
      "label": "생활사건 분류",
      "target": "life-event.childbirth-parenting",
      "reason": "출산지원금·부모급여·아동수당 표현을 공식 지원 후보로 연결합니다."
    },
    {
      "order": 2,
      "label": "출생 확인",
      "target": "required-document.birth-registration",
      "reason": "출생신고와 주민등록번호 부여 여부를 확인합니다."
    },
    {
      "order": 3,
      "label": "첫만남이용권",
      "target": "support.first-meeting-voucher",
      "reason": "첫째 200만원, 둘째 이상 300만원 바우처를 확인합니다."
    },
    {
      "order": 4,
      "label": "부모급여·아동수당",
      "target": "support.parent-benefit",
      "reason": "0~23개월 부모급여와 만 9세 미만 아동수당을 나이 기준으로 확인합니다."
    },
    {
      "order": 5,
      "label": "복지로 신청",
      "target": "application-channel.bokjiro",
      "reason": "온라인 복지로 또는 주민센터 신청으로 연결합니다."
    }
  ],
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.mohw.go.kr/menu.es?mid=a10711020100",
    "https://www.mohw.go.kr/menu.es?mid=a10711030600",
    "https://www.mohw.go.kr/menu.es?mid=a10711030100"
  ],
  "source_basis_dates": [
    "2026-05-04T00:00:00.000Z",
    "2026-03-25T00:00:00.000Z",
    "2026-03-31T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "children": [],
  "terms": [],
  "deadlines": [],
  "law_reference": "",
  "provenance_shard": "reference",
  "source_registry_id": "source.mohw.first-meeting-voucher",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.mohw.first-meeting-voucher",
      "original_url": "https://www.mohw.go.kr/menu.es?mid=a10711020100",
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
      "source_id": "source.mohw.parent-benefit.2026",
      "original_url": "https://www.mohw.go.kr/menu.es?mid=a10711020100",
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
      "source_id": "source.mohw.child-allowance.2026",
      "original_url": "https://www.mohw.go.kr/menu.es?mid=a10711020100",
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
    "id": "scenario.childbirth-parenting-benefits",
    "title": "출산·양육 지원금 판단 경로",
    "type": "scenario",
    "description": "출산 또는 육아 지원을 묻는 사용자가 첫만남이용권, 부모급여, 아동수당을 출생순위와 아동 월령 기준으로 확인하는 경로입니다.",
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
      "https://www.mohw.go.kr/menu.es?mid=a10711020100",
      "https://www.mohw.go.kr/menu.es?mid=a10711030600",
      "https://www.mohw.go.kr/menu.es?mid=a10711030100"
    ],
    "source_basis_dates": [
      "2026-05-04T00:00:00.000Z",
      "2026-03-25T00:00:00.000Z",
      "2026-03-31T00:00:00.000Z"
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
    "search_text": "scenario.childbirth-parenting-benefits 출산·양육 지원금 판단 경로 scenario 출산 또는 육아 지원을 묻는 사용자가 첫만남이용권, 부모급여, 아동수당을 출생순위와 아동 월령 기준으",
    "provenance_shard": "reference",
    "source_ids": [
      "source.mohw.first-meeting-voucher",
      "source.mohw.parent-benefit.2026",
      "source.mohw.child-allowance.2026"
    ]
  },
  "search_shard": "reference",
  "search_position": 455,
  "legacy_compatibility_dates": [
    {
      "path": [
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "source_basis_dates",
        1
      ],
      "value": "최종수정일 2026-03-25"
    },
    {
      "path": [
        "source_basis_dates",
        2
      ],
      "value": "최종수정일 2026-03-31"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        0
      ],
      "value": "2026-05-04 확인"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        1
      ],
      "value": "최종수정일 2026-03-25"
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "최종수정일 2026-03-31"
    }
  ],
  "record_checksum": "sha256:b55a39f348d6bf70ff00cb1c043efd6b029f48eb8828533bfaa0888a8f72b862"
}
---

# 출산·양육 지원금 판단 경로

출산 또는 육아 지원을 묻는 사용자가 첫만남이용권, 부모급여, 아동수당을 출생순위와 아동 월령 기준으로 확인하는 경로입니다.
