import { expect, LOCALE_PAGES, openLanguageChoices, test } from "./fixtures";

test.describe("languages", () => {
  for (const { path, lang, h1 } of LOCALE_PAGES) {
    test(`${path} renders in ${lang}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }

  test("ja and ko are noindex while unreviewed; zh-TW and en are indexable", async ({ page }) => {
    for (const { path } of LOCALE_PAGES) {
      await page.goto(path);
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots, path).toBe(path === "/ja" || path === "/ko" ? "noindex, follow" : "index, follow");
    }
  });

  test("the switcher changes language, keeps the section and remembers the choice", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#skills");
    const choices = await openLanguageChoices(page);
    await choices.getByRole("link", { name: /English/ }).click();
    await expect(page).toHaveURL(/\/en#skills$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("en");

    await page.goto("/?utm_source=linkedin&utm_medium=profile");
    await expect(page).toHaveURL(/\/en\?utm_source=linkedin&utm_medium=profile$/);

    const back = await openLanguageChoices(page);
    await back.getByRole("link", { name: /繁體中文/ }).click();
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant-TW");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant-TW");
  });

  test("the language links work without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const href = await page.locator('a[hreflang="ko"]').first().getAttribute("href");
    expect(href).toBe("/ko");
    await context.close();
  });
});

test.describe("not found", () => {
  test.use({ allowedConsoleErrors: [/404/] });

  for (const path of ["/fr", "/en/nope", "/wp-admin"]) {
    test(`${path} returns the global 404`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("找不到這個頁面。");
      await expect(page.getByRole("link", { name: "English home" })).toHaveAttribute("href", "/en");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }
});
