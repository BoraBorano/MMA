import { expect, test } from "@playwright/test";

test("목록에서 상세로 이동하고 정보를 표시한다 (AC-009)", async ({ page }) => {
  await page.goto("/region/anseong/sports");
  await page.locator("main ul li a").first().click();
  await expect(page).toHaveURL(/\/facility\/f-\d+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("이용 전에 비고와 연락처를 확인해 주세요.")).toBeVisible();
});

test("전화하기 버튼은 tel: 링크이고, 홈페이지·지도는 새 탭으로 열린다 (AC-012, AC-014, AC-015)", async ({
  page,
}) => {
  // f-002 과천시 청소년수련관: 전화·URL·지도 링크 모두 보유
  // (f-001은 물리 시설이 아니라 지도 링크를 제거했다 — QA BUG-010)
  await page.goto("/facility/f-002");
  const telLink = page.getByRole("link", { name: "전화하기" });
  await expect(telLink).toHaveAttribute("href", /^tel:/);

  const homepageLink = page.getByRole("link", { name: "홈페이지 보기" });
  await expect(homepageLink).toHaveAttribute("target", "_blank");
  await expect(homepageLink).toHaveAttribute("rel", "noopener noreferrer");

  const mapLink = page.getByRole("link", { name: "지도에서 위치 보기" });
  await expect(mapLink).toHaveAttribute("href", /^https:\/\/map\.naver\.com\/p\/search\//);
  await expect(mapLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("잘못된 시설 ID는 찾을 수 없음 화면을 보여준다", async ({ page }) => {
  await page.goto("/facility/f-999");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
});

test("390px에서 상세 화면 가로 넘침이 없다 (NFR-001)", async ({ page }) => {
  await page.goto("/facility/f-001");
  await page.getByRole("heading", { level: 1 }).waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
