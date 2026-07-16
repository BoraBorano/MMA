import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "vitest-axe";
import { AppShell } from "@/components/common/AppShell";
import { PxDetailPage } from "@/pages/PxDetailPage";
import { PxFinderPage } from "@/pages/PxFinderPage";
import * as pxRepository from "@/services/pxRepository";
import type { PxDataset, PxRegionMap, PxStore } from "@/types/px";

function makeStore(overrides: Partial<PxStore>): PxStore {
  const name = overrides.name ?? "맹호";
  return {
    id: "01-맹호",
    name,
    officialName: `${name}(영외)`,
    region: "가평",
    address: "경기도 가평군 조종면 청군로 1208",
    phone: "031-584-8487",
    hours: { weekday: "10:00~19:00", saturday: "10:00~17:00", sunday: "휴무 또는 미제공" },
    lunchHours: { weekday: "13:00~14:00", saturday: "", sunday: "" },
    note: "",
    lat: 37.82,
    lng: 127.51,
    svgX: 616.14,
    svgY: 315,
    markerPositionStatus: "projected-coordinate",
    naverMapUrl: "https://map.naver.com/p/search/test",
    welfarePortalUrl: "https://www.welfare.mil.kr",
    ...overrides,
  };
}

const regionMap: PxRegionMap = [
  { region: "가평", displayName: "가평군", paths: ["M0 0 L1 1 Z"], label: [0, 0] },
  { region: "수원", displayName: "수원시", paths: ["M2 2 L3 3 Z"], label: [2, 2] },
];

function mockPxData(stores: PxStore[]) {
  const dataset: PxDataset = {
    metadata: {
      title: "경기도 국군복지단 영외마트 PX 편의 데이터",
      officialReferenceDate: "2026-04-28",
      officialRowCountNationwide: 120,
      gyeonggiStoreCount: stores.length,
      officialDataUrl: "https://www.data.go.kr/data/15126305/fileData.do",
      officialSheetUrl: "https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645",
      coordinateNotice: "",
      naverLinkNotice: "",
      operatingHoursNotice: "",
      licenseNotice: "",
    },
    stores,
  };
  vi.spyOn(pxRepository, "loadPxDataset").mockResolvedValue(dataset);
  vi.spyOn(pxRepository, "loadPxRegionMap").mockResolvedValue(regionMap);
}

function renderFinder() {
  return render(
    <MemoryRouter initialEntries={["/px"]}>
      <AppShell>
        <Routes>
          <Route path="/px" element={<PxFinderPage />} />
          <Route path="/px/:storeId" element={<PxDetailPage />} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe("PxFinderPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    pxRepository.resetPxCache();
  });

  it("제목과 안내 문구를 표시한다", async () => {
    mockPxData([makeStore({})]);
    renderFinder();
    expect(
      await screen.findByRole("heading", { name: "경기도 군마트 찾기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("가까운 영외마트의 위치와 운영시간을 확인해 보세요."),
    ).toBeInTheDocument();
  });

  it("데이터에 있는 시·군만 지역 필터에 매장 수와 함께 노출한다", async () => {
    mockPxData([
      makeStore({ id: "a", region: "가평" }),
      makeStore({ id: "b", region: "가평" }),
      makeStore({ id: "c", region: "수원" }),
    ]);
    renderFinder();
    const group = await screen.findByRole("group", { name: "지역 선택" });
    expect(within(group).getByRole("button", { name: "가평 2" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "수원 1" })).toBeInTheDocument();
  });

  it("검색어와 지역 필터가 동시에 적용되고 결과가 동기화된다", async () => {
    const user = userEvent.setup();
    mockPxData([
      makeStore({ id: "a", name: "맹호", region: "가평" }),
      makeStore({ id: "b", name: "횃불", region: "가평" }),
      makeStore({ id: "c", name: "수원점", region: "수원" }),
    ]);
    renderFinder();
    const main = await screen.findByRole("main");
    await within(main).findByText("총 3개 매장");

    await user.click(screen.getByRole("button", { name: "가평 2" }));
    expect(await within(main).findByText("총 2개 매장")).toBeInTheDocument();

    const search = screen.getByRole("searchbox", { name: "지역이나 군마트 이름 검색" });
    await user.type(search, "맹호");
    expect(await within(main).findByText("총 1개 매장")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /맹호/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /횃불/ })).toBeNull();
  });

  it("결과가 없으면 안내와 초기화 버튼을 제공한다", async () => {
    const user = userEvent.setup();
    mockPxData([makeStore({ name: "맹호" })]);
    renderFinder();
    const main = await screen.findByRole("main");
    const search = await screen.findByRole("searchbox");
    await user.type(search, "존재하지않는매장");
    expect(await screen.findByText("검색 결과가 없어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "검색·지역 필터 초기화" }));
    expect(search).toHaveValue("");
    expect(await within(main).findByText("총 1개 매장")).toBeInTheDocument();
  });

  it("매장 목록 항목 클릭 시 상세 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    mockPxData([makeStore({ id: "01-맹호", name: "맹호" })]);
    renderFinder();
    const link = await screen.findByRole("link", { name: /맹호/ });
    await user.click(link);
    expect(
      await screen.findByRole("heading", { name: "맹호" }),
    ).toBeInTheDocument();
  });

  it("지도 마커는 role=button과 매장명 aria-label을 갖는다", async () => {
    mockPxData([makeStore({ id: "01-맹호", name: "맹호" })]);
    renderFinder();
    expect(
      await screen.findByRole("button", { name: "맹호 상세 보기" }),
    ).toBeInTheDocument();
  });

  it("데이터 기준일과 출처를 표시한다", async () => {
    mockPxData([makeStore({})]);
    renderFinder();
    expect(await screen.findByText(/데이터 기준일 2026\. 4\. 28\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "국방부 국군복지단" })).toHaveAttribute(
      "href",
      "https://www.data.go.kr/data/15126305/fileData.do",
    );
  });

  it("접근성 위반이 없다", async () => {
    mockPxData([makeStore({})]);
    const { container } = renderFinder();
    const main = await screen.findByRole("main");
    await within(main).findByText("총 1개 매장");
    expect(await axe(container)).toHaveNoViolations();
  });
});
