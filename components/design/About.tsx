"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./motion";
import { SectionHead } from "./SectionHead";
import { useSite } from "./site-context";

export function About() {
  const { t, reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        });
      });
      gsap.fromTo(
        "[data-stat-bar]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-stats]", start: "top 85%", once: true },
        },
      );
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative scroll-mt-20 px-5 py-24 md:px-10 md:py-36 xl:px-16">
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="01" id="about-title" title={t.about.title} />

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:gap-6">
          <p
            data-reveal
            className="pretty text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.35] font-semibold tracking-tight text-ink md:col-span-7"
          >
            {t.about.lead}
          </p>
          <p data-reveal className="pretty text-base leading-[1.85] text-ink-2 md:col-span-4 md:col-start-9 md:text-[17px]">
            {t.about.body}
          </p>
        </div>

        <ul data-stats className="mt-16 grid grid-cols-2 gap-x-5 gap-y-10 md:mt-24 lg:grid-cols-4 lg:gap-6">
          {t.about.stats.map((s, i) => (
            <li key={i} data-reveal className="relative pt-5">
              <span data-stat-bar className="absolute top-0 left-0 h-px w-full origin-left bg-line-strong" />
              <span className="absolute top-0 left-0 h-px w-8 bg-primary" />
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
