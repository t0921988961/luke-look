"use client";

import "./globals.css";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <main className="flex min-h-[100svh] flex-col items-start justify-center gap-6 px-5 md:px-16">
          <p className="font-mono text-xs tracking-[0.16em] text-primary">(error)</p>
          <h1 className="display text-[clamp(2.2rem,6vw,4.5rem)] text-ink">發生了一點問題。</h1>
          <p lang="en" className="text-xl font-semibold text-ink-2">
            Something went wrong.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-ink"
            >
              重新整理 · Try again
            </button>
            <Link href="/" className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-[15px] font-semibold text-ink">
              回到首頁 · Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
