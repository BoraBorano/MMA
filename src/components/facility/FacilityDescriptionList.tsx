import type { Facility } from "@/types";

interface FacilityDescriptionListProps {
  facility: Facility;
}

/**
 * 시설 상세 정보 — dl/dt/dd 구조 (PRD 6.4.1 순서 4~8, 지역은 순서 2).
 * 없는 항목은 영역 자체를 숨긴다 (FR-020). 기관구분은 기본 상세에 노출하지 않는다.
 * 비고는 원문 그대로 표시하며 개행을 보존한다 (FR-015).
 * 감면 내용도 여러 줄 원문의 줄 구조를 보존한다 (GYEONGGI_NORTH_DATA_PLAN D6).
 */
export function FacilityDescriptionList({ facility }: FacilityDescriptionListProps) {
  return (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm text-muted">지역</dt>
        <dd className="text-base text-ink">{facility.displayRegionLabel}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted">우대 대상</dt>
        <dd className="text-base text-ink">{facility.benefitTarget}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted">감면 내용</dt>
        <dd className="whitespace-pre-line text-base font-bold text-navy">
          {facility.benefitDescription}
        </dd>
      </div>
      {facility.note !== null && (
        <div>
          <dt className="text-sm text-muted">비고</dt>
          <dd className="whitespace-pre-line text-base text-ink">{facility.note}</dd>
        </div>
      )}
      {facility.address !== null && (
        <div>
          <dt className="text-sm text-muted">주소</dt>
          <dd className="text-base text-ink">{facility.address}</dd>
        </div>
      )}
      {facility.phoneDisplay !== null && (
        <div>
          <dt className="text-sm text-muted">연락처</dt>
          <dd className="text-base text-ink">{facility.phoneDisplay}</dd>
        </div>
      )}
    </dl>
  );
}
