import { describe, expect, it } from "vitest";
import { tokenize } from "@/lib/tokenize";

describe("tokenize", () => {
  it("splits Chinese per character and keeps closing punctuation attached", () => {
    expect(tokenize("讓複雜的系統，", "zh-TW")).toEqual(["讓", "複", "雜", "的", "系", "統，"]);
    expect(tokenize("變得清楚好用。", "zh-TW").at(-1)).toBe("用。");
  });

  it("keeps Latin runs together inside CJK text", () => {
    expect(tokenize("熟悉 Vue 3", "zh-TW")).toEqual(["熟", "悉", " ", "Vue", " ", "3"]);
    expect(tokenize("Vue3", "ja")).toEqual(["Vue3"]);
  });

  it("attaches opening brackets to the following character", () => {
    expect(tokenize("（Luke）", "zh-TW")).toEqual(["（Luke）"]);
    expect(tokenize("「好」", "ja")).toEqual(["「好」"]);
  });

  it("splits spaced scripts by word and keeps the spaces", () => {
    expect(tokenize("Let’s talk.", "en")).toEqual(["Let’s", " ", "talk."]);
    expect(tokenize("복잡한 시스템을", "ko")).toEqual(["복잡한", " ", "시스템을"]);
  });

  it("keeps a trailing opening bracket", () => {
    expect(tokenize("好（", "zh-TW")).toEqual(["好", "（"]);
  });
});
