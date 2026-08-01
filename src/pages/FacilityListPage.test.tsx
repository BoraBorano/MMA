import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { axe } from "vitest-axe";
import { AppShell } from "@/components/common/AppShell";
import { LiveRegionProvider } from "@/components/common/LiveRegion";
import { buildListStateKey, saveListState } from "@/lib/listStateStorage";
import { CategorySelectionPage } from "@/pages/CategorySelectionPage";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";
import { FacilityListPage } from "@/pages/FacilityListPage";
import * as facilityRepository from "@/services/facilityRepository";
import type { Facility, FacilityDataset } from "@/types";

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

/** MemoryRouter는 window.history와 독립적이므로 브라우저 뒤로가기를 navigate(-1)로 재현한다. */
function BrowserBackButton() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      테스트용 뒤로가기
    </button>
  );
}

function renderPage(dataset: FacilityDataset, initialPath = "/region/suwon/sports") {
  vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppShell>
        <Routes>
          <Route
            path="/region/:regionCode/:categoryCode"
            element={<FacilityListPage />}
          />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe("FacilityListPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    facilityRepository.resetFacilityDatasetCache();
    sessionStorage.clear();
  });

  it("경로와 제목, 안내 문구를 표시한다 (PRD 6.3.1)", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({})],
    };
    renderPage(dataset);
    expect(
      await screen.findByRole("heading", { name: "수원시 체육 시설이에요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "수원시" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "체육" })).toBeInTheDocument();
    expect(
      screen.getByText("시설을 누르면 혜택과 연락처를 볼 수 있어요."),
    ).toBeInTheDocument();
  });

  it("시설명과 감면 내용을 목록에 표시한다 (AC-008)", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({ facilityName: "수원시 체육관", benefitDescription: "30% 할인" }),
      ],
    };
    renderPage(dataset);
    const item = await screen.findByRole("link", { name: /수원시 체육관/ });
    expect(within(item).getByText("30% 할인")).toBeInTheDocument();
  });

  it("경기도 운영 시설 배지를 표시한다", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({ isProvincial: true, displayRegionLabel: "경기도" }),
      ],
    };
    renderPage(dataset);
    expect(await screen.findByText("경기도 운영 시설")).toBeInTheDocument();
  });

  it("시설명 부분 일치 검색이 즉시 결과를 갱신한다 (FR-011, AC-007)", async () => {
    const user = userEvent.setup();
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({ facilityId: "f-001", facilityName: "과천시 체육관" }),
        makeFacility({ facilityId: "f-002", facilityName: "수원시 수영장" }),
      ],
    };
    renderPage(dataset);
    await screen.findByText("총 2개 시설");
    const search = screen.getByRole("searchbox", { name: "시설 이름으로 찾기" });
    await user.type(search, "과천");
    const main = screen.getByRole("main");
    expect(await within(main).findByText("총 1개 시설")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /과천시 체육관/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /수원시 수영장/ })).toBeNull();
  });

  it("검색 지우기 버튼이 검색어를 초기화한다", async () => {
    const user = userEvent.setup();
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({})],
    };
    renderPage(dataset);
    const search = await screen.findByRole("searchbox");
    await user.type(search, "과천");
    await user.click(screen.getByRole("button", { name: "검색어 지우기" }));
    expect(search).toHaveValue("");
  });

  it("검색 결과가 없으면 '찾는 시설이 없어요' 상태를 표시한다 (AC-007)", async () => {
    const user = userEvent.setup();
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({ facilityName: "과천시 체육관" })],
    };
    renderPage(dataset);
    const search = await screen.findByRole("searchbox");
    await user.type(search, "존재하지않는시설");
    expect(await screen.findByText("찾는 시설이 없어요")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "다른 업종 보기" }),
    ).toHaveAttribute("href", "/region/suwon");
  });

  it("지역에 등록된 시설이 없으면 지역 시설 없음 상태를 표시한다 (6.1.3)", async () => {
    renderPage(
      { dataUpdatedAt: "2026-04-30", facilities: [] },
      "/region/gapyeong/education",
    );
    expect(
      await screen.findByText("이 지역에는 등록된 시설이 없어요."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "다른 지역 선택하기" }),
    ).toHaveAttribute("href", "/");
  });

  it("데이터 로딩 실패 시 오류 상태를 제공한다", async () => {
    vi.spyOn(facilityRepository, "loadFacilityDataset").mockRejectedValue(
      new Error("network"),
    );
    render(
      <MemoryRouter initialEntries={["/region/suwon/sports"]}>
        <LiveRegionProvider>
          <Routes>
            <Route
              path="/region/:regionCode/:categoryCode"
              element={<FacilityListPage />}
            />
          </Routes>
        </LiveRegionProvider>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "최신 정보를 불러오지 못했어요" }),
    ).toBeInTheDocument();
  });

  it("상세→뒤로가기 시 검색어와 스크롤 위치를 복원한다 (AC-016)", async () => {
    const user = userEvent.setup();
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [
        makeFacility({ facilityId: "f-001", facilityName: "과천시 체육관" }),
        makeFacility({ facilityId: "f-002", facilityName: "수원시 수영장" }),
      ],
    };
    vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
    render(
      <MemoryRouter initialEntries={["/region/suwon/sports"]}>
        <AppShell>
          <BrowserBackButton />
          <Routes>
            <Route
              path="/region/:regionCode/:categoryCode"
              element={<FacilityListPage />}
            />
            <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
          </Routes>
        </AppShell>
      </MemoryRouter>,
    );

    const search = await screen.findByRole("searchbox");
    await user.type(search, "과천");
    await within(screen.getByRole("main")).findByText("총 1개 시설");

    await user.click(screen.getByRole("link", { name: /과천시 체육관/ }));
    await screen.findByRole("heading", { name: "과천시 체육관" });

    // 브라우저 뒤로가기와 동일한 효과 — navigate(-1)로 재현한다 (5.4)
    await user.click(screen.getByRole("button", { name: "테스트용 뒤로가기" }));

    const restoredSearch = await screen.findByRole("searchbox");
    expect(restoredSearch).toHaveValue("과천");
  });

  it("업종을 새로 선택해 진입하면(PUSH) 검색어가 초기화된다 — 새로고침(POP)과 구분 (5.4)", async () => {
    const user = userEvent.setup();
    const key = buildListStateKey("suwon", "sports");
    saveListState(key, { searchQuery: "이전 검색어", scrollY: 300 });

    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({})],
    };
    vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
    render(
      <MemoryRouter initialEntries={["/region/suwon"]}>
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

    const categoryLink = await screen.findByRole("link", { name: /6\. 체육/ });
    await user.click(categoryLink);

    const search = await screen.findByRole("searchbox");
    expect(search).toHaveValue("");
  });

  it("접근성 위반이 없다", async () => {
    const dataset: FacilityDataset = {
      dataUpdatedAt: "2026-04-30",
      facilities: [makeFacility({})],
    };
    const { container } = renderPage(dataset);
    await screen.findByText("총 1개 시설");
    expect(await axe(container)).toHaveNoViolations();
  });
});
