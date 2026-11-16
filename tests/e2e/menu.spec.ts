import { expect, test } from "./fixtures";

test.describe("mobile menu", () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== "webkit-mobile", "mobile only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("traps focus in the header and menu, locks scroll, and closes on Escape", async ({ page, browserName }) => {
    const toggle = page.getByRole("button", { name: "選單" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "關閉" })).toHaveAttribute("aria-expanded", "true");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    expect(await page.evaluate(() => document.getElementById("main")!.inert)).toBe(true);
    await expect(page.locator("#mobile-menu a").first()).toBeFocused();

    if (browserName !== "webkit") {
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press("Tab");
        const inPage = await page.evaluate(() => !!document.activeElement?.closest("#main, #site-footer"));
        expect(inPage).toBe(false);
      }
    }

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "選單" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "選單" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("a section link closes the menu and goes to the section", async ({ page }) => {
    await page.getByRole("button", { name: "選單" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: /技能/ }).click();
    await expect(page.getByRole("button", { name: "選單" })).toHaveAttribute("aria-expanded", "false");
    await expect(page).toHaveURL(/#skills$/);
    await expect(page.locator("#skills")).toBeInViewport();
  });

  test("holds the theme switch and the language links", async ({ page }) => {
    await page.getByRole("button", { name: "選單" }).click();
    const menu = page.locator("#mobile-menu");
    await menu.getByRole("radio", { name: "深色" }).click();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
    await expect(menu.getByRole("link", { name: /한국어/ })).toHaveAttribute("href", "/ko");
  });
});
