"use client";

import Lenis from "lenis";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { About } from "./About";
import { Approach } from "./Approach";
import { Contact } from "./Contact";
import { DEFAULT_LOCALE, DICTS, LOCALES, type Locale } from "./content";
import { Experience } from "./Experience";
import { Hero } from "./Hero";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "./motion";
import { Nav } from "./Nav";
import { SiteContext, type SiteContextValue, type ThemePref } from "./site-context";
import { Skills } from "./Skills";
import { Work } from "./Work";

const PREFS_EVENT = "luke-prefs";

function subscribePrefs(cb: () => void) {
  window.addEventListener(PREFS_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PREFS_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readLocale(): Locale {
  const v = localStorage.getItem("lang") as Locale | null;
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE;
}

function readThemePref(): ThemePref {
  const v = localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : "system";
}

function writePref(key: "lang" | "theme", value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const r = ring.current!;
    const d = dot.current!;
    r.style.display = d.style.display = "block";
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const move = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const hot = (e.target as Element | null)?.closest?.("a, button, [role=radio]");
      r.dataset.hot = hot ? "true" : "false";
    };
    const leave = () => gsap.to([r, d], { opacity: 0, duration: 0.3 });
    const enter = () => gsap.to([r, d], { opacity: 1, duration: 0.3 });
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 transition-[width,height,background-color,border-color] duration-300 data-[hot=true]:h-14 data-[hot=true]:w-14 data-[hot=true]:border-primary data-[hot=true]:bg-primary/10"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] -mt-[3px] -ml-[3px] hidden h-1.5 w-1.5 rounded-full bg-warm"
      />
    </>
  );
}

function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => bar.current && (bar.current.style.transform = `scaleX(${self.progress})`),
    });
    return () => st.kill();
  }, []);
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[55] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-primary via-sky to-warm" />
    </div>
  );
}

export function Prototype() {
  const locale = useSyncExternalStore(subscribePrefs, readLocale, () => DEFAULT_LOCALE);
  const themePref = useSyncExternalStore(subscribePrefs, readThemePref, () => "system" as ThemePref);
  const [reducedMotion] = useState(() => prefersReducedMotion());
  const [wipeLabel, setWipeLabel] = useState("");
  const lenisRef = useRef<Lenis | null>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Re-applies what the boot script set, since a dev-mode remount resets <html> attributes.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("js-motion", !reducedMotion);
    root.setAttribute("data-theme", resolveTheme(themePref));
    root.setAttribute("data-theme-pref", themePref);
  }, [reducedMotion, themePref]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.title =
      locale === "en" || locale === "ko"
        ? "Luke Cheng (鄭宏璋) — Front-end Engineer"
        : "鄭宏璋 Luke Cheng — " + DICTS[locale].hero.eyebrow.split(" · ")[0];
  }, [locale]);

  useEffect(() => {
    if (themePref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => document.documentElement.setAttribute("data-theme", resolveTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themePref]);

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useGSAP(
    () => {
      if (reducedMotion) return;
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }),
      });
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        gsap.to(el.querySelectorAll(".word-inner"), {
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.03,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } },
        );
      });
      gsap.fromTo("[data-logo-stroke]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power3.inOut", delay: 0.2 });
      gsap.from("[data-logo-dot]", { scale: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "back.out(4)", delay: 1.1 });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: mainRef, dependencies: [locale, reducedMotion], revertOnUpdate: true },
  );

  const scrollTo = useCallback((target: string | number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: typeof target === "string" ? -16 : 0, duration: 1.4 });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else document.querySelector(target)?.scrollIntoView();
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      if (reducedMotion || !wipe.current) {
        writePref("lang", next);
        return;
      }
      setWipeLabel(DICTS[next].langLabel);
      const el = wipe.current;
      gsap
        .timeline()
        .set(el, { display: "grid" })
        .fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "expo.inOut" })
        .fromTo(el.querySelector("[data-wipe-label]"), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.2)
        .call(() => {
          flushSync(() => writePref("lang", next));
          ScrollTrigger.refresh();
        })
        .to(el.querySelector("[data-wipe-label]"), { yPercent: -60, opacity: 0, duration: 0.4, ease: "expo.in" }, "+=0.15")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut" }, "-=0.15")
        .set(el, { display: "none" });
    },
    [locale, reducedMotion],
  );

  const setThemePref = useCallback(
    (pref: ThemePref, origin?: { x: number; y: number }) => {
      const root = document.documentElement;
      const next = resolveTheme(pref);
      root.setAttribute("data-theme-pref", pref);
      if (next === root.getAttribute("data-theme")) {
        writePref("theme", pref);
        return;
      }
      const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
      if (!doc.startViewTransition || reducedMotion) {
        root.setAttribute("data-theme", next);
        writePref("theme", pref);
        return;
      }
      const x = origin?.x ?? window.innerWidth - 80;
      const y = origin?.y ?? 40;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.classList.add("theme-vt");
      const vt = doc.startViewTransition(() => {
        root.setAttribute("data-theme", next);
        flushSync(() => writePref("theme", pref));
      });
      vt.ready.then(() => {
        const anim = root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
        anim.finished.finally(() => root.classList.remove("theme-vt"));
      });
    },
    [reducedMotion],
  );

  const value = useMemo<SiteContextValue>(
    () => ({ locale, t: DICTS[locale], setLocale, themePref, setThemePref, scrollTo, reducedMotion }),
    [locale, setLocale, themePref, setThemePref, scrollTo, reducedMotion],
  );

  return (
    <SiteContext.Provider value={value}>
      <ScrollProgress />
      <Nav />
      <main id="main" ref={mainRef} key={locale}>
        <Hero />
        <About />
        <Experience />
        <Work />
        <Approach />
        <Skills />
        <Contact />
      </main>
      <div
        ref={wipe}
        aria-hidden="true"
        className="fixed inset-0 z-[65] place-items-center bg-primary text-primary-ink"
        style={{ display: "none" }}
      >
        <p data-wipe-label className="text-[clamp(2.5rem,8vw,7rem)] font-extrabold tracking-[-0.04em]">
          {wipeLabel}
        </p>
      </div>
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </SiteContext.Provider>
  );
}
