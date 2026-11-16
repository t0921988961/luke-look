"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IslandBoundary } from "./IslandBoundary";

const HorizonCanvas = dynamic(() => import("./HorizonCanvas").then((m) => m.HorizonCanvas), { ssr: false });

/** The horizon is decoration. It starts when the browser is idle, behind the CSS gradient. */
export function LazyHorizon({ variant = "hero", className }: { variant?: "hero" | "contact"; className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <IslandBoundary>
      <HorizonCanvas variant={variant} className={className} />
    </IslandBoundary>
  );
}
