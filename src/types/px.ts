/**
 * 경기도 군마트(PX) 찾기 — 예우시설 기능과 독립된 부가 기능이다.
 * 예우시설 스키마·상태와 섞지 않는다.
 */

export interface PxStoreHours {
  weekday: string;
  saturday: string;
  sunday: string;
}

export interface PxStore {
  id: string;
  name: string;
  officialName: string;
  region: string;
  address: string;
  phone: string | null;
  hours: PxStoreHours;
  lunchHours: PxStoreHours;
  note: string | null;
  /** 표시용 위치 후보 — 국방부 공식 필드가 아니다 (2차 자료 대조값) */
  lat: number | null;
  lng: number | null;
  /** 800×944 고정형 SVG 지도 마커 좌표 */
  svgX: number | null;
  svgY: number | null;
  markerPositionStatus: string;
  naverMapUrl: string;
  welfarePortalUrl: string;
}

export interface PxDatasetMetadata {
  title: string;
  officialReferenceDate: string;
  officialRowCountNationwide: number;
  gyeonggiStoreCount: number;
  officialDataUrl: string;
  officialSheetUrl: string;
  coordinateNotice: string;
  naverLinkNotice: string;
  operatingHoursNotice: string;
  licenseNotice: string;
}

export interface PxDataset {
  metadata: PxDatasetMetadata;
  stores: PxStore[];
}

/** 고정형 경기도 SVG 도식 지도 — 지역 선택 화면과 공유 (src/types/regionMap.ts) */
export type { RegionMapEntry as PxRegionMapEntry, RegionMap as PxRegionMap } from "./regionMap";

/** 화면에 배치할 마커 좌표 — 근접 마커 겹침 해소 후 값 */
export interface PxMarkerPosition {
  store: PxStore;
  x: number;
  y: number;
}
