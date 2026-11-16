export const LOCALES = ["zh-TW", "en", "ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-TW";

/** Locales served under `/[lang]`; zh-TW lives at `/`. */
export const INTL_LOCALES = ["en", "ja", "ko"] as const satisfies readonly Locale[];
export type IntlLocale = (typeof INTL_LOCALES)[number];

/**
 * Locales that may be indexed. ja and ko stay out of search, the sitemap and
 * hreflang until a native speaker has reviewed them (plan D3).
 */
export const INDEXABLE_LOCALES: readonly Locale[] = ["zh-TW", "en"];

export const X_DEFAULT_LOCALE: Locale = "en";

/** Cookie read by the `/` redirect in next.config.ts. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isIntlLocale(value: unknown): value is IntlLocale {
  return typeof value === "string" && (INTL_LOCALES as readonly string[]).includes(value);
}

export function isIndexable(locale: Locale): boolean {
  return INDEXABLE_LOCALES.includes(locale);
}

export function localePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

/** Value for `<html lang>` and `lang` attributes. */
export function htmlLang(locale: Locale): string {
  return locale === "zh-TW" ? "zh-Hant-TW" : locale;
}

/** Value for `hreflang`. */
export function hrefLang(locale: Locale): string {
  return locale;
}

export function ogLocale(locale: Locale): string {
  return { "zh-TW": "zh_TW", en: "en_US", ja: "ja_JP", ko: "ko_KR" }[locale];
}

/** Short code shown in the language menu. */
export function localeCode(locale: Locale): string {
  return locale === "zh-TW" ? "zh" : locale;
}
