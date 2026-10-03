/* components.js — DOM/UI building blocks for theme 05 "Plain text".
   Depends on engine.js (SC.*). Adds SC.ui.* */
(function () {
  'use strict';
  var SC = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : window.SC;
  SC.ui = SC.ui || {};

  var REDUCE_MOTION = (typeof window !== 'undefined' && window.matchMedia) ?
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  SC.REVEAL = (typeof location !== 'undefined') && /[?&]reveal=1\b/.test(location.search);

  // ---------------- tiny DOM helpers ----------------
  function el(tag, attrs) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    }
    return e;
  }
  SC.ui.el = el;

  function byId(id) { return document.getElementById(id); }

  function isTypingTarget(node) {
    if (!node) return false;
    var tag = node.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable;
  }
  SC.ui.isTypingTarget = isTypingTarget;

  function center(str, width) {
    str = String(str);
    var pad = width - str.length;
    if (pad <= 0) return str;
    var left = Math.floor(pad / 2), right = pad - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
  }

  // ---------------- gating ----------------
  // A gate wraps a container that stays hidden until reveal() is called.
  function makeGate(container) {
    container.hidden = !SC.REVEAL;
    return {
      el: container,
      revealed: SC.REVEAL,
      reveal: function () {
        if (this.revealed) return;
        this.revealed = true;
        container.hidden = false;
      }
    };
  }
  SC.ui.makeGate = makeGate;

  function skipLink(onSkip) {
    var p = el('p', { class: 'gate-skip' });
    var a = el('a', { href: '#', role: 'button' }, '[skip, just show me]');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      onSkip();
    });
    p.appendChild(a);
    return p;
  }

  // ---------------- exercises ----------------
  // Numeric exercise: renders "> [input] [check]" + feedback. Returns {root, committed}
  SC.ui.mountNumeric = function (root, opts) {
    // opts: { answer: string, wrong: [{test(raw,num), message}], generic, correct, onCommit(isCorrect, raw) }
    var state = { committed: false };
    var row = el('div', { class: 'ex-numeric' });
    var chevron = el('span', { class: 'prompt-chevron' }, '>');
    var input = el('input', { type: 'text', inputmode: 'numeric', class: 'tinput', 'aria-label': 'your answer', size: '6' });
    var btn = el('button', { class: 'tbtn', type: 'button' }, '[check]');
    row.appendChild(chevron); row.appendChild(input); row.appendChild(btn);
    var feedback = el('div', { class: 'feedback', hidden: true });
    root.appendChild(row);
    root.appendChild(feedback);

    function evaluate() {
      var raw = input.value.trim();
      if (raw === '') return;
      var isCorrect = raw === String(opts.answer).trim();
      feedback.hidden = false;
      feedback.className = 'feedback ' + (isCorrect ? 'good' : 'bad');
      var msg = null;
      if (isCorrect) {
        msg = opts.correct;
      } else {
        for (var i = 0; i < (opts.wrong || []).length; i++) {
          if (opts.wrong[i].value === raw) { msg = opts.wrong[i].message; break; }
        }
        if (msg == null) msg = opts.generic;
      }
      feedback.innerHTML = '';
      feedback.appendChild(el('span', { class: 'mark' }, isCorrect ? '✓' : '✗'));
      feedback.appendChild(el('span', { class: 'msg', html: msg }));
      if (!state.committed) {
        state.committed = true;
        if (opts.onCommit) opts.onCommit(isCorrect, raw);
      }
      if (window.renderMathInElement) {
        try { renderMathInElement(feedback, SC.ui.katexOptions); } catch (e) {}
      }
    }
    btn.addEventListener('click', evaluate);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') evaluate(); });
    return state;
  };

  // Multiple choice exercise. opts.options = [{letter,text,correct,feedback}]
  SC.ui.mountMC = function (root, opts) {
    var state = { committed: false };
    var list = el('div', { class: 'ex-options' });
    var feedback = el('div', { class: 'feedback', hidden: true });
    var optionEls = [];
    opts.options.forEach(function (o, idx) {
      var b = el('button', { class: 'ex-option', type: 'button' },
        el('span', { class: 'radio' }, '( )'),
        el('span', { class: 'opt-text', html: '(' + o.letter + ') ' + o.text })
      );
      b.addEventListener('click', function () {
        optionEls.forEach(function (x) {
          x.classList.remove('picked-right', 'picked-wrong');
          x.querySelector('.radio').textContent = '( )';
        });
        b.classList.add(o.correct ? 'picked-right' : 'picked-wrong');
        b.querySelector('.radio').textContent = '(•)';
        feedback.hidden = false;
        feedback.className = 'feedback ' + (o.correct ? 'good' : 'bad');
        feedback.innerHTML = '';
        feedback.appendChild(el('span', { class: 'mark' }, o.correct ? '✓' : '✗'));
        feedback.appendChild(el('span', { class: 'msg', html: o.feedback }));
        if (!state.committed) {
          state.committed = true;
          if (opts.onCommit) opts.onCommit(idx, o.correct);
        }
        if (window.renderMathInElement) {
          try { renderMathInElement(feedback, SC.ui.katexOptions); } catch (e) {}
        }
      });
      optionEls.push(b);
      list.appendChild(b);
    });
    root.appendChild(list);
    root.appendChild(feedback);
    return state;
  };

  SC.ui.katexOptions = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  };

  SC.ui.renderMath = function (scopeEl) {
    if (window.renderMathInElement) {
      try { renderMathInElement(scopeEl, SC.ui.katexOptions); } catch (e) { /* no-op */ }
    }
  };

  // A "predict first" block = exercise + gate + skip link.
  // opts: {kind:'numeric'|'mc', controlsRoot, gate(Gate obj), exerciseOpts}
  SC.ui.mountPredict = function (controlsRoot, gate, kind, exerciseOpts) {
    var onCommitOrig = exerciseOpts.onCommit;
    exerciseOpts = Object.assign({}, exerciseOpts, {
      onCommit: function (a, b) {
        gate.reveal();
        if (onCommitOrig) onCommitOrig(a, b);
      }
    });
    var state = (kind === 'numeric') ? SC.ui.mountNumeric(controlsRoot, exerciseOpts) : SC.ui.mountMC(controlsRoot, exerciseOpts);
    controlsRoot.appendChild(skipLink(function () { gate.reveal(); }));
    return state;
  };

  // ---------------- code listing ----------------
  SC.ui.renderCodeListing = function (root, highlightedLines, opts) {
    opts = opts || {};
    var pre = el('pre', { class: 'code' });
    var lineEls = [];
    highlightedLines.forEach(function (html, idx) {
      var n = idx + 1;
      var line = el('div', { class: 'code-line' + (opts.clickable ? ' clickable' : '') });
      line.appendChild(el('span', { class: 'gutter' }, String(n)));
      line.appendChild(el('span', { class: 'gutter-mark' }));
      line.appendChild(el('span', { class: 'src', html: html }));
      if (opts.clickable) {
        line.setAttribute('role', 'button');
        line.setAttribute('tabindex', '0');
        line.addEventListener('click', function () { opts.onLineClick(n, line); });
        line.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onLineClick(n, line); }
        });
      }
      pre.appendChild(line);
      lineEls.push(line);
    });
    root.appendChild(pre);
    return {
      lineEls: lineEls,
      setCurrentLine: function (n) {
        lineEls.forEach(function (l, idx) {
          var on = (idx + 1) === n;
          l.classList.toggle('current', on);
          l.querySelector('.gutter-mark').textContent = on ? '▶' : '';
        });
      }
    };
  };

  SC.ui.copyButton = function (text) {
    var b = el('button', { class: 'tbtn copy-btn', type: 'button' }, '[copy]');
    b.addEventListener('click', function () {
      var done = function () { b.textContent = '[copied]'; setTimeout(function () { b.textContent = '[copy]'; }, 1200); };
      var fail = function () { b.textContent = '[copy failed]'; setTimeout(function () { b.textContent = '[copy]'; }, 1200); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) { fail(); }
          document.body.removeChild(ta);
        }
      } catch (e) { fail(); }
    });
    return b;
  };

  // ---------------- character-grid array figure ----------------
  function fieldWidthFor(values) {
    var maxLen = values.reduce(function (m, v) { return Math.max(m, String(v).length); }, 1);
    return Math.max(3, maxLen + 2);
  }

  // Build the array row as a true character grid: a block of inline spans,
  // each exactly `fieldWidth` characters wide, so it lines up with the
  // plain-text bracket/label rows rendered underneath it.
  function buildArrayRowDom(values, regions, compareIdx, fieldWidth) {
    var wrap = el('div', { class: 'array-grid' });
    var cellSpans = [];
    wrap.appendChild(el('span', { class: 'pipe' }, '│'));
    values.forEach(function (v, i) {
      var cls = 'region-' + (regions ? regions[i] : 'rest');
      if (compareIdx && compareIdx.indexOf(i) !== -1) cls += ' region-compared';
      var span = el('span', { class: cls }, center(v, fieldWidth));
      wrap.appendChild(span);
      wrap.appendChild(el('span', { class: 'pipe' }, '│'));
      cellSpans.push(span);
    });
    return { root: wrap, cellSpans: cellSpans };
  }
  SC.ui.buildArrayRowDom = buildArrayRowDom;
  SC.ui.fieldWidthFor = fieldWidthFor;
  SC.ui.centerText = center;

  // text-row builder for brackets/labels beneath the array — plain monospace text,
  // aligned to the same per-cell field width so it lines up under the pipes above.
  function totalRowLen(n, fieldWidth) { return 1 + n * (fieldWidth + 1); }
  function cellCenterCol(k, fieldWidth) { return 1 + k * (fieldWidth + 1) + Math.floor(fieldWidth / 2); }

  SC.ui.buildBracketText = function (n, fieldWidth, i, j, cornerL, cornerR, fillChar) {
    var len = totalRowLen(n, fieldWidth);
    var chars = new Array(len).fill(' ');
    var ci = cellCenterCol(i, fieldWidth), cj = cellCenterCol(j, fieldWidth);
    chars[ci] = cornerL; chars[cj] = cornerR;
    for (var c = ci + 1; c < cj; c++) chars[c] = fillChar || '─';
    return chars.join('');
  };

  // Region label row ("└─ sorted ─┘" style), tiling the whole row with 1..N contiguous runs.
  SC.ui.buildRegionLabelRow = function (n, fieldWidth, regions) {
    var len = totalRowLen(n, fieldWidth);
    var chars = new Array(len).fill(' ');
    var runs = [];
    var start = 0;
    for (var k = 1; k <= n; k++) {
      if (k === n || regions[k] !== regions[start]) {
        runs.push([start, k - 1, regions[start]]);
        start = k;
      }
    }
    runs.forEach(function (run) {
      var startCol = 1 + run[0] * (fieldWidth + 1);
      var endCol = 1 + run[1] * (fieldWidth + 1) + fieldWidth - 1;
      var width = endCol - startCol + 1;
      if (width < 2) return;
      var inner = new Array(width).fill('─');
      inner[0] = '└'; inner[width - 1] = '┘';
      var label = run[2];
      if (width - 2 >= label.length + 2) {
        var labelStr = ' ' + label + ' ';
        var padL = Math.floor((width - 2 - labelStr.length) / 2) + 1;
        for (var c = 0; c < labelStr.length; c++) inner[padL + c] = labelStr[c];
      } else if (width - 2 >= label.length) {
        var padL2 = Math.floor((width - label.length) / 2);
        for (var c2 = 0; c2 < label.length; c2++) inner[padL2 + c2] = label[c2];
      }
      for (var c3 = 0; c3 < width; c3++) chars[startCol + c3] = inner[c3];
    });
    return chars.join('');
  };

  SC.ui.legendLine = function () {
    return el('div', { class: 'legend-line' },
      el('span', { class: 'legend-swatch sw-sorted' }), 'sorted prefix · ',
      el('span', { class: 'legend-swatch sw-key' }), 'key being inserted · ',
      el('span', { class: 'legend-swatch sw-rest' }), 'not yet processed'
    );
  };

  // ---------------- counters ----------------
  SC.ui.buildCounters = function (pairs) {
    var wrap = el('div', { class: 'counters' });
    pairs.forEach(function (p) {
      wrap.appendChild(el('span', { class: 'kv' },
        el('span', { class: 'k' }, p[0] + ': '),
        el('span', { class: 'v', 'data-key': p[0] }, String(p[1]))
      ));
    });
    return wrap;
  };

  SC.ui.updateCounters = function (countersEl, map) {
    for (var k in map) {
      var v = countersEl.querySelector('[data-key="' + k + '"]');
      if (v) v.textContent = String(map[k]);
    }
  };
})();
