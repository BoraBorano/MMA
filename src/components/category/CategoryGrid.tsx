import { CategoryButton } from "@/components/category/CategoryButton";
import { CATEGORIES } from "@/data/categoryConfig";
import type { CategoryCode } from "@/types";

interface CategoryGridProps {
  regionCode: string;
  counts: Record<CategoryCode, number>;
}

/** 업종 7개 그리드 — 모바일 1열, 태블릿 2열, 데스크톱 3열 (PRD 6.2.2). 전체 보기 없음 (FR-008). */
export function CategoryGrid({ regionCode, counts }: CategoryGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((category, index) => (
        <CategoryButton
          key={category.code}
          category={category}
          regionCode={regionCode}
          count={counts[category.code]}
          index={index}
        />
      ))}
    </ul>
  );
}
