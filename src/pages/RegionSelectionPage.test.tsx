import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "vitest-axe";
import { CategorySelectionPage } from "@/pages/CategorySelectionPage";
import { RegionSelectionPage } from "@/pages/RegionSelectionPage";
import * as regionMapRepository from "@/services/regionMapRepository";
import type { RegionMap } from "@/types/regionMap";

const testRegionMap: RegionMap = [
  { region: "수원", displayName: "수원시", paths: ["M0 0 L10 0 L10 10 Z"], label: [5, 5] },
  {
    region: "고양",
    displayName: "고양시",
    paths: ["M20 0 L30 0 L30 10 Z", "M20 20 L30 20 L30 30 Z"],
    label: [25, 5],
  },
];

function renderPage(options?: { mapFails?: boolean }) {
  if (options?.mapFails === true) {
    vi.spyOn(regionMapRepository, "loadGyeonggiRegionMap").mockRejectedValue(
      new Error("network"),
    );
  } else {
    vi.spyOn(regionMapRepository, "loadGyeonggiRegionMap").mockResolvedValue(
      testRegionMap,
    );
  }
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<RegionSelectionPage />} />
        <Route path="/region/:regionCode" element={<CategorySelectionPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RegionSelectionPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    regionMapRepository.resetRegionMapCache();
  });

  it("확정 카피를 표시한다 (PRD 7.2)", async () => {
    renderPage();
    expect(screen.getByText("우리 동네 혜택을 찾아보세요")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "어느 지역의 혜택을 찾으세요?" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("지도나 지역 이름을 눌러주세요.")).toBeInTheDocument();
    expect(screen.getByText("3단계 중 1단계: 지역 선택")).toBeInTheDocument();
  });

  it("31개 시·군을 가나다순으로 표시한다 (FR-004)", () => {
    renderPage();
    const list = screen.getAllByRole("list")[0];
    if (list === undefined) throw new Error("지역 목록이 없습니다");
    const links = within(list).getAllByRole("link");
    expect(links).toHaveLength(31);
    const labels = links.map((link) => link.textContent);
    expect(labels[0]).toBe("가평군");
    expect(labels).toEqual([...labels].sort((a, b) => (a ?? "").localeCompare(b ?? "", "ko")));
  });

  it("지도의 시·군을 선택하면 업종 화면으로 즉시 이동한다 (FR-003, FR-006, AC-001)", async () => {
    const user = userEvent.setup();
    renderPage();
    const mapButton = await screen.findByRole("button", { name: "수원시 선택" });
    await user.click(mapButton);
    expect(
      await screen.findByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" }),
    ).toBeInTheDocument();
  });

  it("지도와 지역 이름 목록에서 같은 지역을 선택할 수 있다 (AC-002, A11Y-010)", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole("button", { name: "수원시 선택" });
    await user.click(screen.getByRole("link", { name: "수원시" }));
    const heading = await screen.findByRole("heading", {
      name: "수원시에서 어떤 시설을 찾으세요?",
    });
    expect(heading).toHaveFocus();
  });

  it("모바일 토글이 지도/지역 이름 방식을 전환한다 (FR-005, A11Y-006)", async () => {
    const user = userEvent.setup();
    renderPage();
    const mapToggle = await screen.findByRole("button", { name: "지도에서 선택" });
    const listToggle = screen.getByRole("button", { name: "지역 이름으로 선택" });
    expect(mapToggle).toHaveAttribute("aria-pressed", "true");
    expect(listToggle).toHaveAttribute("aria-pressed", "false");

    await user.click(listToggle);
    expect(listToggle).toHaveAttribute("aria-pressed", "true");
    expect(mapToggle).toHaveAttribute("aria-pressed", "false");
  });

  it("지도 데이터를 불러오지 못하면 지역 이름 목록만으로 동작한다 (대체 수단)", async () => {
    renderPage({ mapFails: true });
    expect(await screen.findByText("지역 이름을 눌러주세요.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "지도에서 선택" })).toBeNull();
    expect(screen.getByRole("link", { name: "수원시" })).toBeInTheDocument();
  });

  it("후속 기능 카드는 상호작용 요소가 아니다 (FR-024)", () => {
    renderPage();
    const section = screen.getByRole("region", { name: "준비 중인 기능" });
    expect(within(section).queryByRole("link")).toBeNull();
    expect(within(section).queryByRole("button")).toBeNull();
    expect(within(section).getByText("병역명문가 신청하기")).toBeInTheDocument();
    expect(within(section).getAllByText("준비 중")).toHaveLength(1);
  });

  it("경기도 군마트 찾기 진입점이 실제 링크로 동작한다 (PX 부가 기능)", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /경기도 군마트 찾기/ });
    expect(link).toHaveAttribute("href", "/px");
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderPage();
    await screen.findByRole("button", { name: "수원시 선택" });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CategorySelectionPage (스텁)", () => {
  it("유효하지 않은 지역 코드는 찾을 수 없음 화면을 보여준다", () => {
    render(
      <MemoryRouter initialEntries={["/region/seoul"]}>
        <Routes>
          <Route path="/region/:regionCode" element={<CategorySelectionPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "첫 화면으로 가기" })).toBeInTheDocument();
  });
});
