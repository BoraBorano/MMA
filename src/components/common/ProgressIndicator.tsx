const STEP_LABELS = ["지역 선택", "업종 선택", "시설 선택"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

interface ProgressIndicatorProps {
  step: 1 | 2 | 3;
}

/**
 * 진행 상태 (FR-002, PRD 5.2). 시각 "1 / 3" + 접근명 "3단계 중 1단계: 지역 선택".
 * 시설 상세는 진행 표시를 사용하지 않는다.
 */
export function ProgressIndicator({ step }: ProgressIndicatorProps) {
  const label = `${TOTAL_STEPS}단계 중 ${step}단계: ${STEP_LABELS[step - 1]}`;

  return (
    <p className="flex items-center gap-2 text-sm font-bold text-navy">
      {/* 금색은 진행 점(장식용)에만 사용한다 — 작은 본문 글자는 WCAG AA 대비 기준(4.5:1)에 미달한다 (PRD 8.3) */}
      <span aria-hidden="true">
        {step} / {TOTAL_STEPS}
      </span>
      <span aria-hidden="true" className="flex gap-1">
        {STEP_LABELS.map((stepLabel, index) => (
          <span
            key={stepLabel}
            className={
              index < step
                ? "h-1.5 w-6 rounded-full bg-gold"
                : "h-1.5 w-6 rounded-full bg-line"
            }
          />
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </p>
  );
}
