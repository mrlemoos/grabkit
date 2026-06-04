import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const changelogSrc = join(root, '../../packages/grabkit/CHANGELOG.md');
const changelogDest = join(root, 'src/content/docs/changelog.md');
const referenceDir = join(root, 'src/content/docs/reference');

function titleFromMarkdown(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? fallback;
}

function withFrontmatter(title, description, body) {
  return `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
---

${body}`;
}

function addReferenceFrontmatter(filePath) {
  const body = readFileSync(filePath, 'utf8');
  if (body.startsWith('---')) {
    return;
  }

  const name = basename(filePath, '.md');
  const fallback = name === 'index' ? 'API reference' : name;
  const title =
    name === 'index' ? 'API reference' : titleFromMarkdown(body, fallback);
  const description =
    name === 'index'
      ? 'Generated API reference for the grabkit package.'
      : `API reference: ${title}.`;

  writeFileSync(filePath, withFrontmatter(title, description, body));
}

function walkMarkdown(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walkMarkdown(path);
      continue;
    }
    if (entry.endsWith('.md')) {
      addReferenceFrontmatter(path);
    }
  }
}

mkdirSync(referenceDir, { recursive: true });

const typedoc = spawnSync('pnpm', ['exec', 'typedoc'], {
  cwd: root,
  stdio: 'inherit',
});

if (typedoc.status !== 0) {
  process.exit(typedoc.status ?? 1);
}

walkMarkdown(referenceDir);

if (!existsSync(changelogSrc)) {
  writeFileSync(
    changelogDest,
    withFrontmatter(
      'Changelog',
      'Release history for the grabkit package.',
      `# Changelog

Release notes are published on [GitHub Releases](https://github.com/mrlemoos/grabkit/releases).
`,
    ),
  );
} else {
  const body = readFileSync(changelogSrc, 'utf8');
  writeFileSync(
    changelogDest,
    withFrontmatter(
      'Changelog',
      'Release history for the grabkit package.',
      body,
    ),
  );
}
