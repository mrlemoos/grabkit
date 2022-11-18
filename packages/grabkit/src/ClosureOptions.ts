import type AnyRecord from './AnyRecord';

interface ClosureOptions<Body> {
  body?: Body;
  headers?: Headers | AnyRecord;
  log?: (message: any) => void | boolean; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default ClosureOptions;
