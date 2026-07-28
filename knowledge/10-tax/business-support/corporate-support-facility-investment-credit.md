---
{
  "id": "corporate.support.facility-investment-credit",
  "title": "시설투자 등에 대한 세액공제",
  "type": "corporate-tax-support",
  "description": "각종 시설투자 금액과 투자 증가분에 적용되는 세액공제입니다.",
  "folder": "20_Deductions/CorporateTaxSupports",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561",
    "https://www.law.go.kr/법령/조세특례제한법",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239070&mi=41093"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z",
    "2026-05-03T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.corporate-tax-supports"
  ],
  "children": [],
  "related": [],
  "terms": [
    "term.tax-credit",
    "term.tax-reduction"
  ],
  "deadlines": [
    "deadline.corporate-tax.return"
  ],
  "sources": [
    "source.nts.corporate-tax.reliefs",
    "source.law.tax-special-treatment-restriction-act.reliefs",
    "source.nts.corporate-tax-consulting.2026"
  ],
  "law_reference": "조세특례제한법 제24조",
  "tags": [
    "corporate-tax-support"
  ],
  "criteria": [
    {
      "label": "통합투자 기본공제",
      "basis": "사업용 유형자산 등 투자금액",
      "condition": "통합투자세액공제 대상 투자",
      "rate_percent_min": 1,
      "rate_percent_max": 10,
      "rate_label": "기본공제율",
      "note": "기업규모·투자자산 유형별 차등",
      "source": "source.nts.corporate-tax-consulting.2026",
      "criteria_kind": "rate",
      "rate_basis": "사업용 유형자산 등 투자금액",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.corporate-tax-consulting.2026",
      "law_reference": "조세특례제한법 제24조",
      "amount_formula": "사업용 유형자산 등 투자금액 × 기본공제율 1%~10%"
    },
    {
      "label": "투자증가분 추가공제",
      "basis": "직전 3년 평균 투자액 초과분",
      "condition": "투자 증가",
      "rate_percent": 10,
      "rate_label": "추가공제율",
      "note": "추가공제 한도는 기본공제 금액의 2배",
      "source": "source.nts.corporate-tax-consulting.2026",
      "criteria_kind": "rate",
      "rate_basis": "직전 3년 평균 투자액 초과분",
      "basis_category": "official-standard",
      "basis_definition": "해당 제도에서 대상 여부, 세율, 공제액, 한도 또는 신고기한을 판정하기 위해 공식 출처가 사용하는 기준항목입니다.",
      "basis_lookup": "각 criterion의 출처 노드와 관련 신고·신청 서류에서 확인합니다.",
      "selection_rule": "조건 문구와 구조화된 금액·비율·기간 필드를 함께 보고 해당 구간 또는 요건을 선택합니다.",
      "basis_source": "source.nts.corporate-tax-consulting.2026",
      "law_reference": "조세특례제한법 제24조",
      "amount_formula": "직전 3년 평균 투자액 초과분 × 추가공제율 10%"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {
        "criterion_2": 10
      },
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "통합투자세액공제 대상 투자",
        "투자 증가"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.corporate-tax.return"
      ],
      "law_references": [
        "조세특례제한법 제24조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "corporate-tax-support",
    "applicable_year": 2026,
    "law_reference": "조세특례제한법 제24조"
  },
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.corporate-tax.reliefs",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.corporate-tax.reliefs",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561",
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
        "criteria",
        "structured_summary",
        "search_facets",
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
      "source_id": "source.law.tax-special-treatment-restriction-act.reliefs",
      "original_url": "https://www.law.go.kr/법령/조세특례제한법",
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
        "criteria",
        "structured_summary",
        "search_facets",
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
      "source_id": "source.nts.corporate-tax-consulting.2026",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561",
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
        "criteria",
        "structured_summary",
        "search_facets",
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
    "id": "corporate.support.facility-investment-credit",
    "title": "시설투자 등에 대한 세액공제",
    "type": "corporate-tax-support",
    "description": "각종 시설투자 금액과 투자 증가분에 적용되는 세액공제입니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7987&mi=6561",
      "https://www.law.go.kr/법령/조세특례제한법",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239070&mi=41093"
    ],
    "source_basis_dates": [
      "2026-05-02T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z",
      "2026-05-03T00:00:00.000Z"
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
    "search_text": "corporate.support.facility-investment-credit 시설투자 등에 대한 세액공제 corporate-tax-support 각종 시설투자 금액과 투자 증가분에 적용되는 세액공제입니다. 조세특",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.corporate-tax.reliefs",
      "source.law.tax-special-treatment-restriction-act.reliefs",
      "source.nts.corporate-tax-consulting.2026"
    ]
  },
  "search_shard": "reference",
  "search_position": 87,
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
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
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
    },
    {
      "path": [
        "search_projection",
        "source_basis_dates",
        2
      ],
      "value": "2026-05-03 확인"
    }
  ],
  "record_checksum": "sha256:c468ba80b9aa7f0a5ba1fea8b1ccf5b93fe715136c283a0b7ec807f5e50de497"
}
---

# 시설투자 등에 대한 세액공제

각종 시설투자 금액과 투자 증가분에 적용되는 세액공제입니다.
