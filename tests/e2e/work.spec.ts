import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.describe("project notes", () => {
  test("a project note opens the résumé facts", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/en");
    const detail = page.locator("#work").getByRole("button", { name: "About this project" }).first();
    await detail.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await detail.click();
    await expect(page.getByText("Features include live video, map event markers and ECharts charts.")).toBeVisible();
  });

  test("an open project note stays accessible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const detail = page.locator("#work").getByRole("button", { name: "這個專案" }).first();
    await detail.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await detail.click();
    const results = await new AxeBuilder({ page }).include("#work").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
