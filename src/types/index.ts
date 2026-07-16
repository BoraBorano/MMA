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

export interface Facility {
  facilityId: string;
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

export interface Region {
  code: RegionCode;
  label: string;
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
