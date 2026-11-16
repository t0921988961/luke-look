// Characters each CJK subset has to cover. Shared by `npm run fonts` and the unit test.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name === "design" || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (/\.(tsx?|css)$/.test(name)) files.push(path);
  }
  return files;
}

function stringLiterals(source) {
  const out = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = re.exec(source))) out.push(match[2]);
  return out;
}

function isHangul(cp) {
  return (cp >= 0x1100 && cp <= 0x11ff) || (cp >= 0x3130 && cp <= 0x318f) || (cp >= 0xac00 && cp <= 0xd7af);
}

function isKana(cp) {
  return (cp >= 0x3040 && cp <= 0x30ff) || cp === 0x30fb || (cp >= 0x31f0 && cp <= 0x31ff) || cp === 0xff65;
}

/** @returns {Record<"NotoSansTC" | "NotoSansJP" | "NotoSansKR", string>} */
export function requiredChars() {
  const tc = new Set();
  const jp = new Set();
  const kr = new Set();
  const files = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components")), ...walk(join(ROOT, "lib"))];
  for (const file of files) {
    const japaneseFile = relative(ROOT, file).endsWith("dictionaries/ja.ts");
    const text = stringLiterals(readFileSync(file, "utf8")).join("");
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp < 0x80) continue;
      if (isHangul(cp)) kr.add(ch);
      else if (isKana(cp) || japaneseFile) jp.add(ch);
      else tc.add(ch);
    }
  }
  const sort = (set) => [...set].sort().join("");
  return { NotoSansTC: sort(tc), NotoSansJP: sort(jp), NotoSansKR: sort(kr) };
}
