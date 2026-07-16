import { cn } from "@/lib/utils";

interface PxRegionFilterProps {
  regions: Array<{ region: string; count: number }>;
  selectedRegion: string | null;
  onSelect: (region: string | null) => void;
}

/** 데이터에 실제 매장이 있는 시·군만, 매장 수와 함께 노출한다. */
export function PxRegionFilter({ regions, selectedRegion, onSelect }: PxRegionFilterProps) {
  return (
    <div role="group" aria-label="지역 선택" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selectedRegion === null}
        onClick={() => onSelect(null)}
        className={cn(
          "min-h-11 rounded-full border px-4 text-sm font-bold transition-colors",
          selectedRegion === null
            ? "border-navy bg-navy text-surface"
            : "border-line bg-surface text-ink hover:bg-blue-soft",
        )}
      >
        전체
      </button>
      {regions.map(({ region, count }) => (
        <button
          key={region}
          type="button"
          aria-pressed={selectedRegion === region}
          onClick={() => onSelect(region)}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm font-bold transition-colors",
            selectedRegion === region
              ? "border-navy bg-navy text-surface"
              : "border-line bg-surface text-ink hover:bg-blue-soft",
          )}
        >
          {region} {count}
        </button>
      ))}
    </div>
  );
}
