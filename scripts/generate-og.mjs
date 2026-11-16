#!/usr/bin/env node
// Renders the four Open Graph images. Run with `npm run og` after the name or tagline changes.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const OUT = join(process.cwd(), "public/og");
const fileUrl = (name) => pathToFileURL(join(process.cwd(), "assets/fonts", name)).href;

const pages = [
  { file: "zh-TW.png", lang: "zh-Hant", fonts: ["NotoSansTC-700.woff2"], eyebrow: "前端工程師 · 台北", title: "讓複雜的系統，\n變得清楚好用。" },
  { file: "en.png", lang: "en", fonts: ["NotoSansTC-700.woff2"], eyebrow: "Front-end engineer · Taipei", title: "Making complex systems\nfeel clear and easy to use." },
  { file: "ja.png", lang: "ja", fonts: ["NotoSansJP-700.woff2", "NotoSansTC-700.woff2"], eyebrow: "フロントエンドエンジニア · 台北", title: "複雑なシステムを、\nわかりやすく使いやすく。" },
  { file: "ko.png", lang: "ko", fonts: ["NotoSansKR-700.woff2", "NotoSansTC-700.woff2"], eyebrow: "프론트엔드 엔지니어 · 타이베이", title: "복잡한 시스템을\n명확하고 쓰기 쉽게." },
];

function html(page) {
  const faces = page.fonts
    .map((name, i) => `@font-face { font-family: "Noto ${i}"; src: url("${fileUrl(name)}") format("woff2"); font-weight: 700; }`)
    .join("\n");
  const family = page.fonts.map((_, i) => `"Noto ${i}"`).join(", ");
  return `<!doctype html><html lang="${page.lang}"><head><meta charset="utf-8"><style>
    ${faces}
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1200px; height: 630px; }
    body {
      font-family: ${family}, sans-serif;
      background:
        radial-gradient(60% 70% at 80% 100%, rgba(255,150,110,.35), transparent 60%),
        linear-gradient(180deg, #f7f6f2 0%, #e7ecfb 100%);
      color: #0b1430;
      padding: 72px 80px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    p { margin: 0; letter-spacing: .14em; text-transform: uppercase; color: #2456f0; font-size: 22px; }
    h1 { margin: 18px 0 0; font-size: 76px; line-height: 1.15; font-weight: 700; white-space: pre-line; max-width: 16em; }
    .name { margin-top: 28px; font-size: 28px; color: #27324f; letter-spacing: 0; text-transform: none; }
  </style></head><body>
    <p>${page.eyebrow}</p>
    <h1>${page.title}</h1>
    <p class="name">鄭宏璋 · Luke Cheng</p>
  </body></html>`;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const page of pages) {
  const tab = await context.newPage();
  await tab.setContent(html(page), { waitUntil: "load" });
  const png = await tab.screenshot({ type: "png" });
  writeFileSync(join(OUT, page.file), png);
  await tab.close();
  console.log(page.file, png.length);
}
await browser.close();
