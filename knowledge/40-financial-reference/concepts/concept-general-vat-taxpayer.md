---
{
  "id": "concept.general-vat-taxpayer",
  "title": "일반과세자 기준",
  "type": "concept",
  "description": "부가가치세에서 일반 세율과 매입세액 공제 구조를 적용받는 과세사업자 유형입니다. 사업자등록과 부가가치세 신고 시 간이과세자 기준과 함께 확인합니다.",
  "folder": "40_Terms/Concepts",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
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
    "filing.business-registration",
    "filing.vat-return"
  ],
  "terms": [
    "term.general-vat-taxpayer",
    "term.tax-rate",
    "term.eligibility-threshold"
  ],
  "deadlines": [],
  "sources": [
    "source.nts.vat.overview",
    "source.nts.vat.filing-duty",
    "source.nts.business-registration.application",
    "source.law.value-added-tax-act.filing"
  ],
  "law_reference": "",
  "tags": [],
  "criteria": [
    {
      "label": "일반과세자 매출 기준",
      "basis": "1년 매출액",
      "condition": "1억400만원 이상",
      "threshold_krw_min": 104000000,
      "benefit": "일반과세자",
      "source": "source.nts.vat.overview",
      "criteria_kind": "threshold",
      "basis_category": "revenue",
      "basis_definition": "사업자의 과세유형, 지원대상, 납부의무 면제 또는 대출대상 판단에 쓰는 매출·공급대가 기준입니다.",
      "basis_lookup": "부가가치세 신고서, 사업장 매출자료, 세금계산서·현금영수증·카드매출 자료에서 확인합니다.",
      "selection_rule": "직전연도 기준인지 해당 과세기간 기준인지 구분하고 매출·공급대가가 하한·상한 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.vat.filing-duty",
      "law_reference": "국세기본법 제2조 제1호"
    },
    {
      "label": "일반과세자 세율",
      "basis": "매출세액",
      "condition": "매출액에 기본세율 적용",
      "rate_percent": 10,
      "note": "영세율 적용 대상은 0%",
      "source": "source.nts.vat.filing-duty",
      "criteria_kind": "rate",
      "rate_basis": "매출세액",
      "basis_category": "revenue",
      "basis_definition": "사업자의 과세유형, 지원대상, 납부의무 면제 또는 대출대상 판단에 쓰는 매출·공급대가 기준입니다.",
      "basis_lookup": "부가가치세 신고서, 사업장 매출자료, 세금계산서·현금영수증·카드매출 자료에서 확인합니다.",
      "selection_rule": "직전연도 기준인지 해당 과세기간 기준인지 구분하고 매출·공급대가가 하한·상한 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.vat.filing-duty",
      "law_reference": "국세기본법 제2조 제1호",
      "amount_formula": "매출세액 × 적용비율 10%"
    }
  ],
  "provenance_shard": "reference",
  "source_registry_id": "source.nts.vat.overview",
  "source_registry_status": "registered",
  "provenance": [
    {
      "source_id": "source.nts.vat.overview",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
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
      "source_id": "source.nts.vat.filing-duty",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
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
      "source_id": "source.nts.business-registration.application",
      "original_url": "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
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
    "id": "concept.general-vat-taxpayer",
    "title": "일반과세자 기준",
    "type": "concept",
    "description": "부가가치세에서 일반 세율과 매입세액 공제 구조를 적용받는 과세사업자 유형입니다. 사업자등록과 부가가치세 신고 시 간이과세자 기준과 함께 확인합니다.",
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
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
      "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7777&mi=2444",
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
    "search_text": "concept.general-vat-taxpayer 일반과세자 기준 concept 부가가치세에서 일반 세율과 매입세액 공제 구조를 적용받는 과세사업자 유형입니다. 사업자등록과 부가가치세 신고 시 간이과세자 기준과 함",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.vat.overview",
      "source.nts.vat.filing-duty",
      "source.nts.business-registration.application",
      "source.law.value-added-tax-act.filing"
    ]
  },
  "search_shard": "reference",
  "search_position": 72,
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
  "record_checksum": "sha256:76a784aea8d573f7e0fd88199dd43c252a5b32ecb6523ca6b7838f183f34bafe"
}
---

# 일반과세자 기준

부가가치세에서 일반 세율과 매입세액 공제 구조를 적용받는 과세사업자 유형입니다. 사업자등록과 부가가치세 신고 시 간이과세자 기준과 함께 확인합니다.
