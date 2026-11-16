import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { buildPersonJsonLd, buildStructuredData } from "@/lib/jsonld";

describe("JSON-LD", () => {
  it("stays factual: no email, no GitHub, no school, language claim is zh-TW only", () => {
    for (const locale of LOCALES) {
      const data = buildPersonJsonLd(locale);
      const graph = JSON.stringify(buildStructuredData(locale));
      const text = JSON.stringify(data);
      expect(text).not.toMatch(/gmail|mailto|github|alumniOf|華夏|Education/i);
      expect(graph).not.toMatch(/gmail|mailto|alumniOf|華夏/);
      expect(graph).toMatch(/"@type":"Person"/);
      expect(graph).toMatch(/"@type":"WebSite"/);
      expect(graph).toMatch(/"@type":"ProfilePage"/);
      expect(data.knowsLanguage).toBe("zh-TW");
      expect(data.knowsAbout).toEqual(["Vue 3", "Angular", "TypeScript", "RxJS", "Pinia", "vue-i18n", "Vitest", "ECharts"]);
      expect(data.sameAs).toEqual([
        "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/",
        "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961",
      ]);
      expect(data.alternateName).toBe("鄭宏璋");
    }
  });
});

describe("llms.txt", () => {
  it("summarizes the résumé without an email address or a school", () => {
    const text = readFileSync("public/llms.txt", "utf8");
    expect(text).toMatch(/鄭宏璋/);
    expect(text).toMatch(/Vue 3/);
    expect(text).toMatch(/linkedin\.com/);
    expect(text).toMatch(/cake\.me/);
    expect(text).not.toMatch(/gmail|mailto:|華夏|學歷|alumniOf/i);
  });
});
