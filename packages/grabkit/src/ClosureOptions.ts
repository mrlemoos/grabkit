import type Casing from './Casing';
import type GrabkitFormat from './GrabkitFormat';
import type AnyRecord from './AnyRecord';
import type GrabkitFactoryOptions from './GrabkitOptions';

interface ClosureOptions<Body> extends GrabkitFactoryOptions {
  body?: Body;
  /** @deprecated Use factory-level headers; per-call headers merge here. */
  headers?: Headers | AnyRecord;
  /** @default true. Log HTTP errors via `console.error` when no custom logger is set. */
  log?: (message: string) => void | boolean;
}

export default ClosureOptions;
