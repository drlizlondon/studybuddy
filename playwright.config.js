import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const port = Number(process.env.SD1_PORT || 4173);
const dist = process.env.SD1_DIST || "dist";
// The sandbox browser lives at /opt/pw-browsers/chromium; elsewhere Playwright finds its own.
const executablePath = process.env.PW_CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${port}/studybuddy/`,
    launchOptions: executablePath ? { executablePath } : {}
  },
  projects: [
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } }
  ],
  webServer: {
    command: `npx vite preview --host 127.0.0.1 --port ${port} --outDir ${dist}`,
    url: `http://127.0.0.1:${port}/studybuddy/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
