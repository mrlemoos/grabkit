import GrabkitError from './GrabkitError';
import GrabkitTransportError from './GrabkitTransportError';

export function isGrabHttpError(
  error: GrabkitError | GrabkitTransportError | null,
): error is GrabkitError {
  return error instanceof GrabkitError;
}

export function isGrabTransportError(
  error: GrabkitError | GrabkitTransportError | null,
): error is GrabkitTransportError {
  return error instanceof GrabkitTransportError;
}
