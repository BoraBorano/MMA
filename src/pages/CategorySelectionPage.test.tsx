import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "vitest-axe";
import { LiveRegionProvider } from "@/components/common/LiveRegion";
import { CATEGORIES } from "@/data/categoryConfig";
import { CategorySelectionPage } from "@/pages/CategorySelectionPage";
import { FacilityListPage } from "@/pages/FacilityListPage";
import * as facilityRepository from "@/services/facilityRepository";
import type { Facility, FacilityDataset } from "@/types";

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

function renderPage(dataset: FacilityDataset, initialPath = "/region/suwon") {
  vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LiveRegionProvider>
        <Routes>
          <Route path="/region/:regionCode" element={<CategorySelectionPage />} />
          <Route
            path="/region/:regionCode/:categoryCode"
            element={<FacilityListPage />}
          />
        </Routes>
      </LiveRegionProvider>
    </MemoryRouter>,
  );
}

describe("CategorySelectionPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    facilityRepository.resetFacilityDatasetCache();
    sessionStorage.clear();
  });

  it("업종 정확히 7개를 표시하고 전체 보기 버튼이 없다 (FR-007, FR-008, AC-005)", async () => {
    renderPage({ dataUpdatedAt: "2026-04-30", facilities: [] });
    const buttons = await screen.findAllByRole("button", { name: /등록 시설 없음/ });
    expect(buttons).toHaveLength(7);
    expect(screen.queryByText(/전체/)).toBeNull();
    for (const category of CATEGORIES) {
      expect(screen.getByText(new RegExp(`${category.number}\\. ${category.label}`))).toBeInTheDocument();
    }
  });

  it("시설이 있는 지역·업종에서 수원·문화만 표시한다 (AC-004)", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({
          facilityId: "f-001",
          categoryCode: "culture",
          categoryLabel: "문화",
        }),
        makeFacility({
          facilityId: "f-002",
          displayRegionCode: "bucheon",
          categoryCode: "culture",
          categoryLabel: "문화",
        }),
      ],
    };
    renderPage(dataset);
    const cultureLink = await screen.findByRole("link", { name: /문화/ });
    expect(within(cultureLink).getByText("1개 시설")).toBeInTheDocument();
  });

  it("경기도 광역 시설은 다른 지역의 카운트에도 포함된다 (확정 결정 5)", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({
          facilityId: "f-014",
          isProvincial: true,
          sourceRegion: "경기도",
          displayRegionLabel: "경기도",
          displayRegionCode: "suwon",
        }),
      ],
    };
    renderPage(dataset, "/region/bucheon");
    const sportsLink = await screen.findByRole("link", { name: /체육/ });
    expect(within(sportsLink).getByText("1개 시설")).toBeInTheDocument();
  });

  it("빈 업종은 비활성 버튼이며 클릭해도 이동하지 않는다 (FR-009, AC-006)", async () => {
    const user = userEvent.setup();
    renderPage({ dataUpdatedAt: "2026-04-30", facilities: [] });
    const button = await screen.findByRole("button", { name: /1\. 교육/ });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(screen.queryByText(/시설이에요/)).toBeNull();
  });

  it("시설 있는 업종 선택 시 목록 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({ categoryCode: "sports", categoryLabel: "체육" })],
    };
    renderPage(dataset);
    const link = await screen.findByRole("link", { name: /6\. 체육/ });
    await user.click(link);
    expect(
      await screen.findByRole("heading", { name: "수원시 체육 시설이에요" }),
    ).toBeInTheDocument();
  });

  it("데이터 로딩 실패 시 오류 상태와 다시 시도를 제공한다 (AC-017)", async () => {
    vi.spyOn(facilityRepository, "loadFacilityDataset").mockRejectedValue(
      new Error("network"),
    );
    render(
      <MemoryRouter initialEntries={["/region/suwon"]}>
        <Routes>
          <Route path="/region/:regionCode" element={<CategorySelectionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "최신 정보를 불러오지 못했어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도하기" })).toBeInTheDocument();
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderPage({ dataUpdatedAt: "2026-04-30", facilities: [] });
    await screen.findAllByRole("button", { name: /등록 시설 없음/ });
    expect(await axe(container)).toHaveNoViolations();
  });
});
