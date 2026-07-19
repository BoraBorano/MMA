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

  it("총 433건, 공개 431건이다 (확정 결정)", () => {
    expect(facilities).toHaveLength(433);
    expect(published).toHaveLength(431);
  });

  it("비공개 2건은 감면 내용 누락 건이다 (연번 39, 41)", () => {
    const needsReview = facilities.filter((f) => f.dataStatus === "needs_review");
    expect(needsReview.map((f) => f.sourceRowNumber).sort((a, b) => a - b)).toEqual([
      39, 41,
    ]);
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

  it("필드 보유 통계가 검증된 수치와 일치한다 (PRD 10.1 v1.1)", () => {
    const count = (predicate: (facility: Facility) => boolean) =>
      facilities.filter(predicate).length;
    expect(count((f) => f.homepageUrl !== null)).toBe(85);
    expect(count((f) => f.address !== null)).toBe(253);
    expect(count((f) => f.phoneTel !== null)).toBe(86);
    expect(count((f) => f.note !== null)).toBe(369);
  });

  it("홈페이지 URL은 전부 http/https다", () => {
    for (const facility of facilities) {
      if (facility.homepageUrl !== null) {
        expect(facility.homepageUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  // f-001(과천시 시립예술단체)은 물리 시설이 아니라 지도 검색이 성립하지 않아 링크를 제거했다 (QA BUG-010) → 253 - 1 = 252
  it("지도 링크 252건은 검증된 네이버지도 링크를 사용한다", () => {
    const mapLinks = facilities.filter((facility) => facility.naverMapUrl !== null);
    expect(mapLinks).toHaveLength(252);
    expect(
      mapLinks.filter((facility) => facility.naverMapUrl?.includes("/entry/place/")),
    ).toHaveLength(54);
    for (const facility of mapLinks) {
      expect(facility.naverMapUrl).toMatch(/^https:\/\/map\.naver\.com\/p\/(?:search|entry\/place)\//);
    }
  });

  it("비고 원문이 보존된다 — 엑셀 원문 대조 표본 (AC-010)", () => {
    const byRow = new Map(facilities.map((f) => [f.sourceRowNumber, f]));
    expect(byRow.get(1)?.note).toBe(
      "과천시 시립예술단체 설치 및 운영 조례 시행규칙 별표9",
    );
    expect(byRow.get(2)?.note).toBe("과천시 청소년수련관 설치 및 운영 조례 제11조");
    expect(byRow.get(3)?.note).toBe("과천시 병역명문가 대상");
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
