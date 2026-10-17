// The Pages workflow must run the tests and deploy only when they pass.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const wf = () => readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');

test('deploy waits for the tests', () => {
  const y = wf();
  assert.match(y, /node --test "tests\/\*\.test\.mjs"/);
  assert.match(y, /deploy:[\s\S]*needs: test/);
  assert.match(y, /actions\/deploy-pages@v4/);
});

test('published files exclude tests and repo tooling', () => {
  const y = wf();
  assert.match(y, /cp -r index\.html 404\.html thanks\.html articles css js img favicon\.svg favicon\.ico apple-touch-icon\.png robots\.txt sitemap\.xml CNAME _site\//);
  assert.match(y, /path: _site/);
});
