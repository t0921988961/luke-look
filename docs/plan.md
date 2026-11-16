# Implementation plan: from `/design` prototype to the real site

Status: **plan for review, revision 2 (after an adversarial review). No production code yet.** Luke approves this plan before implementation starts.

Inputs:
- `docs/design.md`: the approved direction 「藍上的光」
- `resume_v3_zh.md`: the only source of facts
- The `/design` prototype on this branch

What changed since revision 1, and what was considered but rejected, is listed in **section 14, Review changelog**. Numbers marked *measured* come from real runs on this branch, not estimates.

---

## 0. Decisions for Luke, and defaults (all changeable)

### 0.1 Decisions that need Luke's answer before or during implementation

| # | Decision | Recommendation (used as the default if Luke doesn't answer) |
| --- | --- | --- |
| D1 | **Contact email.** The local part `t0921988961` looks like a Taiwanese mobile number, so publishing it on a public, indexed site also publishes the phone number to scrapers. (Taiwan has heavy scam-call activity.) | Before launch, create a dedicated address such as `luke.cheng.dev@gmail.com` for the site. Until Luke decides, the current address stays. Changing it later is a one-line change in `lib/site.ts`. |
| D2 | **Custom domain.** `luke-look.vercel.app` looks like a hobby project to a hiring manager, and moving domains after launch means redoing Search Console, UTM links, LinkedIn's cached previews and GA settings. | Buy a domain **before launch** (for example `lukecheng.dev` or a `.tw` domain, about USD 10–40 a year) and keep `luke-look.vercel.app` as a 308 redirect. If Luke skips this, launch on vercel.app; the plan supports switching later (§10.3). |
| D3 | **Japanese and Korean.** The ja and ko text is machine-quality, not native-reviewed; for example 「足輪監視システム」 for 腳鐐監控 reads wrong in Japanese. A visibly unnatural ja/ko page hurts credibility more than having no ja/ko page. These pages could also suggest Luke speaks Japanese or Korean. | Ship ja and ko with a visible translation note (§3.2) and `noindex`, left out of the sitemap and hreflang, until a native speaker has reviewed them. English gets the same note and is proofread before launch. |
| D4 | **Ship the approved design now as an interim site?** Production currently shows the starter page with 「Auto-deploy test」. | Yes. Merge PR #1 once this plan is approved (§12, milestone M0). The prototype looks far better than the starter page, and every later step becomes a small PR that can be reverted. Alternative: keep production on the starter page until a single launch PR. |
| D5 | **Consent banner for EU visitors.** | No banner. GA uses Consent Mode v2 with storage *denied by default* in the EEA, UK and Switzerland, plus a short privacy notice (§9.4). Add a banner only if Luke expects meaningful EU traffic. |
| D6 | **VRT matrix size.** | 17 snapshots instead of 40 (§11.3). The full 4 locales × 3 widths × 2 themes matrix stays available as an opt-in run. |

### 0.2 Content defaults from Luke's open questions (unchanged)

| # | Question | Default |
| --- | --- | --- |
| 1 | English company names | Chinese names stay for **坤侑科技 / 巧禾數位 / 佳因企業** in every locale; MiTAC and New Kinpo Group (Kinpo Electronics) use English names. Spelling follows the résumé: 「坤侑」, not 「坤佑」. |
| 2 | Photo | No photo; keep the vertical 「鄭宏璋」. `Hero` has an optional `portrait` prop. |
| 3 | Hero tagline | 「讓複雜的系統，變得清楚好用。」 and its translations. This is the only line on the site that does not come from the résumé, and Luke has approved it. |
| 4 | Résumé PDF | No download yet. A slot shows a button in Contact and the mobile menu only when `site.resume[locale]` is set; the `resume_download` event is already wired. |
| 5 | Language detection | No automatic redirect from `Accept-Language`. The URL decides the language, and an explicit choice (cookie) is honored on `/`. |
| 6 | `/design` | Removed at the end of M2 (§7). |

Content rules still apply everywhere (conservative wording, no invented numbers, no GitHub link) and are enforced by tests (§11.1).

---

## 1. Baseline measured on the prototype

Lighthouse 12, mobile preset, on `next start`. JavaScript sizes come from the build output (gzip -9).

| Metric | Prototype (*measured*) | Launch target |
| --- | --- | --- |
| Performance | **56** | ≥ 90 (PageSpeed Insights, production) |
| Accessibility | 96 | 100 |
| FCP / LCP | 9.5 s / 11.4 s | ≤ 1.8 s / ≤ 2.5 s |
| CSS | about 380 KB gzip (three CJK `@font-face` files of 100–150 KB each, render-blocking) | ≤ 25 KB gzip |
| Fonts | 1.1 MB (18 files) | ≤ 300 KB per locale |
| JavaScript | about 265 KB gzip; GSAP, ScrollTrigger, MorphSVG, DrawSVG and Lenis are about 64 KB of it | see §5.3 |
| Google `gtag.js` (not loaded yet) | about 548 KB raw, about 180 KB compressed (*measured* for `G-G5PL64KQG6`) | loaded late (§9.1) |

Root causes:
1. **Fonts.** All CJK families load in 4 weights on every page.
2. **Hero hidden until JavaScript runs.** `.js-motion` keeps the hero hidden until hydration finishes.
3. **All motion code in the first bundle.**
4. **Accessibility.**
   - The dimmed Approach steps don't have enough contrast.
   - The language button's accessible name doesn't contain its visible text.
5. **Horizontal overflow** (found in review). The page is 1–3 px wider than the viewport at 375 and 1440. The cause is the tilted skills marquee row (`-rotate-[1.5deg]`), and on phones it lets the whole page pan sideways. The fix is `overflow-x: clip` on that section, plus an E2E check (§11.2).

---

## 2. Architecture

### 2.1 Next.js configuration

