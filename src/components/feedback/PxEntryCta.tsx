import { Link } from "react-router-dom";
import { ChevronRight, Store } from "lucide-react";

/**
 * 경기도 군마트 찾기 진입점 (독립 부가 기능). 예우시설 메인 흐름을 밀어내지 않도록
 * 지역 목록 아래, 준비 중 섹션 위에 보조 CTA로 배치한다.
 */
export function PxEntryCta() {
  return (
    <div className="mt-8">
      <Link
        to="/px"
        className="flex min-h-16 items-center gap-3 rounded-md border border-line bg-surface px-4 transition-colors hover:bg-blue-soft"
      >
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-soft text-navy"
        >
          <Store size={22} aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-bold text-ink">경기도 군마트 찾기</span>
          <span className="block text-sm text-muted">
            가까운 영외마트의 위치와 운영시간을 확인해 보세요.
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="shrink-0 text-muted" />
      </Link>
    </div>
  );
}
