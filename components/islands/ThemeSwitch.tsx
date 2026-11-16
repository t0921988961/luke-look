"use client";

import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "@/lib/motion";
import {
  applyTheme,
  readThemePref,
  resolveTheme,
  subscribeThemePref,
  systemPrefersDark,
  writeThemePref,
  type ThemePref,
} from "@/lib/theme";
import { track } from "@/lib/analytics";
import { DarkIcon, LightIcon, SystemIcon } from "@/components/ui/Icons";

export type ThemeLabels = { theme: string; light: string; dark: string; system: string };

const ORDER: ThemePref[] = ["light", "system", "dark"];
const ICONS = { light: LightIcon, system: SystemIcon, dark: DarkIcon };

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

function changeTheme(pref: ThemePref, origin: { x: number; y: number } | null) {
  const root = document.documentElement;
  const next = resolveTheme(pref, systemPrefersDark());
  const doc = document as ViewTransitionDoc;
  if (next === root.getAttribute("data-theme") || !doc.startViewTransition || prefersReducedMotion()) {
    applyTheme(pref);
    writeThemePref(pref);
    return;
  }
  const x = origin?.x ?? window.innerWidth - 80;
  const y = origin?.y ?? 40;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.classList.add("theme-vt");
  const vt = doc.startViewTransition(() => {
    applyTheme(pref);
    flushSync(() => writeThemePref(pref));
  });
  vt.ready.then(() => {
    const anim = root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
    anim.finished.finally(() => root.classList.remove("theme-vt"));
  });
}

export function ThemeSwitch({ labels }: { labels: ThemeLabels }) {
  const pref = useSyncExternalStore(subscribeThemePref, readThemePref, () => "system" as ThemePref);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = ORDER.indexOf(pref);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const select = (next: ThemePref, e: MouseEvent | KeyboardEvent | null) => {
    if (next === pref) return;
    track("select_theme", { preference: next, resolved: resolveTheme(next, systemPrefersDark()) });
    const origin =
      e && "clientX" in e && e.clientX
        ? { x: e.clientX, y: e.clientY }
        : (() => {
            const r = buttons.current[ORDER.indexOf(next)]?.getBoundingClientRect();
            return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
          })();
    changeTheme(next, origin);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const nextIndex = (index + step + ORDER.length) % ORDER.length;
    buttons.current[nextIndex]?.focus();
    select(ORDER[nextIndex], e);
  };

  return (
    <div
      role="radiogroup"
      aria-label={labels.theme}
      onKeyDown={onKeyDown}
      className="relative flex items-center rounded-full border border-line bg-surface/60 p-1"
    >
      <span
        aria-hidden="true"
        className="absolute top-1 left-1 h-8 w-8 rounded-full bg-primary transition-transform duration-500 ease-[var(--ease-out)]"
        style={{ transform: `translateX(${index * 2}rem)` }}
      />
      {ORDER.map((id, i) => {
        const Icon = ICONS[id];
        const checked = pref === id;
        return (
          <button
            key={id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            title={labels[id]}
            data-theme-option={id}
            onClick={(e) => select(id, e)}
            className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-[15px] transition-colors ${
              checked ? "text-primary-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Icon />
            <span className="sr-only">{labels[id]}</span>
          </button>
        );
      })}
    </div>
  );
}
