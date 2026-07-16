import { Badge } from "@/components/common/Badge";
import { CATEGORY_ICONS } from "@/components/category/categoryIcons";
import type { Facility } from "@/types";

interface FacilityVisualProps {
  facility: Facility;
}

/**
 * 업종 비주얼 영역 (PRD 6.4.1 순서 1, 8.5).
 * 시설 사진이 없으면 업종별 기본 선형 아이콘을 표시한다 (FR-016). MVP는 항상 사진 없음.
 */
export function FacilityVisual({ facility }: FacilityVisualProps) {
  const Icon = CATEGORY_ICONS[facility.categoryCode];

  return (
    <div className="relative flex aspect-[4/3] items-center justify-center rounded-md bg-blue-soft md:aspect-auto md:h-full">
      <Icon aria-hidden="true" size={64} className="text-navy" />
      <span className="sr-only">{facility.categoryLabel} 시설 이미지 없음</span>
      {facility.isProvincial && (
        <Badge variant="provincial" className="absolute left-3 top-3">
          경기도 운영 시설
        </Badge>
      )}
    </div>
  );
}
