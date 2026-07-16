import type { Category } from "../types";

/**
 * 화면 업종 — 정확히 7개, 번호·순서 고정 (PRD 6.2). 전체 보기 없음 (FR-008).
 * sourceLabels는 정제 엑셀의 원문 업종값이다 ("숙박·관광" 가운뎃점 주의).
 */
export const CATEGORIES: Category[] = [
  { code: "education", label: "교육", number: 1, sourceLabels: ["교육"], iconName: "graduation-cap" },
  { code: "culture", label: "문화", number: 2, sourceLabels: ["문화"], iconName: "landmark" },
  { code: "lodging", label: "숙박&관광", number: 3, sourceLabels: ["숙박·관광"], iconName: "luggage" },
  { code: "medical", label: "의료", number: 4, sourceLabels: ["의료"], iconName: "cross" },
  { code: "parking", label: "주차", number: 5, sourceLabels: ["주차"], iconName: "square-parking" },
  { code: "sports", label: "체육", number: 6, sourceLabels: ["체육"], iconName: "dumbbell" },
  { code: "etc", label: "기타", number: 7, sourceLabels: ["기타"], iconName: "star" },
];

export function findCategoryBySourceLabel(sourceLabel: string): Category | null {
  return (
    CATEGORIES.find((category) => category.sourceLabels.includes(sourceLabel)) ?? null
  );
}

export function findCategoryByCode(code: string): Category | null {
  return CATEGORIES.find((category) => category.code === code) ?? null;
}
