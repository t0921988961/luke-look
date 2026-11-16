import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { startStory } from "@/components/islands/StoryDriver";
import { CareerStory } from "@/components/sections/CareerStory";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const zh = getDictionary("zh-TW");
let stop = () => {};

function mount() {
  render(<CareerStory t={zh.story} present={zh.experience.present} />);
  act(() => {
    stop = startStory();
  });
}

afterEach(() => stop());

describe("CareerStory", () => {
  it("renders every chapter and keeps the route available without motion", async () => {
    const user = userEvent.setup();
    mount();

    expect(screen.getByRole("heading", { name: "一路走來" })).toBeInTheDocument();
    const journey = document.getElementById("journey")!;
    const station = (name: RegExp) => {
      const match = [...journey.querySelectorAll("button")].find((button) => name.test(button.textContent ?? ""));
      if (!match) throw new Error(`missing ${name}`);
      return match;
    };
    expect(journey.querySelectorAll("button[data-story-seek]")).toHaveLength(5);
    expect(station(/神達電腦/)).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("link", { name: "完整經歷 · 佳因企業" })).toHaveAttribute("href", "#role-4");
    expect(screen.getByRole("link", { name: "完整經歷 · 神達電腦" })).toHaveAttribute("href", "#role-0");

    await user.click(station(/佳因企業/));
    expect(station(/佳因企業/)).toHaveAttribute("aria-current", "step");

    await user.keyboard("{ArrowDown}");
    expect(station(/巧禾數位/)).toHaveFocus();
    expect(station(/巧禾數位/)).toHaveAttribute("aria-current", "step");
  });

  it("plays and pauses when motion is allowed", async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.loops = "on";
    mount();

    const play = await screen.findByRole("button", { name: /播放這段經歷|再看一次/ });
    await user.click(play);
    expect(screen.getByRole("button", { name: "暫停" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "暫停" }));
    expect(screen.getByRole("button", { name: /播放這段經歷|再看一次/ })).toHaveAttribute("aria-pressed", "false");
  });
});
