"use client";

import { useEffect, useSyncExternalStore } from "react";
import { applyNoTrackQuery, isNoTrackNow, subscribeNoTrack } from "@/lib/notrack";

export function NoTrackDot({ label }: { label: string }) {
  const on = useSyncExternalStore(subscribeNoTrack, isNoTrackNow, () => false);
  useEffect(() => {
    applyNoTrackQuery();
  }, []);
  if (!on) return null;
  return (
    <p className="inline-flex items-center gap-2 text-xs text-white/70">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-warm" />
      {label}
    </p>
  );
}
