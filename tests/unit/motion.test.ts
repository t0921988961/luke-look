import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { onScrollLockChange, prefersReducedMotion, setScrollLocked, useMotionAllowed } from "@/lib/motion";
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
