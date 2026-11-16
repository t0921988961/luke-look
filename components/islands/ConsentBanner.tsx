"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { consentSnapshot, deleteGaCookies, onConsentSettings, readConsent, readSettingsNonce, subscribeConsent, writeConsent } from "@/lib/consent";
import { isNoTrackNow, subscribeNoTrack } from "@/lib/notrack";

export type ConsentLabels = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  privacy: string;
};

export function ConsentBanner({ labels }: { labels: ConsentLabels }) {
  const stored = useSyncExternalStore(subscribeConsent, consentSnapshot, () => null);
  const notrack = useSyncExternalStore(subscribeNoTrack, isNoTrackNow, () => false);
  const settingsNonce = useSyncExternalStore(onConsentSettings, readSettingsNonce, () => 0);
  const [closedNonce, setClosedNonce] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const open = !notrack && (stored === null || settingsNonce > closedNonce);

  useEffect(() => {
    if (settingsNonce > 0) headingRef.current?.focus();
  }, [settingsNonce]);

  if (!open) return null;

  const choose = (analytics: "granted" | "denied") => {
    const previous = readConsent();
    writeConsent(analytics);
    if (analytics === "denied" && previous?.analytics === "granted") deleteGaCookies();
    setClosedNonce(settingsNonce);
  };

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="consent-banner fixed z-40 w-[min(420px,calc(100%-1.5rem))] rounded-3xl border border-line bg-bg/90 p-4 text-ink shadow-[var(--shadow)] backdrop-blur-xl max-md:inset-x-3 max-md:bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-md:max-h-[30vh] max-md:overflow-auto md:bottom-6 md:left-6"
    >
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-sm font-semibold outline-none">
        {labels.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{labels.body}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="h-11 rounded-full border border-line-strong bg-surface text-sm font-semibold text-ink"
        >
          {labels.reject}
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-ink"
        >
          {labels.accept}
        </button>
      </div>
      <a href="#privacy" className="mt-2 inline-flex text-sm text-primary">
        {labels.privacy}
      </a>
    </section>
  );
}
