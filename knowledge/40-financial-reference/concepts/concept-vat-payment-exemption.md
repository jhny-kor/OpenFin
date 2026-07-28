---
{
  "id": "concept.vat-payment-exemption",
  "title": "간이과세자 납부의무 면제",
  "type": "concept",
  "description": "직전연도 공급대가가 일정 금액 미만인 간이과세자는 부가가치세 납부세액의 납부의무가 면제될 수 있어 신고와 납부 판단을 분리해 확인해야 합니다.",
  "folder": "40_Terms/Concepts",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://www.law.go.kr/법령/부가가치세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "tax.value-added"
  ],
  "children": [],
  "related": [
    "concept.simple-vat-taxpayer",
    "filing.vat-return",
    "eligibility-rule.vat-taxpayer-type",
    "scenario.simple-vat-taxpayer-decision"
  ],
  "terms": [
    "term.simple-vat-taxpayer",
    "term.eligibility-threshold"
  ],
  "deadlines": [],
  "sources": [
    "source.nts.vat.filing-duty",
    "source.law.value-added-tax-act.filing"
  ],
  "law_reference": "",
  "tags": [],
  "criteria": [
    {
      "label": "간이과세자 납부의무 면제",
      "basis": "직전연도 공급대가",
      "condition": "4,800만원 미만",
      "threshold_krw_max": 48000000,
      "benefit": "납부세액 납부의무 면제 가능",
      "source": "source.nts.vat.filing-duty",
      "criteria_kind": "threshold",
      "basis_category": "revenue",
      "basis_definition": "사업자의 과세유형, 지원대상, 납부의무 면제 또는 대출대상 판단에 쓰는 매출·공급대가 기준입니다.",
      "basis_lookup": "부가가치세 신고서, 사업장 매출자료, 세금계산서·현금영수증·카드매출 자료에서 확인합니다.",
      "selection_rule": "직전연도 기준인지 해당 과세기간 기준인지 구분하고 매출·공급대가가 하한·상한 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.vat.filing-duty",
      "law_reference": "국세기본법 제2조 제1호"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.vat.filing-duty",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.vat.filing-duty",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
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
      "source_id": "source.law.value-added-tax-act.filing",
      "original_url": "https://www.law.go.kr/법령/부가가치세법",
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
    "id": "concept.vat-payment-exemption",
    "title": "간이과세자 납부의무 면제",
    "type": "concept",
    "description": "직전연도 공급대가가 일정 금액 미만인 간이과세자는 부가가치세 납부세액의 납부의무가 면제될 수 있어 신고와 납부 판단을 분리해 확인해야 합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
      "https://www.law.go.kr/법령/부가가치세법"
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
    "search_text": "concept.vat-payment-exemption 간이과세자 납부의무 면제 concept 직전연도 공급대가가 일정 금액 미만인 간이과세자는 부가가치세 납부세액의 납부의무가 면제될 수 있어 신고와 납부 판단을 분리",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.vat.filing-duty",
      "source.law.value-added-tax-act.filing"
    ]
  },
  "search_shard": "reference",
  "search_position": 74,
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
  "record_checksum": "sha256:930fdbe32d3e87e0d58b2d230e82795ad9ccc35f126e2a91273d8d89d4b2562d"
}
---

# 간이과세자 납부의무 면제

직전연도 공급대가가 일정 금액 미만인 간이과세자는 부가가치세 납부세액의 납부의무가 면제될 수 있어 신고와 납부 판단을 분리해 확인해야 합니다.
