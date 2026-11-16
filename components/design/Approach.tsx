"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./motion";
import { SectionHead } from "./SectionHead";
import { useSite } from "./site-context";

const N = 96;
const C = 200;
const R = 132;

function shapePath(radius: (theta: number) => number, superN?: number) {
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    let x: number;
    let y: number;
    if (superN) {
      const c = Math.cos(a);
      const s = Math.sin(a);
      x = Math.sign(c) * Math.pow(Math.abs(c), 2 / superN) * R * 0.92;
      y = Math.sign(s) * Math.pow(Math.abs(s), 2 / superN) * R * 0.92;
    } else {
      const r = radius(a);
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    }
    pts.push(`${(C + x).toFixed(2)},${(C + y).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const SHAPES = [
  shapePath(() => R, 4.2),
  shapePath((a) => R * (0.84 + 0.16 * Math.cos(4 * (a + Math.PI / 4)))),
  shapePath(() => R),
  shapePath((a) => R * (0.93 + 0.06 * Math.cos(10 * a))),
];

function StepIcon({ index, active }: { index: number; active: boolean }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "data-icon-path": "",
  };
  return (
    <g data-icon={index} className={active ? "" : "opacity-0"} transform="translate(140 140)">
      {index === 0 && (
        <>
          <path {...common} d="M22 8h50l22 22v82H22Z" />
          <path {...common} d="M72 8v22h22" />
          <path {...common} d="M38 52h40M38 68h40M38 84h24" />
        </>
      )}
      {index === 1 && (
        <>
          <rect {...common} x="12" y="12" width="42" height="42" rx="10" />
          <rect {...common} x="66" y="12" width="42" height="42" rx="10" />
          <rect {...common} x="12" y="66" width="42" height="42" rx="10" />
          <rect {...common} x="66" y="66" width="42" height="42" rx="10" />
          <path {...common} d="M87 66v42a21 21 0 0 0 0-42Z" fill="currentColor" />
        </>
      )}
      {index === 2 && (
        <>
          <circle {...common} cx="60" cy="60" r="46" />
          <path {...common} d="M14 60h92M60 14c15 13 21 28 21 46s-6 33-21 46c-15-13-21-28-21-46s6-33 21-46Z" />
          <path {...common} d="M92 108h24m-6-6 6 6-6 6M28 108H4m6-6-6 6 6 6" />
        </>
      )}
      {index === 3 && (
        <>
          <path {...common} d="M60 8 100 22v34c0 26-17 46-40 56-23-10-40-30-40-56V22Z" />
          <path {...common} d="m40 60 14 14 28-28" />
        </>
      )}
    </g>
  );
}

export function Approach() {
  const { t, reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const scope = root.current!;
      let current = 0;
      const go = (i: number) => {
        if (i === current) return;
        const prev = current;
        current = i;
        setActive(i);
        const prevGroup = scope.querySelector(`[data-icon="${prev}"]`);
        const nextGroup = scope.querySelector(`[data-icon="${i}"]`);
        if (reducedMotion) {
          gsap.set(scope.querySelectorAll("[data-morph], [data-morph-glow]"), { morphSVG: SHAPES[i] });
          gsap.set(prevGroup, { opacity: 0 });
          gsap.to(nextGroup, { opacity: 1, duration: 0.2, delay: 0.3, overwrite: true });
          return;
        }
        gsap.to("[data-morph]", { morphSVG: SHAPES[i], duration: 1.2, ease: "expo.inOut", overwrite: true });
        gsap.to("[data-morph-glow]", { morphSVG: SHAPES[i], duration: 1.4, ease: "expo.inOut", overwrite: true });
        gsap.to(prevGroup!.querySelectorAll("[data-icon-path]"), { drawSVG: "0%", duration: 0.45, ease: "power2.in", overwrite: true });
        gsap.to(prevGroup, { opacity: 0, duration: 0.3, delay: 0.25, overwrite: true });
        gsap.to(nextGroup, { opacity: 1, duration: 0.2, delay: 0.3, overwrite: true });
        gsap.fromTo(
          nextGroup!.querySelectorAll("[data-icon-path]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.1, delay: 0.35, stagger: 0.08, ease: "power2.inOut", overwrite: true },
        );
      };

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && go(i),
        }),
      );
      if (!reducedMotion) {
        gsap.to("[data-orbit]", { rotate: 360, duration: 40, ease: "none", repeat: -1, svgOrigin: "200 200" });
        gsap.to("[data-orbit-dot]", { rotate: -360, duration: 14, ease: "none", repeat: -1, svgOrigin: "200 200" });
      }
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={root}
      id="approach"
      aria-labelledby="approach-title"
      className="relative scroll-mt-20 bg-bg-2 px-5 py-24 md:px-10 md:py-36 xl:px-16"
    >
      <div className="mx-auto max-w-[1312px]">
        <SectionHead index="04" id="approach-title" title={t.approach.title} intro={t.approach.intro} />

        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-10 lg:gap-20">
          <div className="sticky top-16 z-10 -mx-5 bg-bg-2/85 px-5 py-3 backdrop-blur-md md:top-24 md:mx-0 md:h-[min(70vh,600px)] md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="relative mx-auto aspect-square h-[150px] md:h-auto md:max-h-full md:w-full">
              <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id="morph-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--sky)" />
                    <stop offset="0.55" stopColor="var(--primary)" />
                    <stop offset="1" stopColor="var(--deep)" />
                  </linearGradient>
                  <filter id="morph-blur" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="22" />
                  </filter>
                </defs>
                <g data-orbit className="hidden md:inline">
                  <circle cx="200" cy="200" r="186" fill="none" stroke="var(--line-strong)" strokeDasharray="2 7" />
                </g>
                <g data-orbit-dot className="hidden md:inline">
                  <circle cx="200" cy="14" r="5" fill="var(--warm)" />
                </g>
                <path data-morph-glow d={SHAPES[0]} fill="var(--primary)" opacity=".35" filter="url(#morph-blur)" transform="translate(0 18)" />
                <path data-morph d={SHAPES[0]} fill="url(#morph-fill)" />
                <g className="text-white">
                  {[0, 1, 2, 3].map((i) => (
                    <StepIcon key={i} index={i} active={i === 0} />
                  ))}
                </g>
              </svg>
            </div>
            <p className="mt-2 hidden text-center font-mono text-xs tracking-[0.2em] text-muted md:block">
              <span className="text-primary tabular-nums">0{active + 1}</span> / 04
            </p>
          </div>

          <ol className="md:pt-[10vh] md:pb-[20vh]">
            {t.approach.steps.map((s, i) => (
              <li
                key={i}
                data-step
                className={`flex min-h-[34vh] flex-col justify-center border-t border-line py-10 transition-opacity duration-500 md:min-h-[58vh] ${
                  active === i ? "opacity-100" : "opacity-35"
                }`}
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
