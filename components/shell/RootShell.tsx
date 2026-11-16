import type { ReactNode } from "react";
import { fontClassName } from "@/lib/fonts";
import { htmlLang, type Locale } from "@/lib/i18n/config";
import { BOOT_SCRIPT } from "@/lib/theme";

/** The <html> document shared by both root layouts. */
export function RootShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html
      lang={htmlLang(locale)}
      data-theme="light"
      data-theme-pref="system"
      suppressHydrationWarning
      className={`${fontClassName(locale)} antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router root layout; the theme script must run before first paint. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
