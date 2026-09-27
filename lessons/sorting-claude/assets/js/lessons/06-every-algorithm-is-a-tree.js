/* ============================================================================
   Lesson 06 — interactive figures.

     Figure 2.1  the complete decision tree of a three-item sorting algorithm,
                 with the path taken by a chosen input highlighted
     Figure 4.1  leaves needed against leaves available, as height varies
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Figure 2.1 — one algorithm, entire.

     The tree below is a real algorithm: compare A:B, then branch. Where a
     node is absent the answer was already forced by chaining, which is why
     two of the eight depth-3 positions are missing.
     --------------------------------------------------------------------- */

  var TREE = {
    q: ['A', 'B'],
    yes: {                              /* A < B */
      q: ['B', 'C'],
      yes: { out: 'ABC' },              /* A<B<C */
      no: {                             /* A<B, C<B */
        q: ['A', 'C'],
        yes: { out: 'ACB' },
        no:  { out: 'CAB' }
      }
    },
    no: {                               /* B < A */
      q: ['A', 'C'],
      yes: { out: 'BAC' },              /* B<A<C */
      no: {                             /* B<A, C<A */
        q: ['B', 'C'],
        yes: { out: 'BCA' },
        no:  { out: 'CBA' }
      }
    }
  };

  var ARRANGEMENTS = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];

  /* Rank of each letter under a given arrangement: the arrangement lists the
     items smallest first, so position is rank. */
  function rankIn(arr) {
    var r = {};
    arr.split('').forEach(function (L, i) { r[L] = i; });
    return r;
  }

  /* Walk the tree for one input, returning the nodes and branches taken. */
  function trace(arr) {
    var rank = rankIn(arr);
    var path = [];
    var node = TREE;
    while (node && !node.out) {
      var answer = rank[node.q[0]] < rank[node.q[1]];   /* first comes first? */
      path.push({ node: node, answer: answer });
      node = answer ? node.yes : node.no;
    }
    return { path: path, leaf: node };
  }

  /* --- layout ---------------------------------------------------------- */

  function depthOf(node) {
    if (node.out) return 0;
    return 1 + Math.max(depthOf(node.yes), depthOf(node.no));
  }

  function countLeaves(node) {
    if (node.out) return 1;
    return countLeaves(node.yes) + countLeaves(node.no);
  }

  /* Assign each node an x by in-order position of the leaves under it. */
  function layout(node, depth, cursor, out) {
    if (node.out) {
      var x = cursor.next++;
      out.push({ node: node, x: x, depth: depth });
      return x;
    }
    var l = layout(node.yes, depth + 1, cursor, out);
    var r = layout(node.no, depth + 1, cursor, out);
    var mid = (l + r) / 2;
    out.push({ node: node, x: mid, depth: depth });
    return mid;
  }

  function fig21() {
    var mount = document.getElementById('l21-tree');
    if (!mount || !window.D || !window.Lab) return;

    var chosen = 'BCA';
    var note = document.getElementById('l21-note');

    var placed = [];
    layout(TREE, 0, { next: 0 }, placed);
    var LEAVES = countLeaves(TREE);
    var HEIGHT = depthOf(TREE);

    var W = 740, H = 300;
    var PAD_T = 30, PAD_B = 46, PAD_X = 74;
    var colW = (W - 2 * PAD_X) / (LEAVES - 1);
    var rowH = (H - PAD_T - PAD_B) / HEIGHT;

    var svg = D.svg(mount, W, H, {
      maxWidth: 800,
      label: 'The complete decision tree of a sorting algorithm for three items.'
    });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    function posOf(node) {
      for (var i = 0; i < placed.length; i++) if (placed[i].node === node) return placed[i];
      return null;
    }
    function px(p) { return PAD_X + p.x * colW; }
    function py(p) { return PAD_T + p.depth * rowH; }

    var inputRow = new Lab.CellRow('#l21-inputs', {
      items: [],
      clickable: true,
      onClick: function (item) { chosen = item.id; draw(); }
    });

    var readout = new Lab.Readout('#l21-readout', [
      { label: 'Questions on this input’s path' },
      { label: 'Leaves in the tree' },
      { label: 'Height of the tree' }
    ], { condHead: 'Reading the tree', whyHead: 'What it tells you' });

    Lab.controls('#l21-controls', [
      { id: 'worst', label: 'Show an input that costs the most', primary: true, onClick: function () {
          var worst = ARRANGEMENTS[0], best = -1;
          ARRANGEMENTS.forEach(function (a) {
            var t = trace(a);
            if (t.path.length > best) { best = t.path.length; worst = a; }
          });
          chosen = worst; draw();
        } },
      { id: 'cheap', label: 'Show one that costs the least', onClick: function () {
          var cheap = ARRANGEMENTS[0], best = Infinity;
          ARRANGEMENTS.forEach(function (a) {
            var t = trace(a);
            if (t.path.length < best) { best = t.path.length; cheap = a; }
          });
          chosen = cheap; draw();
        } }
    ]);

    function draw() {
      var t = trace(chosen);
      var onPath = t.path.map(function (s) { return s.node; });

      inputRow.render(ARRANGEMENTS.map(function (a) {
        return {
          id: a, val: a, sub: trace(a).path.length + ' questions',
          state: a === chosen ? 'active' : null,
          label: 'Input arranged as ' + a
        };
      }));

      D.clear(layer);

      /* edges */
      placed.forEach(function (p) {
        if (p.node.out) return;
        [['yes', p.node.yes], ['no', p.node.no]].forEach(function (pair) {
          var child = posOf(pair[1]);
          if (!child) return;
          var idx = onPath.indexOf(p.node);
          var taken = idx >= 0 && (t.path[idx].answer === (pair[0] === 'yes'));
          D.line(layer, {
            x1: px(p), y1: py(p) + 13, x2: px(child), y2: py(child) - 15,
            color: taken ? c.active : c.rule,
            width: taken ? 2.4 : 1.2
          });
          var mx = (px(p) + px(child)) / 2, my = (py(p) + py(child)) / 2;
          D.text(layer, {
            x: mx + (pair[0] === 'yes' ? -13 : 13), y: my + 4,
            text: pair[0] === 'yes' ? 'yes' : 'no',
            anchor: 'middle', kind: 'caption', size: 10.5,
            color: taken ? c.active : c.inkFaint
          });
        });
      });

      /* nodes */
      placed.forEach(function (p) {
        var isLeaf = !!p.node.out;
        var active = onPath.indexOf(p.node) >= 0;
        var isEndLeaf = isLeaf && p.node === t.leaf;

        if (isLeaf) {
          var w = 46, h = 26;
          D.el('rect', {
            x: px(p) - w / 2, y: py(p) - h / 2, width: w, height: h, rx: 3,
            fill: isEndLeaf ? c.settledWash : (c.paperRaised || c.paper),
            stroke: isEndLeaf ? c.settled : c.ruleStrong,
            'stroke-width': isEndLeaf ? 2 : 1.3
          }, layer);
          D.text(layer, {
            x: px(p), y: py(p), text: p.node.out, anchor: 'middle', baseline: 'central',
            kind: 'body', size: 12.5, weight: 600,
            color: isEndLeaf ? c.settled : c.ink
          });
        } else {
          D.el('circle', {
            cx: px(p), cy: py(p), r: 17,
            fill: active ? c.activeWash : (c.paperRaised || c.paper),
            stroke: active ? c.active : c.ruleStrong,
            'stroke-width': active ? 2 : 1.3
          }, layer);
          D.text(layer, {
            x: px(p), y: py(p), text: p.node.q[0] + ':' + p.node.q[1],
            anchor: 'middle', baseline: 'central', kind: 'body', size: 11.5,
            color: active ? c.active : c.ink
          });
        }
      });

      /* depth guides, kept narrow so they cannot collide with the leftmost node */
      D.text(layer, { x: 6, y: 14, text: 'questions', kind: 'label', size: 9 });
      for (var d = 0; d <= HEIGHT; d++) {
        D.text(layer, {
          x: 22, y: PAD_T + d * rowH + 4, text: String(d),
          anchor: 'middle', kind: 'caption', size: 11
        });
      }

      D.text(layer, {
        x: W / 2, y: H - 14,
        text: 'each circle is a comparison · each box is an output',
        anchor: 'middle', kind: 'caption', size: 11
      });

      var k = t.path.length;
      readout.update([
        { ok: null, word: String(k),
          text: 'On input ' + chosen + ' the algorithm asks ' +
                t.path.map(function (s) {
                  return s.node.q[0] + ':' + s.node.q[1];
                }).join(', then ') + ', then outputs ' + t.leaf.out + '.' },
        { ok: null, word: String(LEAVES),
          text: 'Six leaves for six arrangements — exactly one each, which is the least a correct ' +
                'algorithm can get away with.' },
        { ok: null, word: String(HEIGHT),
          text: 'The longest path has ' + HEIGHT + ' questions on it, so ' + HEIGHT + ' comparisons ' +
                'is the worst this algorithm can be made to do. Some inputs cost less; none cost more.' }
      ]);

      if (note) {
        note.textContent = 'Showing the run on input ' + chosen + ', which costs ' + k +
                           (k === 1 ? ' question.' : ' questions.');
      }
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 4.1 — leaves needed against leaves available.
     --------------------------------------------------------------------- */

  function fig41() {
    var mount = document.getElementById('l41-chart');
    if (!mount || !window.D || !window.Lab) return;

    var n = 6;
    var MAXH = 24;

    function factorial(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f; }
    function commas(x) { return x.toLocaleString('en-US', { maximumFractionDigits: 0 }); }

    var SUP = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
                '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };
    function sup(v) {
      return String(v).split('').map(function (d) { return SUP[d] || d; }).join('');
    }

    function minHeight(k) {
      var need = factorial(k), h = 0;
      while (Math.pow(2, h) < need) h++;
      return h;
    }

    var sliderWrap = document.getElementById('l41-slider');
    if (sliderWrap) {
      var lab = Lab.el('label', 'slider-row', sliderWrap);
      Lab.el('span', 'slider-label', lab, 'Items to sort');
      var slider = document.createElement('input');
      slider.type = 'range'; slider.min = '2'; slider.max = '12'; slider.value = String(n);
      slider.setAttribute('aria-label', 'Number of items to sort');
      lab.appendChild(slider);
      var val = Lab.el('span', 'slider-value', lab, String(n));
      slider.addEventListener('input', function () {
        n = parseInt(slider.value, 10);
        val.textContent = String(n);
        draw();
      });
    }

    var readout = new Lab.Readout('#l41-readout', [
      { label: 'Leaves the tree must have' },
      { label: 'Leaves a tree of that height can hold' },
      { label: 'The shortest tree that could work' }
    ], { condHead: 'The squeeze', whyHead: 'The numbers' });

    var W = 700, H = 300;
    var PAD_L = 62, PAD_R = 20, PAD_T = 22, PAD_B = 40;
    var svg = D.svg(mount, W, H, { maxWidth: 780, label: 'Leaves required against leaves available as tree height grows.' });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    function draw() {
      D.clear(layer);

      var need = factorial(n);
      var hMin = minHeight(n);
      var TOP = Math.max(Math.log(need) / Math.LN10, MAXH * Math.log(2) / Math.LN10);

      function x(h) { return PAD_L + h / MAXH * (W - PAD_L - PAD_R); }
      function y(l10) { return H - PAD_B - (l10 / TOP) * (H - PAD_T - PAD_B); }

      for (var d = 0; d <= TOP; d += Math.max(1, Math.round(TOP / 6))) {
        D.line(layer, { x1: PAD_L, y1: y(d), x2: W - PAD_R, y2: y(d), color: c.rule, width: 1 });
        D.text(layer, { x: PAD_L - 8, y: y(d) + 4, text: d === 0 ? '1' : '10' + sup(d), kind: 'caption', anchor: 'end', size: 10 });
      }

      D.line(layer, { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: H - PAD_B, color: c.ruleStrong });
      D.line(layer, { x1: PAD_L, y1: H - PAD_B, x2: W - PAD_R, y2: H - PAD_B, color: c.ruleStrong });

      for (var h = 0; h <= MAXH; h += 4) {
        D.text(layer, { x: x(h), y: H - PAD_B + 16, text: String(h), kind: 'caption', anchor: 'middle', size: 10 });
      }
      D.text(layer, { x: (PAD_L + W - PAD_R) / 2, y: H - 6, text: 'height of the tree (comparisons in the worst case)', kind: 'caption', anchor: 'middle', size: 10.5 });

      /* leaves needed: a flat line at n! */
      var needY = y(Math.log(need) / Math.LN10);
      D.line(layer, { x1: PAD_L, y1: needY, x2: W - PAD_R, y2: needY, color: c.active, width: 2.2 });
      D.text(layer, { x: W - PAD_R - 4, y: needY - 8, text: 'leaves needed (' + n + '!)', anchor: 'end', kind: 'caption', color: c.active, size: 11 });

      /* leaves available: 2^h */
      var d2 = '';
      for (var k = 0; k <= MAXH; k++) {
        d2 += (k === 0 ? 'M ' : ' L ') + x(k) + ' ' + y(k * Math.log(2) / Math.LN10);
      }
      D.el('path', { d: d2, fill: 'none', stroke: c.settled, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, layer);
      D.text(layer, { x: x(MAXH) - 4, y: y(MAXH * Math.log(2) / Math.LN10) - 10, text: 'leaves available (2\u02b0)', anchor: 'end', kind: 'caption', color: c.settled, size: 11 });

      /* the impossible region */
      D.el('rect', {
        x: PAD_L, y: PAD_T, width: x(hMin) - PAD_L, height: H - PAD_T - PAD_B,
        fill: c.discardedWash, opacity: 0.55
      }, layer);
      D.text(layer, {
        x: (PAD_L + x(hMin)) / 2, y: PAD_T + 16, text: 'no algorithm here',
        anchor: 'middle', kind: 'caption', size: 11, color: c.discarded
      });

      D.line(layer, { x1: x(hMin), y1: PAD_T, x2: x(hMin), y2: H - PAD_B, color: c.ink, dashed: true, width: 1.4 });
      D.el('circle', { cx: x(hMin), cy: y(hMin * Math.log(2) / Math.LN10), r: 4.5, fill: c.ink }, layer);
      D.text(layer, { x: x(hMin) + 8, y: PAD_T + 16, text: 'h = ' + hMin, kind: 'body', size: 12, weight: 600 });

      readout.update([
        { ok: null, word: commas(need),
          text: n + '! arrangements, each needing a leaf of its own — proved in Section 3, without ' +
                'reference to any particular algorithm.' },
        { ok: null, word: commas(Math.pow(2, hMin)),
          text: 'A tree of height ' + hMin + ' holds at most 2^' + hMin + ' = ' +
                commas(Math.pow(2, hMin)) + ' leaves. At height ' + (hMin - 1) + ' it holds only ' +
                commas(Math.pow(2, hMin - 1)) + ', which is short of ' + commas(need) + '.' },
        { ok: null, word: String(hMin),
          text: 'So no comparison algorithm sorting ' + n + ' items can have worst case below ' +
                hMin + ' comparisons. Whether any algorithm achieves ' + hMin + ' is a different ' +
                'question, and this argument cannot answer it.' }
      ]);
    }

    draw();
  }

  Lab.ready(function () {
    fig21();
    fig41();
  });
})();
