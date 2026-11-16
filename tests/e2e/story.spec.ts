import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.describe("career story and project notes", () => {
  test("reduced motion shows the whole route and no play control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "一路走來" })).toBeVisible();
    await expect(page.locator(".story-controls")).toBeHidden();
    const story = page.locator("#journey");
    for (const name of ["佳因企業", "巧禾數位", "金寶電子", "坤侑科技", "神達電腦"]) {
      await expect(story.getByRole("button", { name: new RegExp(name) })).toBeVisible();
    }
    const offset = await page.locator(".story-route").first().evaluate((el) => getComputedStyle(el).strokeDashoffset);
    expect(offset === "0px" || offset === "0").toBe(true);
    await expect(page.locator(".story-sticky")).toHaveCSS("position", "static");
  });

  test("play, pause and project notes work when motion is on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/en");
    await page.waitForFunction(() => document.documentElement.dataset.story === "on");
    const play = page.getByRole("button", { name: /Play this story|Play again/ });
    await play.scrollIntoViewIfNeeded();
    await expect(play).toBeVisible();
    await play.click();
    const pause = page.getByRole("button", { name: "Pause", exact: true });
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await pause.click();
    await expect(page.getByRole("button", { name: /Play this story|Play again/ })).toHaveAttribute("aria-pressed", "false");

    const mitac = page.locator("#journey").getByRole("button", { name: /MiTAC/ });
    await mitac.click();
    await expect(mitac).toHaveAttribute("aria-current", "step");

    const detail = page.locator("#work").getByRole("button", { name: "About this project" }).first();
    await detail.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await detail.click();
    await expect(page.getByText("Features include live video, map event markers and ECharts charts.")).toBeVisible();
  });

  test("pause toggle returns the story to the static picture", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.story === "on");
    await page.locator("#site-footer").getByRole("button", { name: "暫停動態" }).click();
    await expect(page.locator(".story-controls")).toBeHidden();
    const offset = await page.locator(".story-route").first().evaluate((el) => getComputedStyle(el).strokeDashoffset);
    expect(offset === "0px" || offset === "0").toBe(true);
  });

  test("the story and an open project note stay accessible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const detail = page.locator("#work").getByRole("button", { name: "這個專案" }).first();
    await detail.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await detail.click();
    const results = await new AxeBuilder({ page }).include("#journey").include("#work").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
