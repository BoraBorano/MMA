import { expect, test } from "@playwright/test";

test("목록 진입, 검색 입력·건수 갱신, 지우기 (FR-011, FR-012, AC-007)", async ({ page }) => {
  await page.goto("/region/anseong/sports");
  await expect(page.getByRole("heading", { name: "안성시 체육 시설이에요" })).toBeVisible();

  const countText = page.locator("#main-content").getByText(/^총 \d+개 시설$/);
  await expect(countText).toContainText("개 시설");

  const search = page.getByRole("searchbox", { name: "시설 이름으로 찾기" });
  await search.fill("공영");
  await expect(countText).toContainText(/총 \d+개 시설/);

  await page.getByRole("button", { name: "검색어 지우기" }).click();
  await expect(search).toHaveValue("");
});

test("검색 결과 없음 → 다른 업종 보기 (지역 유지, AC-007)", async ({ page }) => {
  await page.goto("/region/suwon/sports");
  await page.getByRole("searchbox").fill("존재하지않는시설이름");
  await expect(page.getByText("찾는 시설이 없어요")).toBeVisible();
  await page.getByRole("link", { name: "다른 업종 보기" }).click();
  await expect(page).toHaveURL("/region/suwon");
});

test("지역에 시설 없는 업종은 지역 시설 없음 상태를 보여준다 (6.1.3)", async ({ page }) => {
  await page.goto("/region/gapyeong/education");
  await expect(page.getByText("이 지역에는 등록된 시설이 없어요.")).toBeVisible();
  await page.getByRole("link", { name: "다른 지역 선택하기" }).click();
  await expect(page).toHaveURL("/");
});

test("경로에서 지역 클릭 시 첫 화면으로 이동한다 (5.4)", async ({ page }) => {
  await page.goto("/region/suwon/sports");
  await page.getByRole("navigation", { name: "선택 경로" }).getByRole("link", { name: "수원시" }).click();
  await expect(page).toHaveURL("/");
});

test("390px에서 목록 화면 가로 넘침이 없다 (NFR-001)", async ({ page }) => {
  await page.goto("/region/anseong/sports");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
