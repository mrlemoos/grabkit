# Grab result shape and error model

> **Superseded by [ADR-0003](./0003-json-api-serialisation.md)** for tuple shape, default serialisation, and error/meta slots. Retained for historical context.

Grabkit resolves every grab to a tuple `[payload, statusCode]` instead of mixing returned HTTP failures with thrown `fetch` / parse errors. The payload is a discriminated union on `ok`: success carries `data`; failure carries `kind: 'http' | 'transport'` and either `GrabkitError` or `GrabkitTransportError`. HTTP 4xx/5xx are not thrown — they are failed grabs with a normalised `GrabkitError` (status, parsed JSON body, message). Network and non-JSON parse failures are `GrabkitTransportError`, also returned in the tuple.

`statusCode` always appears as the second tuple element. For HTTP failures it matches `GrabkitError.statusCode`; for transport failures it is `0`. v1 grabs are JSON end-to-end: JSON request objects only, JSON response parsing only; other formats are out of scope and surface as transport errors.

## Considered options

- **Legacy `{ data?, error? }` + throws for transport** — rejected; inconsistent mental model and poor TypeScript narrowing.
- **Throw on 4xx/5xx** — rejected; conflicts with README-style destructuring and explicit status handling.
- **Single error type for HTTP and transport** — rejected; callers cannot distinguish “server said no” from “never got a valid response” without extra fields.
- **Union on `error` without `ok` / `kind`** — rejected; weaker exhaustiveness than a discriminated payload.
- **Split `grab(method, path)` API** — rejected for v1; `METHOD /path` string remains canonical (ADR-0002 does not change endpoint shape).

## Consequences

- **Breaking change** from 0.3.x: consumers must migrate destructuring and error handling; shipped as **`1.0.0`** (first stable public contract).
- Implementation must fix absolute-URL handling when combining `baseURL` with full `http(s)://` paths (current code incorrectly prefixes in some cases).
- Tests become necessary to lock payload shapes and transport vs HTTP paths. **Vitest** is used at the repo root (`yarn test`); tests live beside `packages/grabkit/src`.
