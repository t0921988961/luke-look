import type { Locale } from "@/lib/i18n/config";
import { HanRun } from "@/components/ui/HanRun";

export type ExperienceItem = {
  company: string;
  role: string;
  summary: string;
  bullets: string[];
  period: string;
  tech: string[];
};

/** Closed by default. `startExperience` in the deferred chunk toggles the panels. */
export function ExperienceList({
  items,
  labels,
  locale,
}: {
  items: ExperienceItem[];
  labels: { more: string; less: string; tech: string };
  locale: Locale;
}) {
  return (
    <ol data-timeline className="relative mt-14 md:mt-20">
      <svg
        aria-hidden="true"
        className="absolute top-0 left-[7px] h-full w-[2px] md:left-[11px]"
        preserveAspectRatio="none"
        viewBox="0 0 2 100"
      >
        <path d="M1 0v100" stroke="var(--line-strong)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path data-timeline-path d="M1 0v100" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      {items.map((item, i) => {
        const panelId = `exp-panel-${i}`;
        const [firstBullet, ...moreBullets] = item.bullets;
        return (
          <li key={i} id={`role-${i}`} data-reveal className="relative scroll-mt-28 pl-8 md:pl-14">
            <span
              data-node
              aria-hidden="true"
              className={`absolute top-8 left-0 grid h-4 w-4 place-items-center rounded-full border-2 md:top-10 md:left-1 ${
                i === 0 ? "border-primary bg-primary" : "border-primary bg-bg-2"
              }`}
            >
              {i === 0 && <span className="absolute inset-[-6px] animate-ping rounded-full bg-primary/25 motion-reduce:hidden" />}
            </span>

            <div className="group border-b border-line">
              <h3>
                <button
                  type="button"
                  className="exp-toggle relative grid w-full grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 py-6 text-left md:grid-cols-[11rem_1fr_auto] md:items-center md:gap-x-8 md:py-8 lg:grid-cols-[13rem_1fr_16rem_auto]"
                  aria-expanded="false"
                  aria-controls={panelId}
                  data-more={labels.more}
                  data-less={labels.less}
                >
                  <span className="col-span-2 font-mono text-xs tracking-wider text-ink-2 tabular-nums md:col-span-1">
                    {item.period}
                  </span>
                  <span className="min-w-0">
                    <span className="exp-name block text-[clamp(1.35rem,2.6vw,2.25rem)] leading-tight font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-primary">
                      <HanRun text={item.company} locale={locale} />
                    </span>
                    <span className="mt-1 block text-sm text-muted lg:hidden">{item.role}</span>
                  </span>
                  <span className="hidden text-[15px] text-ink-2 lg:block">{item.role}</span>
                  <span
                    aria-hidden="true"
                    className="exp-plus relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-all duration-500 group-hover:border-primary group-hover:text-primary"
                  >
                    <span className="absolute h-[1.5px] w-3.5 bg-current" />
                    <span className="absolute h-3.5 w-[1.5px] bg-current" />
                  </span>
                  <span className="exp-label sr-only">{labels.more}</span>
                </button>
              </h3>

              <p className="pretty pb-2 text-sm leading-relaxed text-ink-2 md:pl-[11rem] lg:pl-[13rem]">{item.summary}</p>
              {firstBullet && (
                <ul className="pb-5 md:pl-[11rem] lg:pl-[13rem]">
                  <li className="pretty relative pl-5 text-[15px] leading-relaxed text-ink-2">
                    <span aria-hidden="true" className="absolute top-[0.7em] left-0 h-1.5 w-1.5 rounded-full bg-sky" />
                    {firstBullet}
                  </li>
                </ul>
              )}

              <div id={panelId} className="expand" data-open="false" inert>
                <div>
                  <div className="grid gap-6 pb-8 md:grid-cols-[11rem_1fr] md:gap-8 lg:grid-cols-[13rem_1fr]">
                    <div className="md:col-start-2">
                      <ul className="grid gap-3 lg:grid-cols-2 lg:gap-x-10">
                        {moreBullets.map((b) => (
                          <li key={b} className="pretty relative pl-5 text-[15px] leading-relaxed text-ink-2">
                            <span aria-hidden="true" className="absolute top-[0.7em] left-0 h-1.5 w-1.5 rounded-full bg-sky" />
                            {b}
                          </li>
                        ))}
                      </ul>
                      <ul className="mt-6 flex flex-wrap gap-2" aria-label={labels.tech}>
                        {item.tech.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-line-strong bg-surface px-3 py-1 font-mono text-[11px] text-ink-2"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
