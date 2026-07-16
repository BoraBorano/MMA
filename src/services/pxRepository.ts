import {
  loadGyeonggiRegionMap,
  resetRegionMapCache,
} from "@/services/regionMapRepository";
import type { PxDataset, PxRegionMap } from "@/types/px";

let datasetCache: PxDataset | null = null;

/** PX 매장 데이터 로드 — 앱 진입 시 1회, 성공 후 모듈 캐시 */
export async function loadPxDataset(): Promise<PxDataset> {
  if (datasetCache !== null) {
    return datasetCache;
  }
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/px-stores-gyeonggi.json`,
  );
  if (!response.ok) {
    throw new Error(`px-stores-gyeonggi.json load failed: ${response.status}`);
  }
  const dataset = (await response.json()) as PxDataset;
  datasetCache = dataset;
  return dataset;
}

/** 고정형 경기도 SVG 도식 지도 — 지역 선택 화면과 공유하는 저장소에 위임한다. */
export async function loadPxRegionMap(): Promise<PxRegionMap> {
  return loadGyeonggiRegionMap();
}

/** 테스트 전용 — 모듈 캐시를 초기화한다. */
export function resetPxCache(): void {
  datasetCache = null;
  resetRegionMapCache();
}
