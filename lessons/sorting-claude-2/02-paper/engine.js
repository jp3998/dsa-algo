/* engine.js — pure logic for the Preprint theme sample (no DOM).
   Exposes window.SC with: PRNG, PY code strings, inversion counting,
   insertion-sort trace generator, buggy insertion sort, cost-plot sampling,
   and knowledge-view (Hasse / linear extension) computation. */
(function (global) {
  "use strict";

  var SC = {};

  // ---------- seeded PRNG (mulberry32) ----------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  SC.mulberry32 = mulberry32;
  SC.newSeed = function () {
    return (Math.random() * 0xFFFFFFFF) >>> 0;
  };

  function shuffleWith(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  SC.shuffleWith = shuffleWith;

  // ---------- Python source (exact text) ----------
  var CLEAN_LINES = [
    "def insertion_sort(a):",
    "    n = len(a)",
    "    for i in range(1, n):",
    "        # invariant: a[0:i] is sorted",
    "        j = i",
    "        while j > 0 and a[j - 1] > a[j]:",
    "            a[j - 1], a[j] = a[j], a[j - 1]  # one inversion fewer",
    "            j -= 1",
    "    return a"
  ];
  var BUGGY_LINES = [
    "def insertion_sort(a):",
    "    n = len(a)",
    "    for i in range(1, n):",
    "        # invariant: a[0:i] is sorted",
    "        j = i",
    "        while j >= 0 and a[j - 1] > a[j]:",
    "            a[j - 1], a[j] = a[j], a[j - 1]",
    "            j -= 1",
    "    return a"
  ];
  SC.PY = {
    insertion: { code: CLEAN_LINES.join("\n"), lines: CLEAN_LINES },
    buggy: { code: BUGGY_LINES.join("\n"), lines: BUGGY_LINES, bugLine: 6 }
  };

  // ---------- inversions ----------
  function countInversions(arr) {
    var c = 0;
    for (var i = 0; i < arr.length; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) c++;
      }
    }
    return c;
  }
  SC.countInversions = countInversions;

  function listInversionPairs(arr) {
    var pairs = [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) pairs.push([i, j]);
      }
    }
    return pairs;
  }
  SC.listInversionPairs = listInversionPairs;

  // ---------- faithful JS port of insertion_sort with full trace ----------
  // Step kinds: start, outer, compare, swap, dec, front, done
  function generateTrace(initial) {
    var a = initial.slice();
    var n = a.length;
    var comparisons = 0, swaps = 0;
    var steps = [];

    function regionsFor(i, keyIndex, phase) {
      var regs = new Array(n).fill("rest");
      if (phase === "done") { for (var k = 0; k < n; k++) regs[k] = "sorted"; return regs; }
      if (phase === "pre") {
        regs[0] = "sorted";
        for (var k2 = 1; k2 < n; k2++) regs[k2] = "rest";
        return regs;
      }
      for (var k3 = 0; k3 <= i; k3++) regs[k3] = (k3 === keyIndex) ? "key" : "sorted";
      for (var k4 = i + 1; k4 < n; k4++) regs[k4] = "rest";
      return regs;
    }

    steps.push({
      kind: "start", line: 2,
      array: a.slice(), i: null, j: null, keyIndex: null,
      comparisons: comparisons, swaps: swaps, inversions: countInversions(a),
      message: "n = " + n + ". The prefix a[0:1] = [" + a[0] + "] is sorted on its own.",
      regions: regionsFor(0, null, "pre")
    });

    for (var i = 1; i < n; i++) {
      var keyVal = a[i];
      steps.push({
        kind: "outer", line: 3,
        array: a.slice(), i: i, j: i, keyIndex: i,
        comparisons: comparisons, swaps: swaps, inversions: countInversions(a),
        message: "i = " + i + ": insert the key a[" + i + "] = " + keyVal +
          " into the sorted prefix a[0:" + i + "].",
        regions: regionsFor(i, i, "mid")
      });

      var j = i;
      /* eslint-disable no-constant-condition */
      while (true) {
        if (j > 0) {
          comparisons++;
          var lhs = a[j - 1], rhs = a[j];
          var isGT = lhs > rhs;
          steps.push({
            kind: "compare", line: 6,
            array: a.slice(), i: i, j: j, keyIndex: j,
            comparisons: comparisons, swaps: swaps, inversions: countInversions(a),
            message: isGT ?
              ("Is a[" + (j - 1) + "] = " + lhs + " > a[" + j + "] = " + rhs + "? Yes, so swap.") :
              ("Is a[" + (j - 1) + "] = " + lhs + " > a[" + j + "] = " + rhs + "? No, so the key is in place."),
            regions: regionsFor(i, j, "mid")
          });
          if (!isGT) break;
          var tmp = a[j - 1]; a[j - 1] = a[j]; a[j] = tmp;
          swaps++;
          var invAfter = countInversions(a);
          steps.push({
            kind: "swap", line: 7,
            array: a.slice(), i: i, j: j, keyIndex: j - 1,
            comparisons: comparisons, swaps: swaps, inversions: invAfter,
            message: "Swap them: one inversion fewer (" + invAfter + " left).",
            regions: regionsFor(i, j - 1, "mid")
          });
          j--;
          steps.push({
            kind: "dec", line: 8,
            array: a.slice(), i: i, j: j, keyIndex: j,
            comparisons: comparisons, swaps: swaps, inversions: invAfter,
            message: "j = " + j + ".",
            regions: regionsFor(i, j, "mid")
          });
          if (j === 0) {
            steps.push({
              kind: "front", line: 6,
              array: a.slice(), i: i, j: j, keyIndex: 0,
              comparisons: comparisons, swaps: swaps, inversions: invAfter,
              message: "j = 0: the key reached the front, so `j > 0` is false and there's no comparison.",
              regions: regionsFor(i, 0, "mid")
            });
            break;
          }
        } else {
          break;
        }
      }
    }

    var finalInv = countInversions(a);
    steps.push({
      kind: "done", line: 9,
      array: a.slice(), i: n, j: null, keyIndex: null,
      comparisons: comparisons, swaps: swaps, inversions: finalInv,
      message: "Done: " + comparisons + " comparisons, " + swaps + " swaps, " + finalInv + " inversions left.",
      regions: regionsFor(n - 1, null, "done")
    });

    return { steps: steps, totalComparisons: comparisons, totalSwaps: swaps, finalArray: a };
  }
  SC.generateTrace = generateTrace;

  // ---------- buggy insertion sort (faithful Python negative-index semantics) ----------
  function pyGet(arr, idx) {
    return idx < 0 ? arr[arr.length + idx] : arr[idx];
  }
  function pySet(arr, idx, val) {
    if (idx < 0) arr[arr.length + idx] = val; else arr[idx] = val;
  }
  function buggyInsertion(initial) {
    var a = initial.slice();
    var n = a.length;
    for (var i = 1; i < n; i++) {
      var j = i;
      while (j >= 0 && pyGet(a, j - 1) > pyGet(a, j)) {
        var l = pyGet(a, j - 1), r = pyGet(a, j);
        pySet(a, j - 1, r); pySet(a, j, l);
        j -= 1;
      }
    }
    return a;
  }
  SC.buggyInsertion = buggyInsertion;

  // ---------- exact cost formulas ----------
  function harmonic(n) {
    var h = 0;
    for (var k = 1; k <= n; k++) h += 1 / k;
    return h;
  }
  SC.harmonic = harmonic;
  SC.costBest = function (n) { return n - 1; };
  SC.costWorst = function (n) { return n * (n - 1) / 2; };
  SC.costAverage = function (n) { return n * (n - 1) / 4 + n - harmonic(n); };

  // ---------- sampling for the cost plot ----------
  function sampleCosts(ns, trials, seed) {
    var rng = mulberry32(seed >>> 0);
    var out = [];
    ns.forEach(function (n) {
      var base = [];
      for (var v = 1; v <= n; v++) base.push(v);
      var sum = 0, min = Infinity, max = -Infinity;
      for (var t = 0; t < trials; t++) {
        var perm = shuffleWith(base, rng);
        var res = generateTrace(perm);
        var c = res.totalComparisons;
        sum += c;
        if (c < min) min = c;
        if (c > max) max = c;
      }
      out.push({ n: n, mean: sum / trials, min: min, max: max });
    });
    return out;
  }
  SC.sampleCosts = sampleCosts;

  // ---------- knowledge view: linear extensions over all 120 permutations ----------
  function permutations(values) {
    if (values.length <= 1) return [values];
    var result = [];
    for (var i = 0; i < values.length; i++) {
      var rest = values.slice(0, i).concat(values.slice(i + 1));
      var subs = permutations(rest);
      for (var s = 0; s < subs.length; s++) {
        result.push([values[i]].concat(subs[s]));
      }
    }
    return result;
  }
  SC.permutations = permutations;

  // relations learned, in order (value pairs, x < y), matching the 8 real comparisons
  // of insertion sort on [4,1,3,5,2].
  SC.KNOWLEDGE_RELATIONS = [
    [1, 4], [3, 4], [1, 3], [4, 5], [2, 5], [2, 4], [2, 3], [1, 2]
  ];
  SC.KNOWLEDGE_COMPARISONS = [
    { a: 4, b: 1, rel: "1 < 4" },
    { a: 4, b: 3, rel: "3 < 4" },
    { a: 1, b: 3, rel: "1 < 3" },
    { a: 4, b: 5, rel: "4 < 5" },
    { a: 5, b: 2, rel: "2 < 5" },
    { a: 4, b: 2, rel: "2 < 4" },
    { a: 3, b: 2, rel: "2 < 3" },
    { a: 1, b: 2, rel: "1 < 2" }
  ];

  var ALL_PERMS = permutations([1, 2, 3, 4, 5]);

  function consistentCount(relations) {
    var count = 0;
    for (var p = 0; p < ALL_PERMS.length; p++) {
      var perm = ALL_PERMS[p];
      var pos = {};
      for (var idx = 0; idx < perm.length; idx++) pos[perm[idx]] = idx;
      var ok = true;
      for (var r = 0; r < relations.length; r++) {
        if (pos[relations[r][0]] > pos[relations[r][1]]) { ok = false; break; }
      }
      if (ok) count++;
    }
    return count;
  }

  function knowledgeStates() {
    var states = [];
    for (var k = 0; k <= SC.KNOWLEDGE_RELATIONS.length; k++) {
      var rel = SC.KNOWLEDGE_RELATIONS.slice(0, k);
      states.push({ k: k, relations: rel, count: consistentCount(rel) });
    }
    return states;
  }
  SC.knowledgeStates = knowledgeStates;

  // transitive closure + reduction of a set of value relations over values[]
  function transitiveClosure(values, relations) {
    var adj = {};
    values.forEach(function (v) { adj[v] = {}; });
    relations.forEach(function (r) { adj[r[0]][r[1]] = true; });
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
  function transitiveReduction(values, closureAdj) {
    var edges = [];
    values.forEach(function (x) {
      values.forEach(function (y) {
        if (closureAdj[x][y]) {
          var viaOther = values.some(function (z) {
            return z !== x && z !== y && closureAdj[x][z] && closureAdj[z][y];
          });
          if (!viaOther) edges.push([x, y]);
        }
      });
    });
    return edges;
  }
  function longestChainBelow(values, closureAdj, v) {
    var preds = values.filter(function (u) { return u !== v && closureAdj[u][v]; });
    if (preds.length === 0) return 0;
    var best = 0;
    preds.forEach(function (u) {
      var d = 1 + longestChainBelow(values, closureAdj, u);
      if (d > best) best = d;
    });
    return best;
  }
  // layout: level = longest chain length below node; horizontal order = position in input array
  function hasseLayout(values, relations, inputOrder) {
    var closure = transitiveClosure(values, relations);
    var reduced = transitiveReduction(values, closure);
    var levels = {};
    values.forEach(function (v) { levels[v] = longestChainBelow(values, closure, v); });
    var orderIndex = {};
    inputOrder.forEach(function (v, idx) { orderIndex[v] = idx; });
    var nodes = values.map(function (v) {
      return { value: v, level: levels[v], order: orderIndex[v] };
    });
    return { nodes: nodes, edges: reduced };
  }
  SC.hasseLayout = hasseLayout;
  SC.transitiveClosure = transitiveClosure;

  global.SC = SC;
})(window);
