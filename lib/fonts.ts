import { Geist_Mono, Manrope, Noto_Sans_JP, Noto_Sans_KR, Noto_Sans_TC } from "next/font/google";
import type { Locale } from "./i18n/config";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });

const notoTC = Noto_Sans_TC({ variable: "--font-noto-tc", weight: ["400", "500", "700", "900"], preload: false });
const notoJP = Noto_Sans_JP({ variable: "--font-noto-jp", weight: ["400", "500", "700", "900"], preload: false });
const notoKR = Noto_Sans_KR({ variable: "--font-noto-kr", weight: ["400", "500", "700", "900"], preload: false });

const CJK: Record<Locale, string> = {
  "zh-TW": notoTC.variable,
  en: notoTC.variable,
  ja: notoJP.variable,
  ko: notoKR.variable,
};

/** Font CSS variables for a locale's <html>. The hero's vertical 鄭宏璋 needs the TC family everywhere. */
export function fontClassName(locale: Locale): string {
  const families = new Set([manrope.variable, geistMono.variable, notoTC.variable, CJK[locale]]);
  return Array.from(families).join(" ");
}
