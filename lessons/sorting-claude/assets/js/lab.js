/* ============================================================================
   lab.js — reusable pieces for interactive figures.

   A lab is something the reader operates. Three pieces recur often enough to
   be worth sharing:

     CellRow   a row of labelled boxes that can be clicked, reordered and
               animated; reordering uses FLIP so items visibly travel to
               their new places rather than teleporting
     Readout   a small table of conditions, each with a pass/fail tag and a
               sentence saying why
     controls  a row of buttons

   Everything is plain DOM. Colours and spacing come from the CSS tokens.
   Exposes a single global: Lab
   ========================================================================= */

(function (global) {
  'use strict';

  function el(tag, cls, parent, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  function reduceMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------------------------------------------------------------------
     CellRow

       new Lab.CellRow(mount, {
         items:    [{ id, val, sub, state, ghost }],
         clickable: true,
         onClick:  function (item, index) {},
         gaps:     function (i) { return { text, cls, title, onClick } | null }
       })

     `render(items)` re-renders and animates any cell whose id it already
     knew about from its old position to its new one.
     --------------------------------------------------------------------- */

  function CellRow(mount, opts) {
    this.mount = (typeof mount === 'string') ? document.querySelector(mount) : mount;
    this.opts = opts || {};
    this.items = (this.opts.items || []).slice();
    this.selected = null;
    if (this.mount) {
      this.root = el('div', 'cells', this.mount);
      this.root.setAttribute('role', 'list');
      this.render(this.items);
    }
  }

  CellRow.prototype.positions = function () {
    var map = {};
    Array.prototype.forEach.call(this.root.children, function (c) {
      if (c.dataset && c.dataset.id !== undefined) {
        map[c.dataset.id] = c.getBoundingClientRect();
      }
    });
    return map;
  };

  CellRow.prototype.render = function (items) {
    if (!this.root) return;
    var self = this;
    var before = this.positions();
    if (items) this.items = items.slice();

    this.root.innerHTML = '';

    this.items.forEach(function (item, i) {
      /* Optional marker sitting between this cell and the previous one. */
      if (i > 0 && typeof self.opts.gaps === 'function') {
        var g = self.opts.gaps(i - 1);
        if (g) {
          var gapNode = el(g.onClick ? 'button' : 'span',
            'gap ' + (g.cls || '') + (g.onClick ? ' is-clickable' : ''),
            self.root, g.text || '·');
          if (g.title) gapNode.setAttribute('aria-label', g.title);
          if (g.title) gapNode.title = g.title;
          if (g.onClick) {
            gapNode.type = 'button';
            gapNode.addEventListener('click', function () { g.onClick(i - 1); });
          }
        }
      }

      var cls = 'cell';
      if (item.state) cls += ' is-' + item.state;
      if (item.ghost) cls += ' is-ghost';
      if (self.opts.clickable && !item.fixed) cls += ' is-clickable';
      if (self.selected === i) cls += ' is-selected';

      var node = el(self.opts.clickable && !item.fixed ? 'button' : 'div', cls, self.root);
      if (node.tagName === 'BUTTON') node.type = 'button';
      node.dataset.id = item.id !== undefined ? item.id : ('i' + i);
      node.setAttribute('role', 'listitem');

      var valNode = el('span', 'cell-val', node, item.val);
      /* Numbers want the tabular mono face; words read better in the serif. */
      if (!/^[-+]?[0-9., ]+$/.test(String(item.val))) valNode.className = 'cell-val is-word';
      if (item.sub) el('span', 'cell-sub', node, item.sub);

      if (item.label) node.setAttribute('aria-label', item.label);

      if (self.opts.clickable && !item.fixed && self.opts.onClick) {
        node.addEventListener('click', function () { self.opts.onClick(item, i); });
      }
    });

    /* FLIP: each cell that existed before starts from where it used to be. */
    if (!reduceMotion()) {
      Array.prototype.forEach.call(this.root.children, function (c) {
        if (!c.dataset || c.dataset.id === undefined) return;
        var was = before[c.dataset.id];
        if (!was) return;
        var now = c.getBoundingClientRect();
        var dx = was.left - now.left, dy = was.top - now.top;
        if (!dx && !dy) return;
        c.style.transition = 'none';
        c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        requestAnimationFrame(function () {
          c.style.transition = 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)';
          c.style.transform = '';
        });
      });
    }
  };

  CellRow.prototype.select = function (i) {
    this.selected = i;
    this.render();
  };

  /* ---------------------------------------------------------------------
     Readout — a table of conditions with live pass/fail tags.
     --------------------------------------------------------------------- */

  function Readout(mount, rows, opts) {
    this.mount = (typeof mount === 'string') ? document.querySelector(mount) : mount;
    if (!this.mount) return;
    opts = opts || {};

    var table = el('table', 'lab-readout', this.mount);
    table.setAttribute('aria-live', 'polite');

    var thead = el('thead', null, table);
    var htr = el('tr', null, thead);
    el('th', 'col-cond', htr, opts.condHead || 'Condition');
    el('th', 'col-stat', htr, opts.statHead || 'Status');
    el('th', null, htr, opts.whyHead || 'What that means');

    var tbody = el('tbody', null, table);
    this.rows = rows.map(function (r) {
      var tr = el('tr', null, tbody);
      var c1 = el('td', 'col-cond', tr);
      el('span', 'cond', c1, r.label);
      var c2 = el('td', 'col-stat', tr);
      var tag = el('span', 'tag unknown', c2, '—');
      var c3 = el('td', 'why', tr, '—');
      return { tag: tag, why: c3 };
    });
  }

  /* states: [{ ok: true|false|null, text: '…' }] */
  Readout.prototype.update = function (states) {
    if (!this.rows) return;
    var self = this;
    states.forEach(function (s, i) {
      var row = self.rows[i];
      if (!row) return;
      var cls = s.ok === true ? 'pass' : (s.ok === false ? 'fail' : 'unknown');
      var word = s.ok === true ? (s.word || 'Satisfied')
        : (s.ok === false ? (s.word || 'Violated') : (s.word || 'Unknown'));
      row.tag.className = 'tag ' + cls;
      row.tag.textContent = word;
      row.why.textContent = s.text || '—';
    });
  };

  /* ---------------------------------------------------------------------
     Matrix — a grid of what is known about each pair.

       new Lab.Matrix(mount, { labels: ['A','B',…], caption: '…' })
       .update(function (i, j) { return { cls, text, title }; })

     Cell (i, j) is read as "item i against item j".
     --------------------------------------------------------------------- */

  function Matrix(mount, opts) {
    this.mount = (typeof mount === 'string') ? document.querySelector(mount) : mount;
    if (!this.mount) return;
    var labels = opts.labels;
    this.n = labels.length;

    var table = el('table', 'kmatrix', this.mount);
    table.setAttribute('aria-live', 'polite');
    if (opts.caption) el('caption', 'kmatrix-cap', table, opts.caption);

    var thead = el('thead', null, table);
    var htr = el('tr', null, thead);
    el('th', 'corner', htr, '');
    labels.forEach(function (L) { el('th', null, htr, L); });

    var tbody = el('tbody', null, table);
    this.cells = [];
    for (var i = 0; i < this.n; i++) {
      var tr = el('tr', null, tbody);
      el('th', null, tr, labels[i]);
      this.cells[i] = [];
      for (var j = 0; j < this.n; j++) {
        this.cells[i][j] = el('td', null, tr, '');
      }
    }
    this.labels = labels;
  }

  Matrix.prototype.update = function (fn) {
    if (!this.cells) return;
    for (var i = 0; i < this.n; i++) {
      for (var j = 0; j < this.n; j++) {
        var r = fn(i, j) || {};
        var td = this.cells[i][j];
        td.className = r.cls || '';
        td.textContent = r.text === undefined ? '' : r.text;
        if (r.title) td.title = r.title; else td.removeAttribute('title');
      }
    }
  };

  /* ---------------------------------------------------------------------
     controls — a button row. Returns the buttons keyed by id.
     --------------------------------------------------------------------- */

  function controls(mount, defs) {
    mount = (typeof mount === 'string') ? document.querySelector(mount) : mount;
    if (!mount) return {};
    var bar = el('div', 'lab-controls', mount);
    var out = { _bar: bar };
    defs.forEach(function (d) {
      if (d.spacer) { el('span', 'spacer', bar); return; }
      if (d.readout) { out[d.id] = el('span', 'readout', bar, d.text || ''); return; }
      var b = el('button', d.primary ? 'primary' : null, bar, d.label);
      b.type = 'button';
      if (d.onClick) b.addEventListener('click', d.onClick);
      out[d.id || d.label] = b;
    });
    return out;
  }

  /* ---------------------------------------------------------------------
     legend — the three meanings, spelled out.
     --------------------------------------------------------------------- */

  function legend(mount, entries) {
    mount = (typeof mount === 'string') ? document.querySelector(mount) : mount;
    if (!mount) return;
    var bar = el('div', 'lab-legend', mount);
    entries.forEach(function (e) {
      var s = el('span', null, bar);
      el('i', 'sw-' + (e.state || 'plain'), s);
      s.appendChild(document.createTextNode(e.label));
    });
  }

  /* --------------------------------------------------------------------- */

  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  global.Lab = {
    el: el,
    CellRow: CellRow,
    Readout: Readout,
    Matrix: Matrix,
    controls: controls,
    legend: legend,
    shuffled: shuffled,
    reduceMotion: reduceMotion,
    ready: ready
  };
})(window);
