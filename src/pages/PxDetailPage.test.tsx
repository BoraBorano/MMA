import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "vitest-axe";
import { PxDetailPage } from "@/pages/PxDetailPage";
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

const regionMap: PxRegionMap = [];

function renderDetail(store: PxStore) {
  const dataset: PxDataset = {
    metadata: {
      title: "경기도 국군복지단 영외마트 PX 편의 데이터",
      officialReferenceDate: "2026-04-28",
      officialRowCountNationwide: 120,
      gyeonggiStoreCount: 1,
      officialDataUrl: "https://www.data.go.kr/data/15126305/fileData.do",
      officialSheetUrl: "https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9645",
      coordinateNotice: "",
      naverLinkNotice: "",
      operatingHoursNotice: "",
      licenseNotice: "",
    },
    stores: [store],
  };
  vi.spyOn(pxRepository, "loadPxDataset").mockResolvedValue(dataset);
  vi.spyOn(pxRepository, "loadPxRegionMap").mockResolvedValue(regionMap);
  return render(
    <MemoryRouter initialEntries={[`/px/${store.id}`]}>
      <Routes>
        <Route path="/px/:storeId" element={<PxDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PxDetailPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    pxRepository.resetPxCache();
  });

  it("표시 순서대로 이름·주소·영업시간·점심시간을 렌더링한다", async () => {
    renderDetail(makeStore({}));
    expect(await screen.findByRole("heading", { name: "맹호" })).toBeInTheDocument();
    expect(screen.getByText("경기도 가평군 조종면 청군로 1208")).toBeInTheDocument();
    expect(screen.getByText("평일 10:00~19:00")).toBeInTheDocument();
    expect(screen.getByText("토요일 10:00~17:00")).toBeInTheDocument();
    expect(screen.getByText("일요일 휴무 또는 미제공")).toBeInTheDocument();
    expect(screen.getByText("평일 13:00~14:00")).toBeInTheDocument();
  });

  it("점심시간이 전부 없으면 영역을 숨긴다", async () => {
    renderDetail(
      makeStore({ lunchHours: { weekday: "", saturday: "", sunday: "" } }),
    );
    await screen.findByRole("heading", { name: "맹호" });
    expect(screen.queryByText("점심시간")).toBeNull();
  });

  it("비고가 없으면 영역을 숨긴다", async () => {
    renderDetail(makeStore({ note: "" }));
    await screen.findByRole("heading", { name: "맹호" });
    expect(screen.queryByText("비고")).toBeNull();
  });

  it("비고가 있으면 표시한다", async () => {
    renderDetail(makeStore({ note: "마트정비의날 매월 4주차" }));
    expect(await screen.findByText("마트정비의날 매월 4주차")).toBeInTheDocument();
  });

  it("네이버지도·국군복지포털 버튼이 새 탭으로 열린다", async () => {
    renderDetail(makeStore({}));
    const naverLink = await screen.findByRole("link", { name: "네이버지도에서 보기" });
    expect(naverLink).toHaveAttribute("href", "https://map.naver.com/p/search/test");
    expect(naverLink).toHaveAttribute("target", "_blank");
    expect(naverLink).toHaveAttribute("rel", "noopener noreferrer");

    const portalLink = await screen.findByRole("link", {
      name: "국군복지포털에서 이용 자격 확인",
    });
    expect(portalLink).toHaveAttribute("href", "https://www.welfare.mil.kr");
    expect(portalLink).toHaveAttribute("target", "_blank");
    expect(portalLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("존재하지 않는 매장 ID는 찾을 수 없음 화면을 보여준다", async () => {
    const dataset: PxDataset = {
      metadata: {
        title: "",
        officialReferenceDate: "2026-04-28",
        officialRowCountNationwide: 120,
        gyeonggiStoreCount: 0,
        officialDataUrl: "",
        officialSheetUrl: "",
        coordinateNotice: "",
        naverLinkNotice: "",
        operatingHoursNotice: "",
        licenseNotice: "",
      },
      stores: [],
    };
    vi.spyOn(pxRepository, "loadPxDataset").mockResolvedValue(dataset);
    vi.spyOn(pxRepository, "loadPxRegionMap").mockResolvedValue(regionMap);
    render(
      <MemoryRouter initialEntries={["/px/없는-id"]}>
        <Routes>
          <Route path="/px/:storeId" element={<PxDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderDetail(makeStore({ note: "비고 있음" }));
    await screen.findByRole("heading", { name: "맹호" });
    expect(await axe(container)).toHaveNoViolations();
  });
});
