## 1.0.1 (2026-06-07)

### 🚀 Features

- **docs:** add grabkit.dev Starlight site and branding ([a3bb369](https://github.com/mrlemoos/grabkit/commit/a3bb369))
- ⚠️  ship JSON:API-first 1.0 with [data, error, meta] tuple ([ef46a81](https://github.com/mrlemoos/grabkit/commit/ef46a81))

### 🩹 Fixes

- include README and LICENSE in npm publish bundle ([bb11ea2](https://github.com/mrlemoos/grabkit/commit/bb11ea2))

### ⚠️  Breaking Changes

- ship JSON:API-first 1.0 with [data, error, meta] tuple  ([ef46a81](https://github.com/mrlemoos/grabkit/commit/ef46a81))

### ❤️ Thank You

- Cursor @cursoragent
- Leonardo Lemos @mrlemoos

# Changelog

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
