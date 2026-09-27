/* ============================================================================
   Lesson 02 — interactive figures.

     Figure 2.1  the two tests, run live on a candidate the reader edits
     Figure 4.1  the pairing of positions, redrawn as the reader swaps
     Figure 6.1  tied records, and the question the specification cannot answer
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Figure 2.1 — same items? in order?

     Deliberately worded in plain language: the formal clauses do not exist
     until Section 5, so this figure must not use their names.
     --------------------------------------------------------------------- */

  function fig21() {
    if (!document.getElementById('l21-output') || !window.Lab) return;

    var SOURCE = [
      { id: 'a', val: 17 }, { id: 'b', val: 4 }, { id: 'c', val: 29 },
      { id: 'd', val: 4 },  { id: 'e', val: 11 }
    ];

    var candidate = SOURCE.slice();
    var selected = null;
    var note = document.getElementById('l21-note');

    /* --- the two tests ------------------------------------------------- */

    function bag(list) {
      var m = {};
      list.forEach(function (x) { m[x.val] = (m[x.val] || 0) + 1; });
      return m;
    }

    function sameItems() {
      var a = bag(SOURCE), b = bag(candidate);
      var keys = {};
      Object.keys(a).forEach(function (k) { keys[k] = 1; });
      Object.keys(b).forEach(function (k) { keys[k] = 1; });
      var missing = [], extra = [];
      Object.keys(keys).forEach(function (k) {
        var d = (b[k] || 0) - (a[k] || 0);
        if (d < 0) missing.push(k + (d < -1 ? ' (×' + (-d) + ')' : ''));
        if (d > 0) extra.push(k + (d > 1 ? ' (×' + d + ')' : ''));
      });
      return { ok: !missing.length && !extra.length, missing: missing, extra: extra };
    }

    /* index of the first neighbouring pair sitting the wrong way round */
    function firstDescent() {
      for (var i = 0; i < candidate.length - 1; i++) {
        if (candidate[i].val > candidate[i + 1].val) return i;
      }
      return -1;
    }

    /* --- rows ---------------------------------------------------------- */

    var inputRow = new Lab.CellRow('#l21-input', {
      items: SOURCE.map(function (x, i) {
        return { id: 'src' + x.id, val: x.val, sub: 'A[' + i + ']', ghost: true };
      })
    });

    var outputRow;

    function onCellClick(item, i) {
      if (selected === null) {
        selected = i;
      } else if (selected === i) {
        selected = null;
      } else {
        var t = candidate[selected];
        candidate[selected] = candidate[i];
        candidate[i] = t;
        selected = null;
      }
      draw();
    }

    outputRow = new Lab.CellRow('#l21-output', {
      items: [],
      clickable: true,
      onClick: onCellClick,
      gaps: function (i) {
        if (i >= candidate.length - 1) return null;
        var ok = candidate[i].val <= candidate[i + 1].val;
        return {
          text: ok ? '≤' : '>',
          cls: ok ? 'is-pass' : 'is-fail',
          title: candidate[i].val + (ok ? ' is no greater than ' : ' is greater than ') + candidate[i + 1].val
        };
      }
    });

    var readout = new Lab.Readout('#l21-readout', [
      { label: 'B contains the same items as A' },
      { label: 'Each item in B is no greater than the next' }
    ], { condHead: 'What we want', whyHead: 'What the current B does' });

    var btns = Lab.controls('#l21-controls', [
      { id: 'shuffle', label: 'Shuffle', onClick: function () {
          candidate = Lab.shuffled(candidate); selected = null; draw();
        } },
      { id: 'sort', label: 'Put in order', primary: true, onClick: function () {
          candidate = candidate.slice().sort(function (p, q) { return p.val - q.val; });
          selected = null; draw();
        } },
      { id: 'corrupt', label: 'Replace an item with 99', onClick: function () {
          var k = Math.floor(Math.random() * candidate.length);
          candidate = candidate.slice();
          candidate[k] = { id: 'x' + Date.now(), val: 99 };
          selected = null; draw();
        } },
      { id: 'reset', label: 'Reset', onClick: function () {
          candidate = SOURCE.slice(); selected = null; draw();
        } }
    ]);

    function draw() {
      var same = sameItems();
      var d = firstDescent();

      outputRow.selected = selected;
      outputRow.render(candidate.map(function (x, i) {
        var state = null;
        if (d >= 0 && (i === d || i === d + 1)) state = 'active';
        else if (x.val === 99) state = 'active';
        return { id: x.id, val: x.val, sub: 'B[' + i + ']', state: state };
      }));

      var whySame;
      if (same.ok) {
        whySame = 'Every item of A appears in B the same number of times. Nothing added, nothing lost.';
      } else {
        var parts = [];
        if (same.missing.length) parts.push('lost ' + same.missing.join(', '));
        if (same.extra.length) parts.push('gained ' + same.extra.join(', '));
        whySame = 'B ' + parts.join(' and ') + ', so it no longer holds the items it was given.';
      }

      var whyOrder;
      if (d < 0) {
        whyOrder = 'No neighbouring pair sits the wrong way round, so nothing anywhere is out of place.';
      } else {
        whyOrder = 'B[' + d + '] = ' + candidate[d].val + ' is greater than B[' + (d + 1) + '] = ' +
                   candidate[d + 1].val + ', so this pair is the wrong way round.';
      }

      readout.update([
        { ok: same.ok, text: whySame },
        { ok: d < 0, text: whyOrder }
      ]);

      if (note) {
        note.textContent = selected === null
          ? 'Click a box to pick it up, then click another to swap them.'
          : 'B[' + selected + '] is picked up. Click another box to swap, or the same box to cancel.';
      }
      if (btns.reset) btns.reset.disabled = false;
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 4.1 — the pairing of positions, drawn live.

     SVG rather than DOM cells, because the arrows are the point and they
     have to be drawn between the boxes.
     --------------------------------------------------------------------- */

  function fig41() {
    var mount = document.getElementById('mount-perm');
    if (!mount || !window.D || !window.Lab) return;

    var INPUT = [
      { id: 0, val: 17 }, { id: 1, val: 4 }, { id: 2, val: 29 },
      { id: 3, val: 4 },  { id: 4, val: 11 }
    ];

    /* output[i] holds the item that came from input position output[i].id */
    var output = [INPUT[1], INPUT[3], INPUT[4], INPUT[0], INPUT[2]];
    var picked = null;

    var W = 700, H = 250;
    var BW = 86, BH = 48, GAP = 26;
    var X0 = (W - (5 * BW + 4 * GAP)) / 2;
    var Y1 = 44, Y2 = 172;

    var svg = D.svg(mount, W, H, {
      maxWidth: 760,
      label: 'Five items moving from input positions to output positions, one arrow into each.'
    });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    function x(i) { return X0 + i * (BW + GAP); }

    function swap(i) {
      if (picked === null) { picked = i; }
      else if (picked === i) { picked = null; }
      else {
        var t = output[picked]; output[picked] = output[i]; output[i] = t; picked = null;
      }
      draw();
    }

    function draw() {
      D.clear(layer);

      /* arrows first, so the boxes sit on top of them */
      output.forEach(function (item, dst) {
        var src = item.id;
        var hot = (picked === dst);
        D.arrow(layer, {
          x1: x(src) + BW / 2, y1: Y1 + BH + 3,
          x2: x(dst) + BW / 2, y2: Y2 - 4,
          color: hot ? c.accent : c.inkFaint,
          width: hot ? 2 : 1.3,
          curve: (dst - src) * 6
        });
      });

      D.text(layer, { x: 4, y: Y1 + BH / 2 + 4, text: 'input', kind: 'label' });
      D.text(layer, { x: 4, y: Y2 + BH / 2 + 4, text: 'output', kind: 'label' });

      INPUT.forEach(function (item, i) {
        D.box(layer, {
          x: x(i), y: Y1, w: BW, h: BH, label: item.val, fontSize: 19,
          above: 'A[' + i + ']', aboveSize: 10.5
        });
      });

      output.forEach(function (item, i) {
        var g = D.group(layer, { class: 'hit' });
        D.box(g, {
          x: x(i), y: Y2, w: BW, h: BH, label: item.val, fontSize: 19,
          state: picked === i ? 'accent' : 'default',
          sub: 'B[' + i + ']', subSize: 10.5
        });
        /* transparent hit area so the whole box is clickable */
        var hit = D.el('rect', {
          x: x(i), y: Y2, width: BW, height: BH, fill: 'transparent',
          role: 'button', tabindex: '0',
          'aria-label': 'Output position ' + (i + 1) + ', holding ' + item.val
        }, g);
        hit.style.cursor = 'pointer';
        hit.addEventListener('click', function () { swap(i); });
        hit.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(i); }
        });
      });
    }

    Lab.controls('#l41-controls', [
      { id: 'shuffle', label: 'Shuffle the output', onClick: function () {
          output = Lab.shuffled(output); picked = null; draw();
        } },
      { id: 'sort', label: 'Put in order', primary: true, onClick: function () {
          output = output.slice().sort(function (p, q) { return p.val - q.val; });
          picked = null; draw();
        } }
    ]);

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 6.1 — tied records, and the question that has no answer here.
     --------------------------------------------------------------------- */

  function fig61() {
    if (!document.getElementById('l61-output') || !window.Lab) return;

    var ARRIVED = [
      { id: 'ana', name: 'Ana', score: 3 },
      { id: 'bo',  name: 'Bo',  score: 1 },
      { id: 'cy',  name: 'Cy',  score: 3 },
      { id: 'dee', name: 'Dee', score: 2 }
    ];

    /* Both outputs are sorted by score; they differ only in the tied pair. */
    var order = ['bo', 'dee', 'ana', 'cy'];
    var note = document.getElementById('l61-note');

    function byId(id) {
      for (var i = 0; i < ARRIVED.length; i++) if (ARRIVED[i].id === id) return ARRIVED[i];
      return null;
    }

    new Lab.CellRow('#l61-input', {
      items: ARRIVED.map(function (r, i) {
        return { id: 'in-' + r.id, val: r.name, sub: 'score ' + r.score + ' · arrived ' + (i + 1), ghost: true };
      })
    });

    var outputRow = new Lab.CellRow('#l61-output', { items: [] });

    var readout = new Lab.Readout('#l61-readout', [
      { label: 'Same items as the input' },
      { label: 'Each score no greater than the next' },
      { label: 'Ana before Cy, as they arrived' }
    ], { condHead: 'The question asked', whyHead: 'What the specification says' });

    Lab.controls('#l61-controls', [
      { id: 'swap', label: 'Swap the two tied records', primary: true, onClick: function () {
          var i = order.indexOf('ana'), j = order.indexOf('cy');
          var t = order[i]; order[i] = order[j]; order[j] = t;
          draw();
        } }
    ]);

    function draw() {
      var recs = order.map(byId);

      outputRow.render(recs.map(function (r, i) {
        return {
          id: 'out-' + r.id,
          val: r.name,
          sub: 'score ' + r.score,
          state: r.score === 3 ? 'active' : null,
          label: r.name + ', score ' + r.score + ', output position ' + (i + 1)
        };
      }));

      var anaFirst = order.indexOf('ana') < order.indexOf('cy');

      readout.update([
        { ok: true, text: 'All four records are present exactly once. Swapping two of them cannot change that.' },
        { ok: true, text: 'The scores read 1, 2, 3, 3 in both arrangements. Two tied records in either order satisfy this.' },
        { ok: null, word: 'No opinion',
          text: anaFirst
            ? 'Ana does come before Cy here — but by luck, not by requirement. The relation was told about scores and nothing else, so the specification has no view either way.'
            : 'Cy now comes before Ana, reversing how they arrived. The specification still reports no problem, because it was never given anything that could notice.' }
      ]);

      if (note) {
        note.textContent = anaFirst
          ? 'Ana sits before Cy, the order they arrived in.'
          : 'Cy now sits before Ana, the reverse of how they arrived.';
      }
    }

    draw();
  }

  Lab.ready(function () {
    fig21();
    fig41();
    fig61();
  });
})();
