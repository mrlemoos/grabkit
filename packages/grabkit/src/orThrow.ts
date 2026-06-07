import type GrabResult from './GrabResult';
import type SuccessMeta from './SuccessMeta';

/** Success tuple from {@link orThrow}: `[data, meta]` with no error slot. */
type OrThrowResult<Data> = [data: Data, meta: SuccessMeta];

/**
 * Await a grab and return `[data, meta]`, or throw on failure.
 *
 * Use when your data layer (TanStack Query, SWR, etc.) expects thrown errors
 * but you still want success `meta` (status code, JSON:API links, and so on).
 *
 * @param result - Promise from a grab call, e.g. `grab('GET /users/1')`.
 *
 * @example
 * ```typescript
 * const grab = grabkit('https://api.example.com');
 * const [data, meta] = await orThrow(grab('GET /users/1'));
 * console.log(data.name, meta.statusCode);
 * ```
 */
async function orThrow<Data>(result: Promise<GrabResult<Data>>): Promise<OrThrowResult<Data>> {
  const [data, error, meta] = await result;

  if (error !== null) {
    throw error;
  }

  return [data, meta as SuccessMeta];
}

export default orThrow;
export type { OrThrowResult };
