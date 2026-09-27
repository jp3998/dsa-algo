/* ============================================================================
   Lesson 07 — interactive figures.

     Figure 1.1  halving a pile of possibilities down to one
     Figure 3.1  log2(n!) as an area, squeezed between two rectangles
     Figure 5.1  what the bound costs at scale, against n squared
   ========================================================================= */

(function () {
  'use strict';

  /* ---- arithmetic ------------------------------------------------------ */

  /* Exact for small n, Stirling beyond — summing a million logarithms on
     every slider tick is not worth the accuracy it would buy. */
  function log2Factorial(n) {
    if (n < 2) return 0;
    if (n <= 1000) {
      var s = 0;
      for (var k = 2; k <= n; k++) s += Math.log2(k);
      return s;
    }
    return (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n)) / Math.LN2;
  }

  function commas(x) {
    return Math.round(x).toLocaleString('en-US');
  }

  /* Big numbers in a form a person can read. */
  function human(x) {
    if (x < 1e4) return commas(x);
    if (x < 1e6) return (x / 1e3).toFixed(1).replace(/\.0$/, '') + ' thousand';
    if (x < 1e9) return (x / 1e6).toFixed(1).replace(/\.0$/, '') + ' million';
    if (x < 1e12) return (x / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion';
    return (x / 1e12).toFixed(1).replace(/\.0$/, '') + ' trillion';
  }

  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(v) {
    return String(v).split('').map(function (d) { return SUP[d] || d; }).join('');
  }

  /* A labelled slider. Returns a function that reads the current value. */
  function slider(sel, opts) {
    var wrap = document.querySelector(sel);
    if (!wrap) return null;
    var lab = Lab.el('label', 'slider-row', wrap);
    Lab.el('span', 'slider-label', lab, opts.label);
    var input = document.createElement('input');
    input.type = 'range';
    input.min = String(opts.min);
    input.max = String(opts.max);
    input.step = String(opts.step || 1);
    input.value = String(opts.value);
    input.setAttribute('aria-label', opts.label);
    lab.appendChild(input);
    var out = Lab.el('span', 'slider-value', lab, opts.format(opts.value));
    input.addEventListener('input', function () {
      var v = parseFloat(input.value);
      out.textContent = opts.format(v);
      opts.onChange(v);
    });
    return input;
  }

  /* ---------------------------------------------------------------------
     Figure 1.1 — halving down to one.

     The point of the figure is the flatness: multiplying the start by a
     thousand adds ten boxes, not a thousand.
     --------------------------------------------------------------------- */

  function fig11() {
    if (!document.getElementById('l11-row') || !window.Lab) return;

    var STARTS = [2, 3, 5, 8, 16, 24, 50, 120, 500, 720, 5000, 40320,
                  100000, 1000000];
    var idx = 6;                       /* 50 */
    var note = document.getElementById('l11-note');

    var row = new Lab.CellRow('#l11-row', { items: [] });

    var readout = new Lab.Readout('#l11-readout', [
      { label: 'Possibilities at the start' },
      { label: 'Halvings needed to reach one' },
      { label: 'If the start were a thousand times bigger' }
    ], { condHead: 'Counting halvings', whyHead: 'What that tells you' });

    slider('#l11-slider', {
      label: 'Possibilities to start with',
      min: 0, max: STARTS.length - 1, value: idx,
      format: function (v) { return commas(STARTS[v]); },
      onChange: function (v) { idx = v; draw(); }
    });

    function fmt(x) {
      if (x >= 1000) return commas(x);
      if (x >= 10) return String(Math.round(x * 10) / 10);
      return String(Math.round(x * 10) / 10);
    }

    function draw() {
      var m = STARTS[idx];
      var steps = Math.ceil(Math.log2(m));

      var cells = [{ id: 'c0', val: fmt(m), sub: 'start', state: null }];
      var v = m;
      for (var i = 1; i <= steps; i++) {
        v = v / 2;
        cells.push({
          id: 'c' + i,
          val: v <= 1 ? '1' : fmt(v),
          sub: i === 1 ? '1 question' : i + ' questions',
          state: v <= 1 ? 'settled' : 'active'
        });
      }

      row.render(cells);

      readout.update([
        { ok: null, word: commas(m),
          text: 'One of ' + commas(m) + ' possibilities is the true one, and nothing yet ' +
                'distinguishes them.' },
        { ok: true, word: String(steps),
          text: steps + ' halvings bring ' + commas(m) + ' down to one. That count is what ' +
                '⌈log₂ ' + commas(m) + '⌉ means — nothing more.' },
        { ok: null, word: '+10',
          text: 'A thousandfold more possibilities costs ten more questions, because a thousand is ' +
                'about ten doublings. The pile explodes; the count strolls.' }
      ]);

      if (note) {
        note.textContent = 'Each box is what remains after one more question, assuming every ' +
                           'question splits the survivors evenly.';
      }
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 3.1 — the sum as an area, between two rectangles.
     --------------------------------------------------------------------- */

  function fig31() {
    var mount = document.getElementById('l31-chart');
    if (!mount || !window.D || !window.Lab) return;

    var n = 16;

    var W = 700, H = 320;
    var PAD_L = 46, PAD_R = 22, PAD_T = 26, PAD_B = 44;
    var svg = D.svg(mount, W, H, {
      maxWidth: 780,
      label: 'Each term of the sum drawn as a bar, with the two bounding rectangles.'
    });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    Lab.legend('#l31-legend', [
      { state: 'settled', label: 'one term of the sum' },
      { state: 'active', label: 'the floor: half the terms, each at least log₂(n/2)' },
      { state: 'plain', label: 'the ceiling: n terms, each at most log₂ n' }
    ]);

    var readout = new Lab.Readout('#l31-readout', [
      { label: 'The floor — the inner rectangle' },
      { label: 'The sum itself — the bars' },
      { label: 'The ceiling — the outer rectangle' }
    ], { condHead: 'Three areas', whyHead: 'Their sizes at this n' });

    slider('#l31-slider', {
      label: 'Number of items',
      min: 4, max: 64, value: n,
      format: function (v) { return String(v); },
      onChange: function (v) { n = v; draw(); }
    });

    function draw() {
      D.clear(layer);

      var top = Math.log2(n) * 1.18;             /* headroom above the tallest bar */
      var plotW = W - PAD_L - PAD_R;
      var plotH = H - PAD_T - PAD_B;
      function x(k) { return PAD_L + (k - 1) / n * plotW; }   /* left edge of bar k */
      var barW = plotW / n;
      function y(v) { return H - PAD_B - (v / top) * plotH; }

      /* axes */
      D.line(layer, { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: H - PAD_B, color: c.ruleStrong });
      D.line(layer, { x1: PAD_L, y1: H - PAD_B, x2: W - PAD_R, y2: H - PAD_B, color: c.ruleStrong });

      for (var g = 0; g <= Math.floor(Math.log2(n)); g++) {
        D.line(layer, { x1: PAD_L, y1: y(g), x2: W - PAD_R, y2: y(g), color: c.rule, width: 1 });
        D.text(layer, { x: PAD_L - 7, y: y(g) + 4, text: String(g), kind: 'caption', anchor: 'end', size: 10 });
      }
      D.text(layer, { x: PAD_L - 7, y: PAD_T - 8, text: 'log₂ k', kind: 'caption', anchor: 'end', size: 10.5 });

      /* the ceiling rectangle: everything fits inside it */
      D.el('rect', {
        x: PAD_L, y: y(Math.log2(n)), width: plotW, height: y(0) - y(Math.log2(n)),
        fill: 'none', stroke: c.ruleStrong, 'stroke-width': 1.6, 'stroke-dasharray': '6 4'
      }, layer);
      D.text(layer, {
        x: PAD_L + 6, y: y(Math.log2(n)) - 7,
        text: 'the ceiling', kind: 'label', size: 9.5, color: c.inkFaint
      });

      /* the bars — drawn before the floor rectangle so the rectangle can be
         laid over them as a tint, rather than being hidden underneath */
      var half = Math.ceil(n / 2);
      for (var k = 1; k <= n; k++) {
        var h = Math.log2(k);
        if (h <= 0) continue;
        D.el('rect', {
          x: x(k) + 0.6, y: y(h), width: Math.max(barW - 1.2, 1), height: y(0) - y(h),
          fill: c.settledWash, stroke: c.settled, 'stroke-width': 0.9
        }, layer);
      }

      /* the floor rectangle: sits inside the tall bars, so it is drawn on
         top at partial opacity with a solid edge */
      D.el('rect', {
        x: x(half), y: y(Math.log2(n / 2)),
        width: PAD_L + plotW - x(half), height: y(0) - y(Math.log2(n / 2)),
        fill: c.active, 'fill-opacity': 0.16,
        stroke: c.active, 'stroke-width': 2
      }, layer);
      D.text(layer, {
        x: x(half) + 7, y: y(0) - 9,
        text: 'the floor', kind: 'label', size: 9.5, color: c.active
      });

      /* ticks */
      [1, half, n].forEach(function (k) {
        D.text(layer, {
          x: x(k) + barW / 2, y: H - PAD_B + 15,
          text: k === half ? 'n/2' : String(k),
          kind: 'caption', anchor: 'middle', size: 10.5
        });
      });
      D.text(layer, {
        x: PAD_L + plotW / 2, y: H - 8,
        text: 'the n terms of the sum, smallest first',
        kind: 'caption', anchor: 'middle', size: 10.5
      });

      var floorV = (n / 2) * Math.log2(n / 2);
      var sumV = log2Factorial(n);
      var ceilV = n * Math.log2(n);

      readout.update([
        { ok: null, word: floorV.toFixed(1),
          text: 'Width n/2 = ' + Math.round(n / 2) + ', height log₂(n/2) = ' +
                Math.log2(n / 2).toFixed(2) + '. Every bar it touches is at least that tall, so it ' +
                'fits underneath the sum.' },
        { ok: true, word: sumV.toFixed(1),
          text: 'log₂(' + n + '!) = ' + sumV.toFixed(1) + ', so any comparison algorithm ' +
                'sorting ' + n + ' items needs at least ' + Math.ceil(sumV) + ' comparisons in the ' +
                'worst case.' },
        { ok: null, word: ceilV.toFixed(1),
          text: 'Width n = ' + n + ', height log₂ n = ' + Math.log2(n).toFixed(2) + '. No bar ' +
                'is taller, so the sum fits inside. The sum is ' +
                (sumV / floorV).toFixed(2) + '× the floor and ' +
                (sumV / ceilV).toFixed(2) + '× the ceiling — and those ratios barely move as n grows.' }
      ]);
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 5.1 — the bound at scale, against comparing everything to
     everything.
     --------------------------------------------------------------------- */

  function fig51() {
    var mount = document.getElementById('l51-chart');
    if (!mount || !window.D || !window.Lab) return;

    var e = 40;                          /* n = 10^(e/10) */
    var EMIN = 10, EMAX = 70;

    var W = 700, H = 300;
    var PAD_L = 62, PAD_R = 22, PAD_T = 22, PAD_B = 42;
    var svg = D.svg(mount, W, H, {
      maxWidth: 780,
      label: 'The comparison bound against the cost of comparing every pair, as the collection grows.'
    });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    var readout = new Lab.Readout('#l51-readout', [
      { label: 'Comparisons the bound demands' },
      { label: 'Per item' },
      { label: 'Comparing every pair, for contrast' }
    ], { condHead: 'At this many items', whyHead: 'The numbers' });

    slider('#l51-slider', {
      label: 'Items to sort',
      min: EMIN, max: EMAX, value: e,
      format: function (v) { return human(Math.pow(10, v / 10)); },
      onChange: function (v) { e = v; draw(); }
    });

    var TOP = Math.log10(Math.pow(10, EMAX / 10) * Math.pow(10, EMAX / 10) / 2);

    function xOf(ex) { return PAD_L + (ex - EMIN) / (EMAX - EMIN) * (W - PAD_L - PAD_R); }
    function yOf(l10) { return H - PAD_B - (l10 / TOP) * (H - PAD_T - PAD_B); }

    function draw() {
      D.clear(layer);

      for (var d = 0; d <= TOP; d += 2) {
        D.line(layer, { x1: PAD_L, y1: yOf(d), x2: W - PAD_R, y2: yOf(d), color: c.rule, width: 1 });
        D.text(layer, {
          x: PAD_L - 8, y: yOf(d) + 4,
          text: d === 0 ? '1' : '10' + sup(d), kind: 'caption', anchor: 'end', size: 10
        });
      }

      D.line(layer, { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: H - PAD_B, color: c.ruleStrong });
      D.line(layer, { x1: PAD_L, y1: H - PAD_B, x2: W - PAD_R, y2: H - PAD_B, color: c.ruleStrong });

      for (var ex = EMIN; ex <= EMAX; ex += 10) {
        D.text(layer, {
          x: xOf(ex), y: H - PAD_B + 15, text: '10' + sup(ex / 10),
          kind: 'caption', anchor: 'middle', size: 10
        });
      }
      D.text(layer, {
        x: (PAD_L + W - PAD_R) / 2, y: H - 6,
        text: 'number of items', kind: 'caption', anchor: 'middle', size: 10.5
      });

      function curve(valueAt, colour, width, dashed) {
        var d = '';
        for (var ex = EMIN; ex <= EMAX; ex += 1) {
          var v = valueAt(Math.pow(10, ex / 10));
          d += (ex === EMIN ? 'M ' : ' L ') + xOf(ex) + ' ' + yOf(Math.log10(Math.max(v, 1)));
        }
        D.el('path', {
          d: d, fill: 'none', stroke: colour, 'stroke-width': width,
          'stroke-linejoin': 'round', 'stroke-dasharray': dashed ? '5 4' : null
        }, layer);
      }

      curve(function (m) { return m * m / 2; }, c.discarded, 1.8, true);
      curve(log2Factorial, c.active, 2.4, false);

      var n = Math.pow(10, e / 10);
      var need = log2Factorial(n);
      var pairs = n * n / 2;

      D.line(layer, { x1: xOf(e), y1: PAD_T, x2: xOf(e), y2: H - PAD_B, color: c.ruleStrong, dashed: true });
      D.el('circle', { cx: xOf(e), cy: yOf(Math.log10(Math.max(pairs, 1))), r: 4, fill: c.discarded }, layer);
      D.el('circle', { cx: xOf(e), cy: yOf(Math.log10(Math.max(need, 1))), r: 5, fill: c.active }, layer);

      /* Series labels sit in the upper-left, which both curves leave empty —
         an inline label at the right-hand end collides with whichever curve
         it belongs to. */
      var lx = PAD_L + 14, ly = PAD_T + 14;
      D.line(layer, { x1: lx, y1: ly, x2: lx + 22, y2: ly, color: c.discarded, width: 1.8, dashed: true });
      D.text(layer, {
        x: lx + 30, y: ly + 4, text: 'every pair (n' + sup(2) + '/2)',
        kind: 'caption', color: c.discarded, size: 11
      });
      D.line(layer, { x1: lx, y1: ly + 18, x2: lx + 22, y2: ly + 18, color: c.active, width: 2.4 });
      D.text(layer, {
        x: lx + 30, y: ly + 22, text: 'the bound (about n log n)',
        kind: 'caption', color: c.active, size: 11
      });

      readout.update([
        { ok: true, word: human(need),
          text: 'Sorting ' + human(n) + ' items takes at least about ' + human(need) +
                ' comparisons, no matter what method is used.' },
        { ok: null, word: (need / n).toFixed(1),
          text: 'About ' + (need / n).toFixed(1) + ' comparisons per item. This is the figure worth ' +
                'carrying: it goes up by one every time the collection doubles, and by ten every ' +
                'time it grows a thousandfold.' },
        { ok: null, word: human(pairs),
          text: 'Comparing every item with every other would take about ' + human(pairs) +
                ' comparisons — roughly ' + commas(pairs / need) + ' times the bound. Whether ' +
                'anything gets close to the bound is still an open question here.' }
      ]);
    }

    draw();
  }

  Lab.ready(function () {
    fig11();
    fig31();
    fig51();
  });
})();
