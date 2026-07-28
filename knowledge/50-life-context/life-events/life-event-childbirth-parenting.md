---
{
  "id": "life-event.childbirth-parenting",
  "title": "출산·육아 지원",
  "type": "life-event",
  "description": "아기 태어남, 출산지원금, 육아수당, 부모급여처럼 출생·영아·아동 양육 단계에서 받을 수 있는 지원금을 찾는 생활사건입니다.",
  "folder": "80_LifeLanguage/Events",
  "parents": [
    "category.life-events"
  ],
  "related": [
    "support.first-meeting-voucher",
    "support.parent-benefit",
    "support.child-allowance",
    "application-channel.bokjiro",
    "scenario.childbirth-parenting-benefits"
  ],
  "sources": [
    "source.mohw.first-meeting-voucher",
    "source.mohw.parent-benefit.2026",
    "source.mohw.child-allowance.2026"
  ],
  "tags": [
    "life-language",
    "childcare",
    "support",
    "custom-overlay"
  ],
  "life_phrases": [
    "출산지원금",
    "아기 지원금",
    "육아수당",
    "부모급여",
    "아동수당",
    "첫만남이용권",
    "애기 낳았어요",
    "아이 키우는 지원"
  ],
  "official_candidates": [
    {
      "target": "support.first-meeting-voucher",
      "confidence": 0.86,
      "confidence_label": "높음",
      "reason": "출산지원금·첫만남 표현은 첫만남이용권 후보입니다.",
      "required_checks": [
        "출생신고",
        "출생순위",
        "사용기간",
        "국민행복카드"
      ]
    },
    {
      "target": "support.parent-benefit",
      "confidence": 0.84,
      "confidence_label": "높음",
      "reason": "0~23개월 영아 양육비 표현은 부모급여 후보입니다.",
      "required_checks": [
        "아동 월령",
        "현금 또는 바우처 지급 방식",
        "복지로 신청"
      ]
    },
    {
      "target": "support.child-allowance",
      "confidence": 0.78,
      "confidence_label": "중간",
      "reason": "아동수당·아이 지원 표현은 만 9세 미만 아동수당 후보입니다.",
      "required_checks": [
        "아동 나이",
        "지역별 지급액",
        "신청 경로"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "아동이 출생신고되어 주민등록번호를 부여받았나요?",
      "answer_type": "boolean",
      "target": "required-document.birth-registration",
      "criterion": "출생확인"
    },
    {
      "order": 2,
      "question": "첫째아인가요, 둘째 이상인가요?",
      "answer_type": "choice",
      "target": "support.first-meeting-voucher",
      "criterion": "출생순위"
    },
    {
      "order": 3,
      "question": "아동이 0~23개월인가요?",
      "answer_type": "boolean",
      "target": "support.parent-benefit",
      "criterion": "부모급여"
    },
    {
      "order": 4,
      "question": "아동이 만 9세 미만인가요?",
      "answer_type": "boolean",
      "target": "support.child-allowance",
      "criterion": "아동수당"
    },
    {
      "order": 5,
      "question": "복지로 또는 행정복지센터 신청 경로를 선택했나요?",
      "answer_type": "choice",
      "target": "application-channel.bokjiro",
      "criterion": "신청경로"
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
    "id": "life-event.childbirth-parenting",
    "title": "출산·육아 지원",
    "type": "life-event",
    "description": "아기 태어남, 출산지원금, 육아수당, 부모급여처럼 출생·영아·아동 양육 단계에서 받을 수 있는 지원금을 찾는 생활사건입니다.",
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
    "search_text": "life-event.childbirth-parenting 출산·육아 지원 life-event 아기 태어남, 출산지원금, 육아수당, 부모급여처럼 출생·영아·아동 양육 단계에서 받을 수 있는 지원금을 찾는 생활사건입니다",
    "provenance_shard": "reference",
    "source_ids": [
      "source.mohw.first-meeting-voucher",
      "source.mohw.parent-benefit.2026",
      "source.mohw.child-allowance.2026"
    ]
  },
  "search_shard": "reference",
  "search_position": 415,
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
  "record_checksum": "sha256:fa876fd3c670feeea4ac09ab2b9d7a10ab3b98bce6e4e5aea542fc83741d26f3",
  "available_in": [
    "application-channel.bokjiro"
  ]
}
---

# 출산·육아 지원

아기 태어남, 출산지원금, 육아수당, 부모급여처럼 출생·영아·아동 양육 단계에서 받을 수 있는 지원금을 찾는 생활사건입니다.
