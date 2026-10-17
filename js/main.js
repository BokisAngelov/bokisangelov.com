// Minimal motion (typed path, reveal on scroll) and the contact form.
(function () {
  var ERROR_TEXT = 'Could not send. Please email me at bokisangelov@gmail.com.';

  function initTyping(el, text, delay) {
    return new Promise(function (resolve) {
      var i = 0;
      el.textContent = '';
      (function step() {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, delay); else resolve();
      })();
    });
  }

  function initReveal(root) {
    var items = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (n) { io.observe(n); });
  }

  function formData(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || (el.type === 'checkbox' && !el.checked)) return;
      data[el.name] = el.value;
    });
    return data;
  }

  function initForm(form, status, fetchFn, timeoutMs) {
    var button = form.querySelector('button');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (button.disabled) return Promise.resolve();
      button.disabled = true;
      status.className = '';
      status.textContent = 'Sending…';
      // A hanging request ends in the error message instead of "Sending…" forever.
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 15000);
      return fetchFn(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData(form)),
        signal: ctrl.signal,
      })
        .then(function (res) { return res.json().then(function (j) { return res.ok && j.success; }); })
        .catch(function () { return false; })
        .then(function (ok) {
          clearTimeout(timer);
          status.className = ok ? 'ok' : 'err';
          status.textContent = ok ? 'Thanks, message sent.' : ERROR_TEXT;
          if (ok) form.reset();
          button.disabled = false;
        });
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTyping: initTyping, initReveal: initReveal, initForm: initForm };
    return;
  }

  clearTimeout(window.jsFallback);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var typed = document.getElementById('typed');
  if (typed && !reduce) initTyping(typed, typed.textContent, 60);
  initReveal(document);
  var form = document.getElementById('contact-form');
  if (form) initForm(form, document.getElementById('form-status'), window.fetch.bind(window));
})();
