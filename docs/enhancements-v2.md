# Enhancements v2

Status: round 3 on `feature/enhancements-v2`. This branch does not touch production. `main` stays the release branch.

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
| 12 | Magnetic buttons | Pointer tracking would land in the header bundle. Initial JS was at the 150 KB budget. | **Build in round 3**, after the experience list and the email reveal left the first-load graph. The handler lives in the deferred chunk. Coarse pointers and paused motion leave the buttons still. |

## What shipped

- **Career story** (`#journey`, inside Experience). Five chronological stations from the résumé. A wave route draws, station icons draw in and stay drawn, and a warm blob morphs as it follows the route. Scroll scrubs the desktop sticky scene. Play / pause / replay and the station buttons seek it. `prefers-reduced-motion` and the site pause toggle leave a fully drawn static scene. Copy is in zh, en, ja, and ko.
- **Work details.** Each project can open a short factual panel. Subscription numbers stay worded as product scale. Map, live video, and SignalR stay features.
- **Deep links** from each station to the matching experience row.

Round 2, still on this branch:

- **Skill rule.** Five résumé groups sit on one line. There is no score and no bar. The line draws once when motion is on, and it is already drawn when motion is off.
- **Light on the horizon.** A second warm glint crosses the existing Canvas. Phones draw fewer rows.
- **CSS hover only.** The desktop nav grows a warm underline, and the hero contact button gets a sheen. Neither runs under reduced motion or the pause toggle, and neither adds a library.

Round 3:

- **First-load JavaScript.** The experience panels, the email reveal, the approach stage, and the dashboard loop are plain HTML until a deferred chunk attaches their behaviour. The horizon canvas and the scroll motion engine wait until the browser is idle, so they stay out of the blocking window. First-load JS on every locale: 149.4 KB → 144.3 KB (budget 150 KB). The rest of the graph is 218.1 KB of 230 KB.
- **Main-thread time.** Local Lighthouse, three runs, median total blocking time: Chinese home 267 ms → 104 ms, English 269.5 ms → 111 ms. Both sit under the 200 ms warning. The earlier English runs were 257 ms, 276 ms, and 269.5 ms.
- **Who Luke is.** Beside the greeting, a line draws the name used in every locale and a short role stroke in apricot and coral. Three shapes — brand blue, apricot, coral — morph only while motion is on. Reduced motion and the pause toggle leave the drawing finished and the shapes still. The greeting stays the accessible name. No new claim.
- **Magnetic buttons.** The two hero actions ease toward a fine pointer. Coarse pointers and paused motion leave them still.
- **Scroll-linked section transitions.** Not added. The career story already scrubs with the scroll, and another scroll listener would sit in the same blocking window the idle delay is trying to leave.

## Content rules

Years stay in `PERIODS` (already on the page). New dictionary strings use only résumé numbers. WebRTC is not named; the résumé’s feature is 即時影像. The 500 → 10,000+ line, where it appears, is product scale (訂閱 / subscriptions / 契約数 / 구독). No GitHub link. Education stays last. Japanese and Korean copy still needs a native reader (`docs/content-review.md`).
