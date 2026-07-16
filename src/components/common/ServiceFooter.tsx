import { DATA_UPDATED_AT_LABEL } from "@/lib/constants";

/** 데이터 기준일 상시 표시 (FR-026). */
export function ServiceFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-content px-[var(--page-padding)] py-5 text-sm text-muted">
        <p>데이터 기준일 {DATA_UPDATED_AT_LABEL}</p>
        <p>
          시설 운영 여부와 감면 대상·내용은 변경될 수 있어요. 이용 전에 해당
          시설에 확인해 주세요.
        </p>
      </div>
    </footer>
  );
}
