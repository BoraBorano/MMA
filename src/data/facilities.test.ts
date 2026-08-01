import dataset from "../../public/data/facilities.json";
import { CATEGORIES } from "@/data/categoryConfig";
import { REGIONS } from "@/data/regionConfig";
import type { Facility, FacilityDataset } from "@/types";

/**
 * 변환 산출물 검증 — PRD 10.1 데이터 현황 및 Iteration 1 확정 결정과 대조.
 * 이 테스트가 깨지면 데이터 갱신 내용을 담당자와 확인해야 한다.
 */
const { facilities, dataUpdatedAt } = dataset as FacilityDataset;
const published = facilities.filter((facility) => facility.isActive);

describe("facilities.json 데이터 검증", () => {
  it("데이터 기준일은 2026-04-30이다", () => {
    expect(dataUpdatedAt).toBe("2026-04-30");
  });

  it("총 491건, 공개 489건이다 (남부 433 + 북부 58)", () => {
    expect(facilities).toHaveLength(491);
    expect(published).toHaveLength(489);
  });

  it("소스별 소계가 일치한다 — 경인 433건 / 경기북부 58건", () => {
    const bySource = (key: Facility["sourceKey"]) =>
      facilities.filter((f) => f.sourceKey === key);
    expect(bySource("f")).toHaveLength(433);
    expect(bySource("n")).toHaveLength(58);
    expect(facilities.every((f) => f.sourceKey === "f" || f.sourceKey === "n")).toBe(true);
  });

  it("facilityId는 소스 접두어 + 원본 연번 3자리다", () => {
    for (const facility of facilities) {
      expect(facility.facilityId).toBe(
        `${facility.sourceKey}-${String(facility.sourceRowNumber).padStart(3, "0")}`,
      );
    }
  });

  it("비공개 2건은 감면 내용 누락 건이다 (남부 연번 39, 41)", () => {
    const needsReview = facilities.filter((f) => f.dataStatus === "needs_review");
    expect(needsReview.map((f) => f.facilityId).sort()).toEqual(["f-039", "f-041"]);
    expect(needsReview.every((f) => !f.isActive)).toBe(true);
  });

  it("광역(경기도) 시설은 4건이며 소재 시·군이 매핑되어 있다", () => {
    const provincial = facilities.filter((f) => f.isProvincial);
    expect(provincial).toHaveLength(4);
    const mapping = Object.fromEntries(
      provincial.map((f) => [f.sourceRowNumber, f.displayRegionCode]),
    );
    expect(mapping).toEqual({ 14: "suwon", 15: "siheung", 143: "osan", 144: "hwaseong" });
    expect(provincial.every((f) => f.categoryCode === "sports")).toBe(true);
    expect(provincial.every((f) => f.displayRegionLabel === "경기도")).toBe(true);
  });

  it("모든 시설의 지역·업종 코드가 정의된 값이다", () => {
    const regionCodes = new Set(REGIONS.map((region) => region.code));
    const categoryCodes = new Set(CATEGORIES.map((category) => category.code));
    for (const facility of facilities) {
      expect(categoryCodes.has(facility.categoryCode)).toBe(true);
      if (!facility.isProvincial) {
        expect(facility.displayRegionCode).not.toBeNull();
      }
      if (facility.displayRegionCode !== null) {
        expect(regionCodes.has(facility.displayRegionCode)).toBe(true);
      }
    }
  });

  it("필드 보유 통계가 검증된 수치와 일치한다 (PRD 10.1 v1.1 + 북부 병합)", () => {
    const count = (predicate: (facility: Facility) => boolean) =>
      facilities.filter(predicate).length;
    expect(count((f) => f.homepageUrl !== null)).toBe(86);
    expect(count((f) => f.address !== null)).toBe(311);
    expect(count((f) => f.phoneTel !== null)).toBe(143);
    expect(count((f) => f.note !== null)).toBe(376);
  });

  it("좌표는 수집된 소스만 보유한다 — 북부 58건 / 남부 0건 (D8)", () => {
    const withCoords = facilities.filter((f) => f.lat !== null && f.lng !== null);
    expect(withCoords).toHaveLength(58);
    expect(withCoords.every((f) => f.sourceKey === "n")).toBe(true);
    expect(facilities.filter((f) => f.naverPlaceId !== null)).toHaveLength(58);
    // 좌표를 가진 건은 place_id도 함께 보유한다
    expect(withCoords.every((f) => f.naverPlaceId !== null)).toBe(true);
  });

  it("홈페이지 URL은 전부 http/https다", () => {
    for (const facility of facilities) {
      if (facility.homepageUrl !== null) {
        expect(facility.homepageUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  // f-001(과천시 시립예술단체)은 물리 시설이 아니라 지도 검색이 성립하지 않아 링크를 제거했다 (QA BUG-010) → 남부 253 - 1 = 252, 북부 58 전건 보유 → 310
  it("지도 링크 310건은 검증된 네이버지도 링크를 사용한다", () => {
    const mapLinks = facilities.filter((facility) => facility.naverMapUrl !== null);
    expect(mapLinks).toHaveLength(310);
    // 정밀 링크(entry/place) — 남부 54건 + 북부 58건 전건
    expect(
      mapLinks.filter((facility) => facility.naverMapUrl?.includes("/entry/place/")),
    ).toHaveLength(112);
    for (const facility of mapLinks) {
      expect(facility.naverMapUrl).toMatch(/^https:\/\/map\.naver\.com\/p\/(?:search|entry\/place)\//);
    }
  });

  // sourceRowNumber는 소스 간 값이 겹치므로 facilityId로 조회한다
  it("비고 원문이 보존된다 — 엑셀 원문 대조 표본 (AC-010)", () => {
    const byId = new Map(facilities.map((f) => [f.facilityId, f]));
    expect(byId.get("f-001")?.note).toBe(
      "과천시 시립예술단체 설치 및 운영 조례 시행규칙 별표9",
    );
    expect(byId.get("f-002")?.note).toBe("과천시 청소년수련관 설치 및 운영 조례 제11조");
    expect(byId.get("f-003")?.note).toBe("과천시 병역명문가 대상");
    // 북부 비고는 협약 근거·협약기간이 들어 있으나 동일하게 원문 유지한다 (D7)
    expect(byId.get("n-002")?.note).toBe("2010.1.1~ 계속");
    expect(byId.get("n-003")?.note).toBe("10.12.1.~ (소노휴 양평으로 명칭변경)");
    expect(byId.get("n-022")?.note).toBe("대한안과의사회 일괄 협약");
  });

  it("감면 내용의 개행이 보존된다 — 북부 n-056 (D6)", () => {
    const facility = facilities.find((f) => f.facilityId === "n-056");
    expect(facility?.facilityName).toBe("새빛안과병원");
    expect(facility?.benefitDescription.split("\n")).toHaveLength(3);
    expect(facility?.benefitDescription.startsWith("비급여 10%~20% 할인\n")).toBe(true);
    // 개행은 살리되 줄 안의 연속 공백은 정리한다 (n-012 원문 "무료  ," 등)
    expect(facilities.every((f) => !/ {2,}/.test(f.benefitDescription))).toBe(true);
  });

  it("전화 실행값은 tel URI에 사용할 수 있는 형식이다", () => {
    for (const facility of facilities) {
      if (facility.phoneTel !== null) {
        expect(facility.phoneTel).toMatch(/^[\d-]+$/);
      }
    }
  });

  it("facilityId가 고유하다", () => {
    expect(new Set(facilities.map((f) => f.facilityId)).size).toBe(facilities.length);
  });

  it("가상 시설·예시 데이터가 없다 — DEMO 표기 부재", () => {
    const serialized = JSON.stringify(facilities);
    expect(serialized).not.toContain("DEMO");
    expect(serialized).not.toContain("예시");
  });
});
