import { ExternalLink, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/common/Button";
import type { PxStore } from "@/types/px";

interface PxActionButtonsProps {
  store: PxStore;
}

/**
 * 네이버지도·국군복지포털 연결 (모두 새 탭, noopener noreferrer).
 * naverMapUrl은 장소 고정 링크가 아니라 매장명+주소 검색 딥링크다 — 지도 SDK를 쓰지 않는다.
 */
export function PxActionButtons({ store }: PxActionButtonsProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
      <a
        href={store.naverMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "secondary" })}
      >
        <MapPin aria-hidden="true" size={18} />
        네이버지도에서 보기
      </a>
      <a
        href={store.welfarePortalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "primary" })}
      >
        <ExternalLink aria-hidden="true" size={18} />
        국군복지포털에서 이용 자격 확인
      </a>
    </div>
  );
}
