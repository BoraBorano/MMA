import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { PxStore } from "@/types/px";

interface PxStoreListProps {
  stores: PxStore[];
}

/** 구분선형 매장 목록 — 예우시설 목록과 동일한 시각 언어를 재사용한다. */
export function PxStoreList({ stores }: PxStoreListProps) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {stores.map((store) => (
        <li key={store.id}>
          <Link
            to={`/px/${store.id}`}
            className="flex min-h-16 items-center gap-3 py-4 hover:bg-blue-soft/40"
          >
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="line-clamp-2 font-bold text-ink">{store.name}</span>
                <span className="shrink-0 rounded bg-blue-soft px-2 py-0.5 text-xs font-bold text-navy">
                  {store.region}
                </span>
              </span>
              <span className="mt-1 line-clamp-2 block text-sm text-muted">
                {store.address}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="shrink-0 text-muted" />
            <span className="sr-only">{store.name} 상세 보기</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
