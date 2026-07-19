/**
 * 첫 화면(지역 선택)의 지도/목록 토글 상태를 세션 저장소에 보관한다 (AC-003, QA BUG-007).
 * 업종 화면에 다녀와도 마지막에 보던 방식이 유지되어야 한다.
 */
import type { RegionMode } from "@/components/region/RegionModeToggle";

const STORAGE_KEY = "regionSelectMode";

export function saveRegionMode(mode: RegionMode): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 세션 저장소를 사용할 수 없어도(사생활 보호 모드 등) 핵심 흐름은 계속되어야 한다.
  }
}

export function loadRegionMode(): RegionMode | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw === "map" || raw === "list" ? raw : null;
  } catch {
    return null;
  }
}
