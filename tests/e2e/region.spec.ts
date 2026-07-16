import { expect, test } from "@playwright/test";

test("지역 선택 → 업종 화면 이동, 새로고침 시 유지 (FR-006, AC-002)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "수원시" }).click();
  await expect(page).toHaveURL("/region/suwon");
  const heading = page.getByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" }),
  ).toBeVisible();
});

test("지역 목록은 31개이고 부천시도 선택 가능하다 (6.1.3)", async ({ page }) => {
  await page.goto("/");
  const regionLinks = page.locator("main ul").first().getByRole("link");
  await expect(regionLinks).toHaveCount(31);
  await page.getByRole("link", { name: "부천시" }).click();
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
