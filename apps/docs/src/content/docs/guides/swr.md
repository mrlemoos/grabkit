---
title: SWR
description: Use Grabkit with SWR for client-side data fetching and mutations.
---

Grabkit returns `[data, error, meta]`; SWR fetchers should **throw** on failure so `error` and `isValidating` behave as expected. Wrap grabs in a small helper or fetcher function.

## Shared API client

```typescript
// api.ts
import grabkit from 'grabkit';

export const grab = grabkit(import.meta.env.VITE_API_URL, {
  casing: 'camelCase',
});

export async function grabOrThrow<Data>(
  endpoint: string,
  options?: Parameters<typeof grab>[1],
): Promise<Data> {
  const [data, error] = await grab(endpoint, options);
  if (error) throw error;
  return data as Data;
}
```

## Reads with `useSWR`

The **key** is any stable serialisable value; the **fetcher** receives that key (or parts of it).

```typescript
import useSWR from 'swr';
import { grabOrThrow } from './api';

type User = { id: string; name: string };

function useUser(id: string | null) {
  return useSWR(
    id ? ['user', id] : null,
    ([, userId]) => grabOrThrow<User>(`GET /users/${userId}`),
  );
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
import { grabOrThrow } from './api';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (endpoint: string) => grabOrThrow(endpoint),
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
import { grabOrThrow } from './api';

async function createUser(
  _key: string,
  { arg }: { arg: { type: 'users'; name: string } },
) {
  return grabOrThrow(`POST /users`, { body: arg });
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
