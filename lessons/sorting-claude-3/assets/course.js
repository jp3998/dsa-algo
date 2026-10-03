/* Order and Sorting from First Principles: page behaviours and components.
   Classic script, no modules, one global: window.Course. See assets/README.md. */
(function (root) {
  'use strict';
  var DOC = root.document;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var STORE_KEY = 'order-course:v1';
  var MAX_STEPS = 20000;

  /* ------------------------------------------------------------------ helpers */
  function el(tag, attrs, kids) {
    var e = DOC.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : String(v));
      }
    }
    if (kids) {
      for (var i = 0; i < kids.length; i++) {
        var c = kids[i];
        if (c === null || c === undefined) continue;
        e.appendChild(typeof c === 'string' ? DOC.createTextNode(c) : c);
      }
    }
    return e;
  }
  function sv(tag, attrs, kids) {
    var e = DOC.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] !== null && attrs[k] !== undefined) {
      if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, String(attrs[k]));
    }
    if (kids) kids.forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function qa(node, sel) { return Array.prototype.slice.call(node.querySelectorAll(sel)); }
  function prefersReduced() {
    try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  /* ------------------------------------------------------------------ math */
  function mathIn(node) {
    if (!node || typeof root.renderMathInElement !== 'function' || typeof root.katex === 'undefined') return;
    try {
      root.renderMathInElement(node, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false,
        strict: 'ignore'
      });
    } catch (e) { /* leave raw TeX */ }
  }

  /* ------------------------------------------------------------------ rng, fmt, parseArray */
  function rng(seed) {
    var a = (typeof seed === 'string' ? hashStr(seed) : (seed | 0)) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    var s = String(Math.abs(n));
    if (/e/i.test(s)) return String(n);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (n < 0 ? '−' : '') + parts.join('.');
  }
  function parseArray(text, o) {
    o = o || {};
    var t = String(text === null || text === undefined ? '' : text).replace(/[−–]/g, '-').trim();
    if (!t) {
      if (o.allowEmpty) return { ok: true, values: [] };
      return { ok: false, values: [], error: 'Enter at least one number, separated by commas or spaces.' };
    }
    var toks = t.split(/[\s,;]+/).filter(Boolean);
    var vals = [];
    for (var i = 0; i < toks.length; i++) {
      if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(toks[i])) {
        return { ok: false, values: [], error: '“' + toks[i] + '” is not a number. Use numbers separated by commas or spaces.' };
      }
      var v = Number(toks[i]);
      if (o.integers && Math.floor(v) !== v) {
        return { ok: false, values: [], error: '“' + toks[i] + '” is not a whole number. This tool takes integers only.' };
      }
      vals.push(v);
    }
    if (o.maxN && vals.length > o.maxN) {
      return { ok: false, values: [], tooMany: true, error: 'Use at most ' + o.maxN + ' numbers: you entered ' + vals.length + '.' + (o.capReason ? ' ' + o.capReason : '') };
    }
    for (var j = 0; j < vals.length; j++) {
      if ((o.min !== undefined && vals[j] < o.min) || (o.max !== undefined && vals[j] > o.max)) {
        var lo = o.min !== undefined ? o.min : '−∞', hi = o.max !== undefined ? o.max : '∞';
        return { ok: false, values: [], error: 'Each number must be between ' + lo + ' and ' + hi + ': ' + vals[j] + ' is outside that range.' };
      }
    }
    if (o.allowDuplicates === false) {
      var seen = {};
      for (var k = 0; k < vals.length; k++) {
        if (seen[vals[k]]) return { ok: false, values: [], error: o.duplicateReason || ('Each number must be distinct: ' + vals[k] + ' appears more than once.') };
        seen[vals[k]] = true;
      }
    }
    return { ok: true, values: vals };
  }

  /* ------------------------------------------------------------------ progress (localStorage, always try/catch) */
  var memStore = null;
  function readStore() {
    try {
      var s = root.localStorage.getItem(STORE_KEY);
      if (s) { var o = JSON.parse(s); if (o && typeof o === 'object' && o.lessons) return o; }
    } catch (e) { /* ignore */ }
    return memStore || { lessons: {} };
  }
  function writeStore(o) {
    memStore = o;
    try { root.localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
  }
  function lessonId() {
    var m = DOC.querySelector('[data-lesson]');
    return (m && m.getAttribute('data-lesson')) || 'page';
  }
  function getProgress(id) {
    var l = readStore().lessons[String(id === undefined ? lessonId() : id)] || {};
    return { attempted: (l.attempted || []).slice(), correct: (l.correct || []).slice(), skipped: (l.skipped || []).slice() };
  }
  function progAdd(kind, val) {
    var s = readStore(), id = lessonId();
    var l = s.lessons[id] = s.lessons[id] || {};
    var list = l[kind] = l[kind] || [];
    if (list.indexOf(val) < 0) { list.push(val); writeStore(s); }
  }
  function progDel(kind, val) {
    var s = readStore(), l = s.lessons[lessonId()];
    if (!l || !l[kind]) return;
    var i = l[kind].indexOf(val);
    if (i >= 0) { l[kind].splice(i, 1); writeStore(s); }
  }

  /* ------------------------------------------------------------------ code blocks */
  function highlightLine(line) {
    try {
      if (root.Prism && root.Prism.languages && root.Prism.languages.python) {
        return root.Prism.highlight(line, root.Prism.languages.python, 'python');
      }
    } catch (e) { /* fall through */ }
    return esc(line);
  }
  function copyText(text, btn) {
    function done(ok) {
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(function () { btn.textContent = old; }, 1500);
    }
    try {
      if (root.navigator && root.navigator.clipboard && root.isSecureContext) {
        root.navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
        return;
      }
    } catch (e) { /* fall through */ }
    fallback();
    function fallback() {
      try {
        var ta = el('textarea', { 'aria-hidden': 'true', style: 'position:fixed;left:-9999px;top:0' });
        ta.value = text; DOC.body.appendChild(ta); ta.select();
        var ok = DOC.execCommand('copy');
        DOC.body.removeChild(ta);
        done(ok);
      } catch (e) { done(false); }
    }
  }
  function codeBlock(target, source) {
    source = String(source).replace(/\n+$/, '');
    var wrap = el('div', { class: 'code-block' });
    var btn = el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Copy code to clipboard', text: 'Copy code' });
    btn.addEventListener('click', function () { copyText(source, btn); });
    wrap.appendChild(el('div', { class: 'code-bar' }, [btn]));
    var code = el('code');
    var pre = el('pre', { class: 'code' }, [code]);
    var lines = source.split('\n').map(function (ln, i) {
      var row = el('span', { class: 'cl', 'data-line': i + 1 }, [el('span', { class: 'ln', text: String(i + 1) })]);
      var lc = el('span', { class: 'lc' });
      lc.innerHTML = highlightLine(ln);
      row.appendChild(lc);
      code.appendChild(row);
      return row;
    });
    wrap.appendChild(pre);
    if (target) {
      if (target.tagName === 'PRE' && target.parentNode) target.parentNode.replaceChild(wrap, target);
      else target.appendChild(wrap);
    }
    var cur = null;
    return {
      el: wrap, lines: lines,
      setLine: function (n) {
        if (cur) cur.classList.remove('cur');
        cur = (n && lines[n - 1]) ? lines[n - 1] : null;
        if (cur) cur.classList.add('cur');
      }
    };
  }
  function initStaticCode() {
    qa(DOC, 'pre.py').forEach(function (pre) {
      if (pre.closest('.ex[data-type="lines"]')) return;
      codeBlock(pre, pre.textContent);
    });
  }
  function wrapTables() {
    qa(DOC, 'table.tbl').forEach(function (t) {
      if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('tbl-wrap')) return;
      var w = el('div', { class: 'tbl-wrap' });
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  /* ------------------------------------------------------------------ exercises */
  function stripMark(fb) {
    var n = fb;
    while (n && n.nodeType !== 3) n = n.firstChild;
    if (n && n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/^\s*[✓✗✔✘]\s*/, '');
  }
  function showFb(fb, ok) {
    fb.classList.remove('ok', 'bad');
    fb.classList.add('show', ok ? 'ok' : 'bad');
  }
  function hideFb(fb) { fb.classList.remove('show', 'ok', 'bad'); }
  function whenList(fb) {
    return (fb.getAttribute('data-when') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function remedyText(href) {
    var m = /(?:lesson-(\d+)\.html)?(?:#(.*))?$/.exec(href);
    var lesson = m && m[1] ? 'Lesson ' + parseInt(m[1], 10) : '';
    var sec = '';
    if (m && m[2]) {
      var sm = /^s(\d+)$/.exec(m[2]);
      sec = sm ? 'section ' + sm[1] : '#' + m[2];
    }
    if (!lesson && !sec) return href;
    if (!lesson) return sec.charAt(0).toUpperCase() + sec.slice(1);
    return lesson + (sec ? ', ' + sec : '');
  }
  function fireAttempt(ex) {
    var ev;
    try { ev = new root.CustomEvent('course:attempt', { bubbles: true }); } catch (e) { ev = DOC.createEvent('Event'); ev.initEvent('course:attempt', true, false); }
    ex.dispatchEvent(ev);
  }

  function initExercise(ex) {
    var type = ex.getAttribute('data-type') || 'mcq';
    var id = ex.id || ('ex-' + hashStr(ex.textContent).toString(36));
    var api = {
      ex: ex, id: id, solved: false,
      attempt: function (ok) {
        ex.setAttribute('data-attempted', '1');
        progAdd('attempted', id);
        if (ok) { progAdd('correct', id); api.solve(); }
        else api.wrong();
        fireAttempt(ex);
      },
      solve: function () {
        api.solved = true; ex.classList.add('locked'); ex.setAttribute('data-solved', '1');
        if (api.solLink && api.solution) { api.solLink.textContent = 'Show worked solution'; api.solLink.hidden = false; }
      },
      wrong: function () {
        if (api.remedy) api.remedy.classList.add('show');
      },
      live: null,
      setLive: function (html, ok) {
        if (!api.live) { api.live = el('div', { class: 'fb' }); api.liveHost.appendChild(api.live); }
        api.live.innerHTML = html;
        showFb(api.live, ok);
        mathIn(api.live);
      },
      clearLive: function () { if (api.live) hideFb(api.live); }
    };
    qa(ex, '.fb').forEach(stripMark);
    api.liveHost = el('div', { class: 'ex-live' });
    var builder = BUILD[type];
    if (!builder) return;
    builder(ex, api);

    /* tools: hints, solution link, remedy */
    var hints = qa(ex, '.ex-hints .hint');
    var hintsBox = ex.querySelector('.ex-hints');
    api.solution = ex.querySelector('.ex-solution');
    var tools = el('div', { class: 'ex-tools' });
    var shown = 0;
    if (hints.length) {
      hints.forEach(function (h, i) { h.setAttribute('data-n', i + 1); });
      var hb = el('button', { type: 'button', class: 'btn sm' });
      var upd = function () {
        hb.textContent = 'Hint ' + Math.min(shown + 1, hints.length) + ' of ' + hints.length;
        if (shown >= hints.length) hb.disabled = true;
      };
      hb.addEventListener('click', function () {
        if (shown < hints.length) { hints[shown].classList.add('show'); shown++; upd(); }
      });
      upd();
      tools.appendChild(hb);
    }
    if (api.solution) {
      api.solLink = el('button', { type: 'button', class: 'linkbtn', text: 'Skip, just show me' });
      api.solLink.addEventListener('click', function () {
        api.solution.classList.add('show'); api.solLink.hidden = true;
      });
      tools.appendChild(api.solLink);
      if (api.solved) api.solLink.textContent = 'Show worked solution';
    }
    ex.appendChild(api.liveHost);
    if (tools.childNodes.length) ex.appendChild(tools);
    if (hintsBox) ex.appendChild(hintsBox);
    if (api.solution) ex.appendChild(api.solution);
    var href = ex.getAttribute('data-remedy');
    if (href) {
      api.remedy = el('div', { class: 'ex-remedy' });
      api.remedy.appendChild(DOC.createTextNode('Revisit: '));
      api.remedy.appendChild(el('a', { href: href, text: ex.getAttribute('data-remedy-label') || remedyText(href) }));
      ex.appendChild(api.remedy);
    }
    ex.courseApi = api;
  }

  function parseNum(s) {
    s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-');
    if (!s) return NaN;
    var m = /^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/.exec(s);
    if (m) { var d = parseFloat(m[2]); return d === 0 ? NaN : parseFloat(m[1]) / d; }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
    return Number(s);
  }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol || 0) + 1e-9 * Math.max(1, Math.abs(b)); }

  var BUILD = {};

  /* mcq and multi share markup */
  function buildChoice(ex, api, multi) {
    var lis = qa(ex, '.ex-options > li');
    lis.forEach(function (li, i) {
      var opt = li.querySelector('.opt');
      if (!opt) return;
      var body = el('span', { class: 'opt-body' });
      while (opt.firstChild) body.appendChild(opt.firstChild);
      opt.appendChild(body);
      opt.insertBefore(el('span', { class: 'letter', text: '(' + String.fromCharCode(97 + i) + ')' }), body);
      opt.setAttribute('role', multi ? 'checkbox' : 'button');
      opt.setAttribute('tabindex', '0');
      if (multi) opt.setAttribute('aria-checked', 'false');
      var act = function () {
        if (api.solved) return;
        if (multi) {
          if (checked) resetChecked();
          var on = !li.classList.contains('sel');
          li.classList.toggle('sel', on);
          opt.setAttribute('aria-checked', on ? 'true' : 'false');
          return;
        }
        if (li.classList.contains('wrong')) return;
        var fb = li.querySelector('.fb');
        var ok = li.hasAttribute('data-correct');
        li.classList.add(ok ? 'right' : 'wrong');
        if (fb) showFb(fb, ok);
        api.attempt(ok);
      };
      opt.addEventListener('click', act);
      opt.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); }
      });
    });
    if (!multi) return;
    var checked = false;
    function resetChecked() {
      checked = false;
      lis.forEach(function (li) {
        var fb = li.querySelector('.fb');
        if (fb) hideFb(fb);
        li.classList.remove('right', 'wrong', 'missed', 'sel');
        if (li.getAttribute('data-chosen') === '1') li.classList.add('sel');
      });
    }
    var btn = el('button', { type: 'button', class: 'btn primary', text: 'Check' });
    btn.addEventListener('click', function () {
      if (api.solved) return;
      var allRight = true;
      checked = true;
      lis.forEach(function (li) {
        var chosen = li.classList.contains('sel');
        var corr = li.hasAttribute('data-correct');
        li.setAttribute('data-chosen', chosen ? '1' : '0');
        li.classList.remove('sel', 'right', 'wrong', 'missed');
        var right = chosen === corr;
        if (!right) allRight = false;
        if (chosen && corr) li.classList.add('right');
        else if (chosen && !corr) li.classList.add('wrong');
        else if (!chosen && corr) li.classList.add('missed');
        var fb = li.querySelector('.fb');
        if (fb) showFb(fb, right);
      });
      api.attempt(allRight);
    });
    ex.appendChild(el('div', { class: 'ex-actions' }, [btn]));
  }
  BUILD.mcq = function (ex, api) { buildChoice(ex, api, false); };
  BUILD.multi = function (ex, api) { buildChoice(ex, api, true); };

  BUILD.numeric = function (ex, api) {
    var expected = parseNum(ex.getAttribute('data-answer'));
    var tol = parseFloat(ex.getAttribute('data-tol')) || 0;
    var fbs = qa(ex, '.fb[data-when]');
    var input = el('input', { type: 'text', class: 'txt', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Your answer', placeholder: 'Your answer' });
    var btn = el('button', { type: 'button', class: 'btn primary', text: 'Check' });
    ex.appendChild(el('div', { class: 'rowline' }, [input, btn]));
    var box = el('div', { class: 'ex-fbbox' });
    fbs.forEach(function (f) { box.appendChild(f); });
    ex.appendChild(box);
    var msg = el('p', { class: 'fb-note' });
    box.appendChild(msg);
    function check() {
      if (api.solved) return;
      fbs.forEach(hideFb);
      msg.textContent = '';
      var v = parseNum(input.value);
      if (isNaN(v)) { msg.textContent = 'Enter a number, or a fraction written a/b.'; return; }
      var ok = near(v, expected, tol);
      var pick = null, i;
      if (ok) {
        pick = fbs.filter(function (f) { return whenList(f).indexOf('correct') >= 0; })[0];
      } else {
        for (i = 0; i < fbs.length && !pick; i++) {
          var w = whenList(fbs[i]);
          for (var j = 0; j < w.length; j++) {
            if (w[j] !== 'correct' && w[j] !== 'other' && !isNaN(parseNum(w[j])) && near(v, parseNum(w[j]), 0)) { pick = fbs[i]; break; }
          }
        }
        if (!pick) pick = fbs.filter(function (f) { return whenList(f).indexOf('other') >= 0; })[0];
      }
      if (pick) showFb(pick, ok);
      else api.setLive(ok ? 'Correct.' : 'Not quite. Recheck the count, then try again.', ok);
      if (ok) input.disabled = true;
      api.attempt(ok);
    }
    btn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  };

  BUILD.match = function (ex, api) {
    var cats = (ex.getAttribute('data-categories') || '').split('|').map(function (s) {
      var i = s.indexOf(':');
      return i < 0 ? { id: s.trim(), label: s.trim() } : { id: s.slice(0, i).trim(), label: s.slice(i + 1).trim() };
    }).filter(function (c) { return c.id; });
    var items = qa(ex, '.ex-items > li');
    items.forEach(function (li) {
      var group = el('div', { class: 'tgl', role: 'group', 'aria-label': 'Choose a category' });
      cats.forEach(function (c) {
        var b = el('button', { type: 'button', class: 'btn', 'aria-pressed': 'false', 'data-cat': c.id, text: c.label });
        b.addEventListener('click', function () {
          if (api.solved) return;
          qa(group, '.btn').forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-pressed', 'false'); });
          b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
          qa(li, '.fb').forEach(hideFb);
          li.setAttribute('data-chosen', c.id);
        });
        group.appendChild(b);
      });
      li.insertBefore(group, li.querySelector('.fb'));
    });
    var msg = el('p', { class: 'fb-note' });
    var btn = el('button', { type: 'button', class: 'btn primary', text: 'Check' });
    btn.addEventListener('click', function () {
      if (api.solved) return;
      msg.textContent = '';
      var missing = items.filter(function (li) { return !li.getAttribute('data-chosen'); });
      if (missing.length) { msg.textContent = 'Choose a category for every item first (' + missing.length + ' left).'; return; }
      var all = true;
      items.forEach(function (li) {
        var chosen = li.getAttribute('data-chosen'), ans = li.getAttribute('data-answer');
        var ok = chosen === ans;
        if (!ok) all = false;
        var fbs = qa(li, '.fb');
        fbs.forEach(hideFb);
        var want = ok ? 'correct' : chosen;
        var pick = fbs.filter(function (f) { return whenList(f).indexOf(want) >= 0; })[0] ||
          (ok ? null : fbs.filter(function (f) { return whenList(f).indexOf('other') >= 0; })[0]);
        if (pick) showFb(pick, ok);
        else {
          var g = li.querySelector('.fb.generic') || el('div', { class: 'fb generic' });
          g.textContent = ok ? 'Correct.' : 'Not this category. Reread the definitions and try again.';
          if (!g.parentNode) li.appendChild(g);
          showFb(g, ok);
        }
      });
      api.attempt(all);
    });
    ex.appendChild(el('div', { class: 'ex-actions' }, [btn]));
    ex.appendChild(msg);
  };

  BUILD.order = function (ex, api) {
    var ol = ex.querySelector('.ex-steps');
    if (!ol) return;
    var steps = qa(ol, ':scope > li');
    steps.forEach(function (li, i) {
      li.setAttribute('data-id', String.fromCharCode(65 + i));
      var text = el('div', { class: 'stp-text' });
      while (li.firstChild) text.appendChild(li.firstChild);
      li.appendChild(el('span', { class: 'stp-id', text: String.fromCharCode(65 + i) }));
      li.appendChild(text);
      var up = el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Move step ' + String.fromCharCode(65 + i) + ' up', text: '↑' });
      var down = el('button', { type: 'button', class: 'btn sm', 'aria-label': 'Move step ' + String.fromCharCode(65 + i) + ' down', text: '↓' });
      var ex_ = el('button', { type: 'button', class: 'btn sm', 'aria-pressed': 'false', 'aria-label': 'Exclude step ' + String.fromCharCode(65 + i) + ' as false', text: 'Exclude' });
      up.addEventListener('click', function () {
        if (api.solved) return;
        var p = li.previousElementSibling;
        if (p) { ol.insertBefore(li, p); clearMarks(); sync(); }
      });
      down.addEventListener('click', function () {
        if (api.solved) return;
        var n = li.nextElementSibling;
        if (n) { ol.insertBefore(n, li); clearMarks(); sync(); }
      });
      ex_.addEventListener('click', function () {
        if (api.solved) return;
        var on = !li.classList.contains('excl');
        li.classList.toggle('excl', on);
        ex_.setAttribute('aria-pressed', on ? 'true' : 'false');
        ex_.classList.toggle('on', on);
        clearMarks();
      });
      li.appendChild(el('div', { class: 'stp-ctl' }, [up, down, ex_]));
    });
    function sync() {
      qa(ol, ':scope > li').forEach(function (li, i, all) {
        qa(li, '.stp-ctl .btn')[0].disabled = i === 0;
        qa(li, '.stp-ctl .btn')[1].disabled = i === all.length - 1;
      });
    }
    function clearMarks() {
      qa(ol, ':scope > li').forEach(function (li) { li.classList.remove('flag', 'good'); });
      api.clearLive();
    }
    function evaluate() {
      var cur = qa(ol, ':scope > li');
      function pos(li) { return parseInt(li.getAttribute('data-pos'), 10) || 0; }
      function nm(li) { return 'Step ' + li.getAttribute('data-id'); }
      var falseKept = cur.filter(function (li) { return pos(li) === 0 && !li.classList.contains('excl'); })[0];
      if (falseKept) {
        return { ok: false, flag: falseKept, html: esc(nm(falseKept)) + ' does not belong in the argument. ' + (falseKept.getAttribute('data-why') || 'It sounds plausible, but it is not valid here. Exclude it.') };
      }
      var trueExcl = cur.filter(function (li) { return pos(li) > 0 && li.classList.contains('excl'); })[0];
      if (trueExcl) {
        return { ok: false, flag: trueExcl, html: esc(nm(trueExcl)) + ' is a true step of the argument, so it should not be excluded. Only steps that are false or irrelevant are excluded.' };
      }
      var kept = cur.filter(function (li) { return pos(li) > 0; });
      var want = kept.slice().sort(function (a, b) { return pos(a) - pos(b); });
      for (var i = 0; i < kept.length; i++) {
        if (kept[i] !== want[i]) {
          return { ok: false, flag: kept[i], html: 'Position ' + (i + 1) + ' is wrong: ' + esc(nm(kept[i])) + ' is out of order. Ask what that step needs to have been established before it.' };
        }
      }
      return { ok: true, html: okHtml };
    }
    var okFb = qa(ex, '.fb[data-when="correct"]')[0];
    var okHtml = okFb ? okFb.innerHTML : 'The order is correct and the false steps are excluded.';
    var r = rng(hashStr(api.id));
    for (var t = 0; t < 12; t++) {
      var sh = shuffle(steps, r);
      sh.forEach(function (li) { ol.appendChild(li); });
      if (!evaluate().ok) break;
    }
    sync();
    qa(ex, '.fb[data-when]').forEach(function (f) { f.parentNode.removeChild(f); });
    var btn = el('button', { type: 'button', class: 'btn primary', text: 'Check' });
    btn.addEventListener('click', function () {
      if (api.solved) return;
      clearMarks();
      var res = evaluate();
      if (res.flag) res.flag.classList.add('flag');
      if (res.ok) {
        qa(ol, ':scope > li').forEach(function (li) { if (!li.classList.contains('excl')) li.classList.add('good'); });
        qa(ol, '.btn').forEach(function (b) { b.disabled = true; });
      }
      api.setLive(res.html, res.ok);
      api.attempt(res.ok);
    });
    ex.appendChild(el('div', { class: 'ex-actions' }, [btn]));
  };

  BUILD.lines = function (ex, api) {
    var pre = ex.querySelector('pre.py');
    if (!pre) return;
    var cb = codeBlock(pre, pre.textContent);
    var answers = (ex.getAttribute('data-answer') || '').split(',').map(function (s) { return parseInt(s, 10); }).filter(function (n) { return !isNaN(n); });
    var fbs = qa(ex, '.fb[data-when]');
    var host = el('div', { class: 'ex-fbbox' });
    fbs.forEach(function (f) { host.appendChild(f); });
    ex.appendChild(host);
    cb.lines.forEach(function (row, i) {
      var n = i + 1;
      row.setAttribute('tabindex', '0');
      row.setAttribute('role', 'button');
      row.setAttribute('aria-label', 'Line ' + n);
      var act = function () {
        if (api.solved) return;
        cb.lines.forEach(function (r2) { r2.classList.remove('sel-bad'); });
        fbs.forEach(hideFb);
        var ok = answers.indexOf(n) >= 0;
        row.classList.add(ok ? 'sel-ok' : 'sel-bad');
        var pick = ok ? fbs.filter(function (f) { return whenList(f).indexOf('correct') >= 0; })[0] : null;
        if (!pick) pick = fbs.filter(function (f) { return whenList(f).indexOf(String(n)) >= 0; })[0];
        if (!pick && !ok) pick = fbs.filter(function (f) { return whenList(f).indexOf('other') >= 0; })[0];
        if (pick) showFb(pick, ok);
        else api.setLive(ok ? 'Yes, line ' + n + ' is the faulty line.' : 'Line ' + n + ' is not the faulty line. Trace a small input through it.', ok);
        api.attempt(ok);
      };
      row.addEventListener('click', act);
      row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
    ex.appendChild(el('p', { class: 'fb-note', text: 'Click the faulty line.' }));
  };

  function resolvePath(path) {
    var o = root, parts = String(path || '').split('.');
    for (var i = 0; i < parts.length; i++) { if (o === null || o === undefined) return null; o = o[parts[i]]; }
    return typeof o === 'function' ? o : null;
  }
  BUILD.custom = function (ex, api) {
    var input = el('input', { type: 'text', class: 'txt', autocomplete: 'off', 'aria-label': 'Your input', placeholder: ex.getAttribute('data-placeholder') || '' });
    var btn = el('button', { type: 'button', class: 'btn primary', text: 'Run' });
    ex.appendChild(el('div', { class: 'rowline' }, [input, btn]));
    function run() {
      if (api.solved) return;
      var fn = resolvePath(ex.getAttribute('data-check'));
      if (!fn) { api.setLive('This exercise’s checker (' + esc(ex.getAttribute('data-check') || '?') + ') is not available on this page.', false); return; }
      var res;
      try { res = fn(input.value); } catch (e) { res = { ok: false, html: 'The checker could not process that input.' }; }
      res = res || { ok: false, html: '' };
      api.setLive(res.html || (res.ok ? 'Correct.' : 'Not yet.'), !!res.ok);
      api.attempt(!!res.ok);
    }
    btn.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  };

  /* ------------------------------------------------------------------ predict, gates, gaps */
  function initPredicts() {
    qa(DOC, '.predict').forEach(function (p) {
      var reveal = p.querySelector('.reveal');
      if (!reveal) return;
      var skip = el('button', { type: 'button', class: 'linkbtn', text: 'Skip, just show me' });
      var wrap = el('p', { class: 'predict-skip' }, [skip]);
      p.insertBefore(wrap, reveal);
      function open() {
        reveal.classList.add('open');
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      }
      skip.addEventListener('click', open);
      p.addEventListener('course:attempt', open);
    });
  }

  function cpLabel(cp, id) {
    var l = cp && cp.querySelector('.label');
    return l ? l.textContent.trim() : id;
  }
  function refreshGaps() {
    var skipped = getProgress().skipped;
    qa(DOC, '.gaps').forEach(function (g) {
      g.innerHTML = '';
      if (!skipped.length) { g.appendChild(el('p', { text: 'No open gaps.' })); return; }
      var ul = el('ul');
      skipped.forEach(function (id) {
        var cp = DOC.getElementById(id);
        ul.appendChild(el('li', null, [el('a', { href: '#' + id, text: cpLabel(cp, id) }), ': skipped. Revisit it and attempt its questions.']));
      });
      g.appendChild(ul);
    });
  }
  function initGates() {
    var gates = [];
    qa(DOC, '[data-gate]').forEach(function (sec) {
      var cpId = sec.getAttribute('data-gate');
      var cp = DOC.getElementById(cpId);
      var g = { sec: sec, cp: cp, id: cpId, bar: null, open: false };
      var done = function () {
        if (!cp) return true;
        var exs = qa(cp, '.ex');
        return exs.every(function (e) { return e.getAttribute('data-attempted') === '1'; });
      };
      g.done = done;
      g.openIt = function (skipped) {
        if (g.open) return;
        g.open = true;
        sec.classList.remove('gated');
        if (g.bar && g.bar.parentNode) g.bar.parentNode.removeChild(g.bar);
        if (skipped) progAdd('skipped', cpId);
        else progDel('skipped', cpId);
        refreshGaps();
      };
      var prog = getProgress();
      var allSeen = cp ? qa(cp, '.ex').length > 0 && qa(cp, '.ex').every(function (e) { return prog.attempted.indexOf(e.id) >= 0; }) : true;
      sec.classList.add('gated');
      var btn = el('button', { type: 'button', class: 'linkbtn', text: 'Continue anyway' });
      g.bar = el('div', { class: 'gate-bar', 'data-for': cpId }, [
        el('p', { text: 'Attempt ' + cpLabel(cp, cpId).toLowerCase() + ' above to continue.' }), btn
      ]);
      sec.parentNode.insertBefore(g.bar, sec);
      btn.addEventListener('click', function () { g.openIt(!g.done()); });
      gates.push(g);
      if (!cp || allSeen || prog.skipped.indexOf(cpId) >= 0) {
        g.open = false; sec.classList.add('gated');
        g.openIt(prog.skipped.indexOf(cpId) >= 0);
      }
    });
    DOC.addEventListener('course:attempt', function () {
      gates.forEach(function (g) { if (!g.open && g.done()) g.openIt(false); else if (g.open && g.done()) { progDel('skipped', g.id); refreshGaps(); } });
    });
  }

  /* ------------------------------------------------------------------ Stepper */
  function fmtVar(v) {
    if (v === null || v === undefined) return '—';
    if (Array.isArray(v)) return '[' + v.map(fmtVar).join(', ') + ']';
    return String(v);
  }
  function Stepper(container, opts) {
    var self = this;
    opts = opts || {};
    this.opts = opts; this.el = container;
    this.steps = []; this.index = 0; this.speed = 1; this.playing = false; this.timer = null; this.input = null;
    var presetClicks = 0, prevArr = null, nCols = 0, codeApi = null;

    container.innerHTML = '';
    container.classList.add('stepper');
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', opts.label || 'Algorithm stepper. Space plays or pauses, left and right arrows step, Home resets.');

    /* setup row */
    var setup = el('div', { class: 'st-setup' });
    var presetBtns = [];
    if (opts.presets && opts.presets.length) {
      var pg = el('div', { class: 'tgl', role: 'group', 'aria-label': 'Presets' });
      opts.presets.forEach(function (p, i) {
        var b = el('button', { type: 'button', class: 'btn', 'aria-pressed': 'false', text: p.label });
        b.addEventListener('click', function () { self.preset(i); });
        presetBtns.push(b); pg.appendChild(b);
      });
      setup.appendChild(pg);
    }
    var inp = el('input', { type: 'text', class: 'txt', autocomplete: 'off', 'aria-label': 'Custom input: numbers separated by commas or spaces', placeholder: opts.placeholder || 'Your own numbers, e.g. 3 1 2' });
    var loadBtn = el('button', { type: 'button', class: 'btn primary', text: 'Load' });
    setup.appendChild(el('div', { class: 'rowline' }, [inp, loadBtn]));
    container.appendChild(setup);
    var errEl = el('p', { class: 'st-error', role: 'alert' });
    container.appendChild(errEl);

    /* array area */
    var arrWrap = el('div', { class: 'st-arr', role: 'img' });
    var gridHost = el('div');
    var extraArrays = el('div');
    arrWrap.appendChild(gridHost); arrWrap.appendChild(extraArrays);
    container.appendChild(arrWrap);
    if (opts.legend && opts.legend.length) {
      var lg = el('div', { class: 'legend' });
      opts.legend.forEach(function (l) {
        lg.appendChild(el('span', { class: 'item' }, [el('span', { class: 'sw c-' + l.kind }), el('span', { text: l.label })]));
      });
      container.appendChild(lg);
    }
    var msgEl = el('div', { class: 'st-msg', role: 'status', 'aria-live': 'polite' });
    container.appendChild(msgEl);

    /* controls */
    var bReset = el('button', { type: 'button', class: 'btn', 'aria-label': 'Reset to the first step', text: 'Reset' });
    var bBack = el('button', { type: 'button', class: 'btn', 'aria-label': 'Step back', text: '◀ Back' });
    var bPlay = el('button', { type: 'button', class: 'btn primary', 'aria-label': 'Play', text: '▶ Play' });
    var bFwd = el('button', { type: 'button', class: 'btn', 'aria-label': 'Step forward', text: 'Forward ▶' });
    var grp = el('div', { class: 'grp' }, [bReset, bBack, bPlay, bFwd]);
    var speedGrp = el('div', { class: 'tgl', role: 'group', 'aria-label': 'Speed' });
    var speedBtns = [0.5, 1, 2, 4].map(function (s) {
      var b = el('button', { type: 'button', class: 'btn' + (s === 1 ? ' on' : ''), 'aria-pressed': s === 1 ? 'true' : 'false', 'aria-label': 'Speed ' + s + ' times', text: s + '×' });
      b.addEventListener('click', function () {
        self.speed = s;
        speedBtns.forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      });
      speedGrp.appendChild(b);
      return b;
    });
    var posEl = el('span', { class: 'st-pos' });
    container.appendChild(el('div', { class: 'st-controls' }, [grp, speedGrp, posEl]));

    /* panels */
    var counterEls = {};
    var cWrap = el('div', { class: 'st-counters' });
    (opts.counters || []).forEach(function (c) {
      var v = el('span', { class: 'v', text: '0' });
      counterEls[c.key] = v;
      cWrap.appendChild(el('div', { class: 'st-counter' }, [v, el('span', { class: 'k', text: c.label })]));
    });
    var varsEl = el('div', { class: 'st-vars', 'aria-label': 'Variables' });
    var panels = el('div', { class: 'st-panels' });
    if (opts.counters && opts.counters.length) panels.appendChild(cWrap);
    if (opts.vars && opts.vars.length) panels.appendChild(varsEl);
    if (panels.childNodes.length) container.appendChild(panels);
    var extraEl = el('div', { class: 'st-extra' });
    container.appendChild(extraEl);
    var codeHost = el('div');
    container.appendChild(codeHost);
    if (opts.code) codeApi = codeBlock(codeHost, opts.code);

    /* events */
    bReset.addEventListener('click', function () { self.pause(); self.goto(0); });
    bBack.addEventListener('click', function () { self.pause(); self.prev(); });
    bFwd.addEventListener('click', function () { self.pause(); self.next(); });
    bPlay.addEventListener('click', function () { if (self.playing) self.pause(); else self.play(); });
    function doLoad() {
      var res = parseArray(inp.value, { maxN: opts.maxN, min: opts.min, max: opts.max, integers: opts.integers !== false, allowDuplicates: opts.allowDuplicates !== false, duplicateReason: opts.duplicateReason, capReason: opts.capReason, allowEmpty: true });
      if (!res.ok) { errEl.textContent = res.error; return; }
      presetBtns.forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
      self.load(res.values);
    }
    loadBtn.addEventListener('click', doLoad);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doLoad(); } });
    container.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === ' ' || e.key === 'Spacebar') {
        if (t && t.tagName === 'BUTTON') return;
        e.preventDefault(); if (self.playing) self.pause(); else self.play();
      } else if (e.key === 'ArrowRight') { e.preventDefault(); self.pause(); self.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.pause(); self.prev(); }
      else if (e.key === 'Home') { e.preventDefault(); self.pause(); self.goto(0); }
    });

    /* rendering */
    function buildGrid(values, marks, regions, withIdx, dense, moved) {
      var n = values.length;
      var g = el('div', { class: 'st-grid' + (dense ? ' dense' : '') });
      g.style.gridTemplateColumns = 'repeat(' + Math.max(n, 1) + ', minmax(0, var(--cell)))';
      values.forEach(function (v, i) {
        var kind = marks && marks[i];
        var c = el('div', { class: 'cell' + (kind ? ' c-' + kind : '') + (moved && moved[i] ? ' moved' : ''), text: fmtVar(v) });
        c.style.gridColumn = String(i + 1); c.style.gridRow = '1';
        g.appendChild(c);
        if (withIdx) {
          var ix = el('div', { class: 'st-idx', text: String(i) });
          ix.style.gridColumn = String(i + 1); ix.style.gridRow = '2';
          g.appendChild(ix);
        }
      });
      if (regions && regions.length) {
        var lanes = [];
        regions.forEach(function (r) {
          var from = Math.max(0, r.from | 0), to = Math.min(n, r.to | 0);
          if (to <= from) return;
          var label = r.label || '';
          var effTo = Math.max(to, from + Math.ceil(label.length * 7 / 36));
          var lane = 0;
          while (lanes[lane] && lanes[lane].some(function (o) { return !(effTo <= o[0] || from >= o[1]); })) lane++;
          (lanes[lane] = lanes[lane] || []).push([from, effTo]);
          var br = el('div', { class: 'st-region k-' + (r.kind || 'plain') });
          br.style.gridColumn = (from + 1) + ' / ' + (to + 1); br.style.gridRow = String(3 + lane * 2);
          g.appendChild(br);
          if (label) {
            var lb = el('div', { class: 'st-region-label k-' + (r.kind || 'plain'), text: label });
            lb.style.gridColumn = (from + 1) + ' / ' + (Math.max(to, effTo) + 1); lb.style.gridRow = String(4 + lane * 2);
            g.appendChild(lb);
          }
        });
      }
      return g;
    }
    this._render = function () {
      var st = self.steps[self.index];
      if (!st) {
        gridHost.innerHTML = ''; extraArrays.innerHTML = ''; msgEl.textContent = 'There are no steps for this input.';
        posEl.textContent = 'Step 0 / 0';
        [bReset, bBack, bPlay, bFwd].forEach(function (b) { b.disabled = true; });
        if (codeApi) codeApi.setLine(null);
        return;
      }
      var arr = st.arr || [];
      var moved = null;
      if (prevArr && prevArr.length === arr.length && !prefersReduced()) {
        moved = arr.map(function (v, i) { return prevArr[i] !== v; });
      }
      prevArr = arr.slice();
      gridHost.innerHTML = '';
      gridHost.appendChild(buildGrid(arr, st.marks, st.regions, true, (self._nCols || 0) > 10, moved));
      arrWrap.setAttribute('aria-label', arr.length ? 'Array: ' + arr.join(', ') : 'Empty array');
      extraArrays.innerHTML = '';
      (st.arrays || []).forEach(function (a) {
        if (a.label) extraArrays.appendChild(el('p', { class: 'label st-rowlabel', text: a.label }));
        extraArrays.appendChild(buildGrid(a.values || [], a.marks, null, false, (self._nCols || 0) > 10, null));
      });
      msgEl.innerHTML = st.msg || '';
      mathIn(msgEl);
      (opts.counters || []).forEach(function (c) {
        var v = st.counters && st.counters[c.key];
        counterEls[c.key].textContent = fmt(v === undefined ? 0 : v);
      });
      if (opts.vars && opts.vars.length) {
        varsEl.innerHTML = '';
        var vv = st.vars || {};
        var names = opts.vars.slice();
        Object.keys(vv).forEach(function (k) { if (names.indexOf(k) < 0) names.push(k); });
        names.forEach(function (k) {
          varsEl.appendChild(el('div', { class: 'row' }, [el('span', { class: 'nm', text: k + ' ='}), el('span', { class: 'vv', text: fmtVar(vv[k]) })]));
        });
      }
      extraEl.innerHTML = '';
      if (typeof opts.renderExtra === 'function') {
        try { opts.renderExtra(st, extraEl); } catch (e) { /* author hook failed; ignore */ }
      }
      if (codeApi) codeApi.setLine(st.line);
      posEl.textContent = 'Step ' + (self.index + 1) + ' / ' + self.steps.length;
      var last = self.steps.length - 1;
      bReset.disabled = self.index === 0;
      bBack.disabled = self.index === 0;
      bFwd.disabled = self.index >= last;
      bPlay.disabled = false;
      if (typeof opts.onStep === 'function') {
        try { opts.onStep(st, self.index, self.steps); } catch (e) { /* ignore author hook error */ }
      }
    };
    this._setPlayLabel = function () {
      bPlay.textContent = self.playing ? '❚❚ Pause' : '▶ Play';
      bPlay.setAttribute('aria-label', self.playing ? 'Pause' : 'Play');
    };

    this.load(opts.input !== undefined ? opts.input : []);
  }
  Stepper.prototype.load = function (array) {
    var self = this, o = this.opts, steps;
    this.pause();
    var errEl = this.el.querySelector('.st-error');
    try {
      steps = o.trace(Array.isArray(array) ? array.slice() : array);
    } catch (e) {
      errEl.textContent = 'The trace could not be built for that input.';
      return false;
    }
    if (!Array.isArray(steps)) { errEl.textContent = 'The trace could not be built for that input.'; return false; }
    if (steps.length > MAX_STEPS) {
      errEl.textContent = 'That input produces ' + fmt(steps.length) + ' steps. The limit is ' + fmt(MAX_STEPS) + ', so the animation stays readable. Use a shorter or simpler input.';
      return false;
    }
    errEl.textContent = '';
    this.input = Array.isArray(array) ? array.slice() : array;
    this.steps = steps;
    this.index = 0;
    var nCols = 0;
    steps.forEach(function (s) { if (s.arr && s.arr.length > nCols) nCols = s.arr.length; });
    this._renderN(nCols);
    return true;
  };
  Stepper.prototype._renderN = function (n) {
    /* nCols lives in the constructor closure; render through a small bridge */
    this._nCols = n;
    this._render();
  };
  Stepper.prototype.preset = function (i) {
    var p = this.opts.presets[i];
    if (!p) return;
    var vals;
    if (p.values) vals = p.values.slice();
    else if (typeof p.make === 'function') {
      var n = this.input && this.input.length > 0 ? this.input.length : (this.opts.maxN || 6);
      if (this.opts.maxN) n = Math.min(n, this.opts.maxN);
      this._presetClicks = (this._presetClicks || 0) + 1;
      vals = p.make(rng(hashStr(p.label) + this._presetClicks), n);
    } else return;
    if (this.opts.maxN && vals.length > this.opts.maxN) vals = vals.slice(0, this.opts.maxN);
    var btns = qa(this.el, '.st-setup .tgl .btn');
    if (this.load(vals)) {
      btns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    }
  };
  Stepper.prototype.goto = function (i) {
    if (!this.steps.length) return;
    this.index = Math.max(0, Math.min(this.steps.length - 1, i | 0));
    this._render();
  };
  Stepper.prototype.next = function () { if (this.index < this.steps.length - 1) this.goto(this.index + 1); };
  Stepper.prototype.prev = function () { if (this.index > 0) this.goto(this.index - 1); };
  Stepper.prototype.play = function () {
    var self = this;
    if (!this.steps.length || this.playing) return;
    if (this.index >= this.steps.length - 1) this.goto(0);
    this.playing = true;
    this._setPlayLabel();
    (function tick() {
      self.timer = setTimeout(function () {
        if (!self.playing) return;
        if (self.index < self.steps.length - 1) self.next();
        if (self.index >= self.steps.length - 1) self.pause(); else tick();
      }, 900 / self.speed);
    })();
  };
  Stepper.prototype.pause = function () {
    this.playing = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this._setPlayLabel) this._setPlayLabel();
  };

  /* ------------------------------------------------------------------ PosetView */
  function PosetView(container, opts) {
    var self = this;
    opts = opts || {};
    var labels = (opts.labels || []).map(String);
    var n = labels.length;
    var showCount = opts.showCount !== false;
    var showExt = opts.showExtensions === undefined ? 24 : opts.showExtensions;
    var interactive = !!opts.interactive;
    this.labels = labels; this.n = n; this.opts = opts;
    var obs = [];          // accepted new relations, in order
    var lt = [];           // transitive closure
    var lastNew = null;
    var selected = -1;
    var statusHtml = '', statusBad = false;
    var cache = null;

    container.innerHTML = '';
    container.classList.add('poset');
    var svgHost = el('div');
    var statusEl = el('p', { class: 'pv-status', role: 'status', 'aria-live': 'polite' });
    var countEl = el('p', { class: 'pv-count' });
    var extEl = el('div');
    container.appendChild(svgHost);
    container.appendChild(statusEl);
    if (showCount) { container.appendChild(countEl); container.appendChild(extEl); }
    if (interactive) {
      var undoB = el('button', { type: 'button', class: 'btn', text: 'Undo', 'aria-label': 'Undo the last new relation' });
      var resetB = el('button', { type: 'button', class: 'btn', text: 'Reset', 'aria-label': 'Forget all relations' });
      undoB.addEventListener('click', function () { self.undo(); });
      resetB.addEventListener('click', function () { self.reset(); setStatus('All relations forgotten. Click one element, then another, to say which is smaller.', false); render(); });
      container.appendChild(el('div', { class: 'ex-actions' }, [undoB, resetB]));
    }

    function recompute() {
      lt = [];
      for (var i = 0; i < n; i++) { lt.push([]); for (var j = 0; j < n; j++) lt[i].push(false); }
      obs.forEach(function (r) { lt[r[0]][r[1]] = true; });
      for (var k = 0; k < n; k++) for (var a = 0; a < n; a++) if (lt[a][k]) for (var b = 0; b < n; b++) if (lt[k][b]) lt[a][b] = true;
      cache = null;
    }
    function chain(from, to) {
      var prev = {}, queue = [from], seen = {}; seen[from] = true;
      while (queue.length) {
        var x = queue.shift();
        if (x === to) break;
        for (var q = 0; q < obs.length; q++) {
          if (obs[q][0] === x && !seen[obs[q][1]]) { seen[obs[q][1]] = true; prev[obs[q][1]] = x; queue.push(obs[q][1]); }
        }
      }
      if (!seen[to]) return null;
      var path = [to], c = to;
      while (c !== from) { c = prev[c]; path.unshift(c); }
      return path;
    }
    function names(path) { return path.map(function (x) { return labels[x]; }).join(' ≺ '); }
    function count() {
      if (cache && cache.count !== undefined) return cache.count;
      cache = cache || {};
      if (n > 16) { cache.count = null; return null; }
      var pm = [];
      for (var x = 0; x < n; x++) { var m = 0; for (var y = 0; y < n; y++) if (lt[y][x]) m |= (1 << y); pm.push(m); }
      var f = new Float64Array(1 << n);
      f[0] = 1;
      for (var mask = 0; mask < (1 << n); mask++) {
        if (!f[mask]) continue;
        for (var e = 0; e < n; e++) {
          if (!(mask & (1 << e)) && (pm[e] & mask) === pm[e]) f[mask | (1 << e)] += f[mask];
        }
      }
      cache.count = f[(1 << n) - 1];
      return cache.count;
    }
    function extensions(limit) {
      var out = [], cur = [], used = 0;
      var pm = [];
      for (var x = 0; x < n; x++) { var m = 0; for (var y = 0; y < n; y++) if (lt[y][x]) m |= (1 << y); pm.push(m); }
      (function rec(mask) {
        if (out.length >= limit) return;
        if (cur.length === n) { out.push(cur.slice()); return; }
        for (var e = 0; e < n; e++) {
          if (!(mask & (1 << e)) && (pm[e] & mask) === pm[e]) { cur.push(e); rec(mask | (1 << e)); cur.pop(); if (out.length >= limit) return; }
        }
      })(used);
      return out;
    }
    function log2(v) { return Math.log(v) / Math.LN2; }
    function layout() {
      var level = [], i, j;
      for (i = 0; i < n; i++) level.push(-1);
      function lv(x) {
        if (level[x] >= 0) return level[x];
        var best = 0;
        for (var y = 0; y < n; y++) if (lt[y][x]) best = Math.max(best, lv(y) + 1);
        level[x] = best; return best;
      }
      for (i = 0; i < n; i++) lv(i);
      var covers = [];
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
        if (!lt[i][j]) continue;
        var cov = true;
        for (var c = 0; c < n; c++) if (lt[i][c] && lt[c][j]) { cov = false; break; }
        if (cov) covers.push([i, j]);
      }
      var maxL = 0;
      level.forEach(function (l) { if (l > maxL) maxL = l; });
      var rows = [], posIdx = [];
      for (var L = 0; L <= maxL; L++) rows.push([]);
      for (L = 0; L <= maxL; L++) {
        var members = [];
        for (i = 0; i < n; i++) if (level[i] === L) members.push(i);
        if (L > 0) {
          var bary = {};
          members.forEach(function (x) {
            var s = 0, k = 0;
            covers.forEach(function (cv) { if (cv[1] === x) { s += posIdx[cv[0]]; k++; } });
            bary[x] = k ? s / k : 0;
          });
          members.sort(function (a, b) { return (bary[a] - bary[b]) || (a - b); });
        }
        rows[L] = members;
        var wmax = 0;
        members.forEach(function (x, idx) { posIdx[x] = idx - (members.length - 1) / 2; });
        wmax = members.length;
      }
      return { level: level, covers: covers, rows: rows };
    }
    function setStatus(html, bad) { statusHtml = html; statusBad = !!bad; }

    function render() {
      var focusedIdx = -1;
      var ae = DOC.activeElement;
      if (ae && ae.getAttribute && svgHost.contains(ae) && ae.getAttribute('data-i') !== null) focusedIdx = parseInt(ae.getAttribute('data-i'), 10);
      svgHost.innerHTML = '';
      if (n === 0) { svgHost.appendChild(el('p', { class: 'fb-note', text: 'No elements.' })); }
      else {
        var lay = layout();
        var pitch = 48, rowGap = 64, node = 32, pad = 12;
        var maxW = 1;
        lay.rows.forEach(function (r) { if (r.length > maxW) maxW = r.length; });
        var W = Math.max(maxW * pitch, 96) + pad * 2 - (pitch - node);
        var H = (lay.rows.length - 1) * rowGap + node + pad * 2;
        var pos = {};
        lay.rows.forEach(function (r, L) {
          r.forEach(function (x, idx) {
            pos[x] = { x: W / 2 + (idx - (r.length - 1) / 2) * pitch, y: H - pad - node / 2 - L * rowGap };
          });
        });
        var svg = sv('svg', { class: 'pv-svg', viewBox: '0 0 ' + W + ' ' + H, width: W, role: 'img',
          'aria-label': 'Hasse diagram of ' + n + ' elements with ' + lay.covers.length + ' covering relations' });
        var newSet = lastNew ? [lastNew[0], lastNew[1]] : [];
        lay.covers.forEach(function (cv) {
          var isNew = lastNew && cv[0] === lastNew[0] && cv[1] === lastNew[1];
          var a = pos[cv[0]], b = pos[cv[1]];
          svg.appendChild(sv('line', { class: 'edge' + (isNew ? ' new' : ''), x1: a.x, y1: a.y - node / 2, x2: b.x, y2: b.y + node / 2 }));
        });
        labels.forEach(function (lb, x) {
          var p = pos[x];
          var g = sv('g', { class: 'node' + (newSet.indexOf(x) >= 0 ? ' new' : '') + (selected === x ? ' sel' : '') + (interactive ? ' can' : ''), 'data-i': x,
            transform: 'translate(' + (p.x - node / 2) + ',' + (p.y - node / 2) + ')' });
          if (interactive) {
            g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
            g.setAttribute('aria-label', 'Element ' + lb + (selected === x ? ', selected' : ''));
            g.setAttribute('aria-pressed', selected === x ? 'true' : 'false');
          }
          g.appendChild(sv('rect', { class: 'ring', x: -4, y: -4, width: node + 8, height: node + 8 }));
          g.appendChild(sv('rect', { class: 'box', x: 0, y: 0, width: node, height: node }));
          g.appendChild(sv('text', { x: node / 2, y: node / 2 + 1, text: lb }));
          if (interactive) {
            g.addEventListener('click', function () { self._pick(x); });
            g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self._pick(x); } });
          }
          svg.appendChild(g);
        });
        svgHost.appendChild(svg);
        if (focusedIdx >= 0) { var f = svg.querySelector('[data-i="' + focusedIdx + '"]'); if (f && f.focus) f.focus(); }
      }
      statusEl.innerHTML = statusHtml;
      statusEl.classList.toggle('bad', statusBad);
      if (showCount) {
        var c = count();
        if (c === null) countEl.textContent = 'Too many elements to count orderings exactly.';
        else {
          var bits = log2(c).toFixed(2);
          countEl.innerHTML = '<strong>e(P) = ' + fmt(c) + '</strong> ' + (c === 1 ? 'ordering' : 'orderings') + ' still possible · log₂ e(P) = <strong>' + bits + '</strong> bits still unknown' + (c === 1 && n > 1 ? '. The order is completely determined.' : '');
        }
        extEl.innerHTML = '';
        if (showExt !== false && c !== null) {
          if (c <= showExt) {
            var list = el('div', { class: 'pv-ext', role: 'list', 'aria-label': 'Orderings still possible' });
            extensions(showExt).forEach(function (ord, ei) {
              var isTrue = opts.truth && ord.length === opts.truth.length && ord.every(function (v, k) { return v === opts.truth[k]; });
              var cells = el('div', { class: 'pv-ext-cells' });
              ord.forEach(function (x) { cells.appendChild(el('span', { class: 'cell' + (isTrue ? ' c-key' : ''), text: labels[x] })); });
              list.appendChild(el('div', { class: 'pv-ext-row', role: 'listitem' }, [el('span', { class: 'pv-ext-n', text: String(ei + 1) }), cells, isTrue ? el('span', { class: 'pv-ext-tag', text: 'True' }) : null]));
            });
            extEl.appendChild(list);
          } else {
            extEl.appendChild(el('p', { class: 'pv-ext-note', text: 'The orderings are listed once at most ' + showExt + ' remain.' }));
          }
        }
      }
    }
    this._render = render;
    this._pick = function (x) {
      if (selected < 0) {
        selected = x;
        setStatus('Selected <strong>' + esc(labels[x]) + '</strong>. Now click the element that is <em>larger</em> than ' + esc(labels[x]) + ' (' + esc(labels[x]) + ' ≺ ?).', false);
        render();
      } else {
        var a = selected;
        selected = -1;
        self.add(a, x);
      }
    };
    this.add = function (i, j) {
      var before = count();
      var res = { status: '', before: before, after: before };
      if (i === j) {
        res.status = 'self';
        res.message = 'An element is never smaller than itself. Choose two different elements.';
        setStatus(esc(res.message), true);
      } else if (obs.some(function (r) { return r[0] === i && r[1] === j; })) {
        res.status = 'known';
        res.message = 'Already observed: ' + labels[i] + ' ≺ ' + labels[j] + '. This teaches nothing new.';
        setStatus(esc(res.message), false);
      } else if (lt[i][j]) {
        res.status = 'implied';
        var ch = chain(i, j) || [i, j];
        res.chain = ch;
        res.message = 'Already implied: ' + names(ch) + '. Asking about ' + labels[i] + ' and ' + labels[j] + ' wasted a comparison, because the answer followed by transitivity.';
        setStatus(esc(res.message), false);
      } else if (lt[j][i]) {
        res.status = 'cycle';
        var back = chain(j, i) || [j, i];
        res.cycle = back.concat([j]);
        res.message = 'Rejected: ' + labels[i] + ' ≺ ' + labels[j] + ' would close the cycle ' + names(back.concat([j])) + '. No ordering can satisfy a cycle.';
        setStatus(esc(res.message), true);
      } else {
        obs.push([i, j]);
        recompute();
        lastNew = [i, j];
        res.status = 'new';
        res.after = count();
        var gained = (res.before !== null && res.after) ? log2(res.before / res.after) : null;
        res.message = 'New: ' + labels[i] + ' ≺ ' + labels[j] + '.' + (res.before !== null ? ' e(P) went from ' + fmt(res.before) + ' to ' + fmt(res.after) + ', which is ' + gained.toFixed(2) + ' bits learned.' : '');
        setStatus(esc(res.message), false);
      }
      render();
      if (typeof opts.onAdd === 'function') { try { opts.onAdd(res); } catch (e) { /* ignore */ } }
      return res;
    };
    this.undo = function () {
      selected = -1;
      if (!obs.length) { setStatus('Nothing to undo.', false); render(); return; }
      var r = obs.pop();
      recompute();
      lastNew = obs.length ? obs[obs.length - 1] : null;
      setStatus('Undid ' + esc(labels[r[0]]) + ' ≺ ' + esc(labels[r[1]]) + '.', false);
      render();
    };
    this.reset = function () {
      obs = []; lastNew = null; selected = -1; recompute(); setStatus('', false); render();
    };
    this.set = function (relations) {
      obs = []; lastNew = null; selected = -1; recompute();
      var results = [];
      (relations || []).forEach(function (r) {
        var i = r[0], j = r[1];
        if (i === j || i < 0 || j < 0 || i >= n || j >= n) { results.push('self'); return; }
        if (lt[i][j]) { results.push(obs.some(function (o) { return o[0] === i && o[1] === j; }) ? 'known' : 'implied'); return; }
        if (lt[j][i]) { results.push('cycle'); return; }
        obs.push([i, j]); recompute(); lastNew = [i, j]; results.push('new');
      });
      setStatus('', false);
      render();
      return results;
    };
    this.count = count;
    this.extensions = function (limit) { return extensions(limit === undefined ? Infinity : limit); };
    this.closure = function () { return lt.map(function (row) { return row.slice(); }); };
    this.relations = function () { return obs.map(function (r) { return r.slice(); }); };

    recompute();
    if (opts.relations && opts.relations.length) {
      this.set(opts.relations);
    } else render();
    if (interactive && !statusHtml) { setStatus('Click one element, then another, to say which is smaller.', false); render(); }
  }

  /* ------------------------------------------------------------------ Plot */
  function tagClass(tag) {
    var t = String(tag || '').toLowerCase();
    if (t === 'proof') return 't-proof';
    if (t === 'proof sketch' || t === 'sketch') return 't-sketch';
    if (t === 'empirical') return 't-empirical';
    if (t === 'heuristic') return 't-heuristic';
    if (t === 'intuition') return 't-intuition';
    if (t === 'reference') return 't-reference';
    return 't-heuristic';
  }
  function niceTicks(lo, hi, count) {
    if (hi <= lo) return [lo];
    var raw = (hi - lo) / count;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var r = raw / mag;
    var step = (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag;
    var out = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
    return out;
  }
  function fmtTick(v) {
    var a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6) + 'M';
    if (a >= 1e4) return fmt(v);
    if (a >= 1000) return fmt(v);
    return String(Math.round(v * 1000) / 1000);
  }
  function Plot(container, opts) {
    var self = this;
    opts = opts || {};
    this.opts = opts;
    container.classList.add('plot');
    var series = (opts.series || []).map(function (s) { return s; });
    var logY = !!opts.logY;
    var dropped = 0;

    function draw() {
      container.innerHTML = '';
      var W = Math.max(container.clientWidth || 0, 240);
      var H = Math.round(Math.max(220, Math.min(360, W * 0.55)));
      var M = { l: 46, r: 14, t: 24, b: 38 };
      var iw = W - M.l - M.r, ih = H - M.t - M.b;
      var xs = [], ys = [];
      dropped = 0;
      var clean = series.map(function (s) {
        var data = (s.data || []).filter(function (p) {
          var ok = isFinite(p[0]) && isFinite(p[1]) && (!logY || p[1] > 0);
          if (!ok) dropped++;
          return ok;
        }).sort(function (a, b) { return a[0] - b[0]; });
        data.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); });
        (s.ranges || []).forEach(function (r) { if (isFinite(r[1]) && (!logY || r[1] > 0)) ys.push(r[1]); if (isFinite(r[2])) ys.push(r[2]); });
        return { s: s, data: data };
      });
      var x0 = xs.length ? Math.min.apply(null, xs) : 0, x1 = xs.length ? Math.max.apply(null, xs) : 1;
      if (opts.xMin !== undefined) x0 = opts.xMin;
      if (x1 === x0) { x0 -= 1; x1 += 1; }
      var y0, y1, yTicks;
      if (logY) {
        var pos = ys.filter(function (v) { return v > 0; });
        var lo = pos.length ? Math.min.apply(null, pos) : 1, hi = pos.length ? Math.max.apply(null, pos) : 10;
        y0 = Math.pow(10, Math.floor(Math.log(lo) / Math.LN10 + 1e-9));
        y1 = Math.pow(10, Math.ceil(Math.log(hi) / Math.LN10 - 1e-9));
        if (y1 <= y0) y1 = y0 * 10;
        yTicks = [];
        for (var p = y0; p <= y1 * 1.0001; p *= 10) yTicks.push(p);
        if (yTicks.length > 6) { var stepK = Math.ceil(yTicks.length / 5); yTicks = yTicks.filter(function (_, i) { return i % stepK === 0; }); }
      } else {
        var mx = ys.length ? Math.max.apply(null, ys) : 1;
        var mn = ys.length ? Math.min.apply(null, ys) : 0;
        y0 = Math.min(0, mn);
        if (mx <= y0) mx = y0 + 1;
        yTicks = niceTicks(y0, mx, 4);
        y1 = yTicks[yTicks.length - 1];
        if (y1 < mx) { y1 = yTicks[yTicks.length - 1] + (yTicks[1] - yTicks[0]); yTicks.push(y1); }
      }
      function X(v) { return M.l + (v - x0) / (x1 - x0) * iw; }
      function Y(v) {
        if (logY) return M.t + ih - (Math.log(v) - Math.log(y0)) / (Math.log(y1) - Math.log(y0)) * ih;
        return M.t + ih - (v - y0) / (y1 - y0) * ih;
      }
      var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
        'aria-label': (opts.yLabel || 'y') + ' against ' + (opts.xLabel || 'x') + (logY ? ', logarithmic vertical axis' : '') + '. Series: ' + series.map(function (s) { return s.label; }).join('; ') });
      yTicks.forEach(function (t) {
        svg.appendChild(sv('line', { class: 'tick', x1: M.l - 5, y1: Y(t), x2: M.l, y2: Y(t) }));
        svg.appendChild(sv('text', { x: M.l - 8, y: Y(t) + 4, 'text-anchor': 'end', text: fmtTick(t) }));
      });
      var xTicks = niceTicks(x0, x1, Math.max(2, Math.min(7, Math.floor(iw / 70))));
      xTicks.forEach(function (t) {
        svg.appendChild(sv('line', { class: 'tick', x1: X(t), y1: M.t + ih, x2: X(t), y2: M.t + ih + 5 }));
        svg.appendChild(sv('text', { x: X(t), y: M.t + ih + 18, 'text-anchor': 'middle', text: fmtTick(t) }));
      });
      svg.appendChild(sv('path', { class: 'axis', d: 'M' + M.l + ',' + M.t + ' L' + M.l + ',' + (M.t + ih) + ' L' + (M.l + iw) + ',' + (M.t + ih) }));
      if (opts.yLabel) svg.appendChild(sv('text', { class: 'ylab', x: 0, y: 10, text: opts.yLabel + (logY ? ' (log scale)' : '') }));
      if (opts.xLabel) svg.appendChild(sv('text', { class: 'xlab', x: M.l + iw / 2, y: H - 4, text: opts.xLabel }));
      var lineCount = 0, labelYs = [], legend = [];
      clean.forEach(function (cs) {
        var s = cs.s, d = cs.data, type = s.type || 'line';
        var red = false;
        if (type === 'line') { red = lineCount > 0; lineCount++; }
        if (type === 'line' || type === 'dashed') {
          if (d.length) {
            svg.appendChild(sv('path', { class: type === 'dashed' ? 's-dashed' : 's-line' + (red ? ' red' : ''),
              d: d.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') }));
          }
        } else {
          (s.ranges || []).forEach(function (r) {
            if (logY && !(r[1] > 0)) return;
            var xx = X(r[0]);
            svg.appendChild(sv('line', { class: 's-range', x1: xx, y1: Y(r[1]), x2: xx, y2: Y(r[2]) }));
            svg.appendChild(sv('line', { class: 's-range', x1: xx - 3, y1: Y(r[1]), x2: xx + 3, y2: Y(r[1]) }));
            svg.appendChild(sv('line', { class: 's-range', x1: xx - 3, y1: Y(r[2]), x2: xx + 3, y2: Y(r[2]) }));
          });
          d.forEach(function (p) { svg.appendChild(sv('rect', { class: 's-pt', x: X(p[0]) - 3, y: Y(p[1]) - 3, width: 6, height: 6 })); });
        }
        legend.push({ s: s, type: type, red: red });
        if (d.length && s.label && type !== 'points') {
          var last = d[d.length - 1];
          var w = s.label.length * 6.4;
          var lx = X(last[0]), ly = Y(last[1]) - 7;
          var fits = lx - w > M.l + 4 && ly > M.t - 6;
          if (fits && !labelYs.some(function (o) { return Math.abs(o - ly) < 13; })) {
            labelYs.push(ly);
            svg.appendChild(sv('text', { class: 'dlabel' + (red ? ' red' : ''), x: lx, y: ly, 'text-anchor': 'end', text: s.label }));
          }
        }
      });
      container.appendChild(svg);
      var lg = el('div', { class: 'plot-legend' });
      legend.forEach(function (l) {
        var sw = el('span', { class: 'lg-sw' + (l.type === 'dashed' ? ' dashed' : '') + (l.type === 'points' ? ' pts' : '') + (l.red ? ' red' : '') });
        var item = el('span', { class: 'lg' }, [sw, el('span', { text: l.s.label })]);
        if (l.s.tag) item.appendChild(el('span', { class: 'tag ' + tagClass(l.s.tag), text: l.s.tag }));
        lg.appendChild(item);
      });
      container.appendChild(lg);
      if (dropped && logY) container.appendChild(el('p', { class: 'plot-note', text: 'Points with zero or negative values are not shown on a logarithmic axis.' }));
    }
    this.draw = draw;
    draw();
    var lastW = container.clientWidth;
    function onResize() {
      var w = container.clientWidth;
      if (w && w !== lastW) { lastW = w; draw(); }
    }
    try {
      if (root.ResizeObserver) new root.ResizeObserver(onResize).observe(container);
      else root.addEventListener('resize', onResize);
    } catch (e) { root.addEventListener('resize', onResize); }
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    wrapTables();
    initStaticCode();
    qa(DOC, '.ex').forEach(initExercise);
    initPredicts();
    initGates();
    refreshGaps();
    mathIn(DOC.body);
  }

  root.Course = {
    mathIn: mathIn,
    rng: rng, shuffle: shuffle, randInt: randInt,
    parseArray: parseArray, fmt: fmt,
    codeBlock: codeBlock,
    Stepper: Stepper, PosetView: PosetView, Plot: Plot,
    getProgress: getProgress,
    tagClass: tagClass,
    init: init
  };

  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
