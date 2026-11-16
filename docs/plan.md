# Implementation plan: from `/design` prototype to the real site

Status: **plan for review. No production code yet.** Luke approves this plan before implementation starts.
Inputs: `docs/design.md` (approved direction 「藍上的光」), `resume_v3_zh.md` (only source of facts), the `/design` prototype on this branch.

---

## 0. Defaults for open questions (all changeable)

These are the assumptions the plan is built on. Each one is isolated so it can be changed later without touching the architecture.

| # | Question | Default used in this plan | Where it lives / how to change |
| --- | --- | --- | --- |
| 1 | English company names | Keep the Chinese names for **坤侑科技 / 巧禾數位 / 佳因企業** in every locale. MiTAC and New Kinpo Group (Kinpo Electronics) keep their English names in EN/KO. Spelling follows the résumé: 「坤侑」, not 「坤佑」. | One field per company in each locale dictionary. |
| 2 | Photo | No photo. Keep the vertical 「鄭宏璋」 treatment in the hero. | `Hero` takes an optional `portrait` prop; when it is set, the vertical name moves aside. |
| 3 | Hero tagline | Keep 「讓複雜的系統，變得清楚好用。」 (and its EN/JA/KO equivalents). | `hero.title` in each dictionary. |
| 4 | Résumé PDF | No download yet, but a **slot** is designed: a third button in Contact and the mobile menu, shown only when `site.resume[locale]` is set. | `lib/site.ts` → `resume: { "zh-TW": null, en: null, … }`. Drop a PDF in `public/resume/` and set the path. The `resume_download` GA event is already wired. |
| 5 | Auto language detection | **No** automatic redirect from `Accept-Language`. The URL decides the language; a saved choice (cookie) is honored on `/`. | `proxy.ts` (one function). |
| 6 | Cookie or consent banner for GA | None. Only GA4 is used, no ads features, and no personal data is sent. | Add Consent Mode v2 later if needed. |
| 7 | `/design` route | **Removed** at launch. The design record stays in this PR, in `docs/`, and in git history. | Section 7. |
| 8 | Domain | `https://luke-look.vercel.app` via `NEXT_PUBLIC_SITE_URL`. | Vercel environment variable. A custom domain only needs this variable changed. |

Content rules still apply everywhere (conservative wording, no invented numbers, no GitHub link). They are enforced by automated tests (section 11.1).

---

## 1. Baseline measured on the prototype

Measured with Lighthouse 12, mobile preset, on `next start` (production build), for `/design`:

| Metric | Prototype | Launch target |
| --- | --- | --- |
| Performance | **56** | ≥ 90 |
| Accessibility | 96 | 100 (hard floor 95) |
| Best Practices / SEO | 100 / 100 | 100 / 100 |
| FCP / LCP | 9.5 s / 11.4 s | ≤ 1.8 s / ≤ 2.5 s |
| TBT / CLS | 0 ms / 0 | ≤ 200 ms / ≤ 0.05 |
| Transfer size | 1.7 MB (fonts 1.1 MB, CSS 400 KB, JS 225 KB) | ≤ 800 KB on first load |

Root causes, all fixed in the plan:

1. **Fonts.** All three CJK families (TC/JP/KR) load in 4 weights. Google's unicode-range slicing produces about 1,200 `@font-face` rules (400 KB of render-blocking CSS) and 18 font files on one page. The fix is in §5.2.
2. **Hero hidden until JavaScript runs.** `.js-motion` hides text until GSAP starts, so LCP waits for hydration. The fix is in §5.1: the hero intro becomes CSS-driven and does not depend on JavaScript.
3. **All motion code in the initial bundle.** GSAP, its plugins, Lenis and the Canvas load up front. The fix is in §5.1: they load lazily after first paint.
4. **Accessibility.**
   - The dimmed (35% opacity) Approach steps and the small mono labels on `bg-2` fail contrast.
   - The language button's accessible name 「語言」 does not contain its visible text 「繁中」.

   The fix is in §6.

---

## 2. Architecture

### 2.1 Routing and URLs (SEO-friendly, one URL per language)

| Locale | Public URL | Internal route | `<html lang>` | hreflang |
| --- | --- | --- | --- | --- |
| 繁體中文 (default) | `/` | `/zh-TW` (rewrite) | `zh-TW` | `zh-TW` and `x-default` |
| English | `/en` | `/en` | `en` | `en` |
| 日本語 | `/ja` | `/ja` | `ja` | `ja` |
| 한국어 | `/ko` | `/ko` | `ko` | `ko` |

