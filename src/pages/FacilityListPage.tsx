import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { useAnnounce } from "@/components/common/LiveRegion";
import { EmptyResult } from "@/components/facility/EmptyResult";
import { FacilityList } from "@/components/facility/FacilityList";
import { FacilitySearch } from "@/components/facility/FacilitySearch";
import { SelectionBreadcrumb } from "@/components/facility/SelectionBreadcrumb";
import { findCategoryByCode } from "@/data/categoryConfig";
import { findRegionByCode } from "@/data/regionConfig";
import { useFacilityData } from "@/hooks/useFacilityData";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import { useListStateRestore } from "@/hooks/useListStateRestore";
import { buildListStateKey } from "@/lib/listStateStorage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { filterByRegionAndCategory, searchByFacilityName } from "@/services/filterService";

/** 화면 3 — 시설 목록 (PRD 6.3). 시설명 검색은 MVP 필수 기능 (FR-011). */
export function FacilityListPage() {
  const { regionCode, categoryCode } = useParams();
  const headingRef = useFocusOnNavigate();
  const { load, retry } = useFacilityData();
  const announce = useAnnounce();

  const region = findRegionByCode(regionCode ?? "");
  const category = findCategoryByCode(categoryCode ?? "");
  const listKey = region !== null && category !== null
    ? buildListStateKey(region.code, category.code)
    : "";

  const { initialQuery, reportQuery, restoreScrollPosition } = useListStateRestore(listKey);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    reportQuery(value);
  }

  const filtered = useMemo(() => {
    if (load.status !== "ready" || region === null || category === null) {
      return [];
    }
    return filterByRegionAndCategory(load.facilities, region.code, category.code);
  }, [load, region, category]);

  const results = useMemo(
    () => searchByFacilityName(filtered, searchQuery),
    [filtered, searchQuery],
  );

  useEffect(() => {
    if (load.status === "ready") {
      announce(`총 ${results.length}개 시설`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, load.status]);

  useEffect(() => {
    if (load.status === "ready") {
      restoreScrollPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.status]);

  if (region === null || category === null) {
    return <NotFoundPage />;
  }

  return (
    <div className="screen-enter">
      <div className="mt-2">
        <SelectionBreadcrumb region={region} category={category} />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 text-xl font-bold text-ink md:text-2xl"
      >
        {region.label} {category.label} 시설이에요
      </h1>
      <p className="mt-1 text-muted">시설을 누르면 혜택과 연락처를 볼 수 있어요.</p>

      {load.status === "loading" && <LoadingState />}
      {load.status === "error" && <ErrorState onRetry={retry} />}

      {load.status === "ready" && (
        <>
          {filtered.length === 0 ? (
            <EmptyResult variant="region" regionCode={region.code} />
          ) : (
            <>
              <div className="mt-5">
                <FacilitySearch value={searchQuery} onChange={handleSearchChange} />
              </div>
              <p className="mt-3 text-sm font-bold text-muted">
                총 {results.length}개 시설
              </p>
              <div className="mt-2">
                {results.length === 0 ? (
                  <EmptyResult variant="search" regionCode={region.code} />
                ) : (
                  <FacilityList facilities={results} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
