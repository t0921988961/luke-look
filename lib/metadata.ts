import type { Metadata, Viewport } from "next";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/get-dictionary";
import { SITE_URL } from "./site";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#060a14" },
  ],
};

export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
  };
}
