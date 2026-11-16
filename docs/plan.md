# Implementation plan: from `/design` prototype to the real site

Status: **plan for final approval, revision 3. Luke's decisions D1–D6 are applied. No production code yet.** Luke gives the final approval before any implementation starts, including the small pre-merge commit for M0.

Inputs:
- `docs/design.md`: the approved direction 「藍上的光」
- `resume_v3_zh.md`: the only source of facts
- The `/design` prototype on this branch

What changed in each revision, and what was considered but rejected, is listed in **section 14, Review changelog**. Everything Luke has to do himself is collected in **§13.2**. Numbers marked *measured* come from real runs on this branch, not estimates.

---

## 0. Decisions and defaults

### 0.1 Luke's decisions (answered 2026-11-16)

| # | Decision | Outcome | Where it is applied |
| --- | --- | --- | --- |
| D1 | Contact email | **Keep `t0921988961@gmail.com`**, with a protection layer: the plain address never appears in static HTML, JSON-LD, the sitemap, OG images or the JS bundle. It is assembled in the browser only after a click, and LinkedIn and CakeResume stay the primary contact options. | §10.6, §10.7, §13.3 |
| D2 | Custom domain | **None for now.** Stay on `luke-look.vercel.app`. Every absolute URL comes from `NEXT_PUBLIC_SITE_URL`, so switching later follows the checklist in §10.3. | §10.3 |
| D3 | ja and ko review | **No native reviewers yet.** ja and ko ship with the translation note, `noindex`, and are left out of the sitemap and hreflang until reviewed. | §3.2, §4 |
| D4 | Interim site | **Yes, merge PR #1 first** after final plan approval, after one small pre-merge hardening commit. | §12 (M0) |
| D5 | Consent banner | **Yes.** A non-blocking banner in 4 languages with Consent Mode v2: GA is denied by default everywhere and granted only after "Accept". The choice is remembered and can be changed from the footer. | §9.4 |
| D6 | VRT matrix | **17 snapshots on every PR. The full matrix (38 snapshots: 4 locales × 3 widths × 2 themes, plus states) runs only when triggered by hand (`workflow_dispatch`)** before major redesigns and before launch. | §11.3 |

### 0.2 Content defaults from Luke's open questions (unchanged)

| # | Question | Default |
| --- | --- | --- |
| 1 | English company names | Chinese names stay for **坤侑科技 / 巧禾數位 / 佳因企業** in every locale; MiTAC and New Kinpo Group (Kinpo Electronics) use English names. Spelling follows the résumé: 「坤侑」, not 「坤佑」. |
| 2 | Photo | No photo; keep the vertical 「鄭宏璋」. `Hero` has an optional `portrait` prop. |
| 3 | Hero tagline | 「讓複雜的系統，變得清楚好用。」 and its translations. This is the only line on the site that does not come from the résumé, and Luke has approved it. |
| 4 | Résumé PDF | No download yet. A slot shows a button in Contact and the mobile menu only when `site.resume[locale]` is set; the `resume_download` event is already wired. |
| 5 | Language detection | No automatic redirect from `Accept-Language`. The URL decides the language, and an explicit choice (cookie) is honored on `/`. |
| 6 | `/design` | Removed at the end of M2 (§7). |
| 7 | Contact order | LinkedIn and CakeResume are the two primary buttons. Email is a secondary 「顯示 Email」 button. |
| 8 | Address shown after reveal | `t0921988961+portfolio@gmail.com`. It reaches the same inbox, lets Gmail label mail sent from the site, and shows whether spam came from the site. It is a one-line change back to the plain address (§10.6). |

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
| Google `gtag.js` (not loaded yet) | about 548 KB raw, about 180 KB compressed (*measured* for `G-G5PL64KQG6`) | loaded only after consent, with `lazyOnload` (§9.1) |

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
  contact.ts            encoded email parts; client-only, never imported by Server Components (§10.6)
components/
  shell/      RootShell (fonts, boot script, GA, Vercel Analytics, JSON-LD), HomePage
  sections/   Hero About Experience Work Approach Skills Contact Footer   (Server Components)
  islands/    SiteHeader ThemeSwitch LanguageSwitch MotionToggle MobileMenu ExperienceList
              EmailReveal ConsentBanner CookieSettingsLink
              DashboardMock ApproachStage HeroCanvas                     (Client Components)
  motion/     MotionRoot (Lenis + GSAP reveals, lazy), useMotionPreference
  ui/         Icons LogoMark SplitWords SectionHead
assets/fonts/ generated WOFF2 subsets + OFL.txt
public/og/    zh-TW.png en.png ja.png ko.png
scripts/      subset-fonts.mjs  generate-og.mjs  generate-icons.mjs  check-no-email.mjs
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

### 3.2 Translation honesty and quality (D3: no native reviewers yet)

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
- **JSON-LD `Person`**, factual only: name, alternate name 鄭宏璋, job title, Taipei, `sameAs` LinkedIn and CakeResume. **No `email` property** (D1) and no GitHub.
- **robots.txt** also carries the AI-crawler rules from §10.7.
- **OG images are static PNGs** in `public/og/{locale}.png` (1200×630), referenced from metadata.
  - `scripts/generate-og.mjs` renders an HTML template with the real fonts and a static horizon frame using Playwright, so the image matches the site exactly. The images are regenerated only when the tagline or name changes.
  - This replaces runtime `next/og`: Satori cannot use WOFF2 and needs CJK font files embedded, which was extra complexity for 4 images.
- **Search Console:**
  - Use a URL-prefix property for `https://luke-look.vercel.app/` (D2), verified with an HTML meta tag (`metadata.verification.google` from the env var `GOOGLE_SITE_VERIFICATION`). A Domain property is not possible on `vercel.app`.
  - If a custom domain is added later, use a Domain property verified by DNS TXT.
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
| Production PageSpeed Insights (first visit: consent banner, no GA) | performance ≥ 90, LCP ≤ 2.5 s, TBT ≤ 200 ms | manual check after each deploy | — |
| Production after Accept (GA loaded with `lazyOnload`) | TBT ≤ 200 ms | manual Lighthouse in Chrome DevTools with consent stored | — |
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
- **Consent banner (§9.4):**
  - It is a labelled region (`role="region"`, `aria-labelledby`), **not a modal**: no focus trap, no backdrop, no scroll lock, and it never takes focus on load.
  - It sits in the DOM right after the skip link, so keyboard and screen-reader users reach it early.
  - 「接受」 and 「拒絕」 are equal in size and emphasis.
  - Under reduced motion it appears without animation.
