/* ============================================================================
   Lesson 04 — interactive figures.

     Figure 2.1  grow the arrangements one item at a time, watching each row
                 split into as many children as it has gaps
     Figure 4.1  how fast n! runs away from doubling
   ========================================================================= */

(function () {
  'use strict';

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function factorial(n) {
    var f = 1;
    for (var i = 2; i <= n; i++) f *= i;
    return f;
  }

  var SUP = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
              '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };

  function superscript(n) {
    return String(n).split('').map(function (d) { return SUP[d] || d; }).join('');
  }

  function commas(x) {
    return x.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  /* ---------------------------------------------------------------------
     Figure 2.1 — growing the list.

     At each step every arrangement of k items is shown with its k+1 gaps
     marked, so the multiplication is visible before it happens.
     --------------------------------------------------------------------- */

  function fig21() {
    var mount = document.getElementById('l21-list');
    if (!mount || !window.Lab) return;

    var n = 1;
    var arrangements = [['A']];
    var showingGaps = true;
    var caption = document.getElementById('l21-caption');

    var readout = new Lab.Readout('#l21-readout', [
      { label: 'Items so far' },
      { label: 'Arrangements' },
      { label: 'What the next item will do' }
    ], { condHead: 'The count', whyHead: 'Where the number comes from' });

    var btns = Lab.controls('#l21-controls', [
      { id: 'add', label: 'Add an item', primary: true, onClick: function () {
          if (n >= 4) return;
          var next = LETTERS[n];
          var grown = [];
          arrangements.forEach(function (a) {
            for (var g = 0; g <= a.length; g++) {
              grown.push(a.slice(0, g).concat([next], a.slice(g)));
            }
          });
          arrangements = grown;
          n++;
          draw();
        } },
      { id: 'gaps', label: 'Hide the gaps', onClick: function () {
          showingGaps = !showingGaps;
          btns.gaps.textContent = showingGaps ? 'Hide the gaps' : 'Show the gaps';
          draw();
        } },
      { id: 'reset', label: 'Start over', onClick: function () {
          n = 1; arrangements = [['A']]; draw();
        } },
      { spacer: true },
      { id: 'count', readout: true, text: '' }
    ]);

    function draw() {
      mount.innerHTML = '';

      var grid = Lab.el('div', 'arr-grid', mount);
      if (arrangements.length > 12) grid.className = 'arr-grid is-dense';

      arrangements.forEach(function (a) {
        var line = Lab.el('div', 'arr-row', grid);
        a.forEach(function (letter, i) {
          if (showingGaps && n < 4) Lab.el('span', 'arr-gap', line, '▾');
          Lab.el('span', 'arr-item', line, letter);
        });
        if (showingGaps && n < 4) Lab.el('span', 'arr-gap', line, '▾');
      });

      if (caption) {
        caption.textContent = n + ' item' + (n === 1 ? '' : 's') + ' · ' +
          arrangements.length + ' arrangement' + (arrangements.length === 1 ? '' : 's') +
          (showingGaps && n < 4 ? ' · each triangle is a place the next item could go' : '');
      }

      var gaps = n + 1;
      readout.update([
        { ok: null, word: String(n),
          text: n === 1 ? 'A single item, called A.'
                        : 'Letters A to ' + LETTERS[n - 1] + ', all different from each other.' },
        { ok: null, word: commas(arrangements.length),
          text: n === 1
            ? 'One item, one way to arrange it. Nothing has happened yet.'
            : 'Each of the ' + commas(factorial(n - 1)) + ' arrangements of ' + (n - 1) +
              ' items produced ' + n + ' children, giving ' + commas(factorial(n - 1)) + ' × ' +
              n + ' = ' + commas(arrangements.length) + '.' },
        { ok: null, word: n >= 4 ? 'Off the page' : '× ' + gaps,
          text: n >= 4
            ? 'Adding a fifth item would give 120 arrangements, a sixth 720, a seventh 5,040. The ' +
              'list stops being something you can look at long before the numbers stop being small.'
            : 'Every row above has ' + gaps + ' gaps, so every row becomes ' + gaps + ' rows. The ' +
              'count multiplies by ' + gaps + ', to ' + commas(arrangements.length * gaps) + '.' }
      ]);

      if (btns.count) btns.count.textContent = n + '! = ' + commas(arrangements.length);
      if (btns.add) {
        btns.add.disabled = n >= 4;
        btns.add.textContent = n >= 4 ? 'Too many to show' : 'Add an item (' + LETTERS[n] + ')';
      }
      if (btns.gaps) btns.gaps.disabled = n >= 4;
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 4.1 — factorial against doubling, on a log scale.
     --------------------------------------------------------------------- */

  function fig41() {
    var mount = document.getElementById('l41-chart');
    if (!mount || !window.D || !window.Lab) return;

    var MAX = 20;
    var n = 5;

    /* Slider */
    var sliderWrap = document.getElementById('l41-slider');
    var slider;
    if (sliderWrap) {
      var lab = Lab.el('label', 'slider-row', sliderWrap);
      Lab.el('span', 'slider-label', lab, 'Number of items');
      slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '1'; slider.max = String(MAX); slider.value = String(n);
      slider.setAttribute('aria-label', 'Number of items');
      lab.appendChild(slider);
      var val = Lab.el('span', 'slider-value', lab, String(n));
      slider.addEventListener('input', function () {
        n = parseInt(slider.value, 10);
        val.textContent = String(n);
        draw();
      });
    }

    var readout = new Lab.Readout('#l41-readout', [
      { label: 'Arrangements of n items' },
      { label: 'Doubling, for comparison' },
      { label: 'How far ahead the factorial is' }
    ], { condHead: 'At this n', whyHead: 'The number' });

    var W = 700, H = 300;
    var PAD_L = 58, PAD_R = 18, PAD_T = 18, PAD_B = 36;
    var svg = D.svg(mount, W, H, { maxWidth: 780, label: 'Factorial growth compared with doubling.' });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    /* log10 of the largest value we ever plot, so the axis is stable */
    var TOP = Math.log(factorial(MAX)) / Math.LN10;

    function x(k) { return PAD_L + (k - 1) / (MAX - 1) * (W - PAD_L - PAD_R); }
    function y(log10v) { return H - PAD_B - (log10v / TOP) * (H - PAD_T - PAD_B); }

    function draw() {
      D.clear(layer);

      /* gridlines every three decades */
      for (var d = 0; d <= TOP; d += 3) {
        D.line(layer, { x1: PAD_L, y1: y(d), x2: W - PAD_R, y2: y(d), color: c.rule, width: 1 });
        D.text(layer, {
          x: PAD_L - 8, y: y(d) + 4,
          text: d === 0 ? '1' : '10' + superscript(d),
          kind: 'caption', anchor: 'end', size: 10
        });
      }

      D.line(layer, { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: H - PAD_B, color: c.ruleStrong });
      D.line(layer, { x1: PAD_L, y1: H - PAD_B, x2: W - PAD_R, y2: H - PAD_B, color: c.ruleStrong });

      for (var k = 1; k <= MAX; k += (MAX > 12 ? 2 : 1)) {
        D.text(layer, { x: x(k), y: H - PAD_B + 16, text: String(k), kind: 'caption', anchor: 'middle', size: 10 });
      }
      D.text(layer, { x: (PAD_L + W - PAD_R) / 2, y: H - 4, text: 'number of items', kind: 'caption', anchor: 'middle', size: 10.5 });

      /* the two curves */
      function path(valueAt, colour, width, dashed) {
        var d = '';
        for (var k = 1; k <= MAX; k++) {
          d += (k === 1 ? 'M ' : ' L ') + x(k) + ' ' + y(valueAt(k));
        }
        D.el('path', {
          d: d, fill: 'none', stroke: colour, 'stroke-width': width,
          'stroke-linejoin': 'round', 'stroke-dasharray': dashed ? '5 4' : null
        }, layer);
      }

      path(function (k) { return k * Math.log(2) / Math.LN10; }, c.discarded, 1.6, true);
      path(function (k) { return Math.log(factorial(k)) / Math.LN10; }, c.active, 2.2, false);

      /* the marker for the current n */
      var fy = y(Math.log(factorial(n)) / Math.LN10);
      var dy = y(n * Math.log(2) / Math.LN10);
      D.line(layer, { x1: x(n), y1: PAD_T, x2: x(n), y2: H - PAD_B, color: c.ruleStrong, dashed: true });
      D.el('circle', { cx: x(n), cy: dy, r: 4, fill: c.discarded }, layer);
      D.el('circle', { cx: x(n), cy: fy, r: 5, fill: c.active }, layer);

      D.text(layer, { x: W - PAD_R - 4, y: y(TOP) + 30, text: 'n!', anchor: 'end', kind: 'body', color: c.active, size: 14, weight: 700 });
      D.text(layer, { x: W - PAD_R - 4, y: y(MAX * Math.log(2) / Math.LN10) - 8, text: 'doubling (2ⁿ)', anchor: 'end', kind: 'caption', color: c.discarded, size: 11 });

      var f = factorial(n), p = Math.pow(2, n);
      readout.update([
        { ok: null, word: 'n = ' + n,
          text: n + '! = ' + (f > 1e15 ? f.toExponential(3).replace('e+', ' × 10^') : commas(f)) +
                ' different arrangements.' },
        { ok: null, word: '2^' + n,
          text: 'Doubling ' + n + ' times reaches ' + commas(p) + '. For the first three or four ' +
                'items the two are close, and then they are not.' },
        { ok: null, word: f / p >= 1000 ? '×' + Math.round(f / p).toExponential(1).replace('e+', ' × 10^') : '×' + Math.round(f / p),
          text: n <= 3
            ? 'At this size the factorial has not pulled away yet. Keep dragging.'
            : 'The factorial is about ' + (f / p >= 1e6 ? (f / p).toExponential(2).replace('e+', ' × 10^') : commas(Math.round(f / p))) +
              ' times larger — and that multiplier is itself growing with every step.' }
      ]);
    }

    draw();
  }

  Lab.ready(function () {
    fig21();
    fig41();
  });
})();
