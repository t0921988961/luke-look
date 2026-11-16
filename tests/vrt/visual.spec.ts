import { expect, test, type Page } from "@playwright/test";

type Scheme = "light" | "dark";

const shotOpts = { stylePath: "tests/vrt/vrt.css" as const };

async function settle(page: Page, path: string, width: number, scheme: Scheme) {
  await page.setViewportSize({ width, height: width < 700 ? 812 : 900 });
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, document.documentElement.scrollHeight);
    window.scrollTo(0, 0);
  });
}

test.beforeEach(async ({ page }, info) => {
  await page.clock.install({ time: new Date("2026-11-16T04:00:00Z") });
  if (info.title.includes("consent") || info.title.includes("404")) return;
  await page.addInitScript(() => {
    localStorage.setItem("consent.v1", JSON.stringify({ analytics: "denied", ts: Date.parse("2026-11-16T00:00:00Z") }));
  });
});

const pages: { path: string; name: string; tiers: ("pr" | "full")[] }[] = [
  { path: "/", name: "zh", tiers: ["pr"] },
  { path: "/en", name: "en", tiers: ["pr", "full"] },
  { path: "/ja", name: "ja", tiers: ["pr", "full"] },
  { path: "/ko", name: "ko", tiers: ["pr", "full"] },
];

const widths = [375, 768, 1440] as const;
const schemes: Scheme[] = ["light", "dark"];

for (const item of pages) {
  for (const width of widths) {
    for (const scheme of schemes) {
      // zh is entirely @pr. en/ja/ko at 375 and 1440 in light are @pr. The rest are @full.
      const tag = item.name === "zh" || (scheme === "light" && width !== 768) ? "pr" : "full";
      test(`${item.name} ${width} ${scheme} @${tag}`, async ({ page }) => {
        await settle(page, item.path, width, scheme);
        await expect(page).toHaveScreenshot(`${item.name}-${width}-${scheme}.png`, { ...shotOpts, fullPage: true, mask: [page.locator("[data-clock]")] });
      });
    }
  }
}

test("consent zh 375 light @pr", async ({ page }) => {
  await settle(page, "/", 375, "light");
  await expect(page.getByRole("region", { name: "Cookie" })).toBeVisible();
  await expect(page).toHaveScreenshot("state-consent-zh-375-light.png", shotOpts);
});

for (const [title, path, width, scheme] of [
  ["consent zh 1440 dark @full", "/", 1440, "dark"],
  ["consent en 375 light @full", "/en", 375, "light"],
  ["consent ja 375 light @full", "/ja", 375, "light"],
  ["consent ko 375 light @full", "/ko", 375, "light"],
] as const) {
  test(title, async ({ page }) => {
    await settle(page, path, width, scheme);
    await expect(page.getByRole("region", { name: /Cookie|クッキー|쿠키/ })).toBeVisible();
    await expect(page).toHaveScreenshot(`${title.replace(/ @.*/, "").replace(/ /g, "-")}.png`, shotOpts);
  });
}

test("email revealed zh 375 light @pr", async ({ page }) => {
  await settle(page, "/", 375, "light");
  await page.getByRole("button", { name: "顯示 Email" }).click();
  await expect(page.locator("#contact")).toHaveScreenshot("state-email-zh-375-light.png", shotOpts);
});

test("email revealed en 1440 dark @full", async ({ page }) => {
  await settle(page, "/en", 1440, "dark");
  await page.getByRole("button", { name: "Show email" }).click();
  await expect(page.locator("#contact")).toHaveScreenshot("state-email-en-1440-dark.png", shotOpts);
});

test("mobile menu zh 375 dark @pr", async ({ page }) => {
  await settle(page, "/", 375, "dark");
  await page.getByRole("button", { name: "選單" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await expect(page).toHaveScreenshot("state-menu-zh-375-dark.png", shotOpts);
});

test("mobile menu zh 375 light @full", async ({ page }) => {
  await settle(page, "/", 375, "light");
  await page.getByRole("button", { name: "選單" }).click();
  await expect(page).toHaveScreenshot("state-menu-zh-375-light.png", shotOpts);
});

test("language menu zh 1440 light @pr", async ({ page }) => {
  await settle(page, "/", 1440, "light");
  await page.getByRole("button", { name: /切換語言/ }).click();
  await expect(page.locator("header a[hreflang='en']")).toBeVisible();
  await expect(page).toHaveScreenshot("state-lang-zh-1440-light.png", shotOpts);
});

test("language menu zh 1440 dark @full", async ({ page }) => {
  await settle(page, "/", 1440, "dark");
  await page.getByRole("button", { name: /切換語言/ }).click();
  await expect(page).toHaveScreenshot("state-lang-zh-1440-dark.png", shotOpts);
});

test("privacy en 375 light @full", async ({ page }) => {
  await settle(page, "/en", 375, "light");
  await page.locator("#privacy").evaluate((el) => {
    if (el instanceof HTMLDetailsElement) el.open = true;
  });
  await expect(page.locator("#privacy")).toHaveScreenshot("state-privacy-en-375-light.png", shotOpts);
});

test("404 375 light @pr", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveScreenshot("state-404-375-light.png", { ...shotOpts, fullPage: true });
});

test("404 1440 dark @full", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page).toHaveScreenshot("state-404-1440-dark.png", { ...shotOpts, fullPage: true });
});
