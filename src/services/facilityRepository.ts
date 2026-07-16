import type { Facility, FacilityDataset } from "@/types";

let cache: FacilityDataset | null = null;

/**
 * 정적 데이터 로드 — 앱 진입 시 1회, 성공 후 모듈 캐시 (ARCHITECTURE §8).
 * 실패 시 호출부(useFacilityData)가 ErrorState와 다시 시도를 제공한다.
 */
export async function loadFacilityDataset(): Promise<FacilityDataset> {
  if (cache !== null) {
    return cache;
  }
  const response = await fetch(`${import.meta.env.BASE_URL}data/facilities.json`);
  if (!response.ok) {
    throw new Error(`facilities.json load failed: ${response.status}`);
  }
  const dataset = (await response.json()) as FacilityDataset;
  cache = dataset;
  return dataset;
}

/** 사용자 화면에 노출되는 시설 — isActive만 (PRD 10.5) */
export function selectPublishedFacilities(dataset: FacilityDataset): Facility[] {
  return dataset.facilities.filter((facility) => facility.isActive);
}

/** 테스트 전용 — 모듈 캐시를 초기화한다. */
export function resetFacilityDatasetCache(): void {
  cache = null;
}
