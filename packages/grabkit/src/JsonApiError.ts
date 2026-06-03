interface JsonApiError {
  status?: string;
  title?: string;
  detail?: string;
  code?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export default JsonApiError;

export function parseJsonApiErrors(body: unknown): JsonApiError[] {
  if (body === null || typeof body !== 'object') {
    return [];
  }

  const errors = (body as { errors?: unknown }).errors;

  if (!Array.isArray(errors)) {
    return [];
  }

  return errors.filter((error): error is JsonApiError => error !== null && typeof error === 'object');
}

export function messageFromJsonApiErrors(errors: JsonApiError[]): string {
  if (errors.length === 0) {
    return 'Grabkit: request failed';
  }

  const messages = errors.map((error) => error.detail ?? error.title).filter((message): message is string => Boolean(message));

  if (messages.length > 0) {
    return messages.join('; ');
  }

  return 'Grabkit: request failed';
}
