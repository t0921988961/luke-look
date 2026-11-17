import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skills } from "@/components/sections/Skills";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SKILL_GROUPS } from "@/lib/site";

describe("skills", () => {
  it("shows the five résumé groups at equal weight, with no proficiency score", () => {
    const zh = getDictionary("zh-TW");
    const { container } = render(<Skills t={zh.skills} locale="zh-TW" />);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent ?? "");
    for (const name of zh.skills.groups) expect(headings.some((h) => h.includes(name))).toBe(true);
    expect(container.querySelectorAll(".skill-node")).toHaveLength(zh.skills.groups.length);
    expect(SKILL_GROUPS).toHaveLength(5);
    expect(container.textContent).not.toMatch(/%|熟練|proficiency|習熟度|숙련/);
    expect(container.textContent).not.toMatch(/華夏|學歷|Education|学歴|학력|Hwa Hsia|電子工程|電子工学|전자공학/);
    expect(screen.getByText("中文")).toBeInTheDocument();
    for (const locale of ["zh-TW", "en", "ja", "ko"] as const) {
      const text = JSON.stringify(getDictionary(locale));
      expect(text).not.toMatch(/eduTitle|Hwa Hsia|華夏|学歴|학력|電子工程|電子工学|전자공학/);
    }
  });
});
