/** 데이터 최초 로드 중 표시. 내부 용어를 노출하지 않는다 (PRD 13.1). */
export function LoadingState() {
  return (
    <div role="status" className="py-16 text-center text-muted">
      정보를 불러오고 있어요.
    </div>
  );
}
