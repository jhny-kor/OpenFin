---
{
  "id": "life-event.first-vat-return",
  "title": "첫 부가세 신고",
  "type": "life-event",
  "description": "처음 사업을 시작한 사용자가 사업자등록, 일반·간이과세자 구분, 신고기한과 납부의무 면제를 순서대로 판단하는 생활사건 노드입니다.",
  "folder": "80_LifeLanguage/Events",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://www.hometax.go.kr"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.life-events"
  ],
  "children": [],
  "related": [
    "filing.business-registration",
    "filing.vat-return",
    "eligibility-rule.vat-taxpayer-type",
    "application-channel.hometax-vat",
    "scenario.first-vat-return"
  ],
  "terms": [],
  "deadlines": [
    "deadline.business-registration.application",
    "deadline.vat.periodic"
  ],
  "sources": [
    "source.nts.business-registration.application",
    "source.nts.vat.filing-duty",
    "source.hometax.main"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "event",
    "vat"
  ],
  "life_phrases": [
    "첫 부가세",
    "부가세 처음",
    "개업 후 부가세",
    "사업자 첫 신고",
    "간이과세 신고"
  ],
  "official_candidates": [
    {
      "target": "filing.vat-return",
      "confidence": 0.86,
      "confidence_label": "높음",
      "reason": "개업 후 첫 부가세라는 표현은 부가가치세 신고 납부 절차 후보입니다.",
      "required_checks": [
        "사업자등록일",
        "과세유형",
        "과세기간",
        "간이과세자 납부면제",
        "예정신고 예외"
      ]
    },
    {
      "target": "concept.simple-vat-taxpayer",
      "confidence": 0.7,
      "confidence_label": "중간",
      "reason": "간이과세 여부를 먼저 묻는 경우 과세유형 판정 후보가 됩니다.",
      "required_checks": [
        "직전연도 공급대가",
        "세금계산서 발급 여부",
        "간이과세 배제 업종"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "사업자등록을 했거나 사업 개시일부터 20일 이내인가요?",
      "answer_type": "boolean",
      "target": "filing.business-registration",
      "criterion": "사업자등록"
    },
    {
      "order": 2,
      "question": "일반과세자와 간이과세자 중 어느 유형인가요?",
      "answer_type": "choice",
      "target": "eligibility-rule.vat-taxpayer-type",
      "criterion": "과세유형"
    },
    {
      "order": 3,
      "question": "직전연도 공급대가가 4,800만원 미만인 간이과세자인가요?",
      "answer_type": "boolean",
      "target": "concept.vat-payment-exemption",
      "criterion": "납부의무 면제"
    },
    {
      "order": 4,
      "question": "신고는 홈택스 부가가치세 신고 경로로 진행할 예정인가요?",
      "answer_type": "boolean",
      "target": "application-channel.hometax-vat",
      "criterion": "신청 경로"
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
      "source_id": "source.hometax.main",
      "original_url": "https://www.hometax.go.kr",
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
        "life_phrases",
        "official_candidates",
        "eligibility_questions",
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
    "id": "life-event.first-vat-return",
    "title": "첫 부가세 신고",
    "type": "life-event",
    "description": "처음 사업을 시작한 사용자가 사업자등록, 일반·간이과세자 구분, 신고기한과 납부의무 면제를 순서대로 판단하는 생활사건 노드입니다.",
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
      "https://www.hometax.go.kr"
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
    "search_text": "life-event.first-vat-return 첫 부가세 신고 life-event 처음 사업을 시작한 사용자가 사업자등록, 일반·간이과세자 구분, 신고기한과 납부의무 면제를 순서대로 판단하는 생활사건 노드입니다.",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.business-registration.application",
      "source.nts.vat.filing-duty",
      "source.hometax.main"
    ]
  },
  "search_shard": "reference",
  "search_position": 416,
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
  "record_checksum": "sha256:730ad09b5e118665a7354d3a1d157b95617781b28a6013b95940c20b4db596cb"
}
---

# 첫 부가세 신고

처음 사업을 시작한 사용자가 사업자등록, 일반·간이과세자 구분, 신고기한과 납부의무 면제를 순서대로 판단하는 생활사건 노드입니다.
