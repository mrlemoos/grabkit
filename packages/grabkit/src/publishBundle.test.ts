import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function listPackFiles(): string[] {
  const { stdout, stderr, status } = spawnSync('npm', ['pack', '--dry-run'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  if (status !== 0) {
    throw new Error(stderr || stdout || `npm pack exited with code ${status}`);
  }

  const result = `${stdout}\n${stderr}`;

  const files: string[] = [];
  for (const line of result.split('\n')) {
    const match = line.match(/npm notice [\d.]+(?:k|M|G|T)?B (.+)$/);
    if (match) {
      files.push(match[1]);
    }
  }
  return files;
}

describe('publish bundle', () => {
  it('includes README.md in the npm tarball', () => {
    expect(listPackFiles()).toContain('README.md');
  });

  it('includes LICENSE in the npm tarball', () => {
    expect(listPackFiles()).toContain('LICENSE');
  });
});
