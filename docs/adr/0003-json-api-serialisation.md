# JSON:API serialisation and grab result tuple

Grabkit **1.0.0** treats [JSON:API](https://jsonapi.org/) as the default serialisation format for request and response bodies. Callers work with **denormalised resources** (flat objects); grabkit wraps and unwraps JSON:API envelopes on the wire. Plain JSON APIs opt out explicitly.

Every grab resolves to a three-element tuple **`[data, error, meta]`**. Callers narrow with **`if (error)`** — a truthy `error` means the grab failed. There is no runtime `ok` field.

This ADR **supersedes** the tuple shape and payload union described in ADR-0002. ADR-0002’s `[GrabPayload, statusCode]` discriminated union is not shipped.

## Default format and opt-out

- **Default:** `format: 'json-api'` on every `grabkit()` factory and every grab unless overridden.
- **Opt-out:** `format: 'json'` at factory level and/or per call for plain JSON APIs (e.g. GitHub).
- Plain JSON mode skips envelope wrap/unwrap and relationship denormalisation. The tuple shape and error-centric narrowing are unchanged.

## Success `data` shape

On success, `data` is a **denormalised primary resource** (or collection):

- Top-level **`id`**, **`type`**, and **attribute keys** on one object.
- **`included`** resources are merged under their **relationship keys** (e.g. `favourite_games: [{ id, type, title, … }]`).
- **Read cardinality:** to-many → array; to-one → single object; absent relationship → key omitted.
- **Collections:** `data` mirrors JSON:API `data` cardinality — single resource is an object; list endpoints return an array. Generics express this: `grab<User>(…)` vs `grab<User[]>(…)`.

Document-level fields not merged into `data` appear in **`meta`** on success (see below). **`included` is not duplicated in `meta`.**

## Request bodies (symmetric write path)

Callers pass the same flat shape grabkit returns on read:

```typescript
await grab('POST /users', {
  body: { type: 'users', name: 'Leo' },
});
// wire: { data: { type: 'users', attributes: { name: 'Leo' } } }
```

- **`type` is required** on every write body in JSON:API mode. Omitting it throws **`GrabkitValidationError`** synchronously before `fetch`.
- **`id`** omitted on create; present on update/PATCH.
- **Relationship keys** on write accept full denormalised objects or `{ type, id }` stubs; grabkit serialises wire links as `{ type, id }` only (extra nested attributes are not sent).

## Casing

Callers may normalise consolidated object **keys** (not values):

| Value | Effect |
|-------|--------|
| `'none'` | Passthrough (default) |
| `'snake_case'` | Keys transformed |
| `'camelCase'` | Keys transformed |
| `'kebab-case'` | Keys transformed |
| `'PascalCase'` | Keys transformed |

- Configured at **factory** with **per-call override** (same pattern as `format`).
- Applies to **object keys only**. JSON:API **`type` string values** (e.g. `'favourite-games'`) are never transformed.
- Read: keys normalised after consolidation. Write: caller keys normalised to wire casing before envelope wrap.

## Tuple slots and `meta`

| Outcome | `data` | `error` | `meta` |
|---------|--------|---------|--------|
| Success | denormalised resource or array | `null` | `{ statusCode, meta?, links? }` |
| HTTP failure (JSON:API error document) | `null` | `GrabkitError` | `{}` |
| Transport failure | `null` | `GrabkitTransportError` | `{ statusCode: 0 }` |

**Success `meta`:** `statusCode` plus pass-through of JSON:API top-level **`meta`** and **`links`** when present.

**HTTP errors:** `meta` is always `{}`. Status is read from `error.statusCode`.

## Errors

`GrabkitError` is extended for JSON:API:

- **`body`** — raw parsed document (preserved for logging).
- **`errors`** — `JsonApiError[]` parsed from `body.errors` (empty array in plain JSON mode or non-JSON:API bodies).
- **`message`** — derived from the first error’s `detail ?? title`, or joined when multiple.

`GrabkitTransportError` is unchanged in role: network failure, abort, or response body that cannot be parsed as expected JSON.

## Headers

In JSON:API mode, **`jsonApiHeaders` defaults to `true`**:

- `Accept: application/vnd.api+json` on every request.
- `Content-Type: application/vnd.api+json` when a body is sent.

Set **`jsonApiHeaders: false`** to opt out. Caller-supplied headers **override** defaults on conflict. In **`format: 'json'`** mode, JSON:API media types are never set; `Content-Type: application/json` is set when a body is present.

## Empty and non-JSON bodies

- **204, 205, 304** → success: `[null, null, { statusCode }]`. No parse attempted.
- **Other statuses** with empty or non-JSON body → `GrabkitTransportError` (JSON:API mode and plain JSON mode share this rule for the listed empty statuses).

## TypeScript and documentation

- Return type documents three tuple states as a union; runtime value is always `[data, error, meta]`.
- Export **`isGrabHttpError`**, **`isGrabTransportError`** (and related guards) for splitting failure kinds after `if (error)`.
- **JSDoc** on factory options (`format`, `casing`, `jsonApiHeaders`), closure options, tuple slots, `GrabkitError.errors`, and the canonical `if (error)` narrowing pattern.

## Considered options

- **Plain JSON as default; JSON:API opt-in** — rejected; product direction is JSON:API-first (grill Q1).
- **Full JSON:API document in `data`** — rejected; denormalised flat objects are better ergonomics for app code.
- **Discriminated `ok` payload (ADR-0002)** — rejected; tuple with `if (error)` narrowing is the canonical pattern.
- **`meta` carries `statusCode` on HTTP errors** — rejected; `meta` is `{}` on JSON:API errors; status lives on `error.statusCode`.
- **Configurable empty-body policy** — rejected in favour of fixed 204/205/304 success rule (grill Q14 rollback).
- **camelCase-only casing** — rejected; configurable key casing with `'none'` default respects diverse backends.
- **Transform JSON:API `type` values** — rejected; casing applies to keys only.
- **Defer JSON:API default to 2.0.0** — rejected; ship JSON:API-first as **1.0.0**.

## Consequences

- **Breaking change from 0.3.x:** tuple shape, default serialisation, and error fields all change. Migration guide required in changelog/README.
- **ADR-0002** tuple and `GrabPayload` union are historical; implementation and tests target this ADR.
- **`CONTEXT.md`** must be updated with JSON:API grab, denormalised resource, `[data, error, meta]`, casing, and format opt-out vocabulary.
- New types/errors: `JsonApiError`, `GrabkitValidationError`, `SuccessMeta`, casing and format option types.
- Implementation lives in `packages/grabkit/src` with **Vitest** tests beside source (`pnpm test`).
- A casing transform utility (or small dependency) is required for the four supported key conventions.
