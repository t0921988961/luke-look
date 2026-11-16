import { expect, test } from "./fixtures";

test.describe("consent", () => {
  test.use({ seedConsent: false });

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("a first visit can refuse, and the choice is remembered", async ({ page }) => {
    const hits: string[] = [];
    await page.route(/googletagmanager|google-analytics|analytics\.google/, (route) => {
      hits.push(route.request().url());
      return route.abort();
    });
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Cookie" });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("button", { name: "接受" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "拒絕" })).toBeVisible();
    await banner.getByRole("button", { name: "拒絕" }).click();
    await expect(banner).toBeHidden();
    expect(hits).toEqual([]);
    await page.reload();
    await expect(page.getByRole("region", { name: "Cookie" })).toHaveCount(0);
    expect(hits).toEqual([]);
  });

  test("accept loads GA only after the click", async ({ page }) => {
    const hits: string[] = [];
    await page.route(/googletagmanager|google-analytics|analytics\.google/, (route) => {
      hits.push(route.request().url());
      return route.fulfill({ status: 200, body: "window.dataLayer=window.dataLayer||[];" });
    });
    await page.goto("/");
    expect(hits).toEqual([]);
    await page.getByRole("region", { name: "Cookie" }).getByRole("button", { name: "接受" }).click();
    await expect.poll(() => hits.some((url) => url.includes("gtag/js"))).toBe(true);
    const calls = await page.evaluate(() =>
      (window.dataLayer ?? []).map((entry) => {
        const item = entry as { 0?: string; 1?: string; 2?: Record<string, string> };
        return { command: item[0], name: item[1], payload: item[2] };
      }),
    );
    expect(calls[0]).toMatchObject({
      command: "consent",
      name: "default",
      payload: { analytics_storage: "denied", ad_storage: "denied" },
    });
    expect(calls.some((call) => call.name === "update" && call.payload?.analytics_storage === "granted")).toBe(true);
    expect(calls.some((call) => call.payload?.ad_storage === "granted")).toBe(false);
  });

  test("the footer reopens the choice and focuses the heading", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "拒絕" }).click();
    await page.locator("#site-footer").getByRole("button", { name: "Cookie 設定" }).click();
    await expect(page.getByRole("region", { name: "Cookie" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cookie" })).toBeFocused();
  });

  test("?notrack=1 hides the banner", async ({ page }) => {
    const hits: string[] = [];
    await page.route(/googletagmanager|google-analytics/, (route) => {
      hits.push(route.request().url());
      return route.abort();
    });
    await page.goto("/?notrack=1");
    await expect(page.getByRole("region", { name: "Cookie" })).toHaveCount(0);
    await expect(page.locator("#site-footer").getByText("不追蹤中", { exact: true })).toBeVisible();
    expect(hits).toEqual([]);
  });

  test("the banner does not cover the hero button on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const banner = await page.getByRole("region", { name: "Cookie" }).boundingBox();
    const cta = await page.getByRole("link", { name: "與我聯絡" }).boundingBox();
    expect(banner && cta && banner.y >= cta.y + cta.height - 1).toBeTruthy();
  });
});
