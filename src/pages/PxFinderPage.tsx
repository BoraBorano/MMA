import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAnnounce } from "@/components/common/LiveRegion";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchInput } from "@/components/common/SearchInput";
import { GyeonggiMap } from "@/components/px/GyeonggiMap";
import { PxEmptyResult } from "@/components/px/PxEmptyResult";
import { PxGuidanceCard } from "@/components/px/PxGuidanceCard";
import { PxRegionFilter } from "@/components/px/PxRegionFilter";
import { PxStoreList } from "@/components/px/PxStoreList";
import { usePxData } from "@/hooks/usePxData";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import {
  applyPxFilters,
  getAvailablePxRegions,
  resolvePxMarkerPositions,
} from "@/services/pxFilterService";
import type { PxMarkerPosition } from "@/types/px";

/**
 * 경기도 군마트 찾기 — 예우시설과 독립된 부가 기능.
 * 우선순위: 검색·지도가 이용 대상 안내보다 먼저 나온다.
 */
export function PxFinderPage() {
  const headingRef = useFocusOnNavigate();
  const { load, retry } = usePxData();
  const announce = useAnnounce();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (load.status !== "ready") {
      return [];
    }
    return applyPxFilters(load.stores, searchQuery, selectedRegion);
  }, [load, searchQuery, selectedRegion]);

  const availableRegions = useMemo(
    () => (load.status === "ready" ? getAvailablePxRegions(load.stores) : []),
    [load],
  );

  const markers: PxMarkerPosition[] = useMemo(() => {
    if (selectedRegion !== null) {
      return resolvePxMarkerPositions(filtered);
    }
    return filtered
      .filter((store) => store.svgX !== null && store.svgY !== null)
      .map((store) => ({ store, x: store.svgX as number, y: store.svgY as number }));
  }, [filtered, selectedRegion]);

  useEffect(() => {
    if (load.status === "ready") {
      announce(`총 ${filtered.length}개 매장`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, load.status]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedRegion(null);
  }

  return (
    <div className="screen-enter">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-navy"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        첫 화면으로
      </Link>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-2xl font-bold text-navy-deep md:text-3xl"
      >
        경기도 군마트 찾기
      </h1>
      <p className="mt-1 text-muted">
        가까운 영외마트의 위치와 운영시간을 확인해 보세요.
      </p>

      {load.status === "loading" && <LoadingState />}
      {load.status === "error" && <ErrorState onRetry={retry} />}

      {load.status === "ready" && (
        <>
          <div className="mt-5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              ariaLabel="지역이나 군마트 이름 검색"
              placeholder="지역이나 군마트 이름을 검색해 주세요"
            />
          </div>

          <div className="mt-4">
            <PxRegionFilter
              regions={availableRegions}
              selectedRegion={selectedRegion}
              onSelect={setSelectedRegion}
            />
          </div>

          <div className="mt-5 max-w-full overflow-hidden rounded-md border border-line bg-surface p-2">
            <GyeonggiMap
              regionMap={load.regionMap}
              markers={markers}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onSelectMarker={(storeId) => navigate(`/px/${storeId}`)}
            />
          </div>

          <p className="mt-3 text-sm font-bold text-muted">총 {filtered.length}개 매장</p>
          <div className="mt-2">
            {filtered.length === 0 ? (
              <PxEmptyResult onReset={resetFilters} />
            ) : (
              <PxStoreList stores={filtered} />
            )}
          </div>

          <PxGuidanceCard
            officialReferenceDate={load.metadata.officialReferenceDate}
            officialDataUrl={load.metadata.officialDataUrl}
          />
        </>
      )}
    </div>
  );
}
