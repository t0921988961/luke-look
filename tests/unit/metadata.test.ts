import { describe, expect, it } from "vitest";
import { AI_ASSISTANTS, AI_TRAINING_CRAWLERS, buildMetadata, buildRobots, buildSitemap, languageAlternates } from "@/lib/metadata";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const SITE = "https://luke-look.vercel.app";

describe("buildMetadata", () => {
  it("gives indexable locales a canonical URL and the hreflang cluster", () => {
    const zh = buildMetadata("zh-TW");
    expect(zh.alternates?.canonical).toBe("/");
    expect(zh.alternates?.languages).toEqual({ "zh-TW": "/", en: "/en", "x-default": "/en" });
    expect(zh.robots).toEqual({ index: true, follow: true });

    const en = buildMetadata("en");
    expect(en.alternates?.canonical).toBe("/en");
    expect(en.alternates?.languages).toEqual(languageAlternates());
  });

  it("marks ja and ko noindex and leaves them out of hreflang", () => {
    for (const locale of ["ja", "ko"] as const) {
      const m = buildMetadata(locale);
      expect(m.robots).toEqual({ index: false, follow: true });
      expect(m.alternates?.languages).toBeUndefined();
      expect(m.alternates?.canonical).toBe(`/${locale}`);
    }
  });

  it("uses the localized title and description and an absolute base", () => {
    const en = buildMetadata("en");
    expect(String(en.title)).toContain("Luke Cheng");
    expect(en.description).toMatch(/front-end engineer/i);
    expect(en.metadataBase?.toString()).toBe(`${SITE}/`);
    expect(en.openGraph).toMatchObject({ locale: "en_US", url: "/en", alternateLocale: ["zh_TW"] });
  });

  it("adds the Search Console token only when it is configured", () => {
    const previous = process.env.GOOGLE_SITE_VERIFICATION;
    process.env.GOOGLE_SITE_VERIFICATION = "token-123";
    expect(buildMetadata("en").verification).toEqual({ google: "token-123" });
    delete process.env.GOOGLE_SITE_VERIFICATION;
    expect(buildMetadata("en").verification).toBeUndefined();
    if (previous) process.env.GOOGLE_SITE_VERIFICATION = previous;
  });

  it("never exposes an email address", () => {
    for (const locale of ["zh-TW", "en", "ja", "ko"] as const) {
      expect(JSON.stringify(buildMetadata(locale))).not.toMatch(/@gmail|mailto:|t0921988961/i);
    }
  });
});

describe("robots", () => {
  it("disallows everything outside production", () => {
    expect(buildRobots(undefined)).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    expect(buildRobots("preview")).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    expect(robots()).toEqual(buildRobots(process.env.VERCEL_ENV));
  });

  it("blocks AI training crawlers but allows search and assistants in production", () => {
    const r = buildRobots("production");
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules[0]).toEqual({ userAgent: AI_TRAINING_CRAWLERS, disallow: "/" });
    expect(AI_TRAINING_CRAWLERS).toEqual(expect.arrayContaining(["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Bytespider"]));
    expect(rules[1]).toEqual({ userAgent: AI_ASSISTANTS, allow: "/" });
    expect(rules[2]).toMatchObject({ userAgent: "*", allow: "/" });
    expect(r.sitemap).toBe(`${SITE}/sitemap.xml`);
  });
});

describe("sitemap", () => {
  it("lists only indexable locales with their alternates", () => {
    const s = buildSitemap();
    expect(s.map((e) => e.url)).toEqual([`${SITE}/`, `${SITE}/en`]);
    expect(s[0].alternates?.languages).toEqual({ "zh-TW": `${SITE}/`, en: `${SITE}/en` });
    expect(sitemap()).toEqual(s);
    expect(JSON.stringify(s)).not.toMatch(/\/(ja|ko)\b/);
  });
});
