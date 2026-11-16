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

describe("deferred decoration", () => {
  it("waits four seconds on browsers without requestIdleCallback", () => {
    for (const file of ["components/islands/LazyHorizon.tsx", "components/motion/MotionRoot.tsx"]) {
      const source = readFileSync(file, "utf8");
      expect(source, file).toMatch(/setTimeout\([^,]+,\s*4000\)/);
      expect(source, file).not.toMatch(/setTimeout\([^,]+,\s*1600\)/);
    }
  });
});

describe("hero underline", () => {
  it("draws with a dash longer than the path, and only while motion is allowed", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const rule = css.match(/html\.js-motion\[data-loops="on"\] \.hero-underline\s*\{[^}]*\}/);
    expect(rule?.[0]).toMatch(/stroke-dasharray:\s*2;/);
    expect(rule?.[0]).toMatch(/stroke-dashoffset:\s*2;/);
    expect(rule?.[0]).toMatch(/hero-draw 1\.1s cubic-bezier\(0\.65, 0, 0\.35, 1\) 0\.95s forwards/);
    expect(css).not.toMatch(/\.hero-underline\s*\{[^}]*stroke-dasharray:\s*1\s*;/);
  });
});

describe("text sizing", () => {
  it("sets the standard property as well as the WebKit prefix", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toMatch(/-webkit-text-size-adjust:\s*100%/);
    expect(css).toMatch(/(^|[^-\w])text-size-adjust:\s*100%/);
  });
});
