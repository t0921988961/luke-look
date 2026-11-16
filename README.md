# luke-look

Personal site for Luke Cheng（鄭宏璋）, a front-end engineer in Taipei.

The approved design is 「藍上的光」. `main` is what Vercel deploys to production. Day-to-day work lands on the integration branch first, and production changes only when that branch is released.

## Scripts

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm test             # unit tests
npm run e2e          # needs a production build first
npm run budgets      # needs a production build first
npm run fonts        # rebuild CJK subsets after adding characters
npm run og           # rebuild the social images after the name or tagline changes
```

## Changing text

1. Edit `lib/i18n/dictionaries/zh-TW.ts`, then the other languages.
2. Run `npm run fonts` if a new Chinese, Japanese or Korean character appears.
3. Open a pull request. If the pictures of the page change on purpose, review them and run **Update VRT baselines** from the Actions tab.
4. If the tagline or name changed, run `npm run og`.

Japanese and Korean pages stay out of search until a native speaker reviews them. The checklist is `docs/content-review.md`.

## Visual tests

Every pull request compares 17 screenshots. The full set of 38 is **VRT full matrix** in Actions, run by hand before a big redesign. Baselines live in `tests/vrt/__screenshots__/`.

A commit made by the update workflow does not start the other checks by itself. On the pull request, use **Approve workflows to run**.

## If a deploy looks wrong

In the Vercel dashboard, open Deployments, choose the previous production deployment, and use Instant Rollback. After a rollback, Vercel does not promote new `main` deployments until one is promoted again.

## Links for profiles

- LinkedIn: `https://luke-look.vercel.app/?utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio`
- CakeResume: `https://luke-look.vercel.app/?utm_source=cakeresume&utm_medium=profile&utm_campaign=portfolio`

On your own devices, open `https://luke-look.vercel.app/?notrack=1` once so your visits are not counted.
