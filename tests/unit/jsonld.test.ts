import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { buildPersonJsonLd } from "@/lib/jsonld";

describe("JSON-LD", () => {
  it("stays factual: no email, no GitHub, language claim is zh-TW only", () => {
    for (const locale of LOCALES) {
      const data = buildPersonJsonLd(locale);
      const text = JSON.stringify(data);
      expect(text).not.toMatch(/gmail|mailto|github/i);
      expect(data.knowsLanguage).toBe("zh-TW");
      expect(data.sameAs).toEqual([
        "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/",
        "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961",
      ]);
      expect(data.alternateName).toBe("鄭宏璋");
    }
  });
});
