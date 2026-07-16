import { expect, test } from "@playwright/test";

test("상세→브라우저 뒤로가기 시 검색어와 스크롤 위치를 복원한다 (AC-016)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto("/region/anseong/sports");
  const search = page.getByRole("searchbox");
  await search.fill("게이트볼");
  await page.locator("#main-content").getByText(/^총 \d+개 시설$/).waitFor();

  await page.evaluate(() => window.scrollTo(0, 600));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  expect(scrollBefore).toBeGreaterThan(0);

  await page.locator("main ul li a").first().click();
  await expect(page).toHaveURL(/\/facility\/f-\d+/);

  await page.goBack();
  await expect(page).toHaveURL("/region/anseong/sports");
  await expect(search).toHaveValue("게이트볼");

  // 스크롤 복원은 useEffect에서 비동기로 실행되므로 단발성 확인 대신 재시도 가능한 폴링을 사용한다.
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
});

test("업종을 다시 선택해 진입하면 검색어가 초기화된다 (5.4)", async ({ page }) => {
  await page.goto("/region/anseong/sports");
  await page.getByRole("searchbox").fill("게이트볼");
  await page.locator("#main-content").getByText(/^총 \d+개 시설$/).waitFor();

  await page.getByRole("navigation", { name: "선택 경로" }).getByRole("link", { name: "체육" }).click();
  await expect(page).toHaveURL("/region/anseong");

  await page.getByRole("link", { name: /6\. 체육/ }).click();
  await expect(page).toHaveURL("/region/anseong/sports");
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test("데이터 로딩 실패 시 다시 시도로 복구한다 (AC-017, FR-023)", async ({ page }) => {
  await page.route("**/data/facilities.json", (route) => route.abort());
  await page.goto("/region/suwon");
  await expect(
    page.getByRole("heading", { name: "최신 정보를 불러오지 못했어요" }),
  ).toBeVisible();

  await page.unroute("**/data/facilities.json");
  await page.getByRole("button", { name: "다시 시도하기" }).click();
  await expect(page.getByRole("heading", { name: /어떤 시설을 찾으세요/ })).toBeVisible();
});

test("잘못된 URL은 어디서든 공통 찾을 수 없음 화면으로 처리된다 (FR-023)", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
  await page.getByRole("link", { name: "첫 화면으로 가기" }).click();
  await expect(page).toHaveURL("/");
});
