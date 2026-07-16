import { buildListStateKey, loadListState, saveListState } from "@/lib/listStateStorage";

describe("buildListStateKey", () => {
  it("지역·업종 코드로 키를 만든다", () => {
    expect(buildListStateKey("suwon", "sports")).toBe("list:suwon:sports");
  });
});

describe("saveListState / loadListState", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("저장한 상태를 그대로 불러온다", () => {
    const key = buildListStateKey("suwon", "sports");
    saveListState(key, { searchQuery: "체육관", scrollY: 320 });
    expect(loadListState(key)).toEqual({ searchQuery: "체육관", scrollY: 320 });
  });

  it("저장된 값이 없으면 null을 반환한다", () => {
    expect(loadListState("list:unknown:unknown")).toBeNull();
  });

  it("형식이 잘못된 값은 null로 처리한다", () => {
    sessionStorage.setItem("list:bad:bad", "{ not json");
    expect(loadListState("list:bad:bad")).toBeNull();

    sessionStorage.setItem("list:bad2:bad2", JSON.stringify({ searchQuery: 1 }));
    expect(loadListState("list:bad2:bad2")).toBeNull();
  });
});
