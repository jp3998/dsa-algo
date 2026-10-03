// SC: Sorting Course shared engine (theme-agnostic numbers/logic)
(function (global) {
  "use strict";

  const SC = {};

  // ---------- Python source (exact text) ----------
  SC.PY = {
    insertion: {
      code:
        "def insertion_sort(a):\n" +
        "    n = len(a)\n" +
        "    for i in range(1, n):\n" +
        "        # invariant: a[0:i] is sorted\n" +
        "        j = i\n" +
        "        while j > 0 and a[j - 1] > a[j]:\n" +
        "            a[j - 1], a[j] = a[j], a[j - 1]  # one inversion fewer\n" +
        "            j -= 1\n" +
        "    return a",
    },
    buggy: {
      code:
        "def insertion_sort(a):\n" +
        "    n = len(a)\n" +
        "    for i in range(1, n):\n" +
        "        # invariant: a[0:i] is sorted\n" +
        "        j = i\n" +
        "        while j >= 0 and a[j - 1] > a[j]:\n" +
        "            a[j - 1], a[j] = a[j], a[j - 1]\n" +
        "            j -= 1\n" +
        "    return a",
      bugLine: 6,
    },
  };
  SC.PY.insertion.lines = SC.PY.insertion.code.split("\n");
  SC.PY.buggy.lines = SC.PY.buggy.code.split("\n");

  // ---------- inversions ----------
  SC.countInversions = function (a) {
    let c = 0;
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
    return c;
  };

  SC.inversionPairs = function (a) {
    const pairs = [];
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++)
        if (a[i] > a[j]) pairs.push({ i, j, ai: a[i], aj: a[j] });
    return pairs;
  };

  // ---------- seeded PRNG ----------
  SC.mulberry32 = function (seed) {
    let t = seed >>> 0;
    return function () {
      t |= 0;
      t = (t + 0x6d2b79f5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  SC.newSeed = function () {
    return (Math.random() * 0xffffffff) >>> 0;
  };

  SC.shuffle = function (arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ---------- insertion sort step engine ----------
  // Returns {steps, comparisons, swaps, finalArray}
  SC.insertionSortSteps = function (input) {
    const a = input.slice();
    const n = a.length;
    const steps = [];
    let comparisons = 0;
    let swaps = 0;
    let inversionsLeft = SC.countInversions(a);
    const relations = []; // {x, y} meaning known x < y, in comparison order

    function regionOf(idx, i, j, done) {
      if (done) return "sorted";
      if (idx > i) return "rest";
      if (idx === j) return "key";
      return "prefix";
    }

    function snapshot(kind, line, i, j, message, extra) {
      const done = kind === "done";
      const regions = [];
      for (let idx = 0; idx < n; idx++) regions.push(regionOf(idx, i, j, done));
      steps.push(
        Object.assign(
          {
            kind,
            line,
            array: a.slice(),
            i,
            j,
            comparisons,
            swaps,
            inversionsLeft,
            regions,
            message,
          },
          extra || {}
        )
      );
    }

    // start step: line 2, n = len(a)
    snapshot(
      "start",
      2,
      0,
      null,
      "n = " + n + ". The prefix a[0:1] = [" + a[0] + "] is sorted on its own."
    );

    for (let i = 1; i < n; i++) {
      let j = i;
      const key = a[i];
      snapshot(
        "outer",
        3,
        i,
        j,
        "i = " + i + ": insert the key a[" + i + "] = " + key + " into the sorted prefix a[0:" + i + "]."
      );

      for (;;) {
        if (j === 0) {
          snapshot(
            "front",
            6,
            i,
            j,
            "j = 0: the key reached the front, so `j > 0` is false and there's no comparison."
          );
          break;
        }
        const left = a[j - 1];
        const right = a[j];
        const yes = left > right;
        comparisons++;
        relations.push(yes ? { x: right, y: left } : { x: left, y: right });
        snapshot(
          "compare",
          6,
          i,
          j,
          "Is a[" + (j - 1) + "] = " + left + " > a[" + j + "] = " + right + "? " + (yes ? "Yes, so swap." : "No, so the key is in place.")
        );
        if (!yes) break;
        a[j - 1] = right;
        a[j] = left;
        swaps++;
        inversionsLeft--;
        snapshot(
          "swap",
          7,
          i,
          j,
          "Swap them: one inversion fewer (" + inversionsLeft + " left)."
        );
        j -= 1;
        snapshot("dec", 8, i, j, "j = " + j + ".");
      }
    }

    snapshot(
      "done",
      9,
      n,
      null,
      "Done: " + comparisons + " comparisons, " + swaps + " swaps, " + inversionsLeft + " inversions left."
    );

    return { steps, comparisons, swaps, finalArray: a.slice(), relations };
  };

  SC.insertionSortCount = function (input) {
    // fast path: comparisons/swaps only, no step objects (for sampling)
    const a = input.slice();
    const n = a.length;
    let comparisons = 0;
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0 && a[j - 1] > a[j]) {
        const t = a[j - 1];
        a[j - 1] = a[j];
        a[j] = t;
        comparisons++;
        j -= 1;
      }
      if (j > 0) comparisons++; // the final false test, unless key reached front
    }
    return comparisons;
  };

  // ---------- buggy insertion sort (faithful port incl. Python negative indexing) ----------
  SC.buggyInsertion = function (input) {
    const a = input.slice();
    const n = a.length;
    function pidx(idx) {
      return idx < 0 ? idx + n : idx;
    }
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j >= 0 && a[pidx(j - 1)] > a[j]) {
        const left = pidx(j - 1);
        const t = a[left];
        a[left] = a[j];
        a[j] = t;
        j -= 1;
      }
    }
    return a;
  };

  // ---------- harmonic / exact average ----------
  SC.harmonic = function (n) {
    let h = 0;
    for (let k = 1; k <= n; k++) h += 1 / k;
    return h;
  };

  SC.exactAverageC = function (n) {
    return (n * (n - 1)) / 4 + n - SC.harmonic(n);
  };
  SC.bestC = function (n) {
    return n - 1;
  };
  SC.worstC = function (n) {
    return (n * (n - 1)) / 2;
  };

  // ---------- cost plot sampling ----------
  SC.sampleCosts = function (seed) {
    const rng = SC.mulberry32(seed);
    const ns = [];
    for (let n = 2; n <= 40; n += 2) ns.push(n);
    const results = ns.map((n) => {
      const base = [];
      for (let k = 1; k <= n; k++) base.push(k);
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;
      const REPS = 200;
      for (let r = 0; r < REPS; r++) {
        const perm = SC.shuffle(base, rng);
        const c = SC.insertionSortCount(perm);
        sum += c;
        if (c < min) min = c;
        if (c > max) max = c;
      }
      return { n, mean: sum / REPS, min, max };
    });
    return results;
  };

  // ---------- knowledge view: Hasse diagram over fixed input ----------
  SC.KNOWLEDGE_INPUT = [4, 1, 3, 5, 2];

  SC.knowledgeRelations = function () {
    // derive via the real engine so it is guaranteed consistent
    const r = SC.insertionSortSteps(SC.KNOWLEDGE_INPUT);
    return r.relations; // 8 relations {x,y} meaning x < y, in comparison order
  };

  SC.transitiveClosure = function (values, relations) {
    // returns Set of "x,y" strings meaning x<y known (closure)
    const less = new Set();
    function add(x, y) {
      less.add(x + "," + y);
    }
    function has(x, y) {
      return less.has(x + "," + y);
    }
    relations.forEach((r) => add(r.x, r.y));
    // Floyd-Warshall style closure, small n
    let changed = true;
    while (changed) {
      changed = false;
      for (const x of values) {
        for (const y of values) {
          if (x === y || !has(x, y)) continue;
          for (const z of values) {
            if (z === x || z === y) continue;
            if (has(y, z) && !has(x, z)) {
              add(x, z);
              changed = true;
            }
          }
        }
      }
    }
    return less;
  };

  SC.transitiveReduction = function (values, closure) {
    // edges x->y (x<y) s.t. no z with x<z<y in closure
    const edges = [];
    for (const x of values) {
      for (const y of values) {
        if (x === y || !closure.has(x + "," + y)) continue;
        let reducible = false;
        for (const z of values) {
          if (z === x || z === y) continue;
          if (closure.has(x + "," + z) && closure.has(z + "," + y)) {
            reducible = true;
            break;
          }
        }
        if (!reducible) edges.push([x, y]);
      }
    }
    return edges;
  };

  SC.levels = function (values, edges) {
    const level = {};
    values.forEach((v) => (level[v] = 0));
    for (let iter = 0; iter < values.length; iter++) {
      edges.forEach(([x, y]) => {
        if (level[x] + 1 > level[y]) level[y] = level[x] + 1;
      });
    }
    return level;
  };

  SC.countLinearExtensions = function (values, closure) {
    // brute force over all permutations of `values`
    function permutations(arr) {
      if (arr.length <= 1) return [arr];
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        for (const p of permutations(rest)) result.push([arr[i]].concat(p));
      }
      return result;
    }
    const perms = permutations(values);
    let count = 0;
    outer: for (const p of perms) {
      const pos = {};
      p.forEach((v, idx) => (pos[v] = idx));
      for (const key of closure) {
        const [x, y] = key.split(",").map(Number);
        if (pos[x] > pos[y]) continue outer;
      }
      count++;
    }
    return count;
  };

  // Precompute the full knowledge-view state sequence (k = 0..8)
  SC.buildKnowledgeStates = function () {
    const values = [4, 1, 3, 5, 2].slice().sort((a, b) => a - b); // [1,2,3,4,5]
    const relations = SC.knowledgeRelations();
    const states = [];
    for (let k = 0; k <= relations.length; k++) {
      const used = relations.slice(0, k);
      const closure = SC.transitiveClosure(values, used);
      const edges = SC.transitiveReduction(values, closure);
      const level = SC.levels(values, edges);
      const count = SC.countLinearExtensions(values, closure);
      const newEdgeRel = k > 0 ? relations[k - 1] : null;
      states.push({
        k,
        relations: used,
        closure,
        edges,
        level,
        count,
        bits: count > 0 ? Math.log2(count) : 0,
        justLearned: newEdgeRel,
        prevCount: k > 0 ? null : null, // filled below
      });
    }
    for (let k = 1; k < states.length; k++) states[k].prevCount = states[k - 1].count;
    return states;
  };

  global.SC = SC;
})(typeof window !== "undefined" ? window : global);

if (typeof module !== "undefined" && module.exports) {
  module.exports = global.SC;
}
