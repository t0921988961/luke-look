#!/usr/bin/env node
// Fails when the contact address leaks into anything a crawler can read
// without clicking: built HTML, RSC payloads, JS/CSS chunks, metadata routes
// and public/. See docs/plan.md §10.6.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = [".next", "public"];
const SKIP_DIRS = new Set(["cache", "trace", "diagnostics", "types", "dev"]);
const TEXT_EXT = new Set([".html", ".rsc", ".txt", ".body", ".meta", ".json", ".js", ".mjs", ".css", ".xml", ".webmanifest", ".svg"]);

const EVERYWHERE = [/t0921988961@/i, /t0921988961\+[a-z]*@/i, /t0921988961%40/i, /t0921988961%2B/i, /@gmail\.com/i, /gmail%2Ecom/i];
// JS may contain the bare mailto: prefix (the reveal island builds the link on click).
const MARKUP_ONLY = [/mailto:/i];
const MARKUP_EXT = new Set([".html", ".rsc", ".txt", ".body", ".meta", ".xml", ".json", ".webmanifest", ".svg"]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(path);
    } else if (TEXT_EXT.has(extname(name)) || name.endsWith(".segment.rsc")) {
      yield path;
    }
  }
}

const problems = [];
let scanned = 0;
for (const target of TARGETS) {
  const dir = join(ROOT, target);
  if (!existsSync(dir)) {
    if (target === ".next") {
      console.error("check-no-email: .next not found. Run `next build` first.");
      process.exit(2);
    }
    continue;
  }
  for (const file of walk(dir)) {
    scanned++;
    const text = readFileSync(file, "utf8");
    const rules = MARKUP_EXT.has(extname(file)) ? [...EVERYWHERE, ...MARKUP_ONLY] : EVERYWHERE;
    for (const rule of rules) {
      const m = text.match(rule);
      if (m) {
        const at = m.index ?? 0;
        problems.push(`${relative(ROOT, file)}: ${rule} … ${JSON.stringify(text.slice(Math.max(0, at - 40), at + 40))}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`check-no-email: the contact address is exposed in ${problems.length} place(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`check-no-email: OK (${scanned} files scanned, no plain address and no mailto: in markup).`);
