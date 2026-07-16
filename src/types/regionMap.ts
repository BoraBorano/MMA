/**
 * 고정형 경기도 SVG 도식 지도 (viewBox 0 0 800 944).
 * 지역 선택 화면과 PX 찾기가 공유하는 지도 데이터 타입이다.
 */
export interface RegionMapEntry {
  region: string;
  displayName: string;
  paths: string[];
  label: [number, number];
}

export type RegionMap = RegionMapEntry[];
