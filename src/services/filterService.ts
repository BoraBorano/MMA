import type { CategoryCode, Facility, RegionCode } from "@/types";

/**
 * 특정 지역·업종의 시설 목록. 광역(isProvincial) 시설은 모든 지역의
 * 해당 업종 결과에 공통 표출된다 (Iteration 1 확정 결정 5).
 */
export function filterByRegionAndCategory(
  facilities: Facility[],
  regionCode: RegionCode,
  categoryCode: CategoryCode,
): Facility[] {
  return facilities.filter(
    (facility) =>
      facility.categoryCode === categoryCode &&
      (facility.isProvincial || facility.displayRegionCode === regionCode),
  );
}

/** 지역 내 업종별 시설 수 — 업종 버튼 카운트에 사용 (FR-025, 경기도 공통 표출 포함) */
export function countByCategoryInRegion(
  facilities: Facility[],
  regionCode: RegionCode,
): Record<CategoryCode, number> {
  const counts: Record<CategoryCode, number> = {
    education: 0,
    culture: 0,
    lodging: 0,
    medical: 0,
    parking: 0,
    sports: 0,
    etc: 0,
  };
  for (const facility of facilities) {
    if (facility.isProvincial || facility.displayRegionCode === regionCode) {
      counts[facility.categoryCode] += 1;
    }
  }
  return counts;
}

/** 시설명 부분 일치 검색 — 앞뒤·연속 공백 정리 후 비교 (FR-011, 6.3.2) */
export function searchByFacilityName(facilities: Facility[], query: string): Facility[] {
  const normalized = query.trim().replace(/ {2,}/g, " ");
  if (normalized === "") {
    return facilities;
  }
  const lowered = normalized.toLowerCase();
  return facilities.filter((facility) =>
    facility.facilityName.toLowerCase().includes(lowered),
  );
}
