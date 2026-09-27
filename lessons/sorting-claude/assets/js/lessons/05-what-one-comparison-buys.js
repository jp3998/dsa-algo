/* ============================================================================
   Lesson 05 — interactive figures.

     Figure 2.1  all 24 arrangements of four items, dying as questions are
                 answered; the split is previewed before the answer arrives
     Figure 4.1  every available question, and the split each would produce

   Both read the same shared state, so asking a question in one updates the
   other: they are two views of a single narrowing.
   ========================================================================= */

(function () {
  'use strict';

  var LABELS = ['A', 'B', 'C', 'D'];
  var N = 4;
  /* The truth the relation is answering about. Never revealed directly. */
  var TRUE_RANK = { A: 2, B: 0, C: 3, D: 1 };

  function permutations(list) {
    if (list.length <= 1) return [list];
    var out = [];
    list.forEach(function (item, i) {
      var rest = list.slice(0, i).concat(list.slice(i + 1));
      permutations(rest).forEach(function (p) { out.push([item].concat(p)); });
    });
    return out;
  }

  var ALL = permutations(LABELS);          /* 24 candidate arrangements */

  /* Does this candidate put x before y? */
  function saysBefore(cand, x, y) {
    return cand.indexOf(x) < cand.indexOf(y);
  }

  /* ---- shared state --------------------------------------------------- */

  var alive = ALL.map(function () { return true; });
  var asked = [];                           /* [{x, y, answer}] */
  var picked = null;                        /* index of first selected item */
  var listeners = [];

  function aliveCount() {
    return alive.filter(Boolean).length;
  }

  function splitFor(x, y) {
    var before = 0, after = 0;
    ALL.forEach(function (cand, i) {
      if (!alive[i]) return;
      if (saysBefore(cand, x, y)) before++; else after++;
    });
    return { before: before, after: after };
  }

  function alreadySettled(x, y) {
    var s = splitFor(x, y);
    return s.before === 0 || s.after === 0;
  }

  function ask(x, y) {
    var xFirst = TRUE_RANK[x] < TRUE_RANK[y];
    ALL.forEach(function (cand, i) {
      if (!alive[i]) return;
      if (saysBefore(cand, x, y) !== xFirst) alive[i] = false;
    });
    asked.push({ x: x, y: y, xFirst: xFirst });
    picked = null;
    notify();
  }

  function reset() {
    alive = ALL.map(function () { return true; });
    asked = [];
    picked = null;
    notify();
  }

  function notify() { listeners.forEach(function (f) { f(); }); }

  /* Every pair, in a fixed order. */
  var PAIRS = [];
  for (var i = 0; i < N; i++) {
    for (var j = i + 1; j < N; j++) PAIRS.push([LABELS[i], LABELS[j]]);
  }

  /* ---------------------------------------------------------------------
     Figure 2.1 — the 24 worlds.
     --------------------------------------------------------------------- */

  function fig21() {
    var gridMount = document.getElementById('l21-grid');
    if (!gridMount || !window.Lab) return;

    var note = document.getElementById('l21-note');
    var pendingPartner = null;

    var row = new Lab.CellRow('#l21-row', {
      items: [],
      clickable: true,
      onClick: function (item, i) {
        /* A pair is already chosen: start a fresh selection. */
        if (picked !== null && pendingPartner !== null) {
          picked = i; pendingPartner = null; notify(); return;
        }
        if (picked === null) { picked = i; notify(); return; }
        if (picked === i) { picked = null; notify(); return; }
        pendingPartner = i;
        notify();
      }
    });

    Lab.legend('#l21-legend', [
      { state: 'plain', label: 'still possible' },
      { state: 'discarded', label: 'ruled out by an answer' },
      { state: 'settled', label: 'the only survivor' }
    ]);

    var readout = new Lab.Readout('#l21-readout', [
      { label: 'Questions asked' },
      { label: 'Arrangements still possible' },
      { label: 'The question you have selected' }
    ], { condHead: 'The narrowing', whyHead: 'Where that leaves you' });

    var btns = Lab.controls('#l21-controls', [
      { id: 'ask', label: 'Ask the selected question', primary: true, onClick: function () {
          if (picked === null || pendingPartner === null) return;
          var x = LABELS[picked], y = LABELS[pendingPartner];
          pendingPartner = null;
          ask(x, y);
        } },
      { id: 'best', label: 'Ask the most even question', onClick: function () {
          var best = null, bestWorst = Infinity;
          PAIRS.forEach(function (p) {
            var s = splitFor(p[0], p[1]);
            if (s.before === 0 || s.after === 0) return;
            var worst = Math.max(s.before, s.after);
            if (worst < bestWorst) { bestWorst = worst; best = p; }
          });
          if (best) { pendingPartner = null; ask(best[0], best[1]); }
        } },
      { id: 'reset', label: 'Start over', onClick: function () { pendingPartner = null; reset(); } },
      { spacer: true },
      { id: 'count', readout: true, text: '' }
    ]);

    function draw() {
      var live = aliveCount();
      var done = live === 1;

      /* item row */
      row.render(LABELS.map(function (L, i) {
        var state = null;
        if (i === picked || i === pendingPartner) state = 'active';
        return { id: 'it' + L, val: L, sub: 'item', state: state, label: 'Item ' + L };
      }));

      /* candidate grid */
      gridMount.innerHTML = '';
      var grid = Lab.el('div', 'cand-grid', gridMount);
      ALL.forEach(function (cand, i) {
        var cls = 'cand' + (alive[i] ? (done ? ' is-only' : '') : ' is-dead');
        var node = Lab.el('div', cls, grid);
        cand.forEach(function (L) { Lab.el('span', null, node, L); });
      });

      /* selection state */
      var sel = null;
      if (picked !== null && pendingPartner !== null) {
        sel = { x: LABELS[picked], y: LABELS[pendingPartner] };
      }
      var selText, selWord;
      if (!sel) {
        selWord = 'None yet';
        selText = 'Click two items above to choose a pair to ask about.';
      } else {
        var s = splitFor(sel.x, sel.y);
        selWord = s.before + ' / ' + s.after;
        if (s.before === 0 || s.after === 0) {
          selText = 'Every surviving arrangement already agrees about ' + sel.x + ' and ' + sel.y +
                    '. Asking would cost a question and discard nothing.';
        } else {
          selText = 'Of the ' + live + ' survivors, ' + s.before + ' put ' + sel.x + ' first and ' +
                    s.after + ' put ' + sel.y + ' first. The answer will leave you one of those two ' +
                    'groups — you do not get to choose which.';
        }
      }

      readout.update([
        { ok: null, word: String(asked.length),
          text: asked.length === 0
            ? 'Nothing asked yet, so every arrangement is still in play.'
            : asked.map(function (a) {
                return a.x + (a.xFirst ? ' before ' : ' after ') + a.y;
              }).join(' · ') },
        { ok: done ? true : null, word: live + ' of 24',
          text: done
            ? 'One survivor. Every other arrangement contradicts something you were told, so the ' +
              'answer is settled — and you never saw a value.'
            : live + ' arrangements still agree with everything you have heard. Any one of them ' +
              'could be the truth, so no answer can be given yet.' },
        { ok: null, word: selWord, text: selText }
      ]);

      if (btns.ask) {
        btns.ask.disabled = !sel || done || alreadySettled(sel ? sel.x : 'A', sel ? sel.y : 'B');
      }
      if (btns.best) btns.best.disabled = done;
      if (btns.count) {
        btns.count.textContent = 'asked ' + asked.length + ' · alive ' + live + ' of 24';
      }
      if (note) {
        note.textContent = done
          ? 'Narrowed to one. Press “Start over” to try reaching it in fewer questions.'
          : (picked === null
              ? 'Click an item, then a second, to select a question.'
              : (pendingPartner === null
                  ? LABELS[picked] + ' selected. Click a second item.'
                  : 'Question selected: ' + LABELS[picked] + ' against ' + LABELS[pendingPartner] +
                    '. Read the split below, then ask it.'));
      }
    }

    listeners.push(draw);
    draw();
  }

  /* ---------------------------------------------------------------------
     Figure 4.1 — every question available now, and the split it makes.
     --------------------------------------------------------------------- */

  function fig41() {
    var mount = document.getElementById('l41-bars');
    if (!mount || !window.D || !window.Lab) return;

    var W = 660, ROW = 40, PAD_T = 26, PAD_L = 74, PAD_R = 92;
    var H = PAD_T + PAIRS.length * ROW + 10;

    var svg = D.svg(mount, W, H, {
      maxWidth: 720,
      label: 'Each available comparison and the sizes of the two groups its answers would produce.'
    });
    svg.setAttribute('class', 'lab-svg');
    var layer = D.group(svg);
    var c = D.colors();

    var readout = new Lab.Readout('#l41-readout', [
      { label: 'The most even split available' },
      { label: 'The worst question available' },
      { label: 'The best you could be left with' }
    ], { condHead: 'Across all six questions', whyHead: 'What that means right now' });

    Lab.controls('#l41-controls', [
      { id: 'best', label: 'Ask the most even question', primary: true, onClick: function () {
          var best = null, bestWorst = Infinity;
          PAIRS.forEach(function (p) {
            var s = splitFor(p[0], p[1]);
            if (s.before === 0 || s.after === 0) return;
            var worst = Math.max(s.before, s.after);
            if (worst < bestWorst) { bestWorst = worst; best = p; }
          });
          if (best) ask(best[0], best[1]);
        } },
      { id: 'reset', label: 'Start over', onClick: reset }
    ]);

    function draw() {
      D.clear(layer);
      var live = aliveCount();
      var barW = W - PAD_L - PAD_R;

      var bestWorst = Infinity, worstWorst = 0, anyLive = false;

      PAIRS.forEach(function (p, k) {
        var s = splitFor(p[0], p[1]);
        var y = PAD_T + k * ROW;
        var total = s.before + s.after;
        var settled = s.before === 0 || s.after === 0;
        if (!settled) {
          anyLive = true;
          bestWorst = Math.min(bestWorst, Math.max(s.before, s.after));
          worstWorst = Math.max(worstWorst, Math.max(s.before, s.after));
        }

        D.text(layer, {
          x: PAD_L - 12, y: y + 15, anchor: 'end', kind: 'body', size: 13,
          text: p[0] + ' vs ' + p[1], color: settled ? c.inkFaint : c.ink
        });

        if (total === 0) return;

        /* the bigger group is drawn dark: it is the one you might be handed */
        var big = Math.max(s.before, s.after), small = Math.min(s.before, s.after);
        var bigW = barW * big / live, smallW = barW * small / live;

        D.el('rect', {
          x: PAD_L, y: y, width: Math.max(bigW, 1), height: 22, rx: 2,
          fill: settled ? c.discardedWash : c.activeWash,
          stroke: settled ? c.discarded : c.active, 'stroke-width': 1.2
        }, layer);

        if (small > 0) {
          D.el('rect', {
            x: PAD_L + bigW, y: y, width: Math.max(smallW, 1), height: 22, rx: 2,
            fill: c.paperRaised || c.paper, stroke: c.ruleStrong, 'stroke-width': 1.2
          }, layer);
        }

        D.text(layer, {
          x: PAD_L + barW + 10, y: y + 15, kind: 'caption', size: 11.5,
          color: settled ? c.inkFaint : c.inkSoft,
          text: settled ? 'already settled' : big + ' or ' + small
        });
      });

      D.text(layer, {
        x: PAD_L, y: 14, kind: 'label', size: 10,
        text: 'the group you might be handed → dark'
      });

      var perfect = live / 2;
      readout.update([
        { ok: null, word: anyLive ? String(bestWorst) : '—',
          text: !anyLive
            ? 'Every pair is settled. There is no question left that could discard anything.'
            : 'The most even question leaves at most ' + bestWorst + ' of the ' + live +
              ' survivors. A perfect halving would leave ' + (perfect % 1 ? perfect.toFixed(1) : perfect) +
              ', so this is ' + (bestWorst === Math.ceil(perfect) ? 'as good as the arithmetic allows.'
                                                                  : 'short of perfect.') },
        { ok: null, word: anyLive ? String(worstWorst) : '—',
          text: !anyLive
            ? 'Nothing left to choose between.'
            : 'The worst useful question leaves as many as ' + worstWorst + '. Both questions cost ' +
              'exactly one comparison, which is the entire reason it matters which you pick.' },
        { ok: null, word: live <= 1 ? 'Done' : '≥ ' + Math.ceil(live / 2),
          text: live <= 1
            ? 'One arrangement left. The narrowing is complete.'
            : 'No matter which of the six you ask, at least ' + Math.ceil(live / 2) + ' arrangements ' +
              'can survive — because two groups covering ' + live + ' candidates cannot both be ' +
              'smaller than half of it.' }
      ]);
    }

    listeners.push(draw);
    draw();
  }

  Lab.ready(function () {
    fig21();
    fig41();
  });
})();
