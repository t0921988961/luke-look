/** Geometry and timing for the career-story route. Pure functions, no DOM. */

export type Pt = { x: number; y: number };

export const STORY_PLAY_MS = 7600;

/** Desktop route. viewBox 0 0 1200 400. */
export const WIDE_POINTS: readonly Pt[] = [
  { x: 96, y: 262 },
  { x: 318, y: 118 },
  { x: 590, y: 268 },
  { x: 860, y: 112 },
  { x: 1104, y: 214 },
];

/** Phone route. viewBox 0 0 360 410. */
export const NARROW_POINTS: readonly Pt[] = [
  { x: 78, y: 40 },
  { x: 262, y: 118 },
  { x: 92, y: 196 },
  { x: 268, y: 278 },
  { x: 120, y: 360 },
];

const SAMPLES = 24;

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function cubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

function hypot(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Smooth open curve through every point, plus each vertex's fraction of the length. */
export function buildRoute(points: readonly Pt[]): { d: string; stops: number[] } {
  if (points.length < 2) return { d: "", stops: [0] };
  const cmds = [`M ${points[0].x} ${points[0].y}`];
  let length = 0;
  const atVertex = [0];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = {
      x: Math.round((p1.x + (p2.x - p0.x) / 6) * 100) / 100,
      y: Math.round((p1.y + (p2.y - p0.y) / 6) * 100) / 100,
    };
    const c2 = {
      x: Math.round((p2.x - (p3.x - p1.x) / 6) * 100) / 100,
      y: Math.round((p2.y - (p3.y - p1.y) / 6) * 100) / 100,
    };
    cmds.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`);
    let prev = p1;
    for (let s = 1; s <= SAMPLES; s++) {
      const pt = cubic(p1, c1, c2, p2, s / SAMPLES);
      length += hypot(prev, pt);
      prev = pt;
    }
    atVertex.push(length);
  }
  const stops = atVertex.map((v) => (length === 0 ? 0 : v / length));
  return { d: cmds.join(" "), stops };
}

export const WIDE_ROUTE = buildRoute(WIDE_POINTS);
export const NARROW_ROUTE = buildRoute(NARROW_POINTS);

/**
 * 0 when the track top sits on the sticky line, 1 when the track has scrolled
 * through. A track shorter than the viewport is already complete.
 */
export function trackProgress(trackTop: number, trackHeight: number, viewHeight: number, stickyTop: number): number {
  const travel = trackHeight - viewHeight + stickyTop;
  if (!(travel > 0)) return 1;
  return clamp01((stickyTop - trackTop) / travel);
}

/** Index of the last station the traveler has reached. */
export function stationAt(progress: number, stops: readonly number[]): number {
  const p = clamp01(progress);
  let index = 0;
  for (let i = 0; i < stops.length; i++) {
    if (p + 1e-4 >= stops[i]) index = i;
  }
  return index;
}

export function easeInOut(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

/**
 * Closed shapes with the same command count so they can be blended.
 * Order matches the stations: page, spark, dashboard, pin, console.
 */
export const STORY_SHAPES: readonly (readonly number[])[] = [
  [0, -16, 8.84, -16, 16, -8.84, 16, 0, 16, 8.84, 8.84, 16, 0, 16, -8.84, 16, -16, 8.84, -16, 0, -16, -8.84, -8.84, -16, 0, -16],
  [0, -18, 3, -8, 8, -3, 18, 0, 8, 3, 3, 8, 0, 18, -3, 8, -8, 3, -18, 0, -8, -3, -3, -8, 0, -18],
  [0, -12, 12, -12, 22, -7, 22, 0, 22, 7, 12, 12, 0, 12, -12, 12, -22, 7, -22, 0, -22, -7, -12, -12, 0, -12],
  [0, -16, 9, -16, 14, -10, 14, -4, 14, 6, 7, 12, 0, 20, -7, 12, -14, 6, -14, -4, -14, -10, -9, -16, 0, -16],
  [0, -9, 14, -12, 24, -6, 24, 0, 24, 6, 14, 11, 0, 9, -14, 11, -24, 6, -24, 0, -24, -6, -14, -12, 0, -9],
];

export function curveToPath(n: readonly number[]): string {
  const [a, b, ...rest] = n;
  const cubics: string[] = [];
  for (let i = 0; i < rest.length; i += 6) {
    cubics.push(`C ${rest.slice(i, i + 6).join(" ")}`);
  }
  return `M ${a} ${b} ${cubics.join(" ")}`;
}

/** Blends the traveler shape between the stations around `progress`. */
export function morphCurve(progress: number, stops: readonly number[], shapes: readonly (readonly number[])[] = STORY_SHAPES): string {
  const p = clamp01(progress);
  const last = Math.min(stops.length, shapes.length) - 1;
  if (last <= 0) return curveToPath(shapes[0] ?? []);
  let i = 0;
  while (i < last && p > stops[i + 1] + 1e-6) i++;
  if (i >= last) return curveToPath(shapes[last]);
  const span = stops[i + 1] - stops[i] || 1;
  const t = easeInOut(clamp01((p - stops[i]) / span));
  const a = shapes[i];
  const b = shapes[i + 1];
  const mixed = a.map((v, k) => v + ((b[k] ?? v) - v) * t);
  return curveToPath(mixed);
}

/**
 * Motion is on only when the visitor has not paused it and the OS is not
 * asking for reduced motion. `data-loops` is set before paint by the boot script.
 */
export function storyMotionOn(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.loops !== "on") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
