// Articles: each one is a plain page under articles/<slug>/, listed on the home page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const at = (p) => new URL(`../${p}`, import.meta.url);
const read = (p) => readFileSync(at(p), 'utf8');
const slugs = () => readdirSync(at('articles/'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

const BANNED = ['Innovade', 'CARDET', 'GitHub', 'cPanel', 'Google Workspace', 'Teamwork', 'Claude'];

test('there is at least one article', () => {
  assert.ok(slugs().length > 0);
});

for (const slug of slugs()) {
  const page = `articles/${slug}/index.html`;
  const url = `https://bokisangelov.com/articles/${slug}/`;

  test(`${slug}: page and metadata`, () => {
    assert.ok(existsSync(at(page)), `missing ${page}`);
    const h = read(page);
    assert.match(h, /<html lang="en">/);
    assert.match(h, /<title>[^<]+ — Bokis Angelov<\/title>/);
    assert.match(h, /<meta name="description" content="[^"]{50,160}">/);
    assert.ok(h.includes(`<link rel="canonical" href="${url}">`), 'canonical');
    assert.ok(h.includes(`<meta property="og:url" content="${url}">`), 'og:url');
    assert.match(h, /<link rel="stylesheet" href="\/css\/style.css">/);
    assert.match(h, /<h1>[^<]+<\/h1>/);
    assert.match(h, /href="\/"/);
  });

  test(`${slug}: linked from home and listed in the sitemap`, () => {
    assert.ok(read('index.html').includes(`href="/articles/${slug}/"`), 'not linked from home');
    assert.ok(read('sitemap.xml').includes(`<loc>${url}</loc>`), 'not in sitemap');
  });

  test(`${slug}: no company or tool names`, () => {
    const t = read(page).replace(/<[^>]+>/g, ' ');
    for (const w of BANNED) assert.ok(!t.includes(w), `banned word present: ${w}`);
  });
}
