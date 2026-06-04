---
title: Configuration
description: baseURL, format, casing, and headers.
---

## Factory options

Pass options as the second argument to `grabkit(baseURL?, options?)`:

```typescript
const grab = grabkit('https://api.example.com', {
  format: 'json-api',
  casing: 'camelCase',
  jsonApiHeaders: true,
  headers: { Authorization: 'Bearer …' },
});
```

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `'json-api'` | `'json-api'` or `'json'` |
| `casing` | `'none'` | Key normalisation for object keys only |
| `jsonApiHeaders` | `true` | JSON:API media types (ignored when `format` is `'json'`) |
| `headers` | (none) | Default headers merged into every grab |

## Casing

Casing transforms **object keys only**, never values (JSON:API `type` strings stay as you wrote them).

Supported values: `'none'`, `'snake_case'`, `'camelCase'`, `'kebab-case'`, `'PascalCase'`.

```typescript
const grab = grabkit('https://api.example.com', { casing: 'camelCase' });
```

Override per call:

```typescript
await grab('GET /users/1', { casing: 'snake_case' });
```

## Per-call options

Each grab accepts `body`, `headers`, and the same serialisation fields as the factory (`format`, `casing`, `jsonApiHeaders`). Call-level values win.

```typescript
await grab('POST /users', {
  body: { type: 'users', name: 'Leo' },
  headers: { 'X-Request-Id': '…' },
});
```

## Logging HTTP errors

When `log` is `true` (default), non-OK HTTP responses are logged with `console.error`. Pass a function for custom logging:

```typescript
await grab('GET /users/1', {
  log: (message) => myLogger.warn(message),
});
```
