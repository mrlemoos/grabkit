# Grabkit docs

Astro Starlight site for [grabkit.dev](https://grabkit.dev).

## Commands

From the repository root:

```bash
pnpm dev         # local dev server
pnpm docs:build  # sync TypeDoc + changelog, then build static site
```

The build depends on `grabkit:build` via Nx. TypeDoc output and the changelog page are generated into `src/content/docs/` and are gitignored.

## Deploy

Production deploys from **`main`** to Vercel. Set the project **Root Directory** to `apps/docs` (uses `apps/docs/vercel.json`) or leave it at the repo root (uses root `vercel.json`). Both run `pnpm -w docs:build` so the Nx workspace script resolves correctly. Point **grabkit.dev** at the Vercel project in the dashboard.
