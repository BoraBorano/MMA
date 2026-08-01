import type { Region, RegionCode } from "../types";

/** 광역값 원문 — 별도 지역 버튼으로 노출하지 않는다 (PRD 10.6) */
export const PROVINCIAL_SOURCE_LABEL = "경기도";
export const PROVINCIAL_DISPLAY_LABEL = "경기도";

/**
 * 경기도 31개 시·군. 기본 정렬은 가나다순 (PRD 6.1.1).
 * 공개 범위는 isPublished로 제어한다 — 현재 전체 공개 (Iteration 1 결정 E-1).
 */
export const REGIONS: Region[] = (
  [
    ["gapyeong", "가평군", "가평"],
    ["goyang", "고양시", "고양"],
    ["gwacheon", "과천시", "과천"],
    ["gwangmyeong", "광명시", "광명"],
    ["gwangju", "광주시", "광주"],
    ["guri", "구리시", "구리"],
    ["gunpo", "군포시", "군포"],
    ["gimpo", "김포시", "김포"],
    ["namyangju", "남양주시", "남양주"],
    ["dongducheon", "동두천시", "동두천"],
    ["bucheon", "부천시", "부천"],
    ["seongnam", "성남시", "성남"],
    ["suwon", "수원시", "수원"],
    ["siheung", "시흥시", "시흥"],
    ["ansan", "안산시", "안산"],
    ["anseong", "안성시", "안성"],
    ["anyang", "안양시", "안양"],
    ["yangju", "양주시", "양주"],
    ["yangpyeong", "양평군", "양평"],
    ["yeoju", "여주시", "여주"],
    ["yeoncheon", "연천군", "연천"],
    ["osan", "오산시", "오산"],
    ["yongin", "용인시", "용인"],
    ["uiwang", "의왕시", "의왕"],
    ["uijeongbu", "의정부시", "의정부"],
    ["icheon", "이천시", "이천"],
    ["paju", "파주시", "파주"],
    ["pyeongtaek", "평택시", "평택"],
    ["pocheon", "포천시", "포천"],
    ["hanam", "하남시", "하남"],
    ["hwaseong", "화성시", "화성"],
  ] as const
).map(([code, label, sourceLabel], index) => ({
  code,
  label,
  provinceCode: "gyeonggi" as const,
  sourceLabels: [sourceLabel],
  isPublished: true,
  sortOrder: index,
}));

export function findRegionBySourceLabel(sourceLabel: string): Region | null {
  return REGIONS.find((region) => region.sourceLabels.includes(sourceLabel)) ?? null;
}

export function findRegionByCode(code: string): Region | null {
  return REGIONS.find((region) => region.code === code) ?? null;
}

/**
 * 광역 시설의 소재 시·군을 주소에서 찾는다 (승인된 주소 기반 매핑 초안).
 * 주소에 "수원시"처럼 시·군 명칭이 포함된 경우에만 매칭하며 추정하지 않는다.
 */
export function findRegionCodeInAddress(address: string | null): RegionCode | null {
  if (address === null) {
    return null;
  }
  for (const region of REGIONS) {
    if (address.includes(region.label)) {
      return region.code;
    }
  }
  return null;
}
