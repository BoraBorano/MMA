import { Link } from "react-router-dom";
import { GOV_EMBLEM_SRC, ORGANIZATION_NAME, SERVICE_NAME } from "@/lib/constants";

/**
 * 정부상징은 실제 승인된 이미지 파일(public/assets/gov-emblem.svg)이 있을 때만 표시한다.
 * 임의로 그린 상징을 대신 노출하지 않으며, 파일이 없거나 로드 실패 시 조용히 숨긴다.
 * 기관명 텍스트가 이미 기관을 알려주므로 상징 이미지는 장식으로 처리한다(중복 안내 방지).
 */
export function ServiceHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-content items-center gap-3 px-[var(--page-padding)] py-4">
        <img
          src={GOV_EMBLEM_SRC}
          alt=""
          aria-hidden="true"
          className="h-8 w-8 shrink-0"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <div>
          <p className="text-xs font-bold text-muted">{ORGANIZATION_NAME}</p>
          <Link
            to="/"
            className="inline-block min-h-11 py-1 text-lg font-bold text-navy-deep"
          >
            {SERVICE_NAME}
          </Link>
        </div>
      </div>
    </header>
  );
}
