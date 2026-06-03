class GrabkitValidationError extends Error {
  readonly name = 'GrabkitValidationError';

  constructor(message: string) {
    super(message);
  }
}

export default GrabkitValidationError;
