import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PxActionButtons } from "@/components/px/PxActionButtons";
import { PxDescriptionList } from "@/components/px/PxDescriptionList";
import { usePxData } from "@/hooks/usePxData";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { findPxStoreById } from "@/services/pxFilterService";

/** PX 상세 화면 — 이름 → 주소 → 영업시간 → 점심시간(있으면) → 비고(있으면) → 전화(있으면) → 행동 버튼. */
export function PxDetailPage() {
  const { storeId } = useParams();
  const headingRef = useFocusOnNavigate();
  const { load, retry } = usePxData();

  if (load.status === "loading") {
    return <LoadingState />;
  }
  if (load.status === "error") {
    return <ErrorState onRetry={retry} />;
  }

  const store = findPxStoreById(load.stores, storeId ?? "");
  if (store === undefined) {
    return <NotFoundPage />;
  }

  return (
    <div className="screen-enter">
      <Link
        to="/px"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-navy"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        목록으로
      </Link>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-2xl font-bold text-navy-deep md:text-3xl"
      >
        {store.name}
      </h1>
      {store.officialName !== store.name && (
        <p className="mt-1 text-sm text-muted">공식 명칭 {store.officialName}</p>
      )}

      <div className="mt-4">
        <PxDescriptionList store={store} />
      </div>

      <div className="mt-6">
        <PxActionButtons store={store} />
      </div>
    </div>
  );
}
