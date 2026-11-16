import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { requiredChars } from "../../scripts/font-chars.mjs";

type Manifest = {
  families: Record<string, { chars: string; files: { file: string; weight: number; bytes: number }[] }>;
};

const manifest = JSON.parse(readFileSync(join(process.cwd(), "assets/fonts/manifest.json"), "utf8")) as Manifest;

describe("CJK subsets", () => {
  it("covers every non-Latin character the pages render", () => {
    const needed = requiredChars();
    const missing: string[] = [];
    for (const [id, chars] of Object.entries(needed)) {
      const have = new Set(manifest.families[id]?.chars ?? "");
      for (const ch of chars) {
        if (!have.has(ch)) missing.push(`${id} U+${ch.codePointAt(0)!.toString(16)} ${ch}`);
      }
    }
    expect(missing, "run npm run fonts").toEqual([]);
  });

  it("ships a regular and a bold file for each family, within the per-locale budget", () => {
    for (const id of ["NotoSansTC", "NotoSansJP", "NotoSansKR"]) {
      const weights = manifest.families[id].files.map((file) => file.weight).sort();
      expect(weights, id).toEqual([400, 700]);
      for (const file of manifest.families[id].files) {
        const bytes = readFileSync(join(process.cwd(), "assets/fonts", file.file)).length;
        expect(bytes, file.file).toBe(file.bytes);
        expect(bytes, file.file).toBeGreaterThan(1000);
      }
    }
    const sum = (id: string) => manifest.families[id].files.reduce((total, file) => total + file.bytes, 0);
    // 300 KB per locale including Latin. Subsets stay under 250 KB so Manrope still fits.
    expect(sum("NotoSansTC")).toBeLessThan(250 * 1024);
    expect(sum("NotoSansJP")).toBeLessThan(250 * 1024);
    expect(sum("NotoSansKR") + sum("NotoSansTC")).toBeLessThan(250 * 1024);
  });
});
