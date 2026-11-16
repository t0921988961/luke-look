import { expect, test } from "./fixtures";

const ADDRESS = ["t0921988961", "+portfolio", "@", "gmail.com"].join("");
const LEAK = /gmail|t0921988961[+@]|mailto:/i;

test.describe("contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("no address or mailto before the visitor asks", async ({ page, request }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toMatch(LEAK);
    await page.goto("/");
    expect(await page.evaluate(() => document.body.innerText)).not.toMatch(LEAK);
    const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.filter((h) => LEAK.test(h))).toEqual([]);
  });

  test("LinkedIn and CakeResume are the primary links", async ({ page }) => {
    await page.goto("/en");
    const contact = page.locator("#contact");
    const linkedin = contact.getByRole("link", { name: "LinkedIn" });
    const cake = contact.getByRole("link", { name: "CakeResume" });
    await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/");
    await expect(cake).toHaveAttribute("href", "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961");
    for (const link of [linkedin, cake]) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    const external = await page.locator('a[target="_blank"]').evaluateAll((as) => as.map((a) => a.getAttribute("rel")));
    expect(external.every((rel) => rel === "noopener noreferrer")).toBe(true);
  });

  test("Show email reveals the +portfolio address, announces it and focuses Copy", async ({ page, context, browserName }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.ready === "on");
    const reveal = page.getByRole("button", { name: "顯示 Email" });
    await reveal.scrollIntoViewIfNeeded();
    await reveal.click();

    const region = page.locator("#email-reveal");
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toContainText(ADDRESS);
    await expect(page.getByRole("button", { name: "複製" })).toBeFocused();
    await expect(region.getByRole("link", { name: /寄信/ })).toHaveAttribute("href", `mailto:${ADDRESS}`);
    await expect(page.getByRole("button", { name: "隱藏 Email" })).toHaveAttribute("aria-expanded", "true");

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.getByRole("button", { name: "複製" }).click();
      await expect(page.getByRole("button", { name: "已複製" })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ADDRESS);
    }
  });

  test("without JavaScript, visitors are pointed to LinkedIn and CakeResume", async ({ browser, request }) => {
    // Browsers with scripting disabled render <noscript> content; Playwright's switch does not, so check the markup.
    const html = await (await request.get("/")).text();
    expect(html).toMatch(/<noscript><p[^>]*>請透過 LinkedIn 或 CakeResume 與我聯絡。<\/p><\/noscript>/);
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#contact").getByRole("link", { name: "LinkedIn" })).toBeVisible();
    expect(await page.content()).not.toMatch(/gmail|t0921988961[+@]/i);
    await context.close();
  });

  test("the résumé slot stays hidden until a file is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  });
});
