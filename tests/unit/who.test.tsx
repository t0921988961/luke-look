import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/Hero";
import { WhoMark } from "@/components/sections/WhoMark";
import { getDictionary } from "@/lib/i18n/get-dictionary";

describe("who mark", () => {
  it("draws the shared name and a role stroke, and stays decorative", () => {
    const { container } = render(<WhoMark />);
    const mark = container.querySelector(".who-mark");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(".who-name")).toHaveLength(9);
    expect(container.querySelectorAll(".who-role")).toHaveLength(2);
    expect(container.querySelectorAll(".who-shape")).toHaveLength(3);
    expect(container.textContent?.trim()).toBe("");
  });

  it("sits beside the localized greeting in every locale", () => {
    for (const locale of ["zh-TW", "en", "ja", "ko"] as const) {
      const t = getDictionary(locale);
      const { container, unmount } = render(<Hero t={t.hero} locale={locale} />);
      expect(container.querySelector(".who-mark")).toBeTruthy();
      expect(container.textContent).toContain(t.hero.greeting);
      unmount();
    }
  });

  it("is fully drawn and still when motion is reduced", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toMatch(/\.who-name,\s*\.who-role\s*\{[^}]*stroke-dashoffset:\s*0/);
    expect(block).toContain(".who-shape");
  });
});
