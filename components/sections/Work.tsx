import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { FEATURED_TECH, WORK_TECH } from "@/lib/site";
import { DashboardMock } from "@/components/islands/DashboardMock";
import { IslandBoundary } from "@/components/islands/IslandBoundary";
import { CheckIcon, LockIcon, ProjectArt } from "@/components/ui/Icons";
import { SectionHead } from "@/components/ui/SectionHead";

const CARD_SPANS = ["xl:col-span-2", "xl:col-span-2", "xl:col-span-2", "xl:col-span-3", "md:col-span-2 xl:col-span-3"];

export function Work({ t, locale }: { t: Dict["work"]; locale: Locale }) {
  return (
    <section id="work" aria-labelledby="work-title" className="relative scroll-mt-20 px-5 py-24 md:px-10 md:py-36 xl:px-16">
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="03" id="work-title" title={t.title} intro={t.intro} locale={locale} />

        <article
          data-reveal
          aria-labelledby="work-featured-title"
          className="relative mt-14 grid gap-10 overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow)] md:mt-20 md:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex flex-col lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 font-mono text-[11px] tracking-wider text-primary-ink uppercase">
                {t.featuredTag}
              </span>
              <span aria-hidden="true" className="font-mono text-[11px] tracking-wider text-muted">
                01
              </span>
            </div>
            <h3 id="work-featured-title" className="display mt-6 text-[clamp(1.9rem,3.6vw,3.25rem)] [word-break:keep-all] text-ink">
              {t.featured.title}
            </h3>
            <p className="mt-2 text-sm font-medium text-primary">{t.featured.org}</p>
            <p className="pretty mt-5 text-base leading-relaxed text-ink-2">{t.featured.desc}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {t.featured.facts.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[15px] text-ink">
                  <CheckIcon className="mt-1 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{t.scaleLabel}</p>
              <p className="mt-1 text-[15px] font-semibold text-ink tabular-nums">{t.featured.scale}</p>
            </div>
            <ul className="mt-auto flex flex-wrap gap-2 pt-8">
              {FEATURED_TECH.map((tech) => (
                <li key={tech} className="rounded-full bg-primary-soft px-3 py-1 font-mono text-[11px] text-primary">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative lg:col-span-7 lg:self-center">
            <IslandBoundary>
              <DashboardMock note={t.illustrationNote} />
            </IslandBoundary>
          </div>
        </article>

        <ul className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          {t.items.map((item, i) => (
            <li key={i} data-reveal className={CARD_SPANS[i]}>
              <article
                data-card
                data-spotlight
                className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-6 transition-[transform,border-color] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-primary/40 md:p-7"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(320px_circle_at_var(--mx)_var(--my),color-mix(in_oklab,var(--primary)_12%,transparent),transparent_70%)]"
                />
                <div className="flex items-start justify-between gap-4">
                  <span aria-hidden="true" className="font-mono text-[11px] tracking-wider text-muted">
                    0{i + 2}
                  </span>
                  {item.private && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                      <LockIcon />
                      {t.privateNote}
                    </span>
                  )}
                </div>
                <div className="relative mt-4 h-24 text-primary transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04] md:h-28">
                  <ProjectArt kind={i} />
                </div>
                <h3 className="mt-5 text-xl leading-snug font-bold tracking-tight text-ink md:text-[1.4rem]">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{item.org}</p>
                <p className="pretty mt-3 text-[15px] leading-relaxed text-ink-2">{item.desc}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                  {WORK_TECH[i].map((tech) => (
                    <li key={tech} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10.5px] text-muted">
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
