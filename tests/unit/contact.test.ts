import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { getEmailAddress, getMailtoHref } from "@/lib/contact";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("lib/contact", () => {
  it("assembles the +portfolio alias", () => {
    expect(getEmailAddress()).toBe(["t0921988961", "+portfolio", "@", "gmail.com"].join(""));
    expect(getMailtoHref()).toBe("mailto:" + getEmailAddress());
  });

  it("is imported only by client components", () => {
    const root = process.cwd();
    const importers = ["app", "components", "lib"]
      .flatMap((d) => sourceFiles(join(root, d)))
      .filter((f) => /from ["']@\/lib\/contact["']/.test(readFileSync(f, "utf8")));
    expect(importers.length).toBeGreaterThan(0);
    for (const file of importers) {
      expect(readFileSync(file, "utf8").trimStart().startsWith('"use client"'), relative(root, file)).toBe(true);
    }
  });
});
