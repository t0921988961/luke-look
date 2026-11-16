import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import tcBold from "../assets/fonts/NotoSansTC-700.woff2";
import { latinClassName } from "@/lib/fonts/latin";
import { BOOT_SCRIPT } from "@/lib/theme";
import { ArrowUpRight, LogoMark } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "找不到頁面 · Page not found — Luke Cheng",
};

export default function GlobalNotFound() {
  return (
    <html lang="zh-Hant-TW" data-theme="light" suppressHydrationWarning className={`${latinClassName} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <link rel="preload" href={tcBold} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <main className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 py-8 md:px-10 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_68%_70%,rgb(255_190_150/0.3),transparent_70%),radial-gradient(70%_60%_at_20%_90%,rgb(70_120_255/0.18),transparent_70%)] dark:[background:radial-gradient(60%_45%_at_68%_70%,rgb(255_140_100/0.12),transparent_70%),radial-gradient(70%_60%_at_20%_90%,rgb(80_120_255/0.22),transparent_70%)]"
          />
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <LogoMark className="h-8 w-8" gradientId="lm-404" />
            <span className="text-[15px] leading-none font-bold tracking-tight">
              Luke Cheng<span className="ml-1.5 font-normal text-muted">鄭宏璋</span>
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-[1312px] flex-1 flex-col justify-center py-16">
            <p className="font-mono text-xs tracking-[0.16em] text-primary">(404)</p>
            <h1 className="display mt-6 text-[clamp(2.6rem,8vw,6.5rem)] text-ink">找不到這個頁面。</h1>
            <p lang="en" className="mt-3 text-[clamp(1.25rem,3vw,2rem)] font-semibold tracking-tight text-ink-2">
              This page doesn’t exist.
            </p>
            <p className="pretty mt-8 max-w-xl text-base leading-relaxed text-muted">
              網址可能有誤，或頁面已經移除。
              <span lang="en" className="block">
                The link may be wrong, or the page has moved.
              </span>
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-ink"
              >
                回到首頁
                <ArrowUpRight />
              </Link>
              <Link
                href="/en"
                lang="en"
                hrefLang="en"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface/50 px-6 text-[15px] font-semibold text-ink"
              >
                English home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
