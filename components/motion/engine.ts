import type Lenis from "lenis";
import { loopsRunning, onLoopsChange, onScrollLockChange } from "@/lib/motion";
import { loadGsap } from "./load";

type Cleanup = () => void;

/**
 * Scroll-driven motion for the server-rendered page. Elements opt in with
 * data attributes; their hidden start states apply only under `.motion-ready`,
 * so content stays visible if this module never loads.
 */
export async function startMotion(options: { cursor: HTMLElement | null; dot: HTMLElement | null; progress: HTMLElement | null }): Promise<Cleanup> {
  const [{ gsap, ScrollTrigger }, LenisCtor] = await Promise.all([
    loadGsap(),
    window.matchMedia("(pointer: coarse)").matches ? Promise.resolve(null) : import("lenis").then((m) => m.default),
  ]);

  const root = document.documentElement;
  const cleanups: Cleanup[] = [];
  let lenis: Lenis | null = null;

  if (LenisCtor) {
    lenis = new LenisCtor({ lerp: 0.1, anchors: { offset: -16, duration: 1.4 } });
    const instance = lenis;
    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => gsap.ticker.remove(raf));
    cleanups.push(onScrollLockChange((locked) => (locked ? instance.stop() : instance.start())));
  }

  root.classList.add("motion-ready");

  const ctx = gsap.context(() => {
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%",
      once: true,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }),
    });

    gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
      gsap.to(el.querySelectorAll(".word-inner"), {
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.03,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } },
      );
    });

    gsap.fromTo("[data-logo-stroke]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power3.inOut", delay: 0.2 });
    gsap.from("[data-logo-dot]", { scale: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "back.out(4)", delay: 1.1 });

    gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const counter = { v: 0 };
      gsap.to(counter, {
        v: target,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(counter.v));
        },
      });
    });
    gsap.fromTo(
      "[data-stat-bar]",
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-stats]", start: "top 85%", once: true },
      },
    );

    gsap.fromTo(
      "[data-timeline-path]",
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        ease: "none",
        scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 70%", scrub: 0.6 },
      },
    );
    gsap.utils.toArray<HTMLElement>("[data-node]").forEach((node) => {
      gsap.from(node, { scale: 0, duration: 0.8, ease: "back.out(3)", scrollTrigger: { trigger: node, start: "top 70%", once: true } });
    });

    gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
      gsap.fromTo(
        card.querySelectorAll("[data-draw]"),
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1.6,
          ease: "power2.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: card, start: "top 82%", once: true },
        },
      );
    });

    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (hero) {
      gsap.to("[data-hero-content]", {
        yPercent: -12,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
      const scrollLine = gsap
        .timeline({ repeat: -1, repeatDelay: 0.3, delay: 1.6, paused: !loopsRunning() })
        .fromTo("[data-scroll-line]", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.7, ease: "power2.in" })
        .to("[data-scroll-line]", { drawSVG: "100% 100%", duration: 0.7, ease: "power2.out" });
      cleanups.push(
        onLoopsChange(() => {
          if (loopsRunning()) scrollLine.play();
          else scrollLine.pause();
        }),
      );
    }
  });
  cleanups.push(() => ctx.revert());

  const skills = document.querySelector<HTMLElement>("[data-marquee-host]");
  const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee]");
  if (skills && tracks.length) {
    const state = tracks.map((el) => ({ el, x: 0, dir: Number(el.dataset.dir) || 1 }));
    let boost = 0;
    const st = ScrollTrigger.create({
      trigger: skills,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
      },
    });
    const tick = (_time: number, dt: number) => {
      if (!st.isActive || !loopsRunning()) return;
      boost *= 0.94;
      for (const s of state) {
        const half = s.el.scrollWidth / 2;
        s.x -= 0.045 * dt * (1 + Math.abs(boost)) * s.dir * (boost < -0.5 ? -1 : 1);
        if (s.x <= -half) s.x += half;
        if (s.x > 0) s.x -= half;
        s.el.style.transform = `translate3d(${s.x}px,0,0)`;
      }
    };
    gsap.ticker.add(tick);
    cleanups.push(() => {
      gsap.ticker.remove(tick);
      st.kill();
      state.forEach((s) => (s.el.style.transform = ""));
    });
  }

  if (options.progress) {
    const bar = options.progress;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });
    cleanups.push(() => st.kill());
  }

  if (options.cursor && options.dot && window.matchMedia("(pointer: fine)").matches) {
    const ring = options.cursor;
    const dot = options.dot;
    ring.style.display = dot.style.display = "block";
    const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const move = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const hot = (e.target as Element | null)?.closest?.("a, button, [role=radio]");
      ring.dataset.hot = hot ? "true" : "false";
    };
    const leave = () => gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
    const enter = () => gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
    window.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerenter", enter);
    cleanups.push(() => {
      window.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerenter", enter);
      ring.style.display = dot.style.display = "";
    });
  }

  const spotlight = (e: PointerEvent) => {
    const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  window.addEventListener("pointermove", spotlight, { passive: true });
  cleanups.push(() => window.removeEventListener("pointermove", spotlight));

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    cleanups.reverse().forEach((fn) => fn());
    lenis?.destroy();
    root.classList.remove("motion-ready");
  };
}
