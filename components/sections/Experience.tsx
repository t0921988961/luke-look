import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { EXPERIENCE_TECH, PERIODS } from "@/lib/site";
import { ExperienceList } from "@/components/islands/ExperienceList";
import { SectionHead } from "@/components/ui/SectionHead";

export function Experience({ t, locale }: { t: Dict["experience"]; locale: Locale }) {
  const items = t.items.map((item, i) => ({
    ...item,
    period: `${PERIODS[i].from} — ${PERIODS[i].to ?? t.present}`,
    tech: EXPERIENCE_TECH[i],
  }));

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative scroll-mt-20 bg-bg-2 px-5 py-24 md:px-10 md:py-36 xl:px-16"
    >
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="02" id="experience-title" title={t.title} intro={t.intro} locale={locale} />
        <ExperienceList items={items} labels={{ more: t.more, less: t.less, tech: t.tech }} />
      </div>
    </section>
  );
}
