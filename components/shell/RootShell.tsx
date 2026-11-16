import type { ReactNode } from "react";
import { htmlLang, type Locale } from "@/lib/i18n/config";
import { BOOT_SCRIPT } from "@/lib/theme";

/** The <html> document shared by the root layouts. Each layout passes its own fonts. */
export function RootShell({
  locale,
  className,
  preload = [],
  children,
}: {
  locale: Locale;
  className: string;
  /** Bold CJK files to start downloading before CSS is parsed. */
  preload?: string[];
  children: ReactNode;
}) {
  return (
    <html
      lang={htmlLang(locale)}
      data-theme="light"
      data-theme-pref="system"
      suppressHydrationWarning
      className={`${className} antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router root layout; the theme script must run before first paint. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {preload.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
