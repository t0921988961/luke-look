"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { setScrollLocked } from "@/lib/motion";
import { SECTIONS } from "@/lib/site";
import { ArrowUpRight, LogoMark } from "@/components/ui/Icons";
import { LanguageLinks, LanguageSwitch, type LanguageLabels } from "./LanguageSwitch";
import { MotionToggle } from "./MotionToggle";
import { ThemeSwitch } from "./ThemeSwitch";

type NavLabels = Dict["nav"];

const PAGE_REGIONS = ["main", "site-footer"];

function MobileMenu({
  open,
  onClose,
  locale,
  labels,
  languageLabels,
}: {
  open: boolean;
  onClose: (restoreFocus: boolean) => void;
  locale: Locale;
  labels: NavLabels;
  languageLabels: LanguageLabels;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const closeForLink = () => onClose(false);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      inert={!open}
      data-open={open}
      className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg px-6 pt-24 pb-8 transition-[clip-path] duration-700 ease-[var(--ease-out)] lg:hidden ${
        open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <nav aria-label={labels.menu}>
        <ul className="flex flex-col">
          {SECTIONS.map((id, i) => (
            <li key={id} className="overflow-hidden border-b border-line">
              <a
                href={`#${id}`}
                onClick={closeForLink}
                className="menu-item flex items-baseline gap-4 py-3.5 text-[1.9rem] leading-tight font-bold tracking-tight text-ink"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="font-mono text-xs font-normal text-primary">0{i + 1}</span>
                {labels[id]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-5 pt-8">
        <div role="group" aria-label={labels.language}>
          <LanguageLinks
            current={locale}
            labels={languageLabels}
            className="flex flex-wrap gap-2"
            itemClassName={(active) =>
              `flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                active ? "border-primary bg-primary text-primary-ink [&_span+span]:text-primary-ink" : "border-line text-ink"
              }`
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThemeSwitch labels={labels} />
            <MotionToggle pause={labels.pause} play={labels.play} />
          </div>
          <a href="#contact" onClick={closeForLink} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {labels.contact} <ArrowUpRight />
          </a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({
  locale,
  labels,
  languageLabels,
}: {
  locale: Locale;
  labels: NavLabels;
  languageLabels: LanguageLabels;
}) {
  const [scrolled, setScrolled] = useState(false);
  // The glass border and shadow are not compositor properties. Hold the
  // transition off until the first scroll position is applied, so a deep link
  // snaps to the finished bar instead of animating it during load.
  const [chromeMotion, setChromeMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    const timer = window.setTimeout(() => {
      import("@/components/islands/deferred").then((deferred) => {
        if (cancelled) return;
        const stopDeferred = deferred.startDeferred();
        document.documentElement.dataset.ready = "on";
        stop = stopDeferred;
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stop();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 24);
      // Jumps (anchor links, restored positions) keep the header; only reading downwards hides it.
      if (y > 480 && delta > 4 && delta < 240) setHidden(true);
      else if (delta < -4 || y <= 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    const frame = requestAnimationFrame(() => setChromeMotion(true));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setScrollLocked(open);
    for (const id of PAGE_REGIONS) {
      const el = document.getElementById(id);
      if (el) el.inert = open;
    }
    setMenuOpen(open);
  }, []);

  const close = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) toggle.current?.focus();
    },
    [setOpen],
  );

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [setOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out)] ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-3 pt-3 md:px-6">
          <div
            className={`flex h-14 items-center justify-between gap-4 rounded-full pr-2 pl-3 md:h-16 md:pr-3 md:pl-4 ${
              chromeMotion ? "transition-[background-color,border-color,box-shadow] duration-500" : ""
            } ${
              scrolled && !menuOpen
                ? "border border-line bg-bg/75 shadow-[var(--shadow)] backdrop-blur-xl"
                : "border border-transparent"
            }`}
          >
            <a href="#top" onClick={() => menuOpen && close(false)} className="group flex items-center gap-2.5">
              <LogoMark animated className="h-8 w-8 transition-transform duration-500 group-hover:-rotate-6" />
              <span className="text-[15px] leading-none font-bold tracking-tight max-xs:sr-only">
                Luke Cheng
                <span
                  className={locale === "zh-TW" ? "ml-1.5 font-normal text-muted" : "han-name ml-1.5 font-normal text-muted"}
                  lang={locale === "zh-TW" ? undefined : "zh-Hant-TW"}
                >
                  鄭宏璋
                </span>
              </span>
            </a>

            <nav aria-label={labels.primary} className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {SECTIONS.slice(0, 5).map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={active === id ? "true" : undefined}
                      className={`nav-link relative rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        active === id ? "text-primary" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {labels[id]}
                      <span
                        aria-hidden="true"
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
              <LanguageSwitch current={locale} labels={languageLabels} buttonLabel={labels.languageButton} />
              <div className="hidden lg:block">
                <MotionToggle pause={labels.pause} play={labels.play} />
              </div>
              <div className="hidden lg:block">
                <ThemeSwitch labels={labels} />
              </div>
              <a
                href="#contact"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-semibold whitespace-nowrap text-bg transition-transform hover:-translate-y-0.5 lg:inline-flex"
              >
                {labels.contact}
                <ArrowUpRight />
              </a>
              <button
                ref={toggle}
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => (menuOpen ? close(false) : setOpen(true))}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-bg lg:hidden"
              >
                <span className="sr-only">{menuOpen ? labels.close : labels.menu}</span>
                <span
                  aria-hidden="true"
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                    menuOpen ? "rotate-45" : "-translate-y-[3.5px]"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
                    menuOpen ? "-rotate-45" : "translate-y-[3.5px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={close} locale={locale} labels={labels} languageLabels={languageLabels} />
    </>
  );
}
