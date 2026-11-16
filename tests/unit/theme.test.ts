import { describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  BOOT_SCRIPT,
  parseThemePref,
  readThemePref,
  resolveTheme,
  subscribeThemePref,
  THEME_KEY,
  writeThemePref,
} from "@/lib/theme";
import { setMedia } from "./setup";

describe("theme preference", () => {
  it("parses anything unknown as system", () => {
    expect(parseThemePref("dark")).toBe("dark");
    expect(parseThemePref("light")).toBe("light");
    expect(parseThemePref("blue")).toBe("system");
    expect(parseThemePref(null)).toBe("system");
  });

  it("resolves system against the OS setting", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("saves explicit choices, clears system, and notifies subscribers", () => {
    const cb = vi.fn();
    const off = subscribeThemePref(cb);
    writeThemePref("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(readThemePref()).toBe("dark");
    writeThemePref("system");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(cb).toHaveBeenCalledTimes(2);
    off();
    writeThemePref("light");
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("survives storage that throws", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readThemePref()).toBe("system");
    expect(() => writeThemePref("dark")).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it("applies the resolved theme to <html>", () => {
    setMedia("(prefers-color-scheme: dark)", true);
    applyTheme("system");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themePref).toBe("system");
  });
});

describe("boot script", () => {
  const run = () => new Function(BOOT_SCRIPT)();

  it("follows the OS by default and enables motion styles", () => {
    setMedia("(prefers-color-scheme: dark)", true);
    run();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themePref).toBe("system");
    expect(document.documentElement.classList.contains("js-motion")).toBe(true);
  });

  it("honors a saved choice and reduced motion", () => {
    localStorage.setItem(THEME_KEY, "light");
    setMedia("(prefers-color-scheme: dark)", true);
    setMedia("(prefers-reduced-motion: reduce)", true);
    run();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("js-motion")).toBe(false);
  });
});
