import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.VRT_PORT ?? 3006);

/** Screenshots are taken on Linux with Playwright's Chromium. CI uses the same image. */
export default defineConfig({
  testDir: "tests/vrt",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 90_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
      threshold: 0.2,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
    timeout: 15_000,
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
