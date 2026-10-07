import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'og.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f8fa"/>
  <text x="80" y="90" fill="#16181d" font-family="sans-serif" font-size="30" font-weight="600" letter-spacing="-1">grabkit</text>
  <text x="80" y="240" fill="#16181d" font-family="sans-serif" font-size="78" font-weight="500" letter-spacing="-4">Make the request.</text>
  <text x="80" y="330" fill="#858b97" font-family="sans-serif" font-size="78" font-weight="500" letter-spacing="-4">Get on with it.</text>
  <rect x="80" y="400" width="640" height="94" rx="24" fill="#3159ed"/>
  <text x="110" y="458" fill="#ffffff" font-family="monospace" font-size="28">GET /users/you</text>
  <text x="80" y="563" fill="#626875" font-family="sans-serif" font-size="23">TypeScript HTTP library. Data, error and meta, together.</text>
  <text x="1010" y="563" fill="#626875" font-family="sans-serif" font-size="20">grabkit.dev</text>
</svg>`;

writeFileSync(out, await sharp(Buffer.from(svg)).png().toBuffer());
console.log(`Wrote ${out}`);
