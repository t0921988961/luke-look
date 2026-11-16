import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailReveal } from "@/components/islands/EmailReveal";
import { ExperienceList } from "@/components/islands/ExperienceList";
import { LanguageSwitch } from "@/components/islands/LanguageSwitch";
import { SiteHeader } from "@/components/islands/SiteHeader";
import { ThemeSwitch } from "@/components/islands/ThemeSwitch";
import { getDictionary, getLanguageLabels } from "@/lib/i18n/get-dictionary";
import { THEME_KEY } from "@/lib/theme";

const zh = getDictionary("zh-TW");
const ADDRESS = ["t0921988961", "+portfolio", "@", "gmail.com"].join("");

describe("ThemeSwitch", () => {
  it("is a radiogroup with one tabbable, checked option", () => {
    render(<ThemeSwitch labels={zh.nav} />);
    const group = screen.getByRole("radiogroup", { name: "主題" });
    const radios = screen.getAllByRole("radio");
    expect(group).toBeInTheDocument();
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("saves a click and moves with arrow keys", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch labels={zh.nav} />);
    await user.click(screen.getByRole("radio", { name: "深色" }));
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
    expect(screen.getByRole("radio", { name: "跟隨系統" })).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(screen.getByRole("radio", { name: "跟隨系統" })).toHaveFocus();
  });
});

describe("LanguageSwitch", () => {
  it("links to every locale with hreflang and lang, marking the current page", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch current="en" labels={getLanguageLabels()} buttonLabel="EN, change language" />);
    const button = screen.getByRole("button", { name: "EN, change language" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/", "/en", "/ja", "/ko"]);
    expect(links.map((a) => a.getAttribute("lang"))).toEqual(["zh-Hant-TW", "en", "ja", "ko"]);
    expect(links.map((a) => a.getAttribute("hreflang"))).toEqual(["zh-TW", "en", "ja", "ko"]);
    expect(screen.getByRole("link", { current: "page" })).toHaveAttribute("href", "/en");

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("remembers the chosen language in a cookie", () => {
    render(<LanguageSwitch current="zh-TW" labels={getLanguageLabels()} buttonLabel="繁中，切換語言" />);
    const ja = screen.getAllByRole("link", { hidden: true }).find((a) => a.getAttribute("href") === "/ja")!;
    ja.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(ja);
    expect(document.cookie).toContain("NEXT_LOCALE=ja");
  });
});

describe("EmailReveal", () => {
  it("renders no address and no mailto until asked", () => {
    const { container } = render(<EmailReveal labels={zh.contact} />);
    expect(container.innerHTML).not.toContain("gmail");
    expect(container.innerHTML).not.toContain("mailto:");
    expect(screen.getByRole("button", { name: "顯示 Email" })).toHaveAttribute("aria-expanded", "false");
  });

  it("reveals the +portfolio address, focuses Copy, and copies it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<EmailReveal labels={zh.contact} />);

    await user.click(screen.getByRole("button", { name: "顯示 Email" }));
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /寄信/ })).toHaveAttribute("href", `mailto:${ADDRESS}`);
    const copy = screen.getByRole("button", { name: "複製" });
    expect(copy).toHaveFocus();
    expect(screen.getByRole("button", { name: "隱藏 Email" })).toHaveAttribute("aria-expanded", "true");

    await user.click(copy);
    expect(writeText).toHaveBeenCalledWith(ADDRESS);
    expect(await screen.findByRole("button", { name: "已複製" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "隱藏 Email" }));
    expect(screen.queryByText(ADDRESS)).not.toBeInTheDocument();
  });

  it("selects the address when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    render(<EmailReveal labels={zh.contact} />);
    await user.click(screen.getByRole("button", { name: "顯示 Email" }));
    await user.click(screen.getByRole("button", { name: "複製" }));
    expect(window.getSelection()?.toString()).toBe(ADDRESS);
  });
});

describe("ExperienceList", () => {
  const items = zh.experience.items.slice(0, 2).map((item, i) => ({ ...item, period: `p${i}`, tech: ["Vue 3"] }));
  const labels = { more: zh.experience.more, less: zh.experience.less, tech: zh.experience.tech };

  it("opens the first role and toggles one panel at a time", async () => {
    const user = userEvent.setup();
    render(<ExperienceList items={items} labels={labels} />);
    const [first, second] = screen.getAllByRole("button");
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("exp-panel-1")).toHaveAttribute("inert");

    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("exp-panel-1")).not.toHaveAttribute("inert");
  });
});

describe("SiteHeader mobile menu", () => {
  function renderPage() {
    return render(
      <>
        <SiteHeader locale="zh-TW" labels={zh.nav} languageLabels={getLanguageLabels()} />
        <main id="main">
          <a href="#about">content</a>
        </main>
        <footer id="site-footer" />
      </>,
    );
  }

  it("makes the page inert, locks scroll, and restores focus on Escape", async () => {
    const user = userEvent.setup();
    renderPage();
    const toggle = screen.getByRole("button", { name: "選單" });
    const panel = document.getElementById("mobile-menu")!;
    expect(panel).toHaveAttribute("inert");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("inert");
    expect(document.getElementById("main")!.inert).toBe(true);
    expect(document.getElementById("site-footer")!.inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(panel.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("main")!.inert).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(toggle).toHaveFocus();
  });

  it("closes when a section link is chosen", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "選單" }));
    const link = screen.getAllByRole("link", { name: /工作經歷|經歷/ }).find((a) => a.closest("#mobile-menu"))!;
    link.addEventListener("click", (e) => e.preventDefault());
    await act(async () => link.click());
    expect(screen.getByRole("button", { name: "選單" })).toHaveAttribute("aria-expanded", "false");
  });
});
