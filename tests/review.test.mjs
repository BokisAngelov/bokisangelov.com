// Regression tests for the final-review findings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { initForm } = require('../js/main.js');
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

function luminance(hex) {
  const c = hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

test('page stays visible if main.js fails to load', () => {
  const html = read('index.html');
  const js = read('js/main.js');
  // Inline script schedules removal of the js class; main.js cancels it.
  assert.match(html, /window\.jsFallback = setTimeout\(function \(\) \{ document\.documentElement\.classList\.remove\('js'\) \}, 3000\)/);
  assert.match(js, /clearTimeout\(window\.jsFallback\)/);
});

test('all text colours meet 4.5:1 on the page background', () => {
  const css = read('css/style.css');
  for (const [, hex] of css.matchAll(/(?:^|[;{\s])color:\s*(#[0-9a-f]{6})/gi)) {
    assert.ok(contrast(hex, '#0e1116') >= 4.5, `${hex} is ${contrast(hex, '#0e1116').toFixed(2)}:1`);
  }
});

test('hero text is not hidden behind the reveal animation', () => {
  const hero = read('index.html').match(/<header class="hero">[\s\S]*?<\/header>/)[0];
  assert.doesNotMatch(hero, /reveal/);
});

test('box hover lift wins over the revealed state', () => {
  assert.match(read('css/style.css'), /\.js \.box\.reveal\.in:hover\s*\{[^}]*transform:\s*translateY\(-2px\)/);
});

test('form gives up after the timeout and shows the error', async () => {
  const listeners = {};
  const form = {
    elements: [], action: 'x', reset() {},
    querySelector: () => ({ disabled: false }),
    addEventListener: (t, fn) => { listeners[t] = fn; },
  };
  const status = { textContent: '', className: '' };
  let calls = 0, sawSignal = false;
  initForm(form, status, (url, opts) => {
    calls++;
    sawSignal = Boolean(opts.signal);
    return new Promise((_, reject) => opts.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  }, 20);
  const first = listeners.submit({ preventDefault() {} });
  await listeners.submit({ preventDefault() {} }); // second click while pending
  await first;
  assert.equal(calls, 1);
  assert.ok(sawSignal, "fetch was not given an AbortSignal");
  assert.match(status.textContent, /bokisangelov@gmail\.com/);
});
