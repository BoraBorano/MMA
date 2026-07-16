import type { PxMarkerPosition, PxStore } from "@/types/px";

/** 시설명/공식명/지역/주소 부분 일치 검색. 앞뒤·연속 공백 정리 (예우시설 검색 규칙과 동일 원칙). */
export function searchPxStores(stores: PxStore[], query: string): PxStore[] {
  const normalized = query.trim().replace(/ {2,}/g, " ");
  if (normalized === "") {
    return stores;
  }
  const lowered = normalized.toLowerCase();
  return stores.filter(
    (store) =>
      store.name.toLowerCase().includes(lowered) ||
      store.officialName.toLowerCase().includes(lowered) ||
      store.region.toLowerCase().includes(lowered) ||
      store.address.toLowerCase().includes(lowered),
  );
}

/** 지역 필터 — region이 null이면 전체를 반환한다. */
export function filterPxStoresByRegion(
  stores: PxStore[],
  region: string | null,
): PxStore[] {
  if (region === null) {
    return stores;
  }
  return stores.filter((store) => store.region === region);
}

/** 검색어와 지역 필터를 동시 적용한다. */
export function applyPxFilters(
  stores: PxStore[],
  query: string,
  region: string | null,
): PxStore[] {
  return filterPxStoresByRegion(searchPxStores(stores, query), region);
}

/** 데이터에 실제 매장이 있는 시·군만, 매장 수와 함께 가나다순으로 반환한다. */
export function getAvailablePxRegions(
  stores: PxStore[],
): Array<{ region: string; count: number }> {
  const counts = new Map<string, number>();
  for (const store of stores) {
    counts.set(store.region, (counts.get(store.region) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => a.region.localeCompare(b.region, "ko"));
}

function distance(a: { svgX: number; svgY: number }, b: { svgX: number; svgY: number }) {
  return Math.hypot(a.svgX - b.svgX, a.svgY - b.svgY);
}

const CLUSTER_THRESHOLD = 10;
const OFFSET_RADIUS = 14;

/**
 * 근접한 마커를 작은 반경형으로 펼쳐 겹침을 해소한다. 실제 lat/lng는 변경하지 않고
 * 화면 표시 좌표(x, y)만 계산한다. 호출부는 지역이 선택된 화면에서만 사용한다.
 */
export function resolvePxMarkerPositions(stores: PxStore[]): PxMarkerPosition[] {
  const positioned = stores.filter(
    (store): store is PxStore & { svgX: number; svgY: number } =>
      store.svgX !== null && store.svgY !== null,
  );

  const clusters: Array<Array<PxStore & { svgX: number; svgY: number }>> = [];
  for (const store of positioned) {
    const cluster = clusters.find((group) =>
      group.some((member) => distance(member, store) < CLUSTER_THRESHOLD),
    );
    if (cluster !== undefined) {
      cluster.push(store);
    } else {
      clusters.push([store]);
    }
  }

  const positions: PxMarkerPosition[] = [];
  for (const cluster of clusters) {
    if (cluster.length === 1) {
      const [store] = cluster;
      positions.push({ store, x: store.svgX, y: store.svgY });
      continue;
    }
    const sorted = [...cluster].sort((a, b) => a.id.localeCompare(b.id));
    const centerX = sorted.reduce((sum, s) => sum + s.svgX, 0) / sorted.length;
    const centerY = sorted.reduce((sum, s) => sum + s.svgY, 0) / sorted.length;
    sorted.forEach((store, index) => {
      const angle = (2 * Math.PI * index) / sorted.length;
      positions.push({
        store,
        x: centerX + OFFSET_RADIUS * Math.cos(angle),
        y: centerY + OFFSET_RADIUS * Math.sin(angle),
      });
    });
  }
  return positions;
}

/** id로 매장을 조회한다 (상세 화면용). */
export function findPxStoreById(stores: PxStore[], id: string): PxStore | undefined {
  return stores.find((store) => store.id === id);
}

/** "2026-04-28" → "2026. 4. 28." (데이터 기준일 표시용) */
export function formatOfficialReferenceDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${year}. ${month}. ${day}.`;
}
