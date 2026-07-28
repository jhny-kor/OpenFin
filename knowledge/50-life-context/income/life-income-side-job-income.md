---
{
  "id": "life-income.side-job-income",
  "title": "부업·투잡 소득",
  "type": "life-income",
  "description": "직장인이 부업, 투잡, 플랫폼 소득을 얻은 경우 근로소득 연말정산만으로 끝나는지 종합소득세 신고가 필요한지 판단하는 생활어 노드입니다.",
  "folder": "80_LifeLanguage/Incomes",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.life-incomes"
  ],
  "children": [],
  "related": [
    "scenario.employee.side-job-income",
    "tax.income.comprehensive",
    "filing.year-end-settlement",
    "filing.payment-statement-submission",
    "scenario.payment-statement-submission"
  ],
  "terms": [],
  "deadlines": [
    "deadline.year-end-settlement",
    "deadline.income-tax.2025-return"
  ],
  "sources": [
    "source.nts.income-tax.deadline",
    "source.nts.year-end-settlement.calculation"
  ],
  "law_reference": "",
  "tags": [
    "life-language",
    "income",
    "side-job"
  ],
  "life_phrases": [
    "부업",
    "투잡",
    "겸업",
    "배달수입",
    "플랫폼 수입",
    "유튜브 수익",
    "블로그 수익"
  ],
  "official_candidates": [
    {
      "target": "tax.income.comprehensive",
      "confidence": 0.82,
      "confidence_label": "높음",
      "reason": "근로소득 외 사업·기타소득이 있으면 종합소득세 합산 여부를 확인해야 합니다.",
      "required_checks": [
        "근로소득 외 소득 종류",
        "원천징수 여부",
        "필요경비",
        "확정신고 대상 여부"
      ]
    },
    {
      "target": "filing.year-end-settlement",
      "confidence": 0.55,
      "confidence_label": "중간",
      "reason": "근로소득 자체는 회사 연말정산으로 정산되지만 부업 소득은 별도 판단이 필요합니다.",
      "required_checks": [
        "근로소득만 있는지",
        "회사 연말정산 완료 여부"
      ]
    }
  ],
  "eligibility_questions": [
    {
      "order": 1,
      "question": "근로소득 외에 사업소득, 기타소득, 금융소득 중 어떤 소득이 있나요?",
      "answer_type": "choice",
      "target": "tax.income.comprehensive",
      "criterion": "소득 구분"
    },
    {
      "order": 2,
      "question": "부업 소득에 대해 원천징수영수증 또는 지급명세서를 확인할 수 있나요?",
      "answer_type": "boolean",
      "target": "source.nts.employee-income-statement",
      "criterion": "소득자료 확인"
    },
    {
      "order": 3,
      "question": "회사 연말정산 후 다음연도 5월 종합소득세 신고가 필요한지 확인했나요?",
      "answer_type": "boolean",
      "target": "application-channel.hometax-income-tax",
      "criterion": "신고 경로"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.income-tax.deadline",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.income-tax.deadline",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
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
      "source_id": "source.nts.year-end-settlement.calculation",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
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
    "id": "life-income.side-job-income",
    "title": "부업·투잡 소득",
    "type": "life-income",
    "description": "직장인이 부업, 투잡, 플랫폼 소득을 얻은 경우 근로소득 연말정산만으로 끝나는지 종합소득세 신고가 필요한지 판단하는 생활어 노드입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7665&mi=2225",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312"
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
    "search_text": "life-income.side-job-income 부업·투잡 소득 life-income 직장인이 부업, 투잡, 플랫폼 소득을 얻은 경우 근로소득 연말정산만으로 끝나는지 종합소득세 신고가 필요한지 판단하는 생활어 노드",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.income-tax.deadline",
      "source.nts.year-end-settlement.calculation"
    ]
  },
  "search_shard": "reference",
  "search_position": 426,
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
  "record_checksum": "sha256:c485c435c866b0fed2bad53ff8663c4cbe5e0bff552729b64c940404a198f998"
}
---

# 부업·투잡 소득

직장인이 부업, 투잡, 플랫폼 소득을 얻은 경우 근로소득 연말정산만으로 끝나는지 종합소득세 신고가 필요한지 판단하는 생활어 노드입니다.
