import type { Dict } from "@/lib/i18n/types";
import { PERIODS } from "@/lib/site";
import { NARROW_POINTS, NARROW_ROUTE, WIDE_POINTS, WIDE_ROUTE, morphCurve, type Pt } from "@/lib/story";

const COUNT = WIDE_POINTS.length;
const ORDER = [...PERIODS].reverse();

const ink = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
  pathLength: 1,
  className: "story-ink",
};

function StationIcon({ kind }: { kind: number }) {
  if (kind === 0) {
    return (
      <g>
        <path {...ink} d="M-12 -11 H3 L9 -5 V12 H-12 Z" />
        <path {...ink} d="M3 -11 V-5 H9" />
        <path {...ink} d="M-8 -2 H1 M-8 3 H-1" />
      </g>
    );
  }
  if (kind === 1) {
    return (
      <g>
        <path {...ink} d="M0 -13 V-5 M0 5 V13 M-13 0 H-5 M5 0 H13" />
        <path {...ink} d="M-9 -9 L-4 -4 M9 -9 L4 -4 M-9 9 L-4 4 M9 9 L4 4" />
        <circle cx="0" cy="0" r="2.2" fill="currentColor" />
      </g>
    );
  }
  if (kind === 2) {
    return (
      <g>
        <path {...ink} d="M-12 11 H12" />
        <path {...ink} d="M-8 11 V3 M-3 11 V-3 M3 11 V-8 M8 11 V1" />
      </g>
    );
  }
  if (kind === 3) {
    return (
      <g>
        <path {...ink} d="M0 -13 C6.5 -13 11 -8.5 11 -3 C11 4 0 14 0 14 C0 14 -11 4 -11 -3 C-11 -8.5 -6.5 -13 0 -13 Z" />
        <circle cx="0" cy="-3" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.7" vectorEffect="non-scaling-stroke" className="story-ink" pathLength={1} />
      </g>
    );
  }
  return (
    <g>
      <path {...ink} d="M-13 -9 H13 V11 H-13 Z" />
      <path {...ink} d="M-13 -4 H13" />
      <path {...ink} d="M-8 3 C-5 1 -3 5 -0.5 3 S4 2 7 4" stroke="var(--warm)" />
    </g>
  );
}

function RoutePicture({
  points,
  d,
  box,
  radius,
  scale,
  layout,
}: {
  points: readonly Pt[];
  d: string;
  box: string;
  radius: number;
  scale: number;
  layout: "wide" | "narrow";
}) {
  const end = points[points.length - 1];
  const stops = layout === "narrow" ? NARROW_ROUTE.stops : WIDE_ROUTE.stops;
  return (
    <svg viewBox={box} className={layout === "wide" ? "hidden h-auto w-full md:block" : "h-auto w-full md:hidden"} data-layout={layout} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path data-route="" d={d} fill="none" stroke="var(--primary)" strokeWidth="2.75" vectorEffect="non-scaling-stroke" pathLength={1} className="story-route" />
      <g data-traveler="" data-scale={String(scale)} className="story-traveler" transform={`translate(${end.x} ${end.y}) scale(${scale})`}>
        <path data-blob="" fill="var(--warm)" d={morphCurve(1, stops)} />
        <circle r="3.2" fill="var(--surface)" />
      </g>
      {points.map((pt, i) => (
        <g key={i} className="story-station" transform={`translate(${pt.x} ${pt.y})`} data-on="true" data-current={i === COUNT - 1 ? "true" : undefined}>
          <circle className="story-halo" r={radius + 14} />
          <circle className="story-ring" r={radius} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <g transform={`scale(${radius / 30})`}>
            <StationIcon kind={i} />
          </g>
        </g>
      ))}
    </svg>
  );
}

export function CareerStory({ t, present }: { t: Dict["story"]; present: string }) {
  return (
    <div id="journey" className="story-track mt-14 scroll-mt-28 md:mt-20">
      <div className="story-sticky">
        <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow)] md:p-8 lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-warm/15 blur-3xl dark:bg-warm/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <h3 id="story-title" className="text-[clamp(1.6rem,3vw,2.4rem)] leading-tight font-bold tracking-tight text-ink">
                {t.title}
              </h3>
              <p className="pretty mt-2 max-w-md text-sm leading-relaxed text-muted md:text-[15px]">{t.intro}</p>
              <div className="story-controls mt-5 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-ink transition-transform duration-300 hover:-translate-y-0.5"
                  data-story-play=""
                  data-play={t.play}
                  data-pause={t.pause}
                  data-replay={t.replay}
                  aria-pressed="false"
                >
                  {t.play}
                </button>
                <div className="story-meter relative h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-line-strong" aria-hidden="true">
                  <span className="story-meter-fill absolute inset-0 bg-primary" />
                </div>
              </div>
              <p className="sr-only" aria-live="polite" data-story-live="">
                {t.stages[COUNT - 1]?.line}
              </p>
              <div className="story-scene relative mt-2">
                <RoutePicture points={NARROW_POINTS} d={NARROW_ROUTE.d} box="0 0 360 410" radius={27} scale={1} layout="narrow" />
                <RoutePicture points={WIDE_POINTS} d={WIDE_ROUTE.d} box="0 40 1200 310" radius={40} scale={1.7} layout="wide" />
              </div>
            </div>
            <ol className="grid gap-2 lg:col-span-5" aria-labelledby="story-title">
              {t.stages.map((stage, i) => {
                const period = ORDER[i];
                const when = period?.to ? `${period.from} — ${period.to}` : `${period?.from ?? ""} — ${present}`;
                const current = i === COUNT - 1;
                return (
                  <li key={stage.mark} className="story-stage rounded-2xl border border-line px-3 py-2" data-current={current ? "true" : "false"}>
                    <button
                      type="button"
                      id={`story-tab-${i}`}
                      className="min-h-11 w-full rounded-xl px-1 py-1 text-left"
                      data-story-seek={i}
                      aria-current={current ? "step" : undefined}
                    >
                      <span className="font-mono text-[11px] tracking-wider text-primary tabular-nums">{when}</span>
                      <span className="mt-0.5 block font-bold tracking-tight text-ink">{stage.mark}</span>
                      <span className="block text-sm text-muted">{stage.role}</span>
                    </button>
                    <p className="pretty px-1 text-sm leading-relaxed text-ink-2">{stage.line}</p>
                    <a href={`#role-${COUNT - 1 - i}`} className="mt-1 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-primary">
                      {t.full} · {stage.mark}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
