import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router-dom";
import { loadListState, saveListState } from "@/lib/listStateStorage";

/** 페이지 새로고침으로 진입했는지 판별한다. 새로고침은 상세 복귀도 뒤로가기도 아니므로 복원 대상이 아니다. */
function isPageReload(): boolean {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
    return false;
  }
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload";
}

/**
 * 상세 화면에서 목록으로 돌아올 때(뒤로가기)만 검색어·스크롤을 복원한다 (PRD 5.4).
 * 지역·업종을 새로 선택해 진입한 경우(PUSH 내비게이션)는 항상 빈 검색으로 시작한다.
 * 새로고침(F5)·URL 직접 진입도 빈 검색으로 시작한다 (QA BUG-004).
 */
export function useListStateRestore(key: string): {
  initialQuery: string;
  reportQuery: (value: string) => void;
  restoreScrollPosition: () => void;
} {
  const navigationType = useNavigationType();
  // 전체 리로드 시 React Router의 초기 내비게이션 타입은 POP이 되므로 별도로 걸러낸다.
  const [isReload] = useState(isPageReload);
  const isRestoring = navigationType === "POP" && !isReload;

  const [initialQuery] = useState<string>(() =>
    isRestoring ? (loadListState(key)?.searchQuery ?? "") : "",
  );
  const queryRef = useRef(initialQuery);
  const scrollYRef = useRef(0);

  useEffect(() => {
    function handleScroll() {
      scrollYRef.current = window.scrollY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (key !== "") {
        saveListState(key, { searchQuery: queryRef.current, scrollY: scrollYRef.current });
      }
    };
  }, [key]);

  const reportQuery = useCallback((value: string) => {
    queryRef.current = value;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (!isRestoring) {
      return;
    }
    const saved = loadListState(key);
    if (saved !== null) {
      window.scrollTo(0, saved.scrollY);
    }
  }, [isRestoring, key]);

  return { initialQuery, reportQuery, restoreScrollPosition };
}
