import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LINKS, PERIODS } from "@/lib/site";
import * as site from "@/lib/site";

// Stat prefixes and suffixes ("約", "yrs", "개") are optional per language.
const OPTIONAL_KEYS = new Set(["prefix", "suffix"]);

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !OPTIONAL_KEYS.has(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mjs|css)$/.test(name) ? [path] : [];
  });
}

const ROOT = process.cwd();
const PRODUCTION_SOURCES = ["app", "components/sections", "components/islands", "components/shell", "components/ui", "components/motion", "lib"].flatMap((d) =>
  sourceFiles(join(ROOT, d)),
);

describe("content guards", () => {
  it("gives every locale the same structure", () => {
    // The hero title's highlighted runs fall in different places per language.
    const structure = (locale: (typeof LOCALES)[number]) => {
      const t = getDictionary(locale);
      return shape({ ...t, hero: { ...t.hero, title: t.hero.title.length } });
    };
    for (const locale of LOCALES) expect(structure(locale)).toEqual(structure("zh-TW"));
  });

  it("never links to GitHub", () => {
    for (const file of PRODUCTION_SOURCES) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/github\.com/i);
    }
    for (const locale of LOCALES) expect(JSON.stringify(getDictionary(locale))).not.toMatch(/github\.com/i);
  });

  it("uses only numbers that appear in the résumé", () => {
    // From resume_v3_zh: 7 years, ~20 modules, 4 back-end engineers, 2 designers, 9 languages,
    // ~100 test files, ~500 -> 10,000+ subscriptions; plus version numbers and the copyright year.
    // 0 is the ?notrack=0 switch, not a résumé figure.
    const allowed = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "9", "11", "20", "100", "500", "10,000", "2026"]);
    const all = [...LOCALES.flatMap((l) => strings(getDictionary(l))), ...strings({ ...site, SITE_URL: "", LINKS: {}, PERIODS: [] })];
    for (const text of all) {
      const numbers = text.replace(/i18n/g, "").match(/\d[\d,]*/g) ?? [];
      for (const n of numbers) expect(allowed, `"${n}" in "${text}"`).toContain(n.replace(/,$/, ""));
    }
  });

  it("states the subscription growth as product scale, never as a personal result", () => {
    for (const locale of LOCALES) {
      for (const text of strings(getDictionary(locale)).filter((s) => /500/.test(s))) {
        expect(text, text).toMatch(/訂閱|subscriptions|契約数|구독/i);
      }
    }
    expect(getDictionary("zh-TW").work.scaleLabel).toBe("產品規模");
  });

  it("keeps the experience periods from the résumé", () => {
    expect(PERIODS.map((p) => `${p.from}-${p.to ?? "now"}`)).toEqual([
      "2023/05-now",
      "2022/03-2023/05",
      "2019/07-2022/03",
      "2018/08-2019/07",
      "2015/10-2018/04",
    ]);
  });

  it("links to the exact LinkedIn and CakeResume profiles", () => {
    expect(LINKS).toEqual({
      linkedin: "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/",
      cake: "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961",
    });
  });

  it("has no leftover design-proposal note", () => {
    for (const locale of LOCALES) {
      const t = getDictionary(locale);
      expect("note" in t.contact).toBe(false);
      expect(JSON.stringify(t)).not.toMatch(/設計提案|Design proposal|デザイン提案|디자인 제안/);
    }
  });

  it("describes English ability conservatively", () => {
    expect(getDictionary("zh-TW").skills.langs[1]).toEqual({ name: "英文", level: "可閱讀英文技術文件與 API 文件" });
    expect(getDictionary("en").skills.langs[1].level).toBe("Can read English technical and API documentation");
  });

  it("does not ship the plain email address in any source file", () => {
    for (const file of PRODUCTION_SOURCES) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/t0921988961@|t0921988961\+portfolio@|@gmail\.com/i);
    }
  });
});
