import {
  applyPxFilters,
  filterPxStoresByRegion,
  findPxStoreById,
  formatOfficialReferenceDate,
  getAvailablePxRegions,
  resolvePxMarkerPositions,
  searchPxStores,
} from "@/services/pxFilterService";
import type { PxStore } from "@/types/px";

function makeStore(overrides: Partial<PxStore>): PxStore {
  return {
    id: "01-테스트",
    name: "테스트",
    officialName: "테스트(영외)",
    region: "수원",
    address: "경기도 수원시 어딘가 1",
    phone: "031-000-0000",
    hours: { weekday: "10:00~19:00", saturday: "10:00~16:00", sunday: "휴무 또는 미제공" },
    lunchHours: { weekday: "13:00~14:00", saturday: "", sunday: "" },
    note: "",
    lat: 37.0,
    lng: 127.0,
    svgX: 300,
    svgY: 400,
    markerPositionStatus: "projected-coordinate",
    naverMapUrl: "https://map.naver.com/p/search/test",
    welfarePortalUrl: "https://www.welfare.mil.kr",
    ...overrides,
  };
}

describe("searchPxStores", () => {
  const stores = [
    makeStore({ id: "a", name: "맹호", officialName: "맹호(영외)", region: "가평", address: "경기도 가평군" }),
    makeStore({ id: "b", name: "횃불", officialName: "횃불(영외)", region: "가평", address: "경기도 가평군" }),
    makeStore({ id: "c", name: "수원점", officialName: "수원점(영외)", region: "수원", address: "경기도 수원시" }),
  ];

  it("매장명 부분 일치 검색", () => {
    expect(searchPxStores(stores, "맹호")).toEqual([stores[0]]);
  });

  it("지역명으로도 검색된다", () => {
    expect(searchPxStores(stores, "가평")).toHaveLength(2);
  });

  it("주소로도 검색된다", () => {
    expect(searchPxStores(stores, "수원시")).toEqual([stores[2]]);
  });

  it("앞뒤·연속 공백을 정리한다", () => {
    expect(searchPxStores(stores, "  가평  ")).toHaveLength(2);
  });

  it("빈 검색어는 전체를 반환한다", () => {
    expect(searchPxStores(stores, "")).toHaveLength(3);
  });
});

describe("filterPxStoresByRegion / applyPxFilters", () => {
  const stores = [
    makeStore({ id: "a", name: "맹호", region: "가평" }),
    makeStore({ id: "b", name: "수원점", region: "수원" }),
  ];

  it("region이 null이면 전체 반환", () => {
    expect(filterPxStoresByRegion(stores, null)).toHaveLength(2);
  });

  it("region으로 필터링", () => {
    expect(filterPxStoresByRegion(stores, "가평")).toEqual([stores[0]]);
  });

  it("검색어와 지역 필터를 동시 적용한다", () => {
    const result = applyPxFilters(stores, "맹", "가평");
    expect(result).toEqual([stores[0]]);
    expect(applyPxFilters(stores, "맹", "수원")).toEqual([]);
  });
});

describe("getAvailablePxRegions", () => {
  it("실제 매장이 있는 지역만 매장 수와 함께 가나다순으로 반환한다", () => {
    const stores = [
      makeStore({ id: "a", region: "수원" }),
      makeStore({ id: "b", region: "가평" }),
      makeStore({ id: "c", region: "가평" }),
    ];
    expect(getAvailablePxRegions(stores)).toEqual([
      { region: "가평", count: 2 },
      { region: "수원", count: 1 },
    ]);
  });
});

describe("resolvePxMarkerPositions", () => {
  it("겹치지 않는 마커는 원래 좌표를 유지한다", () => {
    const stores = [
      makeStore({ id: "a", svgX: 100, svgY: 100 }),
      makeStore({ id: "b", svgX: 500, svgY: 500 }),
    ];
    const positions = resolvePxMarkerPositions(stores);
    expect(positions).toEqual([
      { store: stores[0], x: 100, y: 100 },
      { store: stores[1], x: 500, y: 500 },
    ]);
  });

  it("근접한 마커는 반경형으로 펼치고 실제 lat/lng는 바꾸지 않는다", () => {
    const stores = [
      makeStore({ id: "b", svgX: 200, svgY: 200, lat: 1, lng: 1 }),
      makeStore({ id: "a", svgX: 202, svgY: 201, lat: 2, lng: 2 }),
    ];
    const positions = resolvePxMarkerPositions(stores);
    expect(positions).toHaveLength(2);
    // 클러스터 중심에서 벗어난 위치로 펼쳐진다 — 정확히 원좌표와 같지 않다
    for (const position of positions) {
      expect(position.x === 200 && position.y === 200).toBe(false);
      expect(position.store.lat).toBe(position.store.id === "a" ? 2 : 1);
    }
    // id 오름차순으로 결정적으로 정렬되어 렌더링이 항상 동일하다
    expect(positions[0].store.id).toBe("a");
  });

  it("좌표가 없는 매장은 제외한다", () => {
    const stores = [makeStore({ id: "a", svgX: null, svgY: null })];
    expect(resolvePxMarkerPositions(stores)).toEqual([]);
  });
});

describe("findPxStoreById", () => {
  it("id로 매장을 찾는다", () => {
    const stores = [makeStore({ id: "a" }), makeStore({ id: "b" })];
    expect(findPxStoreById(stores, "b")?.id).toBe("b");
    expect(findPxStoreById(stores, "z")).toBeUndefined();
  });
});

describe("formatOfficialReferenceDate", () => {
  it("ISO 날짜를 한국식 표기로 변환한다", () => {
    expect(formatOfficialReferenceDate("2026-04-28")).toBe("2026. 4. 28.");
  });
});
