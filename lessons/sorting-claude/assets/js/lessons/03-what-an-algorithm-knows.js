/* ============================================================================
   Lesson 03 — interactive figures.

     Figure 3.1  five sealed boxes; knowledge accumulates, some of it unpaid
     Figure 5.1  the same boxes under a richer model, for comparison

   The hidden values are never displayed in Figure 3.1 and never can be: the
   whole section turns on the reader experiencing an opaque item.
   ========================================================================= */

(function () {
  'use strict';

  var LABELS = ['A', 'B', 'C', 'D', 'E'];
  /* Distinct, and deliberately not in order. Never shown in Figure 3.1. */
  var VALUES = [30, 10, 40, 50, 20];
  var N = 5;
  var PAIRS = N * (N - 1) / 2;

  /* ---------------------------------------------------------------------
     Shared knowledge bookkeeping.

     before[i][j] === true means "we know item i comes before item j".
     Everything derivable by chaining is derived, so the reader can see the
     difference between what was asked for and what merely followed.
     --------------------------------------------------------------------- */

  function emptyKnowledge() {
    var k = [];
    for (var i = 0; i < N; i++) { k[i] = []; for (var j = 0; j < N; j++) k[i][j] = false; }
    return k;
  }

  /* Repeatedly apply transitivity until nothing new appears. */
  function close(before) {
    var changed = true;
    while (changed) {
      changed = false;
      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          if (!before[i][j]) continue;
          for (var k = 0; k < N; k++) {
            if (before[j][k] && !before[i][k]) { before[i][k] = true; changed = true; }
          }
        }
      }
    }
    return before;
  }

  function knownPairs(before) {
    var n = 0;
    for (var i = 0; i < N; i++) {
      for (var j = i + 1; j < N; j++) if (before[i][j] || before[j][i]) n++;
    }
    return n;
  }

  /* ---------------------------------------------------------------------
     Figure 3.1 — sealed boxes.
     --------------------------------------------------------------------- */

  function fig31() {
    if (!document.getElementById('l31-row') || !window.Lab) return;

    var asked = {};              /* 'i-j' for each pair actually compared  */
    var before = emptyKnowledge();
    var picked = null;
    var note = document.getElementById('l31-note');

    function pairKey(i, j) { return Math.min(i, j) + '-' + Math.max(i, j); }

    function compare(i, j) {
      asked[pairKey(i, j)] = true;
      if (VALUES[i] < VALUES[j]) before[i][j] = true; else before[j][i] = true;
      close(before);
    }

    var row = new Lab.CellRow('#l31-row', {
      items: [],
      clickable: true,
      onClick: function (item, i) {
        if (picked === null) { picked = i; }
        else if (picked === i) { picked = null; }
        else { compare(picked, i); picked = null; }
        draw();
      }
    });

    var matrix = new Lab.Matrix('#l31-matrix', {
      labels: LABELS,
      caption: 'Row against column. “<” means the row item comes first.'
    });

    Lab.legend('#l31-legend', [
      { state: 'paid', label: 'you asked for this' },
      { state: 'free', label: 'followed by chaining, unpaid' },
      { state: 'plain', label: 'still unknown' }
    ]);

    var readout = new Lab.Readout('#l31-readout', [
      { label: 'Comparisons you have paid for' },
      { label: 'Pairs you now know about' },
      { label: 'Is the arrangement settled?' }
    ], { condHead: 'The ledger', whyHead: 'Where that leaves you' });

    var btns = Lab.controls('#l31-controls', [
      { id: 'random', label: 'Ask a random unknown pair', primary: true, onClick: function () {
          var open = [];
          for (var i = 0; i < N; i++) {
            for (var j = i + 1; j < N; j++) if (!before[i][j] && !before[j][i]) open.push([i, j]);
          }
          if (!open.length) return;
          var p = open[Math.floor(Math.random() * open.length)];
          compare(p[0], p[1]); picked = null; draw();
        } },
      { id: 'reset', label: 'Start over', onClick: function () {
          asked = {}; before = emptyKnowledge(); picked = null; draw();
        } },
      { spacer: true },
      { id: 'count', readout: true, text: '' }
    ]);

    function draw() {
      var paid = Object.keys(asked).length;
      var known = knownPairs(before);
      var settled = known === PAIRS;

      /* Once everything is known, the row can be shown in its true order —
         still without ever revealing a value. */
      var indices = [0, 1, 2, 3, 4];
      if (settled) {
        indices.sort(function (a, b) { return before[a][b] ? -1 : 1; });
      }

      row.selected = picked === null ? null : indices.indexOf(picked);
      row.render(indices.map(function (idx, pos) {
        return {
          id: 'box' + idx,
          val: LABELS[idx],
          sub: settled ? 'place ' + (pos + 1) : 'sealed',
          state: settled ? 'settled' : null,
          label: 'Item ' + LABELS[idx]
        };
      }));

      matrix.update(function (i, j) {
        if (i === j) return { cls: 'k-self', text: '' };
        var know = before[i][j] || before[j][i];
        if (!know) return { cls: '', text: '·', title: LABELS[i] + ' against ' + LABELS[j] + ': unknown' };
        var sym = before[i][j] ? '<' : '>';
        var direct = !!asked[pairKey(i, j)];
        return {
          cls: direct ? 'k-paid' : 'k-free',
          text: sym,
          title: LABELS[i] + ' ' + (before[i][j] ? 'comes before ' : 'comes after ') + LABELS[j] +
                 (direct ? ' — you asked this' : ' — deduced by chaining')
        };
      });

      readout.update([
        { ok: null, word: String(paid),
          text: paid === 0
            ? 'Nothing spent yet. Click two boxes to spend one.'
            : 'You have handed ' + paid + ' pair' + (paid === 1 ? '' : 's') +
              ' to the relation and received ' + paid + ' answer' + (paid === 1 ? '' : 's') + '.' },
        { ok: settled ? true : null, word: known + ' of ' + PAIRS,
          text: known === paid
            ? 'So far, exactly what you paid for. Chaining has had nothing to work with yet.'
            : known + ' pairs known from ' + paid + ' questions — ' + (known - paid) +
              ' of them followed by chaining, at no cost.' },
        { ok: settled ? true : null, word: settled ? 'Settled' : 'Not yet',
          text: settled
            ? 'Every pair is decided, so exactly one arrangement is left and the boxes above can be ' +
              'put in it. Notice you still do not know a single value.'
            : (PAIRS - known) + ' pair' + (PAIRS - known === 1 ? '' : 's') + ' undecided, so more ' +
              'than one arrangement is still possible and no answer can be given.' }
      ]);

      if (btns.count) btns.count.textContent = 'asked ' + paid + ' · known ' + known + ' of ' + PAIRS;
      if (btns.random) btns.random.disabled = settled;
      if (note) {
        note.textContent = settled
          ? 'Everything is decided. The boxes are shown in the only order consistent with what you learned.'
          : (picked === null
              ? 'Click one box, then another, to ask which of the two comes first.'
              : 'Box ' + LABELS[picked] + ' is picked up. Click another box to compare them.');
      }
    }

    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 5.1 — the same items, with reading switched on.
     --------------------------------------------------------------------- */

  function fig51() {
    if (!document.getElementById('l51-row') || !window.Lab) return;

    var mode = 'compare';        /* 'compare' | 'read' */
    var ops = 0;
    var seen = {};               /* values read, in read mode */
    var before = emptyKnowledge();
    var picked = null;
    var note = document.getElementById('l51-note');
    var hint = document.getElementById('l51-hint');

    function recomputeFromReads() {
      before = emptyKnowledge();
      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          if (i !== j && seen[i] && seen[j]) {
            if (VALUES[i] < VALUES[j]) before[i][j] = true;
          }
        }
      }
      close(before);
    }

    var modeBtns = Lab.controls('#l51-mode', [
      { id: 'compare', label: 'Comparison only', onClick: function () { setMode('compare'); } },
      { id: 'read', label: 'Comparison and reading', onClick: function () { setMode('read'); } }
    ]);

    function setMode(m) {
      mode = m; ops = 0; seen = {}; before = emptyKnowledge(); picked = null;
      draw();
    }

    var row = new Lab.CellRow('#l51-row', {
      items: [],
      clickable: true,
      onClick: function (item, i) {
        if (mode === 'read') {
          if (seen[i]) return;
          seen[i] = true; ops++;
          recomputeFromReads();
        } else {
          if (picked === null) { picked = i; draw(); return; }
          if (picked === i) { picked = null; draw(); return; }
          ops++;
          if (VALUES[picked] < VALUES[i]) before[picked][i] = true; else before[i][picked] = true;
          close(before);
          picked = null;
        }
        draw();
      }
    });

    var readout = new Lab.Readout('#l51-readout', [
      { label: 'Operations used' },
      { label: 'Pairs known' },
      { label: 'What one operation buys here' }
    ], { condHead: 'The ledger', whyHead: 'Where that leaves you' });

    var btns = Lab.controls('#l51-controls', [
      { id: 'reset', label: 'Start over', onClick: function () { setMode(mode); } },
      { spacer: true },
      { id: 'count', readout: true, text: '' }
    ]);

    function draw() {
      var known = knownPairs(before);
      var settled = known === PAIRS;

      ['compare', 'read'].forEach(function (m) {
        if (modeBtns[m]) modeBtns[m].setAttribute('aria-pressed', String(m === mode));
      });

      row.selected = picked;
      row.render(LABELS.map(function (L, i) {
        var revealed = mode === 'read' && seen[i];
        return {
          id: 'b' + i,
          val: revealed ? VALUES[i] : L,
          sub: revealed ? 'item ' + L : 'sealed',
          state: revealed ? 'settled' : null,
          label: revealed ? 'Item ' + L + ', value ' + VALUES[i] : 'Item ' + L + ', sealed'
        };
      }));

      if (hint) {
        hint.textContent = mode === 'read'
          ? 'The items — click one to read its value'
          : 'The items — click two to compare them';
      }

      readout.update([
        { ok: null, word: String(ops),
          text: mode === 'read'
            ? ops + ' value' + (ops === 1 ? '' : 's') + ' read. Reading is the only operation you ' +
              'need here, so every click is one operation.'
            : ops + ' comparison' + (ops === 1 ? '' : 's') + ' made. Each one takes two clicks but ' +
              'counts as a single operation.' },
        { ok: settled, word: known + ' of ' + PAIRS,
          text: settled
            ? 'Complete knowledge, reached in ' + ops + ' operation' + (ops === 1 ? '' : 's') + '.'
            : (PAIRS - known) + ' pair' + (PAIRS - known === 1 ? '' : 's') + ' still undecided.' },
        { ok: null, word: mode === 'read' ? 'An item' : 'A pair',
          text: mode === 'read'
            ? 'Reading the third value settled its pairing with both values already read — one ' +
              'operation, several pairs. An item belongs to every pair it is part of.'
            : 'A comparison decides exactly one pair directly. Chaining can add more, but only ' +
              'where earlier answers happen to connect.' }
      ]);

      if (btns.count) {
        btns.count.textContent = (mode === 'read' ? 'reads' : 'comparisons') + ': ' + ops +
                                 ' · known ' + known + ' of ' + PAIRS;
      }
      if (note) {
        if (settled) {
          note.textContent = 'Complete knowledge in ' + ops + ' operations. Now switch models and ' +
                             'reach it again the other way.';
        } else if (mode === 'read') {
          note.textContent = 'Click a sealed box to read what is inside it.';
        } else {
          note.textContent = picked === null
            ? 'Click one box, then another, to compare them.'
            : 'Box ' + LABELS[picked] + ' is picked up. Click another to compare.';
        }
      }
    }

    draw();
  }

  Lab.ready(function () {
    fig31();
    fig51();
  });
})();
