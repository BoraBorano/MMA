import { expect, test } from "@playwright/test";

test("업종은 정확히 7개이고 전체 보기가 없다 (FR-007, FR-008, AC-005)", async ({ page }) => {
  await page.goto("/region/suwon");
  const buttons = page.locator("main ul li");
  await expect(buttons).toHaveCount(7);
  await expect(page.getByText(/전체 보기/)).toHaveCount(0);
});

test("업종 선택 시 시설 목록 화면으로 즉시 이동한다 (AC-004)", async ({ page }) => {
  await page.goto("/region/suwon");
  const enabledLink = page.locator("main ul li a").first();
  await enabledLink.click();
  await expect(page).toHaveURL(/\/region\/suwon\/\w+/);
});

test("빈 업종은 비활성이고 포커스에서 제외된다 (AC-006)", async ({ page }) => {
  await page.goto("/region/gapyeong");
  await page.locator("main ul li").first().waitFor();
  const disabledButtons = page.getByRole("button", { name: /등록 시설 없음/ });
  const count = await disabledButtons.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(disabledButtons.nth(index)).toBeDisabled();
  }
});

test("잘못된 업종 코드는 찾을 수 없음 화면을 보여준다", async ({ page }) => {
  await page.goto("/region/suwon/invalid-category");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
});
