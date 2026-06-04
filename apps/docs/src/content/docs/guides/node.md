---
title: Node.js
description: Use Grabkit on the server for route handlers, loaders, and background jobs.
---

Grabkit uses the platform **`fetch`** API. In **Node.js 18+**, `fetch` is built in; no separate adapter is required. The same factory and tuple results apply as in the browser.

## Create a server-side client

Keep secrets and base URLs in environment variables, not in client bundles:

```typescript
// lib/api.ts
import grabkit from 'grabkit';

const baseURL = process.env.API_URL;
if (!baseURL) {
  throw new Error('API_URL is not set');
}

export const grab = grabkit(baseURL, {
  casing: 'camelCase',
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
});
```

For plain JSON backends (Stripe, GitHub, many REST APIs), set `format: 'json'`. See [Plain JSON](/guides/plain-json/).

## Route handler pattern

On the server, prefer **returning** tuple errors to the caller instead of throwing, so you can map HTTP status codes explicitly:

```typescript
import { grab } from '../lib/api';

export async function getUserHandler(userId: string) {
  const [data, error, meta] = await grab(`GET /users/${userId}`);

  if (error) {
    const status =
      error.name === 'GrabkitError' ? error.statusCode : 502;
    return Response.json(
      { message: error.message },
      { status },
    );
  }

  return Response.json(data, { status: meta.statusCode });
}
```

### Express

```typescript
import express from 'express';
import { grab } from './lib/api';

const app = express();

app.get('/users/:id', async (req, res) => {
  const [data, error] = await grab(`GET /users/${req.params.id}`);

  if (error) {
    const status = error.name === 'GrabkitError' ? error.statusCode : 502;
    return res.status(status).json({ message: error.message });
  }

  res.json(data);
});
```

### Next.js App Router (Route Handler)

```typescript
// app/api/users/[id]/route.ts
import { grab } from '@/lib/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [data, error] = await grab(`GET /users/${id}`);

  if (error) {
    const status = error.name === 'GrabkitError' ? error.statusCode : 502;
    return Response.json({ message: error.message }, { status });
  }

  return Response.json(data);
}
```

## Writes from the server

```typescript
const [user, error] = await grab('POST /users', {
  body: { type: 'users', name: 'Leo', email: 'leo@example.com' },
});

if (error) {
  // handle validation / 4xx / 5xx
}
```

`GrabkitValidationError` (for example missing `type` on a JSON:API body) is thrown **before** `fetch`. Wrap writes in `try/catch` when you need to handle that separately from HTTP errors.

## Passing through to the client

When a browser app uses TanStack Query or SWR, the **browser** usually calls your BFF or public API. Two common layouts:

| Layout | Where `grab` runs | Notes |
|--------|-------------------|-------|
| BFF | Node route calls upstream with `grab` | Hides tokens; maps tuples to JSON responses |
| Direct | Browser `grab` to public API | Use public base URL; attach user tokens per request |

See [TanStack Query](/guides/tanstack-query/) and [SWR](/guides/swr/) for client-side cache integration.

## Timeouts and abort

Pass `signal` through per-call options (standard `fetch`):

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

const [data, error] = await grab('GET /users/1', {
  signal: controller.signal,
});

clearTimeout(timeout);
```

Aborted requests resolve as `GrabkitTransportError` in the tuple. See [Errors & results](/guides/errors/).

## Related

- [Configuration](/guides/configuration/): default headers, casing, logging
- [Errors & results](/guides/errors/): `GrabkitError` vs transport errors
