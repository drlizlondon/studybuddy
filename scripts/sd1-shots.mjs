// SD-1 screenshots: 390x844 and 1280x800, day and evening, plus one with reduced motion.
// Usage: node scripts/sd1-shots.mjs [baseUrl]   (run `npm run build && npm run preview` first)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173/studybuddy/";
const outDir = new URL("../docs/sd1-shots/", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium"
});

async function shoot({ name, width, height, evening, reduced, room }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference"
  });
  const page = await context.newPage();
  await page.addInitScript((roomId) => {
    localStorage.setItem("studyDoubleShowViewport", "false");
    if (roomId) localStorage.setItem("studyDoubleRoom", roomId);
  }, room || null);
  await page.clock.install();
  await page.goto(baseUrl);
  if (evening) await page.getByRole("button", { name: "Switch to evening mode" }).click();
  await page.screenshot({ path: `${outDir}${name}-setup.png` });
  await page.getByRole("button", { name: "Enter study room" }).click();
  await page.clock.fastForward(7000);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}${name}-room.png` });
  await context.close();
}

for (const [width, height] of [[390, 844], [1280, 800]]) {
  for (const evening of [false, true]) {
    await shoot({ name: `${width}x${height}-${evening ? "evening" : "day"}`, width, height, evening });
  }
}
await shoot({ name: "1280x800-day-reduced-motion", width: 1280, height: 800, evening: false, reduced: true });
await shoot({ name: "390x844-evening-reduced-motion", width: 390, height: 844, evening: true, reduced: true });
for (const room of ["alps", "office"]) {
  await shoot({ name: `1280x800-day-${room}`, width: 1280, height: 800, evening: false, room });
  await shoot({ name: `1280x800-evening-${room}`, width: 1280, height: 800, evening: true, room });
}
await browser.close();
console.log("shots written to", outDir);
