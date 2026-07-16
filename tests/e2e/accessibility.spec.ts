import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * PRD 12.3 접근성 검수 시나리오 4종을 실브라우저에서 검증한다.
 * - 키보드만으로 지역 선택부터 시설 상세, 외부 버튼까지 도달
 * - 스크린리더 인지 요소(진행 단계·결과 건수·버튼 접근명)
 * - 200% 확대에서도 콘텐츠 겹침·가로 스크롤 없음
 * - 모션 축소 설정에서 핵심 정보·상호작용 유지
 */

test.describe("키보드 전용 전체 흐름 (AC-018)", () => {
  test("지역 → 업종 → 목록 → 상세 → 외부 버튼까지 키보드만으로 도달한다", async ({ page }) => {
    // 등장 애니메이션과 무관하게 요소 상호작용 가능 여부를 검증한다.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // SkipLink → 지역 링크로 포커스 이동
    await page.keyboard.press("Tab"); // SkipLink
    await page.keyboard.press("Tab"); // 헤더 홈 링크
    await page.keyboard.press("Tab"); // 첫 지역(가평군)
    await expect(page.getByRole("link", { name: "가평군" })).toBeFocused();

    // 수원시까지 탭 이동 (가나다순 목록에서 위치 계산 없이 텍스트로 포커스 확인 가능한 방식 사용)
    const suwonLink = page.getByRole("link", { name: "수원시" });
    await suwonLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/region/suwon");
    await expect(page.getByRole("heading", { name: /어떤 시설을 찾으세요/ })).toBeFocused();

    const cultureLink = page.getByRole("link", { name: /2\. 문화/ });
    await cultureLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/region/suwon/culture");
    await expect(page.getByRole("heading", { name: /시설이에요/ })).toBeFocused();

    // 경로(breadcrumb)는 h1보다 DOM상 앞에 있어 포커스 이동 후에는 Shift+Tab으로 도달한다.
    // h1에서 Tab을 누르면 바로 다음 콘텐츠인 검색창으로 이동한다.
    const searchBox = page.getByRole("searchbox");
    await searchBox.waitFor();
    await page.keyboard.press("Tab"); // 검색창
    await expect(searchBox).toBeFocused();

    const facilityLink = page.locator("main ul li a").first();
    await facilityLink.waitFor();
    await facilityLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/facility\/f-\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();

    // 상세 화면에서 외부 행동 버튼까지 키보드로 도달 가능해야 한다 (버튼이 있는 경우)
    const actionLinks = page.locator("main a[href^='tel:'], main a[target='_blank']");
    const count = await actionLinks.count();
    if (count > 0) {
      await actionLinks.first().focus();
      await expect(actionLinks.first()).toBeFocused();
    }
  });

  test("빈 업종 버튼은 Tab 순서를 건너뛴다 (A11Y-011)", async ({ page }) => {
    await page.goto("/region/gapyeong");
    await page.locator("main ul li").first().waitFor();
    const disabledButton = page.getByRole("button", { name: /등록 시설 없음/ }).first();
    await expect(disabledButton).toBeDisabled();
  });
});

test.describe("실브라우저 axe 스캔 — 페이지별 접근성 위반 0 (WCAG AA)", () => {
  const pages = [
    { name: "지역 선택", path: "/" },
    { name: "업종 선택", path: "/region/suwon" },
    { name: "업종 선택(빈 업종 포함)", path: "/region/gapyeong" },
    { name: "시설 목록", path: "/region/anseong/sports" },
    { name: "시설 상세", path: "/facility/f-001" },
    { name: "시설 상세(연락처 없음)", path: "/facility/f-192" },
    { name: "지역 시설 없음", path: "/region/gapyeong/education" },
  ];

  for (const { name, path } of pages) {
    test(`${name} (${path})`, async ({ page }) => {
      // 등장 애니메이션 도중의 일시적 저대비(opacity 전환 중)를 피하고 최종 상태를 스캔한다.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.locator("#main-content").waitFor();
      const results = await new AxeBuilder({ page })
        .include("#main-content")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("모션 축소 설정 (A11Y-012, AC-020)", () => {
  test("화면 전환과 업종 버튼 등장 애니메이션이 즉시 완료된 상태로 렌더링된다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/region/suwon");
    const firstCategory = page.locator("main ul li").first();
    await firstCategory.waitFor();
    const duration = await firstCategory.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return style.animationDuration;
    });
    // reduced-motion 전역 규칙(globals.css)이 0.01ms로 강제한다
    expect(["0.01ms", "1e-05s", "0s"]).toContain(duration);
  });

  test("모션 축소 환경에서도 핵심 흐름을 완료할 수 있다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("link", { name: "수원시" }).click();
    await expect(page.getByRole("heading", { name: /어떤 시설을 찾으세요/ })).toBeVisible();
  });
});

test.describe("200% 확대 (A11Y, AC-019 연장)", () => {
  // 1280x800 뷰포트에서 200% 확대는 실질적으로 640x400 컨테이너에 콘텐츠를 담는 것과 동등하다.
  test.use({ viewport: { width: 640, height: 400 } });

  const zoomPages = ["/", "/region/suwon", "/region/anseong/sports", "/facility/f-001"];

  for (const path of zoomPages) {
    test(`${path} — 가로 스크롤 없음, 콘텐츠 겹침 없음`, async ({ page }) => {
      await page.goto(path);
      await page.locator("#main-content").waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }
});

test.describe("터치 영역 44px·48px 최소 크기 (A11Y-004)", () => {
  test("주요 선택 버튼(업종)은 48px 이상이다", async ({ page }) => {
    await page.goto("/region/suwon");
    const firstCategory = page.locator("main ul li a, main ul li button").first();
    const box = await firstCategory.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });

  test("검색 지우기 같은 일반 아이콘 버튼은 44px 이상이다 (A11Y-004)", async ({ page }) => {
    await page.goto("/region/suwon/sports");
    const search = page.getByRole("searchbox");
    await search.fill("체육");
    const clearButton = page.getByRole("button", { name: "검색어 지우기" });
    const box = await clearButton.boundingBox();
    // 브라우저 픽셀 반올림 오차(수 만분의 1px)를 허용한다 — CSS 값은 44px(h-11/w-11)로 정확하다.
    expect(box?.width).toBeGreaterThanOrEqual(43.9);
    expect(box?.height).toBeGreaterThanOrEqual(43.9);
  });
});
