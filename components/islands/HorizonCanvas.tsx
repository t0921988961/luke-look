"use client";

import { useEffect, useRef } from "react";
import { useLoopsRunning } from "@/lib/motion";

type Variant = "hero" | "contact";

type Props = {
  variant?: Variant;
  className?: string;
};

type Rgb = [number, number, number];

function parseColor(value: string, fallback: Rgb): Rgb {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return fallback;
}

// Small deterministic value noise; enough for soft, non-repeating swells.
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function HorizonCanvas({ variant = "hero", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = !useLoopsRunning();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    const start = performance.now();
    // The hero horizon rises as its section scrolls away.
    const scrollHost = variant === "hero" ? canvas.closest<HTMLElement>("[data-hero]") : null;
    const scrollProgress = () => {
      if (!scrollHost) return 0;
      const rect = scrollHost.getBoundingClientRect();
      return Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    };

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, target: 0 };
    const ripples: { x: number; y: number; t: number }[] = [];

    let palette = { line: [36, 86, 240] as Rgb, sky: [127, 166, 255] as Rgb, warm: [255, 122, 87] as Rgb, dark: false };
    const readPalette = () => {
      const cs = getComputedStyle(canvas);
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (variant === "contact") {
        palette = {
          line: [255, 255, 255],
          sky: parseColor(cs.getPropertyValue("--sky"), [157, 187, 255]),
          warm: parseColor(cs.getPropertyValue("--warm"), [255, 148, 115]),
          dark,
        };
      } else {
        palette = {
          line: parseColor(cs.getPropertyValue("--primary"), [36, 86, 240]),
          sky: parseColor(cs.getPropertyValue("--sky"), [127, 166, 255]),
          warm: parseColor(cs.getPropertyValue("--warm"), [255, 122, 87]),
          dark,
        };
      }
    };
    readPalette();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(reducedMotion ? 4 : performance.now() - start);
    };

    const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
    const rgba = (c: Rgb, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

    function draw(elapsedMs: number) {
      const t = elapsedMs / 1000;
      const progress = scrollProgress();
      const intro = reducedMotion ? 1 : Math.min(1, t / 2.2);
      const introEase = 1 - Math.pow(1 - intro, 3);

      ctx!.clearRect(0, 0, width, height);

      const isHero = variant === "hero";
      const mobile = width < 640;
      const rows = mobile ? 34 : 52;
      const step = mobile ? 9 : 8;
      const cols = Math.ceil(width / step) + 2;

      const focal = width * (mobile ? 0.9 : 0.55);
      const zNear = 1.4;
      const zFar = 10;
      const horizonBase = isHero ? (mobile ? 0.66 : 0.6) : 0.42;
      const horizon = height * (horizonBase - progress * 0.18);
      const camH = ((height - horizon) * 1.02 * zNear) / focal;
      const amp = (isHero ? 0.13 : 0.14) * (0.35 + 0.65 * introEase) * (1 + progress * 0.6);

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.strength += (pointer.target - pointer.strength) * 0.05;
      const sigma2 = 2 * Math.pow(mobile ? 90 : 140, 2);

      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t > 3) ripples.splice(i, 1);

      const xs = new Float32Array(cols);
      const ys = new Float32Array(cols);
      const glint = new Float32Array(cols);

      for (let r = 0; r < rows; r++) {
        const rowT = r / (rows - 1);
        // rows reveal from the horizon forward during the intro
        const rowReveal = Math.min(1, Math.max(0, introEase * 1.6 - (1 - rowT) * 0.6));
        if (rowReveal <= 0) continue;
        const z = zFar + (zNear - zFar) * Math.pow(rowT, 1.35);
        const near = 1 - (z - zNear) / (zFar - zNear);
        const halfSpan = ((width / 2 + 40) * z) / focal;

        for (let c = 0; c < cols; c++) {
          const sxFlat = c * step - step;
          const wx = ((sxFlat - width / 2) / (width / 2 + 40)) * halfSpan;
          const n =
            Math.sin(wx * 1.3 + t * 0.55 + z * 0.8) * 0.5 +
            Math.sin(wx * 2.7 - t * 0.7 + z * 1.9) * 0.22 +
            (noise(wx * 0.9 + t * 0.12, z * 0.7 - t * 0.2) - 0.5) * 1.4;
          const wy = n * amp;
          let sy = horizon + ((camH - wy) * focal) / z;

          const dx = sxFlat - pointer.x;
          const dy = sy - pointer.y;
          const d2 = dx * dx + dy * dy;
          sy -= pointer.strength * (mobile ? 26 : 46) * Math.exp(-d2 / sigma2) * (0.4 + near * 0.6);

          for (const rp of ripples) {
            const age = t - rp.t;
            const dist = Math.hypot(sxFlat - rp.x, sy - rp.y);
            const front = dist - age * 520;
            sy -= 22 * Math.exp(-age * 1.4) * Math.sin(front / 26) * Math.exp(-(front * front) / 9000) * (0.3 + near * 0.7);
          }

          xs[c] = sxFlat;
          ys[c] = sy;
          // slope facing the light → warm glint
          const slope = Math.cos(wx * 1.3 + t * 0.55 + z * 0.8) * 0.65 + Math.cos(wx * 2.7 - t * 0.7 + z * 1.9) * 0.6;
          const band = Math.exp(-Math.pow((sxFlat / width - (0.62 + Math.sin(t * 0.15) * 0.18)) * 2.6, 2));
          glint[c] = Math.max(0, slope - 0.75) * band;
        }

        const depthAlpha = Math.pow(near, 1.25);
        const fadeTop = isHero ? Math.min(1, (horizon - 0) / height + 0.4) : 1;
        const baseAlpha = (palette.dark || variant === "contact" ? 0.08 : 0.07) + depthAlpha * (variant === "contact" ? 0.42 : palette.dark ? 0.62 : 0.68);
        const alpha = baseAlpha * rowReveal * fadeTop;

        const grad = ctx!.createLinearGradient(0, 0, width, 0);
        const edge = variant === "contact" ? palette.sky : palette.sky;
        const mid = palette.line;
        grad.addColorStop(0, rgba(mix(edge, mid, 0.3), alpha * 0.35));
        grad.addColorStop(0.35, rgba(mid, alpha));
        grad.addColorStop(0.7, rgba(mix(mid, edge, 0.5), alpha));
        grad.addColorStop(1, rgba(edge, alpha * 0.3));

        ctx!.beginPath();
        ctx!.moveTo(xs[0], ys[0]);
        for (let c = 1; c < cols; c++) ctx!.lineTo(xs[c], ys[c]);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 0.6 + near * (mobile ? 0.9 : 1.2);
        ctx!.stroke();

        if (near > 0.25) {
          ctx!.beginPath();
          let open = false;
          for (let c = 1; c < cols; c++) {
            if (glint[c] > 0.08) {
              if (!open) {
                ctx!.moveTo(xs[c - 1], ys[c - 1]);
                open = true;
              }
              ctx!.lineTo(xs[c], ys[c]);
            } else open = false;
          }
          ctx!.strokeStyle = rgba(mix(palette.warm, [255, 214, 190], palette.dark ? 0 : 0.25), Math.min(0.7, near * 0.6) * rowReveal);
          ctx!.lineWidth = 0.6 + near * 1.1;
          ctx!.stroke();
        }
      }
    }

    const loop = () => {
      if (!running) return;
      draw(performance.now() - start);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reducedMotion || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    const mo = new MutationObserver(() => {
      readPalette();
      if (!running) draw(reducedMotion ? 4000 : performance.now() - start);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (pointer.x < -1000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
    };
    const onLeave = () => (pointer.target = 0);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: (performance.now() - start) / 1000 });
    };
    if (!reducedMotion) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
    }

    if (reducedMotion) draw(4000);
    else play();

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [variant, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
