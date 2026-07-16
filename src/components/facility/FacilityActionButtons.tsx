import { ExternalLink, MapPin, Phone } from "lucide-react";
import { buttonVariants } from "@/components/common/Button";
import { buildFacilityActionLinks, hasNoActionLinks } from "@/services/externalLink";
import type { Facility } from "@/types";

interface FacilityActionButtonsProps {
  facility: Facility;
}

/**
 * 전화·홈페이지·지도 행동 버튼 (PRD 6.4.3, 18.1 매트릭스). 유효한 데이터만 노출하고,
 * 전무하면 영역 전체를 숨긴다 — 상위(FacilityDetailPage)가 하단 안내 분기를 담당한다.
 */
export function FacilityActionButtons({ facility }: FacilityActionButtonsProps) {
  const links = buildFacilityActionLinks(facility);

  if (hasNoActionLinks(links)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
      {links.tel !== null && (
        <a href={links.tel} className={buttonVariants({ variant: "primary" })}>
          <Phone aria-hidden="true" size={18} />
          전화하기
        </a>
      )}
      {links.homepage !== null && (
        <a
          href={links.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <ExternalLink aria-hidden="true" size={18} />
          홈페이지 보기
        </a>
      )}
      {links.map !== null && (
        <a
          href={links.map}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <MapPin aria-hidden="true" size={18} />
          지도에서 위치 보기
        </a>
      )}
    </div>
  );
}
