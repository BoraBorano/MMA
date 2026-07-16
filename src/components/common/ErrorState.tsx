import { Button } from "@/components/common/Button";

interface ErrorStateProps {
  onRetry: () => void;
}

/** 데이터 로딩 실패 상태 (PRD 13, FR-023, AC-017). 오류코드를 노출하지 않는다. */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-bold text-navy-deep">
        최신 정보를 불러오지 못했어요
      </h2>
      <p className="mt-2 text-muted">잠시 후 다시 시도해 주세요.</p>
      <Button onClick={onRetry} className="mt-6">
        다시 시도하기
      </Button>
    </div>
  );
}
