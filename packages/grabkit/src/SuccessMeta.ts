/** Third tuple slot on a successful grab. */
interface SuccessMeta {
  statusCode: number;
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
}

export default SuccessMeta;

/** Third tuple slot on a JSON:API HTTP error grab. */
export type HttpErrorMeta = Record<string, never>;

/** Third tuple slot on a transport failure grab. */
export interface TransportMeta {
  statusCode: 0;
}

export type GrabMeta = SuccessMeta | HttpErrorMeta | TransportMeta;

export const HTTP_ERROR_META: HttpErrorMeta = {};

export const TRANSPORT_META: TransportMeta = { statusCode: 0 };
