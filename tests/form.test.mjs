// Behaviour checks for js/main.js using small DOM stubs (no browser needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { initForm, initTyping } = require('../js/main.js');

function stubForm() {
  const listeners = {};
  const button = { disabled: false };
  const fields = [
    { name: 'access_key', type: 'hidden', value: 'k' },
    { name: 'botcheck', type: 'checkbox', checked: false, value: 'on' },
    { name: 'name', type: 'text', value: 'Ann' },
    { name: 'email', type: 'email', value: 'ann@example.com' },
    { name: 'message', type: 'textarea', value: 'Hi' },
  ];
  return {
    button,
    resetCalled: false,
    elements: fields,
    action: 'https://api.web3forms.com/submit',
    querySelector: (sel) => (sel === 'button' ? button : null),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    reset() { this.resetCalled = true; },
    submit: () => listeners.submit({ preventDefault() {} }),
  };
}
const stubStatus = () => ({ textContent: '', className: '' });

test('form shows success', async () => {
  const form = stubForm(), status = stubStatus();
  let sent;
  initForm(form, status, async (url, opts) => {
    sent = { url, body: JSON.parse(opts.body) };
    return { ok: true, json: async () => ({ success: true }) };
  });
  await form.submit();
  assert.equal(status.textContent, 'Thanks, message sent.');
  assert.ok(form.resetCalled);
  assert.equal(sent.url, 'https://api.web3forms.com/submit');
  assert.deepEqual(sent.body, { access_key: 'k', name: 'Ann', email: 'ann@example.com', message: 'Hi' });
});

test('form shows error on failed fetch', async () => {
  const form = stubForm(), status = stubStatus();
  initForm(form, status, async () => { throw new Error('offline'); });
  await form.submit();
  assert.match(status.textContent, /bokisangelov@gmail\.com/);
  assert.equal(form.resetCalled, false);
});

test('form shows error when the service says no', async () => {
  const form = stubForm(), status = stubStatus();
  initForm(form, status, async () => ({ ok: false, json: async () => ({ success: false }) }));
  await form.submit();
  assert.match(status.textContent, /bokisangelov@gmail\.com/);
});

test('send button disabled while sending', async () => {
  const form = stubForm(), status = stubStatus();
  let release;
  initForm(form, status, () => new Promise((r) => { release = r; }));
  const pending = form.submit();
  assert.equal(form.button.disabled, true);
  release({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(form.button.disabled, false);
});

test('typing ends with the full text', async () => {
  const el = { textContent: '~/bokis-angelov' };
  await initTyping(el, '~/bokis-angelov', 0);
  assert.equal(el.textContent, '~/bokis-angelov');
});

test('reveal content visible without JS and with reduced motion', () => {
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  // Hidden state only exists inside the no-preference block and only under html.js.
  const block = css.match(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/);
  assert.ok(block, 'no-preference media block missing');
  assert.match(block[1], /\.js \.reveal\s*\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(css.replace(block[0], ''), /\.reveal\s*\{[^}]*opacity:\s*0/);
  assert.match(html, /<script>document\.documentElement\.classList\.add\('js'\)<\/script>/);
});
