import { Badge } from "@/components/common/Badge";

const COMING_SOON_FEATURES = ["병역명문가 신청하기"] as const;

/**
 * 후속 기능 준비 중 표시 (FR-024, PRD 4.3).
 * 작동하는 링크로 오인되지 않도록 비상호작용 카드로 구성한다.
 */
export function ComingSoonSection() {
  return (
    <section aria-labelledby="coming-soon-heading" className="mt-12">
      <h2 id="coming-soon-heading" className="text-lg font-bold text-navy-deep">
        준비 중인 기능
      </h2>
      <ul className="mt-3 grid max-w-sm gap-3">
        {COMING_SOON_FEATURES.map((feature) => (
          <li
            key={feature}
            className="rounded-md border border-line bg-gold-soft/40 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-ink">{feature}</span>
              <Badge variant="comingSoon">준비 중</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              더 편리한 기능을 준비하고 있어요.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
