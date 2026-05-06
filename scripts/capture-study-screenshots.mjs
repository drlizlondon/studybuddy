import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const outputDir = "/Users/lizzie/studybuddy/screenshots";
const baseUrl = process.env.STUDY_DOUBLE_URL || "http://127.0.0.1:5173/";
mkdirSync(outputDir, { recursive: true });

const viewports = [
  { name: "desktop-response", width: 1440, height: 900 },
  { name: "ipad-landscape-response", width: 1180, height: 820 },
  { name: "ipad-portrait-response", width: 820, height: 1180 },
  { name: "mobile-response", width: 390, height: 844 },
  { name: "mobile-talk-open", width: 390, height: 844, talkOnly: true }
];

const browser = await chromium.launch({ headless: true });

for (const viewport of viewports) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.width < 600,
    hasTouch: viewport.width < 900
  });

  await page.addInitScript(() => {
    localStorage.setItem("studyDoubleDisplaySize", "large");
    localStorage.setItem("studyDoubleShowViewport", "true");
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Enter study room" }).click();
  await page.getByRole("button", { name: "Talk to Avery" }).click();

  if (!viewport.talkOnly) {
    await page.getByRole("button", { name: "I'm struggling to focus" }).click();
    await page.getByText("Let's make this smaller", { exact: false }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Start a 10-minute focus sprint" }).waitFor({ state: "visible" });
  } else {
    await page.getByRole("button", { name: "Encourage me" }).waitFor({ state: "visible" });
  }

  await page.waitForTimeout(450);
  await page.screenshot({
    path: `${outputDir}/${viewport.name}.png`,
    fullPage: false
  });

  await page.close();
}

await browser.close();
