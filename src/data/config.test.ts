import { CATEGORIES, findCategoryBySourceLabel } from "@/data/categoryConfig";
import {
  REGIONS,
  findRegionBySourceLabel,
  findRegionCodeInAddress,
} from "@/data/regionConfig";

describe("categoryConfig", () => {
  it("업종은 정확히 7개다 (FR-007)", () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it("번호 1~7이 중복 없이 부여된다", () => {
    expect(CATEGORIES.map((category) => category.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("가운뎃점 원문 '숙박·관광'을 '숙박&관광'으로 매핑한다", () => {
    const category = findCategoryBySourceLabel("숙박·관광");
    expect(category?.code).toBe("lodging");
    expect(category?.label).toBe("숙박&관광");
  });

  it("미정의 업종값은 null을 반환한다 — 조용한 보정 금지", () => {
    expect(findCategoryBySourceLabel("스포츠")).toBeNull();
  });
});

describe("regionConfig", () => {
  it("경기도 31개 시·군을 정의한다", () => {
    expect(REGIONS).toHaveLength(31);
    expect(new Set(REGIONS.map((region) => region.code)).size).toBe(31);
  });

  it("기본 정렬은 가나다순이다 (PRD 6.1.1)", () => {
    const labels = REGIONS.map((region) => region.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, "ko")));
  });

  it("원문 지역값을 표시명으로 매핑한다 (수원 → 수원시)", () => {
    expect(findRegionBySourceLabel("수원")?.label).toBe("수원시");
  });

  it("미정의 지역값은 null을 반환한다", () => {
    expect(findRegionBySourceLabel("서울")).toBeNull();
  });

  it("광역 시설 주소에서 소재 시·군을 찾는다 (승인된 주소 기반 매핑)", () => {
    expect(findRegionCodeInAddress("경기도 수원시 권선구 서수원로63번길 127")).toBe("suwon");
    expect(findRegionCodeInAddress("경기 화성시 만세구 양감면 사격장길 142")).toBe("hwaseong");
    expect(findRegionCodeInAddress(null)).toBeNull();
    expect(findRegionCodeInAddress("서울특별시 용산구")).toBeNull();
  });
});
