#!/usr/bin/env node
// Downloads exact-glyph WOFF2 subsets from the Google Fonts CSS API and writes
// them to assets/fonts/. The site build never calls Google; it uses these files.
// Run `npm run fonts` after adding Chinese, Japanese or Korean characters.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { requiredChars } from "./font-chars.mjs";

const OUT = join(process.cwd(), "assets/fonts");
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const FAMILIES = {
  NotoSansTC: "Noto Sans TC",
  NotoSansJP: "Noto Sans JP",
  NotoSansKR: "Noto Sans KR",
};

function parseFaces(css) {
  const faces = [];
  for (const block of css.split("@font-face").slice(1)) {
    const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
    const url = block.match(/url\(([^)]+)\)/)?.[1];
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1] ?? "";
    if (weight && url) faces.push({ weight, url, range });
  }
  return faces;
}

function missingChars(range, chars) {
  const intervals = [];
  for (const part of range.split(",")) {
    const match = part.trim().match(/U\+([0-9a-f]+)(?:-([0-9a-f]+))?/i);
    if (!match) continue;
    intervals.push([parseInt(match[1], 16), match[2] ? parseInt(match[2], 16) : parseInt(match[1], 16)]);
  }
  return [...chars].filter((ch) => {
    const cp = ch.codePointAt(0);
    return !intervals.some(([start, end]) => cp >= start && cp <= end);
  });
}

async function fetchWeight(familyName, weight, chars) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName)}:wght@${weight}&text=${encodeURIComponent(chars)}`;
  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  if (!cssRes.ok) throw new Error(`${familyName} ${weight}: CSS ${cssRes.status}`);
  const faces = parseFaces(await cssRes.text());
  if (!faces.length) throw new Error(`${familyName} ${weight}: no font file returned`);
  const missing = missingChars(faces.map((face) => face.range).join(","), chars);
  if (missing.length) {
    throw new Error(`${familyName} ${weight} is missing ${missing.length} characters: ${missing.slice(0, 40).join("")}`);
  }
  return faces;
}

mkdirSync(OUT, { recursive: true });
const needed = requiredChars();
const manifest = { families: {} };

for (const [id, familyName] of Object.entries(FAMILIES)) {
  const chars = needed[id];
  console.log(`\n${familyName}: ${chars.length} characters`);
  const files = [];
  for (const weight of [400, 700]) {
    // Request each weight on its own. A combined request returns one file for both.
    const faces = await fetchWeight(familyName, weight, chars);
    for (const [index, face] of faces.entries()) {
      const file = `${id}-${weight}${faces.length > 1 ? `-${index + 1}` : ""}.woff2`;
      const bin = await fetch(face.url);
      if (!bin.ok) throw new Error(`${face.url}: ${bin.status}`);
      const buf = Buffer.from(await bin.arrayBuffer());
      writeFileSync(join(OUT, file), buf);
      files.push({ file, weight, bytes: buf.length });
      console.log(`${file}  ${(buf.length / 1024).toFixed(1)} KB`);
    }
  }
  manifest.families[id] = { chars, files };
}

const ofl = await fetch("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE");
if (!ofl.ok) throw new Error(`OFL: ${ofl.status}`);
writeFileSync(join(OUT, "OFL.txt"), await ofl.text());
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("\nwrote assets/fonts");
