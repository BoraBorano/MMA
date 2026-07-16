import type { Facility } from "@/types";

/** 전화 실행 URI (FR-017) */
export function buildTelUri(phoneTel: string): string {
  return `tel:${phoneTel}`;
}

/** 검증된 상호명과 실제 시군만 사용하는 네이버지도 검색 링크. */
export function buildNaverMapSearchUrl(facilityName: string, locality: string): string {
  const query = `${facilityName} ${locality}`;
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export interface FacilityActionLinks {
  tel: string | null;
  homepage: string | null;
  map: string | null;
}

/** 시설의 유효 데이터 기준 행동 링크 (PRD 18.1 버튼 노출 매트릭스) */
export function buildFacilityActionLinks(facility: Facility): FacilityActionLinks {
  return {
    tel: facility.phoneTel !== null ? buildTelUri(facility.phoneTel) : null,
    homepage: facility.homepageUrl,
    map: facility.naverMapUrl ?? null,
  };
}

export function hasNoActionLinks(links: FacilityActionLinks): boolean {
  return links.tel === null && links.homepage === null && links.map === null;
}
