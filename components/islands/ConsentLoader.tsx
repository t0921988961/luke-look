"use client";

import dynamic from "next/dynamic";
import type { ConsentLabels } from "./ConsentBanner";

const ConsentBanner = dynamic(() => import("./ConsentBanner").then((m) => m.ConsentBanner), { ssr: false });

/** Loaded after the first paint so the banner stays out of the initial JavaScript. */
export function ConsentLoader({ labels }: { labels: ConsentLabels }) {
  return <ConsentBanner labels={labels} />;
}
