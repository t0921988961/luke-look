import { describe, expect, it } from "vitest";
import { setMedia } from "./setup";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PERIODS } from "@/lib/site";
import {
  NARROW_POINTS,
  NARROW_ROUTE,
  STORY_SHAPES,
  WIDE_POINTS,
  WIDE_ROUTE,
  buildRoute,
  clamp01,
  curveToPath,
  easeInOut,
  morphCurve,
  stationAt,
  storyMotionOn,
  trackProgress,
} from "@/lib/story";

describe("career story geometry", () => {
  it("clamps progress and ignores non-finite numbers", () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(1.4)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
  });

  it("builds a curve that visits every station", () => {
    for (const points of [WIDE_POINTS, NARROW_POINTS]) {
      const route = buildRoute(points);
      expect(route.stops).toHaveLength(points.length);
      expect(route.stops[0]).toBe(0);
      expect(route.stops.at(-1)).toBeCloseTo(1, 5);
      for (let i = 1; i < route.stops.length; i++) expect(route.stops[i]).toBeGreaterThan(route.stops[i - 1]);
      expect(route.d.startsWith(`M ${points[0].x} ${points[0].y}`)).toBe(true);
      for (const pt of points.slice(1)) expect(route.d).toContain(`${pt.x} ${pt.y}`);
    }
    expect(WIDE_ROUTE.d).toBe(buildRoute(WIDE_POINTS).d);
    expect(NARROW_ROUTE.stops).toEqual(buildRoute(NARROW_POINTS).stops);
  });

  it("maps scroll position through a sticky track", () => {
    expect(trackProgress(88, 1000, 800, 88)).toBe(0);
    expect(trackProgress(88 - 144, 1000, 800, 88)).toBeCloseTo(0.5, 5);
    expect(trackProgress(88 - 288, 1000, 800, 88)).toBe(1);
    expect(trackProgress(0, 100, 900, 88)).toBe(1);
  });

  it("highlights the station the traveler has reached", () => {
    const stops = [0, 0.25, 0.5, 0.75, 1];
    expect(stationAt(0, stops)).toBe(0);
    expect(stationAt(0.24, stops)).toBe(0);
    expect(stationAt(0.25, stops)).toBe(1);
    expect(stationAt(1, stops)).toBe(4);
    expect(stationAt(-1, stops)).toBe(0);
  });

  it("morphs between equal-length shapes and finishes on the last one", () => {
    for (const shape of STORY_SHAPES) expect(shape).toHaveLength(STORY_SHAPES[0].length);
    const stops = WIDE_ROUTE.stops;
    expect(morphCurve(0, stops)).toBe(curveToPath(STORY_SHAPES[0]));
    expect(morphCurve(1, stops)).toBe(curveToPath(STORY_SHAPES[STORY_SHAPES.length - 1]));
    const mid = morphCurve((stops[0] + stops[1]) / 2, stops);
    expect(mid.startsWith("M ")).toBe(true);
    expect(mid).not.toBe(curveToPath(STORY_SHAPES[0]));
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 5);
  });

  it("follows the pause toggle and reduced motion", () => {
    expect(storyMotionOn()).toBe(false);
    document.documentElement.dataset.loops = "on";
    expect(storyMotionOn()).toBe(true);
    setMedia("(prefers-reduced-motion: reduce)", true);
    expect(storyMotionOn()).toBe(false);
    setMedia("(prefers-reduced-motion: reduce)", false);
    document.documentElement.dataset.loops = "off";
    expect(storyMotionOn()).toBe(false);
  });

  it("tells five résumé chapters, oldest first, with product scale on the last", () => {
    expect(getDictionary("zh-TW").story.stages.map((s) => s.mark)).toEqual(["佳因企業", "巧禾數位", "金寶電子", "坤侑科技", "神達電腦"]);
    expect(ORDER_FROM).toEqual(["2015/10", "2018/08", "2019/07", "2022/03", "2023/05"]);
    expect(getDictionary("zh-TW").story.stages[4].line).toMatch(/訂閱/);
    expect(getDictionary("en").story.stages[4].line).toMatch(/subscriptions/i);
    expect(getDictionary("zh-TW").story.stages.join(" ")).not.toMatch(/WebRTC|GitHub/i);
  });
});

const ORDER_FROM = [...PERIODS].reverse().map((p) => p.from);
