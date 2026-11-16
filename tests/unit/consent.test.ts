import { describe, expect, it, vi } from "vitest";
import { CONSENT_KEY, deleteGaCookies, readConsent, writeConsent } from "@/lib/consent";

describe("consent storage", () => {
  it("returns null when nothing is stored", () => {
    expect(readConsent()).toBeNull();
  });

  it("stores granted and denied choices", () => {
    const now = Date.parse("2026-11-16T00:00:00Z");
    writeConsent("granted", now);
    expect(readConsent(now)).toEqual({ analytics: "granted", ts: now });
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "")).toEqual({ analytics: "granted", ts: now });
    writeConsent("denied", now);
    expect(readConsent(now)?.analytics).toBe("denied");
  });

  it("asks again after 12 months and ignores a broken value", () => {
    const now = Date.parse("2026-11-16T00:00:00Z");
    writeConsent("granted", now);
    const later = now + 1000 * 60 * 60 * 24 * 366;
    expect(readConsent(later)).toBeNull();
    localStorage.setItem(CONSENT_KEY, "{");
    expect(readConsent()).toBeNull();
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: "maybe", ts: now }));
    expect(readConsent(now)).toBeNull();
  });

  it("deletes Google Analytics cookies", () => {
    document.cookie = "_ga=1; path=/";
    document.cookie = "_ga_G5PL64KQG6=1; path=/";
    document.cookie = "theme=dark; path=/";
    deleteGaCookies();
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toMatch(/theme=dark/);
  });
});

describe("consent events", () => {
  it("notifies subscribers", async () => {
    const { subscribeConsent } = await import("@/lib/consent");
    const cb = vi.fn();
    const off = subscribeConsent(cb);
    writeConsent("denied", 1);
    expect(cb).toHaveBeenCalledOnce();
    off();
  });
});