- **Turn off `cacheComponents` and `partialPrefetching`** (starter defaults).
  - The site has no data fetching and every page is static.
  - With `cacheComponents` on, `dynamicParams = false` **fails the build**. Unknown params would be rendered on request instead of returning a static 404, which means every bot probing `/wp-admin` would start a server function.
  - Turning both off gives the simplest model: everything prerendered at build time.
- `experimental.globalNotFound: true` (see §2.2). The Next version is pinned, and E2E plus VRT cover the 404 page, so a regression shows up in CI.

### 2.2 Routing: two root layouts, no proxy

| Locale | URL | Source | `<html lang>` |
| --- | --- | --- | --- |
| 繁體中文 (default) | `/` | `app/(zh)/page.tsx` with root layout `app/(zh)/layout.tsx` | `zh-Hant-TW` |
| English | `/en` | `app/(intl)/[lang]/page.tsx` with root layout `app/(intl)/[lang]/layout.tsx` | `en` |
| 日本語 | `/ja` | same | `ja` |
| 한국어 | `/ko` | same | `ko` |

- Both layouts render one shared `<RootShell locale>` (fonts, boot script, analytics, JSON-LD) and one shared `<HomePage locale>`. There is no duplicated markup.
- `[lang]` uses `generateStaticParams()` returning `en`, `ja`, `ko`, and `dynamicParams = false`. Unknown first segments go to `app/global-not-found.tsx`, a bilingual zh/en page with the theme boot script.
- **No `proxy.ts`, no rewrite, and no internal `/zh-TW` URL.** In revision 1, the rewrite plus the `/zh-TW` → `/` redirect could have interfered with Next's RSC prefetch requests, and the proxy ran a function on every visit to `/`.
- **Remembering the language choice** uses a `next.config.ts` `redirects()` rule with a cookie condition. It runs in Vercel's routing layer, so no function runs and the page stays static:
  - Source `/`, `has: [{ type: "cookie", key: "NEXT_LOCALE", value: "(?<l>en|ja|ko)" }]`, destination `/:l`, temporary (307).
  - The query string is kept, so UTM parameters survive.
- The language switcher uses **plain links** (`<a href="/en" hreflang="en" lang="en">`). The click handler sets the cookie, sends `select_language` and keeps the `#hash`.
  - A full page load is expected because the root layout changes.
  - The page change animates with **CSS cross-document View Transitions** (`@view-transition { navigation: auto; }`) where the browser supports them; elsewhere it is a normal load. This replaces revision 1's JavaScript wipe that had to survive a reload.

### 2.3 Folder structure

```
app/
  (zh)/layout.tsx  (zh)/page.tsx
  (intl)/[lang]/layout.tsx  (intl)/[lang]/page.tsx
  global-not-found.tsx  global-error.tsx
  icon.svg  favicon.ico  apple-icon.png  manifest.ts  sitemap.ts  robots.ts
lib/
  i18n/config.ts  i18n/dictionaries/{zh-TW,en,ja,ko}.ts  i18n/get-dictionary.ts
  site.ts  analytics.ts  metadata.ts  consent.ts
components/
  shell/      RootShell (fonts, boot script, GA, Vercel Analytics, JSON-LD), HomePage
  sections/   Hero About Experience Work Approach Skills Contact Footer   (Server Components)
  islands/    SiteHeader ThemeSwitch LanguageSwitch MotionToggle MobileMenu ExperienceList
              CopyEmailButton DashboardMock ApproachStage HeroCanvas     (Client Components)
  motion/     MotionRoot (Lenis + GSAP reveals, lazy), useMotionPreference
  ui/         Icons LogoMark SplitWords SectionHead
assets/fonts/ generated WOFF2 subsets + OFL.txt
public/og/    zh-TW.png en.png ja.png ko.png
scripts/      subset-fonts.mjs  generate-og.mjs  generate-icons.mjs
tests/        unit/  e2e/  vrt/
```

### 2.4 Server and client split

- Sections are Server Components and receive only their part of the dictionary. Today all four dictionaries ship to the browser.
- Interactive pieces are small client islands.
- Motion is progressive enhancement: the HTML is complete without JavaScript, and a `<noscript>` rule keeps everything visible.
- Each island that uses Canvas or motion sits inside a small error boundary that renders nothing on failure, so a WebGL/Canvas or GSAP error can never blank the page.

---

## 3. Internationalization and content

### 3.1 Dictionaries

- Typed per-locale modules (`satisfies Dict`), plus a structure-parity unit test.
- The prototype's typography rules carry over (`line-break: strict` for zh/ja, `keep-all` for ko, per-locale hero sizes).

### 3.2 Translation honesty and quality (new)

- Every non-zh page shows a small note under the language section and in the footer: *"This page is translated from the Chinese original. Luke works in Mandarin and reads English technical and API documentation."* It is adapted for ja/ko. This keeps the site consistent with the résumé's conservative language claim.
- **Review gate**, tracked in `docs/content-review.md` as a checklist with reviewer names:
  - `en`: proofread before launch.
  - `ja` and `ko`: reviewed by a native speaker (a friend or colleague, or a paid proofreading service). Until then they ship with `robots: noindex`, are left out of `sitemap.xml` and the hreflang cluster, and still appear in the switcher.
- **Known fixes from the review:**
  - ja 「足輪監視システム」 becomes something like 「GPS 足首装着端末の監視システム」, pending native review.
  - Remove the footer's 「設計提案 v1 · 僅供審閱」 (`contact.note`) in every locale.

### 3.3 Content accuracy

- Every claim on the page maps to a résumé line. This was checked during review: the only addition is the approved tagline.
- Luke signs off the zh text once in `docs/content-review.md` before launch.
- The JSON-LD drops `knowsLanguage: "en"`, which would overstate the résumé, and lists only `zh-TW`.

---

## 4. SEO, metadata and social

