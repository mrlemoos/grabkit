# Changelog

## 2.0.1 (2026-06-07)

### 🩹 Fixes

- make prepack compatible with pnpm publish ([aa493d1](https://github.com/mrlemoos/grabkit/commit/aa493d1))
- include README and LICENSE in npm publish bundle ([bb11ea2](https://github.com/mrlemoos/grabkit/commit/bb11ea2))

### ❤️ Thank You

- Cursor @cursoragent
- Leonardo Lemos @mrlemoos

## 1.0.0 (2026-06-03)

### Features

- Default to JSON:API serialisation with denormalised read `data` and write envelopes
- Plain JSON opt-out via `format: 'json'`
- Tuple grab results `[data, error, meta]` with `GrabkitError` and `GrabkitTransportError`
- Optional key casing (`snake_case`, `camelCase`, `kebab-case`, `PascalCase`, `none`)
- Isomorphic ESM, CJS, and TypeScript declarations for Node and bundlers

### Breaking changes

- **1.0.0**: JSON:API is the default; use `format: 'json'` for non–JSON:API backends
- `react-grabkit` is deprecated; integrate `grabkit` with your own data-fetching layer
