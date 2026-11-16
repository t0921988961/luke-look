import { useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const SCROLL_LOCK_EVENT = "scroll-lock";
const LOOPS_KEY = "motion-loops";
const LOOPS_EVENT = "motion-loops-change";

export type LoopsChoice = "auto" | "paused" | "playing";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/** False on the server and until hydration, so islands render their static state first. */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => !prefersReducedMotion(),
    () => false,
  );
}

export function readLoopsChoice(): LoopsChoice {
  try {
    const value = window.localStorage.getItem(LOOPS_KEY);
    if (value === "paused" || value === "playing") return value;
  } catch {
    // Storage can be blocked; fall through to the OS setting.
  }
  return "auto";
}

/** Looping motion (canvas, marquee, mock, orbit). One-shot reveals are separate. */
export function loopsRunning(): boolean {
  if (typeof window === "undefined") return false;
  const choice = readLoopsChoice();
  if (choice === "paused") return false;
  if (choice === "playing") return true;
  return !prefersReducedMotion();
}

export function setLoopsPaused(paused: boolean) {
  try {
    window.localStorage.setItem(LOOPS_KEY, paused ? "paused" : "playing");
  } catch {
    // The choice still applies for this page view.
  }
  document.documentElement.dataset.loops = paused ? "off" : "on";
  window.dispatchEvent(new Event(LOOPS_EVENT));
}

export function onLoopsChange(callback: () => void) {
  const onMedia = () => callback();
  const media = window.matchMedia(REDUCED_QUERY);
  media.addEventListener("change", onMedia);
  window.addEventListener(LOOPS_EVENT, callback);
  return () => {
    media.removeEventListener("change", onMedia);
    window.removeEventListener(LOOPS_EVENT, callback);
  };
}

export function useLoopsRunning(): boolean {
  return useSyncExternalStore(onLoopsChange, loopsRunning, () => false);
}

/** Locks page scrolling, including smooth scrolling, while an overlay is open. */
export function setScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(new CustomEvent<boolean>(SCROLL_LOCK_EVENT, { detail: locked }));
}

export function onScrollLockChange(callback: (locked: boolean) => void) {
  const listener = (e: Event) => callback((e as CustomEvent<boolean>).detail);
  window.addEventListener(SCROLL_LOCK_EVENT, listener);
  return () => window.removeEventListener(SCROLL_LOCK_EVENT, listener);
}
