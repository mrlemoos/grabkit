# Nx workspace replaces Lerna

Grabkit is a single publishable library in `packages/grabkit`. Lerna handled version bumps and publish; build was ad hoc Rollup at the repo root with no working package `build` script.

We adopt Nx as the workspace orchestrator in one migration: `@nx/rollup` builds the isomorphic bundle (ESM + CJS + types), `@nx/vitest` runs unit and integration tests as separate projects, and `nx release` replaces `lerna publish`; conventional commits drive semver and `packages/grabkit/CHANGELOG.md`.

## Considered options

- **Keep Lerna**: rejected; no task graph, caching, or release/changelog integration with the build toolchain we want.
- **Turborepo only**: rejected; release/changelog and project inference are weaker for a publishable npm library workflow.
- **Incremental Nx adoption**: rejected; user asked for big-bang; dual tooling cost not worth it for one package.

## Consequences

- `lerna.json` and `lerna publish` are removed; ADR-0001’s `lerna publish` reference is historical only.
- Root `test` runs unit tests only (`grabkit:test`); integration tests are opt-in via `grabkit-integration:test`.
- Release is `nx release` (version, changelog, npm publish for `grabkit`).
