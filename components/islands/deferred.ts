"use client";

import { track } from "@/lib/analytics";
import { getEmailAddress, getMailtoHref } from "@/lib/contact";
import { APPROACH_SHAPES } from "@/lib/approach-shapes";
import { loopsRunning, onLoopsChange, prefersReducedMotion } from "@/lib/motion";
import { loadGsap } from "@/components/motion/load";

function setOpen(button: HTMLButtonElement, open: boolean) {
  button.setAttribute("aria-expanded", open ? "true" : "false");
  const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
  if (panel) {
    panel.setAttribute("data-open", open ? "true" : "false");
    if (open) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  }
  const label = button.querySelector(".exp-label");
  if (label) label.textContent = (open ? button.dataset.less : button.dataset.more) ?? "";
}

/** Toggles experience panels. The markup is server-rendered and closed. */
export function startExperience(): () => void {
  const list = document.querySelector("[data-timeline]");
  if (!list) return () => {};
  let current: HTMLButtonElement | null = null;
  const onClick = (event: Event) => {
    const button = (event.target as Element | null)?.closest?.("button.exp-toggle");
    if (!(button instanceof HTMLButtonElement) || !list.contains(button)) return;
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    if (current && current !== button) setOpen(current, false);
    setOpen(button, willOpen);
    current = willOpen ? button : null;
  };
  list.addEventListener("click", onClick);
  return () => list.removeEventListener("click", onClick);
}

const COPY_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>';
const CHECK_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const ARROW_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="text-sky transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><path d="M7 17 17 7M8 7h9v9"/></svg>';

/** Assembles the address only after the click. Nothing is in the server HTML. */
export function startEmail(): () => void {
  const button = document.querySelector<HTMLButtonElement>("[data-email-toggle]");
  const panel = document.getElementById("email-reveal");
  if (!button || !panel) return () => {};
  let shown = false;
  let copiedTimer = 0;

  const hide = () => {
    shown = false;
    panel.replaceChildren();
    button.setAttribute("aria-expanded", "false");
    const label = button.querySelector("[data-email-label]");
    if (label) label.textContent = button.dataset.revealLabel ?? "";
  };

  const show = () => {
    const address = getEmailAddress();
    shown = true;
    track("reveal_email", { location: "contact" });
    button.setAttribute("aria-expanded", "true");
    const label = button.querySelector("[data-email-label]");
    if (label) label.textContent = button.dataset.hideLabel ?? "";

    const row = document.createElement("div");
    row.className = "flex flex-col gap-4 md:flex-row md:items-center md:gap-6";
    const text = document.createElement("span");
    text.className = "min-w-0 text-[clamp(1.15rem,3vw,2.25rem)] font-bold tracking-tight break-all";
    text.textContent = address;
    const actions = document.createElement("div");
    actions.className = "flex flex-wrap gap-3";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className =
      "inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white/85 transition-colors hover:border-white hover:text-white";
    copy.innerHTML = `${COPY_SVG}<span>${button.dataset.copyLabel ?? ""}</span>`;
    copy.addEventListener("click", async () => {
      const span = copy.querySelector("span");
      try {
        await navigator.clipboard.writeText(address);
        track("copy_email", { location: "contact" });
        if (span) span.textContent = button.dataset.copiedLabel ?? "";
        copy.querySelector("svg")?.replaceWith(svgFrom(CHECK_SVG));
        window.clearTimeout(copiedTimer);
        copiedTimer = window.setTimeout(() => {
          if (span) span.textContent = button.dataset.copyLabel ?? "";
          copy.querySelector("svg")?.replaceWith(svgFrom(COPY_SVG));
        }, 1800);
      } catch {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(text);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    });
    const send = document.createElement("a");
    send.href = getMailtoHref();
    send.className =
      "group inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white/85 transition-colors hover:border-white hover:text-white";
    send.setAttribute("data-track", "contact_click");
    send.setAttribute("data-param-method", "email");
    send.setAttribute("data-param-location", "contact");
    send.innerHTML = `<span>${button.dataset.sendLabel ?? ""}</span>${ARROW_SVG}`;
    actions.append(copy, send);
    row.append(text, actions);
    panel.replaceChildren(row);
    copy.focus();
  };

  const onClick = () => {
    if (shown) hide();
    else show();
  };
  button.addEventListener("click", onClick);
  return () => {
    button.removeEventListener("click", onClick);
    window.clearTimeout(copiedTimer);
  };
}

function svgFrom(html: string) {
  const wrap = document.createElement("span");
  wrap.innerHTML = html;
  return wrap.firstElementChild ?? wrap;
}

export function startApproach(): () => void {
  const stage = document.querySelector<HTMLElement>("[data-approach-stage]");
  const section = stage?.closest("section");
  if (!stage || !section) return () => {};
  const steps = [...section.querySelectorAll<HTMLElement>("[data-step]")];
  section.setAttribute("data-approach-ready", "");
  let shown = 0;
  const apply = (active: number) => {
    if (active < 0) return;
    steps.forEach((step, i) => {
      step.dataset.active = String(i === active);
    });
    const index = stage.querySelector("[data-approach-index]");
    if (index) index.textContent = `0${active + 1}`;
    if (active === shown) return;
    const prev = shown;
    shown = active;
    const prevGroup = stage.querySelector(`[data-icon="${prev}"]`);
    const nextGroup = stage.querySelector(`[data-icon="${active}"]`);
    const motion = !prefersReducedMotion() && document.documentElement.dataset.loops !== "off";
    if (!motion) {
      stage.querySelectorAll("[data-morph], [data-morph-glow]").forEach((path) => path.setAttribute("d", APPROACH_SHAPES[active]));
      prevGroup?.classList.add("opacity-0");
      nextGroup?.classList.remove("opacity-0");
      return;
    }
    loadGsap().then(({ gsap }) => {
      nextGroup?.classList.remove("opacity-0");
      gsap.to(stage.querySelector("[data-morph]"), { morphSVG: APPROACH_SHAPES[active], duration: 1.2, ease: "expo.inOut", overwrite: true });
      gsap.to(stage.querySelector("[data-morph-glow]"), { morphSVG: APPROACH_SHAPES[active], duration: 1.4, ease: "expo.inOut", overwrite: true });
      if (prevGroup) {
        gsap.to(prevGroup.querySelectorAll("[data-icon-path]"), { drawSVG: "0%", duration: 0.45, ease: "power2.in", overwrite: true });
        gsap.to(prevGroup, { opacity: 0, duration: 0.3, delay: 0.25, overwrite: true });
      }
      if (nextGroup) {
        gsap.fromTo(nextGroup, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 0.3, overwrite: true });
        gsap.fromTo(
          nextGroup.querySelectorAll("[data-icon-path]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.1, delay: 0.35, stagger: 0.08, ease: "power2.inOut", overwrite: true },
        );
      }
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) apply(steps.indexOf(entry.target as HTMLElement));
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  steps.forEach((step) => io.observe(step));
  let orbit: (() => void) | undefined;
  const syncOrbit = () => {
    orbit?.();
    orbit = undefined;
    if (!loopsRunning()) return;
    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.to("[data-orbit]", { rotate: 360, duration: 40, ease: "none", repeat: -1, svgOrigin: "200 200" });
        gsap.to("[data-orbit-dot]", { rotate: -360, duration: 14, ease: "none", repeat: -1, svgOrigin: "200 200" });
      }, stage);
      orbit = () => ctx.revert();
    });
  };
  syncOrbit();
  const unsub = onLoopsChange(syncOrbit);
  return () => {
    io.disconnect();
    section.removeAttribute("data-approach-ready");
    unsub();
    orbit?.();
  };
}

