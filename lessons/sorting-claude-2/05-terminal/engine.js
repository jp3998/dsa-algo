/* engine.js — pure logic for theme 05 "Plain text".
   No DOM here except where noted; keeps the math/algorithm code testable under Node. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SC = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SC = {};

  // ---------- seeded PRNG (mulberry32) ----------
  SC.mulberry32 = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  SC.newSeed = function () {
    return (Math.random() * 4294967296) >>> 0;
  };

  // Fisher-Yates using a supplied rng() -> [0,1)
  SC.shuffle = function (arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  SC.randomPermutation = function (n, rng) {
    var a = [];
    for (var i = 1; i <= n; i++) a.push(i);
    return SC.shuffle(a, rng);
  };

  // ---------- inversions ----------
  SC.countInversions = function (arr) {
    var n = arr.length, c = 0;
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        if (arr[i] > arr[j]) c++;
      }
    }
    return c;
  };

  SC.listInversions = function (arr) {
    var n = arr.length, out = [];
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        if (arr[i] > arr[j]) out.push([i, j]);
      }
    }
    return out;
  };

  // ---------- Python source texts (exact) ----------
  SC.PY = {
    insertion: {
      lines: [
        'def insertion_sort(a):',
        '    n = len(a)',
        '    for i in range(1, n):',
        '        # invariant: a[0:i] is sorted',
        '        j = i',
        '        while j > 0 and a[j - 1] > a[j]:',
        '            a[j - 1], a[j] = a[j], a[j - 1]  # one inversion fewer',
        '            j -= 1',
        '    return a'
      ]
    },
    buggy: {
      lines: [
        'def insertion_sort(a):',
        '    n = len(a)',
        '    for i in range(1, n):',
        '        # invariant: a[0:i] is sorted',
        '        j = i',
        '        while j >= 0 and a[j - 1] > a[j]:',
        '            a[j - 1], a[j] = a[j], a[j - 1]',
        '            j -= 1',
        '    return a'
      ],
      bugLine: 6
    }
  };
  SC.PY.insertion.code = SC.PY.insertion.lines.join('\n');
  SC.PY.buggy.code = SC.PY.buggy.lines.join('\n');

  // Hand-tokenized syntax highlighting (fixed, tiny corpus — more reliable than a regex pass).
  SC.PY.insertion.highlighted = [
    '<span class="tok-kw">def</span> <span class="tok-def">insertion_sort</span>(a):',
    '    n = <span class="tok-kw">len</span>(a)',
    '    <span class="tok-kw">for</span> i <span class="tok-kw">in</span> <span class="tok-kw">range</span>(<span class="tok-num">1</span>, n):',
    '        <span class="tok-com"># invariant: a[0:i] is sorted</span>',
    '        j = i',
    '        <span class="tok-kw">while</span> j &gt; <span class="tok-num">0</span> <span class="tok-kw">and</span> a[j - <span class="tok-num">1</span>] &gt; a[j]:',
    '            a[j - <span class="tok-num">1</span>], a[j] = a[j], a[j - <span class="tok-num">1</span>]  <span class="tok-com"># one inversion fewer</span>',
    '            j -= <span class="tok-num">1</span>',
    '    <span class="tok-kw">return</span> a'
  ];
  SC.PY.buggy.highlighted = [
    '<span class="tok-kw">def</span> <span class="tok-def">insertion_sort</span>(a):',
    '    n = <span class="tok-kw">len</span>(a)',
    '    <span class="tok-kw">for</span> i <span class="tok-kw">in</span> <span class="tok-kw">range</span>(<span class="tok-num">1</span>, n):',
    '        <span class="tok-com"># invariant: a[0:i] is sorted</span>',
    '        j = i',
    '        <span class="tok-kw">while</span> j &gt;= <span class="tok-num">0</span> <span class="tok-kw">and</span> a[j - <span class="tok-num">1</span>] &gt; a[j]:',
    '            a[j - <span class="tok-num">1</span>], a[j] = a[j], a[j - <span class="tok-num">1</span>]',
    '            j -= <span class="tok-num">1</span>',
    '    <span class="tok-kw">return</span> a'
  ];

  // ---------- faithful buggy port (supports Python negative indexing) ----------
  function pyGet(a, idx) { return idx < 0 ? a[a.length + idx] : a[idx]; }
  function pySet(a, idx, val) { if (idx < 0) a[a.length + idx] = val; else a[idx] = val; }

  SC.buggyInsertion = function (arr) {
    var a = arr.slice();
    var n = a.length;
    for (var i = 1; i < n; i++) {
      var j = i;
      while (j >= 0 && pyGet(a, j - 1) > pyGet(a, j)) {
        var left = pyGet(a, j - 1), right = pyGet(a, j);
        pySet(a, j - 1, right);
        pySet(a, j, left);
        j -= 1;
      }
    }
    return a;
  };

  // ---------- comparisons-only (fast, for the cost plot) ----------
  SC.countComparisons = function (arr) {
    var a = arr.slice();
    var n = a.length, comparisons = 0, swaps = 0;
    for (var i = 1; i < n; i++) {
      var j = i;
      while (j > 0) {
        comparisons++;
        if (a[j - 1] > a[j]) {
          var t = a[j - 1]; a[j - 1] = a[j]; a[j] = t;
          swaps++;
          j -= 1;
        } else {
          break;
        }
      }
    }
    return { comparisons: comparisons, swaps: swaps };
  };

  // ---------- full trace with step-by-step snapshots (for the stepper) ----------
  // region per cell: 'sorted' | 'key' | 'rest'
  SC.insertionTrace = function (initial) {
    var a = initial.slice();
    var n = a.length;
    var steps = [];
    var comparisons = 0, swaps = 0;

    function regions(i, j, haveKey) {
      var r = new Array(n).fill('rest');
      if (!haveKey) {
        for (var k = 0; k < i; k++) r[k] = 'sorted';
        for (k = i; k < n; k++) r[k] = k === i ? 'rest' : 'rest';
        return r;
      }
      for (var k = 0; k <= i; k++) r[k] = (k === j) ? 'key' : 'sorted';
      for (k = i + 1; k < n; k++) r[k] = 'rest';
      return r;
    }

    function snapshot(extra) {
      var s = {
        array: a.slice(),
        comparisons: comparisons,
        swaps: swaps,
        inversions: SC.countInversions(a)
      };
      for (var k in extra) s[k] = extra[k];
      return s;
    }

    // start
    var startRegions = new Array(n).fill('rest');
    startRegions[0] = 'sorted';
    steps.push(snapshot({
      kind: 'start', line: 2, i: null, j: null,
      regions: startRegions,
      message: 'n = ' + n + '. The prefix a[0:1] = [' + a[0] + '] is sorted on its own.'
    }));

    for (var i = 1; i < n; i++) {
      var j = i;
      steps.push(snapshot({
        kind: 'outer', line: 3, i: i, j: j,
        regions: regions(i, j, true),
        message: 'i = ' + i + ': insert the key a[' + i + '] = ' + a[i] + ' into the sorted prefix a[0:' + i + '].'
      }));

      while (true) {
        if (j === 0) {
          steps.push(snapshot({
            kind: 'front', line: 6, i: i, j: j,
            regions: regions(i, j, true),
            message: 'j = 0: the key reached the front, so `j > 0` is false and there’s no comparison.'
          }));
          break;
        }
        var left = a[j - 1], right = a[j];
        var holds = left > right;
        comparisons++;
        steps.push(snapshot({
          kind: 'compare', line: 6, i: i, j: j,
          regions: regions(i, j, true),
          compareIdx: [j - 1, j],
          relation: holds ? [right, left] : [left, right],
          message: 'Is a[' + (j - 1) + '] = ' + left + ' > a[' + j + '] = ' + right + '? ' +
            (holds ? 'Yes, so swap.' : 'No, so the key is in place.')
        }));
        if (!holds) break;
        // swap
        a[j - 1] = right; a[j] = left;
        swaps++;
        steps.push(snapshot({
          kind: 'swap', line: 7, i: i, j: j,
          regions: regions(i, j - 1, true),
          compareIdx: [j - 1, j],
          message: 'Swap them: one inversion fewer (' + SC.countInversions(a) + ' left).'
        }));
        j -= 1;
        steps.push(snapshot({
          kind: 'dec', line: 8, i: i, j: j,
          regions: regions(i, j, true),
          message: 'j = ' + j + '.'
        }));
      }
    }

    steps.push(snapshot({
      kind: 'done', line: 9, i: n, j: null,
      regions: new Array(n).fill('sorted'),
      message: 'Done: ' + comparisons + ' comparisons, ' + swaps + ' swaps, ' + SC.countInversions(a) + ' inversions left.'
    }));

    return { steps: steps, comparisons: comparisons, swaps: swaps, finalArray: a.slice() };
  };

  // relations discovered, in order (for the knowledge view) — derived from compare steps
  SC.relationsFromTrace = function (trace) {
    var out = [];
    trace.steps.forEach(function (s) {
      if (s.kind === 'compare') out.push(s.relation.slice());
    });
    return out;
  };

  // ---------- exact cost formulas ----------
  SC.harmonic = function (n) {
    var h = 0;
    for (var i = 1; i <= n; i++) h += 1 / i;
    return h;
  };
  SC.bestC = function (n) { return n - 1; };
  SC.avgC = function (n) { return n * (n - 1) / 4 + n - SC.harmonic(n); };
  SC.worstC = function (n) { return n * (n - 1) / 2; };

  // ---------- cost-plot sampling ----------
  SC.sampleCosts = function (seed) {
    var rng = SC.mulberry32(seed);
    var ns = [];
    for (var n = 2; n <= 40; n += 2) ns.push(n);
    var reps = 200;
    return ns.map(function (n) {
      var vals = [];
      for (var r = 0; r < reps; r++) {
        var perm = SC.randomPermutation(n, rng);
        vals.push(SC.countComparisons(perm).comparisons);
      }
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      var mean = sum / vals.length;
      var min = Math.min.apply(null, vals);
      var max = Math.max.apply(null, vals);
      return { n: n, mean: mean, min: min, max: max };
    });
  };

  // ---------- knowledge view: linear extensions + Hasse structure ----------
  function permutations(values) {
    if (values.length <= 1) return [values];
    var out = [];
    for (var i = 0; i < values.length; i++) {
      var rest = values.slice(0, i).concat(values.slice(i + 1));
      permutations(rest).forEach(function (p) { out.push([values[i]].concat(p)); });
    }
    return out;
  }

  // consistent(perm, rels): perm is an array giving a total order (perm[0] smallest ... perm[n-1] largest)
  function consistent(perm, rels) {
    var pos = {};
    perm.forEach(function (v, idx) { pos[v] = idx; });
    for (var k = 0; k < rels.length; k++) {
      var lo = rels[k][0], hi = rels[k][1];
      if (pos[lo] > pos[hi]) return false;
    }
    return true;
  }

  SC.linearExtensionCounts = function (values, relations) {
    var allPerms = permutations(values);
    var counts = [];
    for (var k = 0; k <= relations.length; k++) {
      var rels = relations.slice(0, k);
      var c = 0;
      for (var p = 0; p < allPerms.length; p++) {
        if (consistent(allPerms[p], rels)) c++;
      }
      counts.push(c);
    }
    return counts;
  };

  // transitive closure of a relation set over `values`, returns Set of "lo,hi" strings and adjacency
  function closureEdges(values, rels) {
    var adj = {};
    values.forEach(function (v) { adj[v] = {}; });
    rels.forEach(function (r) { adj[r[0]][r[1]] = true; });
    // Floyd-Warshall style closure (small n)
    var changed = true;
    while (changed) {
      changed = false;
      values.forEach(function (x) {
        values.forEach(function (y) {
          if (adj[x][y]) {
            values.forEach(function (z) {
              if (adj[y][z] && !adj[x][z]) { adj[x][z] = true; changed = true; }
            });
          }
        });
      });
    }
    return adj;
  }

  // transitive reduction: edge x->y kept iff no z with x->z->y
  function reduceEdges(values, closure) {
    var edges = [];
    values.forEach(function (x) {
      values.forEach(function (y) {
        if (!closure[x][y]) return;
        var redundant = values.some(function (z) {
          return z !== x && z !== y && closure[x][z] && closure[z][y];
        });
        if (!redundant) edges.push([x, y]);
      });
    });
    return edges;
  }

  // level(v) = length of longest chain below v (minimal elements = 0), using the closure
  function levels(values, closure) {
    var lvl = {};
    // order values by number of ancestors (things known-less-than them) ascending, safe for DAG
    var below = {};
    values.forEach(function (v) {
      below[v] = values.filter(function (u) { return u !== v && closure[u][v]; });
    });
    var resolved = {};
    var remaining = values.slice();
    var guard = 0;
    while (remaining.length && guard < 100) {
      guard++;
      remaining = remaining.filter(function (v) {
        var deps = below[v];
        var ready = deps.every(function (d) { return resolved.hasOwnProperty(d); });
        if (!ready) return true;
        var maxBelow = -1;
        deps.forEach(function (d) { if (resolved[d] > maxBelow) maxBelow = resolved[d]; });
        lvl[v] = maxBelow + 1;
        resolved[v] = lvl[v];
        return false;
      });
    }
    return lvl;
  }

  // Builds, for each k = 0..relations.length, the reduced edge list + per-node level + x-order hint
  SC.knowledgeStates = function (values, relations, inputOrder) {
    var states = [];
    for (var k = 0; k <= relations.length; k++) {
      var rels = relations.slice(0, k);
      var closure = closureEdges(values, rels);
      var edges = reduceEdges(values, closure);
      var lvl = levels(values, closure);
      states.push({ k: k, edges: edges, levels: lvl, closure: closure });
    }
    return states;
  };

  SC.KNOWLEDGE_INPUT = [4, 1, 3, 5, 2];
  SC.KNOWLEDGE_VALUES = [1, 2, 3, 4, 5];
  SC.KNOWLEDGE_RELATIONS = [[1, 4], [3, 4], [1, 3], [4, 5], [2, 5], [2, 4], [2, 3], [1, 2]];

  return SC;
});
