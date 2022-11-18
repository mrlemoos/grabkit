import GitHubUserReposData from './mocks/GitHubUserReposData';
import GitHubUserReposError from './mocks/GitHubUserReposError';

import grabkit from '../packages/grabkit/src/grabkit';

describe('Grab stuff with the kit', () => {
  it('should return data of this repository on GitHub', async () => {
    const grab = grabkit('https://api.github.com');

    const owner = 'mrlemoos';
    const repo = 'grabkit';

    const [response, status] = await grab<GitHubUserReposData>(`GET /repos/${owner}/${repo}`);

    expect(status).toBe(200);
    expect(response?.data).toHaveProperty('name', repo);
    expect(response?.data).toHaveProperty('owner');
    expect(response?.data?.owner).toHaveProperty('login');
    expect(response?.error).toBeUndefined();
  });

  it('should return a 404 error on a inexistent repo on GitHub', async () => {
    const grab = grabkit('https://api.github.com');

    const owner = 'mrlemoos';
    const repo = 'inexistent-repo';

    const [response, status] = await grab<GitHubUserReposData, GitHubUserReposError>(`GET /${owner}/${repo}`);

    expect(status).toBe(404);
    expect(response?.data).toBeUndefined();
    expect(response?.error).toHaveProperty('message');
    expect(response?.error).toHaveProperty('documentation_url');
  });
});
