# Enhancements v2

Status: round 2 on `feature/enhancements-v2`. This branch does not touch production. `main` stays the release branch. PR #16 CI (quality, browser, lighthouse) was green before this round.

Inputs: `docs/design.md`, `docs/plan.md`, and `resume_v3_zh.md`. S5-Style’s gallery (editorial timelines, drawn lines, chapter-like case studies) and Awwwards motion patterns (path-following, staged line drawing, a scrubbable story) were used as reference only. Nothing is copied.

## Ranked ideas

| Rank | Idea | Why it ranks here | Decision |
| --- | --- | --- | --- |
| 1 | Scroll- and play-driven SVG career story | A hiring manager can see the whole path (design → campaigns → war rooms → internal systems → VisionMax) in one glance. It uses the motion system already approved: line drawing, a morphing traveler, light on blue. Facts stay inside the résumé. | **Build** |
| 2 | Project detail disclosures | The work cards stop at one sentence. The résumé has a second layer (live video, map markers, SignalR, the rest of the finance clients) that never becomes a specialty claim or a personal subscription win. Native `<details>` keeps it static, keyboardable, and free of extra JavaScript. | **Build** |
| 3 | Jump from a story stage to the full experience entry | Connects the overview to the bullets that are already on the page. | **Build** |
| 4 | Skill percentages or a fake proficiency chart | The résumé lists tools. It does not rank them. A bar chart would invent numbers. | **Reject** |
| 5 | Sixth nav item for the story | The header is already full at 1440. The story lives inside Experience, where “查看經歷” already lands. | **Reject** |
| 6 | Lottie, Framer Motion, or a second animation runtime | GSAP is already the lazy motion runtime. The story uses CSS `pathLength` plus a few lines of geometry so the first bundle does not grow a library. | **Reject** |
| 7 | Sticky story on phones | A pinned 100vh scene clips the five captions on a 375-wide screen and fights the thumb. Desktop pins; mobile plays and scrolls the natural height. | **Reject sticky on small screens** |
| 8 | Autoplay on load | It would run beside the hero and the horizon. Play starts only from the button or from scrolling the story. | **Reject** |
| 9 | Hero Canvas rewrite | The horizon already pauses off-screen, caps DPR, and follows the palette. A rewrite risks Lighthouse and the look Luke approved. | **Leave the structure.** Round 2 only adds a second warm glint and draws fewer rows on a phone. The canvas stays in the lazy chunk. |
| 10 | Contact form | Already specified as later work in `docs/plan.md`. It adds a dynamic route and a secret. | **Leave** |
| 11 | Skill map with percentages | Same problem as rank 4. | **Reject percentages.** Round 2 draws one equal rule through the five résumé groups. Every group is the same size. |
| 12 | Magnetic buttons | Pointer tracking would land in the header bundle. Initial JS is already at the 150 KB budget. | **Reject.** Hover uses CSS: a nav underline and a sheen on the hero button, both off when motion is paused or reduced. |

## What shipped

- **Career story** (`#journey`, inside Experience). Five chronological stations from the résumé. A wave route draws, station icons draw in and stay drawn, and a warm blob morphs as it follows the route. Scroll scrubs the desktop sticky scene. Play / pause / replay and the station buttons seek it. `prefers-reduced-motion` and the site pause toggle leave a fully drawn static scene. Copy is in zh, en, ja, and ko.
- **Work details.** Each project can open a short factual panel. Subscription numbers stay worded as product scale. Map, live video, and SignalR stay features.
- **Deep links** from each station to the matching experience row.

Round 2, still on this branch:

- **Skill rule.** Five résumé groups sit on one line. There is no score and no bar. The line draws once when motion is on, and it is already drawn when motion is off.
- **Light on the horizon.** A second warm glint crosses the existing Canvas. Phones draw fewer rows.
- **CSS hover only.** The desktop nav grows a warm underline, and the hero contact button gets a sheen. Neither runs under reduced motion or the pause toggle, and neither adds a library.

## Content rules

Years stay in `PERIODS` (already on the page). New dictionary strings use only résumé numbers. WebRTC is not named; the résumé’s feature is 即時影像. The 500 → 10,000+ line, where it appears, is product scale (訂閱 / subscriptions / 契約数 / 구독). No GitHub link. Education stays last. Japanese and Korean copy still needs a native reader (`docs/content-review.md`).
