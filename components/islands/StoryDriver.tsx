"use client";

import { onLoopsChange } from "@/lib/motion";
import {
  NARROW_ROUTE,
  STORY_PLAY_MS,
  WIDE_ROUTE,
  clamp01,
  easeInOut,
  morphCurve,
  stationAt,
  storyMotionOn,
  trackProgress,
} from "@/lib/story";

const COUNT = WIDE_ROUTE.stops.length;
const STICKY_TOP = 84;
type Phase = "idle" | "playing" | "done";

function paint(scene: HTMLElement, progress: number) {
  const clamped = clamp01(progress);
  scene.style.setProperty("--story-p", clamped.toFixed(4));
  const wide = window.matchMedia("(min-width: 768px)").matches;
  scene.querySelectorAll<SVGGElement>("[data-traveler]").forEach((g) => {
    const svg = g.closest("svg");
    const path = svg?.querySelector<SVGPathElement>("[data-route]");
    const blob = g.querySelector("path");
    if (!path || typeof path.getTotalLength !== "function") return;
    const len = path.getTotalLength();
    if (!len) return;
    const pt = path.getPointAtLength(Math.min(len, len * clamped));
    g.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) scale(${g.dataset.scale ?? "1"})`);
    const stops = svg?.dataset.layout === "narrow" ? NARROW_ROUTE.stops : WIDE_ROUTE.stops;
    blob?.setAttribute("d", morphCurve(clamped, stops));
  });
  return stationAt(clamped, (wide ? WIDE_ROUTE : NARROW_ROUTE).stops);
}

function showStation(track: HTMLElement, index: number) {
  track.querySelectorAll<SVGGElement>(".story-station").forEach((node) => {
    const nodes = [...node.parentElement!.querySelectorAll<SVGGElement>(":scope > .story-station")];
    const i = nodes.indexOf(node);
    if (i <= index) node.setAttribute("data-on", "true");
    else node.removeAttribute("data-on");
    if (i === index) node.setAttribute("data-current", "true");
    else node.removeAttribute("data-current");
  });
  track.querySelectorAll<HTMLElement>(".story-stage").forEach((stage, i) => {
    stage.dataset.current = i === index ? "true" : "false";
    const button = stage.querySelector("button");
    if (!button) return;
    if (i === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  const line = track.querySelectorAll(".story-stage p")[index]?.textContent ?? "";
  const live = track.querySelector("[data-story-live]");
  if (live) live.textContent = line;
}

/** Scroll, play and keyboard control for the server-rendered career story. */
export function startStory(): () => void {
  const track = document.getElementById("journey");
    const scene = track?.querySelector<HTMLElement>(".story-scene");
    const playButton = track?.querySelector<HTMLButtonElement>("[data-story-play]");
    if (!track || !scene || !playButton) return () => {};

    let playing = false;
    let playRaf = 0;
    let scrollRaf = 0;
    let userLock = false;
    let lockY = 0;
    let stationNow = -1;
    let phaseNow: Phase = "idle";
    const progress = { v: 1 };

    const syncPhase = (next: Phase) => {
      if (next === phaseNow) return;
      phaseNow = next;
      const label = next === "playing" ? playButton.dataset.pause : next === "done" ? playButton.dataset.replay : playButton.dataset.play;
      if (label) playButton.textContent = label;
      playButton.setAttribute("aria-pressed", next === "playing" ? "true" : "false");
    };
    const apply = (p: number) => {
      progress.v = clamp01(p);
      const index = paint(scene, progress.v);
      if (index !== stationNow) {
        stationNow = index;
        showStation(track, index);
      }
      syncPhase(playing ? "playing" : progress.v > 0.985 ? "done" : "idle");
    };
    const measure = () => {
      const rect = track.getBoundingClientRect();
      return trackProgress(rect.top, rect.height, window.innerHeight, STICKY_TOP);
    };
    const stopPlay = () => {
      playing = false;
      cancelAnimationFrame(playRaf);
    };
    const startPlay = (from: number) => {
      if (!storyMotionOn()) return;
      stopPlay();
      playing = true;
      userLock = true;
      lockY = window.scrollY;
      const origin = clamp01(from);
      const t0 = performance.now();
      const frame = (now: number) => {
        if (!playing || !storyMotionOn()) {
          stopPlay();
          syncPhase(progress.v > 0.985 ? "done" : "idle");
          return;
        }
        const t = Math.min(1, (now - t0) / STORY_PLAY_MS);
        apply(origin + (1 - origin) * easeInOut(t));
        if (t < 1) playRaf = requestAnimationFrame(frame);
        else {
          playing = false;
          syncPhase("done");
        }
      };
      syncPhase("playing");
      playRaf = requestAnimationFrame(frame);
    };
    const seek = (index: number) => {
      const next = Math.min(COUNT - 1, Math.max(0, index));
      if (!storyMotionOn()) {
        stationNow = next;
        showStation(track, next);
        return;
      }
      stopPlay();
      userLock = true;
      lockY = window.scrollY;
      const wide = window.matchMedia("(min-width: 768px)").matches;
      apply((wide ? WIDE_ROUTE : NARROW_ROUTE).stops[next] ?? 0);
    };

    const onClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const station = target.closest<HTMLElement>("[data-story-seek]");
      if (station) {
        seek(Number(station.dataset.storySeek));
        return;
      }
      if (target.closest("[data-story-play]")) {
        if (!storyMotionOn()) return;
        if (playing) {
          stopPlay();
          syncPhase(progress.v > 0.985 ? "done" : "idle");
          return;
        }
        startPlay(progress.v > 0.985 ? 0 : progress.v);
      }
    };
    const onKey = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const station = target.closest<HTMLElement>("[data-story-seek]");
      if (!station) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const dir = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const next = Math.min(COUNT - 1, Math.max(0, Number(station.dataset.storySeek) + dir));
      seek(next);
      track.querySelector<HTMLButtonElement>(`[data-story-seek="${next}"]`)?.focus();
    };
    const onScroll = () => {
      if (!storyMotionOn() || playing) return;
      if (userLock) {
        if (Math.abs(window.scrollY - lockY) < 28) return;
        userLock = false;
      }
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        if (!playing) apply(measure());
      });
    };
    const kick = () => {
      if (!storyMotionOn()) {
        stopPlay();
        userLock = false;
        apply(1);
        return;
      }
      if (!playing && !userLock) apply(measure());
    };

    kick();
    scene.dataset.ready = "true";
    document.documentElement.dataset.story = "on";
    track.addEventListener("click", onClick);
    track.addEventListener("keydown", onKey);
    const unsub = onLoopsChange(kick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", kick);
    const onHide = () => {
      if (!document.hidden) return;
      stopPlay();
      syncPhase(progress.v > 0.985 ? "done" : "idle");
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      stopPlay();
      cancelAnimationFrame(scrollRaf);
      track.removeEventListener("click", onClick);
      track.removeEventListener("keydown", onKey);
      unsub();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", kick);
      document.removeEventListener("visibilitychange", onHide);
    };
}