- **Per-locale `generateMetadata`:**
  - Title and description per locale; `metadataBase = NEXT_PUBLIC_SITE_URL`.
  - The canonical URL for each page is itself; UTM query strings never reach it.
  - `alternates.languages` lists **only reviewed, indexable locales**: at launch `zh-TW` → `/` and `en` → `/en`, with ja and ko added after review.
  - **`x-default` → `/en`.** Revision 1 pointed it at `/`. x-default is for visitors whose language matches none of the listed ones (for example Vietnamese or German), and English serves them better than Chinese.
- **`sitemap.ts` and `robots.ts`:**
  - The sitemap includes only the indexable locales.
  - `robots.ts` disallows everything when `VERCEL_ENV !== "production"`.
- **JSON-LD `Person`**, factual only: name, alternate name 鄭宏璋, job title, Taipei, `sameAs` LinkedIn and CakeResume. No email and no GitHub.
- **OG images are static PNGs** in `public/og/{locale}.png` (1200×630), referenced from metadata.
  - `scripts/generate-og.mjs` renders an HTML template with the real fonts and a static horizon frame using Playwright, so the image matches the site exactly. The images are regenerated only when the tagline or name changes.
  - This replaces runtime `next/og`: Satori cannot use WOFF2 and needs CJK font files embedded, which was extra complexity for 4 images.
- **Search Console:**
  - On vercel.app, use a URL-prefix property verified with an HTML meta tag (`metadata.verification.google` from the env var `GOOGLE_SITE_VERIFICATION`).
  - On a custom domain, use a Domain property verified by DNS TXT.
  - Submit the sitemap. Bing Webmaster Tools can import from Search Console.
- **After launch:** LinkedIn Post Inspector (it caches OG data), Rich Results Test, and Search Console's hreflang and coverage reports.

---

## 5. Theme, motion and performance

### 5.1 Motion system

| Concern | Plan |
| --- | --- |
| Loading | `MotionRoot` is loaded with `next/dynamic` after hydration. GSAP core and ScrollTrigger come first; DrawSVG and MorphSVG are imported when their sections get close. Lenis only loads when motion is on, and it is off on touch devices. |
| Hero Canvas | `next/dynamic({ ssr: false })`, started when the browser is idle (`requestIdleCallback`, with a `setTimeout` fallback for older Safari) behind a CSS gradient placeholder that looks the same. It pauses when off screen or in a hidden tab, and DPR is capped at 2. |
| Hero intro | CSS `@keyframes` using transform and clip only. Text is never at opacity 0, so LCP does not wait for JavaScript. |
| Reveals below the fold | Same as the prototype. The hidden starting state only applies under `.js-motion`, and `<noscript>` resets it. |
| **Pause control (new)** | A visible **「暫停動態 / Pause motion」** toggle in the header settings and the footer. It stops the looping animations (horizon Canvas, marquee, dashboard mock) and is saved in `localStorage`. **WCAG 2.2.2 (Level A)** requires a way to pause motion that starts automatically, lasts more than 5 s and runs alongside other content. `prefers-reduced-motion` alone does not meet that, because many people never change the OS setting. |
| `prefers-reduced-motion` | Starts in the paused state, with no Lenis, no reveals and instant theme and language changes. A live `change` listener handles OS changes. |
| Cursor | The custom cursor ring is decorative only. **The system cursor is never hidden.** |

### 5.2 Fonts

- **Committed subsets**, not runtime subsetting.
  - `scripts/subset-fonts.mjs` collects every character used by each locale's dictionary (plus the OG text).
  - It downloads exact-glyph WOFF2 subsets from the Google Fonts CSS API (`text=` parameter) for Noto Sans TC, JP and KR at weights 400 and 700, and writes them to `assets/fonts/`. They are loaded with `next/font/local`.
  - *Measured* subset sizes:

    | Font | Characters | Size per weight (WOFF2) | Two weights |
    | --- | --- | --- | --- |
    | Noto Sans TC (zh) | 390 | about 66 KB | about 130 KB |
    | Noto Sans JP (ja) | 349 | about 85 KB | about 170 KB |
    | Noto Sans KR (ko) | 273 | about 25 KB | about 50 KB |

  - The CJK `@font-face` CSS drops from about 380 KB to well under 2 KB.
- **Why not subset at build time:**
  - It would need about 30 MB of full source fonts in the repo, or network access during the Vercel build.
  - The script runs only when text changes, and its output is about 0.6 MB in total.
- **When new text needs a missing glyph:** a unit test reads each subset's character map and fails CI listing the missing characters. The fix is `npm run fonts`. The failure is soft even if it slips through: the browser draws that one character in a system CJK font, and nothing breaks.
- **Preloading:** every CJK `next/font/local` declaration uses `preload: false`. Otherwise all three families would be preloaded on every page. The root layout preloads only that locale's 700-weight file. Manrope is preloaded; Geist Mono is not.
- **Licensing:** Noto Sans TC/JP/KR, Manrope and Geist Mono are all under the SIL Open Font License 1.1. Subsetting and self-hosting are allowed, and `assets/fonts/OFL.txt` is committed with the files.

### 5.3 Performance budgets (defined so they can be measured)

| Budget | Target | Measured how | Blocks merge? |
| --- | --- | --- | --- |
| JS before interaction (framework + islands, excluding lazy motion chunks and GA) | ≤ 150 KB gzip | build-output script that reads the client reference manifest for `/` and `/en` | yes |
| All first-party JS after idle (including GSAP, Lenis, Canvas) | ≤ 230 KB gzip | same script | yes |
| CSS | ≤ 25 KB gzip | same script | yes |
| Fonts per locale | ≤ 300 KB including Latin | sum of subset files + Latin | yes |
| Lighthouse (CI, local build, GA off) | a11y ≥ 0.95, SEO = 1, best practices ≥ 0.95, CLS ≤ 0.05 | LHCI | yes |
| Lighthouse performance (CI) | ≥ 0.85 | LHCI | **no (warning)**: runner noise makes it flaky |
| Production PageSpeed Insights (with GA) | performance ≥ 90, LCP ≤ 2.5 s, TBT ≤ 200 ms | manual check after each deploy | — |
| Field data | INP ≤ 200 ms, LCP ≤ 2.5 s | Vercel Speed Insights (optional, §9.5) or Search Console Core Web Vitals | — |

