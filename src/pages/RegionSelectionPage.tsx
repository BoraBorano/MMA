import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PxEntryCta } from "@/components/feedback/PxEntryCta";
import { RegionList } from "@/components/region/RegionList";
import { RegionModeToggle, type RegionMode } from "@/components/region/RegionModeToggle";
import { RegionSelectMap } from "@/components/region/RegionSelectMap";
import { REGIONS, findRegionBySourceLabel } from "@/data/regionConfig";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import { useRegionMap } from "@/hooks/useRegionMap";
import { loadRegionMode, saveRegionMode } from "@/lib/regionModeStorage";
import { cn } from "@/lib/utils";

const publishedRegions = REGIONS.filter((region) => region.isPublished);

/**
 * 화면 1 — 지역 선택 (PRD 6.1).
 * 모바일: 지도/지역 이름 토글, 기본은 지도 (FR-005).
 * 태블릿·데스크톱(681px~): 지도와 지역 이름 목록을 나란히 표시 (PRD 6.1.1).
 * 지도 데이터를 불러오지 못하면 지역 이름 목록만으로 동작한다 (A11Y-010 대체 수단).
 */
export function RegionSelectionPage() {
  const headingRef = useFocusOnNavigate();
  const navigate = useNavigate();
  const mapLoad = useRegionMap();
  // 업종 화면에 다녀와도 마지막 선택 방식을 유지한다 (AC-003, QA BUG-007)
  const [mode, setMode] = useState<RegionMode>(() => loadRegionMode() ?? "map");

  function handleModeChange(next: RegionMode) {
    setMode(next);
    saveRegionMode(next);
  }

  const mapAvailable = mapLoad.status === "ready";

  function handleMapSelect(sourceRegion: string) {
    const region = findRegionBySourceLabel(sourceRegion);
    if (region !== null) {
      navigate(`/region/${region.code}`);
    }
  }

  return (
    <div className="screen-enter">
      <p className="text-2xl font-bold text-navy-deep md:text-3xl">
        우리 동네 혜택을 찾아보세요
      </p>
      <p className="mt-2 text-muted">
        먼저 지역을 골라주세요. 다음 화면에서 업종을 선택할 수 있어요.
      </p>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-xl font-bold text-ink md:text-2xl"
      >
        어느 지역의 혜택을 찾으세요?
      </h1>
      <p className="mt-1 text-muted">
        {mapAvailable ? "지도나 지역 이름을 눌러주세요." : "지역 이름을 눌러주세요."}
      </p>

      {mapAvailable && (
        <div className="mt-4">
          <RegionModeToggle mode={mode} onChange={handleModeChange} />
        </div>
      )}

      <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
        {mapAvailable && (
          <div
            className={cn(
              "rounded-md border border-line bg-surface p-2 md:block",
              mode === "map" ? "block" : "hidden",
            )}
          >
            <RegionSelectMap regionMap={mapLoad.regionMap} onSelect={handleMapSelect} />
          </div>
        )}
        <div
          className={cn(
            "md:block",
            mapAvailable && mode === "map" ? "hidden" : "block",
          )}
        >
          <RegionList regions={publishedRegions} columns={mapAvailable ? "narrow" : "wide"} />
        </div>
      </div>

      <PxEntryCta />
    </div>
  );
}
