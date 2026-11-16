import { expect, scrollThrough, test } from "./fixtures";

const hiddenReveals = (page: import("@playwright/test").Page) =>
  page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length);

test.describe("motion", () => {
  test("pause stops looping motion and is remembered", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const footer = page.locator("#site-footer");
    const pause = footer.getByRole("button", { name: "暫停動態" });
    await pause.scrollIntoViewIfNeeded();
    await pause.click();
    await expect(footer.getByRole("button", { name: "播放動態" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.dataset.loops)).toBe("off");
    await page.reload();
    await expect(footer.getByRole("button", { name: "播放動態" })).toHaveAttribute("aria-pressed", "true");
    await footer.getByRole("button", { name: "播放動態" }).click();
    await expect(footer.getByRole("button", { name: "暫停動態" })).toBeVisible();
  });

  test("with motion on, every reveal ends visible after scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/motion-ready/);
    await scrollThrough(page);
    await expect.poll(() => hiddenReveals(page), { timeout: 10_000 }).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("with reduced motion, everything is visible at once and smooth scrolling is off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/motion-ready|lenis|js-motion/);
    expect(await hiddenReveals(page)).toBe(0);
  });

  test("without JavaScript the whole page is readable", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en");
    expect(await hiddenReveals(page)).toBe(0);
    await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
    await context.close();
  });
});
