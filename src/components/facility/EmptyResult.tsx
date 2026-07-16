import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/common/Button";

interface EmptyResultProps {
  variant: "search" | "region";
  regionCode: string;
}

/** 검색 결과 없음 / 지역 시설 없음 상태 (PRD 6.3.2, 6.1.3, 13). */
export function EmptyResult({ variant, regionCode }: EmptyResultProps) {
  if (variant === "region") {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-bold text-navy-deep">
          이 지역에는 등록된 시설이 없어요.
        </h2>
        <p className="mt-2 text-muted">다른 지역을 선택해 보세요.</p>
        <Link to="/" className={buttonVariants({ className: "mt-6" })}>
          다른 지역 선택하기
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 text-center">
      <h2 className="text-lg font-bold text-navy-deep">찾는 시설이 없어요</h2>
      <p className="mt-2 text-muted">
        시설 이름을 확인하거나 다른 업종을 선택해 보세요.
      </p>
      <Link
        to={`/region/${regionCode}`}
        className={buttonVariants({ variant: "secondary", className: "mt-6" })}
      >
        다른 업종 보기
      </Link>
    </div>
  );
}
