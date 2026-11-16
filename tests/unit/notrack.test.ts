import { afterEach, describe, expect, it, vi } from "vitest";
import { applyNoTrackQuery, isNoTrackNow, readNoTrack, subscribeNoTrack } from "@/lib/notrack";

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("notrack", () => {
  it("lets the query turn tracking off and back on", () => {
    expect(readNoTrack()).toBe(false);
    expect(applyNoTrackQuery("?notrack=1")).toBe(true);
    expect(readNoTrack()).toBe(true);
    expect(applyNoTrackQuery("?notrack=0")).toBe(false);
    expect(readNoTrack()).toBe(false);
    expect(applyNoTrackQuery("?notrack=off")).toBe(true);
  });

  it("reads the live address", () => {
    window.history.pushState({}, "", "/?notrack=1");
    expect(isNoTrackNow()).toBe(true);
    window.history.pushState({}, "", "/?notrack=0");
    localStorage.setItem("notrack", "1");
    expect(isNoTrackNow()).toBe(false);
  });

  it("subscribes and survives blocked storage", () => {
    const cb = vi.fn();
    const off = subscribeNoTrack(cb);
    window.dispatchEvent(new StorageEvent("storage"));
    expect(cb).toHaveBeenCalledOnce();
    off();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readNoTrack()).toBe(false);
    expect(applyNoTrackQuery("?notrack=1")).toBe(true);
  });
});
