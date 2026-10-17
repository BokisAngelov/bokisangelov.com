// Asset checks: photo exports, favicon and stylesheet exist and stay small.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const at = (p) => new URL(p, root);

test('assets exist and are small', () => {
  const photos = ['img/photo-140.webp', 'img/photo-280.webp', 'img/photo-140.jpg', 'img/photo-280.jpg'];
  for (const p of [...photos, 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'css/style.css']) {
    assert.ok(existsSync(at(p)), `missing ${p}`);
  }
  for (const p of photos) assert.ok(statSync(at(p)).size < 30 * 1024, `${p} is over 30 KB`);
  assert.match(readFileSync(at('favicon.svg'), 'utf8'), /BA/);
});

test('page links the favicons', () => {
  const h = readFileSync(at('index.html'), 'utf8');
  assert.match(h, /<link rel="icon" href="favicon.svg" type="image\/svg\+xml">/);
  assert.match(h, /<link rel="apple-touch-icon" href="apple-touch-icon.png">/);
});
