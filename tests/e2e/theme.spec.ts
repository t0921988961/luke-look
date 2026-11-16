import { expect, isMobile, test } from "./fixtures";

const themeOf = (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.dataset.theme);

test.describe("theme", () => {
  test("follows the OS by default", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(await themeOf(page)).toBe("dark");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en");
    expect(await themeOf(page)).toBe("light");
  });

  test("never flashes: the stored theme is set before the body is parsed", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
      const seen: (string | null)[] = [];
      new MutationObserver(() => {
        if (document.body && !seen.length) seen.push(document.documentElement.getAttribute("data-theme"));
      }).observe(document, { childList: true, subtree: true });
      (window as unknown as { __firstBodyTheme: (string | null)[] }).__firstBodyTheme = seen;
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const first = await page.evaluate(() => (window as unknown as { __firstBodyTheme: string[] }).__firstBodyTheme[0]);
    expect(first).toBe("dark");
  });

  test("a chosen theme survives reload, and System follows live OS changes", async ({ page }) => {
    test.skip(isMobile(page), "the desktop header holds the theme switch; mobile is covered by the menu spec");
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    const group = page.getByRole("radiogroup", { name: "主題" }).first();
    await group.getByRole("radio", { name: "深色" }).click();
    expect(await themeOf(page)).toBe("dark");
    await page.reload();
    expect(await themeOf(page)).toBe("dark");
    await expect(page.getByRole("radiogroup", { name: "主題" }).first().getByRole("radio", { name: "深色" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.getByRole("radiogroup", { name: "主題" }).first().getByRole("radio", { name: "跟隨系統" }).click();
    expect(await themeOf(page)).toBe("light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => themeOf(page)).toBe("dark");
  });
});
