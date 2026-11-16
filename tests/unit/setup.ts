import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

type MediaState = Record<string, boolean>;

const media: MediaState = {};
const listeners = new Map<string, Set<() => void>>();

/** Sets an emulated media query result, e.g. setMedia("(prefers-color-scheme: dark)", true). */
export function setMedia(query: string, matches: boolean) {
  media[query] = matches;
  listeners.get(query)?.forEach((cb) => cb());
}

function matchMedia(query: string): MediaQueryList {
  return {
    get matches() {
      return media[query] ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: () => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(cb);
    },
    removeEventListener: (_: string, cb: () => void) => listeners.get(query)?.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  for (const key of Object.keys(media)) delete media[key];
  listeners.clear();
  vi.stubGlobal("matchMedia", matchMedia);
  vi.stubGlobal("IntersectionObserver", NoopObserver);
  vi.stubGlobal("ResizeObserver", NoopObserver);
  window.localStorage.clear();
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  });
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-theme-pref");
  document.documentElement.className = "";
  document.documentElement.style.overflow = "";
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
