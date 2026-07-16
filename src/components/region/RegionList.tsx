import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Region } from "@/types";

interface RegionListProps {
  regions: Region[];
  /** narrow: 지도 옆 절반 폭에 배치될 때, wide: 단독 배치될 때 */
  columns?: "narrow" | "wide";
}

/** 지역 이름 목록 (FR-004). 선택 즉시 업종 화면으로 이동한다 (FR-006). */
export function RegionList({ regions, columns = "wide" }: RegionListProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3",
        columns === "wide" ? "md:grid-cols-3 lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {regions.map((region) => (
        <li key={region.code}>
          <Link
            to={`/region/${region.code}`}
            className="flex min-h-12 items-center justify-center rounded-md border border-line bg-surface px-3 font-bold text-navy transition-colors hover:bg-blue-soft"
          >
            {region.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
