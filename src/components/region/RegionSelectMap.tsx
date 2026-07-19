import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { RegionMap } from "@/types/regionMap";

interface RegionSelectMapProps {
  regionMap: RegionMap;
  /** 엑셀 원문 지역값(예: "수원")을 넘긴다 — 호출부가 regionConfig로 코드 변환한다. */
  onSelect: (sourceRegion: string) => void;
}

function handleActivateKey(event: KeyboardEvent, activate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

/** 면적이 작아 라벨이 이웃과 겹치는 시·군 — 라벨만 축소한다(선택 영역은 동일). */
const SMALL_LABEL_REGIONS = new Set([
  "과천",
  "안산",
  "광명",
  "군포",
  "구리",
  "동두천",
  "부천",
  "성남",
  "시흥",
  "안양",
  "오산",
  "의왕",
  "의정부",
  "하남",
]);

/**
 * 지역 선택용 고정형 경기도 SVG 지도 (FR-003, viewBox 0 0 800 944).
 * 시·군을 누르면 즉시 업종 화면으로 이동한다 (FR-006).
 * 다중 path 시·군은 <g> 하나로 묶어 키보드 정지점을 지역당 1개로 유지한다 (A11Y).
 * 지도를 쓰기 어려운 사용자를 위해 동일한 지역 이름 목록을 함께 제공한다 (A11Y-010).
 */
export function RegionSelectMap({ regionMap, onSelect }: RegionSelectMapProps) {
  return (
    <svg
      viewBox="0 0 800 944"
      role="group"
      aria-label="경기도 지도. 시·군을 누르면 해당 지역의 업종 화면으로 이동합니다."
      className="h-auto w-full max-w-full"
    >
      {regionMap.map((entry) => (
        <g
          key={entry.region}
          role="button"
          tabIndex={0}
          aria-label={`${entry.displayName} 선택`}
          onClick={() => onSelect(entry.region)}
          onKeyDown={(event) => handleActivateKey(event, () => onSelect(entry.region))}
          className="cursor-pointer fill-surface stroke-line stroke-1 transition-colors hover:fill-blue-soft focus-visible:fill-blue-soft"
        >
          {entry.paths.map((d, index) => (
            <path key={index} d={d} />
          ))}
        </g>
      ))}
      {/*
       * 라벨 레이어 — 모든 지역 path보다 뒤(DOM상 마지막)에 그려 이웃 지역 path에
       * 가려지지 않게 한다 (QA BUG-009). pointer-events가 없으므로 라벨 위 클릭은
       * 라벨 좌표가 속한 지역 path로 그대로 전달된다 (QA BUG-008 — 라벨 좌표는
       * 반드시 해당 지역 폴리곤 내부에 있어야 한다).
       */}
      <g aria-hidden="true" className="pointer-events-none">
        {regionMap.map((entry) => (
          /* 밀집 지역에서도 읽히도록 surface 색 halo를 두른다 (paint-order: stroke) */
          <text
            key={entry.region}
            x={entry.label[0]}
            y={entry.label[1]}
            textAnchor="middle"
            className={cn(
              "fill-ink stroke-surface font-bold [paint-order:stroke] [stroke-width:3px]",
              SMALL_LABEL_REGIONS.has(entry.region) ? "text-[11px]" : "text-[15px]",
            )}
          >
            {entry.displayName}
          </text>
        ))}
      </g>
    </svg>
  );
}
