# Luke Cheng 鄭宏璋 — Portfolio design proposal (v1)

Prototype: `/design` (the home page `/` renders the same prototype on this branch).
Status: design for review only. This is not production code and there is no implementation plan yet.

## 1. Concept: "Light on blue" (藍上的光)

The brief asks for something bright and approachable (陽光) that still looks credible to hiring managers at large listed companies, with no literal sun. So the warmth comes from **light**, not from a sun shape:

- **Blue is the material.** A calm, confident blue carries the structure, the text accents and the data-like Canvas field. It reads as precise and trustworthy, which suits an engineer who builds B2B and IoT consoles.
- **Warmth is the light that falls on it.** A soft apricot glow and small warm-coral highlights (glints on the waves, the underline under the key phrase, the dot in the logo) bring the friendly, sunny feeling. Coral is used sparingly as an accent. It is never a background and never yellow.
- **The horizon is the signature.** A perspective wave field (Canvas 2D) opens the page and comes back to close it in the contact panel. It suggests a calm sea, or a data surface, depending on how you look at it. Warm glints travel across it like sunlight on water, and it swells under the pointer.

Tone of voice: plain, first person, conservative. Every claim comes from `resume_v3_zh.md`. The subscription growth is shown as **product scale** ("產品規模"), and map and WebRTC features are listed as features rather than specialties.

## 2. Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#F7F6F2` warm paper | `#060A14` night navy | Page |
| `--bg-2` | `#EFEEE8` | `#0A1020` | Alternating sections |
| `--surface` | `#FFFFFF` | `#0E1528` | Cards |
| `--ink` | `#0B1430` | `#EAF0FF` | Text |
| `--muted` | `#5A6480` | `#8D99B6` | Secondary text |
| `--primary` | `#2456F0` | `#7099FF` | Brand blue: links, highlights, CTAs |
| `--sky` | `#7FA6FF` | `#9DBBFF` | Gradients, bullets |
| `--warm` | `#FF7A57` | `#FF9473` | Accent only: glints, underline, logo dot |
| `--deep` | `#0D2A8F` | `#0C1A4A` | Contact panel |

- In light mode, ink and blue sit on a slightly warm off-white instead of pure white. That is what keeps the page warm without adding any yellow.
- Body text contrast is AA or better: primary on bg is about 5.3:1, and muted on bg is about 6:1.
- A very faint film grain (3–5% opacity) adds a printed, tactile feel.

## 3. Typography

| Role | Latin | CJK |
| --- | --- | --- |
| Display and UI | **Manrope** (variable). Friendly geometric grotesk with tight tracking at large sizes. | **Noto Sans TC / JP / KR** (400–900), chosen per `:lang()` |
| Labels and data | **Geist Mono**, uppercase micro-labels for indexes, dates and the clock | CJK fallback with reduced tracking |

- The stack puts Latin glyphs first, so `Vue 3`, `B2B` and other numbers inside Chinese sentences use Manrope while the Han characters use Noto. This avoids the "Latin from a CJK font" look.
- Language rules: `line-break: strict` for zh/ja, `word-break: keep-all` for Korean. Display line-height is 1.16 for CJK and 1.02 for Latin. `text-wrap: balance` is used for headings and `pretty` for body text.
- Each locale gets its own hero size so longer EN, JA and KO headlines still fit in two lines at 1440.
- An East-Asian signature: the name **鄭宏璋** is set vertically (`writing-mode: vertical-rl`) at the right of the hero on large screens.
- CJK fonts are served as unicode-range slices (`preload: false`), so only the glyphs on the page are downloaded.

## 4. Motion system

The motion is built with GSAP 3.15 (ScrollTrigger, DrawSVG, MorphSVG), Lenis smooth scroll and native Canvas 2D.

| Moment | Technique |
| --- | --- |
| Hero intro | Headline rises word by word (characters for zh/ja) from masks. A warm underline **draws in** with an SVG stroke. The logo "L" stroke draws and its dot pops in. |
| Hero horizon | **Canvas** perspective wave field (about 50 rows) with value noise. Rows reveal from the horizon toward the viewer. The pointer causes a soft swell and a click sends a ripple ring. The field tilts and rises as you scroll, and warm glints travel across it. It pauses when off screen or when the tab is hidden. |
| Section titles | Masked word or character reveal. The index rule draws from the left. |
| About stats | Counters tick up once on enter (7 years, about 20 modules, 9 languages, about 100 test files). |
| Experience | A vertical **SVG timeline draws with scroll** (scrubbed), nodes pop in, and rows expand smoothly (CSS `grid-template-rows`). |
| VisionMax card | An abstract, text-free dashboard. The chart line draws, bars grow and markers pop, then the mock **switches to dark theme** and **flips to an RTL mirror** (Hebrew), then returns. It is labelled "示意動畫，非實際產品畫面" (illustration, not the real product UI). |
| Project cards | Line illustrations **draw on enter**. A cursor spotlight follows on hover. |
| Approach | Sticky stage on tablet and desktop: a gradient shape **morphs** (MorphSVG) between a squircle, a four-lobed form, a circle and a seal as you pass each of the four steps. The matching line icon draws out and back in, and an orbiting warm dot circles it. |
| Skills | Two giant marquee rows (filled and outline) that speed up and reverse with **scroll velocity**. |
| Contact | A second Canvas horizon in white and sky on deep blue closes the page. The email underline draws in on hover. |
| Theme switch | Circular **View Transition** reveal from the clicked button. |
| Language switch | A full-screen blue wipe shows the target language name while the content swaps underneath. |
| Global | Scroll progress line, header that hides on scroll down and returns on scroll up, custom cursor ring and dot (fine pointers only). |

