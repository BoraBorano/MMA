import type { RegionMap } from "@/types/regionMap";

let cache: RegionMap | null = null;

/** 고정형 경기도 SVG 도식 지도 로드 — 지역 선택 화면과 PX 찾기가 공유한다. */
export async function loadGyeonggiRegionMap(): Promise<RegionMap> {
  if (cache !== null) {
    return cache;
  }
  const response = await fetch(`${import.meta.env.BASE_URL}data/gyeonggi-map.json`);
  if (!response.ok) {
    throw new Error(`gyeonggi-map.json load failed: ${response.status}`);
  }
  const map = (await response.json()) as RegionMap;
  cache = map;
  return map;
}

/** 테스트 전용 — 모듈 캐시를 초기화한다. */
export function resetRegionMapCache(): void {
  cache = null;
}
