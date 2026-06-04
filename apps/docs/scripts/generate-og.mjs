import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'og.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0b0f14"/>
  <rect x="80" y="80" width="1040" height="470" rx="24" fill="#111820" stroke="#1e2832" stroke-width="2"/>
  <g transform="translate(120 205)">
    <rect width="88" height="88" rx="16" fill="#0f1318" stroke="#1e2832"/>
    <path d="M56 22v33c0 28.6-19.8 50.6-44 50.6q-11-8.8 0-19.8" fill="none" stroke="#5ee4a8" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" transform="translate(14 8) scale(0.72)"/>
    <circle cx="24" cy="78" r="8" fill="#e8b86d"/>
  </g>
  <text x="240" y="255" fill="#f4f7fb" font-family="Georgia, 'Times New Roman', serif" font-size="72" letter-spacing="-2">Grabkit</text>
  <text x="240" y="330" fill="#9aa8b8" font-family="system-ui, -apple-system, sans-serif" font-size="34">TypeScript HTTP client · JSON:API by default</text>
  <text x="240" y="395" fill="#5ee4a8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="28">const [data, error, meta] = await grab('GET /users/1')</text>
</svg>`;

writeFileSync(out, await sharp(Buffer.from(svg)).png().toBuffer());
console.log(`Wrote ${out}`);
