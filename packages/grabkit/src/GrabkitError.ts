import type JsonApiError from './JsonApiError';
import { messageFromJsonApiErrors, parseJsonApiErrors } from './JsonApiError';

class GrabkitError extends Error {
  readonly name = 'GrabkitError';

  constructor(
    message: string,
    readonly statusCode: number,
    readonly body: unknown,
    readonly errors: JsonApiError[] = [],
  ) {
    super(message);
  }

  static fromResponse(statusCode: number, body: unknown): GrabkitError {
    const errors = parseJsonApiErrors(body);
    const message =
      errors.length > 0 ? messageFromJsonApiErrors(errors) : `Grabkit: request failed with status ${statusCode}`;

    return new GrabkitError(message, statusCode, body, errors);
  }
}

export default GrabkitError;
