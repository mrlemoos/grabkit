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

  it.each([
    { runtime: 'Node ESM', args: ['--input-type=module', '-e', "const m = await import('grabkit'); console.log(typeof m.default)"] },
    { runtime: 'Node CJS', args: ['-e', "console.log(typeof require('grabkit').default)"] },
  ])('exposes a callable default export to $runtime consumers', ({ args }) => {
    // Self-reference by package name resolves through `exports`, like a real install.
    const { stdout, stderr, status } = spawnSync(process.execPath, args, { cwd: packageRoot, encoding: 'utf8' });

    expect(stderr).toBe('');
    expect(status).toBe(0);
    expect(stdout.trim()).toBe('function');
  });
});
