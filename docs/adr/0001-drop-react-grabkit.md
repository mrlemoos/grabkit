# Drop react-grabkit

Grabkit is a focused HTTP client library. React hooks and providers (`react-grabkit`) are out of scope: consumers wire `grabkit` into their own React data-fetching layer (or any framework).

The `react-grabkit` npm package is deprecated with the message *"No longer maintained."* (no migration guide in the deprecation string). Deprecation on npm happens **before** removing `packages/react-grabkit` from this monorepo, so the published signal precedes deleting source.

## Considered options

- **Keep react-grabkit** — rejected; splits maintenance and blurs product focus.
- **Silent stop publishing** — rejected; leaves npm consumers unsure whether the package is abandoned.
- **Unpublish** — rejected; breaks lockfiles and is irreversible in practice.
- **Deprecation message with migration link** — rejected; minimal message only (`C`).

## Consequences

- `lerna publish` no longer includes `react-grabkit`; version line may diverge from historical 0.3.0 coupling.
- Anyone searching for "grabkit react" must use `grabkit` directly; no first-party hooks package.
