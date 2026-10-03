(function (root) {
  'use strict';

  /* ---------------------------------------------------------------------------------------------
   * Faithful port of Listing 2 (same names, same loop order, same first counterexample).
   * Returns null or an array: ['not irreflexive', x] | ['not transitive', x, y, z] | ['ties not transitive', x, y, z]
   * ------------------------------------------------------------------------------------------- */
  function check_strict_weak(values, before) {
    var x, y, z, i, j, k;
    for (i = 0; i < values.length; i++) {
      x = values[i];
      if (before(x, x)) {
        return ['not irreflexive', x];
      }
    }
    for (i = 0; i < values.length; i++) {
      x = values[i];
      for (j = 0; j < values.length; j++) {
        y = values[j];
        for (k = 0; k < values.length; k++) {
          z = values[k];
          if (before(x, y) && before(y, z) && !before(x, z)) {
            return ['not transitive', x, y, z];
          }
        }
      }
    }

    function tie(x, y) {
      return !before(x, y) && !before(y, x);
    }

    for (i = 0; i < values.length; i++) {
      x = values[i];
      for (j = 0; j < values.length; j++) {
        y = values[j];
        for (k = 0; k < values.length; k++) {
          z = values[k];
          if (tie(x, y) && tie(y, z) && !tie(x, z)) {
            return ['ties not transitive', x, y, z];
          }
        }
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------------------------------------
   * The seven presets. Values are represented faithfully: NaN is NaN (every comparison is false),
   * sets are sorted arrays with a proper-subset test, strings are strings.
   * ------------------------------------------------------------------------------------------- */
  function properSubset(a, b) {            // Python: a < b on sets
    if (a.length >= b.length) return false;
    for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) return false;
    return true;
  }
  var beats = { 'rock|scissors': true, 'scissors|paper': true, 'paper|rock': true };

  var PRESETS = [
    { id: 'total', label: 'a < b', rule: '<code>a &lt; b</code>', kind: 'int',
      values: [3, 1, 2, 5], before: function (a, b) { return a < b; } },
    { id: 'len', label: 'len(a) < len(b)', rule: '<code>len(a) &lt; len(b)</code>', kind: 'str',
      values: ['pear', 'fig', 'kiwi', 'plum', 'apple'], before: function (a, b) { return a.length < b.length; } },
    { id: 'tol', label: 'tolerance 1', rule: 'tolerance: a tie if <code>abs(a - b) &lt; 1</code>, otherwise <code>a &lt; b</code>', kind: 'float',
      values: [0.0, 0.6, 1.2, 1.8], before: function (a, b) { return Math.abs(a - b) < 1 ? false : a < b; } },
    { id: 'nan', label: 'NaN', rule: '<code>a &lt; b</code> on floats, one of them NaN', kind: 'float',
      values: [1.0, NaN, 2.0], before: function (a, b) { return a < b; } },
    { id: 'rps', label: 'rock-paper-scissors', rule: '"beats": rock beats scissors, scissors beats paper, paper beats rock', kind: 'str',
      values: ['rock', 'paper', 'scissors'], before: function (a, b) { return beats[a + '|' + b] === true; } },
    { id: 'sets', label: 'sets', rule: '<code>a &lt; b</code> on sets (proper subset)', kind: 'set',
      values: [[1], [2], [1, 2], [3]], before: properSubset },
    { id: 'concat', label: 'concatenation', rule: '<code>a + b &gt; b + a</code> on strings', kind: 'str',
      values: ['3', '30', '34', '5', '9'], before: function (a, b) { return a + b > b + a; } }
  ];

  /* Python-style display of a value (label) and of its repr */
  function label(kind, v) {
    if (kind === 'set') return '{' + v.join(', ') + '}';
    if (kind === 'float') {
      if (v !== v) return 'nan';
      return Number.isInteger(v) ? v.toFixed(1) : String(v);
    }
    return String(v);
  }
  function repr(kind, v) { return kind === 'str' ? "'" + v + "'" : label(kind, v); }

  function verdictRepr(kind, result) {
    if (result === null) return 'None';
    var parts = ["'" + result[0] + "'"];
    for (var i = 1; i < result.length; i++) parts.push(repr(kind, result[i]));
    return '(' + parts.join(', ') + ')';
  }

  function runPreset(p) { return check_strict_weak(p.values, p.before); }

  /* sentence for a counterexample, in words */
  function sentence(p, r) {
    var L = function (v) { return label(p.kind, v); };
    if (r === null) {
      return 'No counterexample on this sample: nothing is before itself, "before" is transitive, and ties are transitive.';
    }
    if (r[0] === 'not irreflexive') return L(r[1]) + ' is before itself.';
    var x = r[1], y = r[2], z = r[3];
    if (r[0] === 'not transitive') {
      return L(x) + ' is before ' + L(y) + ', ' + L(y) + ' is before ' + L(z) + ', but ' + L(x) + ' is not before ' + L(z) + '.';
    }
    var tail = p.before(x, z) ? L(x) + ' is before ' + L(z) : L(z) + ' is before ' + L(x);
    return L(x) + ' ties ' + L(y) + ', ' + L(y) + ' ties ' + L(z) + ', but ' + tail + '.';
  }

  /* indices of the answer-table cells ("row before column") that form the counterexample */
  function failingCells(p, r) {
    var cells = {};
    if (r === null) return cells;
    var idx = function (v) {
      var s = repr(p.kind, v);
      for (var i = 0; i < p.values.length; i++) if (repr(p.kind, p.values[i]) === s) return i;
      return -1;
    };
    var add = function (a, b) { cells[a + ',' + b] = true; };
    if (r[0] === 'not irreflexive') { add(idx(r[1]), idx(r[1])); return cells; }
    var x = idx(r[1]), y = idx(r[2]), z = idx(r[3]);
    if (r[0] === 'not transitive') { add(x, y); add(y, z); add(x, z); return cells; }
    add(x, y); add(y, x); add(y, z); add(z, y); add(x, z); add(z, x);
    return cells;
  }

  /* ---------------------------------------------------------------------------------------------
   * Fig. 1 widget
   * ------------------------------------------------------------------------------------------- */
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  function Checker(container) {
    var self = this, current = 0;
    container.classList.add('chk');
    var group = el('div', { class: 'tgl', role: 'group', 'aria-label': 'Comparison presets' });
    var btns = PRESETS.map(function (p, i) {
      var b = el('button', { type: 'button', class: 'btn', 'aria-pressed': 'false' }, [p.label]);
      b.addEventListener('click', function () { self.select(i); });
      group.appendChild(b);
      return b;
    });
    var info = el('p', { class: 'chk-info' });
    var tableWrap = el('div', { class: 'chk-tbl-wrap' });
    var verdict = el('div', { class: 'chk-verdict', role: 'status', 'aria-live': 'polite' });
    container.appendChild(group);
    container.appendChild(info);
    container.appendChild(tableWrap);
    container.appendChild(verdict);

    this.select = function (i) {
      current = i;
      var p = PRESETS[i], r = runPreset(p), cells = failingCells(p, r);
      btns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      info.innerHTML = '<span class="label">Comparison</span> ' + p.rule +
        '<br><span class="label">Sample</span> <code>' + p.values.map(function (v) { return repr(p.kind, v); }).join(', ') + '</code>';

      var t = el('table', { class: 'chk-tbl' });
      var head = el('tr', null, [el('th', { class: 'corner', html: '<span class="sr">row before column?</span>' })]);
      p.values.forEach(function (v) { head.appendChild(el('th', { scope: 'col' }, [label(p.kind, v)])); });
      t.appendChild(el('thead', null, [head]));
      var body = el('tbody');
      p.values.forEach(function (a, ri) {
        var tr = el('tr', null, [el('th', { scope: 'row' }, [label(p.kind, a)])]);
        p.values.forEach(function (b, ci) {
          var yes = p.before(a, b), bad = cells[ri + ',' + ci] === true;
          var td = el('td', { class: (bad ? 'bad' : '') + (yes ? ' yes' : '') }, [yes ? '✓' : (bad ? '✗' : '')]);
          td.setAttribute('aria-label', label(p.kind, a) + ' before ' + label(p.kind, b) + ': ' + (yes ? 'yes' : 'no'));
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      t.appendChild(body);
      tableWrap.innerHTML = '';
      tableWrap.appendChild(t);
      tableWrap.appendChild(el('p', { class: 'chk-key' }, ['Is the row element before the column element? ✓ means yes; a blank cell means no.' + (r ? ' Red cells are the answers about the three elements of the counterexample, in both directions; inside them ✗ marks a no.' : '')]));

      verdict.className = 'chk-verdict ' + (r === null ? 'pass' : 'fail');
      verdict.innerHTML = '';
      verdict.appendChild(el('p', { class: 'chk-call' }, [el('code', null, ['check_strict_weak(values, before) → ' + verdictRepr(p.kind, r)])]));
      verdict.appendChild(el('p', { class: 'chk-words' }, [sentence(p, r)]));
    };
    this.select(0);
  }

  var L02 = { check_strict_weak: check_strict_weak, checkStrictWeak: check_strict_weak, PRESETS: PRESETS,
              runPreset: runPreset, verdictRepr: verdictRepr, label: label, repr: repr, sentence: sentence, failingCells: failingCells,
              Checker: Checker };
  if (typeof module !== 'undefined' && module.exports) module.exports = L02;
  else root.L02 = L02;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var c = document.getElementById('checker');
      if (c) new Checker(c);
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
