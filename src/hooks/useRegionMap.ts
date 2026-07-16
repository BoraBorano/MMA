import { useEffect, useState } from "react";
import { loadGyeonggiRegionMap } from "@/services/regionMapRepository";
import type { RegionMap } from "@/types/regionMap";

export type RegionMapLoad =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; regionMap: RegionMap };

/**
 * 지역 선택 화면의 지도 데이터 로딩 훅.
 * 실패해도 지역 이름 목록이 대체 수단이므로(A11Y-010) 오류 화면 대신
 * 호출부가 목록으로 조용히 전환할 수 있게 상태만 반환한다.
 */
export function useRegionMap(): RegionMapLoad {
  const [load, setLoad] = useState<RegionMapLoad>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadGyeonggiRegionMap()
      .then((regionMap) => {
        if (!cancelled) {
          setLoad({ status: "ready", regionMap });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoad({ status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return load;
}
