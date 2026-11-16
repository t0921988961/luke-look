export const NOTRACK_KEY = "notrack";

export function readNoTrack(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(NOTRACK_KEY) === "1";
  } catch {
    return false;
  }
}

/** Query string wins over the saved choice, including on the first client render. */
export function isNoTrackNow(): boolean {
  if (typeof window === "undefined") return false;
  const value = new URLSearchParams(window.location.search).get("notrack");
  if (value === "1" || value === "off") return true;
  if (value === "0") return false;
  return readNoTrack();
}

export function subscribeNoTrack(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/** `?notrack=1` opts this device out; `?notrack=0` opts back in. */
export function applyNoTrackQuery(search = window.location.search): boolean {
  const value = new URLSearchParams(search).get("notrack");
  try {
    if (value === "1" || value === "off") window.localStorage.setItem(NOTRACK_KEY, "1");
    if (value === "0") window.localStorage.removeItem(NOTRACK_KEY);
  } catch {
    // Storage blocked: the query still hides tracking for this view.
  }
  if (value === "1" || value === "off") return true;
  if (value === "0") return false;
  return readNoTrack();
}
