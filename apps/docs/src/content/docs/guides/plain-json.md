---
title: Plain JSON
description: Use format json for non–JSON:API APIs.
---

Many HTTP APIs return plain JSON documents. Opt out of JSON:API serialisation with **`format: 'json'`** at the factory or on a single call.

## Factory default

```typescript
import grabkit from 'grabkit';

const grab = grabkit('https://api.github.com', { format: 'json' });

const [data, error, meta] = await grab('GET /repos/mrlemoos/grabkit');

if (error) return;

console.log(data.name);
```

Bodies are `JSON.stringify` on write and `response.json()` on read. There is no envelope wrap, relationship denormalisation, or `type` requirement on writes.

## Per-call override

```typescript
const grab = grabkit('https://api.example.com'); // json-api default

const [repo] = await grab('GET /external/resource', { format: 'json' });
```

The tuple shape and `if (error)` narrowing are unchanged.

## When to use which

| API style | `format` |
|-----------|----------|
| JSON:API (`application/vnd.api+json`) | `'json-api'` (default) |
| Plain JSON (GitHub, many REST APIs) | `'json'` |
