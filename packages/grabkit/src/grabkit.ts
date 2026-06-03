import Call from './Call';
import type ClosureOptions from './ClosureOptions';
import type Endpoint from './Endpoint';
import type GrabResult from './GrabResult';
import type GrabkitFactoryOptions from './GrabkitOptions';
import { resolveOptions } from './GrabkitOptions';
import GrabkitError from './GrabkitError';
import { denormaliseDocument, isJsonApiDocument } from './jsonApi';
import { HTTP_ERROR_META, TRANSPORT_META } from './SuccessMeta';

/**
 * Create a grab callable for `METHOD /path` requests.
 *
 * @param baseURL - Origin prepended to relative paths.
 * @param factoryOptions - Default serialisation options for every grab from this factory.
 *
 * @example
 * ```typescript
 * const grab = grabkit('https://api.example.com', { casing: 'camelCase' });
 * const [data, error, meta] = await grab('GET /users/1');
 *
 * if (error) {
 *   return;
 * }
 *
 * console.log(data.name, meta.statusCode);
 * ```
 */
function grabkit(baseURL?: string, factoryOptions?: GrabkitFactoryOptions) {
  /**
   * Perform a grab against `endpoint`.
   *
   * Returns `[data, error, meta]`. Narrow with `if (error)` — a truthy `error` means the grab failed.
   *
   * @param endpoint - `METHOD path`, e.g. `GET /users/1`.
   * @param options - Per-call body, headers, and serialisation overrides.
   */
  async function closure<Data = unknown, Body = unknown>(
    endpoint: Endpoint,
    options?: ClosureOptions<Body>,
  ): Promise<GrabResult<Data>> {
    const resolved = resolveOptions(factoryOptions, options);
    const consumer = new Call(endpoint, baseURL);
    const outcome = await consumer.send({
      body: options?.body,
      headers: options?.headers,
      resolved,
    });

    if (!outcome.ok) {
      return [null, outcome.error, TRANSPORT_META];
    }

    const { status, parsed, empty } = outcome;

    if (empty) {
      return [null as Data, null, { statusCode: status }];
    }

    if (!responseOk(status)) {
      const error = GrabkitError.fromResponse(status, parsed);

      if (typeof options?.log === 'function') {
        options.log(
          `Grabkit: the response has retrieved an error from the server with the following structure: ${JSON.stringify(error.body)}`,
        );
      } else if (options?.log) {
        console.error(
          `Grabkit: the response has retrieved an error from the server with the following structure: ${JSON.stringify(error.body)}`,
        );
      }

      return [null, error, HTTP_ERROR_META];
    }

    if (resolved.format === 'json-api' && isJsonApiDocument(parsed)) {
      const { data, meta: documentMeta } = denormaliseDocument(parsed, resolved.casing);

      return [data as Data, null, { ...documentMeta, statusCode: status }];
    }

    return [parsed as Data, null, { statusCode: status }];
  }

  return closure;
}

function responseOk(status: number): boolean {
  return status >= 200 && status < 300;
}

export default grabkit;

export type { GrabResult };
