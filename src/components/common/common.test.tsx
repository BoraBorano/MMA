import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { AppShell } from "@/components/common/AppShell";
import { ErrorState } from "@/components/common/ErrorState";
import { ProgressIndicator } from "@/components/common/ProgressIndicator";
import { ServiceFooter } from "@/components/common/ServiceFooter";
import { SkipLink } from "@/components/common/SkipLink";

describe("ProgressIndicator", () => {
  it.each([
    [1, "3단계 중 1단계: 지역 선택"],
    [2, "3단계 중 2단계: 업종 선택"],
    [3, "3단계 중 3단계: 시설 선택"],
  ] as const)("step %i에 접근 가능한 이름을 제공한다", (step, label) => {
    render(<ProgressIndicator step={step} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("시각 표시 n / 3을 제공한다", () => {
    render(<ProgressIndicator step={2} />);
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });
});

describe("ServiceFooter", () => {
  it("데이터 기준일을 표시한다 (FR-026)", () => {
    render(<ServiceFooter />);
    expect(screen.getByText(/데이터 기준일 2026\. 4\. 30\./)).toBeInTheDocument();
  });
});

describe("SkipLink", () => {
  it("본문(#main-content)으로 연결된다 (A11Y-002)", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link", { name: "본문 바로가기" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });
});

describe("ErrorState", () => {
  it("다시 시도하기 버튼이 콜백을 실행한다 (AC-017)", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "다시 시도하기" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("내부 오류코드나 기술 용어를 노출하지 않는다", () => {
    const { container } = render(<ErrorState onRetry={() => undefined} />);
    expect(container.textContent).not.toMatch(/error|404|500|fetch|API/i);
  });
});

describe("AppShell", () => {
  function renderShell() {
    return render(
      <MemoryRouter>
        <AppShell>
          <h1>테스트 화면</h1>
        </AppShell>
      </MemoryRouter>,
    );
  }

  it("헤더, 본문, 푸터 랜드마크를 제공한다", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderShell();
    expect(await axe(container)).toHaveNoViolations();
  });
});
