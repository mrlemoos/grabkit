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

Production deploys from **`main`** to Vercel with the root `vercel.json`. Point **grabkit.dev** at the Vercel project in the dashboard.
