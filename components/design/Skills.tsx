"use client";

import { useRef } from "react";
import { MARQUEE, SKILL_GROUPS } from "./content";
import { gsap, ScrollTrigger, useGSAP } from "./motion";
import { SectionHead } from "./SectionHead";
import { useSite } from "./site-context";

function MarqueeRow({ outline, reverse }: { outline?: boolean; reverse?: boolean }) {
  const items = reverse ? [...MARQUEE].reverse() : MARQUEE;
  return (
    <div className="overflow-hidden py-1" aria-hidden="true">
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

export function Skills() {
  const { t, reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee]");
      const state = tracks.map((el) => ({ el, x: 0, dir: Number(el.dataset.dir) }));
      let boost = 0;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        },
      });
      const tick = (_t: number, dt: number) => {
        boost *= 0.94;
        for (const s of state) {
          const half = s.el.scrollWidth / 2;
          s.x -= (0.045 * dt * (1 + Math.abs(boost))) * s.dir * (boost < -0.5 ? -1 : 1);
          if (s.x <= -half) s.x += half;
          if (s.x > 0) s.x -= half;
          s.el.style.transform = `translate3d(${s.x}px,0,0)`;
        }
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} id="skills" aria-labelledby="skills-title" className="relative scroll-mt-20 overflow-x-clip py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1312px]">
          <SectionHead index="05" id="skills-title" title={t.skills.title} intro={t.skills.intro} />
        </div>
      </div>

      <div className="mt-14 -rotate-[1.5deg] md:mt-20">
        <MarqueeRow />
        <MarqueeRow outline reverse />
      </div>

      <div className="mx-auto mt-16 max-w-[1440px] px-5 md:mt-24 md:px-10 xl:px-16">
        <div className="mx-auto max-w-[1312px]">
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {t.skills.groups.map((name, gi) => (
              <div key={gi} data-reveal className="border-t border-line-strong pt-5">
                <h3 className="flex items-baseline gap-2 text-[15px] font-bold text-ink">
                  <span className="font-mono text-[11px] font-normal text-primary">0{gi + 1}</span>
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
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.skills.langTitle}</p>
              <ul className="mt-3 grid gap-1.5">
                {t.skills.langs.map((l) => (
                  <li key={l.name} className="flex flex-wrap gap-x-3 text-ink-2">
                    <span className="font-semibold text-ink">{l.name}</span>
                    <span>{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.skills.eduTitle}</p>
              <p className="mt-3 text-ink-2">
                <span className="font-semibold text-ink">{t.skills.school}</span>
                <span className="mx-2 text-muted">·</span>
                {t.skills.dept}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
