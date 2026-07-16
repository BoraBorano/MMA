import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { PxMarkerPosition, PxRegionMap } from "@/types/px";

interface GyeonggiMapProps {
  regionMap: PxRegionMap;
  markers: PxMarkerPosition[];
  selectedRegion: string | null;
  onSelectRegion: (region: string) => void;
  onSelectMarker: (storeId: string) => void;
}

function handleActivateKey(event: KeyboardEvent, activate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

/**
 * 고정형 경기도 SVG 도식 지도 (viewBox 0 0 800 944).
 * 타일 지도·위치 권한·GPS·지도 SDK를 사용하지 않는다 — 정적 path 데이터만 렌더링한다.
 * 선택 상태는 색상뿐 아니라 선 굵기·aria-pressed로도 구분한다 (A11Y-011).
 */
export function GyeonggiMap({
  regionMap,
  markers,
  selectedRegion,
  onSelectRegion,
  onSelectMarker,
}: GyeonggiMapProps) {
  return (
    <svg
      viewBox="0 0 800 944"
      role="group"
      aria-label="경기도 지도. 시·군을 선택하면 매장이 필터링됩니다."
      className="h-auto w-full max-w-full"
    >
      {regionMap.map((entry) =>
        entry.paths.map((d, index) => {
          const isSelected = selectedRegion === entry.region;
          return (
            <path
              key={`${entry.region}-${index}`}
              d={d}
              role="button"
              tabIndex={0}
              aria-label={`${entry.displayName} 선택`}
              aria-pressed={isSelected}
              onClick={() => onSelectRegion(entry.region)}
              onKeyDown={(event) =>
                handleActivateKey(event, () => onSelectRegion(entry.region))
              }
              className={cn(
                "cursor-pointer stroke-line transition-colors",
                isSelected
                  ? "fill-blue-soft stroke-navy stroke-[2.5]"
                  : "fill-surface stroke-1 hover:fill-blue-soft/60",
              )}
            />
          );
        }),
      )}
      {markers.map(({ store, x, y }) => (
        <circle
          key={store.id}
          cx={x}
          cy={y}
          r={7}
          role="button"
          tabIndex={0}
          aria-label={`${store.name} 상세 보기`}
          onClick={() => onSelectMarker(store.id)}
          onKeyDown={(event) =>
            handleActivateKey(event, () => onSelectMarker(store.id))
          }
          className="cursor-pointer fill-gold stroke-navy-deep stroke-[1.5] hover:fill-navy"
        />
      ))}
    </svg>
  );
}
