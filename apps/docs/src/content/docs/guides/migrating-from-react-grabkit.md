---
title: Migrating from react-grabkit
description: Move from the deprecated React package to grabkit directly.
---

The **`react-grabkit`** npm package is **deprecated** and no longer maintained. Grabkit is a focused HTTP client; React hooks and providers are intentionally out of scope.

## What changes

| Before (`react-grabkit`) | After (`grabkit`) |
|--------------------------|-------------------|
| Hooks such as `useGrab` | Your data layer (TanStack Query, SWR, Relay, etc.) |
| Provider / context | Factory per API origin: `const grab = grabkit(baseURL)` |
| Framework-coupled errors | Tuple `[data, error, meta]` + `if (error)` |

## Minimal migration

1. Remove `react-grabkit` from dependencies.
2. Install `grabkit`.
3. Create a grab callable where you previously configured the provider:

```typescript
import grabkit from 'grabkit';

export const grab = grabkit(process.env.API_URL!, {
  casing: 'camelCase',
});
```

4. Call `grab` inside your existing query/mutation functions:

```typescript
async function fetchUser(id: string) {
  const [data, error] = await grab(`GET /users/${id}`);
  if (error) throw error;
  return data;
}
```

Whether you throw after a failed grab is up to your data layer; Grabkit itself returns errors in the tuple.

## React Query example

```typescript
import { useQuery } from '@tanstack/react-query';
import { grab } from './api';

function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const [data, error] = await grab(`GET /users/${id}`);
      if (error) throw error;
      return data;
    },
  });
}
```

## Version 1.0 defaults

`grabkit` **1.0.0** defaults to JSON:API. If your API is plain JSON, set `format: 'json'` on the factory. See [Plain JSON](/guides/plain-json/).
