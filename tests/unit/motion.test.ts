import { readFileSync } from "node:fs";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loopsRunning, onScrollLockChange, prefersReducedMotion, setLoopsPaused, setScrollLocked, useMotionAllowed } from "@/lib/motion";
import { setMedia } from "./setup";

describe("motion preference", () => {
  it("reads prefers-reduced-motion", () => {
    expect(prefersReducedMotion()).toBe(false);
    setMedia("(prefers-reduced-motion: reduce)", true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("follows live changes of the OS setting", () => {
    const { result } = renderHook(() => useMotionAllowed());
    expect(result.current).toBe(true);
    act(() => setMedia("(prefers-reduced-motion: reduce)", true));
    expect(result.current).toBe(false);
  });
});

describe("looping motion", () => {
  it("follows reduced motion until the visitor chooses", () => {
    expect(loopsRunning()).toBe(true);
    setMedia("(prefers-reduced-motion: reduce)", true);
    expect(loopsRunning()).toBe(false);
    setLoopsPaused(false);
    expect(loopsRunning()).toBe(true);
    expect(localStorage.getItem("motion-loops")).toBe("playing");
    setLoopsPaused(true);
    expect(loopsRunning()).toBe(false);
    expect(document.documentElement.dataset.loops).toBe("off");
  });
});

describe("scroll lock", () => {
  it("locks the page and notifies listeners", () => {
    const cb = vi.fn();
    const off = onScrollLockChange(cb);
    setScrollLocked(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(cb).toHaveBeenLastCalledWith(true);
    setScrollLocked(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(cb).toHaveBeenLastCalledWith(false);
    off();
    setScrollLocked(true);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe("hero underline", () => {
  it("does not repeat a single dash length as a gap", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const rule = css.match(/\.js-motion \.hero-underline\s*\{[^}]*\}/);
    expect(rule).toBeNull();
  });
});
