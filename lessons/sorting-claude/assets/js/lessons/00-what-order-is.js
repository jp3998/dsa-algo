/* ============================================================================
   Lesson 00 — interactive figures.

     Figure 2.1  one set of people, three relations, the row rearranging live
     Figure 3.1  seven hidden items, one neighbouring pair asked at a time
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Figure 2.1 — the objects never change; only the question does.

     The row animates rather than redrawing, because the whole claim of the
     section is that these are the same four people moving. A cut would show
     four new people.
     --------------------------------------------------------------------- */

  function fig21() {
    if (!document.getElementById('l21-row') || !window.Lab) return;

    var PEOPLE = [
      { id: 'ana', name: 'Ana', height: 158, age: 41 },
      { id: 'ben', name: 'Ben', height: 181, age: 29 },
      { id: 'cal', name: 'Cal', height: 167, age: 55 },
      { id: 'dee', name: 'Dee', height: 174, age: 34 }
    ];

    var RELATIONS = {
      height: {
        label: 'Ordered by height, shortest first',
        sub: function (p) { return p.height + ' cm'; },
        key: function (p) { return p.height; }
      },
      age: {
        label: 'Ordered by age, youngest first',
        sub: function (p) { return p.age + ' years'; },
        key: function (p) { return p.age; }
      },
      name: {
        label: 'Ordered by name, alphabetically',
        sub: function (p) { return p.name.toLowerCase(); },
        key: function (p) { return p.name; }
      }
    };

    var current = 'height';
    var relLabel = document.getElementById('l21-rel');
    var row = new Lab.CellRow('#l21-row', { items: [] });

    function draw() {
      var r = RELATIONS[current];
      var ordered = PEOPLE.slice().sort(function (a, b) {
        var ka = r.key(a), kb = r.key(b);
        return ka < kb ? -1 : (ka > kb ? 1 : 0);
      });

      if (relLabel) relLabel.textContent = r.label;

      row.render(ordered.map(function (p) {
        return { id: p.id, val: p.name, sub: r.sub(p), label: p.name + ', ' + r.sub(p) };
      }));
    }

    var btns = Lab.controls('#l21-controls', [
      { id: 'height', label: 'By height', onClick: function () { current = 'height'; draw(); mark(); } },
      { id: 'age',    label: 'By age',    onClick: function () { current = 'age';    draw(); mark(); } },
      { id: 'name',   label: 'By name',   onClick: function () { current = 'name';   draw(); mark(); } }
    ]);

    function mark() {
      ['height', 'age', 'name'].forEach(function (k) {
        if (btns[k]) btns[k].setAttribute('aria-pressed', String(k === current));
      });
    }

    draw();
    mark();
  }

  /* ---------------------------------------------------------------------
     Figure 3.1 — seven hidden items, asked one neighbouring pair at a time.

     The values are never shown, and never can be. Everything the reader
     learns is a verdict about a pair, which is the point of the section.
     --------------------------------------------------------------------- */

  function fig31() {
    if (!document.getElementById('l31-row') || !window.Lab) return;

    var N = 7, PAIRS = N - 1;

    /* Arrangement A is in order, so it costs all six questions. Arrangement
       B has one pair the wrong way round, so it can cost as little as one. */
    var ARRANGEMENTS = {
      A: { name: 'Arrangement A', ok: [true, true, true, true, true, true] },
      B: { name: 'Arrangement B', ok: [true, false, true, true, true, true] }
    };

    var which = 'A';
    var asked = [];            /* asked[i] === true once pair i has been put */
    var note = document.getElementById('l31-note');

    function verdicts() { return ARRANGEMENTS[which].ok; }
    function askedCount() { return asked.filter(Boolean).length; }

    function brokenPair() {
      var v = verdicts();
      for (var i = 0; i < PAIRS; i++) if (asked[i] && !v[i]) return i;
      return -1;
    }

    function finished() { return brokenPair() >= 0 || askedCount() === PAIRS; }

    function ask(i) {
      if (asked[i] || finished()) return;
      asked[i] = true;
      draw();
    }

    var row = new Lab.CellRow('#l31-row', {
      items: [],
      gaps: function (i) {
        var v = verdicts();
        if (asked[i]) {
          return {
            text: v[i] ? '✓' : '✗',
            cls: v[i] ? 'is-pass' : 'is-fail',
            title: v[i]
              ? 'Pair ' + (i + 1) + ': these two are the right way round'
              : 'Pair ' + (i + 1) + ': these two are the wrong way round'
          };
        }
        if (finished()) return { text: '?', title: 'Pair ' + (i + 1) + ': never asked' };
        return {
          text: '?',
          title: 'Ask about pair ' + (i + 1),
          onClick: ask
        };
      }
    });

    var readout = new Lab.Readout('#l31-readout', [
      { label: 'Is this row in order?' },
      { label: 'What do you know about the seven values?' }
    ], { condHead: 'The question', whyHead: 'Where you stand' });

    var btns = Lab.controls('#l31-controls', [
      { id: 'next', label: 'Ask the next unasked pair', primary: true, onClick: function () {
          for (var i = 0; i < PAIRS; i++) if (!asked[i]) { ask(i); return; }
        } },
      { id: 'reset', label: 'Start over', onClick: function () { asked = []; draw(); } },
      { id: 'swap', label: 'Try a different arrangement', onClick: function () {
          which = (which === 'A') ? 'B' : 'A';
          asked = [];
          draw();
        } },
      { spacer: true },
      { id: 'count', readout: true, text: '' }
    ]);

    function draw() {
      var bad = brokenPair();
      var done = finished();
      var k = askedCount();

      row.render(Array.apply(null, Array(N)).map(function (_, i) {
        return {
          id: 'h' + i,
          val: '?',
          sub: String(i + 1),
          state: (bad >= 0 && (i === bad || i === bad + 1)) ? 'active' : null,
          label: 'Hidden item at position ' + (i + 1)
        };
      }));

      var ok, why;
      if (bad >= 0) {
        ok = false;
        why = 'One neighbouring pair is the wrong way round, and one is enough. You can stop after ' +
              k + (k === 1 ? ' question' : ' questions') + ' — nothing you might learn later can undo it.';
      } else if (k === PAIRS) {
        ok = true;
        why = 'All ' + PAIRS + ' neighbouring pairs check out. It took every one of them: stop a ' +
              'question short and the pair you skipped is the pair that could have been wrong.';
      } else {
        ok = null;
        why = (PAIRS - k) + ' pair' + (PAIRS - k === 1 ? '' : 's') + ' still unasked, so the row ' +
              'might be in order and might not. Nothing you have learned so far rules either out.';
      }

      readout.update([
        { ok: ok, word: ok === null ? 'Unknown' : undefined, text: why },
        { ok: null, word: 'Nothing',
          text: 'Not one value, and not one ever. Every answer you have received is about how two ' +
                'items sit relative to each other — never about what either of them is.' }
      ]);

      if (btns.count) {
        btns.count.textContent = ARRANGEMENTS[which].name + ' · asked ' + k + ' of ' + PAIRS;
      }
      if (btns.next) {
        btns.next.disabled = done;
        btns.next.textContent = done ? 'Nothing left to ask' : 'Ask the next unasked pair';
      }
      if (note) {
        note.textContent = done
          ? 'The verdict is settled. The unasked pairs stay unasked.'
          : 'Click any circle to ask whether those two items are the right way round.';
      }
    }

    draw();
  }

  Lab.ready(function () {
    fig21();
    fig31();
  });
})();
