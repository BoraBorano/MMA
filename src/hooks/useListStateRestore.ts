import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router-dom";
import { loadListState, saveListState } from "@/lib/listStateStorage";

/**
 * 상세 화면에서 목록으로 돌아올 때(뒤로가기)만 검색어·스크롤을 복원한다 (PRD 5.4).
 * 지역·업종을 새로 선택해 진입한 경우(PUSH 내비게이션)는 항상 빈 검색으로 시작한다.
 */
export function useListStateRestore(key: string): {
  initialQuery: string;
  reportQuery: (value: string) => void;
  restoreScrollPosition: () => void;
} {
  const navigationType = useNavigationType();
  const isRestoring = navigationType === "POP";

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
