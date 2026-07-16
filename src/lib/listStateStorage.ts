/**
 * 시설 목록의 검색어·스크롤 위치를 세션 저장소에 보관한다 (PRD 5.4, 6.3.4).
 * 지역·업종은 URL이 상태 저장소이므로 여기서 다루지 않는다.
 */
export interface ListState {
  searchQuery: string;
  scrollY: number;
}

export function buildListStateKey(regionCode: string, categoryCode: string): string {
  return `list:${regionCode}:${categoryCode}`;
}

export function saveListState(key: string, state: ListState): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // 세션 저장소를 사용할 수 없어도(사생활 보호 모드 등) 핵심 흐름은 계속되어야 한다.
  }
}

export function loadListState(key: string): ListState | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ListState>;
    if (typeof parsed.searchQuery !== "string" || typeof parsed.scrollY !== "number") {
      return null;
    }
    return { searchQuery: parsed.searchQuery, scrollY: parsed.scrollY };
  } catch {
    return null;
  }
}
