import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/app/routes";
import { AppShell } from "@/components/common/AppShell";

export function App() {
  useEffect(() => {
    // 브라우저 네이티브 스크롤 복원과 useListStateRestore의 복원 로직이 경합하지 않도록 끈다 (AC-016).
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
}
