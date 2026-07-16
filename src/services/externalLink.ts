import type { Facility } from "@/types";

/** 전화 실행 URI (FR-017) */
export function buildTelUri(phoneTel: string): string {
  return `tel:${phoneTel}`;
}

/**
 * 시설명+주소로 네이버 지도 검색 (FR-019, PRD 16.5).
 * 값을 추정하지 않고 정제된 필드를 그대로 인코딩한다.
 */
export function buildNaverMapSearchUrl(facilityName: string, address: string): string {
  const query = `${facilityName} ${address}`;
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
    map:
      facility.address !== null
        ? buildNaverMapSearchUrl(facility.facilityName, facility.address)
        : null,
  };
}

export function hasNoActionLinks(links: FacilityActionLinks): boolean {
  return links.tel === null && links.homepage === null && links.map === null;
}
