import { Link } from "react-router-dom";
import type { Category, Region } from "@/types";

interface SelectionBreadcrumbProps {
  region: Region;
  category: Category;
}

/**
 * {지역} > {업종} 경로 (PRD 6.3.1, 5.4).
 * 지역 선택 시 첫 화면 이동(검색어 초기화), 업종 선택 시 업종 화면 이동(지역 유지).
 */
export function SelectionBreadcrumb({ region, category }: SelectionBreadcrumbProps) {
  return (
    <nav aria-label="선택 경로" className="flex items-center gap-1 text-sm text-muted">
      <Link to="/" className="font-bold text-navy hover:underline">
        {region.label}
      </Link>
      <span aria-hidden="true">&gt;</span>
      <Link to={`/region/${region.code}`} className="font-bold text-navy hover:underline">
        {category.label}
      </Link>
    </nav>
  );
}
