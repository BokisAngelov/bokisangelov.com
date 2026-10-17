// Content and constraint checks for index.html (spec: website/specs/2026-10-17-personal-site-design.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = () => read('index.html');
// Collapse whitespace and decode &amp; so copy can wrap freely in the markup.
const text = () => html().replace(/\s+/g, ' ').replace(/&amp;/g, '&');

const COPY = [
  'Bokis Angelov',
  '~/bokis-angelov',
  'Senior Software Engineer & Team Lead',
  'Web platforms from architecture to launch, and AI automation that takes repeated steps out of everyday procedures.',
  'python', 'php', 'ai-agents',
  'Architecture', 'Systems that are simple to run and easy to change.',
  'Full-stack development', 'Python, PHP and JavaScript, from database to browser.',
  'AI and automation', 'Agents and scripts that take over repeated manual work.',
  'Leading developers', 'Code review, testing, mentoring and planning.',
  'Python', 'Django', 'PHP', 'MySQL', 'REST APIs',
  'JavaScript', 'HTML', 'CSS',
  'WordPress', 'Moodle', 'LearnDash',
  'Claude Code', 'AI agents', 'LLM integration', 'Workflow automation',
  'Git', 'CI/CD', 'Automated testing', 'Code review', 'Agile',
  'Plan first, then build.',
  'Write it down, so you can understand it.',
  'Automate the steps people repeat.',
  'Want to talk about something?',
  'https://www.linkedin.com/in/bokis-angelov/',
  '© 2026 Bokis Angelov',
];

const BANNED = [
  'Innovade', 'CARDET', 'KnackMind', 'Joomla', 'Node.js', 'Claude API',
  'Knossos', 'iGoCyprus', 'Tangerine', 'Animafest', '100+',
  'passionate', 'cutting-edge', 'innovative', 'leverage', 'synergy', 'world-class', 'transformation',
];

test('has all spec copy', () => {
  const t = text();
  for (const s of COPY) assert.ok(t.includes(s), `missing: ${s}`);
});

test('no banned words', () => {
  const t = text().toLowerCase();
  for (const w of BANNED) assert.ok(!t.includes(w.toLowerCase()), `banned word present: ${w}`);
});

test('no external requests on load', () => {
  const h = html();
  // GoatCounter (async, analytics only) is the one allowed exception; see the next test.
  assert.doesNotMatch(h.replace(/<script data-goatcounter[^>]*><\/script>/, ''), /<script[^>]+src=["'](?:https?:)?\/\//i);
  assert.doesNotMatch(h, /<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:/i);
  assert.doesNotMatch(h, /fonts\.googleapis|fonts\.gstatic/i);
});

test('form wiring', () => {
  const h = html();
  assert.match(h, /<form[^>]+id="contact-form"/);
  assert.match(h, /name="access_key"\s+value="5f452f17-3522-4681-bc66-075861c9c717"/);
  assert.match(h, /name="botcheck"/);
  assert.match(h, /id="form-status"/);
  for (const f of ['name', 'email', 'message']) {
    assert.match(h, new RegExp(`<label[^>]+for="f-${f}"`), `label for ${f}`);
    assert.match(h, new RegExp(`id="f-${f}"[^>]*name="${f}"[^>]*required`), `required field ${f}`);
  }
});

test('photo has size and alt', () => {
  assert.match(html(), /<img[^>]+width="140"[^>]+height="140"[^>]+alt="Bokis Angelov"/);
});

test('goatcounter is the only external script', () => {
  const h = html();
  assert.match(h, /<script data-goatcounter="https:\/\/bokis\.goatcounter\.com\/count" async src="https:\/\/gc\.zgo\.at\/count\.js"><\/script>/);
  const external = [...h.matchAll(/<script[^>]+src="((?:https?:)?\/\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(external, ['https://gc.zgo.at/count.js']);
});

test('external links open in a new tab', () => {
  const links = [...html().matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)]
    .filter((m) => !m[1].startsWith('https://bokisangelov.com'));
  assert.ok(links.length > 0, 'expected at least the LinkedIn link');
  for (const [tag, href] of links) {
    assert.match(tag, /target="_blank"/, `${href} opens in the same tab`);
    assert.match(tag, /rel="[^"]*noopener[^"]*"/, `${href} lacks rel=noopener`);
  }
});
