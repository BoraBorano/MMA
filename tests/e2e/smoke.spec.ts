import { expect, test } from "@playwright/test";

test("첫 화면이 렌더링되고 문서 언어가 ko다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "병역명문가 혜택찾기" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "어느 지역의 혜택을 찾으세요?" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
});

test("가로 스크롤이 없다 (NFR-001)", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("본문 콘텐츠가 최대 1,180px 안에 정렬된다 (NFR-002)", async ({ page }) => {
  await page.goto("/");
  const width = await page
    .locator("#main-content")
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(1180);
});

test("첫 탭 포커스가 본문 바로가기이고 본문으로 이동한다 (A11Y-002)", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문 바로가기" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});
