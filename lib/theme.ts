export type ThemePref = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export const THEME_KEY = "theme";
const CHANGE_EVENT = "theme-pref-change";

export function parseThemePref(value: unknown): ThemePref {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

export function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readThemePref(): ThemePref {
  try {
    return parseThemePref(window.localStorage.getItem(THEME_KEY));
  } catch {
    return "system";
  }
}

export function writeThemePref(pref: ThemePref) {
  try {
    if (pref === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Private mode or storage disabled: the choice lasts for this page only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeThemePref(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveTheme(pref, systemPrefersDark()));
  root.setAttribute("data-theme-pref", pref);
}

/**
 * Runs before first paint (inline in <head>) so the page never flashes the
 * wrong theme, and enables motion styles only when motion is allowed.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var p=localStorage.getItem("${THEME_KEY}");if(p!=="light"&&p!=="dark")p="system";var r=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;d.setAttribute("data-theme",r);d.setAttribute("data-theme-pref",p)}catch(e){}try{var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!reduce)d.classList.add("js-motion");var loops=localStorage.getItem("motion-loops");var off=loops==="paused"||(loops!=="playing"&&reduce);d.setAttribute("data-loops",off?"off":"on")}catch(e){d.setAttribute("data-loops","on")}})()`;
