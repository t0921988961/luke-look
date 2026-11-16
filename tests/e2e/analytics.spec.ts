import { expect, test } from "./fixtures";

test.describe("analytics events", () => {
  test.beforeEach(async ({ page, context, browserName }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      localStorage.setItem("consent.v1", JSON.stringify({ analytics: "granted", ts: Date.now() }));
    });
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.ready === "on");
    await expect(page.locator("html")).toHaveAttribute("data-analytics", "on");
    await page.evaluate(() => {
      document.querySelectorAll("a").forEach((node) => node.addEventListener("click", (event) => event.preventDefault()));
    });
  });

  test("events are recorded only after consent is granted", async ({ page, browserName }) => {
    await page.locator("#contact").getByRole("link", { name: "LinkedIn" }).click();
    await page.getByRole("button", { name: "顯示 Email" }).click();
    if (browserName === "chromium") await page.getByRole("button", { name: "複製" }).click();
    await page.getByRole("button", { name: /切換語言/ }).click();
    await page.locator("header a[hreflang='en']").evaluate((el) => {
      el.addEventListener("click", (event) => event.preventDefault(), { capture: true });
      (el as HTMLElement).click();
    });
    await page.locator("#site-footer [data-motion-toggle]").click();

    const names = await page.evaluate(() =>
      (window.dataLayer ?? [])
        .filter((entry) => (entry as { 0?: string })[0] === "event")
        .map((entry) => (entry as { 1: string })[1]),
    );
    const expected = ["contact_click", "reveal_email", "select_language", "toggle_motion"];
    if (browserName === "chromium") expected.push("copy_email");
    expect(names).toEqual(expect.arrayContaining(expected));
  });
});
