---
title: TanStack Query
description: Use Grabkit with TanStack Query (React Query) for reads, mutations, and cache keys.
---

Grabkit returns `[data, error, meta]`; TanStack Query expects **`queryFn`** and **`mutationFn`** to **throw** on failure so the library can set `isError`, `error`, and retry behaviour. Use **`orThrow`** from the package inside those functions.

## Shared API client

Create one grab callable per API origin (same pattern as [Getting started](/guides/getting-started/)):

```typescript
// api.ts
import grabkit, { orThrow } from 'grabkit';

export const grab = grabkit(process.env.NEXT_PUBLIC_API_URL!, {
  casing: 'camelCase',
  headers: {
    // Attach auth in one place, or set per call
  },
});

export { orThrow };
```

## Reads with `useQuery`

```typescript
import { useQuery } from '@tanstack/react-query';
import { grab, orThrow } from './api';

type User = { id: string; name: string };

function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const [data] = await orThrow(grab<User>(`GET /users/${id}`));
      return data;
    },
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
import { grab, orThrow } from './api';

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { type: 'users'; name: string }) => {
      const [data] = await orThrow(grab(`POST /users`, { body }));
      return data;
    },
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

On the server, call `orThrow(grab(...))` inside `queryClient.prefetchQuery`, then dehydrate state for the client. Grabkit runs in Node; see [Node.js](/guides/node/) for env and auth patterns.

## Related

- [Migrating from react-grabkit](/guides/migrating-from-react-grabkit/): hooks are no longer bundled; use your data layer instead
- [SWR](/guides/swr/): similar fetcher pattern with `useSWR`
