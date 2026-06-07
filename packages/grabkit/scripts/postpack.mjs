import { unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));

for (const file of ['README.md', 'LICENSE']) {
  try {
    unlinkSync(join(packageRoot, file));
  } catch {
    // already removed
  }
}
