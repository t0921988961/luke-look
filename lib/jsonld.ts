import { htmlLang, localePath, type Locale } from "./i18n/config";
import { getDictionary } from "./i18n/get-dictionary";
import { LINKS, PERSON, SITE_URL } from "./site";

const JOB_TITLE: Record<Locale, string> = {
  "zh-TW": "前端工程師",
  en: "Front-end Engineer",
  ja: "フロントエンドエンジニア",
  ko: "프론트엔드 엔지니어",
};

/** Current employer, as written on the page. No school: education is not published. */
const EMPLOYER: Record<Locale, string> = {
  "zh-TW": "神達電腦",
  en: "MiTAC",
  ja: "神達電腦（MiTAC）",
  ko: "MiTAC",
};

/** Tools named on the résumé and on the page. WebRTC stays off this list. */
const KNOWS_ABOUT = ["Vue 3", "Angular", "TypeScript", "RxJS", "Pinia", "vue-i18n", "Vitest", "ECharts"];

function pageUrl(locale: Locale) {
  const path = localePath(locale);
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

/** Factual Person data. No email, no GitHub, no school. Language claim stays at zh-TW. */
export function buildPersonJsonLd(locale: Locale) {
  return {
    "@type": "Person",
    "@id": `${pageUrl(locale)}#person`,
    name: PERSON.name,
    alternateName: PERSON.nativeName,
    jobTitle: JOB_TITLE[locale],
    url: pageUrl(locale),
    worksFor: { "@type": "Organization", name: EMPLOYER[locale] },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Taipei",
      addressCountry: "TW",
    },
    sameAs: [LINKS.linkedin, LINKS.cake],
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: "zh-TW",
  };
}

/** Person, WebSite and ProfilePage for the locale. One graph, no education. */
export function buildStructuredData(locale: Locale) {
  const t = getDictionary(locale);
  const person = buildPersonJsonLd(locale);
  const url = pageUrl(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: `${PERSON.name} ${PERSON.nativeName}`,
        url: SITE_URL,
        inLanguage: ["zh-Hant-TW", "en"],
        publisher: { "@id": person["@id"] },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: htmlLang(locale),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": person["@id"] },
        about: { "@id": person["@id"] },
      },
    ],
  };
}
