import { expect, test } from "./fixtures";

const SITE = "https://luke-look.vercel.app";

test.describe("seo", () => {
  test("zh-TW and en carry canonical and the hreflang cluster with x-default -> /en", async ({ page }) => {
    for (const [path, canonical] of [
      ["/", SITE],
      ["/en", `${SITE}/en`],
    ]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((ls) => ls.map((l) => `${l.getAttribute("hreflang")} ${l.getAttribute("href")}`));
      expect(alternates.sort()).toEqual([`en ${SITE}/en`, `x-default ${SITE}/en`, `zh-TW ${SITE}`].sort());
    }
  });

  test("ja is outside the hreflang cluster", async ({ page }) => {
    await page.goto("/ja");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/ja`);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  });

  test("Open Graph and the page title are localized", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Luke Cheng .*Front-end Engineer/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${SITE}/en`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /front-end engineer in Taipei/);
  });

  test("icons are linked", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][type="image/x-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("sitemap lists only indexable locales; robots blocks non-production builds", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${SITE}/</loc>`);
    expect(sitemap).toContain(`<loc>${SITE}/en</loc>`);
    expect(sitemap).not.toMatch(/\/(ja|ko)</);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/User-Agent: \*\s+Disallow: \//);
  });

  test("security headers are sent", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
