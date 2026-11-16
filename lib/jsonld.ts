import { localePath, type Locale } from "./i18n/config";
import { LINKS, PERSON, SITE_URL } from "./site";

const JOB_TITLE: Record<Locale, string> = {
  "zh-TW": "前端工程師",
  en: "Front-end Engineer",
  ja: "フロントエンドエンジニア",
  ko: "프론트엔드 엔지니어",
};

/** Factual Person data. No email and no GitHub. Language claim stays at zh-TW. */
export function buildPersonJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON.name,
    alternateName: PERSON.nativeName,
    jobTitle: JOB_TITLE[locale],
    url: `${SITE_URL}${localePath(locale) === "/" ? "" : localePath(locale)}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Taipei",
      addressCountry: "TW",
    },
    sameAs: [LINKS.linkedin, LINKS.cake],
    knowsLanguage: "zh-TW",
  };
}
