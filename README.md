# Grabkit

Grabkit is a TypeScript HTTP client for explicit `METHOD /path` calls. **1.0.0** defaults to [JSON:API](https://jsonapi.org/) serialisation; plain JSON APIs opt out with `format: 'json'`.

## Installation

| Yarn                   | PNPM                   | NPM                   |
| :--------------------- | :--------------------- | :-------------------- |
| `yarn install grabkit` | `pnpm install grabkit` | `npm install grabkit` |

## Code examples

```typescript
import grabkit from 'grabkit';

const grab = grabkit('https://api.example.com', { casing: 'camelCase' });

async function loadUser() {
  const [data, error, meta] = await grab('GET /users/1');

  if (error) {
    console.log('Grab failed', error.message);
    return;
  }

  console.log(data.name, meta.statusCode);
}
```

### Plain JSON APIs (e.g. GitHub)

```typescript
const grab = grabkit('https://api.github.com', { format: 'json' });

const [data, error, meta] = await grab('GET /repos/mrlemoos/grabkit');

if (error) {
  return;
}

console.log(data.name);
```

### Writing JSON:API resources

```typescript
await grab('POST /users', {
  body: { type: 'users', name: 'Leo' },
});
```

`type` is required on write bodies in JSON:API mode.

### Conclusion

1. Pass the HTTP method in uppercase before the path: `GET /users/1`.
2. Narrow with `if (error)` — a truthy `error` means the grab failed.
3. Use `format: 'json'` for non–JSON:API backends.
4. Set `casing` when your API uses a different key convention than the wire format.

Happy hacking :smile:
