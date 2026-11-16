"use client";

import dynamic from "next/dynamic";

const AnalyticsRoot = dynamic(() => import("./AnalyticsRoot").then((m) => m.AnalyticsRoot), { ssr: false });

export function AnalyticsLoader(props: { gaEnabled: boolean; vercelEnabled: boolean }) {
  return <AnalyticsRoot {...props} />;
}
