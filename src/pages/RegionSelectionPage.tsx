import { ProgressIndicator } from "@/components/common/ProgressIndicator";
import { ComingSoonSection } from "@/components/feedback/ComingSoonSection";
import { PxEntryCta } from "@/components/feedback/PxEntryCta";
import { RegionList } from "@/components/region/RegionList";
import { REGIONS } from "@/data/regionConfig";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";

const publishedRegions = REGIONS.filter((region) => region.isPublished);

/** 화면 1 — 지역 선택 (PRD 6.1). 지역 이름 목록 단일 방식 (확정 결정). */
export function RegionSelectionPage() {
  const headingRef = useFocusOnNavigate();

  return (
    <div className="screen-enter">
      <p className="text-2xl font-bold text-navy-deep md:text-3xl">
        우리 동네 혜택을 찾아보세요
      </p>
      <p className="mt-2 text-muted">
        먼저 지역을 골라주세요. 다음 화면에서 업종을 선택할 수 있어요.
      </p>

      <div className="mt-6">
        <ProgressIndicator step={1} />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-xl font-bold text-ink md:text-2xl"
      >
        어느 지역의 혜택을 찾으세요?
      </h1>
      <p className="mt-1 text-muted">지역 이름을 눌러주세요.</p>

      <div className="mt-5">
        <RegionList regions={publishedRegions} />
      </div>

      <PxEntryCta />

      <ComingSoonSection />
    </div>
  );
}
