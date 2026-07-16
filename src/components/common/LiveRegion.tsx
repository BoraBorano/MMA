import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface LiveRegionContextValue {
  announce: (message: string) => void;
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null);

/**
 * 검색 결과 건수, 외부 링크 실패 등 상태 변화를 스크린리더에 알린다 (A11Y-007).
 * aria-live 요소는 앱에 상주해야 알림이 안정적으로 전달된다.
 */
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const announce = useCallback((next: string) => {
    // 같은 문장이 연속 전달될 때도 다시 읽히도록 비운 뒤 설정한다.
    setMessage("");
    window.requestAnimationFrame(() => setMessage(next));
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {message}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useAnnounce(): (message: string) => void {
  const context = useContext(LiveRegionContext);
  if (context === null) {
    throw new Error("useAnnounce는 LiveRegionProvider 안에서 사용해야 합니다");
  }
  return context.announce;
}
