import { Geist_Mono, Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", preload: false });

export const latinClassName = `${manrope.variable} ${geistMono.variable}`;
