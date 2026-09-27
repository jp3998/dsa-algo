/* ============================================================================
   Lesson 01 — interactive figures.

     Figure 2.1  a cyclic relation: every arrangement fails
     Figure 4.1  a partial order: many arrangements succeed, which is worse
     Figure 6.1  a tie: the row exists but stops being the only one

   All three use the same interaction — click two items to swap them — so the
   reader learns the control once and can then attend to what differs.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     A shared arrangement lab.

       items        [{ id, val, sub, state }]
       checks       [{ label, test(order) -> { ok, text } }]
       validWhen    order -> boolean   (counts as a discovered valid row)
       total        how many arrangements exist, for the counter
       cycleLabel   label of the "next arrangement" button, or null
     --------------------------------------------------------------------- */

  function ArrangementLab(cfg) {
    var rowMount = document.querySelector(cfg.rowSel);
    if (!rowMount || !window.Lab) return null;

    var order = cfg.items.slice();
    var selected = null;
    var seenValid = {};
    var tried = {};
    var note = cfg.noteSel ? document.querySelector(cfg.noteSel) : null;

    function key(o) { return o.map(function (x) { return x.id; }).join('|'); }

    /* All arrangements, so "next" can walk them in a fixed order. */
    function permutations(list) {
      if (list.length <= 1) return [list];
      var out = [];
      list.forEach(function (item, i) {
        var rest = list.slice(0, i).concat(list.slice(i + 1));
        permutations(rest).forEach(function (p) { out.push([item].concat(p)); });
      });
      return out;
    }
    var all = permutations(cfg.items.slice());
    var cursor = 0;

    var row = new Lab.CellRow(cfg.rowSel, {
      items: [],
      clickable: true,
      onClick: function (item, i) {
        if (selected === null) selected = i;
        else if (selected === i) selected = null;
        else {
          var t = order[selected]; order[selected] = order[i]; order[i] = t;
          selected = null;
        }
        draw();
      }
    });

    var readoutRows = cfg.checks.map(function (c) { return { label: c.label }; });
    readoutRows.push({ label: cfg.counterLabel || 'Valid arrangements found' });
    var readout = new Lab.Readout(cfg.readoutSel, readoutRows,
      { condHead: 'What a row has to promise', whyHead: 'What your arrangement does' });

    var defs = [];
    if (cfg.cycleLabel) {
      defs.push({ id: 'next', label: cfg.cycleLabel, primary: true, onClick: function () {
        cursor = (cursor + 1) % all.length;
        order = all[cursor].slice();
        selected = null;
        draw();
      } });
    }
    defs.push({ id: 'shuffle', label: 'Shuffle', onClick: function () {
      order = Lab.shuffled(order); selected = null; draw();
    } });
    defs.push({ spacer: true });
    defs.push({ id: 'count', readout: true, text: '' });
    var btns = Lab.controls(cfg.controlsSel, defs);

    function draw() {
      tried[key(order)] = true;
      var results = cfg.checks.map(function (c) { return c.test(order); });
      var valid = results.every(function (r) { return r.ok; });
      if (valid) seenValid[key(order)] = true;

      var badIndex = -1;
      for (var i = 0; i < results.length; i++) {
        if (!results[i].ok && results[i].mark !== undefined) { badIndex = i; break; }
      }
      var marked = badIndex >= 0 ? results[badIndex].mark : [];

      row.selected = selected;
      row.render(order.map(function (item, i) {
        return {
          id: item.id,
          val: item.val,
          sub: item.sub,
          state: marked.indexOf(i) >= 0 ? 'active' : (valid ? 'settled' : null),
          label: item.val + ' in position ' + (i + 1)
        };
      }));

      var found = Object.keys(seenValid).length;
      var triedN = Object.keys(tried).length;

      var states = results.map(function (r) { return { ok: r.ok, text: r.text }; });
      states.push({
        ok: found > 0 ? true : null,
        word: cfg.counterWord(found),
        text: cfg.counterText(found, triedN, cfg.total)
      });
      readout.update(states);

      if (btns.count) {
        btns.count.textContent = 'tried ' + triedN + ' of ' + cfg.total + ' arrangements';
      }
      if (note) {
        note.textContent = selected === null
          ? 'Click one to pick it up, then click another to swap them.'
          : '“' + order[selected].val + '” is picked up. Click another to swap, or the same one to cancel.';
      }
    }

    draw();
    return { draw: draw };
  }

  /* ---------------------------------------------------------------------
     Figure 2.1 — rock, paper, scissors. The cycle diagram, then the lab.
     --------------------------------------------------------------------- */

  function beatsRPS(a, b) {
    return (a === 'Rock' && b === 'Scissors') ||
           (a === 'Scissors' && b === 'Paper') ||
           (a === 'Paper' && b === 'Rock');
  }

  function cycleDiagram() {
    var mount = document.getElementById('mount-cycle');
    if (!mount || !window.D) return;

    var W = 420, H = 186, R = 34;
    var svg = D.svg(mount, W, H, {
      maxWidth: 440,
      label: 'Rock beats scissors, scissors beats paper, paper beats rock.'
    });
    svg.setAttribute('class', 'lab-svg');
    var c = D.colors();

    var node = {
      Rock:     { x: 210, y: 46 },
      Scissors: { x: 282, y: 140 },
      Paper:    { x: 138, y: 140 }
    };

    function edge(from, to) {
      var a = node[from], b = node[to];
      var dx = b.x - a.x, dy = b.y - a.y;
      var len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len, pad = R + 7;
      D.arrow(svg, {
        x1: a.x + ux * pad, y1: a.y + uy * pad,
        x2: b.x - ux * pad, y2: b.y - uy * pad,
        color: c.ink, width: 1.4, curve: 13
      });
    }

    edge('Rock', 'Scissors');
    edge('Scissors', 'Paper');
    edge('Paper', 'Rock');

    Object.keys(node).forEach(function (k) {
      D.el('circle', {
        cx: node[k].x, cy: node[k].y, r: R,
        fill: c.paperRaised || c.paper, stroke: c.ruleStrong, 'stroke-width': 1.4
      }, svg);
      D.text(svg, {
        x: node[k].x, y: node[k].y, text: k,
        anchor: 'middle', baseline: 'central', kind: 'body', size: 12.5
      });
    });
  }

  function fig21() {
    cycleDiagram();

    ArrangementLab({
      rowSel: '#l21-row',
      controlsSel: '#l21-controls',
      readoutSel: '#l21-readout',
      noteSel: '#l21-note',
      total: 6,
      cycleLabel: 'Try the next arrangement',
      counterLabel: 'Arrangements that worked',
      counterWord: function (found) { return found === 0 ? 'None' : String(found); },
      items: [
        { id: 'R', val: 'Rock' },
        { id: 'P', val: 'Paper' },
        { id: 'S', val: 'Scissors' }
      ],
      checks: [{
        label: 'Every earlier item beats every later one',
        test: function (o) {
          for (var i = 0; i < o.length; i++) {
            for (var j = i + 1; j < o.length; j++) {
              if (!beatsRPS(o[i].val, o[j].val)) {
                return {
                  ok: false, mark: [i, j],
                  text: o[j].val + ' beats ' + o[i].val + ', so ' + o[j].val +
                        ' should have come first — but it sits behind.'
                };
              }
            }
          }
          return { ok: true, text: 'Every pair agrees with the relation.' };
        }
      }],
      counterText: function (found, tried, total) {
        if (found > 0) return 'You found one. That should not have been possible.';
        if (tried >= total) {
          return 'All ' + total + ' arrangements tried, none worked. Not a failure of imagination — ' +
                 'there is nothing left to try.';
        }
        return 'Nothing yet, after ' + tried + ' of the ' + total + ' possible arrangements. ' +
               (total - tried) + ' left to rule out.';
      }
    });
  }

  /* ---------------------------------------------------------------------
     Figure 4.1 — getting dressed. Two constraints, eight valid rows.
     --------------------------------------------------------------------- */

  function constraintDiagram() {
    var mount = document.getElementById('mount-partial');
    if (!mount || !window.D) return;

    var W = 440, H = 158;
    var svg = D.svg(mount, W, H, {
      maxWidth: 460,
      label: 'Socks before shoes, and shirt before jacket. Nothing relates the two pairs.'
    });
    svg.setAttribute('class', 'lab-svg');
    var c = D.colors();

    var BW = 104, BH = 36;
    D.arrow(svg, { x1: 122, y1: 66, x2: 122, y2: 106, color: c.ink, width: 1.3 });
    D.arrow(svg, { x1: 300, y1: 66, x2: 300, y2: 106, color: c.ink, width: 1.3 });

    D.box(svg, { x: 70,  y: 28,  w: BW, h: BH, label: 'socks',  fontSize: 13.5, rx: 3 });
    D.box(svg, { x: 70,  y: 108, w: BW, h: BH, label: 'shoes',  fontSize: 13.5, rx: 3 });
    D.box(svg, { x: 248, y: 28,  w: BW, h: BH, label: 'shirt',  fontSize: 13.5, rx: 3 });
    D.box(svg, { x: 248, y: 108, w: BW, h: BH, label: 'jacket', fontSize: 13.5, rx: 3 });

    D.text(svg, {
      x: 220, y: 90, text: 'no link', kind: 'caption', anchor: 'middle', size: 11
    });
    D.line(svg, { x1: 180, y1: 84, x2: 202, y2: 84, color: c.rule, dashed: true });
    D.line(svg, { x1: 238, y1: 84, x2: 260, y2: 84, color: c.rule, dashed: true });
  }

  function fig41() {
    constraintDiagram();

    function before(o, a, b) { return o.findIndex(function (x) { return x.id === a; })
                                    < o.findIndex(function (x) { return x.id === b; }); }
    function markPair(o, a, b) {
      return [o.findIndex(function (x) { return x.id === a; }),
              o.findIndex(function (x) { return x.id === b; })];
    }

    ArrangementLab({
      rowSel: '#l41-row',
      controlsSel: '#l41-controls',
      readoutSel: '#l41-readout',
      noteSel: '#l41-note',
      total: 24,
      cycleLabel: 'Try the next arrangement',
      counterLabel: 'Different valid rows you have found',
      counterWord: function (found) { return found + ' of 8'; },
      items: [
        { id: 'socks',  val: 'socks' },
        { id: 'shoes',  val: 'shoes' },
        { id: 'shirt',  val: 'shirt' },
        { id: 'jacket', val: 'jacket' }
      ],
      checks: [
        {
          label: 'Socks before shoes',
          test: function (o) {
            return before(o, 'socks', 'shoes')
              ? { ok: true, text: 'Socks go on first, as required.' }
              : { ok: false, mark: markPair(o, 'socks', 'shoes'),
                  text: 'Shoes are on before the socks, which the constraint forbids.' };
          }
        },
        {
          label: 'Shirt before jacket',
          test: function (o) {
            return before(o, 'shirt', 'jacket')
              ? { ok: true, text: 'Shirt goes on first, as required.' }
              : { ok: false, mark: markPair(o, 'shirt', 'jacket'),
                  text: 'The jacket is on before the shirt, which the constraint forbids.' };
          }
        }
      ],
      counterText: function (found, tried, total) {
        if (found >= 8) {
          return 'All eight. Every one of them satisfies the relation completely, and nothing in ' +
                 'the relation prefers any of them over the others.';
        }
        return found + ' of the 8 valid rows found so far, out of ' + total +
               ' arrangements in total. Keep going — the trouble is not that they are hard to ' +
               'find, it is that there are so many.';
      }
    });
  }

  /* ---------------------------------------------------------------------
     Figure 6.1 — a tie, and the loss of uniqueness.
     --------------------------------------------------------------------- */

  function fig61() {
    if (!document.getElementById('l61-row') || !window.Lab) return;

    var PEOPLE = [
      { id: 'ana', name: 'Ana', h: 158 },
      { id: 'bo',  name: 'Bo',  h: 167 },
      { id: 'cy',  name: 'Cy',  h: 167 },
      { id: 'dee', name: 'Dee', h: 181 }
    ];

    var order = ['ana', 'bo', 'cy', 'dee'];
    var note = document.getElementById('l61-note');

    function rec(id) {
      for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i].id === id) return PEOPLE[i];
      return null;
    }

    var row = new Lab.CellRow('#l61-row', { items: [] });

    var readout = new Lab.Readout('#l61-readout', [
      { label: 'Every earlier person is no taller than every later one' },
      { label: 'The relation determines which row this is' }
    ], { condHead: 'What a row has to promise', whyHead: 'What the relation delivers' });

    Lab.controls('#l61-controls', [
      { id: 'swap', label: 'Swap the two tied people', primary: true, onClick: function () {
          var i = order.indexOf('bo'), j = order.indexOf('cy');
          var t = order[i]; order[i] = order[j]; order[j] = t;
          draw();
        } }
    ]);

    function draw() {
      var people = order.map(rec);
      row.render(people.map(function (p, i) {
        return {
          id: p.id, val: p.name, sub: p.h + ' cm',
          state: p.h === 167 ? 'active' : null,
          label: p.name + ', ' + p.h + ' centimetres, position ' + (i + 1)
        };
      }));

      var boFirst = order.indexOf('bo') < order.indexOf('cy');

      readout.update([
        { ok: true,
          text: 'The heights read 158, 167, 167, 181. The two tied people can sit in either order ' +
                'and this stays true, because neither is taller than the other.' },
        { ok: false, word: 'No longer',
          text: boFirst
            ? 'Bo sits before Cy, but nothing made that choice. Swap them and the row is just as ' +
              'valid — so the relation is not picking out one row any more. It is picking out two.'
            : 'Cy now sits before Bo, and the relation reports no difference. Both arrangements are ' +
              'correct, which is precisely what the proof in Section 5 ruled out when ties were absent.' }
      ]);

      if (note) {
        note.textContent = boFirst
          ? 'Bo sits before Cy.'
          : 'Cy sits before Bo. Everything else is unchanged.';
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
