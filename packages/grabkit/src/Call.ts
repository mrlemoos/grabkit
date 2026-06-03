import type AnyRecord from './AnyRecord';
import type Endpoint from './Endpoint';
import type HttpMethod from './HttpMethod';
import type ResolvedGrabkitOptions from './GrabkitOptions';
import type UrlShape from './UrlShape';
import GrabkitTransportError from './GrabkitTransportError';
import { serialiseBody } from './jsonApi';
import methods from './methods';

const EMPTY_STATUSES = new Set([204, 205, 304]);

interface SendOptions {
  body?: unknown;
  headers?: Headers | AnyRecord;
  resolved: ResolvedGrabkitOptions;
}

interface FetchOutcome {
  ok: true;
  status: number;
  parsed: unknown;
  empty: boolean;
}

interface FetchFailure {
  ok: false;
  error: GrabkitTransportError;
}

type SendOutcome = FetchOutcome | FetchFailure;

class Call {
  private method: HttpMethod;
  private url: UrlShape;

  constructor(endpoint: Endpoint, private baseURL?: string) {
    if (!endpoint) {
      throw new Error('grabkit: Where you call? I think you forgot to pass an endpoint \\_(-_-)_/.');
    }

    const trimmed = String(endpoint).trim();
    const spaceIndex = trimmed.indexOf(' ');

    if (spaceIndex === -1) {
      throw new Error(
        'grabkit: I think you forgot the method in your endpoint. It should be like `GET /users/` for instance.',
      );
    }

    const method = trimmed.slice(0, spaceIndex).trim().toUpperCase();
    const pathPart = trimmed.slice(spaceIndex + 1).trim();
    const uri = this.resolveUri(pathPart);

    this.validateMethod(method);
    this.validateURI(uri);

    this.url = uri as UrlShape;
    this.method = method as HttpMethod;

    this.debugIfTest();
  }

  async send({ body, headers, resolved }: SendOptions): Promise<SendOutcome> {
    const requestBody = this.serialiseRequestBody(body, resolved);

    try {
      const requestHeaders = this.buildHeaders(resolved, headers, body);

      const response = await fetch(this.url, {
        method: this.method,
        body: requestBody,
        headers: requestHeaders,
      });

      if (EMPTY_STATUSES.has(response.status)) {
        return { ok: true, status: response.status, parsed: null, empty: true };
      }

      const text = await response.text();

      if (text.length === 0) {
        return {
          ok: false,
          error: new GrabkitTransportError('Grabkit: empty response body'),
        };
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(text);
      } catch (cause) {
        return {
          ok: false,
          error: new GrabkitTransportError('Grabkit: failed to parse JSON response', cause),
        };
      }

      return { ok: true, status: response.status, parsed, empty: false };
    } catch (cause) {
      return {
        ok: false,
        error: new GrabkitTransportError('Grabkit: network request failed', cause),
      };
    }
  }

  private serialiseRequestBody(body: unknown, resolved: ResolvedGrabkitOptions): string | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }

    if (typeof body !== 'object') {
      return undefined;
    }

    if (resolved.format === 'json-api') {
      return JSON.stringify(serialiseBody(body as Record<string, unknown>, resolved.casing));
    }

    return JSON.stringify(body);
  }

  private buildHeaders(
    resolved: ResolvedGrabkitOptions,
    callHeaders: Headers | AnyRecord | undefined,
    body: unknown,
  ): Headers {
    const headers = new Headers(resolved.headers as HeadersInit | undefined);

    if (callHeaders) {
      const entries =
        callHeaders instanceof Headers ? callHeaders.entries() : Object.entries(callHeaders as AnyRecord);

      for (const [key, value] of entries) {
        headers.set(key, String(value));
      }
    }

    const hasBody = body !== undefined && body !== null;

    if (resolved.format === 'json-api' && resolved.jsonApiHeaders) {
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/vnd.api+json');
      }

      if (hasBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/vnd.api+json');
      }
    } else if (resolved.format === 'json' && hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  private resolveUri(pathPart: string): string {
    if (pathPart.startsWith('http://') || pathPart.startsWith('https://')) {
      return pathPart;
    }

    const relative = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    return `${this.baseURL ?? ''}${relative}`;
  }

  private debugIfTest(): void {
    if (process.env.NODE_ENV === 'test') {
      console.log(`grabkit: the method has been set to be '${this.method}' at '${this.url}'`);
    }
  }

  private validateURI(uri: string): void {
    if (typeof uri !== 'string') {
      throw new Error(
        `grabkit: Where you call? I think you forgot to pass a URI. \nYou should give us a URI like this: call()('GET /users') so we can get your data :) (if it helps, we've got ${uri})`,
      );
    }

    if (!(uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('/'))) {
      throw new Error(
        'grabkit: I can be wrong, but I think you forgot to add "http://" or "https://" at the beginning of your URI. \\_(-_-)_/ We don\'t have it automatically because we\'re not sure which of them you wanna use as prefix. \n',
      );
    }

    if (uri.startsWith('/') && typeof this.baseURL !== 'string') {
      throw new Error(
        'grabkit: You have to give us a baseURL if you want to use a relative URI. Or you meant to use octokit, not sure yet :/\n',
      );
    }
  }

  private validateMethod(method: string): void {
    if (typeof method !== 'string') {
      throw new Error(
        `grabkit: Where you call? I think you forgot to pass a method. \nYou should give us a method like this: call()('GET /users') so we can get your data :P (if it helps, we've got ${method})`,
      );
    }

    if (!methods.includes(method)) {
      throw new Error(`grabkit: I can be wrong, but I think there's no HTTP method called '${method}'`);
    }
  }
}

export default Call;

export type { SendOutcome };
