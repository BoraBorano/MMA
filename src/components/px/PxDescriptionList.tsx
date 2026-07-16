import type { PxStore } from "@/types/px";

interface PxDescriptionListProps {
  store: PxStore;
}

/** PX 상세 정보 — dl/dt/dd 구조. 값이 없는 항목은 영역을 숨긴다. */
export function PxDescriptionList({ store }: PxDescriptionListProps) {
  const hasLunch =
    store.lunchHours.weekday !== "" ||
    store.lunchHours.saturday !== "" ||
    store.lunchHours.sunday !== "";
  const hasNote = store.note !== null && store.note !== "";
  const hasPhone = store.phone !== null && store.phone !== "";

  return (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm text-muted">주소</dt>
        <dd className="text-base text-ink">{store.address}</dd>
      </div>
      <div>
        <dt className="text-sm text-muted">영업시간</dt>
        <dd className="text-base text-ink">
          <span className="block">평일 {store.hours.weekday}</span>
          <span className="block">토요일 {store.hours.saturday}</span>
          <span className="block">일요일 {store.hours.sunday}</span>
        </dd>
      </div>
      {hasLunch && (
        <div>
          <dt className="text-sm text-muted">점심시간</dt>
          <dd className="text-base text-ink">
            {store.lunchHours.weekday !== "" && (
              <span className="block">평일 {store.lunchHours.weekday}</span>
            )}
            {store.lunchHours.saturday !== "" && (
              <span className="block">토요일 {store.lunchHours.saturday}</span>
            )}
            {store.lunchHours.sunday !== "" && (
              <span className="block">일요일 {store.lunchHours.sunday}</span>
            )}
          </dd>
        </div>
      )}
      {hasNote && (
        <div>
          <dt className="text-sm text-muted">비고</dt>
          <dd className="whitespace-pre-line text-base text-ink">{store.note}</dd>
        </div>
      )}
      {hasPhone && (
        <div>
          <dt className="text-sm text-muted">전화번호</dt>
          <dd className="text-base text-ink">{store.phone}</dd>
        </div>
      )}
    </dl>
  );
}
