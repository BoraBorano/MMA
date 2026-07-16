import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { ProgressIndicator } from "@/components/common/ProgressIndicator";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { findRegionByCode } from "@/data/regionConfig";
import { useFacilityData } from "@/hooks/useFacilityData";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { countByCategoryInRegion } from "@/services/filterService";

/** 화면 2 — 업종 선택 (PRD 6.2). 업종은 정확히 7개, 전체 보기 없음 (FR-007·008). */
export function CategorySelectionPage() {
  const { regionCode } = useParams();
  const headingRef = useFocusOnNavigate();
  const { load, retry } = useFacilityData();
  const region = findRegionByCode(regionCode ?? "");

  if (region === null) {
    return <NotFoundPage />;
  }

  return (
    <div className="screen-enter">
      <ProgressIndicator step={2} />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-xl font-bold text-ink md:text-2xl"
      >
        {region.label}에서 어떤 시설을 찾으세요?
      </h1>
      <p className="mt-1 text-muted">업종을 하나 골라주세요.</p>

      <div className="mt-5">
        {load.status === "loading" && <LoadingState />}
        {load.status === "error" && <ErrorState onRetry={retry} />}
        {load.status === "ready" && (
          <CategoryGrid
            regionCode={region.code}
            counts={countByCategoryInRegion(load.facilities, region.code)}
          />
        )}
      </div>
    </div>
  );
}
