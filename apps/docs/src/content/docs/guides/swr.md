---
title: SWR
description: Use Grabkit with SWR for client-side data fetching and mutations.
---

Grabkit returns `[data, error, meta]`; SWR fetchers should **throw** on failure so `error` and `isValidating` behave as expected. Use **`orThrow`** from the package in your fetcher.

## Shared API client

```typescript
// api.ts
import grabkit, { orThrow } from 'grabkit';

export const grab = grabkit(import.meta.env.VITE_API_URL, {
  casing: 'camelCase',
});

export { orThrow };
```

## Reads with `useSWR`

The **key** is any stable serialisable value; the **fetcher** receives that key (or parts of it).

```typescript
import useSWR from 'swr';
import { grab, orThrow } from './api';

type User = { id: string; name: string };

function useUser(id: string | null) {
  return useSWR(id ? ['user', id] : null, async ([, userId]) => {
    const [data] = await orThrow(grab<User>(`GET /users/${userId}`));
    return data;
  });
}

function Profile({ id }: { id: string }) {
  const { data, error, isLoading } = useUser(id);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;

  return <p>{data.name}</p>;
}
```

Passing `null` as the key disables the request until `id` is set.

## Global fetcher with `SWRConfig`

If every request goes through the same grab callable, you can centralise the fetcher:

```typescript
// swr.ts
import { SWRConfig } from 'swr';
import { grab, orThrow } from './api';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: async (endpoint: string) => {
          const [data] = await orThrow(grab(endpoint));
          return data;
        },
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

```typescript
import useSWR from 'swr';

function useUser(id: string) {
  return useSWR(id ? `GET /users/${id}` : null);
}
```

Use this when the key **is** the endpoint string. For richer keys (arrays, objects), keep a custom fetcher as in the first example.

## Mutations with `useSWRMutation`

```typescript
import useSWRMutation from 'swr/mutation';
import { grab, orThrow } from './api';

async function createUser(
  _key: string,
  { arg }: { arg: { type: 'users'; name: string } },
) {
  const [data] = await orThrow(grab(`POST /users`, { body: arg }));
  return data;
}

function useCreateUser() {
  return useSWRMutation('users/create', createUser);
}

function SignUpForm() {
  const { trigger, isMutating, error } = useCreateUser();

  return (
    <button
      disabled={isMutating}
      onClick={() => trigger({ type: 'users', name: 'Leo' })}
    >
      Create
    </button>
  );
}
```

After a successful mutation, call `mutate` from `useSWR` or `useSWRConfig` to refresh related keys.

## Plain JSON APIs

```typescript
export const grab = grabkit('https://api.github.com', { format: 'json' });
```

See [Plain JSON](/guides/plain-json/).

## Related

- [TanStack Query](/guides/tanstack-query/): query keys, `useMutation`, and cache invalidation
- [Node.js](/guides/node/): server-side grabs without SWR
