import { CONSENT_DENIED } from "./consent";

export const GA_MEASUREMENT_ID = "G-G5PL64KQG6";

type Params = Record<string, string>;

type AnalyticsState = {
  /** Production, or a test build started with ANALYTICS_FORCE=1. */
  enabled: boolean;
  consented: boolean;
  optedOut: boolean;
};

const state: AnalyticsState = { enabled: false, consented: false, optedOut: false };

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function configureAnalytics(next: Partial<AnalyticsState>) {
  Object.assign(state, next);
}

export function getAnalyticsState(): AnalyticsState {
  return { ...state };
}

/** gtag only processes `arguments` objects, not arrays. */
export function ensureGtag(): Gtag {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(this: unknown) {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  return window.gtag;
}

export function canSendAnalytics() {
  return state.enabled && state.consented && !state.optedOut;
}

/** Events before consent are dropped, not queued. */
export function track(name: string, params: Params = {}) {
  if (!canSendAnalytics()) return;
  ensureGtag()("event", name, params);
}

/** Pushes Consent Mode before any config call. Ads signals stay denied. */
export function grantAnalytics() {
  const gtag = ensureGtag();
  gtag("consent", "default", CONSENT_DENIED);
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

export function denyAnalytics() {
  ensureGtag()("consent", "update", { analytics_storage: "denied" });
}
