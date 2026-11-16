import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Manrope,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_TC,
} from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// CJK families are served as unicode-range slices, so only glyphs on the page are downloaded.
const notoTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  weight: ["400", "500", "700", "900"],
  preload: false,
});

const notoJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["400", "500", "700", "900"],
  preload: false,
});

const notoKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "700", "900"],
  preload: false,
});

export const metadata: Metadata = {
  title: "鄭宏璋 Luke Cheng — 前端工程師 · Front-end Engineer",
  description:
    "Luke Cheng（鄭宏璋），台北的前端工程師，7 年經驗，熟悉 Vue 3、Angular 與 TypeScript，主要開發 B2B、IoT 管理後台與數據儀表板。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#060a14" },
  ],
};

const bootScript = `(function(){try{var d=document.documentElement,p=localStorage.getItem("theme")||"system";if(p!=="light"&&p!=="dark")p="system";var r=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;d.setAttribute("data-theme",r);d.setAttribute("data-theme-pref",p);if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("js-motion");var l=localStorage.getItem("lang");if(l==="en"||l==="ja"||l==="ko"||l==="zh-TW")d.setAttribute("lang",l)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-TW"
      data-theme="light"
      data-theme-pref="system"
      suppressHydrationWarning
      className={`${manrope.variable} ${geistMono.variable} ${notoTC.variable} ${notoJP.variable} ${notoKR.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
