import { Link } from "react-router-dom";
import type { Region } from "@/types";

interface RegionListProps {
  regions: Region[];
}

/** 지역 이름 목록 (FR-004). 선택 즉시 업종 화면으로 이동한다 (FR-006). */
export function RegionList({ regions }: RegionListProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
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
