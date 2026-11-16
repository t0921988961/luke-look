import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { SectionHead } from "@/components/ui/SectionHead";

export function About({ t, locale }: { t: Dict["about"]; locale: Locale }) {
  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 px-5 py-24 md:px-10 md:py-36 xl:px-16">
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="01" id="about-title" title={t.title} locale={locale} />

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:gap-6">
          <p
            data-reveal
            className="pretty text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.35] font-semibold tracking-tight text-ink md:col-span-7"
          >
            {t.lead}
          </p>
          <p data-reveal className="pretty text-base leading-[1.85] text-ink-2 md:col-span-4 md:col-start-9 md:text-[17px]">
            {t.body}
          </p>
        </div>

        <ul data-stats className="mt-16 grid grid-cols-2 gap-x-5 gap-y-10 md:mt-24 lg:grid-cols-4 lg:gap-6">
          {t.stats.map((s, i) => (
            <li key={i} data-reveal className="relative pt-5">
              <span aria-hidden="true" data-stat-bar className="absolute top-0 left-0 h-px w-full origin-left bg-line-strong" />
              <span aria-hidden="true" className="absolute top-0 left-0 h-px w-8 bg-primary" />
              <p className="flex items-baseline gap-1 text-ink">
                {s.prefix && <span className="text-lg font-medium text-muted md:text-xl">{s.prefix}</span>}
                <span
                  data-count={s.value}
                  className="text-[clamp(3rem,7vw,5.5rem)] leading-none font-extrabold tracking-[-0.05em] text-primary tabular-nums"
                >
                  {s.value}
                </span>
                {s.suffix && <span className="text-lg font-semibold md:text-xl">{s.suffix}</span>}
              </p>
              <p className="pretty mt-3 max-w-[16rem] text-sm leading-snug text-muted md:text-[15px]">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