export function startDashboard(): () => void {
  const scope = document.querySelector<HTMLElement>("[data-dashboard]");
  if (!scope) return () => {};
  let revert: (() => void) | undefined;
  let generation = 0;
  const setFlags = (dark: boolean, rtl: boolean) => {
    const theme = scope.querySelector<HTMLElement>("[data-mock-theme]");
    if (theme) theme.dataset.mockTheme = dark ? "dark" : "light";
    const lang = scope.querySelector<HTMLElement>("[data-mock-lang]");
    if (lang) {
      lang.textContent = rtl ? "RTL · עברית" : "LTR · EN";
      lang.style.color = dark ? "#c3cde6" : "#27324f";
    }
    const mode = scope.querySelector("[data-mock-mode]");
    if (mode) mode.textContent = dark ? "Dark" : "Light";
  };
  const stop = () => {
    generation += 1;
    revert?.();
    revert = undefined;
    setFlags(false, false);
  };
  const start = () => {
    if (!loopsRunning()) return;
    const gen = ++generation;
    loadGsap().then(({ gsap }) => {
      if (gen !== generation) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true, defaults: { ease: "expo.out" } });
        tl.fromTo("[data-mock-line]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" }, 0)
          .fromTo("[data-mock-area]", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
          .fromTo("[data-mock-bar]", { scaleY: 0 }, { scaleY: 1, duration: 1, stagger: 0.06 }, 0.2)
          .fromTo("[data-mock-kpi]", { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.1 }, 0.1)
          .fromTo("[data-mock-dot]", { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(3)" }, 0.6)
          .call(() => setFlags(true, false), [], 2.6)
          .call(() => setFlags(true, true), [], 4.4)
          .to("[data-mock-body]", { rotateY: 180, duration: 1.1, ease: "power3.inOut" }, 4.4)
          .call(() => setFlags(true, false), [], 7.2)
          .to("[data-mock-body]", { rotateY: 0, duration: 1.1, ease: "power3.inOut" }, 7.2)
          .call(() => setFlags(false, false), [], 9);
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
  };
  const sync = () => {
    stop();
    start();
  };
  sync();
  const unsub = onLoopsChange(sync);
  return () => {
    unsub();
    stop();
  };
}

export function startDeferred(): () => void {
  const stops = [startExperience(), startEmail(), startApproach(), startDashboard()];
  return () => stops.forEach((stop) => stop());
}
