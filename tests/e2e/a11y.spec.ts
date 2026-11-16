import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, LOCALE_PAGES, openLanguageChoices, scrollThrough, test } from "./fixtures";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(summary, label).toEqual([]);
}

test.describe("accessibility (axe)", () => {
  for (const { path, locale } of LOCALE_PAGES) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${locale} ${scheme}`, async ({ page }, info) => {
        test.skip(info.project.name !== "chromium-desktop" && scheme === "dark", "dark mode is covered on desktop");
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(path);
        await scrollThrough(page);
        await audit(page, `${path} ${scheme}`);
      });
    }
  }

  test("after a full scroll with motion on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await scrollThrough(page);
    // The hero fades out on purpose while scrolled past; audit it at rest.
    await page.evaluate(() => window.scrollTo(0, 0));
    // The last reveal batch is staggered, so a fixed wait can still catch it mid-fade on WebKit.
    await expect.poll(async () =>
      page.locator("[data-reveal]").evaluateAll((els) =>
        els.every((el) => {
          const style = getComputedStyle(el);
          const transform = style.transform;
          const parked = transform === "none" || transform.startsWith("matrix(1, 0, 0, 1");
          return Number(style.opacity) >= 0.99 && parked;
        }),
      ),
    ).toBe(true);
    await audit(page, "motion on");
  });

  test("with menus open and the email revealed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await openLanguageChoices(page);
    await audit(page, "language choices open");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "顯示 Email" }).click();
    await audit(page, "email revealed");
  });
});
