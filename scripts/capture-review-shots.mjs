import { chromium } from "playwright";
import path from "node:path";

const BASE = "http://localhost:5173";
const OUT_DIR =
  "C:\\Users\\JCR\\AppData\\Local\\Temp\\claude\\C--Users-JCR--claude-MMA\\88afe8b0-a440-499f-bd69-1fbe7e1d7688\\scratchpad\\shots";

const shots = [
  { name: "01-region", url: "/", wait: "text=우리 동네 혜택을 찾아보세요" },
  { name: "02-category", url: "/region/suwon", wait: "text=어떤 시설을 찾으세요" },
  { name: "03-facility-list", url: "/region/anseong/sports", wait: "text=총 " },
  { name: "04-facility-detail", url: "/facility/f-001", wait: "text=이용 전에" },
  { name: "05-px-finder", url: "/px", wait: "text=경기도 군마트 찾기" },
  { name: "06-px-detail", url: "/px/01-맹호", wait: "text=주소" },
  { name: "07-empty-region", url: "/region/gapyeong/education", wait: "text=등록된 시설이 없어요" },
];

const browser = await chromium.launch();

async function capture(viewport, prefix, list) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  for (const shot of list) {
    await page.goto(BASE + shot.url, { waitUntil: "networkidle" });
    try {
      await page.waitForSelector(shot.wait, { timeout: 5000 });
    } catch {}
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, `${prefix}-${shot.name}.png`),
      fullPage: false,
    });
    console.log("captured", prefix, shot.name);
  }
  await ctx.close();
}

await capture({ width: 1440, height: 900 }, "desktop", shots);
await capture({ width: 390, height: 844 }, "mobile", shots.slice(0, 6));

await browser.close();
console.log("done");
