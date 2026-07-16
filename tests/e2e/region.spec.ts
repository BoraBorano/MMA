import { expect, test } from "@playwright/test";

test("지도에서 지역 선택 → 업종 화면 이동, 새로고침 시 유지 (FR-003, FR-006, AC-001)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "수원시 선택" }).click();
  await expect(page).toHaveURL("/region/suwon");
  const heading = page.getByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" }),
  ).toBeVisible();
});

test("지역 이름 목록에서 선택해도 지도와 동일한 결과가 발생한다 (FR-004, AC-002)", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const isMobile = (testInfo.project.use.viewport?.width ?? 1440) <= 680;
  if (isMobile) {
    // 모바일 기본은 지도 — 토글로 목록 방식으로 전환한다 (FR-005, AC-003)
    await page.getByRole("button", { name: "지역 이름으로 선택" }).click();
  }
  await page.getByRole("link", { name: "수원시" }).click();
  await expect(page).toHaveURL("/region/suwon");
});

test("모바일 토글이 지도와 지역 목록을 전환한다 (FR-005, AC-003)", async ({
  page,
}, testInfo) => {
  const isMobile = (testInfo.project.use.viewport?.width ?? 1440) <= 680;
  test.skip(!isMobile, "모바일 전용 토글");

  await page.goto("/");
  const mapToggle = page.getByRole("button", { name: "지도에서 선택" });
  const listToggle = page.getByRole("button", { name: "지역 이름으로 선택" });

  await expect(mapToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "가평군 선택" })).toBeVisible();
  await expect(page.getByRole("link", { name: "가평군" })).toBeHidden();

  await listToggle.click();
  await expect(listToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "가평군" })).toBeVisible();
});

test("지역 목록은 31개이고 부천시도 선택 가능하다 (6.1.3)", async ({ page }) => {
  await page.goto("/");
  const regionLinks = page.locator("main ul").first().getByRole("link");
  await expect(regionLinks).toHaveCount(31);
  await page.getByRole("button", { name: "부천시 선택" }).click();
  await expect(page).toHaveURL("/region/bucheon");
});

test("준비 중 카드는 키보드 탭 순서에 없다 (FR-024)", async ({ page }) => {
  await page.goto("/");
  const focusable = await page
    .locator("section:has(h2:text('준비 중인 기능'))")
    .locator("a, button, [tabindex]")
    .count();
  expect(focusable).toBe(0);
});

test("잘못된 지역 URL은 찾을 수 없음 화면을 보여준다", async ({ page }) => {
  await page.goto("/region/seoul");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
});
