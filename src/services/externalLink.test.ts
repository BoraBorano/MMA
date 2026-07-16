import {
  buildFacilityActionLinks,
  buildNaverMapSearchUrl,
  buildTelUri,
  hasNoActionLinks,
} from "@/services/externalLink";
import type { Facility } from "@/types";

function makeFacility(overrides: Partial<Facility>): Facility {
  return {
    facilityId: "f-001",
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

describe("buildTelUri", () => {
  it("tel: URI를 생성한다", () => {
    expect(buildTelUri("031-292-1266")).toBe("tel:031-292-1266");
  });
});

describe("buildNaverMapSearchUrl", () => {
  it("시설명과 주소를 인코딩해 네이버 지도 검색 URL을 만든다", () => {
    const url = buildNaverMapSearchUrl(
      "과천시 시립예술단체",
      "경기도 과천시 통영로 5 (중앙동) 과천시민회관 2층",
    );
    expect(url).toBe(
      "https://map.naver.com/p/search/" +
        encodeURIComponent("과천시 시립예술단체 경기도 과천시 통영로 5 (중앙동) 과천시민회관 2층"),
    );
    expect(url.startsWith("https://map.naver.com/p/search/")).toBe(true);
  });
});

describe("buildFacilityActionLinks — 버튼 노출 매트릭스 8조합 (PRD 18.1)", () => {
  const cases: Array<{
    label: string;
    facility: Partial<Facility>;
    expectTel: boolean;
    expectHomepage: boolean;
    expectMap: boolean;
  }> = [
    {
      label: "연락처 O / URL O / 주소 O",
      facility: { phoneTel: "02-1234-5678", homepageUrl: "https://a.com", address: "서울" },
      expectTel: true,
      expectHomepage: true,
      expectMap: true,
    },
    {
      label: "연락처 O / URL X / 주소 O",
      facility: { phoneTel: "02-1234-5678", homepageUrl: null, address: "서울" },
      expectTel: true,
      expectHomepage: false,
      expectMap: true,
    },
    {
      label: "연락처 X / URL O / 주소 O",
      facility: { phoneTel: null, homepageUrl: "https://a.com", address: "서울" },
      expectTel: false,
      expectHomepage: true,
      expectMap: true,
    },
    {
      label: "연락처 X / URL X / 주소 O",
      facility: { phoneTel: null, homepageUrl: null, address: "서울" },
      expectTel: false,
      expectHomepage: false,
      expectMap: true,
    },
    {
      label: "연락처 O / URL O / 주소 X",
      facility: { phoneTel: "02-1234-5678", homepageUrl: "https://a.com", address: null },
      expectTel: true,
      expectHomepage: true,
      expectMap: false,
    },
    {
      label: "연락처 X / URL O / 주소 X",
      facility: { phoneTel: null, homepageUrl: "https://a.com", address: null },
      expectTel: false,
      expectHomepage: true,
      expectMap: false,
    },
    {
      label: "연락처 O / URL X / 주소 X",
      facility: { phoneTel: "02-1234-5678", homepageUrl: null, address: null },
      expectTel: true,
      expectHomepage: false,
      expectMap: false,
    },
    {
      label: "모두 없음",
      facility: { phoneTel: null, homepageUrl: null, address: null },
      expectTel: false,
      expectHomepage: false,
      expectMap: false,
    },
  ];

  it.each(cases)("$label", ({ facility, expectTel, expectHomepage, expectMap }) => {
    const links = buildFacilityActionLinks(makeFacility(facility));
    expect(links.tel !== null).toBe(expectTel);
    expect(links.homepage !== null).toBe(expectHomepage);
    expect(links.map !== null).toBe(expectMap);
  });

  it("모두 없을 때만 hasNoActionLinks가 true다", () => {
    expect(hasNoActionLinks(buildFacilityActionLinks(makeFacility({})))).toBe(true);
    expect(
      hasNoActionLinks(
        buildFacilityActionLinks(makeFacility({ phoneTel: "02-1234-5678" })),
      ),
    ).toBe(false);
  });
});