---

## 6. Accessibility plan (WCAG 2.2 AA)

- **Fix the baseline failures:**
  - Contrast of the inactive Approach steps (use a muted color, not opacity).
  - Mono labels on `bg-2`.
  - The language button's name starts with its visible text, for example 「繁中，切換語言」.
- **Pause control** for looping motion (§5.1, WCAG 2.2.2).
- **Language switch:** a disclosure button plus links with `aria-current` and a `lang` attribute on each.
- **Theme switch:** a radiogroup with roving `tabindex`.
- **Mobile menu:** focus trap, `inert` on the rest of the page, Esc closes, focus returns to the button.
- **Basics:** 44 px touch targets, skip link, one `h1`, landmarks, visible focus.
- **Canvas and decorative SVG:** `aria-hidden`. Split text has a screen-reader copy.
- **Experience rows:**
  - Every row shows company, role, dates and a one-line summary **without expanding**. Hiring managers scan, they don't click.
  - Each row's first bullet is also visible; "more" reveals the rest.
- **Checking:** axe (§11.4), plus one manual pass each with keyboard only, VoiceOver (zh-TW and en) and NVDA.

---

## 7. Cleanup: starter content and `/design`

- **M0** (merging PR #1) already removes the starter page and the 「Auto-deploy test」 line from production, because `/` renders the approved design.
- **M2** deletes `/design` and `components/design/` once the sections are ported. Until then, `/design` gets `robots: noindex`.
- Remove `contact.note` (「設計提案 v1」) in M1.
- Replace `README.md` with a short README: scripts, the text-change runbook (§13), and how VRT updates work.
- `AGENTS.md` (generated by `next dev`) is committed on purpose, so agents get the Next 16 doc pointer.

---

## 8. Favicon set and manifest

- `app/icon.svg`, `app/favicon.ico` and `app/apple-icon.png` already exist at the app root. Root-level metadata files apply under both root layouts; E2E checks the `<link>` tags.
- `app/manifest.ts` with 192 and 512 icons generated by `scripts/generate-icons.mjs`.

---

## 9. Analytics and privacy

### 9.1 GA4 loading (`G-G5PL64KQG6`, production only)

- Use `next/script` with **`strategy="lazyOnload"`**, which loads after `window.load` and idle time.
  - `gtag.js` is about 180 KB compressed (*measured*), about as large as the whole site's JS. Loading it after hydration (the default for `@next/third-parties`) would put it in the middle of the mobile TBT/INP window.
  - Trade-off: a visitor who leaves within about 1–2 s may not be counted. That is acceptable for a portfolio.
- It is rendered only when `VERCEL_ENV === "production"`, **and the visitor has not opted out** (§9.3).
- GA settings:
  - Google signals: off. Ads personalization: off. Data retention: 14 months.
  - IP addresses are not logged in GA4 by design.
- `track(name, params)` in `lib/analytics.ts`:
  - It defines the standard `gtag` shim (`window.dataLayer.push(arguments)`), so events fired before `gtag.js` arrives are queued and then sent rather than dropped. gtag only processes `arguments` objects, not arrays, and the shim handles that.
  - It does nothing when analytics is disabled.
  - Revision 1's `transport_type: "beacon"` is removed; GA4 already uses `sendBeacon` by default.

### 9.2 Events

| Event | When | Parameters |
| --- | --- | --- |
| `contact_click` (mark as a **key event**) | LinkedIn, CakeResume or email link clicked | `method`, `location` (`hero` / `nav` / `menu` / `contact`) |
| `copy_email` | The copy button succeeds | `location` |
| `select_language` | The user picks a language | `from`, `to` |
| `select_theme` | The user picks a theme | `preference`, `resolved` |
| `toggle_motion` | The user pauses or resumes motion | `state` |
| `resume_download` | Slot for later | `locale` |

- Register `method`, `location`, `from`, `to`, `preference` and `state` as event-scoped custom dimensions in GA Admin.
- Enhanced Measurement's automatic outbound clicks stay on. The custom event adds labels and also covers `mailto:`.

### 9.3 Luke's own visits (internal traffic)

- Opening `https://<site>/?notrack=1` once on each of Luke's devices sets `localStorage.notrack = "1"`. After that, neither GA nor Vercel Analytics loads or sends anything on that device. `?notrack=0` turns tracking back on.
- This is more reliable than GA's IP-based internal-traffic filter, because Taiwanese home and mobile IP addresses change.
- A small 「不追蹤中」 dot in the footer, visible only on opted-out devices, makes the state obvious.

### 9.4 Privacy and consent

This is not legal advice; it is a proportionate setup for a personal portfolio.

- **Consent Mode v2 defaults:**
  - For the EEA, UK and CH (the `region` list): `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` are all **denied**. GA then sends cookieless pings only.
  - Everywhere else, `analytics_storage` is granted and all ad signals are denied.
  - This covers GDPR cookie rules without a banner (D5). Japan (APPI and the 2023 external-transmission rule) and Korea (PIPA) are covered by the notice below, since no data is sold or used for ads.
- **Privacy notice:** a footer disclosure 「隱私 / Privacy」 in all four languages. It covers what is collected (anonymous usage statistics through Google Analytics 4 and Vercel Web Analytics), that no ads are used, the Google opt-out browser add-on, and the `?notrack=1` switch.

### 9.5 Ad blockers and a second source of numbers

- Many engineers, and some corporate networks, block GA, so GA **undercounts**. Use it for relative trends, UTM attribution and events, not absolute visitor counts.
- **Vercel Web Analytics** (`@vercel/analytics`) is a complement:
  - Cookieless, about 1 KB, served from the site's own domain, so it is blocked less often.
  - Included free on the Hobby plan up to its monthly event limit; check the dashboard.
  - It gives visitor and page counts. Custom events need a paid plan, so events stay in GA.
- **Speed Insights** (field Core Web Vitals) is optional. Enable it only if the Hobby quota fits.

### 9.6 UTM guidance

| Placement | URL |
| --- | --- |
| LinkedIn profile (Contact info → Website, or Featured) | `https://<site>/?utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio` |
| CakeResume profile | `https://<site>/?utm_source=cakeresume&utm_medium=profile&utm_campaign=portfolio` |
| English-facing placements | the same parameters on `/en?...` |
| Email signature / résumé PDF (later) | `utm_source=email&utm_medium=signature` / `utm_source=resume&utm_medium=pdf` |

- Results appear in GA under **Reports → Acquisition → Traffic acquisition → Session source / medium**.
- The language redirect keeps the query string, and canonical tags drop it.

### 9.7 Checking that events arrive

1. After deploying, open the site through **Tag Assistant** (tagassistant.google.com). It turns on debug mode automatically, so events appear in **GA → Admin → DebugView** without code changes.
2. Click each contact link, switch language, theme and motion, and confirm each event and its parameters in DebugView.
3. Do this **before** setting `?notrack=1` on that device, or temporarily use `?notrack=0`.
4. Check **Realtime** for a UTM visit from a phone using mobile data.

---

## 10. Vercel, security and operations

### 10.1 Deployments

- Merging into `main` deploys production. Every PR gets a preview behind **Vercel Deployment Protection**, so viewers must be signed in to Vercel.
- CI tests a local `next build && next start`, so no protection-bypass secret is needed.
- Environment variables: `NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION`. `VERCEL_ENV` is provided by Vercel.

### 10.2 Security headers (in `next.config.ts` `headers()`)

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`; `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`; `img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com`; `style-src 'self' 'unsafe-inline'`; `font-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Content-Type-Options` | `nosniff` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| HSTS | Vercel sets it on its domains; for a custom domain, add `max-age=63072000; includeSubDomains` |

- **Why `'unsafe-inline'` for scripts:** a nonce-based CSP forces every page to render dynamically on each request, and a hash-based CSP cannot cover Next's inline RSC payload scripts. The site has no user input, no login and no third-party HTML, so the remaining XSS risk is negligible.
- E2E fails on any console CSP violation, which catches GA or Vercel Analytics being blocked by mistake.

### 10.3 Custom domain (whenever D2 happens)

1. Add the domain in Vercel and set it as primary, with `luke-look.vercel.app` → 308 to it.
2. Update `NEXT_PUBLIC_SITE_URL`.
3. Create a Search Console Domain property (DNS TXT) and submit the sitemap.
4. Update the GA stream URL, and the LinkedIn and CakeResume UTM links.
5. Re-scrape with LinkedIn Post Inspector.

### 10.4 Rollback

- **Instant:** Vercel dashboard → Deployments → previous production deployment → *Instant Rollback*. It takes seconds and does not depend on CI.
  - Gotcha: after a rollback, Vercel **stops promoting new `main` deployments automatically** until you promote one again. The README will say so.
- **Permanent:** a `git revert` PR that goes through CI.
- The ruleset lets Luke (repo admin) bypass for emergencies (§11.6).

### 10.5 Maintenance and dependencies

- Dependabot runs monthly with grouped updates for npm and Actions.
- Playwright is **excluded** from Dependabot: a Playwright upgrade changes Chromium rendering, so every baseline has to be regenerated. Bump it deliberately, about twice a year, together with its Docker image tag and a baseline refresh.
- GSAP uses its no-charge license (free for commercial use since 3.13), Lenis is MIT, and the fonts are OFL. No paid dependencies.

---

## 11. Testing strategy

Four CI jobs. Three of them block merges.

```
quality (Vitest + lint + types + budgets)   browser (Playwright E2E + axe + VRT)   lighthouse (LHCI)
```

### 11.1 Unit and component tests: Vitest + Testing Library

- **Setup:** `vitest.config.ts` (jsdom, `@vitejs/plugin-react`, `vite-tsconfig-paths`), `@testing-library/jest-dom`, coverage with v8 (`lib/` ≥ 90%).
- **Limitation:** async Server Components cannot be rendered in Vitest, so they are covered by E2E.

| Area | What is tested |
| --- | --- |
| `lib/i18n`, `lib/metadata` | locale paths; canonical and alternates contain only indexable locales; `x-default` → `/en`; noindex for unreviewed locales |
| `sitemap.ts`, `robots.ts` | only indexable locales; non-production disallows everything |
| `lib/analytics` | the `gtag` shim pushes `arguments`; nothing happens when disabled or opted out; event names and parameters |
| `lib/consent` | the region list and default states |
| `tokenize()` | CJK punctuation, Latin runs, Korean spacing |
| Theme store | `resolveTheme()`, saving and reading the preference |
| `ThemeSwitch`, `LanguageSwitch`, `MotionToggle`, `MobileMenu`, `ExperienceList`, `CopyEmailButton` | ARIA attributes, keyboard support, events fired, failures handled quietly |
| **Content guards** | all four locales have the same structure; no `github` anywhere; **number allowlist** taken from the résumé; subscription numbers only appear with the 「產品規模 / 平台訂閱數」 wording; contact links are exact; `contact.note` is gone |
| **Font coverage** | every character in each dictionary exists in that locale's subset |
| **Budgets** | the build-output size script (§5.3), run after `next build` in the `quality` job |

### 11.2 End-to-end tests: Playwright

- **Projects:** `chromium-desktop` (1440×900) and `webkit-mobile` (375×812, touch). Revision 1's Firefox and tablet E2E projects are dropped: they add CI time without covering a distinct risk, and 768 is still covered by VRT.
- **Builds:** CI builds **once** with `ANALYTICS_FORCE=1`, so GA is rendered, and every Google domain is blocked by `page.route`, so no data is ever sent. Every spec therefore exercises the real analytics code path.
- **Global checks in every spec:** no console errors, no CSP violations, and **no horizontal overflow** (`scrollWidth ≤ innerWidth`).

| Spec | Scenarios |
| --- | --- |
| `theme` | follows the OS by default; choosing a theme survives reload; System follows a live `emulateMedia` change; **no flash**: `data-theme` is already correct at `DOMContentLoaded` |
| `i18n` | each URL has the correct `lang`, `h1` and nav; the switcher moves between `/`, `/en`, `/ja` and `/ko` and keeps the hash; after choosing English, a fresh visit to `/` redirects to `/en` with UTM parameters kept; an unknown path returns 404 through `global-not-found`; ja and ko have `noindex` while unreviewed |
| `menu` (webkit-mobile) | focus trap, Esc, links close the menu, page scroll is locked |
| `analytics` | `window.dataLayer` receives `contact_click` (LinkedIn, CakeResume, email), `copy_email`, `select_language`, `select_theme` and `toggle_motion` with the right parameters; `?notrack=1` stops GA from loading and is remembered; Consent Mode defaults are pushed before `config` |
| `seo` | canonical, hreflang (indexable locales plus `x-default` → `/en`), OG tags and image URLs, JSON-LD without email or GitHub; sitemap and robots content; icons |
| `motion` | with motion on, every `[data-reveal]` ends visible after scrolling; the pause toggle stops the Canvas, marquee and mock and is remembered; with reduced motion, everything is visible immediately and Lenis is absent |
| `links` | `rel="noopener noreferrer"` on external links, the exact `mailto:`, the résumé slot hidden while `null` |

### 11.3 Visual regression testing (VRT)

#### What it is

Commit reference screenshots ("baselines"). On every PR, CI takes the same screenshots and compares them pixel by pixel. Any difference fails the check and produces *expected / actual / diff* images. An intended change gets new baselines; an unintended one is a bug caught before production.

#### Evidence from the review (*measured* on the prototype: Chromium, reduced motion, Canvas and grain hidden, DPR 1)

- **Stability:** two separate runs of the same 6 full-page screenshots differed by **0 pixels**. Flakiness comes from changing environments (macOS vs Linux, a Chromium upgrade), not from the page itself, and running everything in the same Docker image removes that.
- **Size:** full-page PNGs are 0.9 MB (375), 1.2 MB (768) and 1.6 MB (1440). Revision 1's 40 snapshots would be about **40 MB per full refresh**, and git keeps every old version forever.
- **Speed:** about 2.5 s per screenshot, so about 1 min for 17 and under 2 min for 40.
- **A bug VRT already found:** the 1–3 px horizontal overflow (§1).

#### Tool

| Option | Verdict |
| --- | --- |
| **Playwright `toHaveScreenshot` + baselines in git** | **Use this.** No account, the same runner as E2E, and the Playwright HTML report has a diff slider. The smaller matrix keeps repository growth to about 10–20 MB per refresh. |
| Argos (Hobby: free, up to 5,000 screenshots a month; public repos have public screenshots) | **Planned fallback**, not used now. Baselines live in Argos instead of git, and approval is a button in its UI, so there are no update commits. Switch if the `.git` folder grows past about 200 MB or the update flow gets in the way. The test code stays the same apart from the screenshot call. |
| Lost Pixel / Chromatic / Git LFS | Rejected (§14). |

#### Coverage: 17 snapshots (D6)

| Group | Snapshots | Why |
| --- | --- | --- |
| zh-TW full page × 375/768/1440 × light/dark | 6 | The main locale, at every breakpoint and in both themes |
| en, ja, ko full page × 375/1440, light | 6 | Long English and Korean strings break layouts **by width**, not by theme. Theme colors are tokens shared by all locales, so zh dark already covers dark mode. |
| States | 5 | mobile menu open (zh, light and dark), language menu open (zh 1440), 404 (375 light), privacy disclosure open (en 375) |

- The full matrix (24 full pages plus states) is tagged `@full` and runs only when triggered by hand (`npm run vrt:full` or the workflow input) before a launch or a redesign. Its extra baselines are kept in a separate folder that is not committed by default.
- **Stabilizers:**
  - `reducedMotion: "reduce"`, `animations: "disabled"`, `caret: "hide"`.
  - `stylePath: tests/vrt/vrt.css` hides the Canvas, grain and cursor.
  - `page.clock.setFixedTime(...)` plus a mask on the clock.
  - Wait for `document.fonts.ready`, and do one scroll pass before capturing.
  - DPR 1, Chromium only.
  - Pixel thresholds: `maxDiffPixelRatio: 0.002` and per-pixel `threshold: 0.2`.
  - `updateSnapshots: "none"` in CI.
- **Where baselines live:** `tests/vrt/__screenshots__/` (about 20 MB).
- **Environment:** generated and compared **only** inside `mcr.microsoft.com/playwright:v<pinned>-noble`, locally through `npm run vrt` and `npm run vrt:update`, which wrap `docker run`. Plain `npx playwright test --project=vrt` on a Mac refuses to run.

#### Updating baselines (no personal access token needed)

1. A PR changes the UI and the `browser` check fails on VRT. Open the run → Artifacts → `playwright-report` → the failed test → *Diff / Slider*.
2. If the change is intended, go to Actions → **Update VRT baselines** → Run workflow → choose the PR branch. It regenerates the snapshots in the pinned image and commits them with the built-in `GITHUB_TOKEN`.
3. GitHub does not start normal CI for commits pushed with `GITHUB_TOKEN`. It shows the PR's runs as **"Approve workflows to run"**, and Luke clicks that button once. The same workflow can also start CI on the branch itself with `gh workflow run ci.yml --ref <branch>`, because `workflow_dispatch` events are allowed to start runs. Phase M1 decides which is smoother. Revision 1's `VRT_PUSH_TOKEN` is **dropped**.
4. In the PR, GitHub's image diff (2-up, swipe, onion skin) shows the new PNGs. Review them, then merge.
5. Never update baselines to silence an unintended diff.

### 11.4 Accessibility checks: axe

- `@axe-core/playwright` inside the `browser` job, on 4 locales × 2 themes, with the mobile menu, language menu and privacy disclosure open.
- Tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. Any violation fails.
- Scans run after a full scroll with motion on, and again with reduced motion.

### 11.5 Lighthouse CI

- `@lhci/cli autorun` on the local build (GA off), for `/` and `/en` (ja and ko are covered by the same templates), mobile preset, 3 runs, median.
- **Blocking assertions:** accessibility ≥ 0.95, SEO = 1, best practices ≥ 0.95, CLS ≤ 0.05, `total-byte-weight` ≤ 700 KB.
- **Warnings only:** performance ≥ 0.85, LCP ≤ 2.5 s, TBT ≤ 200 ms. They are noisy on shared runners; the deterministic byte budgets in `quality` do the blocking.

### 11.6 GitHub Actions and the ruleset

- **`.github/workflows/ci.yml`** runs on `pull_request`, `push` to `main` and `workflow_dispatch`. A `concurrency` group cancels outdated runs, and npm and `.next/cache` are cached.

| Job | Required? | Contents | Typical time |
| --- | --- | --- | --- |
| `quality` | yes | lint, `tsc`, Vitest with coverage, `next build`, budget script | about 2 min |
| `browser` | yes | in the Playwright container: build, E2E (2 projects), axe, VRT (17); upload `playwright-report` on failure | about 5 min |
| `lighthouse` | yes (only the blocking assertions above) | build, LHCI | about 3 min |

- **`update-vrt.yml`:** runs only when triggered by hand (§11.3).
- **Cost:** the repo is public, so GitHub-hosted runner minutes are free.
- **Ruleset:** worth keeping, and a one-time setup.
  - Agents open the PRs here. Without a ruleset, a red PR or a direct push to `main` can reach production.
  - In GitHub, go to Settings → Rules → Rulesets → New branch ruleset, target `main`:
    - Require a pull request, with 0 approvals (Luke works alone).
    - Require status checks `quality`, `browser`, `lighthouse`.
    - Block force pushes.
    - Add the *Repository admin* role to the bypass list for emergencies.
  - Free for public repositories.
  - The Vercel check is **not** required: a Vercel-side delay or quota issue should not block merges, and CI already builds.

### 11.7 Manual checks before launch

- **Devices:** iPhone Safari, Android Chrome, Windows Chrome or Edge (to check the font fallback), macOS Safari, each at 375, 768 and 1440.
- **Accessibility:** keyboard only, VoiceOver, NVDA, and the motion pause toggle.
- **Performance:** slow 4G (the hero must be readable before the Canvas appears), and PageSpeed Insights on production with GA.
- **Analytics:** the GA DebugView walkthrough (§9.7).

---

## 12. Order of work: five milestones, `main` always deployable

Each milestone is **its own PR**, merged only when CI is green, so production improves step by step and any step can be reverted alone.

| Milestone | Scope | Exit criteria |
| --- | --- | --- |
| **M0. Ship the approved design** (this PR) | Plan approved, then merge PR #1. `/design` gets `noindex`. Production shows the prototype instead of the starter page. | Luke approves the plan and merges |
| **M1. Foundation and structure** | CI (`quality` and `browser` without VRT), Vitest and Playwright setup, `cacheComponents` off, two root layouts, cookie redirect, typed dictionaries, metadata, hreflang, sitemap, robots, 404, security headers; port the sections as Server Components and islands; overflow fix; remove `contact.note` | E2E, axe and content guards green; visually equal to the prototype on manual check |
| **M2. Performance and accessibility** | font subset pipeline, lazy motion and Canvas, CSS hero intro, pause toggle, Experience rows readable without expanding, accessibility fixes, budget script, LHCI; delete `/design` and `components/design` | budgets and LHCI blocking assertions green; PageSpeed Insights mobile ≥ 90 on the preview |
| **M3. Analytics, privacy and social** | GA (`lazyOnload`, Consent Mode, opt-out), `track()` and events, Vercel Web Analytics, privacy notice, static OG images, JSON-LD, Search Console meta tag, translation notes, ja and ko `noindex` gate | analytics E2E green; DebugView walkthrough done after merge |
| **M4. VRT and launch checks** | Generate the 17 baselines in Docker, add the `update-vrt` workflow and the ruleset (Luke), README runbook; custom domain (D2), UTM links on LinkedIn and CakeResume, LinkedIn Post Inspector, Search Console sitemap | all three checks required and green; the manual list in §11.7 is done |
| **Later** | Native ja and ko review → remove `noindex` and add them to hreflang and the sitemap; the résumé PDF if wanted | — |

VRT arrives in M4 on purpose. Baselines taken while M1–M3 are still changing the UI would need regenerating on almost every PR, and that churn is exactly the cost the review found.

---

## 13. Maintenance runbook for Luke

**Changing text** (for example a new job or an edited bullet):
1. Edit `lib/i18n/dictionaries/zh-TW.ts`, then update en, ja and ko, or ask an agent to translate them and mark ja and ko for review in `docs/content-review.md`.
2. Run `npm run fonts` if a new Chinese, Japanese or Korean character appears. CI tells you if you forget.
3. Open a PR. Expect VRT to fail for the changed locales; review the diff and run **Update VRT baselines**.
4. If the tagline or name changed, run `npm run og` to regenerate the OG images.
5. Merge. Vercel deploys. If something is wrong, use Instant Rollback (§10.4).

**Expected upkeep:**
- Dependabot PRs about once a month, merged only when green.
- A Playwright bump plus a baseline refresh about twice a year.
- Nothing else recurring.

---

## 14. Review changelog (revision 1 → 2)

### Changed, ordered by severity

| Severity | Issue found | Change |
| --- | --- | --- |
| Critical | `dynamicParams = false` **fails the build** with `cacheComponents: true`, which this repo has enabled | Turn off `cacheComponents` and `partialPrefetching`; everything is static (§2.1) |
| Critical | ja, ko and en pages could suggest language proficiency the résumé doesn't claim; ja and ko are unreviewed and contain at least one wrong term | Translation note, native-review gate, `noindex` until reviewed, `knowsLanguage` removed from JSON-LD (§3.2, D3) |
| Critical | GA set cookies for EU visitors with no consent handling and no privacy notice | Consent Mode v2 regional defaults, privacy disclosure, Google signals off (§9.4, D5) |
| Critical | Looping Canvas, marquee and mock with no pause control fails **WCAG 2.2.2 (A)**; reduced motion alone is not enough | Visible pause toggle (§5.1) |
| High | `proxy.ts` rewrite plus `/zh-TW` redirect was fragile (RSC prefetch) and ran a function on every visit to `/` | Two root layouts, and the cookie redirect in `next.config` `redirects` with `has` (§2.2) |
| High | Font plan: build-time subsetting needs about 30 MB of sources or network at build; `next/font/local` would preload all three families everywhere | Committed exact-glyph subsets (sizes measured), coverage test, `preload: false` plus one manual preload, OFL file (§5.2) |
| High | Budgets ambiguous: 180 KB "initial JS" vs LHCI counting lazy chunks; `gtag.js` (about 180 KB compressed, measured) ignored | Budgets split by what is measured and how; GA `lazyOnload`; production PSI target includes GA (§5.3, §9.1) |
| High | VRT: 40 full pages ≈ 40 MB per refresh in git history; baselines taken while the UI still changes = churn; `VRT_PUSH_TOKEN` unnecessary | 17 snapshots plus an opt-in full run, VRT moved to M4, update flow without a personal token, Argos as documented fallback (§11.3, D6) |
| High | Email address looks like a phone number | Decision D1 |
| High | One big launch PR with 9 phases; production stays on the starter page for the whole build | 5 milestones as separate mergeable PRs, interim site at M0 (§12, D4) |
| Medium | `x-default` pointed to Chinese | `x-default` → `/en` (§4) |
| Medium | No CSP or security headers; nonce CSP would force dynamic rendering | Static header set with documented `'unsafe-inline'` trade-off (§10.2) |
| Medium | Events fired before `gtag.js` loads were dropped (`window.gtag` check); unnecessary beacon option | `gtag` shim queues into `dataLayer`; beacon option removed (§9.1) |
| Medium | No way to exclude Luke's own visits; GA alone undercounts; no DebugView procedure | `?notrack=1`, Vercel Web Analytics, Tag Assistant walkthrough (§9.3, §9.5, §9.7) |
| Medium | Lighthouse performance as a hard gate is flaky on shared runners | Performance warns only; deterministic byte budgets block instead (§11.5, §5.3) |
| Medium | 5 CI jobs, 4 browser projects, a second build just for GA tests | 3 required jobs, 2 E2E projects, one build with GA forced on and the network blocked (§11.2, §11.6) |
| Medium | `next/og` with CJK needs embedded TTF/OTF fonts (Satori doesn't read WOFF2) | Static OG PNGs generated by a script (§4) |
| Medium | Horizontal overflow (1–3 px) found by the VRT probe | Fix plus a global E2E assertion (§1, §11.2) |
| Medium | Experience details hidden behind "expand" for scanning hiring managers | Summary and first bullet always visible (§6) |
| Medium | No rollback, custom-domain or Search Console verification procedure | §10.3, §10.4, §4 |
| Low | JavaScript language wipe that survives a reload | CSS cross-document View Transitions (§2.2) |
| Low | `requestIdleCallback` is missing in older Safari | `setTimeout` fallback (§5.1) |
| Low | Leftover 「設計提案 v1 · 僅供審閱」 footer note | Removed in M1, and a content guard checks it |
| Low | No runbook for Luke | §13 |

### Considered and rejected

| Idea | Why not |
| --- | --- |
| Static export (`output: "export"`) | Loses the `redirects` with cookie conditions and `headers()`; Vercel already serves prerendered pages from its CDN |
| Redirect by `Accept-Language` | Google advises against it; crawlers would see inconsistent content; the explicit switcher plus cookie is enough |
| Proxying GA through the site's domain to dodge ad blockers | Overrides the visitor's choice, and is complex; Vercel Web Analytics covers counting instead |
| A consent banner for everyone | Hurts the first impression for the Taiwanese audience; regional Consent Mode defaults cover the EU case (D5 can still change this) |
| Obfuscating the email with JavaScript | Modern harvesters run JavaScript; it breaks no-JS and screen-reader use; Gmail filters spam well. The real issue is the address itself (D1) |
| Nonce-based CSP | Forces dynamic rendering of every page |
| Git LFS for baselines | GitHub's free LFS bandwidth is consumed by every CI checkout; extra setup for little gain at 17 snapshots |
| Chromatic | Built around Storybook, which this project does not use |
| Lost Pixel | In open-source mode it does what plain Playwright does; the hosted version is paid |
| Argos right now | A good tool, but it adds an account and an external dependency; kept as the documented fallback |
| Keeping the full 40-snapshot VRT on every PR | Repository growth and review fatigue; kept as an opt-in run |
| Dropping VRT, axe or Lighthouse CI entirely | Each costs minutes and protects a known risk: visuals across 4 locales, accessibility, and performance (the prototype scored 56) |
| Dropping the ruleset | Agents open PRs and Luke merges from the UI; the ruleset is what makes "red = can't merge" real; a one-time 2-minute setup |
| Keeping `VRT_PUSH_TOKEN` | A long-lived personal token in repo secrets is avoidable; "Approve workflows to run" or `workflow_dispatch` does the same job |
| Running CI against Vercel previews | Needs the protection-bypass secret; the local production build tests the same code |
| Removing Lenis | Part of the approved feel; about 5 KB; already off on touch devices and under reduced motion |
| Removing ja and ko entirely | Luke asked for them; the review gate and noindex manage the risk instead |
| Self-hosting fonts by subsetting at Vercel build time | Needs source fonts in the repo or network at build; committed subsets are smaller and deterministic |
