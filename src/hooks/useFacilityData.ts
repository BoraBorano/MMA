import { useCallback, useEffect, useState } from "react";
import {
  loadFacilityDataset,
  selectPublishedFacilities,
} from "@/services/facilityRepository";
import type { Facility } from "@/types";

export type FacilityDataLoad =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; facilities: Facility[]; dataUpdatedAt: string };

/** 데이터 로딩 상태 훅 (FR-023, AC-017). 실패 시 다시 시도를 지원한다. */
export function useFacilityData(): { load: FacilityDataLoad; retry: () => void } {
  const [load, setLoad] = useState<FacilityDataLoad>({ status: "loading" });

  const start = useCallback(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    loadFacilityDataset()
      .then((dataset) => {
        if (!cancelled) {
          setLoad({
            status: "ready",
            facilities: selectPublishedFacilities(dataset),
            dataUpdatedAt: dataset.dataUpdatedAt,
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
