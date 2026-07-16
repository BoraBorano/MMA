import { useCallback, useEffect, useState } from "react";
import { loadPxDataset, loadPxRegionMap } from "@/services/pxRepository";
import type { PxDatasetMetadata, PxRegionMap, PxStore } from "@/types/px";

export type PxDataLoad =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      stores: PxStore[];
      metadata: PxDatasetMetadata;
      regionMap: PxRegionMap;
    };

/** PX 매장·지도 데이터 로딩 상태 훅. 실패 시 다시 시도를 지원한다. */
export function usePxData(): { load: PxDataLoad; retry: () => void } {
  const [load, setLoad] = useState<PxDataLoad>({ status: "loading" });

  const start = useCallback(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    Promise.all([loadPxDataset(), loadPxRegionMap()])
      .then(([dataset, regionMap]) => {
        if (!cancelled) {
          setLoad({
            status: "ready",
            stores: dataset.stores,
            metadata: dataset.metadata,
            regionMap,
          });
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

  useEffect(() => start(), [start]);

  const retry = useCallback(() => {
    start();
  }, [start]);

  return { load, retry };
}
