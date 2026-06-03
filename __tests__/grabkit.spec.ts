import { describe, expect, it } from 'vitest';

import GitHubUserReposData from './mocks/GitHubUserReposData';

import grabkit from '../packages/grabkit/src/grabkit';
import GrabkitError from '../packages/grabkit/src/GrabkitError';
import { isGrabHttpError } from '../packages/grabkit/src/grabGuards';

describe('Grab stuff with the kit', () => {
  it('should return data of this repository on GitHub', async () => {
    const grab = grabkit('https://api.github.com', { format: 'json' });

    const owner = 'mrlemoos';
    const repo = 'grabkit';

    const [data, error, meta] = await grab<GitHubUserReposData>(`GET /repos/${owner}/${repo}`);

    expect(error).toBeNull();
    expect(meta.statusCode).toBe(200);
    expect(data).toHaveProperty('name', repo);
    expect(data).toHaveProperty('owner');
    expect(data?.owner).toHaveProperty('login');
  });

  it('should return a 404 error on a inexistent repo on GitHub', async () => {
    const grab = grabkit('https://api.github.com', { format: 'json' });

    const owner = 'mrlemoos';
    const repo = 'inexistent-repo';

    const [data, error, meta] = await grab(`GET /repos/${owner}/${repo}`);

    expect(data).toBeNull();
    expect(meta).toEqual({});
    expect(isGrabHttpError(error)).toBe(true);
    expect(error).toBeInstanceOf(GrabkitError);
    expect(error?.statusCode).toBe(404);
    expect(error?.body).toMatchObject({
      message: expect.any(String),
      documentation_url: expect.any(String),
    });
  });
});
