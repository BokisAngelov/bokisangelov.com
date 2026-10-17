// Search and share metadata, plus the small extra files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const at = (p) => new URL(`../${p}`, import.meta.url);
const read = (p) => readFileSync(at(p), 'utf8');

test('meta tags', () => {
  const h = read('index.html');
  assert.match(h, /<html lang="en">/);
  assert.match(h, /<title>Bokis Angelov — Senior Software Engineer &amp; Team Lead<\/title>/);
  assert.match(h, /<meta name="description" content="[^"]{50,160}">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/bokisangelov.com\/">/);
  assert.match(h, /<meta property="og:title" content="[^"]+">/);
  assert.match(h, /<meta property="og:description" content="[^"]+">/);
  assert.match(h, /<meta property="og:image" content="https:\/\/bokisangelov.com\/img\/og.png">/);
  assert.match(h, /<meta property="og:url" content="https:\/\/bokisangelov.com\/">/);
  assert.match(h, /<meta name="twitter:card" content="summary_large_image">/);
});

test('extra files', () => {
  for (const p of ['404.html', 'robots.txt', 'sitemap.xml', 'img/og.png']) assert.ok(existsSync(at(p)), `missing ${p}`);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/bokisangelov.com\/sitemap.xml/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/bokisangelov.com\/<\/loc>/);
  const notFound = read('404.html');
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /href="\/"/);
  assert.match(notFound, /href="\/css\/style.css"/);
});

test('og image is 1200x630', () => {
  const png = readFileSync(at('img/og.png'));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
