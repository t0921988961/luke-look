import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { MARQUEE, SKILL_GROUPS } from "@/lib/site";
import { SectionHead } from "@/components/ui/SectionHead";

function MarqueeRow({ outline, reverse }: { outline?: boolean; reverse?: boolean }) {
  const items = reverse ? [...MARQUEE].reverse() : MARQUEE;
  return (
    <div className="overflow-hidden py-1">
      <div data-marquee data-dir={reverse ? -1 : 1} className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((word) => (
              <span key={word} className="flex items-center">
                <span
                  className={`px-4 text-[clamp(2.75rem,7.5vw,7rem)] leading-[1.05] font-extrabold tracking-[-0.04em] whitespace-nowrap md:px-7 ${
                    outline ? "outline-text" : "text-ink"
                  }`}
                >
                  {word}
                </span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary md:h-3.5 md:w-3.5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Skills({ t, locale }: { t: Dict["skills"]; locale: Locale }) {
  return (
    <section
      id="skills"
      data-marquee-host
      aria-labelledby="skills-title"
      className="relative scroll-mt-20 overflow-x-clip py-24 md:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1312px]">
          <SectionHead index="05" id="skills-title" title={t.title} intro={t.intro} locale={locale} />
        </div>
      </div>

      <div aria-hidden="true" className="mt-14 -rotate-[1.5deg] md:mt-20">
        <MarqueeRow />
        <MarqueeRow outline reverse />
      </div>

      <div className="mx-auto mt-16 max-w-[1440px] px-5 md:mt-24 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {t.groups.map((name, gi) => (
              <div key={gi} data-reveal className="border-t border-line-strong pt-5">
                <h3 className="flex items-baseline gap-2 text-[15px] font-bold text-ink">
                  <span aria-hidden="true" className="font-mono text-[11px] font-normal text-primary">
                    0{gi + 1}
                  </span>
                  {name}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {SKILL_GROUPS[gi].map((s) => (
                    <li
                      key={s}
                      className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[13px] text-ink-2 transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div data-reveal className="mt-16 grid gap-6 border-t border-line pt-8 text-sm md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.14em] text-muted uppercase">{t.langTitle}</h3>
              <ul className="mt-3 grid gap-1.5">
                {t.langs.map((l) => (
                  <li key={l.name} className="flex flex-wrap gap-x-3 text-ink-2">
                    <span className="font-semibold text-ink">{l.name}</span>
                    <span>{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.14em] text-muted uppercase">{t.eduTitle}</h3>
              <p className="mt-3 text-ink-2">
                <span className="font-semibold text-ink">{t.school}</span>
                <span aria-hidden="true" className="mx-2 text-muted">
                  ·
                </span>
                <span className="sr-only">, </span>
                {t.dept}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
