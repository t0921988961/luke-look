"use client";

import { requestConsentSettings } from "@/lib/consent";

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline" onClick={() => requestConsentSettings()}>
      {label}
    </button>
  );
}
