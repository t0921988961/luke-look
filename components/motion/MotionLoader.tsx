"use client";

import dynamic from "next/dynamic";

/** GSAP and Lenis stay out of the first bundle and out of the server render. */
export const MotionLoader = dynamic(() => import("./MotionRoot").then((m) => m.MotionRoot), { ssr: false });
