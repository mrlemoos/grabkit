import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = join(packageRoot, '../..');

for (const file of ['README.md', 'LICENSE']) {
  copyFileSync(join(workspaceRoot, file), join(packageRoot, file));
}
