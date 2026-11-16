import type { Locale } from "@/lib/i18n/config";
import { SplitWords } from "./SplitWords";

export function SectionHead({
  index,
  title,
  intro,
  id,
  locale,
}: {
  index: string;
  title: string;
  intro?: string;
  id: string;
  locale: Locale;
}) {
  return (
    <header className="grid gap-6 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-12">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tracking-[0.16em] text-primary">({index})</span>
          <span data-line className="h-px flex-1 origin-left bg-line-strong" />
        </div>
      </div>
      <h2 id={id} data-split className="display text-[clamp(2.4rem,6vw,5.5rem)] text-ink md:col-span-7">
        <SplitWords text={title} locale={locale} />
      </h2>
      {intro && (
        <p
          data-reveal
          className="pretty max-w-md self-end text-base leading-relaxed text-muted md:col-span-4 md:col-start-9 md:text-[17px]"
        >
          {intro}
        </p>
      )}
    </header>
  );
}
