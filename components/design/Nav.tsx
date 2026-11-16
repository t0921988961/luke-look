"use client";

import { useEffect, useRef, useState } from "react";
import { DICTS, LINKS, LOCALES } from "./content";
import { DarkIcon, GlobeIcon, LightIcon, LogoMark, SystemIcon, ArrowUpRight } from "./Icons";
import { gsap, useGSAP } from "./motion";
import { useSite, type ThemePref } from "./site-context";

export const SECTIONS = ["about", "experience", "work", "approach", "skills", "contact"] as const;

function ThemeSwitch() {
  const { t, themePref, setThemePref } = useSite();
  const options: { id: ThemePref; label: string; Icon: typeof LightIcon }[] = [
    { id: "light", label: t.nav.light, Icon: LightIcon },
    { id: "system", label: t.nav.system, Icon: SystemIcon },
    { id: "dark", label: t.nav.dark, Icon: DarkIcon },
  ];
  const index = options.findIndex((o) => o.id === themePref);
  return (
    <div
      role="radiogroup"
      aria-label={t.nav.theme}
      className="relative flex items-center rounded-full border border-line bg-surface/60 p-1"
    >
      <span
        aria-hidden="true"
        className="absolute top-1 left-1 h-8 w-8 rounded-full bg-primary transition-transform duration-500 ease-[var(--ease-out)]"
        style={{ transform: `translateX(${index * 2}rem)` }}
      />
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={themePref === id}
          title={label}
          onClick={(e) => setThemePref(id, { x: e.clientX, y: e.clientY })}
          className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-[15px] transition-colors ${
            themePref === id ? "text-primary-ink" : "text-muted hover:text-ink"
          }`}
        >
          <Icon />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}

function LangMenu() {
  const { t, locale, setLocale } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface/60 pr-4 pl-3 text-sm font-medium text-ink transition-colors hover:border-primary/50"
      >
        <GlobeIcon className="text-[17px] text-primary" />
        <span>{t.langShort}</span>
      </button>
      <ul
        role="listbox"
        aria-label={t.nav.language}
        className={`absolute top-full right-0 mt-2 min-w-44 origin-top-right rounded-2xl border border-line bg-surface p-1.5 shadow-[var(--shadow)] transition-all duration-300 ease-[var(--ease-out)] ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {LOCALES.map((l) => (
          <li key={l} role="option" aria-selected={l === locale}>
            <button
              type="button"
              lang={l}
              onClick={() => {
                setOpen(false);
                setLocale(l);
              }}
              className={`flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                l === locale ? "bg-primary-soft text-primary" : "text-ink hover:bg-bg-2"
              }`}
            >
              <span>{DICTS[l].langLabel}</span>
              <span className="font-mono text-[11px] tracking-wider text-muted uppercase">{l === "zh-TW" ? "zh" : l}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, setLocale, scrollTo, reducedMotion } = useSite();
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!open || reducedMotion) return;
      gsap.from("[data-menu-item]", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: 0.1 });
    },
    { dependencies: [open], scope: panel },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-40 flex flex-col bg-bg px-6 pt-24 pb-8 transition-[clip-path] duration-700 ease-[var(--ease-out)] lg:hidden ${
        open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <nav aria-label={t.nav.menu} className="flex flex-col">
        {SECTIONS.map((id, i) => (
          <div key={id} className="overflow-hidden border-b border-line">
            <a
              data-menu-item
              href={`#${id}`}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                scrollTo(`#${id}`);
              }}
              className="flex items-baseline gap-4 py-3.5 text-[1.9rem] leading-tight font-bold tracking-tight text-ink"
            >
              <span className="font-mono text-xs font-normal text-primary">0{i + 1}</span>
              {t.nav[id]}
            </a>
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-5 pt-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.nav.language}>
          {LOCALES.map((l) => (
            <button
              key={l}
              lang={l}
              type="button"
              tabIndex={open ? 0 : -1}
              aria-pressed={l === locale}
              onClick={() => setLocale(l)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                l === locale ? "border-primary bg-primary text-primary-ink" : "border-line text-ink"
              }`}
            >
              {DICTS[l].langLabel}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <ThemeSwitch />
          <a
            href={`mailto:${LINKS.email}`}
            tabIndex={open ? 0 : -1}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            Email <ArrowUpRight />
          </a>
        </div>
      </div>
    </div>
  );
}

export function Nav() {
  const { t, scrollTo } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [t]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-full bg-primary px-4 py-2 text-sm text-primary-ink focus:translate-y-0"
      >
        {t.nav.skip}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out)] ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-3 pt-3 md:px-6">
          <div
            className={`flex h-14 items-center justify-between gap-4 rounded-full pr-2 pl-3 transition-[background-color,border-color,box-shadow] duration-500 md:h-16 md:pr-3 md:pl-4 ${
              scrolled && !menuOpen
                ? "border border-line bg-bg/75 shadow-[var(--shadow)] backdrop-blur-xl"
                : "border border-transparent"
            }`}
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                scrollTo(0);
              }}
              className="group flex items-center gap-2.5"
              aria-label="Luke Cheng"
            >
              <LogoMark animated className="h-8 w-8 transition-transform duration-500 group-hover:-rotate-6" />
              <span className="hidden text-[15px] leading-none font-bold tracking-tight xs:block">
                Luke Cheng
                <span className="ml-1.5 font-normal text-muted">鄭宏璋</span>
              </span>
            </a>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {SECTIONS.slice(0, 5).map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(`#${id}`);
                      }}
                      aria-current={active === id ? "true" : undefined}
                      className={`relative rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        active === id ? "text-primary" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {t.nav[id]}
                      <span
                        className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-warm transition-opacity ${
                          active === id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <LangMenu />
              <div className="hidden lg:block">
                <ThemeSwitch />
              </div>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
                className="hidden h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-semibold whitespace-nowrap text-bg transition-transform hover:-translate-y-0.5 lg:inline-flex"
              >
                {t.nav.contact}
                <ArrowUpRight />
              </a>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-bg lg:hidden"
              >
                <span className="sr-only">{menuOpen ? t.nav.close : t.nav.menu}</span>
                <span
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                    menuOpen ? "rotate-45" : "-translate-y-[3.5px]"
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                    menuOpen ? "-rotate-45" : "translate-y-[3.5px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
