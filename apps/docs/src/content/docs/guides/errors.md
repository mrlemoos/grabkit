---
title: Errors & results
description: Grab result tuples, error types, and meta slots.
---

## Grab result shape

```typescript
type GrabResult<Data> =
  | [data: Data, error: null, meta: SuccessMeta]
  | [data: null, error: GrabkitError, meta: HttpErrorMeta]
  | [data: null, error: GrabkitTransportError, meta: TransportMeta];
```

Always destructure and narrow:

```typescript
const [data, error, meta] = await grab('GET /users/1');

if (error) {
  // failed grab
  return;
}

// success
```

## `orThrow` (throw on failure)

When a library expects **thrown** errors (TanStack Query, SWR, and similar), wrap the grab promise with **`orThrow`** from the package. It returns **`[data, meta]`** on success and throws **`GrabkitError`** or **`GrabkitTransportError`** on failure.

```typescript
import grabkit, { orThrow } from 'grabkit';

const grab = grabkit('https://api.example.com');

const [data, meta] = await orThrow(grab('GET /users/1'));
```

When the cache layer only needs **`data`**, destructure the first slot:

```typescript
const [data] = await orThrow(grab<User>('GET /users/1'));
```

`GrabkitValidationError` is still thrown by the grab itself (before `fetch`), not by `orThrow`.

See [TanStack Query](/guides/tanstack-query/) and [SWR](/guides/swr/) for full examples.

## GrabkitError (HTTP not OK)

When the server responds but the status is outside 2xx, **`error`** is a **`GrabkitError`**:

- `statusCode`: HTTP status
- `body`: parsed response body
- `message`: derived message
- `errors`: `JsonApiError[]` when the body is a JSON:API error document

```typescript
if (error && 'statusCode' in error && error.name === 'GrabkitError') {
  console.log(error.statusCode, error.errors);
}
```

Use [`isGrabHttpError`](/reference/) from the package when you need a type guard.

On HTTP errors, **`meta`** is `{}`. Status lives on **`error.statusCode`**, not in `meta`.

## GrabkitTransportError

Network failures, aborts, or bodies that cannot be parsed as expected JSON produce **`GrabkitTransportError`**. **`meta`** is `{ statusCode: 0 }`.

## GrabkitValidationError

Thrown **before** `fetch` when a write body violates JSON:API rules (for example missing `type`). This is **not** part of the tuple; wrap writes in `try/catch` when validation failures matter.

## Success meta

On success, **`meta`** includes `statusCode` and, for JSON:API grabs, optional pass-through `meta` and `links` from the document.

```typescript
const [data, error, meta] = await grab('GET /users/1');

if (!error) {
  console.log(meta.statusCode, meta.links);
}
```

## Empty responses

204 or empty bodies resolve as success with `data: null` and `meta.statusCode` set.
