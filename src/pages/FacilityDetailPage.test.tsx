import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "vitest-axe";
import { FacilityDetailPage } from "@/pages/FacilityDetailPage";
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
    organizationType: "지자체",
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

function renderDetail(facility: Facility) {
  const dataset: FacilityDataset = { dataUpdatedAt: "2026-04-30", facilities: [facility] };
  vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
  return render(
    <MemoryRouter initialEntries={[`/facility/${facility.facilityId}`]}>
      <Routes>
        <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("FacilityDetailPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    facilityRepository.resetFacilityDatasetCache();
  });

  it("표시 순서대로 정보를 렌더링한다 (PRD 6.4.1, AC-009)", async () => {
    const facility = makeFacility({
      note: "조례 제11조",
      address: "경기도 수원시",
      phoneDisplay: "031-123-4567",
      phoneTel: "031-123-4567",
    });
    renderDetail(facility);

    expect(
      await screen.findByRole("heading", { name: "테스트 시설" }),
    ).toBeInTheDocument();
    expect(screen.getByText("수원시")).toBeInTheDocument();
    expect(screen.getByText("예우대상자")).toBeInTheDocument();
    expect(screen.getByText("50% 감면")).toBeInTheDocument();
    expect(screen.getByText("조례 제11조")).toBeInTheDocument();
    expect(screen.getByText("경기도 수원시")).toBeInTheDocument();
    expect(screen.getByText("031-123-4567")).toBeInTheDocument();
  });

  it("비고 원문을 그대로 표시하고 개행을 보존한다 (FR-015, AC-010)", async () => {
    const facility = makeFacility({ note: "1줄\n2줄" });
    renderDetail(facility);
    const note = await screen.findByText((_, element) => element?.textContent === "1줄\n2줄");
    expect(note.className).toContain("whitespace-pre-line");
  });

  it("비고가 없으면 비고 영역을 숨긴다 (AC-011)", async () => {
    renderDetail(makeFacility({ note: null }));
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(screen.queryByText("비고")).toBeNull();
  });

  it("연락처가 없으면 전화하기 버튼을 숨긴다 (AC-013)", async () => {
    renderDetail(makeFacility({ phoneTel: null, phoneDisplay: null }));
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(screen.queryByRole("link", { name: "전화하기" })).toBeNull();
  });

  it("연락처가 있으면 전화하기 버튼이 tel: 링크다 (AC-012)", async () => {
    renderDetail(makeFacility({ phoneTel: "031-292-1266", phoneDisplay: "031-292-1266" }));
    const telLink = await screen.findByRole("link", { name: "전화하기" });
    expect(telLink).toHaveAttribute("href", "tel:031-292-1266");
  });

  it("유효 URL이 있으면 홈페이지 보기가 새 탭으로 열린다 (AC-014)", async () => {
    renderDetail(makeFacility({ homepageUrl: "https://example.com" }));
    const link = await screen.findByRole("link", { name: "홈페이지 보기" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("주소가 있으면 지도에서 위치 보기가 네이버 지도로 연결된다 (AC-015)", async () => {
    renderDetail(makeFacility({ address: "경기도 수원시 권선구" }));
    const link = await screen.findByRole("link", { name: "지도에서 위치 보기" });
    expect(link.getAttribute("href")).toContain("https://map.naver.com/p/search/");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("주소가 없으면 지도 버튼을 숨긴다", async () => {
    renderDetail(makeFacility({ address: null }));
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(screen.queryByRole("link", { name: "지도에서 위치 보기" })).toBeNull();
  });

  it("행동 데이터가 전무하면 버튼 영역이 없고 시·군청 문의 안내를 표시한다", async () => {
    renderDetail(makeFacility({}));
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(screen.queryByRole("link", { name: "전화하기" })).toBeNull();
    expect(screen.queryByRole("link", { name: "홈페이지 보기" })).toBeNull();
    expect(screen.queryByRole("link", { name: "지도에서 위치 보기" })).toBeNull();
    expect(
      screen.getByText("자세한 이용 방법은 해당 시·군청에 문의해 주세요."),
    ).toBeInTheDocument();
  });

  it("기관구분을 기본 상세에 노출하지 않는다", async () => {
    renderDetail(makeFacility({ organizationType: "지자체" }));
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(screen.queryByText("지자체")).toBeNull();
  });

  it("경기도 운영 시설 배지를 비주얼 영역에 표시한다", async () => {
    renderDetail(makeFacility({ isProvincial: true, displayRegionLabel: "경기도" }));
    expect(await screen.findByText("경기도 운영 시설")).toBeInTheDocument();
  });

  it("존재하지 않는 시설 ID는 찾을 수 없음 화면을 보여준다", async () => {
    const dataset: FacilityDataset = { dataUpdatedAt: "2026-04-30", facilities: [] };
    vi.spyOn(facilityRepository, "loadFacilityDataset").mockResolvedValue(dataset);
    render(
      <MemoryRouter initialEntries={["/facility/f-999"]}>
        <Routes>
          <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderDetail(
      makeFacility({
        note: "비고 원문",
        address: "경기도 수원시",
        phoneDisplay: "031-123-4567",
        phoneTel: "031-123-4567",
        homepageUrl: "https://example.com",
      }),
    );
    await screen.findByRole("heading", { name: "테스트 시설" });
    expect(await axe(container)).toHaveNoViolations();
  });
});
