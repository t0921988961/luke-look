import type { Locale } from "./config";
import en from "./dictionaries/en";
import ja from "./dictionaries/ja";
import ko from "./dictionaries/ko";
import zhTW from "./dictionaries/zh-TW";
import type { Dict } from "./types";

const DICTIONARIES: Record<Locale, Dict> = { "zh-TW": zhTW, en, ja, ko };

/** Server-side only: client islands receive just the strings they need as props. */
export function getDictionary(locale: Locale): Dict {
  return DICTIONARIES[locale];
}

/** Every locale's label, for the language switcher. */
export function getLanguageLabels(): Record<Locale, { label: string; short: string }> {
  return {
    "zh-TW": { label: zhTW.langLabel, short: zhTW.langShort },
    en: { label: en.langLabel, short: en.langShort },
    ja: { label: ja.langLabel, short: ja.langShort },
    ko: { label: ko.langLabel, short: ko.langShort },
  };
}
