import { test as base, expect, type Page } from "@playwright/test";

type Options = {
  /** Console errors that a test expects, e.g. the 404 status of a missing page. */
  allowedConsoleErrors: RegExp[];
  /** Skip the end-of-test overflow check (e.g. after navigating away). */
  checkOverflow: boolean;
};

/**
 * Every test fails on console errors, uncaught exceptions, CSP violations,
 * or a page wider than the viewport.
 */
export const test = base.extend<Options & { pageGuards: void }>({
  allowedConsoleErrors: [[], { option: true }],
  checkOverflow: [true, { option: true }],
  pageGuards: [
    async ({ page, allowedConsoleErrors, checkOverflow }, use) => {
      const problems: string[] = [];
      await page.addInitScript(() => {
        document.addEventListener("securitypolicyviolation", (e) => {
          console.error(`CSP violation: ${e.violatedDirective} blocked ${e.blockedURI}`);
        });
      });
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (!allowedConsoleErrors.some((re) => re.test(text))) problems.push(`console: ${text}`);
      });
      page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));

      await use();

      if (checkOverflow && !page.isClosed() && page.url().startsWith("http")) {
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth, "page must not overflow horizontally").toBeLessThanOrEqual(innerWidth);
      }
      expect(problems, "no console errors, page errors or CSP violations").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const LOCALE_PAGES = [
  { locale: "zh-TW", path: "/", lang: "zh-Hant-TW", h1: /讓複雜的系統/ },
  { locale: "en", path: "/en", lang: "en", h1: /Making complex systems/ },
  { locale: "ja", path: "/ja", lang: "ja", h1: /複雑なシステムを/ },
  { locale: "ko", path: "/ko", lang: "ko", h1: /복잡한 시스템을/ },
] as const;

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

/** Scrolls through the whole page so scroll-triggered content runs, then back to the top. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
  });
}

/** Opens the language menu (desktop) or the mobile menu, where the language links live. */
export async function openLanguageChoices(page: Page) {
  if (isMobile(page)) {
    await page.getByRole("button", { name: /選單|Menu|メニュー|메뉴/ }).click();
    return page.locator("#mobile-menu");
  }
  await page.getByRole("button", { name: /change language|切換語言|言語を切り替える|언어 변경/ }).click();
  return page.locator("header");
}
