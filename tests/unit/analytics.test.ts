import { afterEach, describe, expect, it } from "vitest";
import { configureAnalytics, ensureGtag, getAnalyticsState, grantAnalytics, track } from "@/lib/analytics";
import { CONSENT_DENIED } from "@/lib/consent";

afterEach(() => {
  configureAnalytics({ enabled: false, consented: false, optedOut: false });
  delete window.gtag;
  delete window.dataLayer;
});

describe("analytics", () => {
  it("pushes an arguments object, not an array", () => {
    ensureGtag()("event", "contact_click", { method: "linkedin" });
    const entry = window.dataLayer?.[0];
    expect(Array.isArray(entry)).toBe(false);
    expect(entry).toMatchObject({ 0: "event", 1: "contact_click", 2: { method: "linkedin" } });
  });

  it("drops events before consent, when disabled, and when opted out", () => {
    track("contact_click", { method: "linkedin", location: "contact" });
    expect(window.dataLayer).toBeUndefined();

    configureAnalytics({ enabled: true, consented: false, optedOut: false });
    track("reveal_email", { location: "contact" });
    expect(window.dataLayer).toBeUndefined();

    configureAnalytics({ enabled: true, consented: true, optedOut: true });
    track("copy_email", { location: "contact" });
    expect(window.dataLayer).toBeUndefined();
  });

  it("sends named events only after consent on an enabled device", () => {
    configureAnalytics({ enabled: true, consented: true, optedOut: false });
    track("select_language", { from: "zh-TW", to: "en" });
    track("select_theme", { preference: "dark", resolved: "dark" });
    track("toggle_motion", { state: "paused" });
    const names = window.dataLayer?.map((entry) => (entry as { 1?: string })[1]);
    expect(names).toEqual(["select_language", "select_theme", "toggle_motion"]);
  });

  it("sets consent default to denied before config, and never grants ads", () => {
    grantAnalytics();
    const calls = (window.dataLayer ?? []).map((entry) => (entry as { 0: string; 1?: string })[0] + " " + ((entry as { 1?: string })[1] ?? ""));
    expect(calls[0]).toBe("consent default");
    expect(calls[1]).toBe("consent update");
    expect(calls).toContain("config G-G5PL64KQG6");
    const def = window.dataLayer?.[0] as { 2: Record<string, string> };
    expect(def[2]).toEqual(CONSENT_DENIED);
    const update = window.dataLayer?.[1] as { 2: Record<string, string> };
    expect(update[2]).toEqual({ analytics_storage: "granted" });
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/ad_storage":"granted/);
    expect(getAnalyticsState().consented).toBe(false);
  });
});