**Reduced motion** (`prefers-reduced-motion: reduce`): Lenis, the cursor, reveals, marquee, morph tweens, the mock loop and Canvas animation are all turned off. The Canvas paints a single static frame, every piece of content is visible immediately, and theme and language switch instantly.

Easing is mostly `expo.out` for entrances and `expo.inOut` or `power3.inOut` for transforms. Durations are 0.6–1.4 s. Nothing loops in a way that would get in the way of reading.

## 5. Layout per breakpoint

The grid is 12 columns, content max-width is 1312 px, and the outer padding is 20 / 40 / 64 px.

| | 375 (mobile) | 768 (tablet) | 1440 (desktop) |
| --- | --- | --- | --- |
| Nav | Logo, language button and menu button. The menu is a full-screen sheet with large numbered links, language chips, theme switch and email. | Same as mobile. | Logo with wordmark, 5 section links with an active dot, language popover, 3-state theme switch and a "聯絡" pill. A glass pill bar appears after scrolling. |
| Hero | Single column. Horizon in the lower third. Clock hidden. | Intro and CTAs on the left (7 cols), "current role / stack" on the right. | Two-line headline, vertical 鄭宏璋 column, clock, horizon under the fold line. |
| About | Stats in a 2×2 grid. | Lead and body side by side, stats 2×2. | Lead (7 cols) and body (4 cols), stats in a row of 4. |
| Experience | Date above the company, role under the name. | Date column and company. | Date, company, role and toggle columns. Bullets in 2 columns when expanded. |
| Work | Featured card stacked (mock under text). Cards in 1 column. | Cards in 2 columns, the last one full width. | Featured card split 5/7. Cards in a 3 + 2 bento grid. |
| Approach | A small morph badge stays pinned at the top while the steps scroll. | Sticky stage on the left and steps on the right. | Same as tablet, larger. |
| Skills | Groups in 1 column. | Groups in 2 columns. | Groups in 5 columns. Languages in a quiet row. |
| Contact | Rounded deep-blue panel, email wraps safely. | Same. | 10vw headline. |

Languages are listed as Mandarin (native) and English ("can read English technical and API docs"). Education is not shown.

## 6. Theme and language

- Theme options are **Light / System / Dark**. The default is System. The choice is persisted in `localStorage("theme")` and applied by an inline script in `<head>` before first paint, so there is no flash. In System mode the page follows OS changes live.
- Language options are **繁體中文 (default) / English / 日本語 / 한국어**. The choice is persisted in `localStorage("lang")`. All four languages are fully translated in the prototype, not just the navigation and hero. `<html lang>` is updated so the right CJK font and line-breaking rules apply.
- The prototype switches language on the client. For production, the recommendation is locale routes (`/`, `/en`, `/ja`, `/ko`) so each language is crawlable. That is for the implementation phase.

## 7. Favicon set

The mark is **"L."**: a rounded white L with a warm-coral full stop on a blue gradient tile (`#3A6CFF → #1739B8`). It reads as "Luke" followed by a confident period, and the dot is the same warm light used across the site. The L and dot are optically centered as a pair.

- `app/icon.svg`: scalable, for modern browsers.
- `app/favicon.ico`: 16, 32 and 48 px, with a thicker stroke for legibility.
- `app/apple-icon.png`: 180 px, full-bleed (iOS rounds the corners).

## 8. Open points for the owner

1. **English company names.** MiTAC (神達電腦) and New Kinpo Group / Kinpo Electronics (新金寶集團 / 金寶電子) are used in EN/KO. 坤侑科技, 巧禾數位 and 佳因企業 are left in Chinese until the official English names are confirmed. The English client names in the 巧禾數位 entry (Bank SinoPac, Taishin Richart, Fubon, Prudential, Amundi, Neuberger Berman, Fidelity, StockFeel) also need a check.
2. **Portrait.** The design works without a photo. A warm, natural-light portrait could replace the vertical name column if you would like a more personal hero.
3. **Hero line.** 「讓複雜的系統，變得清楚好用。」 is written as an aspiration rather than a metric. Tell me if you would prefer a more literal line, such as 「專注 B2B 與 IoT 管理後台的前端工程師」.
4. **Résumé PDF.** There is no download link yet. Add one if you want it next to the contact buttons.
