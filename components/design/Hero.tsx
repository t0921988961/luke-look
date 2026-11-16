"use client";

import { useEffect, useRef, useState } from "react";
import { HorizonCanvas } from "./HorizonCanvas";
import { ArrowUpRight } from "./Icons";
import { gsap, ScrollTrigger, useGSAP } from "./motion";
import { useSite } from "./site-context";
import { SplitWords } from "./Split";

function TaipeiClock({ label }: { label: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Taipei" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
      <span>{label}</span>
      <span className="tabular-nums text-ink" suppressHydrationWarning>
        {time ?? "--:--"}
      </span>
      <span>GMT+8</span>
    </p>
  );
}

export function Hero() {
  const { t, locale, scrollTo, reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => (progress.current = self.progress),
      });
      if (reducedMotion) return () => st.kill();

      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
      tl.from("[data-hero-fade]", { opacity: 0, y: 14, duration: 1, stagger: 0.08 })
        .to("[data-hero-title] .word-inner", { y: 0, duration: 1.3, stagger: locale === "en" || locale === "ko" ? 0.06 : 0.035 }, 0.2)
        .fromTo("[data-hero-underline]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power3.inOut" }, 0.95)
        .from("[data-hero-late]", { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.75)
        .from("[data-hero-canvas]", { opacity: 0, duration: 2, ease: "power2.out" }, 0);

      gsap.to("[data-hero-content]", {
        yPercent: -12,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.3, delay: 1.6 })
        .fromTo("[data-scroll-line]", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.7, ease: "power2.in" })
        .to("[data-scroll-line]", { drawSVG: "100% 100%", duration: 0.7, ease: "power2.out" });
      return () => st.kill();
    },
    { scope: root, dependencies: [locale, reducedMotion], revertOnUpdate: true },
  );

  const titleSize =
    locale === "en"
      ? "text-[clamp(2.5rem,6.6vw,6.4rem)]"
      : locale === "ko"
        ? "text-[clamp(2.4rem,6.8vw,6.6rem)]"
        : locale === "ja"
          ? "text-[clamp(2.3rem,6.2vw,6.2rem)]"
        : "text-[clamp(2.6rem,7.4vw,7.4rem)]";

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_45%_at_68%_62%,rgb(255_190_150/0.32),transparent_70%),radial-gradient(70%_60%_at_20%_80%,rgb(70_120_255/0.16),transparent_70%)] dark:[background:radial-gradient(60%_45%_at_68%_62%,rgb(255_140_100/0.12),transparent_70%),radial-gradient(70%_60%_at_20%_80%,rgb(80_120_255/0.22),transparent_70%)]"
      />
      <div data-hero-canvas className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_38%,#000_78%)]">
        <HorizonCanvas progressRef={progress} reducedMotion={reducedMotion} className="h-full w-full" />
      </div>

      <div
        data-hero-content
        className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pt-28 pb-8 md:px-10 md:pt-36 xl:px-16"
      >
        <div
          data-hero-fade
          aria-hidden="true"
          className="absolute top-52 right-10 hidden flex-col items-center gap-5 lg:flex xl:right-16"
        >
          <span lang="zh-TW" className="text-[2.6rem] leading-none font-black tracking-[0.28em] text-ink [writing-mode:vertical-rl]">
            鄭宏璋
          </span>
          <span className="h-16 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <p data-hero-fade className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-warm/60 motion-reduce:hidden" />
              <span className="relative h-2 w-2 rounded-full bg-warm" />
            </span>
            {t.hero.eyebrow}
          </p>
          <div data-hero-fade className="hidden sm:block">
            <TaipeiClock label={t.hero.localTime} />
          </div>
        </div>

        <p data-hero-fade className="mt-8 text-lg font-medium text-ink-2 md:mt-12 md:text-xl">
          {t.hero.greeting}
        </p>

        <h1 id="hero-title" data-hero-title className={`display mt-3 text-ink ${titleSize} ${locale === "en" ? "max-w-[18ch]" : locale === "ja" ? "max-w-[20ch]" : "max-w-[16ch]"}`}>
          {t.hero.title.map((line, li) => (
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
                        data-hero-underline
                        d="M3 13C40 6 92 3 132 6s52 6 65 2"
                        fill="none"
                        stroke="var(--warm)"
                        strokeWidth="5"
                        strokeLinecap="round"
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
            <p data-hero-late className="pretty max-w-[34rem] text-base leading-relaxed text-ink-2 md:text-lg">
              {t.hero.intro}
            </p>
            <div data-hero-late className="mt-7 flex flex-wrap gap-3">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-ink shadow-[0_10px_30px_-10px_var(--primary)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t.hero.ctaPrimary}
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#experience"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#experience");
                }}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface/50 px-6 text-[15px] font-semibold text-ink backdrop-blur transition-colors hover:border-primary hover:text-primary"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>
          <dl data-hero-late className="grid content-start gap-4 text-sm md:col-span-4 md:col-start-9">
            <div className="border-t border-line-strong pt-3">
              <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.hero.nowLabel}</dt>
              <dd className="mt-1 font-medium text-ink">{t.hero.now}</dd>
            </div>
            <div className="border-t border-line-strong pt-3">
              <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{t.hero.stackLabel}</dt>
              <dd className="mt-1 font-medium text-ink">{t.hero.stack}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex items-end justify-between pt-12">
          <button
            type="button"
            data-hero-late
            onClick={() => scrollTo("#about")}
            className="group flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-muted uppercase"
          >
            <span className="relative grid h-12 w-7 place-items-start justify-center overflow-hidden rounded-full border border-line-strong">
              <svg viewBox="0 0 2 24" className="mt-2 h-6 w-[2px]" aria-hidden="true">
                <path data-scroll-line d="M1 0v24" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="transition-colors group-hover:text-ink">{t.hero.scroll}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
