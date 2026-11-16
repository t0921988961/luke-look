#!/usr/bin/env node
// Checks the size budgets in docs/plan.md §5.3 against a production build.
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const NEXT = join(process.cwd(), ".next");
const LIMITS = {
  jsInitial: 150 * 1024,
  jsAll: 230 * 1024,
  css: 25 * 1024,
  fonts: 300 * 1024,
};

// families: the CJK subsets that page actually uses. ko also needs TC for Han.
const PAGES = [
  { html: "index.html", manifest: "(zh)/page", families: ["NotoSansTC"] },
  { html: "en.html", manifest: "(en)/en/page", families: ["NotoSansTC"] },
  { html: "ja.html", manifest: "(ja)/ja/page", families: ["NotoSansJP"] },
  { html: "ko.html", manifest: "(ko)/ko/page", families: ["NotoSansKR", "NotoSansTC"] },
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const gzip = (file) => gzipSync(readFileSync(file), { level: 9 }).length;
const fromUrl = (urlPath) => join(NEXT, urlPath.split("/_next/")[1]);

function collectJs(html) {
  const initial = new Set();
  for (const tag of html.match(/<script\b[^>]*src="[^"]+\.js"[^>]*>/g) ?? []) {
    // nomodule polyfills are not downloaded by current browsers.
    if (/\bnoModule\b|\bnomodule\b/i.test(tag)) continue;
    initial.add(tag.match(/src="([^"]+)"/)[1]);
  }
  const all = new Set(initial);
  const queue = [...initial];
  while (queue.length) {
    const src = queue.pop();
    const text = readFileSync(fromUrl(src), "utf8");
    for (const match of text.matchAll(/(?:\/_next\/)?static\/chunks\/[\w.-]+\.js/g)) {
      const srcPath = match[0].startsWith("/_next/") ? match[0] : `/_next/${match[0]}`;
      if (!all.has(srcPath)) {
        all.add(srcPath);
        queue.push(srcPath);
      }
    }
  }
  return { initial, all };
}

function fontBytes(page, cssText) {
  const manifest = JSON.parse(readFileSync(join(NEXT, "server/app", page.manifest, "next-font-manifest.json"), "utf8"));
  const files = new Set();
  for (const list of Object.values(manifest.app ?? {})) {
    for (const file of list) files.add(join(NEXT, file));
  }
  for (const family of page.families) {
    for (const match of cssText.matchAll(new RegExp(`\\.\\./media/${family}-\\d+\\.[\\w.-]+\\.woff2`, "g"))) {
      files.add(join(NEXT, "static/media", match[0].split("/").pop()));
    }
  }
  let total = 0;
  for (const file of files) {
    if (!existsSync(file)) throw new Error(`missing font ${file}`);
    total += readFileSync(file).length;
  }
  return total;
}

if (!existsSync(join(NEXT, "server/app/index.html"))) {
  console.error("check-budgets: no build output. Run next build first.");
  process.exit(2);
}

const failures = [];
for (const page of PAGES) {
  const html = readFileSync(join(NEXT, "server/app", page.html), "utf8");
  const cssHrefs = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
  const cssText = cssHrefs.map((href) => readFileSync(fromUrl(href), "utf8")).join("\n");
  const { initial, all } = collectJs(html);
  const rows = [
    ["JS before interaction", [...initial].reduce((sum, src) => sum + gzip(fromUrl(src)), 0), LIMITS.jsInitial],
    ["JS after idle", [...all].reduce((sum, src) => sum + gzip(fromUrl(src)), 0), LIMITS.jsAll],
    ["CSS", cssHrefs.reduce((sum, href) => sum + gzip(fromUrl(href)), 0), LIMITS.css],
    ["Fonts", fontBytes(page, cssText), LIMITS.fonts],
  ];
  console.log(`\n${page.html}`);
  for (const [label, bytes, limit] of rows) {
    const ok = bytes <= limit;
    console.log(`  ${ok ? "ok " : "OVER"} ${label}: ${kb(bytes)} / ${kb(limit)}`);
    if (!ok) failures.push(`${page.html} ${label} is ${kb(bytes)} (limit ${kb(limit)})`);
  }
}

if (failures.length) {
  console.error("\ncheck-budgets failed:");
  for (const failure of failures) console.error("  " + failure);
  process.exit(1);
}
console.log("\ncheck-budgets: OK");
