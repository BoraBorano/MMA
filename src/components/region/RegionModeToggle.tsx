import { cn } from "@/lib/utils";

export type RegionMode = "map" | "list";

interface RegionModeToggleProps {
  mode: RegionMode;
  onChange: (mode: RegionMode) => void;
}

/**
 * 모바일 전용 지역 선택 방식 토글 (FR-005, PRD 6.1.1). 기본값은 지도.
 * 현재 선택 상태를 aria-pressed로 전달한다 (A11Y-006).
 */
export function RegionModeToggle({ mode, onChange }: RegionModeToggleProps) {
  const options: Array<{ value: RegionMode; label: string }> = [
    { value: "map", label: "지도에서 선택" },
    { value: "list", label: "지역 이름으로 선택" },
  ];

  return (
    <div
      role="group"
      aria-label="지역 선택 방식"
      className="grid grid-cols-2 gap-1 rounded-md border border-line bg-surface p-1 md:hidden"
    >
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={cn(
            "min-h-11 rounded px-3 text-sm font-bold transition-colors duration-240",
            mode === value
              ? "bg-navy text-surface"
              : "bg-transparent text-ink hover:bg-blue-soft",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
