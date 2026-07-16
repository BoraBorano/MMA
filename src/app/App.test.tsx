import { render, screen } from "@testing-library/react";
import { App } from "@/app/App";

describe("App", () => {
  it("첫 화면에 서비스명과 지역 선택 제목을 표시한다 (FR-001)", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: "병역명문가 혜택찾기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "어느 지역의 혜택을 찾으세요?" }),
    ).toBeInTheDocument();
  });
});
