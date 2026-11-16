export const CONSENT_KEY = "consent.v1";
const YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const CHANGE_EVENT = "consent-change";
const OPEN_EVENT = "consent-open";

export type ConsentChoice = {
  analytics: "granted" | "denied";
  ts: number;
};

export const CONSENT_DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

let snapshot: ConsentChoice | null = null;
let snapshotRaw = "\0";

/** Stable reference for useSyncExternalStore. A new object is returned only when storage changes. */
export function consentSnapshot(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  let raw = "";
  try {
    raw = window.localStorage.getItem(CONSENT_KEY) ?? "";
  } catch {
    raw = "";
  }
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  snapshot = readConsent();
  return snapshot;
}

export function readConsent(now = Date.now()): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (parsed.analytics !== "granted" && parsed.analytics !== "denied") return null;
    if (typeof parsed.ts !== "number" || now - parsed.ts > YEAR_MS) return null;
    return { analytics: parsed.analytics, ts: parsed.ts };
  } catch {
    return null;
  }
}

export function writeConsent(analytics: ConsentChoice["analytics"], now = Date.now()) {
  const choice: ConsentChoice = { analytics, ts: now };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return choice;
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let settingsNonce = 0;

export function readSettingsNonce() {
  return settingsNonce;
}

export function requestConsentSettings() {
  settingsNonce += 1;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onConsentSettings(callback: () => void) {
  window.addEventListener(OPEN_EVENT, callback);
  return () => window.removeEventListener(OPEN_EVENT, callback);
}

/** Removes GA cookies on this host. Ads cookies are never set. */
export function deleteGaCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => !!name && name.startsWith("_ga"));
  const host = window.location.hostname;
  for (const name of names) {
    const base = `${name}=; max-age=0; path=/`;
    document.cookie = base;
    document.cookie = `${base}; domain=${host}`;
    document.cookie = `${base}; domain=.${host}`;
  }
}
