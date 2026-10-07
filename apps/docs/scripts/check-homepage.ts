// Run with the preview server active: node apps/docs/scripts/check-homepage.ts
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const session = `grabkit-check-${process.pid}`;
const browser = (...args: string[]) =>
  execFileSync('agent-browser', ['--session', session, ...args], { encoding: 'utf8' });
const origin = process.argv[2] ?? 'http://localhost:4321';

try {
  browser('open', origin);
  for (const width of [1440, 390, 320]) {
    browser('set', 'viewport', String(width), '900');
    const result = JSON.parse(
      JSON.parse(
        browser(
          'eval',
          `JSON.stringify({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      heading: document.querySelector('h1')?.textContent
    })`,
        ),
      ),
    );
    assert.equal(result.overflow, false);
    assert.match(result.heading, /Make the request/);
  }
  browser('set', 'viewport', '1440', '1100');
  browser('open', origin);
  for (const slot of ['error', 'meta', 'data']) {
    browser('click', `[data-slot="${slot}"]`);
    const result = JSON.parse(
      JSON.parse(
        browser(
          'eval',
          `JSON.stringify({
      selected: document.querySelector('[data-slot="${slot}"]').getAttribute('aria-pressed'),
      count: document.querySelectorAll('[data-slot][aria-pressed="true"]').length,
      text: document.querySelector('#result-code').textContent
    })`,
        ),
      ),
    );
    assert.equal(result.selected, 'true', `${slot}: ${JSON.stringify(result)}`);
    assert.equal(result.count, 1);
    assert.ok(result.text.includes(`${slot} =`));
  }
  browser('click', '[data-copy]');
  assert.match(browser('get', 'text', '#copy-status'), /Copied\.|Copy this command:/);
  const html = await (await fetch(origin)).text();
  const paths = [...new Set([...html.matchAll(/href="(\/[^"#]*)"/g)].map((match) => match[1]))];
  for (const path of paths) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `${path} must resolve`);
  }
  console.log('Homepage checks passed: responsive layout, tuple selection, install copy and local links.');
} finally {
  browser('close');
}