- **Email reveal (§10.6):** a real `<button>` with `aria-expanded` and `aria-controls`. The revealed address is announced through a polite live region, and focus moves to the new 「複製」 button.
- **Checking:** axe (§11.4), plus one manual pass each with keyboard only, VoiceOver (zh-TW and en) and NVDA.

---

## 7. Cleanup: starter content and `/design`

- **M0** (merging PR #1, D4) removes the starter page and the 「Auto-deploy test」 line from production, because `/` renders the approved design. One **small pre-merge hardening commit** on PR #1 is made first, after final approval:
  1. The prototype's plain email (in `LINKS.email`, the contact section and `mailto:`) is replaced with the click-to-reveal button (§10.6), so the address never reaches production HTML.
  2. Remove 「設計提案 v1 · 僅供審閱」 from the footer.
  3. Add `robots: noindex` to `/design`.
  4. Fix the 1–3 px horizontal overflow (`overflow-x: clip` on the skills section).

  The interim site loads no analytics, so it needs no consent banner yet.
- **M2** deletes `/design` and `components/design/` once the sections are ported. Until then, `/design` gets `robots: noindex`.
- Replace `README.md` with a short README: scripts, the text-change runbook (§13), and how VRT updates work.
- `AGENTS.md` (generated by `next dev`) is committed on purpose, so agents get the Next 16 doc pointer.

---

## 8. Favicon set and manifest

- `app/icon.svg`, `app/favicon.ico` and `app/apple-icon.png` already exist at the app root. Root-level metadata files apply under both root layouts; E2E checks the `<link>` tags.
- `app/manifest.ts` with 192 and 512 icons generated by `scripts/generate-icons.mjs`.

---

## 9. Analytics and privacy

### 9.1 GA4 loading (`G-G5PL64KQG6`, production only, after consent)

- **Basic Consent Mode:** `gtag.js` is **not downloaded at all until the visitor clicks 「接受」** (D5). Before that, no request goes to Google, so there is nothing to gate later and nothing to clean up.
- Once accepted, GA is loaded with `next/script` **`strategy="lazyOnload"`** on every later page view.
  - `gtag.js` is about 180 KB compressed (*measured*), about as large as the whole site's JS, so it must stay out of the mobile TBT/INP window.
  - A visitor who never accepts is never counted in GA. Vercel Web Analytics still counts them anonymously (§9.5).
- GA is rendered only when **all** of these are true:
  - `VERCEL_ENV === "production"`
  - consent is granted
  - the device has not opted out (§9.3)
- GA settings: Google signals off, ads personalization off, data retention 14 months. GA4 does not log IP addresses.
- `track(name, params)` in `lib/analytics.ts`:
  - It defines the standard `gtag` shim (`window.dataLayer.push(arguments)`). gtag only processes `arguments` objects, not arrays.
  - Events fired **before consent are dropped, not queued**, so nothing from before "Accept" is sent later.
  - Events after consent but before `gtag.js` finishes loading are queued in `dataLayer` and sent when it arrives.
  - It does nothing in non-production builds or on opted-out devices.

### 9.2 Events

| Event | When | Parameters |
| --- | --- | --- |
| `contact_click` (mark as a **key event**) | LinkedIn, CakeResume, or the `mailto:` link shown after reveal, clicked | `method`, `location` (`hero` / `nav` / `menu` / `contact`) |
| `reveal_email` | 「顯示 Email」 clicked | `location` |
| `copy_email` | The copy button succeeds | `location` |
| `select_language` | The user picks a language | `from`, `to` |
| `select_theme` | The user picks a theme | `preference`, `resolved` |
| `toggle_motion` | The user pauses or resumes motion | `state` |
| `resume_download` | Slot for later | `locale` |

- Register `method`, `location`, `from`, `to`, `preference` and `state` as event-scoped custom dimensions in GA Admin.
- Enhanced Measurement's automatic outbound clicks stay on. The custom event adds labels and also covers `mailto:`.
- Consent choices are **not** sent to GA as events: a rejection must not be tracked. Accepted versus rejected counts are not needed.

### 9.3 Luke's own visits (internal traffic)

- Opening `https://luke-look.vercel.app/?notrack=1` once on each of Luke's devices sets `localStorage.notrack = "1"`. After that, neither GA nor Vercel Analytics loads or sends anything on that device, and the consent banner stays hidden. `?notrack=0` turns tracking back on.
- This is more reliable than GA's IP-based internal-traffic filter, because Taiwanese home and mobile IP addresses change.
- A small 「不追蹤中」 dot in the footer, visible only on opted-out devices, makes the state obvious.

### 9.4 Consent banner and privacy (D5)

This is not legal advice; it is a proportionate, standard setup for a personal portfolio.

**Consent Mode v2 states**

| Signal | Before a choice | After 「接受」 | After 「拒絕」 |
| --- | --- | --- | --- |
| `analytics_storage` | denied | **granted** | denied |
| `ad_storage`, `ad_user_data`, `ad_personalization` | denied | denied (always) | denied |
| `gtag.js` downloaded? | no | yes (`lazyOnload`) | no |

- `gtag('consent', 'default', …)` with every signal denied is pushed before any `config` call, then `gtag('consent', 'update', { analytics_storage: 'granted' })` on accept. Ads signals are never granted; the site has no ads.
- The banner is shown **in every region**. A static site cannot tell where a visitor is without a server, and one consistent behavior is simpler to test.

**Banner design** (matches 「藍上的光」, using the nav's glass surface):

- **Layout:**
  - Desktop: a compact card at bottom-left, max 420 px wide.
  - Mobile: a bottom sheet no taller than 30% of the viewport, so it never covers the hero CTA.
  - `position: fixed`, so there is **no layout shift**. The text is small, so it cannot become the LCP element.
- **Text** (zh; en, ja and ko in the dictionaries): 「本站使用 Google Analytics 了解瀏覽情況（不含廣告）。你可以接受或拒絕，之後也能在頁尾「Cookie 設定」變更。」
- **Controls:**
  - Buttons 「接受」 and 「拒絕」 with equal weight, and a link 「隱私說明」 that opens the footer disclosure.
  - There is no "×". Closing without a choice would be ambiguous, so the visitor picks one of the two.
- **Behavior:**
  - Not blocking: the page scrolls and every link works while the banner is visible.
  - It appears after hydration, with a short fade that is skipped under reduced motion. Accessibility details are in §6.
- **Remembered choice:**
  - Stored in `localStorage["consent.v1"] = { analytics: "granted" | "denied", ts }`.
  - The visitor is asked again after 12 months, or if the policy version (`v1`) changes.
  - No cookie is needed to remember the choice.
- **Changing it:**
  - A 「Cookie 設定」 link in the footer (all 4 languages) reopens the banner, with focus on its heading.
  - Switching from accepted to rejected sends `consent update` denied, deletes the `_ga` and `_ga_<id>` cookies, and stops sending. No reload is needed.

**Privacy notice:** a footer disclosure 「隱私 / Privacy」 in all four languages. It covers:
- what is collected: Google Analytics 4 only after consent, plus cookieless Vercel Web Analytics
- that there are no ads and no data is sold
- how to change the choice
- the Google opt-out browser add-on
- the `?notrack=1` switch
- that the email address is shown only on request (§10.6)

### 9.5 Ad blockers and a second source of numbers

- Many engineers, and some corporate networks, block GA, so GA **undercounts**. Use it for relative trends, UTM attribution and events, not absolute visitor counts.
- **Vercel Web Analytics** (`@vercel/analytics`) is a complement:
  - Cookieless and stores nothing on the device, so it is not gated by the banner (this is disclosed in the privacy notice). About 1 KB, served from the site's own domain, so it is blocked less often. If Luke wants it gated too, it is one condition in `RootShell`.
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

1. After deploying, open the site through **Tag Assistant** (tagassistant.google.com) and click 「接受」 on the banner (nothing loads before that). Tag Assistant turns on debug mode, so events appear in **GA → Admin → DebugView** without code changes. Its *Consent* tab shows the default and updated states.
2. Click each contact link, switch language, theme and motion, and confirm each event and its parameters in DebugView.
3. Do this **before** setting `?notrack=1` on that device, or temporarily use `?notrack=0`.
4. Check **Realtime** for a UTM visit from a phone using mobile data.

---

## 10. Vercel, security, contact protection and operations

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

### 10.3 Custom domain (D2: not now; this checklist is for later)

The launch stays on `luke-look.vercel.app`. Nothing in the code hard-codes the host, so switching later is configuration only:

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

### 10.6 Contact and email protection (D1)

**Goal:** keep `t0921988961@gmail.com` (D1) but stop the site from becoming a *new* easy source of it for scrapers, AI crawlers and spam lists, while staying one click away for real people. LinkedIn and CakeResume stay the primary contact options.

**Where the address must never appear** (enforced by `scripts/check-no-email.mjs`, §11.1):
- static HTML, RSC payloads (the inline `self.__next_f` scripts), and plain text inside JS chunks
- JSON-LD, `sitemap.xml`, `robots.txt`, OG images and their alt text, metadata and `manifest`
- `public/`, and the README of the live site
- The script fails the build if it finds `t0921988961@`, `t0921988961+portfolio@`, `t0921988961%40` or `@gmail.com` in any build output, or `mailto:` in HTML or RSC output. JS chunks may contain the `mailto:` prefix itself, because the island builds the link on click.
- The username `t0921988961` alone (as in the CakeResume URL) is allowed; it is already public.

**How it works (client-side assembly):**
1. The Contact section renders **LinkedIn** and **CakeResume** as the two primary buttons, plus a secondary **「顯示 Email」** button. Hero, nav and the mobile menu link to `#contact`, not to `mailto:`.
2. `lib/contact.ts` is imported only by the `EmailReveal` client island, never by a Server Component, so nothing is serialized into the RSC payload.
   - It holds the address as **encoded parts**: the local part is stored reversed and split into chunks, the domain as character codes shifted by a small constant.
   - This is obfuscation, not encryption. It defeats regular-expression harvesters that scan HTML and JS for `something@domain`, which is what most bulk scrapers do.
3. On click, the island assembles the address in memory and shows it as text, together with two new controls:
   - **「複製」**, using `navigator.clipboard`. If that is unavailable, it falls back to selecting the text.
   - **「寄信」**, an `<a href="mailto:…">` **created only at this moment**.
4. Without JavaScript, a `<noscript>` line says 「請透過 LinkedIn 或 CakeResume 與我聯絡」.
5. GA (after consent) records `reveal_email`, `copy_email` and `contact_click` (method `email`).

**Address shown:** `t0921988961+portfolio@gmail.com` by default.
- Gmail delivers it to the normal inbox, and a filter can label it.
- If spam arrives addressed to `+portfolio`, Luke knows it was harvested from the site.
- Downside: a sophisticated spammer can strip `+portfolio`, and a few rare web forms reject `+` addresses. Neither matters for a `mailto:` link.

**Contact form: an option for later, not at launch.** The simplest robust version, if Luke ever wants one:
- **Stack:** a Next.js Route Handler `POST /api/contact`, which is the site's only dynamic route.
- **Bot defense, in this order:**
  - A **honeypot field**, hidden and `tabindex=-1`.
  - **Minimum fill time**, rejecting submissions faster than 3 s.
  - **Vercel BotID Basic**, an invisible check, free on all plans, verified with `checkBotId()` on the server.
  - A **Vercel WAF rate-limit rule** on `/api/contact`, for example 5 requests per 10 minutes per IP (check which plan offers it); otherwise a simple in-function limiter.
  - Server-side length and URL-count validation.
- **Delivery:** **Resend free tier** (3,000 emails a month, max 100 a day) sends the message to Luke's Gmail. Without a verified domain, Resend only sends to the account owner's own address, which is exactly this use case. The visitor's address goes in `reply_to`.
- **Why not Formspree free or Cloudflare Turnstile:**
  - Formspree adds a third party that receives visitor data. Its free tier is small, and its spam protection relies on reCAPTCHA, which brings consent and privacy implications.
  - Turnstile needs a Cloudflare account and a third-party script, while BotID is native on Vercel.
- **Why not at launch:**
  - A form is a new spam target, a dynamic endpoint, a secret (`RESEND_API_KEY`), and more tests.
  - Hiring managers in Taiwan normally reach out through LinkedIn, CakeResume or email anyway.
  - The reveal button already removes the address from scrapers' reach.

**What cannot be fully prevented**, stated plainly:
- The address is **already public elsewhere**: the résumé PDFs Luke has sent, CakeResume or LinkedIn contact info (depending on visibility settings), data-broker lists, and the `t0921988961` username itself. The site can only avoid being a *new* source.
- A headless browser or an AI agent that clicks buttons can reveal it, and a person can copy it by hand. The reveal is a speed bump, not a lock. BotID cannot protect a static button, only a server request.
- `robots.txt` (§10.7) is voluntary. Bots with fake user agents ignore it and may not be caught by the firewall.
- Phishing and fake-recruiter scams using Luke's public name or LinkedIn cannot be stopped by the site at all. The defense is inbox hygiene (§13.3).

### 10.7 AI crawlers and bots

- **`robots.txt`:**
  - **Block AI *training* crawlers**: `GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`, `meta-externalagent`.
  - **Allow** search engines and AI *search and assistant* agents (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`). Recruiters increasingly ask AI assistants "find a Vue engineer in Taipei", and since the email is not in the HTML, letting them read the page carries little risk.
- **Vercel Firewall → AI Bots Managed Ruleset** (available on all plans; Luke sets it once in the dashboard):
  - **AI Crawlers: Deny.** Enforced, not voluntary.
  - **AI Assistants: Allow.**
  - Optionally set **Bot Protection: Log** first, and move it to Challenge only if logs show abuse.
- **Not adopted:** `ai.txt` and `<meta name="robots" content="noai, noimageai">`. They are not standards and the major crawlers don't honor them, so they would only add noise.

---

## 11. Testing strategy

Three required CI jobs on every PR, plus two workflows that are only triggered by hand (`update-vrt.yml` and `vrt-full.yml`).

```
quality (Vitest + lint + types + budgets + no-email guard)   browser (Playwright E2E + axe + VRT Tier 1)   lighthouse (LHCI)
```

### 11.1 Unit and component tests: Vitest + Testing Library

- **Setup:** `vitest.config.ts` (jsdom, `@vitejs/plugin-react`, `vite-tsconfig-paths`), `@testing-library/jest-dom`, coverage with v8 (`lib/` ≥ 90%).
- **Limitation:** async Server Components cannot be rendered in Vitest, so they are covered by E2E.

| Area | What is tested |
| --- | --- |
| `lib/i18n`, `lib/metadata` | locale paths; canonical and alternates contain only indexable locales; `x-default` → `/en`; noindex for unreviewed locales |
| `sitemap.ts`, `robots.ts` | only indexable locales; non-production disallows everything |
| `lib/analytics` | the `gtag` shim pushes `arguments`; nothing is sent when disabled, opted out, or **before consent** (events are dropped, not queued); event names and parameters |
| `lib/consent` | default denied; accept and reject transitions; stored shape `consent.v1`; re-asks after 12 months or on a version change; switching to rejected deletes the `_ga*` cookies; ads signals never granted |
| `lib/contact` | the encoded parts decode to the configured address; the module is never imported by a Server Component (lint rule plus test) |
| `tokenize()` | CJK punctuation, Latin runs, Korean spacing |
| Theme store | `resolveTheme()`, saving and reading the preference |
| `ThemeSwitch`, `LanguageSwitch`, `MotionToggle`, `MobileMenu`, `ExperienceList`, `EmailReveal`, `ConsentBanner` | ARIA attributes, keyboard support, events fired, failures handled quietly; `EmailReveal` renders no address and no `mailto:` before the click; `ConsentBanner` has equal-weight buttons and no focus trap |
| **Content guards** | all four locales have the same structure; no `github` anywhere; **number allowlist** taken from the résumé; subscription numbers only appear with the 「產品規模 / 平台訂閱數」 wording; contact links are exact; `contact.note` is gone |
| **Font coverage** | every character in each dictionary exists in that locale's subset |
| **Budgets** | the build-output size script (§5.3), run after `next build` in the `quality` job |
| **No plain email** | `scripts/check-no-email.mjs` scans `.next` output (HTML, RSC, JS chunks), `public/`, the generated sitemap and robots, and the OG metadata for the patterns in §10.6. It runs after `next build` in the `quality` job and blocks the merge. |

### 11.2 End-to-end tests: Playwright

- **Projects:** `chromium-desktop` (1440×900) and `webkit-mobile` (375×812, touch). Revision 1's Firefox and tablet E2E projects are dropped: they add CI time without covering a distinct risk, and 768 is still covered by VRT.
- **Builds:** CI builds **once** with `ANALYTICS_FORCE=1`, which treats the build as production for analytics; consent is still required. Every Google domain is blocked by `page.route`, so no data is ever sent, but the request attempts can still be observed. Every spec exercises the real consent and analytics code.
- **Default state:** an init script stores a choice (`consent.v1` = denied) so the banner doesn't cover other tests. The `consent` spec starts from an empty `localStorage`.
- **Global checks in every spec:** no console errors, no CSP violations, and **no horizontal overflow** (`scrollWidth ≤ innerWidth`).

| Spec | Scenarios |
| --- | --- |
| `theme` | follows the OS by default; choosing a theme survives reload; System follows a live `emulateMedia` change; **no flash**: `data-theme` is already correct at `DOMContentLoaded` |
| `i18n` | each URL has the correct `lang`, `h1` and nav; the switcher moves between `/`, `/en`, `/ja` and `/ko` and keeps the hash; after choosing English, a fresh visit to `/` redirects to `/en` with UTM parameters kept; an unknown path returns 404 through `global-not-found`; ja and ko have `noindex` while unreviewed |
| `menu` (webkit-mobile) | focus trap, Esc, links close the menu, page scroll is locked |
| `consent` | **First visit:** the banner is visible in the page's language and doesn't cover the hero CTA at 375 (bounding-box check); the page scrolls and links work underneath; consent `default` is all denied and **no request** to `googletagmanager.com` happens. **Reject:** still no GA request, the choice survives reload, and the banner is gone. **Accept:** `consent update` grants `analytics_storage` (ads stay denied) and a `gtag/js` request is attempted after load. **Footer 「Cookie 設定」:** reopens the banner with focus on its heading; switching to Reject deletes the `_ga*` cookies. **Keyboard:** reachable early, both buttons operable, no focus trap. **`?notrack=1`:** the banner is hidden and GA is never requested. Runs in all 4 locales on `chromium-desktop` and in zh on `webkit-mobile`. |
| `analytics` | after Accept: `window.dataLayer` receives `contact_click` (LinkedIn, CakeResume, email), `reveal_email`, `copy_email`, `select_language`, `select_theme` and `toggle_motion` with the right parameters. Before consent and after Reject: none of these reach `dataLayer`. |
| `contact` | before the click, the HTML, `document.body.innerText` and all `<a href>` values contain neither the address nor `mailto:`. 「顯示 Email」 reveals `t0921988961+portfolio@gmail.com`, announces it through the live region, and focuses 「複製」. Copy works (clipboard permission granted in the test). The 「寄信」 link has the correct `mailto:`. With JavaScript disabled, the `<noscript>` text shows. LinkedIn and CakeResume are the primary buttons. |
| `seo` | canonical, hreflang (indexable locales plus `x-default` → `/en`), OG tags and image URLs, JSON-LD without email or GitHub; sitemap and robots content, including the AI-crawler rules in §10.7; icons |
| `motion` | with motion on, every `[data-reveal]` ends visible after scrolling; the pause toggle stops the Canvas, marquee and mock and is remembered; with reduced motion, everything is visible immediately and Lenis is absent |
| `links` | `rel="noopener noreferrer"` on external links, exact LinkedIn and CakeResume URLs, the résumé slot hidden while `null` |

### 11.3 Visual regression testing (VRT)

#### What it is

Commit reference screenshots ("baselines"). On every PR, CI takes the same screenshots and compares them pixel by pixel. Any difference fails the check and produces *expected / actual / diff* images. An intended change gets new baselines; an unintended one is a bug caught before production.

#### Evidence from the review (*measured* on the prototype: Chromium, reduced motion, Canvas and grain hidden, DPR 1)

- **Stability:** two separate runs of the same 6 full-page screenshots differed by **0 pixels**. Flakiness comes from changing environments (macOS vs Linux, a Chromium upgrade), not from the page itself, and running everything in the same Docker image removes that.
- **Size:** full-page PNGs are 0.9 MB (375), 1.2 MB (768) and 1.6 MB (1440). Refreshing all 17 PR snapshots adds about **16 MB** to git history; refreshing all 38 adds about **33 MB**. Git keeps every old version.
- **Speed:** about 2.5 s per screenshot, so about 1 min for the 17 PR snapshots and 1.5–2 min for all 38.
- **A bug VRT already found:** the 1–3 px horizontal overflow (§1).

#### Tool

| Option | Verdict |
| --- | --- |
| **Playwright `toHaveScreenshot` + baselines in git** | **Use this.** No account, the same runner as E2E, and the Playwright HTML report has a diff slider. |
| Argos (Hobby: free, up to 5,000 screenshots a month; public repos have public screenshots) | **Planned fallback.** Baselines would live in Argos instead of git, and approval is a button in its UI. Switch trigger: see repository size below. |
| Lost Pixel / Chromatic / Git LFS | Rejected (§14). |

#### Coverage (D6): two tiers

Tests are tagged `@pr` or `@full`. Every PR runs only `@pr` (17 snapshots). The **"VRT full matrix"** workflow, triggered by hand, runs both tags (38 snapshots).

**Tier 1, every PR, 17 snapshots (blocking):**

| Group | Snapshots | Why |
| --- | --- | --- |
| zh-TW full page × 375/768/1440 × light/dark | 6 | The main locale, at every breakpoint and in both themes |
| en, ja, ko full page × 375/1440, light | 6 | Long English and Korean strings break layouts **by width**, not by theme. Theme colors are tokens shared by all locales, so zh dark already covers dark mode. |
| States: consent banner (zh 375 light), email revealed (Contact section, zh 375 light), mobile menu open (zh 375 dark), language menu open (zh 1440 light), 404 (375 light) | 5 | The interactive states most likely to break |

**Tier 2, full matrix, run by hand (adds 21 snapshots, 38 total):**

| Group | Extra snapshots |
| --- | --- |
| en, ja, ko full page at 768 light, and at 375/768/1440 dark | 12 |
| Consent banner: zh 1440 dark, en 375 light, ja 375 light, ko 375 light | 4 |
| Mobile menu open zh 375 light; language menu open zh 1440 dark | 2 |
| Email revealed en 1440 dark; privacy disclosure open en 375 light; 404 at 1440 dark | 3 |

**When to run Tier 2:** before launch (M4), before any major redesign or theme-token change, and after a Playwright upgrade. Go to Actions → **VRT full matrix** → Run workflow → choose the branch.

**Tier 2 baselines go stale between runs.** Normal PRs only refresh the 17 Tier 1 baselines, so the 21 Tier 2 baselines fall behind whenever the UI changes. A Tier 2 run is therefore a **review checkpoint**:
1. Run it with `update: false`. Every diff since the last full run shows up together.
2. Review them in the report, the same way as for a PR.
3. Run it again with `update: true` to refresh all 38 baselines in one commit.

Tier 2 is not a required check, so a stale Tier 2 baseline never blocks a normal PR.

- Every full-page shot is taken **with a choice already stored**, so the banner doesn't appear on it; the banner has its own snapshots.
- Full-page shots show the Contact section **before** reveal. The address only appears in the clipped "email revealed" shots, which are in the public repo; the address is in those images either way.
- **Stabilizers:**
  - `reducedMotion: "reduce"`, `animations: "disabled"`, `caret: "hide"`.
  - `stylePath: tests/vrt/vrt.css` hides the Canvas, grain and cursor.
  - `page.clock.setFixedTime(...)` plus a mask on the clock.
  - Wait for `document.fonts.ready`, and do one scroll pass before capturing.
  - DPR 1, Chromium only.
  - Pixel thresholds: `maxDiffPixelRatio: 0.002` and per-pixel `threshold: 0.2`.
  - `updateSnapshots: "none"` in CI.
- **Where baselines live:** `tests/vrt/__screenshots__/{pr,full}/`, about 33 MB for all 38.

#### Repository size and mitigations

- **Expected growth:**
  - A zh-only text edit changes 6 Tier 1 shots, about 7 MB.
  - A Tier 2 checkpoint adds about 33 MB.
  - With about 10 visual updates and 2–3 checkpoints a year, `.git` grows by roughly 150–250 MB a year.
- **Mitigations:**
  1. **Lossless recompression.** The update workflows run `oxipng -o 4 --strip safe` on new PNGs. Playwright compares decoded pixels, not file bytes, so recompressed baselines still match. Typical savings are 10–30%; M4 measures the real number.
  2. **CI is unaffected.** `actions/checkout` fetches only the latest commit (`fetch-depth: 1`). `git clone --filter=blob:none` keeps Luke's own clones fast.
  3. **Clipped states.** State snapshots are viewport-sized or clipped to one section.
  4. **Switch trigger:** if `.git` passes about **300 MB**, move to Argos. The tests stay the same apart from the screenshot call.
- History is never rewritten to shrink the repository; that would break every clone and PR.
- **Environment:** generated and compared **only** inside `mcr.microsoft.com/playwright:v<pinned>-noble`, locally through `npm run vrt` and `npm run vrt:update`, which wrap `docker run`. Plain `npx playwright test --project=vrt` on a Mac refuses to run.

#### Updating baselines (no personal access token needed)

1. A PR changes the UI and the `browser` check fails on VRT. Open the run → Artifacts → `playwright-report` → the failed test → *Diff / Slider*.
2. If the change is intended, go to Actions → **Update VRT baselines** → Run workflow → choose the PR branch. It regenerates the Tier 1 snapshots in the pinned image, recompresses them with `oxipng`, and commits them with the built-in `GITHUB_TOKEN`.
3. GitHub does not start normal CI for commits pushed with `GITHUB_TOKEN`. It shows the PR's runs as **"Approve workflows to run"**, and Luke clicks that button once. The same workflow can also start CI on the branch itself with `gh workflow run ci.yml --ref <branch>`, because `workflow_dispatch` events are allowed to start runs. Phase M1 decides which is smoother. Revision 1's `VRT_PUSH_TOKEN` is **dropped**.
4. In the PR, GitHub's image diff (2-up, swipe, onion skin) shows the new PNGs. Review them, then merge.
5. Never update baselines to silence an unintended diff.

### 11.4 Accessibility checks: axe

- `@axe-core/playwright` inside the `browser` job, on 4 locales × 2 themes, with the mobile menu, language menu, privacy disclosure, **consent banner** and **revealed email** open.
- Tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. Any violation fails.
- Scans run after a full scroll with motion on, and again with reduced motion.

### 11.5 Lighthouse CI

- `@lhci/cli autorun` on the local build, for `/` and `/en` (ja and ko are covered by the same templates), mobile preset, 3 runs, median. Lighthouse always starts as a first-time visitor, so it sees the **consent banner and no GA**, which is exactly what a new real visitor gets. The banner must not become the LCP element or cause layout shift.
- **Blocking assertions:** accessibility ≥ 0.95, SEO = 1, best practices ≥ 0.95, CLS ≤ 0.05, `total-byte-weight` ≤ 700 KB.
- **Warnings only:** performance ≥ 0.85, LCP ≤ 2.5 s, TBT ≤ 200 ms. They are noisy on shared runners; the deterministic byte budgets in `quality` do the blocking.

### 11.6 GitHub Actions and the ruleset

- **`.github/workflows/ci.yml`** runs on `pull_request`, `push` to `main` and `workflow_dispatch`. A `concurrency` group cancels outdated runs, and npm and `.next/cache` are cached.

| Job | Required? | Contents | Typical time |
| --- | --- | --- | --- |
| `quality` | yes | lint, `tsc`, Vitest with coverage, `next build`, budget script | about 2 min |
| `browser` | yes | in the Playwright container: build, E2E (2 projects, including consent and contact specs), axe, VRT Tier 1 (17); upload `playwright-report` on failure | about 5–6 min |
| `lighthouse` | yes (only the blocking assertions above) | build, LHCI | about 3 min |

- **`update-vrt.yml`:** triggered by hand; regenerates and recompresses the Tier 1 baselines (§11.3).
- **`vrt-full.yml`:** triggered by hand (`workflow_dispatch`, input `update: true/false`); runs all 38 snapshots and, with `update: true`, commits refreshed baselines. Not a required check.
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
- **Performance:** slow 4G (the hero must be readable before the Canvas appears), and PageSpeed Insights on production (first-visit state), plus one DevTools Lighthouse run after Accept.
- **Analytics:** the GA DebugView walkthrough (§9.7), including Reject → nothing in Realtime, and Accept → events appear.
- **Consent banner:** check it on a real iPhone and a real Android phone. It must not cover the hero CTA or the iOS home indicator (`env(safe-area-inset-bottom)`).
- **Email:** View Source on production and search for `gmail`: **zero hits**. Then click 「顯示 Email」 and send a test email to the `+portfolio` alias to confirm the Gmail filter.
- **Firewall:** a week after launch, read Vercel Firewall's AI-bot log and confirm the AI Crawlers deny rule is working.
- **VRT Tier 2:** run the full matrix once on the launch branch, review it, and refresh it.

---

## 12. Order of work: five milestones, `main` always deployable

Each milestone is **its own PR**, merged only when CI is green, so production improves step by step and any step can be reverted alone.

| Milestone | Scope | Exit criteria |
| --- | --- | --- |
| **M0. Ship the approved design** (this PR, D4) | After final plan approval: the pre-merge hardening commit (§7: email to click-to-reveal, footer note removed, `/design` noindex, overflow fix), then Luke merges PR #1. Production shows the approved design instead of the starter page. No analytics yet. | View Source on production has no `gmail`; Luke merges |
| **M1. Foundation and structure** | CI (`quality` and `browser` without VRT), Vitest and Playwright setup, `cacheComponents` off, two root layouts, cookie redirect, typed dictionaries, metadata, hreflang, sitemap, robots (including AI-crawler rules), 404, security headers; port the sections as Server Components and islands, including `EmailReveal` and the `check-no-email` guard | E2E, axe, content and no-email guards green; visually equal to the prototype on manual check |
| **M2. Performance and accessibility** | font subset pipeline, lazy motion and Canvas, CSS hero intro, pause toggle, Experience rows readable without expanding, accessibility fixes, budget script, LHCI; delete `/design` and `components/design` | budgets and LHCI blocking assertions green; PageSpeed Insights mobile ≥ 90 on the preview |
| **M3. Consent, analytics, privacy and social** | consent banner (4 languages, Consent Mode v2, footer 「Cookie 設定」), GA (`lazyOnload`, only after Accept, opt-out), `track()` and events, Vercel Web Analytics, privacy notice, static OG images, JSON-LD, Search Console meta tag, translation notes, ja and ko `noindex` gate | consent, analytics and contact E2E green; DebugView walkthrough done after merge |
| **M4. VRT and launch checks** | Tier 1 baselines (17) and `update-vrt.yml`; `vrt-full.yml` plus its first full run (38); ruleset (Luke); README runbook; UTM links on LinkedIn and CakeResume; LinkedIn Post Inspector; Search Console sitemap; Vercel AI-bot firewall settings (Luke) | the three required checks green; the first full matrix reviewed and refreshed; the manual list in §11.7 done |
| **Later (optional)** | native ja and ko review → remove `noindex` and add them to hreflang and the sitemap; the résumé PDF; the contact form (§10.6) if Luke wants one; a custom domain (§10.3) | — |

VRT arrives in M4 on purpose. Baselines taken while M1–M3 are still changing the UI would need regenerating on almost every PR, and that churn is exactly the cost the review found.

---

## 13. Runbook, Luke's to-do list and email safety

### 13.1 Changing text

1. Edit `lib/i18n/dictionaries/zh-TW.ts`, then update en, ja and ko, or ask an agent to translate them and mark ja and ko for review in `docs/content-review.md`.
2. Run `npm run fonts` if a new Chinese, Japanese or Korean character appears. CI tells you if you forget.
3. Open a PR. Expect VRT Tier 1 to fail for the changed locales; review the diff and run **Update VRT baselines**.
4. If the tagline or name changed, run `npm run og` to regenerate the OG images.
5. Merge. Vercel deploys. If something is wrong, use Instant Rollback (§10.4).

**Expected upkeep:**
- Dependabot PRs about once a month, merged only when green.
- A Playwright bump plus a Tier 2 checkpoint about twice a year.
- Nothing else recurring.

### 13.2 What Luke has to do himself (agents can't)

| When | Task |
| --- | --- |
| Now | Give **final approval** of this plan. Then an agent makes the M0 pre-merge commit, and **Luke merges PR #1**. |
| Now (independent of the site) | The Google account and Gmail steps in §13.3. Check the contact-info visibility settings on **CakeResume** and **LinkedIn**: show the email only to connections or recruiters, not publicly, where those settings exist. |
| M3, after merge | **Vercel dashboard** → Analytics → enable **Web Analytics**. **GA Admin**: mark `contact_click` as a key event; register the custom dimensions (§9.2); data retention 14 months; Google signals off. **Search Console**: add a URL-prefix property for `https://luke-look.vercel.app/`, copy the meta-tag token, and give it to the agent (env var `GOOGLE_SITE_VERIFICATION`). |
| M3, after merge | Open `https://luke-look.vercel.app/?notrack=1` **once on each of your devices**, after the DebugView check in §9.7. |
| M4 | **GitHub ruleset** for `main` (§11.6, about 2 minutes). **Vercel Firewall** → Rules → Bot Management → AI Bots: *AI Crawlers = Deny*, *AI Assistants = Allow* → Publish. |
| M4, after launch | Update the website links on **LinkedIn** and **CakeResume** to the UTM URLs (§9.6), then re-scrape with LinkedIn Post Inspector. In Search Console, submit `sitemap.xml`. |
| Whenever VRT fails on an intended change | Review the report, run **Update VRT baselines**, and click **Approve workflows to run** on the PR (§11.3). |
| Later | Find native ja and ko reviewers. Decide on a résumé PDF, a contact form and a custom domain. |

### 13.3 Email and account safety tips (no paid services)

1. **Google account:**
   - Turn on **2-Step Verification**, preferably with a **passkey** or a hardware security key rather than SMS. The email's local part looks like your phone number, which makes SIM-swap attempts more tempting.
   - Run **Google Security Checkup** (myaccount.google.com/security-checkup) and remove old devices and apps.
2. **Gmail filter for the site alias:**
   - Gmail → Settings → Filters → Create filter.
   - *To:* `t0921988961+portfolio@gmail.com` → Apply label 「Portfolio」, Never send to Spam.
   - Spam arriving at that alias came from the site. If it ever gets bad, change the alias in `lib/contact.ts`.
3. **Never act on a link that asks for credentials, payment or verification.**
   - Open the service directly (type the address or use a bookmark) instead of clicking.
   - Gmail's yellow and red warning banners and "via" sender labels are worth reading.
4. **Fake recruiter scams:**
   - Be suspicious of requests for an ID-card copy, bank account details, or a "deposit" or "equipment fee", or of a push to move to LINE or Telegram right away.
   - Verify through the company's official site or LinkedIn company page and an official domain email.
   - **Never run a take-home or "test project" repository from a stranger on your main machine.** Malicious `npm install` and postinstall scripts are a known trick against developers. Use a throwaway VM, a container, or GitHub Codespaces.
5. **Scam calls and texts:** an app such as Whoscall (free) helps. Taiwan's anti-fraud hotline is **165**.
6. **Report, don't reply.** Use Gmail's "Report phishing". Replying confirms the address is active.

---

## 14. Review changelog

### Revision 3: Luke's decisions (2026-11-16)

| Decision | What changed in the plan |
| --- | --- |
| **D1** keep `t0921988961@gmail.com`, protect it | New §10.6: the address never appears in static HTML, RSC, JS strings, JSON-LD, sitemap or OG; it is assembled client-side on click and `mailto:` is created only after interaction; LinkedIn and CakeResume are the primary buttons; `+portfolio` alias by default; `check-no-email` build guard; `contact` E2E spec; new `reveal_email` event. Contact form specified as a later option (honeypot, minimum fill time, BotID Basic, WAF rate limit, Resend free tier) and explicitly not built at launch. New §10.7: AI training crawlers blocked in `robots.txt` and the Vercel AI Bots ruleset, AI assistants and search allowed; `ai.txt` and `noai` rejected. New §13.3: email and account safety tips. Honest list of what cannot be prevented. |
| **D2** no custom domain | Search Console uses a URL-prefix property on vercel.app; the §10.3 checklist kept for later; no host hard-coded. |
| **D3** no native reviewers yet | ja and ko stay `noindex`, out of the sitemap and hreflang, with the translation note. |
| **D4** merge PR #1 first | M0 now includes a small pre-merge hardening commit (email reveal, footer note, `/design` noindex, overflow fix) so production never serves the plain address. |
| **D5** consent banner | Region-only consent defaults replaced by a banner shown everywhere: 4 languages, non-blocking, equal Accept and Reject, remembered for 12 months, reopened from the footer 「Cookie 設定」. GA uses Basic Consent Mode: `gtag.js` is not downloaded until Accept, events before consent are dropped, and rejecting deletes the `_ga*` cookies. New `consent` E2E spec, banner VRT shots, axe with the banner open; Lighthouse measures the first-visit state. Vercel Web Analytics stays ungated because it is cookieless (disclosed, and one condition to change). |
| **D6** VRT (revised by Luke) | **17 snapshots (Tier 1) on every PR**, blocking. The **full matrix of 38 (Tier 2)** runs only by hand through `vrt-full.yml` (`workflow_dispatch`) before launch, before major redesigns, and after Playwright upgrades; it is a non-blocking review checkpoint that refreshes the stale Tier 2 baselines. Size mitigations: lossless `oxipng`, shallow CI checkout, clipped states, and Argos if `.git` passes 300 MB. The Tier 1 states now include the consent banner and the revealed email. |

Considered and rejected in revision 3:

| Idea | Why not |
| --- | --- |
| A contact form at launch | A new spam target and dynamic endpoint with a secret; LinkedIn and CakeResume already cover contact; kept as a specified option |
| Formspree free | Visitor data goes to another third party; small free quota; reCAPTCHA-based spam protection brings privacy and consent baggage |
| Cloudflare Turnstile | Needs a Cloudflare account and a third-party script; Vercel BotID Basic is native and free |
| Blocking every AI bot, including assistants | Recruiters increasingly search with AI assistants; with the email out of the HTML, assistants reading the page is low risk |
| `ai.txt`, `noai` / `noimageai` meta | Not standards; major crawlers ignore them |
| Advanced Consent Mode (cookieless pings before consent) | Sends data before a choice; Basic is simpler to explain and test, and keeps 180 KB of `gtag.js` away from visitors who reject |
| Gating Vercel Web Analytics behind the banner | It is cookieless and stores nothing; disclosed instead (can be changed with one condition) |
| An image of the email address | Unreadable for screen readers, can't be copied, and OCR defeats it anyway |

### Revision 2 (adversarial review)

### Changed, ordered by severity

| Severity | Issue found | Change |
| --- | --- | --- |
| Critical | `dynamicParams = false` **fails the build** with `cacheComponents: true`, which this repo has enabled | Turn off `cacheComponents` and `partialPrefetching`; everything is static (§2.1) |
| Critical | ja, ko and en pages could suggest language proficiency the résumé doesn't claim; ja and ko are unreviewed and contain at least one wrong term | Translation note, native-review gate, `noindex` until reviewed, `knowsLanguage` removed from JSON-LD (§3.2, D3) |
| Critical | GA set cookies for EU visitors with no consent handling and no privacy notice | Consent Mode v2 regional defaults, privacy disclosure, Google signals off (§9.4, D5). *Superseded in revision 3 by a banner for every visitor.* |
| Critical | Looping Canvas, marquee and mock with no pause control fails **WCAG 2.2.2 (A)**; reduced motion alone is not enough | Visible pause toggle (§5.1) |
| High | `proxy.ts` rewrite plus `/zh-TW` redirect was fragile (RSC prefetch) and ran a function on every visit to `/` | Two root layouts, and the cookie redirect in `next.config` `redirects` with `has` (§2.2) |
| High | Font plan: build-time subsetting needs about 30 MB of sources or network at build; `next/font/local` would preload all three families everywhere | Committed exact-glyph subsets (sizes measured), coverage test, `preload: false` plus one manual preload, OFL file (§5.2) |
| High | Budgets ambiguous: 180 KB "initial JS" vs LHCI counting lazy chunks; `gtag.js` (about 180 KB compressed, measured) ignored | Budgets split by what is measured and how; GA `lazyOnload`; production PSI target includes GA (§5.3, §9.1) |
| High | VRT: 40 full pages ≈ 40 MB per refresh in git history; baselines taken while the UI still changes = churn; `VRT_PUSH_TOKEN` unnecessary | 17 snapshots plus an opt-in full run, VRT moved to M4, update flow without a personal token, Argos as documented fallback (§11.3, D6). Confirmed by Luke in revision 3 (Tier 1 / Tier 2). |
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
| A consent banner for everyone | Hurts the first impression for the Taiwanese audience; regional Consent Mode defaults cover the EU case. *Reversed in revision 3: Luke chose the banner (D5).* |
| Obfuscating the email with JavaScript | Modern harvesters run JavaScript; it breaks no-JS and screen-reader use; Gmail filters spam well. The real issue is the address itself (D1). *Reversed in revision 3: Luke keeps the address, so click-to-reveal is adopted (§10.6). It stays accessible (real button, live region) and has a `<noscript>` fallback to LinkedIn and CakeResume.* |
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
