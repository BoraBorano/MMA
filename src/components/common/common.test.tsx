import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { AppShell } from "@/components/common/AppShell";
import { ErrorState } from "@/components/common/ErrorState";
import { SkipLink } from "@/components/common/SkipLink";

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

  it("헤더와 본문 랜드마크를 제공한다", () => {
    renderShell();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("접근성 위반이 없다", async () => {
    const { container } = renderShell();
    expect(await axe(container)).toHaveNoViolations();
  });
});
