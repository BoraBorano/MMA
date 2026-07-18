import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, NavigationType } from "react-router-dom";
import * as RouterDom from "react-router-dom";
import { useListStateRestore } from "@/hooks/useListStateRestore";
import { saveListState } from "@/lib/listStateStorage";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigationType: vi.fn() };
});

const mockedUseNavigationType = vi.mocked(RouterDom.useNavigationType);

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("useListStateRestore", () => {
  const key = "list:suwon:sports";

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("PUSH 내비게이션(새 선택)은 저장된 값이 있어도 빈 검색어로 시작한다 (5.4 초기화 규칙)", () => {
    saveListState(key, { searchQuery: "체육관", scrollY: 400 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Push);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    expect(result.current.initialQuery).toBe("");
  });

  it("POP 내비게이션(뒤로가기)은 저장된 검색어를 복원한다 (AC-016)", () => {
    saveListState(key, { searchQuery: "체육관", scrollY: 400 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Pop);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    expect(result.current.initialQuery).toBe("체육관");
  });

  it("새로고침(reload)은 POP이어도 저장된 검색어를 복원하지 않는다 (QA BUG-004)", () => {
    saveListState(key, { searchQuery: "체육관", scrollY: 400 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Pop);
    const navSpy = vi
      .spyOn(performance, "getEntriesByType")
      .mockReturnValue([{ type: "reload" } as unknown as PerformanceEntry]);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    expect(result.current.initialQuery).toBe("");

    navSpy.mockRestore();
  });

  it("새로고침일 때는 restoreScrollPosition이 scrollTo를 호출하지 않는다 (QA BUG-004)", () => {
    saveListState(key, { searchQuery: "", scrollY: 500 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Pop);
    const navSpy = vi
      .spyOn(performance, "getEntriesByType")
      .mockReturnValue([{ type: "reload" } as unknown as PerformanceEntry]);
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    act(() => result.current.restoreScrollPosition());

    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
    navSpy.mockRestore();
  });

  it("PUSH일 때는 restoreScrollPosition이 scrollTo를 호출하지 않는다", () => {
    saveListState(key, { searchQuery: "", scrollY: 500 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Push);
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    act(() => result.current.restoreScrollPosition());

    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });

  it("POP일 때는 저장된 스크롤 위치로 이동한다", () => {
    saveListState(key, { searchQuery: "", scrollY: 500 });
    mockedUseNavigationType.mockReturnValue(NavigationType.Pop);
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    const { result } = renderHook(() => useListStateRestore(key), { wrapper });
    act(() => result.current.restoreScrollPosition());

    expect(scrollToSpy).toHaveBeenCalledWith(0, 500);
    scrollToSpy.mockRestore();
  });

  it("언마운트 시 최신 검색어와 스크롤 위치를 저장한다", () => {
    mockedUseNavigationType.mockReturnValue(NavigationType.Push);
    const { result, unmount } = renderHook(() => useListStateRestore(key), { wrapper });

    act(() => result.current.reportQuery("과천"));
    Object.defineProperty(window, "scrollY", { value: 250, configurable: true });
    window.dispatchEvent(new Event("scroll"));

    unmount();

    mockedUseNavigationType.mockReturnValue(NavigationType.Pop);
    const { result: restored } = renderHook(() => useListStateRestore(key), { wrapper });
    expect(restored.current.initialQuery).toBe("과천");
  });
});
