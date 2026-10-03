/* Lesson 4: faithful JavaScript port of Listing 1 (permutation sort), a knowledge tracker,
 * the custom checker for Q3, the Fig. 2 data and the widget wiring.
 * The ports use the Python variable names and control flow. */
(function (root) {
  'use strict';

  /* Listing 1, verbatim (the Stepper displays exactly this text). */
  const LISTING1 = [
    'from itertools import permutations',
    '',
    '',
    'def is_sorted(b):',
    '    for i in range(len(b) - 1):',
    '        if b[i + 1] < b[i]:',
    '            return False',
    '    return True',
    '',
    '',
    'def permutation_sort(a):',
    '    for candidate in permutations(a):',
    '        if is_sorted(candidate):',
    '            return list(candidate)'
  ].join('\n');

  /* itertools.permutations(a): tuples of a's elements, lexicographic over positions. */
  function* permutations(a) {
    const n = a.length;
    const used = new Array(n).fill(false);
    const pos = [];
    function* rec() {
      if (pos.length === n) { yield pos.map(function (p) { return a[p]; }); return; }
      for (let p = 0; p < n; p++) {
        if (!used[p]) {
          used[p] = true; pos.push(p);
          yield* rec();
          pos.pop(); used[p] = false;
        }
      }
    }
    yield* rec();
  }

  function tupleStr(c) {
    if (c.length === 1) return '(' + c[0] + ',)';
    return '(' + c.join(', ') + ')';
  }

  /* Number of linear extensions of the strict partial order lt (n x n booleans), by DP over subsets. */
  function countExtensions(n, lt) {
    const pm = [];
    for (let x = 0; x < n; x++) { let m = 0; for (let y = 0; y < n; y++) if (lt[y][x]) m |= (1 << y); pm.push(m); }
    const f = new Float64Array(1 << n);
    f[0] = 1;
    for (let mask = 0; mask < (1 << n); mask++) {
      if (!f[mask]) continue;
      for (let e = 0; e < n; e++) {
        if (!(mask & (1 << e)) && (pm[e] & mask) === pm[e]) f[mask | (1 << e)] += f[mask];
      }
    }
    return f[(1 << n) - 1];
  }

  /* Runs Listing 1 (both functions) on a. With wantSteps, also records one Stepper step per executed
   * line (line numbers are those of Listing 1) and the knowledge state after each step.
   * Returns {out, candidates, comparisons, log, steps}; log items are
   * [b[i+1], b[i], answer, status|null, e|null] for each comparison. */
  function run(a, wantSteps) {
    const n = a.length;
    const distinct = new Set(a).size === n;
    const idx = new Map();
    a.forEach(function (v, k) { idx.set(v, k); });
    let comparisons = 0, candidates = 0, wasted = 0;
    const log = [], steps = [];
    let obs = [];                       // new relations [lo, hi] (input indices), in order; shared between steps
    const lt = [];
    for (let r = 0; r < n; r++) lt.push(new Array(n).fill(false));
    const asked = new Set();
    let last = null;

    function chainFor(p, q) {           // a path p -> q through the observed relations
      const prev = {}, queue = [p], seen = {}; seen[p] = true;
      while (queue.length) {
        const x = queue.shift();
        if (x === q) break;
        for (let k = 0; k < obs.length; k++) {
          if (obs[k][0] === x && !seen[obs[k][1]]) { seen[obs[k][1]] = true; prev[obs[k][1]] = x; queue.push(obs[k][1]); }
        }
      }
      const path = [q]; let c = q;
      while (c !== p) { c = prev[c]; path.unshift(c); }
      return path.map(function (v) { return a[v]; });
    }
    /* "Is x < y?" answered ans: classify it against what is known, then record it. */
    function learn(x, y, ans) {
      if (!distinct) return { status: null, e: null };
      const lo = ans ? x : y, hi = ans ? y : x;
      const p = idx.get(lo), q = idx.get(hi);
      const key = Math.min(p, q) + ',' + Math.max(p, q);
      let status, chain = null;
      if (asked.has(key)) status = 'known';
      else if (lt[p][q]) { status = 'implied'; chain = chainFor(p, q); }
      else {
        status = 'new';
        for (let u = 0; u < n; u++) {
          if (u === p || lt[u][p]) for (let v = 0; v < n; v++) if (v === q || lt[q][v]) lt[u][v] = true;
        }
        obs = obs.concat([[p, q]]);
      }
      asked.add(key);
      if (status !== 'new') wasted += 1;
      last = { k: comparisons, status: status, lo: lo, hi: hi, chain: chain };
      return { status: status, e: n <= 8 ? countExtensions(n, lt) : null };
    }

    function marksFor(c, upTo, red) {   // gray: cells 0..upTo; red: given indices
      const m = {};
      for (let k = 0; k <= upTo; k++) m[k] = 'sorted';
      (red || []).forEach(function (k) { m[k] = 'compare'; });
      return m;
    }
    function emit(line, o) {
      if (!wantSteps) return;
      o = o || {};
      const c = o.cand || [];
      steps.push({
        line: line,
        arr: a.slice(),
        arrays: [{ label: 'candidate', values: c.slice(), marks: o.cmarks || {} }],
        vars: { candidate: o.cand ? tupleStr(o.cand) : null, i: o.i === undefined ? null : o.i },
        counters: { comparisons: comparisons, candidates: candidates },
        msg: o.msg || '',
        know: { rels: obs, wasted: wasted, last: last, fresh: !!o.fresh }
      });
    }

    /* ---- def is_sorted(b) ---- */
    function is_sorted(b) {
      let i = null;
      for (let it = 0; ; it++) {                                   // for i in range(len(b) - 1):
        if (it >= b.length - 1) {                                  //   (range exhausted)
          emit(5, { cand: b, i: i, cmarks: marksFor(b, b.length - 1), msg: 'The loop is over: no neighbour pair is left to check.' });
          break;
        }
        i = it;
        emit(5, { cand: b, i: i, cmarks: i >= 1 ? marksFor(b, i) : {}, msg: '<code>i = ' + i + '</code>: next the pair at positions ' + i + ' and ' + (i + 1) + '.' });
        const answer = b[i + 1] < b[i];                            //   if b[i + 1] < b[i]:
        comparisons += 1;
        const res = learn(b[i + 1], b[i], answer);
        log.push([b[i + 1], b[i], answer, res.status, res.e]);
        emit(6, {
          cand: b, i: i, fresh: true,
          cmarks: marksFor(b, i - 1, [i, i + 1]),
          msg: 'Is ' + b[i + 1] + ' &lt; ' + b[i] + '? ' + (answer ? 'Yes: out of order.' : 'No.')
        });
        if (answer) {
          emit(7, { cand: b, i: i, cmarks: marksFor(b, i - 1, [i, i + 1]), msg: 'Return <code>False</code>: this candidate fails the check.' });
          return false;                                            //     return False
        }
      }
      emit(8, { cand: b, i: i, cmarks: marksFor(b, b.length - 1), msg: 'Return <code>True</code>: every neighbour pair is in order.' });
      return true;                                                 // return True
    }

    /* ---- def permutation_sort(a) ---- */
    function permutation_sort(a) {
      for (const candidate of permutations(a)) {                   // for candidate in permutations(a):
        candidates += 1;
        emit(12, { cand: candidate, msg: 'Next candidate: <code>' + tupleStr(candidate) + '</code>. This is candidate number ' + candidates + '.' });
        emit(13, { cand: candidate, msg: 'Call <code>is_sorted(candidate)</code>.' });
        if (is_sorted(candidate)) {                                //     if is_sorted(candidate):
          const result = candidate.slice();
          emit(14, {
            cand: candidate, cmarks: marksFor(candidate, candidate.length - 1),
            msg: 'Return <code>list(candidate)</code> = [' + result.join(', ') + ']: ' + candidates + ' candidates, ' + comparisons + ' comparisons.'
          });
          return result;                                           //         return list(candidate)
        }
      }
      return undefined;                                            // falls off the end: None
    }

    const out = permutation_sort(a);
    return { out: out, candidates: candidates, comparisons: comparisons, log: log, steps: steps };
  }

  function trace(a) { return run(a, true).steps; }

  /* Positions of the sorted arrangement (distinct keys): the tuple permutations yields it as. */
  function sortedPositions(a) {
    return a.map(function (v, k) { return k; }).sort(function (p, q) { return a[p] - a[q]; });
  }

  /* Q3 checker. */
  function checkSevenCandidates(text) {
    const toks = String(text === null || text === undefined ? '' : text).replace(/[−–]/g, '-').trim().split(/[\s,;]+/).filter(Boolean);
    for (let k = 0; k < toks.length; k++) {
      if (!/^[+-]?\d+$/.test(toks[k])) return { ok: false, html: '“' + toks[k].replace(/[<>&]/g, '') + '” is not a whole number. Enter 4 distinct integers, separated by spaces or commas.' };
    }
    if (toks.length !== 4) return { ok: false, html: 'Enter exactly 4 numbers; you gave ' + toks.length + '.' };
    const vals = toks.map(Number);
    for (let k = 0; k < 4; k++) {
      if (vals.indexOf(vals[k]) !== k) return { ok: false, html: 'The numbers must be distinct: ' + vals[k] + ' appears more than once.' };
    }
    const r = run(vals, false);
    const pos = sortedPositions(vals);
    const head = 'Examined ' + r.candidates + ' candidates and made ' + r.comparisons + ' comparisons. ';
    if (r.candidates === 7) {
      return { ok: true, html: head + 'The sorted arrangement takes positions (' + pos.join(', ') + '), the 7th tuple in lexicographic order: after the six that start with 0.' };
    }
    return { ok: false, html: head + 'Positions of the sorted arrangement: (' + pos.join(', ') + '), which is number ' + r.candidates + ' in lexicographic order. Which position tuple is 7th?' };
  }

  /* Fig. 2 data, computed by verify/lesson-04/plot_data.py:
   * [n, mean, min, max] over 200 samples, rng = random.Random(4000 + n), rng.sample(range(100), n). */
  const PLOT = {
    T: [[1, 0], [2, 2], [3, 9], [4, 40], [5, 205], [6, 1236], [7, 8659], [8, 69280]],
    pairs: [[1, 0], [2, 1], [3, 3], [4, 6], [5, 10], [6, 15], [7, 21], [8, 28]],
    random: [[1, 0.0, 0, 0], [2, 1.5, 1, 2], [3, 5.41, 2, 9], [4, 21.97, 3, 40], [5, 100.53, 4, 205], [6, 634.14, 5, 1219], [7, 4406.42, 114, 8569], [8, 34337.85, 243, 69186]]
  };

  const L04 = { LISTING1: LISTING1, permutations: permutations, run: run, trace: trace, tupleStr: tupleStr,
    sortedPositions: sortedPositions, checkSevenCandidates: checkSevenCandidates, PLOT: PLOT };

  if (typeof module !== 'undefined' && module.exports) module.exports = L04;
  else root.L04 = L04;

  /* ------------------------------------------------------------------ widget wiring */
  if (typeof document === 'undefined') return;

  function statusHtml(know) {
    const nothing = know.wasted;
    const tail = ' <span class="fig1-waste">Comparisons that taught nothing: <strong>' + nothing + '</strong></span>';
    const L = know.last;
    if (!L) return 'No comparison yet.' + tail;
    const label = know.fresh ? 'This comparison' : 'Last comparison';
    let kind;
    if (L.status === 'new') kind = '<strong>new</strong>: it adds ' + L.lo + ' ≺ ' + L.hi + ' to what is known.';
    else if (L.status === 'known') kind = '<strong>already known</strong>: this pair was asked before.';
    else kind = '<strong>implied by transitivity</strong>: ' + L.chain.join(' ≺ ') + ' was already known.';
    return label + ' (number ' + L.k + '): ' + kind + tail;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const stepEl = document.getElementById('fig1-stepper');
    const pvEl = document.getElementById('fig1-poset');
    const statusEl = document.getElementById('fig1-status');
    if (stepEl && pvEl && statusEl && root.Course) {
      let pv = null, lastSteps = null;
      const stepper = new root.Course.Stepper(stepEl, {
        code: LISTING1,
        trace: trace,
        input: [3, 1, 2],
        presets: [
          { label: '[3, 1, 2]', values: [3, 1, 2] },
          { label: '[2, 3, 1]', values: [2, 3, 1] },
          { label: 'Sorted [1, 2, 3, 4]', values: [1, 2, 3, 4] },
          { label: 'Reversed (worst case)', values: [4, 3, 2, 1] },
          { label: 'Random 5', make: function (rng) {
            const pool = []; for (let v = 1; v <= 20; v++) pool.push(v);
            for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); const t = pool[k]; pool[k] = pool[j]; pool[j] = t; }
            return pool.slice(0, 5);
          } }
        ],
        maxN: 6, allowDuplicates: false, min: 0, max: 99,
        duplicateReason: 'This view assumes distinct values (Assumption A1). The algorithm itself handles duplicates; see §04.',
        capReason: '6 elements already means up to 720 candidates and 1236 comparisons; 7 would mean 5040 candidates.',
        counters: [{ key: 'comparisons', label: 'Comparisons' }, { key: 'candidates', label: 'Candidates' }],
        vars: ['candidate', 'i'],
        legend: [{ kind: 'compare', label: 'Compared' }, { kind: 'sorted', label: 'Passed so far' }],
        label: 'Permutation sort stepper. Space plays or pauses, left and right arrows step, Home resets.',
        onStep: function (st, index, steps) {
          if (steps !== lastSteps) {            // new input: rebuild the knowledge view for its labels
            lastSteps = steps;
            pv = new root.Course.PosetView(pvEl, { labels: st.arr.map(String), relations: [], interactive: false, showCount: true, showExtensions: 24 });
          }
          pv.set(st.know.rels);                 // rebuilt from the step's history, never incrementally
          statusEl.innerHTML = statusHtml(st.know);
        }
      });
      stepper.preset(0);
    }

    const plotEl = document.getElementById('fig2-plot');
    if (plotEl && root.Course) {
      new root.Course.Plot(plotEl, {
        xLabel: 'n', yLabel: 'comparisons', logY: true,
        series: [
          { label: 'T(n) exact', type: 'line', data: PLOT.T, tag: 'proof' },
          { label: 'n(n−1)/2', type: 'dashed', data: PLOT.pairs, tag: 'reference' },
          { label: 'random inputs', type: 'points', data: PLOT.random.map(function (r) { return [r[0], r[1]]; }),
            ranges: PLOT.random.map(function (r) { return [r[0], r[2], r[3]]; }), tag: 'empirical' }
        ]
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
