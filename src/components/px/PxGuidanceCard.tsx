import { formatOfficialReferenceDate } from "@/services/pxFilterService";

interface PxGuidanceCardProps {
  officialReferenceDate: string;
  officialDataUrl: string;
}

/** 검색·지도 아래에 배치하는 보조 안내 카드 — 관문처럼 상단에 두지 않는다. */
export function PxGuidanceCard({
  officialReferenceDate,
  officialDataUrl,
}: PxGuidanceCardProps) {
  return (
    <section
      aria-labelledby="px-guidance-heading"
      className="mt-8 rounded-md border border-line bg-gold-soft/40 p-4"
    >
      <h2 id="px-guidance-heading" className="font-bold text-navy-deep">
        방문 전에 확인해 주세요
      </h2>
      <p className="mt-2 text-sm text-ink">
        군마트는 이용 자격 확인이 필요해요. 대상자별 준비 서류가 다를 수 있으니 방문
        전 국군복지포털에서 확인해 주세요.
      </p>
      <p className="mt-2 text-sm text-ink">
        운영시간은 바뀔 수 있어요. 방문 전 매장 또는 국군복지포털에서 다시 확인해
        주세요.
      </p>
      <p className="mt-3 text-xs text-muted">
        데이터 기준일 {formatOfficialReferenceDate(officialReferenceDate)} · 출처{" "}
        <a
          href={officialDataUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          국방부 국군복지단
        </a>
      </p>
    </section>
  );
}
