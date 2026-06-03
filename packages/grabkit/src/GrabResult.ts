import type GrabkitError from './GrabkitError';
import type GrabkitTransportError from './GrabkitTransportError';
import type { HttpErrorMeta, TransportMeta } from './SuccessMeta';
import type SuccessMeta from './SuccessMeta';

type GrabResult<Data> =
  | [data: Data, error: null, meta: SuccessMeta]
  | [data: null, error: GrabkitError, meta: HttpErrorMeta]
  | [data: null, error: GrabkitTransportError, meta: TransportMeta];

export default GrabResult;
