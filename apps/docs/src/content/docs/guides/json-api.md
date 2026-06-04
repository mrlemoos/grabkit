---
title: JSON:API (default)
description: Denormalised data, write envelopes, and included resources.
---

Grabkit **defaults to JSON:API** serialisation. You work with flat resource objects; the library handles envelopes on the wire.

## Reads

A JSON:API document is denormalised into the success **`data`** slot:

- Top-level `id`, `type`, and attributes on one object
- Related resources merged under relationship keys (for example `favourite_games: [{ id, type, title, … }]`)
- Collections become an array of denormalised resources

```typescript
const grab = grabkit('https://api.example.com');
const [data, error, meta] = await grab('GET /users/1');

if (error) return;

// data is a flat resource, not { data: { type, attributes } }
console.log(data.id, data.name);
```

When the response includes JSON:API top-level **`meta`** or **`links`**, they appear on the success **`meta`** object alongside `statusCode`. **`included`** is folded into `data`, not repeated in `meta`.

## Writes

Pass the same flat shape you expect on read. Grabkit wraps it for the wire.

```typescript
await grab('POST /users', {
  body: { type: 'users', name: 'Leo' },
});
```

**`type` is required** on write bodies in JSON:API mode. Omitting it throws **`GrabkitValidationError`** before the request is sent.

## JSON:API headers

By default, JSON:API mode sends `Content-Type: application/vnd.api+json` and `Accept: application/vnd.api+json`. Disable per factory or per call with `jsonApiHeaders: false` when your server expects plain `application/json` but still returns JSON:API bodies.

## Opt out for plain JSON

Backends like GitHub are not JSON:API. See [Plain JSON](/guides/plain-json/).
