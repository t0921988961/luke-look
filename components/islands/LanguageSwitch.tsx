"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { hrefLang, htmlLang, LOCALES, localeCode, localePath, type Locale } from "@/lib/i18n/config";
import { rememberLocale } from "@/lib/i18n/remember";
import { track } from "@/lib/analytics";
import { GlobeIcon } from "@/components/ui/Icons";

export type LanguageLabels = Record<Locale, { label: string; short: string }>;

/** Remembers the choice and keeps the current section; modified clicks open normally. */
export function followLanguageLink(e: MouseEvent<HTMLAnchorElement>, from: Locale, to: Locale) {
  if (from !== to) track("select_language", { from, to });
  rememberLocale(to);
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const hash = window.location.hash;
  if (!hash) return;
  e.preventDefault();
  window.location.assign(localePath(to) + hash);
}

export function LanguageLinks({
  current,
  labels,
  className,
  itemClassName,
  tabIndex,
}: {
  current: Locale;
  labels: LanguageLabels;
  className?: string;
  itemClassName: (active: boolean) => string;
  tabIndex?: number;
}) {
  return (
    <ul className={className}>
      {LOCALES.map((l) => {
        const active = l === current;
        return (
          <li key={l}>
            <a
              href={localePath(l)}
              hrefLang={hrefLang(l)}
              lang={htmlLang(l)}
              aria-current={active ? "page" : undefined}
              tabIndex={tabIndex}
              onClick={(e) => followLanguageLink(e, current, l)}
              className={itemClassName(active)}
            >
              <span>{labels[l].label}</span>
              <span className="font-mono text-[11px] tracking-wider text-muted uppercase" aria-hidden="true">
                {localeCode(l)}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function LanguageSwitch({
  current,
  labels,
  buttonLabel,
}: {
  current: Locale;
  labels: LanguageLabels;
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onFocus = (e: FocusEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={buttonLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface/60 pr-4 pl-3 text-sm font-medium text-ink transition-colors hover:border-primary/50"
      >
        <GlobeIcon className="text-[17px] text-primary" />
        <span>{labels[current].short}</span>
      </button>
      <div
        id={listId}
        className={`absolute top-full right-0 mt-2 min-w-44 origin-top-right rounded-2xl border border-line bg-surface p-1.5 shadow-[var(--shadow)] transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out)] ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <LanguageLinks
          current={current}
          labels={labels}
          itemClassName={(active) =>
            `flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
              active ? "bg-primary-soft text-primary" : "text-ink hover:bg-bg-2"
            }`
          }
        />
      </div>
    </div>
  );
}
