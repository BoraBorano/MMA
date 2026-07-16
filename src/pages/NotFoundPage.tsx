import { Link } from "react-router-dom";
import { useFocusOnNavigate } from "@/hooks/useFocusOnNavigate";

/** 잘못된 URL(지역·업종·시설 코드) 공통 처리 (FR-023, PRD 13.1). */
export function NotFoundPage() {
  const headingRef = useFocusOnNavigate();

  return (
    <div className="screen-enter py-16 text-center">
      <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-navy-deep">
        페이지를 찾을 수 없어요
      </h1>
      <Link to="/" className="mt-4 inline-block font-bold text-navy underline">
        첫 화면으로 가기
      </Link>
    </div>
  );
}
