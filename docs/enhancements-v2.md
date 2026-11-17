# Enhancements v2

Status: round 4 on `feature/enhancements-v2`. This branch does not touch production. `main` stays the release branch. Luke asked for the career story and the hero signature to come out. No new decoration was added after that.

Inputs: `docs/design.md`, `docs/plan.md`, and `resume_v3_zh.md`. S5-Style’s gallery (editorial timelines, drawn lines, chapter-like case studies) and Awwwards motion patterns (path-following, staged line drawing, a scrubbable story) were used as reference only. Nothing is copied.

## Ranked ideas

| Rank | Idea | Why it ranks here | Decision |
| --- | --- | --- | --- |
| 1 | Scroll- and play-driven SVG career story | A hiring manager can see the whole path (design → campaigns → war rooms → internal systems → VisionMax) in one glance. | **Removed.** Built in round 1 as `#journey`. Luke asked for it to be taken out in round 4. Experience is the list again. |
| 2 | Project detail disclosures | The work cards stop at one sentence. The résumé has a second layer (live video, map markers, SignalR, the rest of the finance clients) that never becomes a specialty claim or a personal subscription win. Native `<details>` keeps it static, keyboardable, and free of extra JavaScript. | **Build** |
| 3 | Jump from a story stage to the full experience entry | It only existed to connect the story to the list. | **Removed** with the story. |
| 4 | Skill percentages or a fake proficiency chart | The résumé lists tools. It does not rank them. A bar chart would invent numbers. | **Reject** |
| 5 | Sixth nav item for the story | The header is already full at 1440. The story lives inside Experience, where “查看經歷” already lands. | **Reject** |
| 6 | Lottie, Framer Motion, or a second animation runtime | GSAP is already the lazy motion runtime. The story uses CSS `pathLength` plus a few lines of geometry so the first bundle does not grow a library. | **Reject** |
| 7 | Sticky story on phones | A pinned 100vh scene clips the five captions on a 375-wide screen and fights the thumb. Desktop pins; mobile plays and scrolls the natural height. | **Reject sticky on small screens** |
| 8 | Autoplay on load | It would run beside the hero and the horizon. Play starts only from the button or from scrolling the story. | **Reject** |
| 9 | Hero Canvas rewrite | The horizon already pauses off-screen, caps DPR, and follows the palette. A rewrite risks Lighthouse and the look Luke approved. | **Leave the structure.** Round 2 only adds a second warm glint and draws fewer rows on a phone. The canvas stays in the lazy chunk. |
| 10 | Contact form | Already specified as later work in `docs/plan.md`. It adds a dynamic route and a secret. | **Leave** |
| 11 | Skill map with percentages | Same problem as rank 4. | **Reject percentages.** Round 2 draws one equal rule through the five résumé groups. Every group is the same size. |
| 12 | Magnetic buttons | Pointer tracking moves the hero actions. | **Removed** in round 4 with the hero signature. The CSS sheen on the contact button stays. |

## What shipped

- **Work details.** Each project can open a short factual panel. Subscription numbers stay worded as product scale. Map, live video, and SignalR stay features.

Round 2, still on this branch:

- **Skill rule.** Five résumé groups sit on one line. There is no score and no bar. The line draws once when motion is on, and it is already drawn when motion is off.
- **Light on the horizon.** A second warm glint crosses the existing Canvas. Phones draw fewer rows.
- **CSS hover only.** The desktop nav grows a warm underline, and the hero contact button gets a sheen. Neither runs under reduced motion or the pause toggle, and neither adds a library.

Round 3:

- **First-load JavaScript.** The experience panels, the email reveal, the approach stage, and the dashboard loop are plain HTML until a deferred chunk attaches their behaviour. The horizon canvas and the scroll motion engine wait until the browser is idle, so they stay out of the blocking window. First-load JS on every locale: 149.4 KB → 144.3 KB (budget 150 KB). The rest of the graph is 218.1 KB of 230 KB.
- **Main-thread time.** Local Lighthouse, three runs, median total blocking time: Chinese home 267 ms → 104 ms, English 269.5 ms → 111 ms. Both sit under the 200 ms warning. The earlier English runs were 257 ms, 276 ms, and 269.5 ms.
Round 3 also drew a LUKE signature (blue, apricot, coral) beside the greeting and let the hero buttons follow a fine pointer. **Both were removed in round 4 at Luke's request.** The hero is back to the approved greeting, title, and buttons. The contact button still has the CSS sheen. No replacement decoration was added.

## Removed at Luke's request

- The hero line-drawing signature, its blobs, and its underline (`WhoMark` and the styles that only served it).
- Magnetic movement on the hero buttons.
- The SVG career story 「一路走來」 (`#journey`), its play control, and the links from a station into an experience row.
- The education row (school and department) in every locale. Languages stay. Structured data has no `alumniOf`. `/llms.txt` does not mention a school.

## Performance, search, and browsers

No further decoration. The horizon canvas caps its frame rate on phones, Firefox and Safari, and caps its pixel density on phones, Firefox and data-saver. Lenis stays on Chromium (including Edge) and is left off where it fights the browser’s own scrolling. `prefers-reduced-transparency` drops the backdrop blur. JSON-LD is a Person, WebSite and ProfilePage graph. `/llms.txt` is a résumé summary with no email. Training crawlers stay blocked; search and assistant crawlers stay allowed. Speculation Rules were not added: on this site they prefetch `/` before the language cookie updates, and WebKit logs an error for prefetch on HTTP. Playwright also runs the suite in Firefox.

One layout bug was fixed after that: the Japanese featured title `VisionMax フリート管理プラットフォーム` was forced onto an unbreakable line, so on a phone it was clipped by the card and on a desktop it ran over the dashboard. It now breaks before プラットフォーム. The sources for that choice, and for the other non-obvious decisions on this branch, are in `docs/review-2026-11.md`.

A clean mobile Lighthouse pass is recorded in that same note. Next's redundant polyfill is no longer in the browser bundle (first-load JavaScript 144.3 KB to 143.9 KB). A deep link no longer animates the header border and shadow while the page is loading. Inlining the stylesheet was measured and left off: it removed a 150 ms render-blocking request and made LCP about 200 ms slower on simulated Slow 4G. The underline still draws with `stroke-dashoffset`.

## Release checklist

- [ ] Read the preview in zh and en, light and dark, phone and desktop. The hero should be the greeting and the title, with no LUKE drawing. Experience should be the list, with no route above it.
- [ ] Confirm the skill rule, the nav underline, the contact-button sheen, and “這個專案” still feel like the approved site.
- [ ] Pause motion, and turn on reduced motion. Loops stop. The skill line stays drawn.
- [ ] ja and ko stay `noindex` until a native reader signs `docs/content-review.md`.
- [ ] Do not merge this branch until Luke says so. `main` is still the production branch.

## Content rules

Years stay in `PERIODS` (already on the page). New dictionary strings use only résumé numbers. WebRTC is not named; the résumé’s feature is 即時影像. The 500 → 10,000+ line, where it appears, is product scale (訂閱 / subscriptions / 契約数 / 구독). No GitHub link. Education was removed from every locale at Luke's request; it is not in the page, the dictionaries, or the structured data. Japanese and Korean copy still needs a native reader (`docs/content-review.md`).
