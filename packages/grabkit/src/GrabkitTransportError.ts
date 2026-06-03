class GrabkitTransportError extends Error {
  readonly name = 'GrabkitTransportError';

  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}

export default GrabkitTransportError;
