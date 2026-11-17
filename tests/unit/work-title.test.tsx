import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Work } from "@/components/sections/Work";
import { getDictionary } from "@/lib/i18n/get-dictionary";

describe("featured title", () => {
  it("breaks the Japanese title only before プラットフォーム", () => {
    const ja = getDictionary("ja");
    expect(ja.work.featured.title).toBe("VisionMax フリート管理\u200bプラットフォーム");
    for (const locale of ["zh-TW", "en", "ko"] as const) {
      expect(getDictionary(locale).work.featured.title).not.toContain("\u200b");
    }

    render(<Work t={ja.work} locale="ja" />);
    const title = screen.getByRole("heading", { level: 3, name: "VisionMax フリート管理プラットフォーム" });
    expect(title.querySelector("wbr")).not.toBeNull();
    expect(title.textContent).toBe("VisionMax フリート管理プラットフォーム");
  });
});
