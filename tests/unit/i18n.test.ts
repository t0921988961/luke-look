import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  hrefLang,
  htmlLang,
  INDEXABLE_LOCALES,
  INTL_LOCALES,
  isIndexable,
  isIntlLocale,
  isLocale,
  localeCode,
  localePath,
  LOCALES,
  ogLocale,
} from "@/lib/i18n/config";
import { getDictionary, getLanguageLabels } from "@/lib/i18n/get-dictionary";
import { rememberLocale } from "@/lib/i18n/remember";

describe("locale config", () => {
  it("serves zh-TW at / and the rest under their code", () => {
    expect(DEFAULT_LOCALE).toBe("zh-TW");
    expect(localePath("zh-TW")).toBe("/");
    expect(localePath("en")).toBe("/en");
    expect(localePath("ja")).toBe("/ja");
    expect(localePath("ko")).toBe("/ko");
    expect([...INTL_LOCALES]).toEqual(["en", "ja", "ko"]);
  });

  it("maps locales to html lang, hreflang, Open Graph and short codes", () => {
    expect(htmlLang("zh-TW")).toBe("zh-Hant-TW");
    expect(htmlLang("ko")).toBe("ko");
    expect(hrefLang("zh-TW")).toBe("zh-TW");
    expect(LOCALES.map(ogLocale)).toEqual(["zh_TW", "en_US", "ja_JP", "ko_KR"]);
    expect(localeCode("zh-TW")).toBe("zh");
    expect(localeCode("ja")).toBe("ja");
  });

  it("validates locale strings", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isIntlLocale("zh-TW")).toBe(false);
    expect(isIntlLocale("ko")).toBe(true);
  });

  it("keeps ja and ko out of search until reviewed (D3)", () => {
    expect([...INDEXABLE_LOCALES]).toEqual(["zh-TW", "en"]);
    expect(isIndexable("ja")).toBe(false);
    expect(isIndexable("ko")).toBe(false);
  });
});

describe("dictionaries", () => {
  it("returns each locale's dictionary and labels for the switcher", () => {
    expect(getDictionary("zh-TW").langLabel).toBe("繁體中文");
    expect(getDictionary("en").langLabel).toBe("English");
    const labels = getLanguageLabels();
    expect(Object.keys(labels)).toEqual(["zh-TW", "en", "ja", "ko"]);
    expect(labels.ko).toEqual({ label: "한국어", short: "한국어" });
  });

  it("starts the language button's accessible name with its visible text", () => {
    for (const locale of LOCALES) {
      const t = getDictionary(locale);
      expect(t.nav.languageButton.startsWith(t.langShort)).toBe(true);
    }
  });
});

describe("rememberLocale", () => {
  it("stores the choice in the NEXT_LOCALE cookie", () => {
    rememberLocale("ja");
    expect(document.cookie).toContain("NEXT_LOCALE=ja");
  });
});
