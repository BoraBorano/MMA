import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import type { Facility } from "@/types";

interface FacilityListProps {
  facilities: Facility[];
}

/** 구분선형 목록 — 그림자 카드를 반복하지 않는다 (PRD 6.3.3). */
export function FacilityList({ facilities }: FacilityListProps) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {facilities.map((facility) => (
        <li key={facility.facilityId}>
          <Link
            to={`/facility/${facility.facilityId}`}
            className="flex min-h-16 items-center gap-3 py-4 hover:bg-blue-soft/40"
          >
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="line-clamp-2 font-bold text-ink">
                  {facility.facilityName}
                </span>
                {facility.isProvincial && (
                  <Badge variant="provincial" className="shrink-0">
                    경기도 운영 시설
                  </Badge>
                )}
              </span>
              <span className="mt-1 line-clamp-3 block text-sm font-medium text-navy">
                {facility.benefitDescription}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="shrink-0 text-muted" />
            <span className="sr-only">{facility.facilityName} 상세 보기</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
