import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";

const TOKEN_NAMES = [
  "navy",
  "navy-deep",
  "blue",
  "blue-soft",
  "gold",
  "gold-soft",
  "paper",
  "surface",
  "ink",
  "muted",
  "line",
] as const;

/**
 * 개발 전용 스타일가이드 (/dev/styleguide). 프로덕션 빌드에는 포함되지 않는다.
 */
export function StyleguidePage() {
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-navy-deep">
        스타일가이드 [개발 전용]
      </h1>

      <section>
        <h2 className="mb-3 text-xl font-bold">컬러 토큰</h2>
        <ul className="flex flex-wrap gap-3">
          {TOKEN_NAMES.map((name) => (
            <li key={name} className="text-sm">
              <span
                className="block h-12 w-24 rounded border border-line"
                style={{ backgroundColor: `var(--color-${name})` }}
              />
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">버튼</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>전화하기</Button>
          <Button variant="secondary">홈페이지 보기</Button>
          <Button variant="text">다른 지역 선택하기</Button>
          <Button disabled>등록 시설 없음</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">배지</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="provincial">경기도 운영 시설</Badge>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">로딩·오류 상태</h2>
        <LoadingState />
        <ErrorState onRetry={() => window.location.reload()} />
      </section>
    </div>
  );
}
