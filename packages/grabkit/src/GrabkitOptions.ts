import type Casing from './Casing';
import type GrabkitFormat from './GrabkitFormat';
import type AnyRecord from './AnyRecord';

/** Options passed to `grabkit(baseURL?, options?)`. */
interface GrabkitFactoryOptions {
  /** @default 'json-api' */
  format?: GrabkitFormat;
  /** @default 'none'. Passthrough; set explicitly for your API's key convention. */
  casing?: Casing;
  /** @default true in JSON:API mode; ignored when `format` is `'json'`. */
  jsonApiHeaders?: boolean;
  headers?: Headers | AnyRecord;
}

export default GrabkitFactoryOptions;

interface ResolvedGrabkitOptions {
  format: GrabkitFormat;
  casing: Casing;
  jsonApiHeaders: boolean;
  headers?: Headers | AnyRecord;
}

export type { ResolvedGrabkitOptions };

export function resolveOptions(
  factory: GrabkitFactoryOptions = {},
  call: GrabkitFactoryOptions = {},
): ResolvedGrabkitOptions {
  const format = call.format ?? factory.format ?? 'json-api';

  return {
    format,
    casing: call.casing ?? factory.casing ?? 'none',
    jsonApiHeaders:
      format === 'json-api' ? (call.jsonApiHeaders ?? factory.jsonApiHeaders ?? true) : false,
    headers: call.headers ?? factory.headers,
  };
}
