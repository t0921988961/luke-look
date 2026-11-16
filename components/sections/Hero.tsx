import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { LazyHorizon } from "@/components/islands/LazyHorizon";
import { TaipeiClock } from "@/components/islands/TaipeiClock";
import { ArrowUpRight } from "@/components/ui/Icons";
import { SplitWords } from "@/components/ui/SplitWords";

const TITLE_SIZE: Record<Locale, string> = {
  "zh-TW": "text-[clamp(2.6rem,7.4vw,7.4rem)] max-w-[16ch]",
  en: "text-[clamp(2.5rem,6.6vw,6.4rem)] max-w-[18ch]",
  ja: "text-[clamp(2.3rem,6.2vw,6.2rem)] max-w-[20ch]",
  ko: "text-[clamp(2.4rem,6.8vw,6.6rem)] max-w-[16ch]",
};

export function Hero({ t, locale }: { t: Dict["hero"]; locale: Locale }) {
  return (
    <section data-hero id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_68%_62%,rgb(255_190_150/0.32),transparent_70%),radial-gradient(70%_60%_at_20%_80%,rgb(70_120_255/0.16),transparent_70%)] dark:[background:radial-gradient(60%_45%_at_68%_62%,rgb(255_140_100/0.12),transparent_70%),radial-gradient(70%_60%_at_20%_80%,rgb(80_120_255/0.22),transparent_70%)]"
      />
      <div className="hero-canvas absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_38%,#000_78%)]">
        <LazyHorizon className="h-full w-full" />
      </div>

      <div data-hero-content className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pt-28 pb-8 md:px-10 md:pt-36 xl:px-16">
        <div aria-hidden="true" className="hero-fade absolute top-52 right-10 hidden flex-col items-center gap-5 lg:flex xl:right-16">
          <span lang="zh-Hant-TW" className="text-[2.6rem] leading-none font-black tracking-[0.28em] text-ink [writing-mode:vertical-rl]">
            鄭宏璋
          </span>
          <span className="h-16 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="hero-fade flex items-center gap-2.5 font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-warm/60 motion-reduce:hidden" />
              <span className="relative h-2 w-2 rounded-full bg-warm" />
            </span>
            {t.eyebrow}
          </p>
          <div className="hero-fade hidden sm:block">
            <TaipeiClock label={t.localTime} />
          </div>
        </div>

        <p className="hero-fade mt-8 text-lg font-medium text-ink-2 md:mt-12 md:text-xl">{t.greeting}</p>

        <h1 id="hero-title" data-hero-title className={`display mt-3 text-ink ${TITLE_SIZE[locale]}`}>
          {t.title.map((line, li) => (
            <span key={li} className="block">
              {line.map((seg, si) =>
                typeof seg === "string" ? (
                  <SplitWords key={si} text={seg} locale={locale} />
                ) : (
                  <span key={si} className="relative inline-block text-primary">
                    <SplitWords text={seg.hl} locale={locale} />
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 200 20"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute -bottom-[0.08em] left-[-2%] h-[0.22em] w-[104%] overflow-visible"
                    >
                      <path
                        className="hero-underline"
                        d="M3 13C40 6 92 3 132 6s52 6 65 2"
                        fill="none"
                        stroke="var(--warm)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        pathLength={1}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                ),
              )}
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7 lg:col-span-6">
            <p className="hero-late pretty max-w-[34rem] text-base leading-relaxed text-ink-2 md:text-lg">{t.intro}</p>
            <div className="hero-late mt-7 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="shine group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-ink shadow-[0_10px_30px_-10px_var(--primary)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t.ctaPrimary}
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#experience"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface/50 px-6 text-[15px] font-semibold text-ink backdrop-blur transition-colors hover:border-primary hover:text-primary"
              >
                {t.ctaSecondary}
              </a>
            </div>
          </div>
          <dl className="hero-late grid content-start gap-4 text-sm md:col-span-4 md:col-start-9">
            <div className="border-t border-line-strong pt-3">
              <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.nowLabel}</dt>
              <dd className="mt-1 font-medium text-ink">{t.now}</dd>
            </div>
            <div className="border-t border-line-strong pt-3">
              <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.stackLabel}</dt>
              <dd className="mt-1 font-medium text-ink">{t.stack}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex items-end justify-between pt-12">
          <a href="#about" className="hero-late group flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
            <span aria-hidden="true" className="relative grid h-12 w-7 place-items-start justify-center overflow-hidden rounded-full border border-line-strong">
              <svg viewBox="0 0 2 24" className="mt-2 h-6 w-[2px]">
                <path data-scroll-line d="M1 0v24" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="transition-colors group-hover:text-ink">{t.scroll}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
