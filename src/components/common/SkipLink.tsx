/**
 * 본문 바로가기 (A11Y-002). 포커스를 받기 전에는 시각적으로 숨긴다.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-50 rounded-md bg-navy px-4 py-3 font-bold text-surface focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
    >
      본문 바로가기
    </a>
  );
}
