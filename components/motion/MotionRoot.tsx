"use client";

import { useEffect, useRef } from "react";
import { useMotionAllowed } from "@/lib/motion";

/** Loads the motion engine after hydration, only when motion is allowed. */
export function MotionRoot() {
  const allowed = useMotionAllowed();
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allowed) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./engine")
      .then(({ startMotion }) => startMotion({ cursor: ring.current, dot: dot.current, progress: progress.current }))
      .then((stop) => {
        if (cancelled) stop();
        else cleanup = stop;
      })
      .catch(() => {
        // Motion is decoration; the page is complete without it.
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [allowed]);

  return (
    <>
      <div aria-hidden="true" className="vrt-hide pointer-events-none fixed inset-x-0 top-0 z-[55] h-[2px]">
        <div ref={progress} className="h-full origin-left scale-x-0 bg-gradient-to-r from-primary via-sky to-warm" />
      </div>
      <div
        ref={ring}
        aria-hidden="true"
        className="vrt-hide pointer-events-none fixed top-0 left-0 z-[80] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 transition-[width,height,background-color,border-color] duration-300 data-[hot=true]:h-14 data-[hot=true]:w-14 data-[hot=true]:border-primary data-[hot=true]:bg-primary/10"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="vrt-hide pointer-events-none fixed top-0 left-0 z-[80] -mt-[3px] -ml-[3px] hidden h-1.5 w-1.5 rounded-full bg-warm"
      />
    </>
  );
}
