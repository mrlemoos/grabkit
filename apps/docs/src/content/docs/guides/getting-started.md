---
title: Getting started
description: Install Grabkit and perform your first grab.
---

## Install

```bash
pnpm add grabkit
# npm install grabkit
# yarn add grabkit
```

Grabkit ships **ESM**, **CJS**, and TypeScript declarations. It runs in Node and in bundler-driven browser apps (no separate CDN bundle).

## Create a grab callable

```typescript
import grabkit from 'grabkit';

const grab = grabkit('https://api.example.com');
```

The factory returns a function you call with an **endpoint** string: uppercase HTTP method, a space, then the path.

```typescript
const [data, error, meta] = await grab('GET /users/1');
```

Paths starting with `/` are resolved against `baseURL`. Absolute `http://` or `https://` URLs ignore `baseURL`.

## Narrow the result

Every grab resolves to a **tuple** `[data, error, meta]`:

```typescript
if (error) {
  // Grab failed: HTTP error or transport failure
  return;
}

// Success: data is set, error is null
console.log(data, meta.statusCode);
```

Ordinary HTTP and transport failures are **returned**, not thrown. The only synchronous throw is `GrabkitValidationError` (for example a JSON:API write body missing `type`).

## Next steps

- [JSON:API (default)](/guides/json-api/): denormalised reads and write envelopes
- [Plain JSON](/guides/plain-json/): `format: 'json'` for non–JSON:API APIs
- [Configuration](/guides/configuration/): casing, headers, per-call overrides
- [Errors & results](/guides/errors/): `GrabkitError`, transport errors, and `meta`
