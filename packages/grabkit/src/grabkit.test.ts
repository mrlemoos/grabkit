import { afterEach, describe, expect, it, vi } from 'vitest';

import grabkit from './grabkit';
import GrabkitError from './GrabkitError';
import GrabkitTransportError from './GrabkitTransportError';
import GrabkitValidationError from './GrabkitValidationError';
import { isGrabHttpError, isGrabTransportError } from './grabGuards';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('grabkit', () => {
  it('denormalises a JSON:API success response into [data, error, meta]', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: { type: 'items', id: '1', attributes: { name: 'Widget' } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/vnd.api+json' } },
        ),
      ),
    );
    const grab = grabkit('https://api.example.com');

    const [data, error, meta] = await grab<{ id: string; type: string; name: string }>('GET /items/1');

    expect(error).toBeNull();
    expect(data).toEqual({ type: 'items', id: '1', name: 'Widget' });
    expect(meta).toEqual({ statusCode: 200 });
  });

  it('returns [null, GrabkitError, {}] for JSON:API HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            errors: [{ status: '404', title: 'Not Found', detail: 'Missing item' }],
          }),
          { status: 404 },
        ),
      ),
    );
    const grab = grabkit('https://api.example.com');

    const [data, error, meta] = await grab('GET /missing');

    expect(data).toBeNull();
    expect(meta).toEqual({});
    expect(error).toBeInstanceOf(GrabkitError);
    expect(isGrabHttpError(error)).toBe(true);
    expect(error?.statusCode).toBe(404);
    expect(error?.errors).toEqual([{ status: '404', title: 'Not Found', detail: 'Missing item' }]);
    expect(error?.message).toBe('Missing item');
  });

  it('returns [null, GrabkitTransportError, { statusCode: 0 }] when the response is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', { status: 200 })));
    const grab = grabkit('https://api.example.com');

    const [data, error, meta] = await grab('GET /html');

    expect(data).toBeNull();
    expect(meta).toEqual({ statusCode: 0 });
    expect(isGrabTransportError(error)).toBe(true);
  });

  it('returns [null, GrabkitTransportError, { statusCode: 0 }] when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const grab = grabkit('https://api.example.com');

    const [data, error, meta] = await grab('GET /offline');

    expect(data).toBeNull();
    expect(meta).toEqual({ statusCode: 0 });
    expect(isGrabTransportError(error)).toBe(true);
  });

  it('treats 204 as success with null data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    const grab = grabkit('https://api.example.com');

    const [data, error, meta] = await grab('DELETE /items/1');

    expect(error).toBeNull();
    expect(data).toBeNull();
    expect(meta).toEqual({ statusCode: 204 });
  });

  it('serialises JSON:API write bodies and sets media type headers by default', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const grab = grabkit('https://api.example.com');

    await grab('POST /users', { body: { type: 'users', name: 'Leo' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ data: { type: 'users', attributes: { name: 'Leo' } } }),
        headers: expect.any(Headers),
      }),
    );

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get('Accept')).toBe('application/vnd.api+json');
    expect(headers.get('Content-Type')).toBe('application/vnd.api+json');
  });

  it('throws GrabkitValidationError before fetch when type is missing on write', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const grab = grabkit('https://api.example.com');

    await expect(grab('POST /users', { body: { name: 'Leo' } })).rejects.toThrow(GrabkitValidationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns plain JSON when format is json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 1, name: 'Plain' }), { status: 200 })),
    );
    const grab = grabkit('https://api.example.com', { format: 'json' });

    const [data, error, meta] = await grab<{ id: number; name: string }>('GET /items/1');

    expect(error).toBeNull();
    expect(data).toEqual({ id: 1, name: 'Plain' });
    expect(meta).toEqual({ statusCode: 200 });
  });

  it('ignores baseURL when the endpoint path is absolute', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ data: { type: 'items', id: '1', attributes: {} } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const grab = grabkit('https://api.example.com');

    await grab('GET https://other.example.com/resource');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://other.example.com/resource',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('prepends baseURL for relative paths', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ data: { type: 'users', id: '1', attributes: {} } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const grab = grabkit('https://api.example.com');

    await grab('GET /users');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
