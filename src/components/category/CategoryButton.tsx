import { Link } from "react-router-dom";
import { CATEGORY_ICONS } from "@/components/category/categoryIcons";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryButtonProps {
  category: Category;
  regionCode: string;
  count: number;
  index: number;
}

/**
 * 업종 선택 버튼 — 번호+아이콘+이름+시설 수 (PRD 6.2.1).
 * 시설이 없는 업종은 비활성 처리하고 키보드 포커스에서 제외한다 (FR-009, A11Y-011).
 */
export function CategoryButton({ category, regionCode, count, index }: CategoryButtonProps) {
  const Icon = CATEGORY_ICONS[category.code];
  const isEmpty = count === 0;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-soft text-navy"
      >
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="flex-1 text-left">
        <span className="block font-bold text-ink">
          {category.number}. {category.label}
        </span>
        {/* muted는 surface 배경에서 14px 텍스트 기준 WCAG AA(4.5:1) 미달 — ink로 대비 확보 */}
        <span className="block text-sm text-ink">
          {isEmpty ? "등록 시설 없음" : `${count}개 시설`}
        </span>
      </span>
    </>
  );

  const sharedClassName = cn(
    "flex min-h-16 w-full items-center gap-3 rounded-md border border-line px-4 transition-colors",
  );

  if (isEmpty) {
    return (
      <li>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(sharedClassName, "bg-line/30 text-ink")}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li
      className="opacity-0 [animation-fill-mode:forwards]"
      style={{
        animation: "category-enter 450ms cubic-bezier(.16,1,.3,1) forwards",
        animationDelay: `${Math.min(index * 35, 210)}ms`,
      }}
    >
      <Link
        to={`/region/${regionCode}/${category.code}`}
        className={cn(sharedClassName, "bg-surface hover:bg-blue-soft")}
      >
        {content}
      </Link>
    </li>
  );
}
