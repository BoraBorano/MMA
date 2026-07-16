import type { ReactNode } from "react";
import { LiveRegionProvider } from "@/components/common/LiveRegion";
import { ServiceFooter } from "@/components/common/ServiceFooter";
import { ServiceHeader } from "@/components/common/ServiceHeader";
import { SkipLink } from "@/components/common/SkipLink";

/**
 * 공통 레이아웃: 최대 폭 1,180px, 반응형 좌우 여백 (PRD 8.4, NFR-002).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LiveRegionProvider>
      <div className="flex min-h-screen flex-col">
        <SkipLink />
        <ServiceHeader />
        <main
          id="main-content"
          className="mx-auto w-full max-w-content flex-1 px-[var(--page-padding)] py-6"
        >
          {children}
        </main>
        <ServiceFooter />
      </div>
    </LiveRegionProvider>
  );
}
