import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperienceList } from "@/components/islands/ExperienceList";
import { HanRun } from "@/components/ui/HanRun";
import { getDictionary } from "@/lib/i18n/get-dictionary";

describe("Han runs on translated pages", () => {
  it("leaves the Chinese page as plain text", () => {
    const { container } = render(<HanRun text="坤侑科技" locale="zh-TW" />);
    expect(container.querySelector("[lang]")).toBeNull();
    expect(container).toHaveTextContent("坤侑科技");
  });

  it("marks Han and keeps the page font on English, Japanese and Korean", () => {
    for (const locale of ["en", "ja", "ko"] as const) {
      const { container, unmount } = render(<HanRun text="MiTAC（神達電腦）" locale={locale} />);
      const han = container.querySelector("span");
      expect(han).toHaveAttribute("lang", "zh-Hant-TW");
      expect(han).toHaveClass("han-name");
      expect(han).toHaveTextContent("神達電腦");
      expect(container).toHaveTextContent("MiTAC（神達電腦）");
      unmount();
    }
  });

  it("marks an English company name inside the experience list", () => {
    const en = getDictionary("en");
    render(
      <ExperienceList
        locale="en"
        labels={{ more: en.experience.more, less: en.experience.less, tech: en.experience.tech }}
        items={[{ ...en.experience.items[1], period: "p", tech: ["Vue 3"] }]}
      />,
    );
    expect(screen.getByText("坤侑科技")).toHaveAttribute("lang", "zh-Hant-TW");
    expect(screen.getByText("坤侑科技")).toHaveClass("han-name");
  });
});
