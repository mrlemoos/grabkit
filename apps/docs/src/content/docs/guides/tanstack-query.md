---
title: TanStack Query
description: Use Grabkit with TanStack Query (React Query) for reads, mutations, and cache keys.
---

Grabkit returns `[data, error, meta]`; TanStack Query expects **`queryFn`** and **`mutationFn`** to **throw** on failure so the library can set `isError`, `error`, and retry behaviour. Convert tuple errors inside those functions.

## Shared API client

Create one grab callable per API origin (same pattern as [Getting started](/guides/getting-started/)):

```typescript
// api.ts
import grabkit from 'grabkit';

export const grab = grabkit(process.env.NEXT_PUBLIC_API_URL!, {
  casing: 'camelCase',
  headers: {
    // Attach auth in one place, or set per call
  },
});

/** Throw on failed grab so TanStack Query treats the request as failed. */
export async function grabOrThrow<Data>(
  endpoint: string,
  options?: Parameters<typeof grab>[1],
): Promise<Data> {
  const [data, error] = await grab(endpoint, options);
  if (error) throw error;
  return data as Data;
}
```

## Reads with `useQuery`

```typescript
import { useQuery } from '@tanstack/react-query';
import { grabOrThrow } from './api';

type User = { id: string; name: string };

function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => grabOrThrow<User>(`GET /users/${id}`),
    enabled: Boolean(id),
  });
}

function Profile({ id }: { id: string }) {
  const { data, error, isPending } = useUser(id);

  if (isPending) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;

  return <p>{data.name}</p>;
}
```

`error` in the component is the thrown `GrabkitError` or `GrabkitTransportError` from [Errors & results](/guides/errors/).

## Writes with `useMutation`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { grabOrThrow } from './api';

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { type: 'users'; name: string }) =>
      grabOrThrow(`POST /users`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

JSON:API mode requires `type` on write bodies. See [JSON:API (default)](/guides/json-api/).

## Plain JSON APIs

For GitHub-style APIs, set `format: 'json'` on the factory (see [Plain JSON](/guides/plain-json/)):

```typescript
export const grab = grabkit('https://api.github.com', { format: 'json' });
```

## Server prefetch (optional)

On the server, call `grabOrThrow` inside `queryClient.prefetchQuery`, then dehydrate state for the client. Grabkit runs in Node; see [Node.js](/guides/node/) for env and auth patterns.

## Related

- [Migrating from react-grabkit](/guides/migrating-from-react-grabkit/): hooks are no longer bundled; use your data layer instead
- [SWR](/guides/swr/): similar fetcher pattern with `useSWR`
