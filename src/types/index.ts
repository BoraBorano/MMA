/** 화면 업종 코드 — 정확히 7개, 순서 고정 (PRD 6.2) */
export type CategoryCode =
  | "education"
  | "culture"
  | "lodging"
  | "medical"
  | "parking"
  | "sports"
  | "etc";

/** 경기도 31개 시·군 */
export type RegionCode =
  | "gapyeong"
  | "goyang"
  | "gwacheon"
  | "gwangmyeong"
  | "gwangju"
  | "guri"
  | "gunpo"
  | "gimpo"
  | "namyangju"
  | "dongducheon"
  | "bucheon"
  | "seongnam"
  | "suwon"
  | "siheung"
  | "ansan"
  | "anseong"
  | "anyang"
  | "yangju"
  | "yangpyeong"
  | "yeoju"
  | "yeoncheon"
  | "osan"
  | "yongin"
  | "uiwang"
  | "uijeongbu"
  | "icheon"
  | "paju"
  | "pyeongtaek"
  | "pocheon"
  | "hanam"
  | "hwaseong";

export type BenefitType = "면제" | "할인";

export type FacilityDataStatus = "published" | "needs_review" | "inactive";

export type ExternalLinkType = "tel" | "homepage" | "map";

/** 원본 소스 식별자 — f: 경인지방병무청, n: 경기북부지청 */
export type SourceKey = "f" | "n";

export interface Facility {
  facilityId: string;
  /** 출처 추적용. 화면에는 노출하지 않는다 */
  sourceKey: SourceKey;
  /** 원본 엑셀 연번. 소스가 다르면 값이 겹칠 수 있어 단독 키로 쓰지 않는다 */
  sourceRowNumber: number;
  sourceRegion: string;
  /** 지역값이 "경기도"인 광역 시설 — 모든 시·군 목록에 공통 표출 */
  isProvincial: boolean;
  /** 광역 시설은 주소 기반 소재 시·군 (승인 초안) */
  displayRegionCode: RegionCode | null;
  displayRegionLabel: string;
  categorySource: string;
  categoryCode: CategoryCode;
  categoryLabel: string;
  facilityName: string;
  benefitTarget: string;
  benefitDescription: string;
  benefitType: BenefitType;
  organizationType: string | null;
  /** 비고 — 원문 유지, 가공 금지 (FR-015) */
  note: string | null;
  homepageUrl: string | null;
  /** 검증된 네이버지도 장소 또는 단축 검색 링크. 주소만으로 즉석 생성하지 않는다. */
  naverMapUrl?: string | null;
  /** 네이버지도 place_id — 수집된 소스만 보유. MVP 화면 미사용 */
  naverPlaceId: string | null;
  /** 위도 — 수집된 소스만 보유. MVP 화면 미사용 */
  lat: number | null;
  /** 경도 — 수집된 소스만 보유. MVP 화면 미사용 */
  lng: number | null;
  address: string | null;
  phoneDisplay: string | null;
  phoneTel: string | null;
  imageUrl: string | null;
  sourceUpdatedAt: string;
  dataStatus: FacilityDataStatus;
  isActive: boolean;
}

export interface FacilityDataset {
  dataUpdatedAt: string;
  facilities: Facility[];
}

/** 시·도 코드 — 전국 확장 대비. 현재는 경기도만 존재한다 */
export type ProvinceCode = "gyeonggi";

export interface Region {
  code: RegionCode;
  label: string;
  /** 소속 시·도. 타 시·도 확장 시 지역 코드 충돌을 가려내는 기준이 된다 */
  provinceCode: ProvinceCode;
  /** 엑셀 원문 지역값 매칭 목록 */
  sourceLabels: string[];
  isPublished: boolean;
  sortOrder: number;
}

export interface Category {
  code: CategoryCode;
  label: string;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  sourceLabels: string[];
  iconName: string;
}
