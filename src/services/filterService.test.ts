import { countByCategoryInRegion, filterByRegionAndCategory, searchByFacilityName } from "@/services/filterService";
import type { Facility } from "@/types";

function makeFacility(overrides: Partial<Facility>): Facility {
  return {
    facilityId: "f-001",
    sourceKey: "f",
    sourceRowNumber: 1,
    sourceRegion: "수원",
    isProvincial: false,
    displayRegionCode: "suwon",
    displayRegionLabel: "수원시",
    categorySource: "체육",
    categoryCode: "sports",
    categoryLabel: "체육",
    facilityName: "테스트 시설",
    benefitTarget: "예우대상자",
    benefitDescription: "50% 감면",
    benefitType: "할인",
    organizationType: null,
    note: null,
    homepageUrl: null,
    naverPlaceId: null,
    lat: null,
    lng: null,
    address: null,
    phoneDisplay: null,
    phoneTel: null,
    imageUrl: null,
    sourceUpdatedAt: "2026-04-30",
    dataStatus: "published",
    isActive: true,
    ...overrides,
  };
}

describe("filterByRegionAndCategory", () => {
  const suwonSports = makeFacility({ facilityId: "f-001" });
  const bucheonSports = makeFacility({
    facilityId: "f-002",
    displayRegionCode: "bucheon",
    displayRegionLabel: "부천시",
  });
  const provincialSports = makeFacility({
    facilityId: "f-003",
    isProvincial: true,
    displayRegionCode: "suwon",
    displayRegionLabel: "경기도",
  });
  const suwonMedical = makeFacility({
    facilityId: "f-004",
    categoryCode: "medical",
    categoryLabel: "의료",
  });

  const facilities = [suwonSports, bucheonSports, provincialSports, suwonMedical];

  it("지역·업종이 일치하는 시설만 반환한다", () => {
    expect(filterByRegionAndCategory(facilities, "suwon", "sports")).toEqual([
      suwonSports,
      provincialSports,
    ]);
  });

  it("광역 시설은 모든 지역에 공통 표출된다 (확정 결정 5)", () => {
    const bucheonResult = filterByRegionAndCategory(facilities, "bucheon", "sports");
    expect(bucheonResult).toContainEqual(provincialSports);
    expect(bucheonResult).toEqual([bucheonSports, provincialSports]);
  });
});

describe("countByCategoryInRegion", () => {
  it("지역별 업종 카운트에 광역 시설을 포함한다", () => {
    const facilities = [
      makeFacility({ facilityId: "f-001", displayRegionCode: "suwon" }),
      makeFacility({
        facilityId: "f-002",
        isProvincial: true,
        displayRegionCode: "suwon",
      }),
      makeFacility({ facilityId: "f-003", displayRegionCode: "bucheon" }),
    ];
    const suwonCounts = countByCategoryInRegion(facilities, "suwon");
    expect(suwonCounts.sports).toBe(2);

    const bucheonCounts = countByCategoryInRegion(facilities, "bucheon");
    // 광역 시설은 부천에도 공통 표출되므로 1(부천 자체) + 1(광역) = 2가 아니라
    // f-002는 suwon 소재이지만 isProvincial=true이므로 부천에도 포함된다.
    expect(bucheonCounts.sports).toBe(2);
  });

  it("모든 업종 키를 0으로 초기화한다", () => {
    const counts = countByCategoryInRegion([], "suwon");
    expect(counts).toEqual({
      education: 0,
      culture: 0,
      lodging: 0,
      medical: 0,
      parking: 0,
      sports: 0,
      etc: 0,
    });
  });
});

describe("searchByFacilityName", () => {
  const facilities = [
    makeFacility({ facilityId: "f-001", facilityName: "과천시 시립예술단체" }),
    makeFacility({ facilityId: "f-002", facilityName: "과천시 청소년수련관" }),
    makeFacility({ facilityId: "f-003", facilityName: "수원시 체육관" }),
  ];

  it("부분 일치 검색을 수행한다", () => {
    expect(searchByFacilityName(facilities, "과천")).toHaveLength(2);
  });

  it("앞뒤·연속 공백을 정리한다", () => {
    expect(searchByFacilityName(facilities, "  과천  ")).toHaveLength(2);
  });

  it("빈 검색어는 전체를 반환한다", () => {
    expect(searchByFacilityName(facilities, "")).toHaveLength(3);
  });

  it("일치 결과가 없으면 빈 배열", () => {
    expect(searchByFacilityName(facilities, "존재하지않음")).toEqual([]);
  });
});
