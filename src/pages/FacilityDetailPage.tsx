import { useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { FacilityActionButtons } from "@/components/facility/FacilityActionButtons";
import { FacilityDescriptionList } from "@/components/facility/FacilityDescriptionList";
import { FacilityVisual } from "@/components/facility/FacilityVisual";
import { useFacilityData } from "@/hooks/useFacilityData";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { buildFacilityActionLinks, hasNoActionLinks } from "@/services/externalLink";

/**
 * 화면 4 — 시설 상세 (PRD 6.4). 선택 과정의 결과 화면이라 진행 표시를 사용하지 않는다.
 * 표시 순서: 비주얼 → 지역 → 시설명 → 우대 대상 → 감면 내용 → 비고 → 주소 → 연락처 → 행동 버튼.
 */
export function FacilityDetailPage() {
  const { facilityId } = useParams();
  const headingRef = useFocusOnNavigate();
  const { load, retry } = useFacilityData();

  if (load.status === "loading") {
    return <LoadingState />;
  }
  if (load.status === "error") {
    return <ErrorState onRetry={retry} />;
  }

  const facility = load.facilities.find((item) => item.facilityId === facilityId);

  if (facility === undefined) {
    return <NotFoundPage />;
  }

  const noActionLinks = hasNoActionLinks(buildFacilityActionLinks(facility));

  return (
    <div className="screen-enter grid gap-6 md:grid-cols-2">
      <FacilityVisual facility={facility} />

      <div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-navy-deep md:text-3xl"
        >
          {facility.facilityName}
        </h1>
        <p className="mt-2 text-sm text-navy">
          이용 전에 비고와 연락처를 확인해 주세요.
        </p>

        <div className="mt-4">
          <FacilityDescriptionList facility={facility} />
        </div>

        <div className="mt-6">
          <FacilityActionButtons facility={facility} />
        </div>

        <p className="mt-6 text-sm text-muted">
          {noActionLinks
            ? "자세한 이용 방법은 해당 시·군청에 문의해 주세요."
            : "시설 운영 여부와 감면 대상·내용은 변경될 수 있어요. 이용 전에 해당 시설에 확인해 주세요."}
        </p>
      </div>
    </div>
  );
}
