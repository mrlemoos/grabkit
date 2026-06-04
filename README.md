# Grabkit

TypeScript HTTP client for explicit **`METHOD /path`** calls. Tuple-shaped results. **[JSON:API](https://jsonapi.org/) by default**; use plain JSON with `format: 'json'`.

<p>
  <a href="https://www.npmjs.com/package/grabkit"><img src="https://img.shields.io/npm/v/grabkit.svg" alt="npm version" /></a>
  <a href="https://github.com/mrlemoos/grabkit/actions/workflows/ci.yml"><img src="https://github.com/mrlemoos/grabkit/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mrlemoos/grabkit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/grabkit.svg" alt="MIT license" /></a>
</p>

**Documentation:** [grabkit.dev](https://grabkit.dev)

## Install

```bash
pnpm add grabkit
```

## Quick example

```typescript
import grabkit from 'grabkit';

const grab = grabkit('https://api.example.com', { casing: 'camelCase' });

const [data, error, meta] = await grab('GET /users/1');

if (error) {
  console.error(error.message);
  return;
}

console.log(data.name, meta.statusCode);
```

Plain JSON API (e.g. GitHub):

```typescript
const grab = grabkit('https://api.github.com', { format: 'json' });
const [repo, error] = await grab('GET /repos/mrlemoos/grabkit');
```

## Learn more

- [Getting started](https://grabkit.dev/guides/getting-started/)
- [JSON:API mode](https://grabkit.dev/guides/json-api/)
- [Errors & results](https://grabkit.dev/guides/errors/)
- [API reference](https://grabkit.dev/reference/)
- [Changelog](https://grabkit.dev/changelog/)

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/mrlemoos/grabkit).
