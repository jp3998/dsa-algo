/* ==========================================================================
   Sketchbook theme engine — sorting lesson interactive components.
   Pure logic (SC.*) is Node-testable; DOM/rough.js parts only run in a
   browser (guarded by `typeof document/window`).
   ========================================================================== */
(function (global) {
  "use strict";
  var SC = {};

  /* ---------------------------------------------------------------- PRNG */
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

  function randPermutation(n, rng) {
    var a = [];
    for (var i = 1; i <= n; i++) a.push(i);
    for (var i2 = a.length - 1; i2 > 0; i2--) {
      var j = Math.floor(rng() * (i2 + 1));
      var t = a[i2]; a[i2] = a[j]; a[j] = t;
    }
    return a;
  }
  SC.randPermutation = randPermutation;

  function seedFor(key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) { h = (h * 31 + key.charCodeAt(i)) | 0; }
    return (Math.abs(h) % 99991) + 1;
  }
  SC.seedFor = seedFor;

  /* ---------------------------------------------------------- Python code */
  SC.PY = {
    insertion: {
      lines: [
        "def insertion_sort(a):",
        "    n = len(a)",
        "    for i in range(1, n):",
        "        # invariant: a[0:i] is sorted",
        "        j = i",
        "        while j > 0 and a[j - 1] > a[j]:",
        "            a[j - 1], a[j] = a[j], a[j - 1]  # one inversion fewer",
        "            j -= 1",
        "    return a"
      ]
    },
    buggy: {
      lines: [
        "def insertion_sort(a):",
        "    n = len(a)",
        "    for i in range(1, n):",
        "        # invariant: a[0:i] is sorted",
        "        j = i",
        "        while j >= 0 and a[j - 1] > a[j]:",
        "            a[j - 1], a[j] = a[j], a[j - 1]",
        "            j -= 1",
        "    return a"
      ],
      bugLine: 6
    }
  };
  SC.PY.insertion.code = SC.PY.insertion.lines.join("\n");
  SC.PY.buggy.code = SC.PY.buggy.lines.join("\n");

  /* ------------------------------------------------------------ Buggy run */
  function pget(a, idx) { return idx < 0 ? a[a.length + idx] : a[idx]; }
  function pset(a, idx, v) { if (idx < 0) a[a.length + idx] = v; else a[idx] = v; }

  SC.buggyInsertion = function (arr) {
    var a = arr.slice();
    var n = a.length;
    for (var i = 1; i < n; i++) {
      var j = i;
      while (j >= 0 && pget(a, j - 1) > pget(a, j)) {
        var l = pget(a, j - 1), r = pget(a, j);
        pset(a, j - 1, r); pset(a, j, l);
        j -= 1;
      }
    }
    return a;
  };

  /* -------------------------------------------------------------- Counts */
  SC.countInversions = function (a) {
    var pairs = [];
    for (var i = 0; i < a.length; i++) {
      for (var j = i + 1; j < a.length; j++) {
        if (a[i] > a[j]) pairs.push([i, j]);
      }
    }
    return pairs;
  };

  SC.fastCount = function (arr) {
    var a = arr.slice();
    var comparisons = 0, swaps = 0;
    for (var i = 1; i < a.length; i++) {
      var j = i;
      while (j > 0) {
        comparisons++;
        if (a[j - 1] > a[j]) {
          var t = a[j - 1]; a[j - 1] = a[j]; a[j] = t;
          swaps++; j--;
        } else break;
      }
    }
    return { comparisons: comparisons, swaps: swaps, array: a };
  };

  function harmonic(n) { var s = 0; for (var k = 1; k <= n; k++) s += 1 / k; return s; }
  SC.harmonic = harmonic;
  SC.costBest = function (n) { return n - 1; };
  SC.costWorst = function (n) { return n * (n - 1) / 2; };
  SC.costAvgExact = function (n) { return n * (n - 1) / 4 + n - harmonic(n); };

  /* -------------------------------------------------------- Region helper */
  function regionsAt(bound, keyPos, n) {
    var out = [];
    for (var k = 0; k < n; k++) {
      if (k === keyPos) out.push("key");
      else if (k <= bound) out.push("sorted");
      else out.push("rest");
    }
    return out;
  }

  /* --------------------------------------------------------- Sort trace */
  SC.insertionSortTrace = function (initial) {
    var a = initial.slice();
    var n = a.length;
    var steps = [];
    var comparisons = 0, swaps = 0;

    function push(kind, line, message, i, j, extra) {
      var bound = extra.bound, keyPos = extra.keyPos;
      var step = {
        kind: kind, line: line, message: message, i: i, j: j,
        array: a.slice(),
        comparisons: comparisons, swaps: swaps,
        inversionsLeft: SC.countInversions(a).length,
        regions: regionsAt(bound, keyPos, n)
      };
      for (var k in extra) if (k !== "bound" && k !== "keyPos") step[k] = extra[k];
      steps.push(step);
    }

    push("start", 2, "n = " + n + ". The prefix a[0:1] = [" + a[0] + "] is sorted on its own.",
      0, null, { bound: 0, keyPos: -1 });

    for (var i = 1; i < n; i++) {
      var keyVal = a[i];
      push("outer", 3, "i = " + i + ": insert the key a[" + i + "] = " + keyVal + " into the sorted prefix a[0:" + i + "].",
        i, i, { bound: i, keyPos: i });
      var j = i;
      while (true) {
        if (j === 0) {
          push("front", 6, "j = 0: the key reached the front, so `j > 0` is false and there's no comparison.",
            i, j, { bound: i, keyPos: j });
          break;
        }
        var leftVal = a[j - 1], rightVal = a[j];
        comparisons++;
        var cond = leftVal > rightVal;
        var msg = cond
          ? "Is a[" + (j - 1) + "] = " + leftVal + " > a[" + j + "] = " + rightVal + "? Yes, so swap."
          : "Is a[" + (j - 1) + "] = " + leftVal + " > a[" + j + "] = " + rightVal + "? No, so the key is in place.";
        push("compare", 6, msg, i, j, {
          bound: i, keyPos: j, highlight: [j - 1, j],
          cmpLeft: leftVal, cmpRight: rightVal, cmpResult: cond
        });
        if (cond) {
          var t = a[j - 1]; a[j - 1] = a[j]; a[j] = t;
          swaps++;
          var invLeft = SC.countInversions(a).length;
          push("swap", 7, "Swap them: one inversion fewer (" + invLeft + " left).",
            i, j, { bound: i, keyPos: j - 1, highlight: [j - 1, j] });
          j -= 1;
          push("dec", 8, "j = " + j + ".", i, j, { bound: i, keyPos: j });
        } else {
          break;
        }
      }
    }
    var finalInv = SC.countInversions(a).length;
    push("done", 9, "Done: " + comparisons + " comparisons, " + swaps + " swaps, " + finalInv + " inversions left.",
      n, null, { bound: n - 1, keyPos: -1 });

    return { steps: steps, comparisons: comparisons, swaps: swaps, finalArray: a.slice() };
  };

  /* ------------------------------------------------------- Permutations */
  function allPermutations(values) {
    var result = [];
    function perm(arr, acc) {
      if (arr.length === 0) { result.push(acc); return; }
      for (var i = 0; i < arr.length; i++) {
        var rest = arr.slice(0, i).concat(arr.slice(i + 1));
        perm(rest, acc.concat([arr[i]]));
      }
    }
    perm(values, []);
    return result;
  }
  SC.allPermutations = allPermutations;

  /* -------------------------------------------------------- Knowledge view */
  SC.buildKnowledgeStates = function () {
    var base = [4, 1, 3, 5, 2];
    var trace = SC.insertionSortTrace(base);
    var compareSteps = trace.steps.filter(function (s) { return s.kind === "compare"; });
    var relations = compareSteps.map(function (s) {
      return s.cmpResult ? [s.cmpRight, s.cmpLeft] : [s.cmpLeft, s.cmpRight];
    });
    var values = [1, 2, 3, 4, 5];
    var posInInput = {};
    base.forEach(function (v, idx) { posInInput[v] = idx; });
    var perms = allPermutations(values);

    function closureFor(relList) {
      var idx = {}; values.forEach(function (v, i) { idx[v] = i; });
      var n = values.length;
      var reach = [];
      for (var i = 0; i < n; i++) { reach.push(new Array(n).fill(false)); }
      relList.forEach(function (pair) { reach[idx[pair[0]]][idx[pair[1]]] = true; });
      for (var k = 0; k < n; k++)
        for (var i2 = 0; i2 < n; i2++)
          for (var j2 = 0; j2 < n; j2++)
            if (reach[i2][k] && reach[k][j2]) reach[i2][j2] = true;
      return reach;
    }
    function hasseEdges(reach) {
      var n = values.length; var edges = [];
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if (i === j || !reach[i][j]) continue;
          var direct = true;
          for (var k = 0; k < n; k++) {
            if (k === i || k === j) continue;
            if (reach[i][k] && reach[k][j]) { direct = false; break; }
          }
          if (direct) edges.push([values[i], values[j]]);
        }
      }
      return edges;
    }
    function countExtensions(relList) {
      var c = 0;
      for (var p = 0; p < perms.length; p++) {
        var perm = perms[p];
        var pos = {};
        for (var i = 0; i < perm.length; i++) pos[perm[i]] = i;
        var ok = true;
        for (var r = 0; r < relList.length; r++) {
          if (!(pos[relList[r][0]] < pos[relList[r][1]])) { ok = false; break; }
        }
        if (ok) c++;
      }
      return c;
    }

    var states = [];
    var prevEdgeSet = {};
    var prevCount = null;
    for (var k = 0; k <= 8; k++) {
      var relList = relations.slice(0, k);
      var reach = closureFor(relList);
      var edges = hasseEdges(reach);
      var edgeSet = {};
      edges.forEach(function (e) { edgeSet[e[0] + "-" + e[1]] = true; });
      var added = edges.filter(function (e) { return !prevEdgeSet[e[0] + "-" + e[1]]; });
      var level = {};
      values.slice().sort(function (a, b) { return a - b; }).forEach(function (v) {
        var incoming = edges.filter(function (e) { return e[1] === v; }).map(function (e) { return e[0]; });
        if (incoming.length === 0) level[v] = 0;
        else level[v] = 1 + Math.max.apply(null, incoming.map(function (x) { return level[x]; }));
      });
      var count = countExtensions(relList);
      var bits = count > 0 ? Math.log2(count) : 0;
      var comparedMsg = null;
      if (k > 0) {
        var m = compareSteps[k - 1];
        var small = m.cmpResult ? m.cmpRight : m.cmpLeft;
        var big = m.cmpResult ? m.cmpLeft : m.cmpRight;
        comparedMsg = "compared " + m.cmpLeft + " and " + m.cmpRight + ": " + small + " < " + big;
      }
      states.push({
        k: k, relations: relList, edges: edges, added: added, level: level,
        count: count, bits: bits, comparedMsg: comparedMsg, prevCount: prevCount
      });
      prevEdgeSet = edgeSet;
      prevCount = count;
    }
    return { states: states, posInInput: posInInput, values: values };
  };

  /* ------------------------------------------------------------ Cost plot */
  SC.sampleCostPlot = function (seed) {
    var rng = mulberry32(seed);
    var ns = [];
    for (var n = 2; n <= 40; n += 2) ns.push(n);
    return ns.map(function (n) {
      var total = 0, min = Infinity, max = -Infinity;
      var reps = 200;
      for (var r = 0; r < reps; r++) {
        var perm = randPermutation(n, rng);
        var res = SC.fastCount(perm);
        total += res.comparisons;
        if (res.comparisons < min) min = res.comparisons;
        if (res.comparisons > max) max = res.comparisons;
      }
      return { n: n, mean: total / reps, min: min, max: max };
    });
  };

  /* -------------------------------------------------------------- Parsing */
  SC.parseIntsList = function (str, opts) {
    opts = opts || {};
    var min = opts.min || 2, max = opts.max || 12;
    if (!str || !str.trim()) return { ok: false, error: "Enter some numbers." };
    var parts = str.trim().split(/[\s,]+/).filter(function (s) { return s.length; });
    var nums = [];
    for (var i = 0; i < parts.length; i++) {
      if (!/^-?\d+$/.test(parts[i])) return { ok: false, error: "“" + parts[i] + "” isn't a whole number." };
      nums.push(parseInt(parts[i], 10));
    }
    if (nums.length < min || nums.length > max) {
      return { ok: false, error: "Use between " + min + " and " + max + " numbers." };
    }
    var seen = {};
    for (var j = 0; j < nums.length; j++) {
      if (seen[nums[j]]) return { ok: false, error: "Numbers must be distinct (" + nums[j] + " repeats)." };
      seen[nums[j]] = true;
    }
    return { ok: true, values: nums };
  };

  /* ========================================================================
     Everything below touches the DOM / rough.js and only runs in a browser.
     ======================================================================== */
  var root = (typeof window !== "undefined") ? window : global;
  root.SC = SC;

  if (typeof document === "undefined") {
    if (typeof module !== "undefined" && module.exports) module.exports = SC;
    return;
  }

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealAll = /[?&]reveal=1\b/.test(location.search);

  /* ---------------------------------------------------- rough.js helpers */
  var frameHosts = [];
  function makeRC(svg) { return rough.svg(svg); }

  function ensureFrameSvg(el) {
    var svg = el.querySelector(":scope > svg.sketch-frame");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sketch-frame");
      el.insertBefore(svg, el.firstChild);
    }
    return svg;
  }

  function sketchFrame(el, opts) {
    opts = opts || {};
    el.classList.add("frame-host");
    if (!el.style.position) el.style.position = "relative";
    var svg = ensureFrameSvg(el);
    frameHosts.push({ el: el, svg: svg, opts: opts });
    drawFrame(el, svg, opts);
    return svg;
  }

  function drawFrame(el, svg, opts) {
    var w = el.offsetWidth, h = el.offsetHeight;
    if (w < 4 || h < 4) return;
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var rc = makeRC(svg);
    var seed = opts.seed || seedFor(opts.key || "frame");
    var stroke = opts.stroke || "#1e1e1e";
    var fill = opts.fill || undefined;
    var node = rc.rectangle(2, 2, Math.max(1, w - 4), Math.max(1, h - 4), {
      seed: seed, stroke: stroke, strokeWidth: opts.strokeWidth || 1.6,
      roughness: opts.roughness != null ? opts.roughness : 1.4,
      fill: fill, fillStyle: opts.fillStyle || "hachure", fillWeight: 1.4,
      bowing: opts.bowing != null ? opts.bowing : 1
    });
    svg.appendChild(node);
  }

  var redrawTimer = null;
  function redrawAllFrames() {
    frameHosts.forEach(function (f) { drawFrame(f.el, f.svg, f.opts); });
  }
  function scheduleRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(redrawAllFrames, 120);
  }
  window.addEventListener("resize", scheduleRedraw);
  SC._redrawFrames = redrawAllFrames;

  /* ------------------------------------------------------- math rendering */
  function renderMath(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }
  SC.renderMath = renderMath;

  /* -------------------------------------------------------------- tokenizer */
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function tokenizePython(line) {
    var re = /(#.*)|(\b(?:def|for|in|while|return|and)\b)|(\b\d+\b)/g;
    var out = "", last = 0, m;
    while ((m = re.exec(line))) {
      out += escapeHtml(line.slice(last, m.index));
      if (m[1]) out += '<span class="tok-com">' + escapeHtml(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-kw">' + escapeHtml(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-num">' + escapeHtml(m[3]) + "</span>";
      last = re.lastIndex;
    }
    out += escapeHtml(line.slice(last));
    return out;
  }

  /* ---------------------------------------------------------- misc helpers */
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  SC._el = el;

  function sketchButton(label, opts) {
    opts = opts || {};
    var btn = el("button", { class: "sketch-btn" + (opts.cls ? " " + opts.cls : ""), type: "button" });
    var content = el("span", { class: "frame-content", text: label });
    btn.appendChild(content);
    sketchFrame(btn, { key: opts.key || ("btn-" + label), roughness: 1.6, fillStyle: "solid" });
    return btn;
  }
  SC._sketchButton = sketchButton;

  function makeCodeListing(containerEl, pyObj, opts) {
    opts = opts || {};
    containerEl.innerHTML = "";
    var box = el("div", { class: "code-box frame-host" });
    sketchFrame(box, { key: opts.key || "code-box", roughness: 1.1 });
    var inner = el("div", { class: "code-inner frame-content" });
    var lineEls = [];
    pyObj.lines.forEach(function (text, idx) {
      var lnum = idx + 1;
      var lineEl = el("div", {
        class: "code-line" + (opts.clickable ? " clickable" : ""),
        "data-line": lnum
      });
      lineEl.appendChild(el("span", { class: "ln", text: String(lnum) }));
      lineEl.appendChild(el("span", { class: "code-text", html: tokenizePython(text) }));
      if (opts.clickable) {
        lineEl.addEventListener("click", function () { opts.onLineClick(lnum, lineEl); });
      }
      inner.appendChild(lineEl);
      lineEls.push(lineEl);
    });
    box.appendChild(inner);
    containerEl.appendChild(box);
    return { box: box, lineEls: lineEls };
  }

  /* ==================================================================== */
  /* Component builders                                                   */
  /* ==================================================================== */

  function setFeedback(container, kind, text) {
    var fb = container.querySelector(".feedback");
    if (!fb) { fb = el("div", { class: "feedback" }); container.appendChild(fb); }
    fb.className = "feedback " + (kind === "good" ? "good" : "bad");
    fb.innerHTML = text;
    renderMath(fb);
  }

  /* ---- generic numeric predict/check block ---- */
  function buildNumericCheck(root, cfg) {
    // cfg: {answer, feedbackCorrect, feedbackWrongMap:[{value,text}], feedbackGeneric, onAnswered}
    var row = el("div", { class: "numeric-row", style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap;" });
    var input = el("input", { class: "sketch-input", type: "text", inputmode: "numeric", placeholder: "your answer", "aria-label": "numeric answer" });
    var btn = sketchButton("Check", { key: "check-" + cfg.key });
    row.appendChild(input);
    row.appendChild(btn);
    root.appendChild(row);

    function check() {
      var raw = input.value.trim();
      if (!raw.length) return;
      var val = Number(raw);
      var correct = (val === cfg.answer);
      var text;
      if (correct) text = cfg.feedbackCorrect;
      else {
        var hit = (cfg.feedbackWrongMap || []).find(function (w) { return w.value === raw || Number(w.value) === val; });
        text = hit ? hit.text : cfg.feedbackGeneric;
      }
      setFeedback(root, correct ? "good" : "bad", text);
      if (cfg.onAnswered) cfg.onAnswered(correct, val);
    }
    btn.addEventListener("click", check);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    return { input: input, btn: btn };
  }

  /* ---- generic multiple choice block ---- */
  function buildMCQ(root, options, cfg) {
    // options: [{key,label,text,correct}]
    var wrap = el("div", { class: "mcq-options" });
    options.forEach(function (opt) {
      var row = el("div", { class: "option-row", tabindex: "0", role: "button" });
      var svgMark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgMark.setAttribute("width", "26"); svgMark.setAttribute("height", "26");
      svgMark.setAttribute("viewBox", "0 0 26 26");
      var rc = rough.svg(svgMark);
      svgMark.appendChild(rc.circle(13, 13, 20, { seed: seedFor("opt-" + opt.key), roughness: 1.3, stroke: "#1e1e1e", strokeWidth: 1.6 }));
      var markEl = el("span", { class: "opt-mark" });
      markEl.appendChild(svgMark);
      row.appendChild(markEl);
      row.appendChild(el("span", { class: "opt-label", html: "(" + opt.key + ") " + opt.label }));
      row.addEventListener("click", function () { choose(opt, row, svgMark, rc); });
      row.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(opt, row, svgMark, rc); } });
      wrap.appendChild(row);
    });
    root.appendChild(wrap);
    renderMath(wrap);

    function choose(opt, row, svgMark, rc) {
      Array.prototype.forEach.call(wrap.children, function (r) { r.classList.remove("correct", "wrong"); });
      while (svgMark.firstChild) svgMark.removeChild(svgMark.firstChild);
      if (opt.correct) {
        row.classList.add("correct");
        svgMark.appendChild(rc.line(5, 14, 11, 20, { seed: 1, stroke: "#2f9e44", strokeWidth: 2.4 }));
        svgMark.appendChild(rc.line(11, 20, 22, 5, { seed: 2, stroke: "#2f9e44", strokeWidth: 2.4 }));
      } else {
        row.classList.add("wrong");
        svgMark.appendChild(rc.line(6, 6, 20, 20, { seed: 3, stroke: "#e03131", strokeWidth: 2.4 }));
        svgMark.appendChild(rc.line(20, 6, 6, 20, { seed: 4, stroke: "#e03131", strokeWidth: 2.4 }));
      }
      setFeedback(root, opt.correct ? "good" : "bad", opt.text);
      if (cfg.onAnswered) cfg.onAnswered(opt.correct, opt);
    }
    return wrap;
  }

  /* ---- gating helper: hides following content until answered ---- */
  function wireGate(gateEls, skipLabel, onReveal) {
    var revealed = false;
    gateEls.forEach(function (g) { g.hidden = true; });
    var skip = el("button", { class: "skip-link", type: "button", text: skipLabel || "skip, just show me" });
    function reveal() {
      if (revealed) return;
      revealed = true;
      gateEls.forEach(function (g) { g.hidden = false; });
      skip.hidden = true;
      scheduleRedraw();
      if (onReveal) onReveal();
    }
    skip.addEventListener("click", reveal);
    if (revealAll) reveal();
    return { reveal: reveal, skipBtn: skip, isRevealed: function () { return revealed; } };
  }

  /* ---------------------------------------------------------- prereq-check */
  function buildPrereqCheck(root) {
    root.innerHTML = "";
    var card = el("div", { class: "card frame-host" });
    sketchFrame(card, { key: "prereq-card" });
    var body = el("div", { class: "frame-content" });
    body.appendChild(el("div", { class: "sticky-title", html: "<strong>Before you start</strong>" }));
    body.appendChild(el("p", { html: "Two quick questions. If either goes wrong, revisit the lesson it points to." }));

    body.appendChild(el("p", { html: "<strong>P1.</strong> How many comparisons does it take to verify that an array of $8$ distinct keys is sorted?" }));
    buildNumericCheck(body, {
      key: "p1", answer: 7,
      feedbackCorrect: "Right: one comparison per adjacent pair, and transitivity does the rest.",
      feedbackWrongMap: [
        { value: "28", text: "That's $\\binom{8}{2}$, every pair. You only need the adjacent pairs; transitivity covers the others. Revisit Lesson 1, §2." },
        { value: "8", text: "Off by one: 8 elements have 7 adjacent pairs." }
      ],
      feedbackGeneric: "Not quite. Think about which pairs you actually need to compare. Revisit Lesson 1, §2."
    });

    body.appendChild(el("p", { style: "margin-top:1.4em;", html: "<strong>P2.</strong> Repeated selection runs once on a sorted array and once on a reversed array of the same length. On the sorted one it makes:" }));
    buildMCQ(body, [
      { key: "a", label: "fewer comparisons", correct: false, text: "That's the intuition this lesson is about, but repeated selection can't use it. To be sure an element is the smallest remaining, it must compare it with every remaining element, whatever the input looks like. Revisit Lesson 2." },
      { key: "b", label: "the same number of comparisons", correct: true, text: "Right. The count is $n(n-1)/2$ regardless of the input. That rigidity is what this lesson tries to escape." },
      { key: "c", label: "more comparisons", correct: false, text: "No: the count doesn't depend on the input at all. Revisit Lesson 2." }
    ], {});

    card.appendChild(body);
    root.appendChild(card);
    renderMath(card);
  }

  /* ------------------------------------------------ predict-first blocks */
  function buildPredictBlock(root, cfg) {
    // cfg.kind: 'numeric' | 'mcq'
    root.innerHTML = "";
    var sticky = el("div", { class: "sticky frame-host" });
    sketchFrame(sticky, { key: cfg.key + "-sticky", fill: "#ffec99", fillStyle: "solid", roughness: 1.5 });
    var body = el("div", { class: "frame-content" });
    body.appendChild(el("div", { class: "sticky-title", text: "Predict first" }));
    body.appendChild(el("p", { html: cfg.prompt }));
    var revealEl = el("div", { class: "reveal-text", hidden: true });
    var gate = wireGate([revealEl].concat(cfg.externalGateEls || []), "skip, just show me");

    if (cfg.kind === "numeric") {
      buildNumericCheck(body, {
        key: cfg.key, answer: cfg.answer,
        feedbackCorrect: cfg.feedbackCorrect,
        feedbackWrongMap: cfg.feedbackWrongMap || [],
        feedbackGeneric: cfg.feedbackGeneric,
        onAnswered: function () { gate.reveal(); }
      });
    } else {
      buildMCQ(body, cfg.options, { onAnswered: function () { gate.reveal(); } });
    }
    body.appendChild(gate.skipBtn);
    revealEl.innerHTML = cfg.revealHtml || "";
    body.appendChild(revealEl);
    sticky.appendChild(body);
    root.appendChild(sticky);
    renderMath(sticky);
    return gate;
  }

  /* ---------------------------------------------------- inversion diagram */
  function buildInversionDiagram(root) {
    root.innerHTML = "";
    var state = { arr: [4, 1, 3, 5, 2] };
    var fig = el("div", { class: "fig-box frame-host" });
    sketchFrame(fig, { key: "fig1-box" });
    var content = el("div", { class: "frame-content" });

    var countLine = el("div", { style: "font-family:var(--font-hand);font-size:1.15em;margin-bottom:6px;" });
    content.appendChild(countLine);

    var stage = el("div", { class: "array-stage", style: "height:150px;" });
    content.appendChild(stage);

    var hoverMsg = el("div", { class: "stepper-status", style: "min-height:1.6em;" , text: "Hover or tap an arc to see why it's an inversion." });
    content.appendChild(hoverMsg);

    var btnRow = el("div", { class: "btn-row" });
    var shuffleBtn = sketchButton("Shuffle", { key: "fig1-shuffle" });
    var reverseBtn = sketchButton("Reverse", { key: "fig1-reverse" });
    var sortBtn = sketchButton("Sort", { key: "fig1-sort" });
    btnRow.appendChild(shuffleBtn); btnRow.appendChild(reverseBtn); btnRow.appendChild(sortBtn);
    content.appendChild(btnRow);

    var inputRow = el("div", { class: "custom-row" });
    var input = el("input", { class: "sketch-input", type: "text", placeholder: "e.g. 4, 1, 3, 5, 2", style: "min-width:220px;" });
    var applyBtn = sketchButton("Apply", { key: "fig1-apply" });
    var err = el("span", { class: "err-inline" });
    inputRow.appendChild(input); inputRow.appendChild(applyBtn); inputRow.appendChild(err);
    content.appendChild(inputRow);

    fig.appendChild(content);
    root.appendChild(fig);

    var cap = el("div", { class: "figure-caption", html: "<strong>Figure 1.</strong> Every arc joins one inverted pair. Edit the array or shuffle it, and the count updates." });
    root.appendChild(cap);
    renderMath(root);

    var rng = mulberry32(Date.now() % 2147483647);

    function render() {
      var a = state.arr;
      var n = a.length;
      stage.innerHTML = "";
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100%");
      var w = Math.max(stage.clientWidth || fig.clientWidth || 600, 300);
      var h = 150;
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.setAttribute("height", h);
      stage.appendChild(svg);
      var rc = rough.svg(svg);

      var pairs = SC.countInversions(a);
      countLine.textContent = "Inversions: " + pairs.length;

      var cellW = Math.min(76, (w - 20) / n);
      var totalW = cellW * n;
      var startX = (w - totalW) / 2;
      var cellY = 92, cellH = 48;
      var cellCenters = [];
      for (var i = 0; i < n; i++) {
        var x = startX + i * cellW;
        cellCenters.push(x + cellW / 2);
        var rect = rc.rectangle(x + 4, cellY, cellW - 8, cellH, {
          seed: seedFor("fig1-cell-" + i), roughness: 1.3, stroke: "#1e1e1e", strokeWidth: 1.6
        });
        rect.setAttribute("data-cell", i);
        svg.appendChild(rect);
        var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", x + cellW / 2); txt.setAttribute("y", cellY + cellH / 2 + 6);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("class", "cell-value");
        txt.setAttribute("font-family", "var(--font-code)");
        txt.textContent = a[i];
        svg.appendChild(txt);
      }

      pairs.forEach(function (p, idx) {
        var i0 = p[0], j0 = p[1];
        var x1 = cellCenters[i0], x2 = cellCenters[j0];
        var dist = j0 - i0;
        var archHeight = 14 + dist * 11;
        var topY = cellY - archHeight;
        var d = "M " + x1 + " " + cellY + " Q " + ((x1 + x2) / 2) + " " + topY + " " + x2 + " " + cellY;
        var path = rc.path(d, { seed: seedFor("fig1-arc-" + i0 + "-" + j0), roughness: 1.4, stroke: "#6741d9", strokeWidth: 1.8 });
        path.setAttribute("fill", "none");
        path.style.cursor = "pointer";
        path.setAttribute("tabindex", "0");
        var hitD = d;
        var hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
        hit.setAttribute("d", hitD);
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("stroke-width", "16");
        hit.setAttribute("fill", "none");
        hit.style.cursor = "pointer";
        svg.appendChild(path);
        svg.appendChild(hit);

        function activate() {
          svg.querySelectorAll("path.arc-active").forEach(function (p2) { p2.classList.remove("arc-active"); p2.setAttribute("stroke", "#6741d9"); });
          path.classList.add("arc-active");
          path.setAttribute("stroke", "#e03131");
          svg.querySelectorAll("rect[data-cell]").forEach(function (r) { r.setAttribute("stroke", "#1e1e1e"); });
          var rectI = svg.querySelector('rect[data-cell="' + i0 + '"]');
          var rectJ = svg.querySelector('rect[data-cell="' + j0 + '"]');
          if (rectI) rectI.setAttribute("stroke", "#e03131");
          if (rectJ) rectJ.setAttribute("stroke", "#e03131");
          hoverMsg.textContent = "(" + a[i0] + ", " + a[j0] + "): " + a[i0] + " comes first but is larger.";
        }
        hit.addEventListener("mouseenter", activate);
        hit.addEventListener("click", activate);
        hit.addEventListener("focus", activate);
      });
    }

    function setArr(newArr, skipErr) {
      state.arr = newArr;
      if (!skipErr) err.textContent = "";
      render();
    }

    shuffleBtn.addEventListener("click", function () {
      rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e6)) % 2147483647);
      var a = state.arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      setArr(a);
    });
    reverseBtn.addEventListener("click", function () { setArr(state.arr.slice().reverse()); });
    sortBtn.addEventListener("click", function () { setArr(state.arr.slice().sort(function (x, y) { return x - y; })); });
    applyBtn.addEventListener("click", function () {
      var res = SC.parseIntsList(input.value, { min: 2, max: 10 });
      if (!res.ok) { err.textContent = res.error; return; }
      setArr(res.values);
    });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") applyBtn.click(); });

    render();
    window.addEventListener("resize", scheduleThrottled(render));
    return { render: render };
  }

  function scheduleThrottled(fn) {
    var t = null;
    return function () { clearTimeout(t); t = setTimeout(fn, 150); };
  }

  /* --------------------------------------------------- stepper + listing */
  function buildStepperAndListing(stepperRoot, listingRoot) {
    stepperRoot.innerHTML = ""; listingRoot.innerHTML = "";
    var PRESETS = {
      example: { label: "Example", arr: [4, 1, 3, 5, 2] },
      random: { label: "Random (8)" },
      sorted: { label: "Sorted (8)", arr: [1, 2, 3, 4, 5, 6, 7, 8] },
      reversed: { label: "Reversed (8)", arr: [8, 7, 6, 5, 4, 3, 2, 1] },
      nearly: { label: "Nearly sorted (8)" }
    };
    var SPEEDS = { slow: 1200, normal: 700, fast: 300 };

    var state = { steps: [], idx: 0, playing: false, speed: "normal", timer: null };

    var fig = el("div", { class: "fig-box frame-host" });
    sketchFrame(fig, { key: "fig2-box" });
    var content = el("div", { class: "frame-content" });

    var presetRow = el("div", { class: "preset-row" });
    var presetBtns = {};
    Object.keys(PRESETS).forEach(function (k) {
      var b = sketchButton(PRESETS[k].label, { key: "preset-" + k });
      presetBtns[k] = b;
      b.addEventListener("click", function () { applyPreset(k); });
      presetRow.appendChild(b);
    });
    content.appendChild(presetRow);

    var customRow = el("div", { class: "custom-row" });
    var customLabel = el("span", { style: "font-family:var(--font-hand);", text: "Your array:" });
    var customInput = el("input", { class: "sketch-input", type: "text", placeholder: "e.g. 5, 2, 9, 1", style: "min-width:200px;" });
    var customApply = sketchButton("Apply", { key: "custom-apply" });
    var customErr = el("span", { class: "err-inline" });
    customRow.appendChild(customLabel); customRow.appendChild(customInput); customRow.appendChild(customApply); customRow.appendChild(customErr);
    content.appendChild(customRow);

    var stage = el("div", { class: "array-stage" });
    content.appendChild(stage);

    var legend = el("div", { class: "stepper-legend", html:
      '<span><span class="legend-swatch legend-sorted"></span>sorted prefix</span>' +
      '<span><span class="legend-swatch legend-key"></span>key being inserted</span>' +
      '<span><span class="legend-swatch legend-rest"></span>not yet processed</span>' });
    content.appendChild(legend);

    var controlsRow = el("div", { class: "stepper-controls" });
    var playBtn = sketchButton("Play", { key: "ctrl-play" });
    var backBtn = sketchButton("◀ Step", { key: "ctrl-back" });
    var fwdBtn = sketchButton("Step ▶", { key: "ctrl-fwd" });
    var resetBtn = sketchButton("Reset", { key: "ctrl-reset" });
    controlsRow.appendChild(playBtn); controlsRow.appendChild(backBtn); controlsRow.appendChild(fwdBtn); controlsRow.appendChild(resetBtn);
    content.appendChild(controlsRow);

    var speedRow = el("div", { class: "speed-row" });
    speedRow.appendChild(el("span", { text: "Speed:" }));
    var speedBtns = {};
    ["slow", "normal", "fast"].forEach(function (s) {
      var b = sketchButton(s, { key: "speed-" + s });
      speedBtns[s] = b;
      b.addEventListener("click", function () { setSpeed(s); });
      speedRow.appendChild(b);
    });
    content.appendChild(speedRow);

    var scrub = el("input", { type: "range", min: "0", max: "0", value: "0", style: "width:100%;margin:8px 0;" });
    content.appendChild(scrub);

    var countersRow = el("div", { class: "stepper-counters" });
    var cComparisons = el("span", { html: "comparisons: <span class=\"count-num\">0</span>" });
    var cSwaps = el("span", { html: "swaps: <span class=\"count-num\">0</span>" });
    var cInv = el("span", { html: "inversions left: <span class=\"count-num\">0</span>" });
    countersRow.appendChild(cComparisons); countersRow.appendChild(cSwaps); countersRow.appendChild(cInv);
    content.appendChild(countersRow);

    var varsRow = el("div", { class: "vars-row", text: "i = –, j = –" });
    content.appendChild(varsRow);

    var statusLine = el("div", { class: "stepper-status" });
    content.appendChild(statusLine);

    fig.appendChild(content);
    stepperRoot.appendChild(fig);
    stepperRoot.appendChild(el("div", { class: "figure-caption", html: "<strong>Figure 2.</strong> Insertion sort on your input. The shaded region is the sorted prefix. Watch the inversion counter fall by exactly one with every swap." }));

    // Listing
    var listingWrap = el("div", { class: "component" });
    var listing = makeCodeListing(listingWrap, SC.PY.insertion, { key: "listing1" });
    listingRoot.appendChild(listingWrap);
    var listingCapRow = el("div", { style: "display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;" });
    listingCapRow.appendChild(el("div", { class: "listing-caption", html: "<strong>Listing 1.</strong> Insertion sort in Python. The highlighted line is the one the trace above is executing." }));
    var copyBtn = sketchButton("Copy", { key: "copy-listing" });
    copyBtn.addEventListener("click", function () {
      var text = SC.PY.insertion.code;
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      var old = copyBtn.querySelector(".frame-content").textContent;
      copyBtn.querySelector(".frame-content").textContent = "Copied!";
      setTimeout(function () { copyBtn.querySelector(".frame-content").textContent = old; }, 1200);
    });
    listingCapRow.appendChild(copyBtn);
    listingRoot.appendChild(listingCapRow);
    renderMath(stepperRoot);
    renderMath(listingRoot);

    function applyPreset(key) {
      Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.toggle("active", k === key); });
      var arr;
      if (key === "random") {
        var rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e6)) % 2147483647);
        arr = randPermutation(8, rng);
      } else if (key === "nearly") {
        arr = [1, 2, 3, 4, 5, 6, 7, 8];
        var rng2 = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e6)) % 2147483647);
        for (var s = 0; s < 2; s++) {
          var p = Math.floor(rng2() * 7);
          var t = arr[p]; arr[p] = arr[p + 1]; arr[p + 1] = t;
        }
      } else {
        arr = PRESETS[key].arr.slice();
      }
      loadArray(arr);
    }

    function loadArray(arr) {
      var trace = SC.insertionSortTrace(arr);
      state.steps = trace.steps;
      state.idx = 0;
      scrub.max = String(state.steps.length - 1);
      scrub.value = "0";
      renderStep(0, false);
    }

    function setSpeed(s) {
      state.speed = s;
      Object.keys(speedBtns).forEach(function (k) { speedBtns[k].classList.toggle("active", k === s); });
    }
    setSpeed("normal");

    function cellLayout(n, w) {
      var cellW = Math.min(76, (w - 20) / n);
      var totalW = cellW * n;
      var startX = (w - totalW) / 2;
      return { cellW: cellW, startX: startX };
    }

    function drawArray(step, highlightOverride) {
      stage.innerHTML = "";
      var w = Math.max(stage.clientWidth || fig.clientWidth || 600, 300);
      var h = 118;
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.setAttribute("width", "100%"); svg.setAttribute("height", h);
      stage.appendChild(svg);
      var rc = rough.svg(svg);
      var a = step.array, n = a.length;
      var L = cellLayout(n, w);
      var cellH = 50, cellY = 20;
      var hi = highlightOverride || step.highlight || [];
      for (var i = 0; i < n; i++) {
        var x = L.startX + i * L.cellW;
        var region = step.regions[i];
        var fillColor = region === "sorted" ? "#a5d8ff" : region === "key" ? "#ffec99" : "#ffffff";
        var fillStyle = region === "sorted" ? "hachure" : "solid";
        var isHi = hi.indexOf(i) !== -1;
        var rect = rc.rectangle(x + 4, cellY, L.cellW - 8, cellH, {
          seed: seedFor("stepper-cell-" + i), roughness: 1.3,
          stroke: isHi ? "#e03131" : "#1e1e1e", strokeWidth: isHi ? 2.6 : 1.6,
          fill: region === "rest" ? undefined : fillColor, fillStyle: fillStyle, fillWeight: 1.3
        });
        svg.appendChild(rect);
        var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", x + L.cellW / 2); txt.setAttribute("y", cellY + cellH / 2 + 6);
        txt.setAttribute("text-anchor", "middle"); txt.setAttribute("class", "cell-value");
        txt.textContent = a[i];
        svg.appendChild(txt);
        var lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", x + L.cellW / 2); lbl.setAttribute("y", cellY + cellH + 16);
        lbl.setAttribute("text-anchor", "middle"); lbl.setAttribute("class", "cell-region-label");
        lbl.textContent = region === "key" ? "key" : (region === "sorted" ? "sorted" : "");
        svg.appendChild(lbl);
      }
      return { svg: svg, layout: L, cellY: cellY, cellH: cellH };
    }

    function updateSideUI(step) {
      cComparisons.querySelector(".count-num").textContent = step.comparisons;
      cSwaps.querySelector(".count-num").textContent = step.swaps;
      cInv.querySelector(".count-num").textContent = step.inversionsLeft;
      varsRow.textContent = "i = " + (step.i == null ? "–" : step.i) + ", j = " + (step.j == null ? "–" : step.j);
      statusLine.textContent = step.message;
      listing.lineEls.forEach(function (lEl) {
        lEl.classList.toggle("current", Number(lEl.getAttribute("data-line")) === step.line);
      });
      scrub.value = String(state.idx);
    }

    function renderStep(idx, animate) {
      var prev = state.steps[state.idx];
      var step = state.steps[idx];
      var doAnim = animate && !reducedMotion && step.kind === "swap" && prev;
      state.idx = idx;
      if (doAnim) {
        animateSwap(prev, step, function () { drawArray(step); updateSideUI(step); });
      } else {
        drawArray(step);
        updateSideUI(step);
      }
    }

    function animateSwap(prevStep, step, done) {
      var info = drawArray(prevStep, step.highlight);
      var svg = info.svg, L = info.layout;
      var hi = step.highlight;
      var i0 = hi[0], i1 = hi[1];
      var dur = SPEEDS[state.speed];
      var x0 = L.startX + i0 * L.cellW + L.cellW / 2;
      var x1 = L.startX + i1 * L.cellW + L.cellW / 2;
      var dx = x1 - x0;
      var a = prevStep.array;
      var g0 = makeFloater(svg, x0, info.cellY, info.cellH, a[i0]);
      var g1 = makeFloater(svg, x1, info.cellY, info.cellH, a[i1]);
      var kf0 = [
        { transform: "translate(0px,0px)" },
        { transform: "translate(" + (dx / 2) + "px,-16px)" },
        { transform: "translate(" + dx + "px,0px)" }
      ];
      var kf1 = [
        { transform: "translate(0px,0px)" },
        { transform: "translate(" + (-dx / 2) + "px,-16px)" },
        { transform: "translate(" + (-dx) + "px,0px)" }
      ];
      var anim = g0.animate(kf0, { duration: dur, easing: "ease-in-out" });
      g1.animate(kf1, { duration: dur, easing: "ease-in-out" });
      anim.onfinish = function () { done(); };
    }
    function makeFloater(svg, x, y, h, value) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("x", x); txt.setAttribute("y", y + h / 2 + 6);
      txt.setAttribute("text-anchor", "middle"); txt.setAttribute("class", "cell-value");
      txt.textContent = value;
      g.appendChild(txt);
      svg.appendChild(g);
      return g;
    }

    function stepForward() {
      if (state.idx < state.steps.length - 1) renderStep(state.idx + 1, true);
      else pause();
    }
    function stepBack() {
      if (state.idx > 0) renderStep(state.idx - 1, false);
    }
    function play() {
      if (state.playing) return;
      state.playing = true;
      playBtn.querySelector(".frame-content").textContent = "Pause";
      tick();
    }
    function tick() {
      if (!state.playing) return;
      if (state.idx >= state.steps.length - 1) { pause(); return; }
      state.timer = setTimeout(function () {
        stepForward();
        tick();
      }, SPEEDS[state.speed]);
    }
    function pause() {
      state.playing = false;
      clearTimeout(state.timer);
      playBtn.querySelector(".frame-content").textContent = "Play";
    }

    playBtn.addEventListener("click", function () { state.playing ? pause() : play(); });
    fwdBtn.addEventListener("click", function () { pause(); stepForward(); });
    backBtn.addEventListener("click", function () { pause(); stepBack(); });
    resetBtn.addEventListener("click", function () { pause(); renderStep(0, false); });
    scrub.addEventListener("input", function () { pause(); renderStep(Number(scrub.value), false); });
    customApply.addEventListener("click", function () {
      var res = SC.parseIntsList(customInput.value, { min: 2, max: 12 });
      if (!res.ok) { customErr.textContent = res.error; return; }
      customErr.textContent = "";
      Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.remove("active"); });
      pause();
      loadArray(res.values);
    });
    customInput.addEventListener("keydown", function (e) { if (e.key === "Enter") customApply.click(); });

    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (!fig.isConnected) return;
      if (e.key === " ") { e.preventDefault(); state.playing ? pause() : play(); }
      else if (e.key === "ArrowRight") { pause(); stepForward(); }
      else if (e.key === "ArrowLeft") { pause(); stepBack(); }
    });

    applyPreset("example");
    window.addEventListener("resize", scheduleThrottled(function () { drawArray(state.steps[state.idx]); }));
    return { reload: loadArray };
  }

  /* --------------------------------------------------------------- plot */
  function buildCostPlot(root) {
    root.innerHTML = "";
    var fig = el("div", { class: "fig-box frame-host" });
    sketchFrame(fig, { key: "fig3-box" });
    var content = el("div", { class: "frame-content" });
    var plotHost = el("div", { class: "plot-box", style: "position:relative;" });
    content.appendChild(plotHost);
    var legend = el("div", { class: "plot-legend", html:
      '<span style="color:#1971c2">— best (n−1)</span>' +
      '<span style="color:#2f9e44">— average (exact)</span>' +
      '<span style="color:#e03131">— worst n(n−1)/2</span>' +
      '<span style="color:#6741d9">● mean of 200 samples</span>' });
    content.appendChild(legend);
    var resampleBtn = sketchButton("Resample", { key: "fig3-resample" });
    content.appendChild(el("div", { class: "btn-row" }, [resampleBtn]));
    fig.appendChild(content);
    root.appendChild(fig);
    root.appendChild(el("div", { class: "figure-caption", html:
      "<strong>Figure 3.</strong> Comparisons made by insertion sort. Dots: the mean over 200 random permutations for each $n$. " +
      '<span class="tag tag-empirical">[empirical]</span> Curves: $n-1$ (sorted input), $\\frac{n(n-1)}{4} + n - H_n$ (exact average), $\\frac{n(n-1)}{2}$ (reversed input). ' +
      '<span class="tag tag-proof">[proof]</span>' }));
    renderMath(root);

    var tooltip = el("div", { class: "plot-tooltip", hidden: true });
    document.body.appendChild(tooltip);

    var seed = 12345;
    function draw() {
      var data = SC.sampleCostPlot(seed);
      plotHost.innerHTML = "";
      var w = Math.max(plotHost.clientWidth || fig.clientWidth || 700, 280);
      var narrow = w < 420;
      var h = narrow ? 240 : 320;
      var margin = { l: 40, r: 10, t: 14, b: 28 };
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.setAttribute("width", "100%"); svg.setAttribute("height", h);
      plotHost.appendChild(svg);
      var rc = rough.svg(svg);

      var maxN = 40, maxY = SC.costWorst(40);
      var xScale = function (n) { return margin.l + (n / maxN) * (w - margin.l - margin.r); };
      var yScale = function (c) { return (h - margin.b) - (c / maxY) * (h - margin.t - margin.b); };

      svg.appendChild(rc.line(margin.l, h - margin.b, w - margin.r, h - margin.b, { seed: 1, roughness: 1, stroke: "#1e1e1e" }));
      svg.appendChild(rc.line(margin.l, h - margin.b, margin.l, margin.t, { seed: 2, roughness: 1, stroke: "#1e1e1e" }));

      var xticks = narrow ? [2, 10, 20, 30, 40] : [2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
      xticks.forEach(function (n) {
        var x = xScale(n);
        var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", h - margin.b + 16);
        t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "11"); t.setAttribute("font-family", "var(--font-hand)");
        t.textContent = n;
        svg.appendChild(t);
      });
      [0, Math.round(maxY / 2), Math.round(maxY)].forEach(function (c) {
        var y = yScale(c);
        var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", margin.l - 6); t.setAttribute("y", y + 4);
        t.setAttribute("text-anchor", "end"); t.setAttribute("font-size", "11"); t.setAttribute("font-family", "var(--font-hand)");
        t.textContent = c;
        svg.appendChild(t);
      });

      function curvePath(fn) {
        var d = "";
        for (var n = 2; n <= maxN; n++) {
          var x = xScale(n), y = yScale(fn(n));
          d += (n === 2 ? "M " : "L ") + x + " " + y + " ";
        }
        return d;
      }
      var bestPath = rc.path(curvePath(SC.costBest), { seed: 101, roughness: 1, stroke: "#1971c2", strokeWidth: 2 });
      bestPath.setAttribute("fill", "none"); svg.appendChild(bestPath);
      var avgPath = rc.path(curvePath(SC.costAvgExact), { seed: 102, roughness: 1, stroke: "#2f9e44", strokeWidth: 2 });
      avgPath.setAttribute("fill", "none"); svg.appendChild(avgPath);
      var worstPath = rc.path(curvePath(SC.costWorst), { seed: 103, roughness: 1, stroke: "#e03131", strokeWidth: 2 });
      worstPath.setAttribute("fill", "none"); svg.appendChild(worstPath);

      data.forEach(function (d, idx) {
        var x = xScale(d.n), yMean = yScale(d.mean), yMin = yScale(d.min), yMax = yScale(d.max);
        var bar = rc.line(x, yMin, x, yMax, { seed: seedFor("bar-" + d.n), roughness: 1, stroke: "#6741d9", strokeWidth: 1.2 });
        svg.appendChild(bar);
        var dot = rc.circle(x, yMean, 7, { seed: seedFor("dot-" + d.n), roughness: 1.2, stroke: "#6741d9", fill: "#d0bfff", fillStyle: "solid" });
        svg.appendChild(dot);
        var hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        hit.setAttribute("cx", x); hit.setAttribute("cy", yMean); hit.setAttribute("r", 10);
        hit.setAttribute("fill", "transparent"); hit.style.cursor = "pointer";
        hit.setAttribute("tabindex", "0");
        var text = "n = " + d.n + ": mean " + d.mean.toFixed(1) + " (min " + d.min + ", max " + d.max + ")";
        function show(ev) {
          tooltip.hidden = false;
          tooltip.textContent = text;
          var rect = plotHost.getBoundingClientRect();
          tooltip.style.left = (rect.left + x + window.scrollX) + "px";
          tooltip.style.top = (rect.top + yMean + window.scrollY) + "px";
        }
        hit.addEventListener("mouseenter", show);
        hit.addEventListener("focus", show);
        hit.addEventListener("click", show);
        hit.addEventListener("mouseleave", function () { tooltip.hidden = true; });
        svg.appendChild(hit);
      });
    }
    resampleBtn.addEventListener("click", function () { seed = Math.floor(Math.random() * 1e8); draw(); });
    draw();
    window.addEventListener("resize", scheduleThrottled(draw));
    return { redraw: draw };
  }

  /* --------------------------------------------------------- knowledge view */
  function buildKnowledgeView(root) {
    root.innerHTML = "";
    var data = SC.buildKnowledgeStates();
    var fig = el("div", { class: "fig-box frame-host" });
    sketchFrame(fig, { key: "fig4-box" });
    var content = el("div", { class: "frame-content" });
    var stage = el("div", { class: "kview-stage", style: "height:220px;" });
    content.appendChild(stage);

    var controls = el("div", { class: "kview-controls" });
    var prevBtn = sketchButton("←", { key: "kv-prev" });
    var slider = el("input", { type: "range", min: "0", max: "8", value: "0", class: "kview-range" });
    var nextBtn = sketchButton("→", { key: "kv-next" });
    controls.appendChild(prevBtn); controls.appendChild(slider); controls.appendChild(nextBtn);
    content.appendChild(controls);

    var statusBox = el("div", { class: "kview-status" });
    content.appendChild(statusBox);
    fig.appendChild(content);
    root.appendChild(fig);
    root.appendChild(el("div", { class: "figure-caption", html:
      "<strong>Figure 4.</strong> What insertion sort knows about $[4,1,3,5,2]$ after each comparison. A line from $x$ up to $y$ means $x < y$ is known, directly or by transitivity. The number of orderings still possible starts at $120$ and must reach $1$." }));
    renderMath(root);

    var k = 0;
    function render() {
      var s = data.states[k];
      slider.value = String(k);
      stage.innerHTML = "";
      var w = Math.max(stage.clientWidth || fig.clientWidth || 600, 280);
      var h = 220;
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.setAttribute("width", "100%"); svg.setAttribute("height", h);
      stage.appendChild(svg);
      var rc = rough.svg(svg);

      var maxLevel = Math.max.apply(null, data.values.map(function (v) { return s.level[v]; }));
      var levelGap = (h - 60) / Math.max(1, maxLevel);
      var levels = {};
      data.values.forEach(function (v) {
        var lv = s.level[v];
        (levels[lv] = levels[lv] || []).push(v);
      });
      Object.keys(levels).forEach(function (lv) {
        levels[lv].sort(function (a, b) { return data.posInInput[a] - data.posInInput[b]; });
      });
      var pos = {};
      Object.keys(levels).forEach(function (lv) {
        var arr = levels[lv];
        var slotW = w / (arr.length + 1);
        arr.forEach(function (v, i) {
          pos[v] = { x: slotW * (i + 1), y: (h - 30) - lv * levelGap };
        });
      });

      var addedSet = {};
      s.added.forEach(function (e) { addedSet[e[0] + "-" + e[1]] = true; });
      s.edges.forEach(function (e2) {
        var p1 = pos[e2[0]], p2 = pos[e2[1]];
        var isNew = addedSet[e2[0] + "-" + e2[1]];
        var line = rc.line(p1.x, p1.y, p2.x, p2.y, {
          seed: seedFor("edge-" + e2[0] + "-" + e2[1]), roughness: 1.3,
          stroke: isNew ? "#e03131" : "#1e1e1e", strokeWidth: isNew ? 2.6 : 1.6
        });
        svg.appendChild(line);
      });
      data.values.forEach(function (v) {
        var p = pos[v];
        var circ = rc.circle(p.x, p.y, 34, { seed: seedFor("node-" + v), roughness: 1.3, stroke: "#1e1e1e", strokeWidth: 1.8, fill: "#ffec99", fillStyle: "solid" });
        svg.appendChild(circ);
        var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", p.x); txt.setAttribute("y", p.y + 5);
        txt.setAttribute("text-anchor", "middle"); txt.setAttribute("class", "cell-value");
        txt.textContent = v;
        svg.appendChild(txt);
      });

      var bitsTxt = "bits remaining: $\\log_2 " + s.count + " \\approx " + s.bits.toFixed(2) + "$";
      var countTxt = s.prevCount != null ? (s.prevCount + " → " + s.count) : String(s.count);
      statusBox.innerHTML =
        "<div>" + (s.comparedMsg ? ("comparison " + k + " of 8: " + s.comparedMsg) : "start: no comparisons made yet") + "</div>" +
        "<div>orderings still possible: " + countTxt + "</div>" +
        "<div>" + bitsTxt + "</div>";
      renderMath(statusBox);
    }
    slider.addEventListener("input", function () { k = Number(slider.value); render(); });
    prevBtn.addEventListener("click", function () { k = Math.max(0, k - 1); render(); });
    nextBtn.addEventListener("click", function () { k = Math.min(8, k + 1); render(); });
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { k = Math.min(8, k + 1); render(); }
      else if (e.key === "ArrowLeft") { k = Math.max(0, k - 1); render(); }
    });
    render();
    window.addEventListener("resize", scheduleThrottled(render));
    return { render: render };
  }

  /* -------------------------------------------------------------- checkpoint */
  function buildCheckpoint(root, gateEls) {
    root.innerHTML = "";
    var card = el("div", { class: "card frame-host" });
    sketchFrame(card, { key: "checkpoint-card" });
    var body = el("div", { class: "frame-content" });
    body.appendChild(el("p", { html: "Four questions. Each wrong answer explains itself. The ledger below opens once you've attempted all four, or press ‘continue anyway’, which records the skipped questions as gaps." }));

    var attempted = { q1: false, q2: false, q3: false, q4: false };
    function maybeUnlock() {
      if (Object.keys(attempted).every(function (k) { return attempted[k]; })) unlockLedger([]);
    }

    // Q1
    body.appendChild(el("p", { html: "<strong>Q1.</strong> An algorithm may only swap neighbours. What is the fewest number of swaps it can use to sort $[5,4,3,2,1]$?" }));
    buildMCQ(body, [
      { key: "a", label: "4", correct: false, text: "That's $n-1$, as if each element needed a single move. But the 1 alone must travel four positions, the 2 three, and so on. Count inversions instead." },
      { key: "b", label: "5", correct: false, text: "One swap per element isn't enough: a swap moves just two elements, one position each." },
      { key: "c", label: "10", correct: true, text: "Right: $I = \\binom{5}{2} = 10$, and Theorem 1 says no adjacent-swap algorithm can do better." },
      { key: "d", label: "20", correct: false, text: "That counts every pair twice, in both orders. An inversion is a pair of positions $i < j$." }
    ], { onAnswered: function () { attempted.q1 = true; maybeUnlock(); } });

    // Q2
    body.appendChild(el("p", { style: "margin-top:1.4em;", html: "<strong>Q2.</strong> How many comparisons does <code>insertion_sort</code> make on $[4, 1, 3, 5, 2]$?" }));
    buildNumericCheck(body, {
      key: "q2", answer: 8,
      feedbackCorrect: "Right: $I + (n-1) - 1 = 5 + 4 - 1 = 8$. The first key, 1, reaches the front, so its loop ends on `j > 0` without a comparison.",
      feedbackWrongMap: [
        { value: "5", text: "That's the number of swaps, $I(a)$. Add the final false test that ends each insertion, except for a key that reaches the front." },
        { value: "9", text: "Almost. The key 1 reaches position 0, so its loop ends on `j > 0` without comparing." },
        { value: "10", text: "That's $\\binom{5}{2}$, the count for repeated selection. Insertion sort adapts to the input." }
      ],
      feedbackGeneric: "Not quite. Step through Figure 2 with the Example preset and watch the comparison counter.",
      onAnswered: function () { attempted.q2 = true; maybeUnlock(); }
    });

    // Q3
    body.appendChild(el("p", { style: "margin-top:1.4em;", html: "<strong>Q3.</strong> Theorem 1 says adjacent-swap algorithms need $\\Omega(n^2)$ swaps in the worst case. What does it tell us about sorting in general?" }));
    buildMCQ(body, [
      { key: "a", label: "Every sorting algorithm needs $\\Omega(n^2)$ time in the worst case.", correct: false, text: "That would be a bound on the <em>problem</em>. Theorem 1 covers only algorithms that move elements between neighbours." },
      { key: "b", label: "Nothing about algorithms that can move an element far in one step.", correct: true, text: "Right. It's a bound on a class of algorithms. Whether sorting itself needs $n^2$ work is still an open question for us." },
      { key: "c", label: "Every sorting algorithm needs $\\Omega(n^2)$ comparisons.", correct: false, text: "Theorem 1 counts swaps, not comparisons, and it covers only one class of algorithms." },
      { key: "d", label: "Insertion sort needs $\\Omega(n^2)$ swaps on every input.", correct: false, text: "Not on every input: on sorted input it makes $0$ swaps. The bound is about the worst case, and, as §5 showed, the average case." }
    ], { onAnswered: function () { attempted.q3 = true; maybeUnlock(); } });

    // Q4
    body.appendChild(el("p", { style: "margin-top:1.4em;", html: "<strong>Q4.</strong> This version is meant to be insertion sort. Click the line that is wrong." }));
    var q4wrap = el("div", {});
    var q4Listing = makeCodeListing(q4wrap, SC.PY.buggy, {
      key: "buggy-listing", clickable: true,
      onLineClick: function (lnum) {
        var fb = {
          3: "That's fine. a[0:1] is already sorted, so the first element to insert is a[1].",
          5: "That's fine. The key starts at position i.",
          6: "Right. When j = 0, a[j - 1] is a[-1]. In Python that isn't an error: it's the last element. The loop can then swap the first element with the last one.",
          7: "That's fine. Python evaluates the right-hand side before assigning, so the tuple swap is safe.",
          8: "That's fine. Decrementing j is what moves the key left."
        };
        var text = fb[lnum] || "That line is fine. Look at the loop condition.";
        setFeedback(q4wrap, lnum === SC.PY.buggy.bugLine ? "good" : "bad", text);
        attempted.q4 = true; maybeUnlock();
        if (lnum === SC.PY.buggy.bugLine && !q4wrap.querySelector(".run-buggy-btn")) {
          var runBtn = sketchButton("Run the buggy version on [2, 1]", { key: "run-buggy" });
          runBtn.classList.add("run-buggy-btn");
          runBtn.style.marginTop = "10px";
          runBtn.addEventListener("click", function () {
            var out = SC.buggyInsertion([2, 1]);
            var outStr = "[" + out.join(", ") + "]";
            var sorted = out.every(function (v, i, arr) { return i === 0 || arr[i - 1] <= v; });
            setFeedback(q4wrap, "bad", "returns " + outStr + ": " + (sorted ? "sorted (unexpected)" : "not sorted") + ".");
          });
          q4wrap.appendChild(runBtn);
        }
      }
    });
    body.appendChild(q4wrap);

    var continueBtn = sketchButton("continue anyway", { key: "continue-anyway" });
    continueBtn.style.marginTop = "14px";
    continueBtn.addEventListener("click", function () {
      var gaps = Object.keys(attempted).filter(function (k) { return !attempted[k]; });
      unlockLedger(gaps);
    });
    body.appendChild(continueBtn);

    card.appendChild(body);
    root.appendChild(card);
    renderMath(card);

    var ledgerRoot = gateEls[0];
    var ledgerGate = wireGate(gateEls, "");
    ledgerGate.skipBtn.hidden = true; // no skip link for checkpoint gate itself; gated via attempts/continue

    function unlockLedger(gaps) {
      ledgerGate.reveal();
      if (gaps.length) {
        var note = ledgerRoot.querySelector(".gap-note");
        if (!note) {
          note = el("div", { class: "gap-note feedback bad" });
          ledgerRoot.insertBefore(note, ledgerRoot.firstChild);
        }
        var names = { q1: "Q1", q2: "Q2", q3: "Q3", q4: "Q4" };
        note.textContent = "Skipped: " + gaps.map(function (g) { return names[g]; }).join(", ") + ". These are gaps in your ledger, not failures — come back to them when you can.";
      }
    }
  }

  /* --------------------------------------------------------------- export */
  SC.build = {
    prereqCheck: buildPrereqCheck,
    predictBlock: buildPredictBlock,
    inversionDiagram: buildInversionDiagram,
    stepperAndListing: buildStepperAndListing,
    costPlot: buildCostPlot,
    knowledgeView: buildKnowledgeView,
    checkpoint: buildCheckpoint,
    sketchFrame: sketchFrame,
    sketchButton: sketchButton,
    wireGate: wireGate,
    el: el
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderMath(document.body);
    if (revealAll) {
      document.querySelectorAll("details.sketch-details").forEach(function (d) { d.open = true; });
    }
    if (typeof window.initLessonComponents === "function") window.initLessonComponents();
    scheduleRedraw();
  });

})(typeof window !== "undefined" ? window : this);
