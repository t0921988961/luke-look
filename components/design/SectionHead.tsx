"use client";

import { useSite } from "./site-context";
import { SplitWords } from "./Split";

export function SectionHead({
  index,
  title,
  intro,
  id,
  tone = "default",
}: {
  index: string;
  title: string;
  intro?: string;
  id: string;
  tone?: "default" | "inverse";
}) {
  const { locale } = useSite();
  const inverse = tone === "inverse";
  return (
    <header className="grid gap-6 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-12">
        <div className="flex items-center gap-4">
          <span className={`font-mono text-xs tracking-[0.16em] ${inverse ? "text-sky" : "text-primary"}`}>({index})</span>
          <span
            data-line
            className={`h-px flex-1 origin-left ${inverse ? "bg-white/20" : "bg-line-strong"}`}
          />
        </div>
      </div>
      <h2
        id={id}
        data-split
        className={`display text-[clamp(2.4rem,6vw,5.5rem)] md:col-span-7 ${inverse ? "text-white" : "text-ink"}`}
      >
        <SplitWords text={title} locale={locale} />
      </h2>
      {intro && (
        <p
          data-reveal
          className={`pretty max-w-md self-end text-base leading-relaxed md:col-span-4 md:col-start-9 md:text-[17px] ${
            inverse ? "text-white/70" : "text-muted"
          }`}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
