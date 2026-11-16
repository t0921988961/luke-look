"use client";

import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  canSendAnalytics,
  configureAnalytics,
  denyAnalytics,
  GA_MEASUREMENT_ID,
  grantAnalytics,
  track,
} from "@/lib/analytics";
import { consentSnapshot, deleteGaCookies, subscribeConsent } from "@/lib/consent";
import { applyNoTrackQuery, isNoTrackNow, subscribeNoTrack } from "@/lib/notrack";

export function AnalyticsRoot({ gaEnabled, vercelEnabled }: { gaEnabled: boolean; vercelEnabled: boolean }) {
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, () => null);
  const optedOut = useSyncExternalStore(subscribeNoTrack, isNoTrackNow, () => false);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const wasGranted = useRef(false);

  useEffect(() => {
    applyNoTrackQuery();
  }, []);

  const granted = ready && gaEnabled && !optedOut && consent?.analytics === "granted";

  useEffect(() => {
    configureAnalytics({
      enabled: gaEnabled && !optedOut,
      consented: consent?.analytics === "granted",
      optedOut,
    });
    if (granted && !wasGranted.current) {
      grantAnalytics();
      wasGranted.current = true;
    } else if (!granted && wasGranted.current) {
      denyAnalytics();
      deleteGaCookies();
      wasGranted.current = false;
    }
    document.documentElement.dataset.analytics = canSendAnalytics() ? "on" : "off";
  }, [gaEnabled, optedOut, consent, granted]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-track]");
      if (!el) return;
      const name = el.getAttribute("data-track");
      if (!name) return;
      const params: Record<string, string> = {};
      for (const attr of el.getAttributeNames()) {
        if (!attr.startsWith("data-param-")) continue;
        params[attr.slice("data-param-".length)] = el.getAttribute(attr) ?? "";
      }
      track(name, params);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      {granted && (
        <Script id="ga4" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="lazyOnload" />
      )}
      {ready && vercelEnabled && !optedOut && <Analytics />}
    </>
  );
}
