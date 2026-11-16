"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "./content";

export type ThemePref = "light" | "dark" | "system";

export type SiteContextValue = {
  locale: Locale;
  t: Dict;
  setLocale: (locale: Locale) => void;
  themePref: ThemePref;
  setThemePref: (pref: ThemePref, origin?: { x: number; y: number }) => void;
  scrollTo: (target: string | number) => void;
  reducedMotion: boolean;
};

export const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteContext>");
  return ctx;
}