- The root layout sits under a dynamic segment: `app/[lang]/layout.tsx`. This is the Next 16 i18n pattern; `<html lang>` and the CJK font are per locale.
- `generateStaticParams()` returns the four locales and `dynamicParams = false`, so every page is **prerendered static HTML**.
- `proxy.ts` (Next 16's replacement for middleware) is limited by its matcher to `/` and `/zh-TW`:
  - `/` with cookie `NEXT_LOCALE=en|ja|ko` returns a 307 redirect to `/{locale}`. The query string is kept, so UTM parameters survive.
  - `/` with no cookie, or with `zh-TW`, is rewritten to `/zh-TW`, which is static.
  - `/zh-TW` returns a 308 redirect to `/`, so there is one canonical URL for Chinese.
- Unknown paths use `app/global-not-found.tsx` (enable `experimental.globalNotFound`), a bilingual zh/en 404 page with the theme boot script. If the experimental flag causes problems, the fallback is a 404 issued from `proxy.ts`.
- The language switcher uses **real links** (`<a href="/en" hreflang="en" lang="en">`). On click it saves the `NEXT_LOCALE` cookie, sends `select_language`, plays the blue wipe, then navigates. The current `#hash` is kept, so the visitor stays on the same section. The new page finishes the wipe from a `sessionStorage` flag.

### 2.2 Folder structure

```
app/
  [lang]/
    layout.tsx            root layout: html lang, fonts, theme boot script, GA (prod only), JSON-LD
    page.tsx              home: Server Component that composes the sections
    opengraph-image.tsx   per-locale OG image (next/og, prerendered)
    twitter-image.tsx     re-exports the OG image
    not-found.tsx
  global-not-found.tsx
  icon.svg  favicon.ico  apple-icon.png      (already done, at app root)
  manifest.ts  sitemap.ts  robots.ts
proxy.ts
lib/
  i18n/config.ts          locales, default, hreflang map, pathFor(), localeFromPath()
  i18n/dictionaries/      zh-TW.ts en.ts ja.ts ko.ts   (split from components/design/content.ts)
  i18n/get-dictionary.ts  server-only loader
  site.ts                 siteUrl, contact links, resume slot, GA id
  analytics.ts            track() wrapper and typed event names
  metadata.ts             buildMetadata(locale): title, description, canonical, alternates, OG
components/
  sections/   Hero About Experience Work Approach Skills Contact Footer   (Server Components)
  islands/    SiteHeader ThemeSwitch LanguageSwitch MobileMenu ExperienceList
              CopyEmailButton DashboardMock ApproachStage HeroCanvas     (Client Components)
  motion/     MotionRoot (Lenis + GSAP reveals, loaded lazily), useReducedMotion
  ui/         Icons LogoMark SplitWords SectionHead
tests/        unit/  e2e/  vrt/  (section 11)
```

### 2.3 Server and client split

- The text-heavy sections are **Server Components**. They get only their slice of the dictionary, so no dictionary text ships to the client bundle.
- Interactivity lives in small **client islands**: header controls, the accordion, the copy button, the dashboard mock, the morph stage and the canvas.
- Motion is **progressive enhancement**. The HTML is complete and readable without JavaScript. `MotionRoot` adds reveals after hydration, and a `<noscript>` style keeps everything visible.
- The prototype's `components/design/*` is ported piece by piece, then deleted (§7).

---

## 3. Internationalization details

- **Dictionaries.** Each locale is a typed module checked with `satisfies Dict`, so a missing key fails `tsc`. A unit test (§11.1) also checks that every locale has the same array lengths, for example five experience items.
- **Typography rules** carry over from the prototype:
  - `line-break: strict` for zh/ja and `keep-all` for ko.
  - Each locale has its own hero size.
  - Mono labels use tight tracking for CJK and Hangul.
- **Numbers and dates** are written statically in the dictionaries, so nothing is formatted at runtime and there is no hydration mismatch. The Taipei clock is the only live value, and it renders on the client.
- **Not translated:** the name 鄭宏璋, the three companies in default #1, and tech names.

---

## 4. SEO, metadata and social

- **Per-locale `generateMetadata`:**
  - `title` and `description` in each language.
  - `metadataBase = NEXT_PUBLIC_SITE_URL`.
  - `alternates.canonical`: `/`, `/en`, `/ja` or `/ko`.
  - `alternates.languages`: `{ "zh-TW": "/", en: "/en", ja: "/ja", ko: "/ko", "x-default": "/" }`. These become `<link rel="alternate" hreflang>` tags.
  - `openGraph`: `locale` (`zh_TW`, `en_US`, `ja_JP`, `ko_KR`) plus `alternateLocale`, `type: "profile"`, and a Twitter `summary_large_image` card.
  - UTM query strings never reach the canonical URL, so tracked links do not create duplicate pages.
- **`sitemap.ts`:** four URLs, each with `alternates.languages`, and `lastModified` set at build time.
- **`robots.ts`:**
  - Production allows everything and points to the sitemap.
  - When `VERCEL_ENV !== "production"`, it disallows everything as a backstop, since previews are already protected.
- **JSON-LD `Person`**, factual only:
  - `name: "Luke Cheng"`, `alternateName: "鄭宏璋"`, `jobTitle: "Front-end Engineer"`.
  - `address: Taipei, TW`, `knowsLanguage: ["zh-TW","en"]`.
  - `sameAs`: LinkedIn and CakeResume. No GitHub.
- **OG image** (`app/[lang]/opengraph-image.tsx`, 1200×630, prerendered for each locale):
  - Deep-blue panel with static horizon lines. They are precomputed SVG paths from the Canvas function, so the image matches the site.
  - The 「L.」 mark, 「鄭宏璋 Luke Cheng」, the locale's tagline and 「前端工程師 · 台北」.
  - Fonts: a **glyph subset** of Noto Sans TC/JP/KR Bold is read from `assets/fonts`, which keeps each image small (≤ 300 KB).
- **Post-launch checks:** LinkedIn Post Inspector (LinkedIn caches OG data), Facebook Sharing Debugger, Google Rich Results Test, and Search Console (verify ownership, submit the sitemap, check hreflang).

---

## 5. Theme, motion and performance

### 5.1 Motion system (production version of the prototype)

| Concern | Plan |
| --- | --- |
| Loading | `MotionRoot` is loaded with `next/dynamic` after hydration. GSAP core and ScrollTrigger come first; `DrawSVGPlugin` and `MorphSVGPlugin` are imported dynamically when their sections get close (IntersectionObserver with a 600 px rootMargin). Lenis loads only when motion is allowed. |
| Hero Canvas | It is a `next/dynamic({ ssr: false })` island, started with `requestIdleCallback` after LCP, behind a CSS gradient placeholder that looks the same, so there is no layout shift. The prototype's behaviors are kept: pause when off screen or when the tab is hidden, DPR capped at 2, fewer rows on mobile, and a single static frame under reduced motion. The contact Canvas mounts only when it comes near the viewport. |
| Hero intro | CSS `@keyframes` (transform and clip only) start straight from the HTML. Text is never at `opacity: 0`, so LCP does not wait for JavaScript. GSAP adds the underline draw when it arrives. |
| Below-the-fold reveals | Same `data-reveal` / `data-split` behavior as the prototype. The hidden starting state only applies under `.js-motion`, which the boot script sets, and `<noscript>` removes it. |
| `prefers-reduced-motion` | No Lenis, cursor, reveals, marquee motion, morph tweens or mock loop. Canvas draws one static frame. Theme and language switch instantly. CSS turns off transitions and animations globally. The setting is read once, and a `change` listener handles live OS toggles. |
| Theme switch | View Transition circle reveal when supported, otherwise an instant swap. |

### 5.2 Fonts (the largest win)

- **Self-host subsets of the glyphs actually used** with `next/font/local`.
  - A `prebuild` script (`scripts/subset-fonts.mjs`, using the harfbuzz-based `subset-font` package) collects every character in each locale dictionary (plus the OG text) and writes WOFF2 subsets of Noto Sans TC, JP and KR at **400 and 700** only.
  - The current 500 and 900 weights map to 400 and 700.
  - If a dictionary changes, the script runs again during the build, so glyphs cannot go missing. A unit test checks that every dictionary character is covered by its subset.
- **One small `@font-face` set per family.** Only the family matching `:lang()` is used, so the browser downloads only that file.
- **Latin fonts.** Manrope (preloaded) and Geist Mono (`preload: false`).
- **Budget.** CJK fonts ≤ 250 KB per locale. CSS ≤ 50 KB (about 400 KB today).

### 5.3 Performance budget (enforced in CI, §11.5)

| Budget | Target |
| --- | --- |
| Lighthouse mobile | Performance ≥ 90 on production (CI gate ≥ 85 to allow for runner noise), Accessibility 100 (gate ≥ 95), Best Practices ≥ 95, SEO 100 |
| Core Web Vitals | LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms (lab), INP ≤ 200 ms (field, checked with PageSpeed Insights after launch) |
| JavaScript (initial, gzip) | ≤ 180 KB (about 225 KB today); motion chunks load lazily |
| Fonts per locale | ≤ 300 KB including Latin |
| Total first-load transfer | ≤ 800 KB (1.7 MB today) |
| Images | Only the OG image and icons; no raster images on the page |

---

## 6. Accessibility plan (WCAG 2.2 AA)

- **Fix the baseline failures:**
  - Inactive Approach steps use a muted color with at least 4.5:1 contrast instead of 35% opacity.
  - Mono labels on `bg-2` use `--ink-2` or a darker primary.
  - The language control's accessible name starts with its visible text, for example 「繁中，切換語言」.
- **Language switch** becomes a disclosure button plus a list of links with `aria-current="true"`, each link with its own `lang`. This is simpler and more robust than a custom listbox.
- **Theme switch** stays a `radiogroup` with arrow-key navigation (roving `tabindex`).
- **Mobile menu:**
  - Focus moves into the menu and is trapped there; the rest of the page gets `inert`.
  - Esc closes it and focus returns to the menu button.
  - Body scroll is locked while it is open.
- **Experience rows:** button plus `aria-expanded` and `aria-controls` (already in the prototype).
- **Touch targets** are at least 44×44 px. Some icon buttons are 40 px today.
- **Visible focus ring** everywhere, plus a skip link, landmarks and one `h1`. Section headings are `h2`, cards are `h3`.
- **Decorative Canvas and SVG** use `aria-hidden`. Split text has a screen-reader copy (already done).
- **Checking:** axe in E2E (§11.4) for every locale and theme, a keyboard-only pass, and smoke tests with VoiceOver (zh-TW and en) and NVDA.

---

## 7. Cleanup: starter content and `/design`

- The current `main` still has the starter page with the 「Auto-deploy test · 2026-11-16」 line, placeholder projects and a GitHub link. All of it is removed: `app/page.tsx` is replaced by `app/[lang]/page.tsx`.
- **`/design` is removed** at launch (default #7), together with `components/design/` once it is ported.
  - Reason: it duplicates `/` and would compete with it in search.
  - If Luke wants to keep it, it would get `robots: { index: false }`, be left out of the sitemap, and be listed in `robots.ts` as disallowed.
- Replace the placeholder `README.md` with a short project README covering scripts, tests and the VRT update steps.
- `AGENTS.md` (generated by `next dev`) is either committed on purpose or turned off with `agentRules: false`; this is decided in phase 1.

---

## 8. Favicon set and manifest

- Already created on this branch: `app/icon.svg`, `app/favicon.ico` (16/32/48) and `app/apple-icon.png` (180). Next's file conventions add the `<link>` tags automatically.
- Phase 1 checks that they still apply once the root layout moves under `[lang]`, because files at the app root apply to every route.
- Add `app/manifest.ts`:
  - `name`, `short_name: "Luke Cheng"`.
  - `theme_color: "#2456F0"`, `background_color: "#F7F6F2"`.
  - 192 and 512 icons generated from the same SVG by the existing icon script, moved to `scripts/generate-icons.mjs`.
- Keep the `theme-color` meta per color scheme, as the prototype already does.

---

## 9. Google Analytics 4 (`G-G5PL64KQG6`)

### 9.1 Loading (production only)

- Use `@next/third-parties/google` → `<GoogleAnalytics gaId="G-G5PL64KQG6" />` in `app/[lang]/layout.tsx`. It loads `gtag.js` **after hydration**, so it does not slow the first paint.
- Render it only when `process.env.VERCEL_ENV === "production"`. That value is fixed at build time on Vercel, so preview and local builds never send data.
- Expose `NEXT_PUBLIC_GA_ENABLED` to client code for the `track()` wrapper.
- The ID lives in `lib/site.ts`. It is public by nature, so it does not need to be a secret.
- Page views: GA4 Enhanced Measurement counts the initial load and the language navigations. Each locale is its own path, so reports split by language with no extra work.

### 9.2 Custom events

All events go through one typed wrapper, `track(name, params)` in `lib/analytics.ts`. It does nothing unless GA is enabled, and it never throws.

| Event | Fires when | Parameters |
| --- | --- | --- |
| `contact_click` | LinkedIn, CakeResume or email (`mailto:`) link clicked | `method`: `linkedin` / `cakeresume` / `email`; `location`: `hero` / `nav` / `menu` / `contact`; `link_url` |
| `copy_email` | The copy button succeeds | `location` |
| `select_language` | The user picks a language (not on page load) | `from`, `to` |
| `select_theme` | The user picks a theme | `preference` (`light` / `system` / `dark`), `resolved` (`light` / `dark`) |
| `resume_download` | Slot for later (default #4) | `locale` |

- Outbound links (`target="_blank"`) send the event with `transport_type: "beacon"`, so it is not lost when the new tab opens.
- Enhanced Measurement's automatic outbound `click` stays on. The custom `contact_click` adds clear labels, and it also covers `mailto:`, which GA does not count as outbound.
- In GA Admin:
  - Mark `contact_click` as a **key event**.
  - Register `method`, `location`, `from`, `to` and `preference` as event-scoped custom dimensions so they appear in reports.

### 9.3 UTM guidance (so GA shows where visitors come from)

Use lowercase, always the same values:

| Where the link is placed | URL to paste |
| --- | --- |
| LinkedIn profile (Contact info → Website, or Featured) | `https://luke-look.vercel.app/?utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio` |
| CakeResume profile | `https://luke-look.vercel.app/?utm_source=cakeresume&utm_medium=profile&utm_campaign=portfolio` |
| English-facing placements | Same parameters on `/en?...` |
| Email signature (optional) | `...?utm_source=email&utm_medium=signature&utm_campaign=portfolio` |
| Résumé PDF (when added) | `...?utm_source=resume&utm_medium=pdf&utm_campaign=portfolio` |

- Results appear in GA under **Reports → Acquisition → Traffic acquisition**, with the dimension **Session source / medium** (for example `linkedin / profile`).
- The `/` redirect for a saved language keeps the query string. The canonical tag drops it, so SEO is not affected.

---

## 10. Vercel deployment

- **Production.** Merging into `main` deploys to `https://luke-look.vercel.app` automatically. This is the current setup and does not change.
- **Previews.** Every PR gets a preview URL. Previews sit behind **Vercel Deployment Protection** (Vercel Authentication), so Luke has to be signed in to Vercel to open one. Other people cannot see previews unless a share link or bypass is created.
- **CI does not depend on previews.** All tests run against a local `next build && next start` inside GitHub Actions, so no protection-bypass secret is needed. If preview testing is ever wanted, use Vercel's "Protection Bypass for Automation" secret.
- **Environment variables:**
  - `NEXT_PUBLIC_SITE_URL`: production `https://luke-look.vercel.app`; preview builds use `VERCEL_URL` automatically.
  - `VERCEL_ENV` is provided by Vercel.
- **Merge protection:** the Vercel deployment check is added to the required status checks (§11.6).

---

## 11. Testing strategy

Five layers, all run on every PR in GitHub Actions and all required before merging:

```
Unit / component (Vitest)  →  E2E (Playwright)  →  Accessibility (axe)  →  Visual regression (Playwright screenshots)  →  Lighthouse CI
   logic & components           real browser flows      WCAG rules               "did anything look different?"            speed & SEO
```

Tool versions are pinned in `package.json`; at the time of writing they are Vitest 5, Testing Library 16, Playwright 1.65, axe-core/playwright 4.14 and LHCI 0.16. The Playwright npm version and its Docker image tag are always upgraded together.

### 11.1 Unit and component tests: Vitest + Testing Library

- **Setup:**
  - `vitest.config.ts` with `@vitejs/plugin-react` and `vite-tsconfig-paths`, `environment: "jsdom"`.
  - A setup file adds `@testing-library/jest-dom`.
  - Coverage with `@vitest/coverage-v8`: `lib/` ≥ 90% lines, client islands ≥ 70%.
- **Limitation:** async Server Components cannot be rendered in Vitest. They are covered by E2E; Vitest covers pure functions and Client Components.

| Area | What is tested |
| --- | --- |
| `lib/i18n/config` | `pathFor(locale)`, `localeFromPath()`, the hreflang map, that `zh-TW` maps to `/` |
| `lib/metadata` | Canonical, `alternates.languages` (including `x-default`), OG locale for each locale |
| `app/sitemap.ts`, `app/robots.ts` | 4 entries with alternates; production allows everything, non-production disallows |
| `tokenize()` (SplitWords) | CJK punctuation attaches to the previous character, Latin runs stay whole, Korean splits on spaces |
| `resolveTheme()` and the theme store | `system` follows `matchMedia`; preference is saved and read back |
| `lib/analytics` | Does nothing when disabled; correct event names and parameters; never throws without `gtag` |
| `ThemeSwitch` | Radios with `aria-checked`, arrow keys, calls `select_theme` |
| `LanguageSwitch` | Opens and closes with Esc, links have `hreflang` and `lang`, sets the cookie, calls `select_language` |
| `MobileMenu` | Focus trap, Esc, restores focus, `inert` on the page |
| `ExperienceList` | Only one row open at a time, `aria-expanded` |
| `CopyEmailButton` | Clipboard mocked: success shows 「已複製」 and sends `copy_email`; failure is handled quietly |

**Content guard tests** turn the content rules into automated checks:

- All four dictionaries have the same structure (array lengths and keys).
- No string or link contains `github`.
- **Number allowlist.** Every number in every dictionary must be in an allowlist taken from the résumé:
  - Counts: 7, 20, 9, 100, 500, 1 萬 / 10,000, 4, 2.
  - Dates: the 2015–2026 years and months.
  - Version numbers: Vue 3, Angular 9/11, Bootstrap 4, ES6, HTML5.

  A new number that is not in the résumé fails the build.
- **Wording.** The subscription numbers appear only next to 「產品規模 / 平台訂閱數」 wording, never as a personal achievement.
- **Contact links** are exactly the LinkedIn, CakeResume and email addresses given.
- **Font coverage.** Every dictionary character exists in that locale's font subset (§5.2).

### 11.2 End-to-end tests: Playwright

- **Config:** `playwright.config.ts` with `webServer: "npm run build && npm run start"`.
- **Projects:**
  - `chromium-desktop` (1440×900)
  - `webkit-mobile` (375×812, touch). Most Taiwanese visitors on phones use Safari.
  - `chromium-tablet` (768×1024)
  - `firefox-desktop`, smoke tests only
- **Network:** requests to `googletagmanager.com` and `google-analytics.com` are always blocked in tests, so CI never sends data to GA.

| Spec | Scenarios |
| --- | --- |
| `theme.spec` | Default follows the emulated OS scheme. Picking Dark sets `html[data-theme=dark]` and survives reload. System follows a live `emulateMedia({ colorScheme })` change. **No flash**: an init script records `data-theme` at `DOMContentLoaded`, before hydration, and it must already be correct. |
| `i18n.spec` | Each locale URL renders the right `<html lang>`, `<h1>` and nav. The switcher goes to `/en`, `/ja`, `/ko` and back to `/`, keeping the `#hash`. **Persistence**: after choosing English, a fresh visit to `/` redirects to `/en`, and UTM parameters survive the redirect. `/zh-TW` returns a 308 to `/`. An unknown path returns 404. |
| `menu.spec` (mobile) | Open, focus is trapped, Esc closes, a link scrolls to its section and closes the menu, the language chips work, the page underneath cannot scroll. |
| `analytics.spec` | Runs against a build with GA forced on (with the network blocked). Clicking LinkedIn or CakeResume opens a popup (stubbed with `route.fulfill`), and `window.dataLayer` contains `["event","contact_click",{method:"linkedin",location:"contact",…}]`. Email and copy send their events. Language and theme switches send `select_language` and `select_theme` with the right `from`/`to` and `preference`. **The GA script is absent** in a normal non-production build. |
| `seo.spec` | Each locale has `<link rel=canonical>`, 5 hreflang alternates, OG tags, and JSON-LD that parses and has no GitHub link. `/sitemap.xml` and `/robots.txt` have the expected content. `/opengraph-image` returns a 1200×630 PNG for each locale. |
| `motion.spec` | With motion **on**: scroll through the page, and every `[data-reveal]` ends at opacity 1 (no content stuck hidden); the canvas pauses when off screen. With `reducedMotion: "reduce"`: everything is visible straight away, the `lenis` class is absent, and the Canvas draws once. |
| `links.spec` | External links use `target=_blank` with `rel="noopener noreferrer"`. The email link is `mailto:t0921988961@gmail.com`. The résumé slot is hidden while it is `null`. |

### 11.3 Visual regression testing (VRT)

#### What VRT is, in one paragraph

We take **reference screenshots ("baselines")** of the site once and commit them to the repo. On every PR, CI takes the same screenshots again and compares them pixel by pixel. If something looks different, the test fails and produces three images: *expected*, *actual*, and a *diff* with the changed pixels in red. If the change was intended (a new design), we **update the baselines** and commit them. If not, we caught a visual bug before it reached production.

#### Tool choice

| Option | Cost for this repo | Notes | Verdict |
| --- | --- | --- | --- |
| **Playwright `toHaveScreenshot`** | Free, no account | Same runner as E2E, baselines in git, diffs show in GitHub's image diff view and in the Playwright HTML report | **Use this** |
| Argos | Has a free plan (check current limits) | Nicer review UI and a GitHub check, can ingest Playwright screenshots | Optional upgrade later |
| Lost Pixel | Open-source mode is free (self-run); hosted platform is paid | Similar to plain Playwright in OSS mode | Not needed |
| Chromatic | Free tier with a snapshot limit | Built around Storybook, which this project does not use | Not a fit |

Playwright's built-in VRT is free, keeps everything in the repo and needs no third-party account. That makes it the simplest to learn, and Argos can be added on top later without rewriting tests.

#### Coverage matrix (Chromium only, for stable rendering)

- **Full page:** 4 locales × 3 widths (375 / 768 / 1440) × 2 themes (light / dark) = **24 screenshots**.
- **States:**
  - Mobile menu open (375, light and dark)
  - Language menu open (1440, light and dark)
  - A second experience row expanded (1440)
  - 404 page (375 and 1440)
  - Hero only (1440, light and dark, zh and en)
  - OG image for each locale (4, compared as PNG responses)
- **Total:** about 40 baselines.

#### Making screenshots stable (no flaky diffs)

| Source of randomness | How it is frozen |
| --- | --- |
| Animations and transitions | Context option `reducedMotion: "reduce"` (the site turns off its own motion), plus `toHaveScreenshot({ animations: "disabled", caret: "hide" })` |
| Canvas horizons | Under reduced motion the Canvas draws one deterministic frame. VRT still **hides it** with an injected `stylePath: tests/vrt/vrt.css` (`canvas{visibility:hidden}`) because GPU anti-aliasing can differ slightly. One dedicated `canvas.vrt` test snapshots only the static frame with a looser threshold. |
| Taipei clock | `page.clock.setFixedTime("2026-01-01T02:00:00Z")` (always shows 10:00), and it is also masked |
| Grain overlay and custom cursor | Hidden by `vrt.css` |
| Fonts loading late | Wait for `document.fonts.ready` and `networkidle`. Fonts are self-hosted, so they are identical on every machine. |
| Scroll-triggered state and sticky sections | Reduced motion means no reveals. Full-page capture happens at scroll 0 after one top-to-bottom pass, so the nav is always in its top state. |
| Operating-system font rendering | Baselines are **only generated on Linux** inside the official Docker image `mcr.microsoft.com/playwright:v1.65.x-noble`, which CI uses too |

Thresholds: `maxDiffPixelRatio: 0.002` for full pages and the default per-pixel `threshold: 0.2`. CI runs with `updateSnapshots: "none"`, so a missing baseline is a failure, not a silent new file.

#### Where baselines live

- `snapshotPathTemplate: "tests/vrt/__screenshots__/{projectName}/{arg}{ext}"`, with names such as `home-zh-TW-1440-dark.png`.
- They are committed to git, about 15–30 MB once the canvas and grain are hidden and DPR is 1. If they grow past about 50 MB, move them to Git LFS.

#### Updating baselines when a change is intended

1. A PR changes the UI and the **VRT check fails**. The job uploads the Playwright HTML report as an artifact, with *expected / actual / diff* for each failed screenshot.
2. Luke opens the report (Actions → the run → Artifacts → `vrt-report`) and checks that the differences are exactly what was intended.
3. If they are, run the **"Update VRT baselines"** workflow (Actions → Run workflow → choose the PR branch). It runs `playwright test --project=vrt --update-snapshots` in the same Docker image and commits the new PNGs to the branch.
   - Gotcha: a commit pushed with the default `GITHUB_TOKEN` does **not** start a new CI run. The update workflow therefore pushes with a fine-grained personal access token stored as the secret `VRT_PUSH_TOKEN` (contents: write, this repo only), so the checks run again and turn green.
   - Local alternative: `npm run vrt:update` runs the same command in the Docker image on your machine.
4. In the PR's **Files changed** tab, GitHub shows each changed PNG in 2-up, swipe or onion-skin view, so the reviewer sees the visual change and then merges.
5. If the differences were **not** intended, fix the code instead. Never update baselines just to make the check pass.

### 11.4 Accessibility checks: axe

- `@axe-core/playwright` runs inside the E2E project:
  - For each locale × theme (8 combinations) on the full page.
  - Again with the mobile menu open and with the language menu open.
- Tags: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. **Any** violation fails the test, and the results are attached to the report.
- Pages are scanned after a full scroll with motion on, so revealed content is included, and also under reduced motion.
- Lighthouse's accessibility score (≥ 95 gate, 100 target) is a second, independent check.

### 11.5 Lighthouse CI

- `@lhci/cli autorun` with `lighthouserc.json`:
  - `startServerCommand: "npm run start"`
  - URLs `/`, `/en`, `/ja`, `/ko`
  - Mobile preset, `numberOfRuns: 3` (the median is used)
- **Assertions (errors block the merge):**
  - Category scores: performance ≥ 0.85, accessibility ≥ 0.95, best-practices ≥ 0.95, seo ≥ 1.0.
  - Metrics: LCP ≤ 2500 ms, CLS ≤ 0.05, TBT ≤ 200 ms.
  - Resource budgets: script ≤ 180 KB, font ≤ 300 KB, total ≤ 800 KB.
- Reports go to `temporary-public-storage`, and the link is printed in the job log.
- Production is also checked by hand with PageSpeed Insights, where the target is ≥ 90.

### 11.6 GitHub Actions (free for this public repo)

Workflow `.github/workflows/ci.yml` runs on `pull_request` and on `push` to `main`. A `concurrency` group cancels outdated runs, and npm and `.next/cache` are cached.

| Job (required check name) | Runs | Environment |
| --- | --- | --- |
| `quality` | `npm ci` → `eslint` → `next typegen && tsc --noEmit` → `vitest run --coverage` (includes content guards) | `ubuntu-latest` |
| `e2e` | build → Playwright projects `chromium-desktop`, `webkit-mobile`, `chromium-tablet`, `firefox-desktop` + axe | container `mcr.microsoft.com/playwright:v1.65.x-noble` |
| `vrt` | build → `playwright test --project=vrt`; on failure, upload `vrt-report` (expected / actual / diff) | same container (needed for identical pixels) |
| `lighthouse` | build → `lhci autorun` | `ubuntu-latest` |

Two more workflows:

- `update-vrt.yml`: runs only when triggered by hand and does step 3 of §11.3.
- Dependabot (optional) for npm and Actions; Playwright and its image are bumped together.

**Blocking merges.**

- In GitHub, go to Settings → Rules → Rulesets → New branch ruleset for `main`:
  - Require a pull request.
  - Require status checks `quality`, `e2e`, `vrt`, `lighthouse` and the **Vercel** deployment.
  - Block force pushes.
- Rulesets are available on the free plan for public repos. **Luke enables this once** (an agent cannot change repo settings).

### 11.7 Manual verification before launch

- **Devices:** iPhone Safari, Android Chrome, Windows Chrome/Edge (to check the fallback to Microsoft JhengHei) and macOS Safari. Check every locale at 375, 768 and 1440.
- **Keyboard and screen reader:** a keyboard-only pass, then VoiceOver zh-TW and en, and NVDA.
- **Network:** slow 4G throttling (the hero must be readable before the canvas appears).
- **OS settings:** flip the OS theme while in System mode, and turn on reduced motion.
- **GA:** use Tag Assistant / DebugView on production after merging to confirm the four custom events and UTM attribution (open the site with `?utm_source=linkedin&utm_medium=profile`).

---

## 12. Order of work (phases)

Work continues on this branch (PR #1), one commit per logical step. `main`, and therefore production, only changes when Luke merges the finished PR. If smaller reviews are preferred, phase 1 can be split into its own PR and merged first, because it changes nothing visible.

| Phase | Scope | Main risk |
| --- | --- | --- |
| **1. Test and CI foundation** | Vitest, Playwright, axe and LHCI configs; `ci.yml` and `update-vrt.yml`; Docker scripts; ruleset instructions for Luke | Getting the container setup right for VRT |
| **2. Routing and i18n skeleton** | `app/[lang]` root layout, `generateStaticParams`, `proxy.ts` (rewrite, cookie redirect, canonical redirect), global 404, dictionaries split and typed, metadata, hreflang, sitemap, robots, manifest, favicon check; remove the starter page | The experimental `globalNotFound` flag; making sure `/` stays static after the rewrite |
| **3. Port the sections** | Server Components for all sections plus the client islands; content guard tests; résumé slot (hidden) | Keeping exact visual parity with the approved prototype |
| **4. Theme and motion system** | Boot script (no flash), `MotionRoot` with lazy GSAP and plugins, lazy Canvas with a placeholder, CSS-driven hero intro, reduced-motion paths, language wipe across page loads | Visual parity while moving the intro from JavaScript to CSS |
| **5. Performance and accessibility pass** | Font subsetting pipeline, bundle check, fixes for the baseline accessibility failures, focus management, 44 px targets; reach the Lighthouse and axe gates | Font subset coverage, which is guarded by a test |
| **6. SEO, social and analytics** | OG and Twitter images per locale, JSON-LD, GA4 component (production only), `track()` and the five events, analytics E2E | Events lost when a new tab opens (beacon transport) |
| **7. VRT baselines and full green run** | Generate the ~40 baselines in Docker; review them with Luke; every check green | Flaky pixels, fixed with the stabilizers above |
| **8. Launch** | Delete `/design` and `components/design`; README; Luke enables the ruleset and merges, Vercel deploys production | — |
| **9. After launch** | PageSpeed Insights on production; Search Console (ownership, sitemap, hreflang); LinkedIn Post Inspector; GA realtime and DebugView; Luke updates the LinkedIn and CakeResume links with the UTM URLs from §9.3 | LinkedIn caches the old OG preview (re-scrape it with Post Inspector) |

Each phase ends with: lint, typecheck, unit tests and E2E green (VRT and Lighthouse from phase 7), screenshots or a short recording when the change is visual, and a PR description update.
