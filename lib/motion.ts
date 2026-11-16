import { useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const SCROLL_LOCK_EVENT = "scroll-lock";

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
