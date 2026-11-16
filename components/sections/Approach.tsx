import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { ApproachStage } from "@/components/islands/ApproachStage";
import { IslandBoundary } from "@/components/islands/IslandBoundary";
import { SectionHead } from "@/components/ui/SectionHead";

export function Approach({ t, locale }: { t: Dict["approach"]; locale: Locale }) {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="relative scroll-mt-20 bg-bg-2 px-5 py-24 md:px-10 md:py-36 xl:px-16"
    >
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="04" id="approach-title" title={t.title} intro={t.intro} locale={locale} />

        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-10 lg:gap-20">
          <IslandBoundary>
            <ApproachStage count={t.steps.length} />
          </IslandBoundary>

          <ol className="md:pt-[10vh] md:pb-[20vh]">
            {t.steps.map((s, i) => (
              <li
                key={i}
                data-step
                data-active={i === 0}
                className="approach-step flex min-h-[34vh] flex-col justify-center border-t border-line py-10 md:min-h-[58vh]"
              >
                <span className="font-mono text-xs tracking-[0.16em] text-primary">0{i + 1}</span>
                <h3 className="display mt-4 text-[clamp(1.7rem,3.2vw,2.75rem)] text-ink">{s.title}</h3>
                <p className="pretty mt-4 max-w-md text-base leading-relaxed text-ink-2 md:text-[17px]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
