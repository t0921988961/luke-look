import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.describe("featured title", () => {
  test("the Japanese title wraps on a phrase boundary inside the card", async ({ page }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/ja");
      await page.evaluate(() => document.fonts.ready);
      const info = await page.evaluate(() => {
        const title = document.querySelector("#work-featured-title");
        const card = title?.closest("article");
        if (!title || !card) return null;
        const range = document.createRange();
        const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
        const lines: string[] = [];
        let buf = "";
        let last: number | null = null;
        let lastRight = 0;
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const s = node.textContent ?? "";
          for (let i = 0; i < s.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getBoundingClientRect();
            if (!rect.width && !rect.height) continue;
            const top = Math.round(rect.top);
            if (last !== null && Math.abs(top - last) > 4) {
              lines.push(buf);
              buf = "";
            }
            buf += s[i];
            last = top;
            lastRight = rect.right;
          }
        }
        if (buf) lines.push(buf);
        return { lines, lastRight, cardRight: card.getBoundingClientRect().right };
      });
      expect(info).not.toBeNull();
      expect(info!.lastRight).toBeLessThanOrEqual(info!.cardRight + 1);
      expect(info!.lines.map((line) => line.trim())).toEqual(["VisionMax", "フリート管理", "プラットフォーム"]);
    }
  });
});

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
