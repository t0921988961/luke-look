"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { loopsRunning, onLoopsChange, setLoopsPaused, useLoopsRunning } from "@/lib/motion";

export function MotionToggle({
  pause,
  play,
  variant = "icon",
}: {
  pause: string;
  play: string;
  variant?: "icon" | "text";
}) {
  const running = useLoopsRunning();

  useEffect(() => {
    const sync = () => {
      document.documentElement.dataset.loops = loopsRunning() ? "on" : "off";
    };
    sync();
    return onLoopsChange(sync);
  }, []);

  const label = running ? pause : play;
  return (
    <button
      type="button"
      aria-pressed={!running}
      aria-label={label}
      data-motion-toggle=""
      onClick={() => {
        track("toggle_motion", { state: running ? "paused" : "playing" });
        setLoopsPaused(running);
      }}
      className={
        variant === "text"
          ? "inline-flex h-10 items-center rounded-full border border-white/25 px-4 text-sm text-white/80 transition-colors hover:border-white hover:text-white"
          : "grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/60 text-ink transition-colors hover:border-primary/50"
      }
    >
      {running ? <PauseIcon /> : <PlayIcon />}
      {variant === "text" ? <span className="ml-2">{label}</span> : <span className="sr-only">{label}</span>}
    </button>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}
