"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionAllowed } from "@/lib/motion";
import { loadGsap } from "@/components/motion/load";

/** Abstract, text-free dashboard. Being text-free lets it mirror cleanly to show an RTL layout. */
export function DashboardMock({ note }: { note: string }) {
  const root = useRef<HTMLElement>(null);
  const [dark, setDark] = useState(false);
  const [rtl, setRtl] = useState(false);
  const motion = useMotionAllowed();

  useEffect(() => {
    if (!motion || !root.current) return;
    const scope = root.current;
    let revert: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.6,
          paused: true,
          defaults: { ease: "expo.out" },
        });
        tl.fromTo("[data-mock-line]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" }, 0)
          .fromTo("[data-mock-area]", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
          .fromTo("[data-mock-bar]", { scaleY: 0 }, { scaleY: 1, duration: 1, stagger: 0.06 }, 0.2)
          .fromTo("[data-mock-kpi]", { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.1 }, 0.1)
          .fromTo("[data-mock-dot]", { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(3)" }, 0.6)
          .call(() => setDark(true), [], 2.6)
          .call(() => setRtl(true), [], 4.4)
          .to("[data-mock-body]", { rotateY: 180, duration: 1.1, ease: "power3.inOut" }, 4.4)
          .call(() => setRtl(false), [], 7.2)
          .to("[data-mock-body]", { rotateY: 0, duration: 1.1, ease: "power3.inOut" }, 7.2)
          .call(() => setDark(false), [], 9);

        gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: "top 85%",
            end: "bottom 10%",
            onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
          },
        });
      }, scope);
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
      setDark(false);
      setRtl(false);
    };
  }, [motion]);

  return (
    <figure ref={root} className="relative">
      <div
        data-mock-theme={dark ? "dark" : "light"}
        className="group/mock relative aspect-[16/11] overflow-hidden rounded-[22px] border border-line-strong shadow-[var(--shadow)] transition-colors duration-700 [--m-bg:#f3f5fb] [--m-card:#ffffff] [--m-line:#e3e8f4] [--m-ink:#c9d3ea] [--m-side:#ffffff] data-[mock-theme=dark]:[--m-bg:#0b1122] data-[mock-theme=dark]:[--m-card:#131b33] data-[mock-theme=dark]:[--m-line:#1e2846] data-[mock-theme=dark]:[--m-ink:#2b3a63] data-[mock-theme=dark]:[--m-side:#0f1630]"
        style={{ background: "var(--m-bg)" }}
      >
        <div
          className="flex h-[9%] items-center justify-between border-b px-[3%] transition-colors duration-700"
          style={{ background: "var(--m-side)", borderColor: "var(--m-line)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff7a57]" />
            <span className="h-2 w-2 rounded-full bg-[#ffc4a8]" />
            <span className="h-2 w-2 rounded-full bg-[#9db7ff]" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-medium sm:text-[10px]">
            <span
              className="rounded-full px-2 py-0.5 transition-colors duration-500"
              style={{ background: "var(--m-line)", color: dark ? "#c3cde6" : "#27324f" }}
            >
              {rtl ? "RTL · עברית" : "LTR · EN"}
            </span>
            <span className="rounded-full bg-[#2456f0] px-2 py-0.5 text-white">{dark ? "Dark" : "Light"}</span>
          </div>
        </div>

        <div className="h-[91%] [perspective:1400px]">
          <div data-mock-body className="flex h-full [transform-style:preserve-3d]">
            <div
              className="flex w-[18%] flex-col gap-[6%] border-r p-[3%] transition-colors duration-700"
              style={{ background: "var(--m-side)", borderColor: "var(--m-line)" }}
            >
              <span className="h-[5%] w-[70%] rounded-full bg-[#2456f0]" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="h-[3.2%] rounded-full transition-colors duration-700"
                  style={{ width: `${[80, 62, 72, 55, 68, 50][i]}%`, background: i === 1 ? "#7fa6ff" : "var(--m-ink)" }}
                />
              ))}
            </div>
            <div className="grid flex-1 grid-cols-3 grid-rows-[22%_1fr_1fr] gap-[2.5%] p-[3%]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col justify-center gap-[12%] rounded-xl px-[9%] transition-colors duration-700"
                  style={{ background: "var(--m-card)" }}
                >
                  <span className="h-[9%] w-[45%] rounded-full" style={{ background: "var(--m-ink)" }} />
                  <span
                    data-mock-kpi
                    className="h-[20%] origin-left rounded-full"
                    style={{
                      width: `${[70, 52, 60][i]}%`,
                      background: i === 0 ? "#2456f0" : i === 1 ? "#7fa6ff" : "#ff7a57",
                    }}
                  />
                </div>
              ))}
              <div
                className="col-span-2 row-span-1 rounded-xl p-[3%] transition-colors duration-700"
                style={{ background: "var(--m-card)" }}
              >
                <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mock-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#2456f0" stopOpacity=".28" />
                      <stop offset="1" stopColor="#2456f0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[30, 60, 90].map((y) => (
                    <path
                      key={y}
                      d={`M0 ${y}H300`}
                      stroke="var(--m-line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <path
                    data-mock-area
                    d="M0 96C30 90 45 70 75 72s45 18 75 4 40-46 75-48 50 14 75 6V120H0Z"
                    fill="url(#mock-area)"
                  />
                  <path
                    data-mock-line
                    d="M0 96C30 90 45 70 75 72s45 18 75 4 40-46 75-48 50 14 75 6"
                    fill="none"
                    stroke="#2456f0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M0 104C40 100 60 92 90 94s50 6 80-6 50-20 80-18 35 6 50 2"
                    fill="none"
                    stroke="#ff7a57"
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <div
                className="relative row-span-2 overflow-hidden rounded-xl transition-colors duration-700"
                style={{ background: "var(--m-card)" }}
              >
                <svg
                  viewBox="0 0 100 160"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <path
                    d="M-10 40C20 30 40 60 70 50s30-20 50-10M-10 100c30-10 50 20 80 5s30-10 50 0"
                    stroke="var(--m-line)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <path d="M30 -10v180M75 -10v180" stroke="var(--m-line)" strokeWidth="3" />
                  {[
                    [28, 48],
                    [62, 70],
                    [44, 104],
                    [74, 128],
                  ].map(([x, y], i) => (
                    <g key={i} data-mock-dot style={{ transformOrigin: `${x}px ${y}px` }}>
                      <circle cx={x} cy={y} r="9" fill={i === 1 ? "#ff7a57" : "#2456f0"} opacity=".16" />
                      <circle cx={x} cy={y} r="3.6" fill={i === 1 ? "#ff7a57" : "#2456f0"} />
                    </g>
                  ))}
                </svg>
              </div>
              <div
                className="col-span-2 flex items-end gap-[3%] rounded-xl px-[4%] pt-[4%] pb-[5%] transition-colors duration-700"
                style={{ background: "var(--m-card)" }}
              >
                {[46, 70, 58, 84, 62, 92, 74, 66, 88, 54].map((h, i) => (
                  <span
                    key={i}
                    data-mock-bar
                    className="flex-1 origin-bottom rounded-t-[3px]"
                    style={{ height: `${h}%`, background: i === 5 ? "#ff7a57" : i % 2 ? "#7fa6ff" : "#2456f0" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-warm" />
        {note}
      </figcaption>
    </figure>
  );
}
