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

  test("the skill rule is already drawn when motion is reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator(".skill-node")).toHaveCount(5);
    const drawn = await page.locator(".skill-rail").evaluate((el) => getComputedStyle(el, "::before").transform);
    expect(drawn === "none" || drawn.startsWith("matrix(1, 0, 0, 1")).toBe(true);
  });

  test("with reduced motion, everything is visible at once and smooth scrolling is off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/motion-ready|lenis|js-motion/);
    expect(await hiddenReveals(page)).toBe(0);
  });

  test("the name mark is already drawn when motion is reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".who-name")).toHaveCount(9);
    const offset = await page.locator(".who-name").first().evaluate((el) => getComputedStyle(el).strokeDashoffset);
    expect(offset === "0px" || offset === "0").toBe(true);
    expect(await page.locator(".who-blue").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("hero buttons lean toward a fine pointer only while motion plays", async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), "magnetic pull is for fine pointers");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.story === "on");
    const link = page.locator("a.magnetic").first();
    const box = await link.boundingBox();
    if (!box) throw new Error("hero action has no box");
    await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 + 8);
    await expect.poll(() => link.evaluate((el) => el.style.transform)).toContain("translate");
    await page.locator("#site-footer").getByRole("button", { name: "暫停動態" }).click();
    await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2);
    await expect.poll(() => link.evaluate((el) => el.style.transform)).toBe("");
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
