import type { Metadata, MetadataRoute, Viewport } from "next";
import {
  DEFAULT_LOCALE,
  hrefLang,
  INDEXABLE_LOCALES,
  isIndexable,
  localePath,
  ogLocale,
  X_DEFAULT_LOCALE,
  type Locale,
} from "./i18n/config";
import { getDictionary } from "./i18n/get-dictionary";
import { PERSON, SITE_URL } from "./site";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#060a14" },
  ],
};

/** hreflang cluster: only reviewed, indexable locales, plus x-default for everyone else. */
export function languageAlternates(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of INDEXABLE_LOCALES) languages[hrefLang(l)] = localePath(l);
  languages["x-default"] = localePath(X_DEFAULT_LOCALE);
  return languages;
}

export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const indexable = isIndexable(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: `${PERSON.name} ${PERSON.nativeName}`,
    authors: [{ name: `${PERSON.name} (${PERSON.nativeName})` }],
    alternates: {
      canonical: localePath(locale),
      languages: indexable ? languageAlternates() : undefined,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "profile",
      siteName: `${PERSON.name} ${PERSON.nativeName}`,
      title: t.meta.title,
      description: t.meta.description,
      url: localePath(locale),
      locale: ogLocale(locale),
      alternateLocale: INDEXABLE_LOCALES.filter((l) => l !== locale).map(ogLocale),
      images: [{ url: `/og/${locale}.png`, width: 1200, height: 630, alt: t.meta.title }],
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
    twitter: {
      card: "summary",
      title: t.meta.title,
      description: t.meta.description,
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/** Crawlers that collect AI training data. Search engines and AI assistants stay allowed (plan §10.7). */
export const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "meta-externalagent",
];

export const AI_ASSISTANTS = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"];

export function buildRobots(vercelEnv: string | undefined): MetadataRoute.Robots {
  if (vercelEnv !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: AI_TRAINING_CRAWLERS, disallow: "/" },
      { userAgent: AI_ASSISTANTS, allow: "/" },
      { userAgent: "*", allow: "/", disallow: "/design" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

export function buildSitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates())
      .filter(([key]) => key !== "x-default")
      .map(([key, path]) => [key, `${SITE_URL}${path}`]),
  );
  return INDEXABLE_LOCALES.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    changeFrequency: "monthly",
    priority: locale === DEFAULT_LOCALE ? 1 : 0.8,
    alternates: { languages },
  }));
}
