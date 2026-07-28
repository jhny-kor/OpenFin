---
{
  "id": "filing.vat-return",
  "title": "부가가치세 신고 납부 절차",
  "type": "filing",
  "description": "부가가치세 과세사업자가 과세기간별 매출세액과 매입세액을 신고·납부하는 절차입니다. 일반과세자 확정신고, 간이과세자 연간 신고, 일부 간이과세자 예정신고 예외를 함께 관리합니다.",
  "folder": "50_Deadlines",
  "basis_year": 2026,
  "effective_date": null,
  "expiration_date": null,
  "reviewed_at": "2026-05-04",
  "source_urls": [
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2272",
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7806",
    "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
    "https://www.law.go.kr/법령/부가가치세법"
  ],
  "source_basis_dates": [
    "2026-05-02T00:00:00.000Z",
    "2026-05-04T00:00:00.000Z"
  ],
  "abolition_status": "active",
  "revision_status": "none_announced",
  "parents": [
    "category.filing-calendar",
    "category.business-tax-compliance"
  ],
  "children": [],
  "related": [
    "tax.value-added",
    "concept.general-vat-taxpayer",
    "concept.simple-vat-taxpayer",
    "concept.vat-payment-exemption",
    "filing.business-registration",
    "application-channel.hometax-vat",
    "life-event.first-vat-return",
    "scenario.first-vat-return",
    "scenario.simple-vat-taxpayer-decision",
    "concept.additional-tax.general",
    "scenario.tax-penalty-risk"
  ],
  "terms": [
    "term.tax-period",
    "term.general-vat-taxpayer",
    "term.simple-vat-taxpayer",
    "term.deadline-special-rule"
  ],
  "deadlines": [
    "deadline.vat.periodic",
    "deadline.vat.general.first-final",
    "deadline.vat.general.second-final",
    "deadline.vat.simplified.annual",
    "deadline.vat.simplified.preliminary"
  ],
  "sources": [
    "source.nts.vat.overview",
    "source.nts.vat.filing-duty",
    "source.nts.tax-calendar.2026",
    "source.law.value-added-tax-act.filing"
  ],
  "law_reference": "부가가치세법 제48조·제49조 및 제67조",
  "tags": [],
  "criteria": [
    {
      "label": "일반과세자 확정신고",
      "basis": "부가가치세 과세기간",
      "condition": "제1기·제2기 확정신고 납부",
      "amount_formula": "매출세액 - 매입세액 - 공제세액",
      "source": "source.nts.vat.filing-duty",
      "deadline_start_month": 7,
      "deadline_start_day": 1,
      "deadline_end_day": 25,
      "deadline_rule": "제1기 7월 1~25일, 제2기 다음 해 1월 1~25일",
      "criteria_kind": "deadline",
      "basis_category": "deadline-anchor",
      "basis_definition": "신고·납부 또는 신청기한을 계산할 때 출발점이 되는 날짜 또는 과세기간 기준입니다.",
      "basis_lookup": "거래일, 사업개시일, 소득 지급일, 상속·증여 발생일, 과세기간 기록과 신고 안내에서 확인합니다.",
      "selection_rule": "기준일이 속하는 달·반기·과세기간의 말일을 확정한 뒤 deadline_* 필드의 월·일·개월 규칙을 적용합니다.",
      "basis_source": "source.nts.vat.filing-duty",
      "law_reference": "부가가치세법 제48조·제49조 및 제67조"
    },
    {
      "label": "간이과세자 연간 신고",
      "basis": "직전연도 공급대가",
      "condition": "간이과세자 과세기간 신고",
      "amount_formula": "매출액 × 업종별 부가가치율 × 10% - 공제세액",
      "source": "source.nts.vat.filing-duty",
      "deadline_start_month": 1,
      "deadline_start_day": 1,
      "deadline_end_month": 1,
      "deadline_end_day": 25,
      "criteria_kind": "deadline",
      "basis_category": "revenue",
      "basis_definition": "사업자의 과세유형, 지원대상, 납부의무 면제 또는 대출대상 판단에 쓰는 매출·공급대가 기준입니다.",
      "basis_lookup": "부가가치세 신고서, 사업장 매출자료, 세금계산서·현금영수증·카드매출 자료에서 확인합니다.",
      "selection_rule": "직전연도 기준인지 해당 과세기간 기준인지 구분하고 매출·공급대가가 하한·상한 범위에 들어가는지 판정합니다.",
      "basis_source": "source.nts.vat.filing-duty",
      "law_reference": "부가가치세법 제48조·제49조 및 제67조"
    }
  ],
  "structured_summary": {
    "tax": {
      "tax_year": 2026,
      "rates": {},
      "limits": {},
      "thresholds": {},
      "eligible_persons": [
        "제1기·제2기 확정신고 납부",
        "간이과세자 과세기간 신고"
      ],
      "required_documents": [],
      "filing_deadlines": [
        "deadline.vat.periodic",
        "deadline.vat.general.first-final",
        "deadline.vat.general.second-final",
        "deadline.vat.simplified.annual",
        "deadline.vat.simplified.preliminary"
      ],
      "law_references": [
        "부가가치세법 제48조·제49조 및 제67조"
      ]
    }
  },
  "search_facets": {
    "tax_type": "filing",
    "applicable_year": 2026,
    "law_reference": "부가가치세법 제48조·제49조 및 제67조"
  },
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
      "source_id": "source.nts.tax-calendar.2026",
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
    "id": "filing.vat-return",
    "title": "부가가치세 신고 납부 절차",
    "type": "filing",
    "description": "부가가치세 과세사업자가 과세기간별 매출세액과 매입세액을 신고·납부하는 절차입니다. 일반과세자 확정신고, 간이과세자 연간 신고, 일부 간이과세자 예정신고 예외를 함께 관리합니다.",
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
      "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026",
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
    "search_text": "filing.vat-return 부가가치세 신고 납부 절차 filing 부가가치세 과세사업자가 과세기간별 매출세액과 매입세액을 신고·납부하는 절차입니다. 일반과세자 확정신고, 간이과세자 연간 신고, 일부 간이과세자 ",
    "provenance_shard": "reference",
    "source_ids": [
      "source.nts.vat.overview",
      "source.nts.vat.filing-duty",
      "source.nts.tax-calendar.2026",
      "source.law.value-added-tax-act.filing"
    ]
  },
  "search_shard": "reference",
  "search_position": 178,
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
  "record_checksum": "sha256:898176bdde24e60bccdec3219069ad9b9bcd92ad72463868fdf2b7d62992d639",
  "available_in": [
    "application-channel.hometax-vat"
  ]
}
---

# 부가가치세 신고 납부 절차

부가가치세 과세사업자가 과세기간별 매출세액과 매입세액을 신고·납부하는 절차입니다. 일반과세자 확정신고, 간이과세자 연간 신고, 일부 간이과세자 예정신고 예외를 함께 관리합니다.
