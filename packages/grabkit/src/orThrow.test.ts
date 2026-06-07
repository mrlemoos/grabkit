import { afterEach, describe, expect, it, vi } from 'vitest';

import grabkit from './grabkit';
import GrabkitError from './GrabkitError';
import GrabkitTransportError from './GrabkitTransportError';
import orThrow from './orThrow';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('orThrow', () => {
  it('returns [data, meta] on success', async () => {
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

    const [data, meta] = await orThrow(grab<{ id: string; type: string; name: string }>('GET /items/1'));

    expect(data).toEqual({ type: 'items', id: '1', name: 'Widget' });
    expect(meta).toEqual({ statusCode: 200 });
  });

  it('throws GrabkitError on HTTP failure', async () => {
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

    await expect(orThrow(grab('GET /missing'))).rejects.toBeInstanceOf(GrabkitError);
  });

  it('throws GrabkitTransportError on transport failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const grab = grabkit('https://api.example.com');

    await expect(orThrow(grab('GET /offline'))).rejects.toBeInstanceOf(GrabkitTransportError);
  });

  it('returns [null, meta] for empty 204 success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    const grab = grabkit('https://api.example.com');

    const [data, meta] = await orThrow(grab('DELETE /items/1'));

    expect(data).toBeNull();
    expect(meta).toEqual({ statusCode: 204 });
  });
});
