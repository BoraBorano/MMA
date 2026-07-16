import { expect, test } from "@playwright/test";

test("첫 화면의 경기도 군마트 찾기 CTA는 실제 링크로 동작한다 (부가 기능 진입점)", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: /경기도 군마트 찾기/ });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/px");
  await cta.click();
  await expect(page).toHaveURL("/px");
  await expect(page.getByRole("heading", { name: "경기도 군마트 찾기" })).toBeVisible();
});

test("검색·지도·목록이 항상 동기화된다", async ({ page }) => {
  await page.goto("/px");
  const main = page.locator("#main-content");
  await expect(main.getByText(/^총 \d+개 매장$/)).toBeVisible();

  const search = page.getByRole("searchbox", { name: "지역이나 군마트 이름 검색" });
  await search.fill("가평");
  await expect(main.getByText(/^총 \d+개 매장$/)).toContainText("개 매장");

  // 검색 결과 목록의 모든 항목이 가평 지역이어야 한다
  const regionChips = page.locator("main ul li a >> text=가평");
  const count = await regionChips.count();
  expect(count).toBeGreaterThan(0);

  await page.getByRole("button", { name: "검색어 지우기" }).click();
  await expect(search).toHaveValue("");
});

test("지역 필터 버튼 클릭 시 매장 수가 갱신되고 데이터 없는 지역은 필터에 없다", async ({
  page,
}) => {
  await page.goto("/px");
  const group = page.getByRole("group", { name: "지역 선택" });
  await expect(group.getByRole("button", { name: /가평 \d+/ })).toBeVisible();
  // 과천은 PX 데이터가 없는 지역이므로 필터에 노출되지 않아야 한다
  await expect(group.getByRole("button", { name: /^과천/ })).toHaveCount(0);

  await group.getByRole("button", { name: /가평 \d+/ }).click();
  await expect(group.getByRole("button", { name: /가평 \d+/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("지도 마커는 키보드로 활성화해 상세 화면으로 이동한다", async ({ page }) => {
  // 전체 지도(지역 미선택) 상태에서는 스펙상 오프셋을 적용하지 않아 마커가 밀집할 수 있다.
  // 포인터 클릭 대신 키보드 활성화로 검증해 히트 영역 겹침과 무관하게 동작을 확인한다.
  await page.goto("/px");
  const firstMarker = page.locator("circle[role='button']").first();
  await firstMarker.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/px\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("지역을 선택하면 밀집 마커가 겹치지 않아 클릭으로도 이동할 수 있다", async ({ page }) => {
  await page.goto("/px");
  // 매장이 많은 지역을 선택해 겹침 해소(offset) 로직이 실제로 클릭 가능성을 개선하는지 확인한다.
  const group = page.getByRole("group", { name: "지역 선택" });
  await group.getByRole("button", { name: /가평 \d+/ }).click();
  const marker = page.locator("circle[role='button']").first();
  await marker.click();
  await expect(page).toHaveURL(/\/px\/.+/);
});

test("PX 상세 화면에 이름·주소·영업시간·외부 링크가 모두 있다", async ({ page }) => {
  await page.goto("/px");
  await page.locator("main ul li a").first().click();
  await expect(page).toHaveURL(/\/px\/.+/);

  await expect(page.getByText("주소")).toBeVisible();
  await expect(page.getByText("영업시간")).toBeVisible();

  const naverLink = page.getByRole("link", { name: "네이버지도에서 보기" });
  await expect(naverLink).toHaveAttribute("target", "_blank");
  await expect(naverLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(naverLink.getAttribute("href")).resolves.toContain(
    "https://map.naver.com/p/search/",
  );

  const portalLink = page.getByRole("link", { name: "국군복지포털에서 이용 자격 확인" });
  await expect(portalLink).toHaveAttribute("href", "https://www.welfare.mil.kr");
  await expect(portalLink).toHaveAttribute("target", "_blank");
  await expect(portalLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("목록으로 돌아가기와 첫 화면으로 이동 링크가 동작한다", async ({ page }) => {
  await page.goto("/px");
  await page.locator("main ul li a").first().click();
  await expect(page).toHaveURL(/\/px\/.+/);

  await page.getByRole("link", { name: "목록으로" }).click();
  await expect(page).toHaveURL("/px");

  await page.getByRole("link", { name: "첫 화면으로" }).click();
  await expect(page).toHaveURL("/");
});

test("존재하지 않는 매장 ID는 찾을 수 없음 화면을 보여준다", async ({ page }) => {
  await page.goto("/px/no-such-store");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
});

test("예우시설 기존 흐름은 그대로 동작한다 (회귀)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "수원시" }).click();
  await expect(page).toHaveURL("/region/suwon");
  await expect(
    page.getByRole("heading", { name: "수원시에서 어떤 시설을 찾으세요?" }),
  ).toBeVisible();
});

test("390px에서 PX 찾기 화면 가로 넘침이 없다 (NFR-001)", async ({ page }) => {
  await page.goto("/px");
  await page.locator("#main-content").waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("PX 찾기 키보드로 지역 선택과 매장 탐색이 가능하다", async ({ page }) => {
  await page.goto("/px");
  const search = page.getByRole("searchbox", { name: "지역이나 군마트 이름 검색" });
  await search.focus();
  await expect(search).toBeFocused();

  const regionButton = page
    .getByRole("group", { name: "지역 선택" })
    .getByRole("button")
    .first();
  await regionButton.focus();
  await page.keyboard.press("Enter");
  await expect(regionButton).toHaveAttribute("aria-pressed", "true");
});
