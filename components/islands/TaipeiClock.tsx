"use client";

import { useEffect, useState } from "react";

const FORMAT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Taipei" });

export function TaipeiClock({ label }: { label: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(FORMAT.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
      <span>{label}</span>
      <span data-clock className="text-ink tabular-nums">
        {time ?? "--:--"}
      </span>
      <span>GMT+8</span>
    </p>
  );
}
