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
