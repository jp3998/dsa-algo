/* theme.js — DOM wiring and rendering for the "Preprint" theme sample.
   Depends on engine.js (window.SC) and, where math is present, KaTeX auto-render. */
(function () {
  "use strict";

  var REVEAL = /[?&]reveal=1\b/.test(location.search);
  var REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------- tiny DOM helpers ----------------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function renderMathIn(el) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      } catch (e) { /* no-op: never let math rendering break the page */ }
    }
  }
  function tagEl(name) {
    return h("span", { class: "tag" }, ["[" + name + "]"]);
  }
  function byId(id) { return document.getElementById(id); }

  // ============================================================
  // Generic question widgets: numeric check, multiple choice
  // ============================================================

  function buildNumeric(opts) {
    // opts: { prompt (string, may contain $..$), answer (string), feedbacks: [{test(value)->bool, text}],
    //         correctText, genericWrongText, onCommit(correct) }
    var wrap = h("div", { class: "exq" });
    var p = h("p", { html: opts.prompt });
    wrap.appendChild(p);
    var row = h("div", { class: "numrow" });
    var input = h("input", { type: "text", inputmode: "numeric", class: "blank", "aria-label": "numeric answer" });
    var btn = h("button", { type: "button", class: "scbtn" }, ["check"]);
    row.appendChild(input); row.appendChild(btn);
    wrap.appendChild(row);
    var fb = h("div", { class: "feedback", style: "display:none;" });
    wrap.appendChild(fb);

    var committed = false;

    function check() {
      var raw = input.value.trim();
      if (raw === "") return;
      var correct = raw === String(opts.answer).trim();
      fb.style.display = "";
      fb.classList.toggle("wrong", !correct);
      var text = opts.genericWrongText;
      if (correct) {
        text = opts.correctText;
      } else if (opts.feedbacks) {
        for (var i = 0; i < opts.feedbacks.length; i++) {
          if (opts.feedbacks[i].value === raw) { text = opts.feedbacks[i].text; break; }
        }
      }
      fb.innerHTML = "";
      fb.appendChild(h("span", { class: "fblabel" }, [correct ? "Right." : "Remark."]));
      fb.appendChild(h("span", { html: text }));
      renderMathIn(fb);
      committed = true;
      if (opts.onCommit) opts.onCommit(correct);
    }
    btn.addEventListener("click", check);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); check(); }
    });
    wrap._isAttempted = function () { return committed; };
    return wrap;
  }

  function buildMC(opts) {
    // opts: { prompt, options: [{letter, text, feedback, correct}], onCommit(correct) }
    var wrap = h("div", { class: "exq" });
    wrap.appendChild(h("p", { html: opts.prompt }));
    var ul = h("ul", { class: "options" });
    var fb = h("div", { class: "feedback", style: "display:none;" });
    var committed = false;
    var buttons = [];

    opts.options.forEach(function (o) {
      var li = h("li");
      var b = h("button", { type: "button", class: "opt-btn" }, [
        h("span", { class: "radio" }),
        h("span", { class: "optlabel", html: "(" + o.letter + ") " + o.text })
      ]);
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.classList.remove("chosen"); });
        b.classList.add("chosen");
        if (o.correct) b.classList.add("correct");
        fb.style.display = "";
        fb.classList.toggle("wrong", !o.correct);
        fb.innerHTML = "";
        fb.appendChild(h("span", { class: "fblabel" }, [o.correct ? "Right." : "Remark."]));
        fb.appendChild(h("span", { html: o.feedback }));
        renderMathIn(fb);
        committed = true;
        if (opts.onCommit) opts.onCommit(o.correct);
      });
      buttons.push(b);
      li.appendChild(b);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    wrap.appendChild(fb);
    wrap._isAttempted = function () { return committed; };
    return wrap;
  }

  // ============================================================
  // Gating helper (predict-first blocks)
  // ============================================================
  function wireGate(exboxEl, questionWidget, gatedEl, skipLabel) {
    gatedEl.classList.add("gated");
    if (!REVEAL) gatedEl.classList.add("hidden");
    var skipWrap = h("div", { class: "gate-skip" });
    var skipBtn = h("button", { type: "button", class: "scbtn" }, [skipLabel || "skip, just show me"]);
    skipWrap.appendChild(skipBtn);
    exboxEl.appendChild(skipWrap);

    function reveal() {
      gatedEl.classList.remove("hidden");
      skipWrap.style.display = "none";
    }
    if (REVEAL) skipWrap.style.display = "none";
    skipBtn.addEventListener("click", reveal);
    var origOnCommit = questionWidget._notifyCommit;
    questionWidget.addEventListener("ex-commit", reveal);
  }

  // Patches buildNumeric/buildMC commit to also fire a DOM event so wireGate can listen generically.
  function withCommitEvent(widget, onCommitFn) {
    var fire = function (correct) {
      widget.dispatchEvent(new CustomEvent("ex-commit", { detail: { correct: correct } }));
      if (onCommitFn) onCommitFn(correct);
    };
    return fire;
  }

  // ============================================================
  // prereq-check
  // ============================================================
  function buildPrereqCheck(container) {
    var box = h("div", { class: "exbox" });
    box.appendChild(h("div", { class: "exlabel" }, ["Before you start"]));
    box.appendChild(h("div", { class: "exintro" }, ["Two quick questions. If either goes wrong, revisit the lesson it points to."]));

    var p1 = buildNumeric({
      prompt: "<strong>P1.</strong> How many comparisons does it take to verify that an array of $8$ distinct keys is sorted?",
      answer: "7",
      correctText: "Right: one comparison per adjacent pair, and transitivity does the rest.",
      feedbacks: [
        { value: "28", text: "That's $\\binom{8}{2}$, every pair. You only need the adjacent pairs; transitivity covers the others. Revisit Lesson 1, &sect;2." },
        { value: "8", text: "Off by one: 8 elements have 7 adjacent pairs." }
      ],
      genericWrongText: "Not quite. Think about which pairs you actually need to compare. Revisit Lesson 1, &sect;2."
    });
    box.appendChild(p1);

    var p2 = buildMC({
      prompt: "<strong>P2.</strong> Repeated selection runs once on a sorted array and once on a reversed array of the same length. On the sorted one it makes:",
      options: [
        { letter: "a", text: "fewer comparisons.", correct: false, feedback: "That's the intuition this lesson is about, but repeated selection can't use it. To be sure an element is the smallest remaining, it must compare it with every remaining element, whatever the input looks like. Revisit Lesson 2." },
        { letter: "b", text: "the same number of comparisons.", correct: true, feedback: "Right. The count is $n(n-1)/2$ regardless of the input. That rigidity is what this lesson tries to escape." },
        { letter: "c", text: "more comparisons.", correct: false, feedback: "No: the count doesn't depend on the input at all. Revisit Lesson 2." }
      ]
    });
    box.appendChild(p2);
    container.appendChild(box);
    renderMathIn(box);
  }

  // ============================================================
  // predict-inversions (gates: inversion diagram + rest of §1)
  // ============================================================
  function buildPredictInversions(container, gatedEl) {
    var box = h("div", { class: "exbox" });
    box.appendChild(h("div", { class: "exlabel" }, ["Predict first"]));
    var widget = buildNumeric({
      prompt: "Before reading on: how many inversions does $a = [4, 1, 3, 5, 2]$ have?",
      answer: "5",
      correctText: "Exactly right.",
      feedbacks: [
        { value: "10", text: "That's the number of pairs, $\\binom{5}{2}$. Only some of them are out of order." },
        { value: "4", text: "Close. One pair is easy to miss: check $(3, 2)$." }
      ],
      genericWrongText: "Not quite. Go through each element and count the smaller elements to its right.",
      onCommit: function (correct) {
        var reveal = h("div", { class: "reveal-note", html: "Five: $(4,1)$, $(4,3)$, $(4,2)$, $(3,2)$ and $(5,2)$. Each is a pair of values where the larger one comes first. The diagram below draws them." });
        renderMathIn(reveal);
        widget.appendChild(reveal);
        widget.dispatchEvent(new CustomEvent("ex-commit"));
      }
    });
    box.appendChild(widget);
    container.appendChild(box);
    wireGate(box, widget, gatedEl);
    renderMathIn(box);
  }

  // ============================================================
  // Figure 1: inversion diagram
  // ============================================================
  function parseArrayInput(text, minN, maxN) {
    var parts = text.split(/[\s,]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length; });
    if (parts.length < minN || parts.length > maxN) {
      return { error: "Enter between " + minN + " and " + maxN + " distinct integers." };
    }
    var nums = [];
    for (var i = 0; i < parts.length; i++) {
      if (!/^-?\d+$/.test(parts[i])) return { error: "Use whole numbers only, separated by commas or spaces." };
      nums.push(parseInt(parts[i], 10));
    }
    var uniq = {};
    for (var j = 0; j < nums.length; j++) {
      if (uniq[nums[j]]) return { error: "The values must be distinct." };
      uniq[nums[j]] = true;
    }
    return { values: nums };
  }

  function drawArrayCells(svg, arr, opts) {
    // opts: { x0, y0, cellW, cellH, fillFor(i), strokeFor(i), labelClass }
    var cells = [];
    for (var i = 0; i < arr.length; i++) {
      var x = opts.x0 + i * opts.cellW;
      var g = svgEl("g", { "data-idx": i });
      var fill = opts.fillFor ? opts.fillFor(i) : "#fff";
      var stroke = opts.strokeFor ? opts.strokeFor(i) : "#111";
      var rect = svgEl("rect", {
        x: x, y: opts.y0, width: opts.cellW, height: opts.cellH,
        fill: fill, stroke: stroke, "stroke-width": opts.strokeWidth || 1.4
      });
      g.appendChild(rect);
      if (opts.hatch && opts.hatch(i)) {
        rect.setAttribute("fill", "url(#hatchfill)");
      }
      var text = svgEl("text", {
        x: x + opts.cellW / 2, y: opts.y0 + opts.cellH / 2 + 5,
        "text-anchor": "middle", class: "cellval"
      });
      text.textContent = arr[i];
      g.appendChild(text);
      svg.appendChild(g);
      cells.push({ g: g, rect: rect, x: x, idx: i });
    }
    return cells;
  }

  function ensureHatchDef(svg) {
    if (svg.querySelector("#hatchfill")) return;
    var defs = svgEl("defs", {});
    var pattern = svgEl("pattern", { id: "hatchfill", width: 6, height: 6, patternTransform: "rotate(45)", patternUnits: "userSpaceOnUse" });
    pattern.appendChild(svgEl("rect", { width: 6, height: 6, fill: "#c9c9c9" }));
    pattern.appendChild(svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#6b6b6b", "stroke-width": 2 }));
    defs.appendChild(pattern);
    svg.insertBefore(defs, svg.firstChild);
  }

  function buildInversionDiagram(container) {
    var DEFAULT = [4, 1, 3, 5, 2];
    var state = { arr: DEFAULT.slice() };

    var fig = h("figure", {});
    var box = h("div", { class: "figbox" });
    var topline = h("div", { style: "display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;" });
    var countEl = h("div", { class: "statusline", style: "margin:0;" }, ["Inversions: " + SC.countInversions(state.arr)]);
    topline.appendChild(countEl);
    box.appendChild(topline);

    var svgWrap = h("div", {});
    var svg = svgEl("svg", { width: "100%", viewBox: "0 0 620 170", preserveAspectRatio: "xMinYMin meet" });
    ensureHatchDef(svg);
    svgWrap.appendChild(svg);
    box.appendChild(svgWrap);

    var hoverLine = h("div", { class: "legend", style: "min-height:1.3em;" }, ["Hover or tap an arc to read it."]);
    box.appendChild(hoverLine);

    var controls = h("div", { class: "btnrow" });
    var textInput = h("input", { type: "text", class: "blank", style: "width:14em;text-align:left;font-family:var(--font-mono);font-size:13px;", placeholder: "e.g. 4, 1, 3, 5, 2" });
    var applyBtn = h("button", { type: "button", class: "scbtn" }, ["apply"]);
    var shuffleBtn = h("button", { type: "button", class: "scbtn" }, ["shuffle"]);
    var reverseBtn = h("button", { type: "button", class: "scbtn" }, ["reverse"]);
    var sortBtn = h("button", { type: "button", class: "scbtn" }, ["sort"]);
    controls.appendChild(textInput);
    controls.appendChild(applyBtn);
    controls.appendChild(shuffleBtn);
    controls.appendChild(reverseBtn);
    controls.appendChild(sortBtn);
    var errEl = h("div", { class: "inlineerr" });
    box.appendChild(controls);
    box.appendChild(errEl);

    fig.appendChild(box);
    var cap = h("figcaption", {}, [
      h("span", { class: "fignum" }, ["Figure 1. "]),
      "Every arc joins one inverted pair. Edit the array or shuffle it, and the count updates."
    ]);
    fig.appendChild(cap);
    container.appendChild(fig);

    function render() {
      var arr = state.arr;
      var n = arr.length;
      svg.innerHTML = "";
      ensureHatchDef(svg);
      var usableW = 600;
      var cellW = Math.min(64, (usableW - 20) / n);
      var totalW = cellW * n;
      var x0 = (620 - totalW) / 2;
      var y0 = 110;
      var cellH = 40;

      var cells = drawArrayCells(svg, arr, { x0: x0, y0: y0, cellW: cellW, cellH: cellH, strokeWidth: 1.2 });
      var pairs = SC.listInversionPairs(arr);

      pairs.forEach(function (p) {
        var i = p[0], j = p[1];
        var cxi = x0 + i * cellW + cellW / 2;
        var cxj = x0 + j * cellW + cellW / 2;
        var span = Math.abs(cxj - cxi);
        var rx = span / 2;
        var ry = Math.min(40, 14 + span * 0.18);
        var midx = (cxi + cxj) / 2;
        var topY = y0 - 6;
        var d = "M " + cxi + " " + topY + " A " + rx + " " + ry + " 0 0 1 " + cxj + " " + topY;
        var path = svgEl("path", {
          d: d, fill: "none", stroke: "#111", "stroke-width": 0.8, class: "arc",
          "data-i": i, "data-j": j
        });
        svg.appendChild(path);
        var hit = svgEl("path", {
          d: d, fill: "none", stroke: "transparent", "stroke-width": 14, class: "arc",
          "data-i": i, "data-j": j, style: "cursor:pointer;"
        });
        svg.appendChild(hit);

        function activate() {
          svg.querySelectorAll(".arc").forEach(function (a) { a.setAttribute("stroke", a.getAttribute("stroke") === "transparent" ? "transparent" : "#111"); a.setAttribute("stroke-width", a.classList.contains("arc") && a.getAttribute("stroke-width") == 14 ? 14 : 0.8); });
          cells.forEach(function (c) { c.rect.setAttribute("stroke", "#111"); c.rect.setAttribute("stroke-width", 1.2); });
          path.setAttribute("stroke", "#9b1c1c");
          path.setAttribute("stroke-width", 1.6);
          cells[i].rect.setAttribute("stroke", "#9b1c1c");
          cells[i].rect.setAttribute("stroke-width", 2.2);
          cells[j].rect.setAttribute("stroke", "#9b1c1c");
          cells[j].rect.setAttribute("stroke-width", 2.2);
          hoverLine.textContent = "(" + arr[i] + ", " + arr[j] + "): " + arr[i] + " comes first but is larger.";
        }
        hit.addEventListener("mouseenter", activate);
        hit.addEventListener("focus", activate);
        hit.addEventListener("click", activate);
        hit.setAttribute("tabindex", "0");
      });

      countEl.textContent = "Inversions: " + pairs.length;
    }

    function applyArray(newArr) {
      state.arr = newArr;
      errEl.textContent = "";
      render();
    }

    applyBtn.addEventListener("click", function () {
      var res = parseArrayInput(textInput.value, 2, 10);
      if (res.error) { errEl.textContent = res.error; return; }
      applyArray(res.values);
    });
    textInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); applyBtn.click(); }
    });
    shuffleBtn.addEventListener("click", function () {
      var rng = SC.mulberry32(SC.newSeed());
      applyArray(SC.shuffleWith(state.arr, rng));
    });
    reverseBtn.addEventListener("click", function () {
      applyArray(state.arr.slice().reverse());
    });
    sortBtn.addEventListener("click", function () {
      applyArray(state.arr.slice().sort(function (a, b) { return a - b; }));
    });

    render();
  }

  // ============================================================
  // predict-swap (gates: Lemma 1 + its proof)
  // ============================================================
  function buildPredictSwap(container, gatedEl) {
    var box = h("div", { class: "exbox" });
    box.appendChild(h("div", { class: "exlabel" }, ["Predict first"]));
    var widget = buildMC({
      prompt: "We swap an adjacent inverted pair. How many inversions does that remove?",
      options: [
        { letter: "a", text: "Exactly one.", correct: true, feedback: "Right. And the proof shows why it can never be more." },
        { letter: "b", text: "At least one, sometimes more.", correct: false, feedback: "It feels as if moving a large element rightward could fix several pairs at once. But check which pairs actually change their relative order." },
        { letter: "c", text: "It depends on the other elements.", correct: false, feedback: "The other elements matter less than you'd think: relative to the swapped pair, each of them stays on the same side." },
        { letter: "d", text: "One, but it may create new ones.", correct: false, feedback: "Only the swapped pair changes order. It goes from inverted to not inverted, and nothing else changes." }
      ],
      onCommit: function () { widget.dispatchEvent(new CustomEvent("ex-commit")); }
    });
    box.appendChild(widget);
    container.appendChild(box);
    wireGate(box, widget, gatedEl);
    renderMathIn(box);
  }

  // ============================================================
  // predict-total-swaps (gates: stepper + listing)
  // ============================================================
  function buildPredictTotalSwaps(container, gatedEl) {
    var box = h("div", { class: "exbox" });
    box.appendChild(h("div", { class: "exlabel" }, ["Predict first"]));
    var widget = buildNumeric({
      prompt: "Keep $a[0:i]$ sorted. Take $a[i]$ and swap it leftward while its left neighbour is larger. On $[4,1,3,5,2]$, how many swaps happen in total?",
      answer: "5",
      correctText: "Five: exactly $I(a)$, as Lemma 1 promised. Every swap removed an inversion.",
      genericWrongText: "Not quite. Count, for each element, how many larger elements stand to its left, and add those up. The trace below lets you check.",
      onCommit: function () { widget.dispatchEvent(new CustomEvent("ex-commit")); }
    });
    box.appendChild(widget);
    container.appendChild(box);
    wireGate(box, widget, gatedEl);
    renderMathIn(box);
  }

  // ============================================================
  // Python listing (tokenizer + render), shared by Listing 1 and the buggy listing
  // ============================================================
  var PY_KEYWORDS = ["def", "for", "while", "in", "range", "return", "and", "or", "not", "if", "else"];
  function tokenizeLine(line) {
    // returns array of {text, cls}
    var out = [];
    var i = 0;
    var n = line.length;
    while (i < n) {
      var ch = line[i];
      if (ch === " ") {
        var j = i; while (j < n && line[j] === " ") j++;
        out.push({ text: line.slice(i, j), cls: "" }); i = j; continue;
      }
      if (ch === "#") {
        out.push({ text: line.slice(i), cls: "cm" }); break;
      }
      if (/[A-Za-z_]/.test(ch)) {
        var k = i; while (k < n && /[A-Za-z0-9_]/.test(line[k])) k++;
        var word = line.slice(i, k);
        out.push({ text: word, cls: PY_KEYWORDS.indexOf(word) !== -1 ? "kw" : "" });
        i = k; continue;
      }
      if (/[0-9]/.test(ch)) {
        var m = i; while (m < n && /[0-9]/.test(line[m])) m++;
        out.push({ text: line.slice(i, m), cls: "" }); i = m; continue;
      }
      // punctuation / operators: consume run of same-class symbol chars one at a time
      out.push({ text: ch, cls: "" }); i++;
    }
    return out;
  }

  function buildListingBox(lines, opts) {
    // opts: { clickableLines: bool, onLineClick(lineNo1based), getCurrentLine(): number|null, bugLine: number }
    var codebox = h("div", { class: "codebox" });
    var lineEls = [];
    lines.forEach(function (text, idx) {
      var lineNo = idx + 1;
      var lineEl = h("div", { class: "codeline" });
      var marker = h("span", { class: "marker" }, [""]);
      var lno = h("span", { class: "lno" }, [String(lineNo)]);
      var src = h("span", { class: "src" });
      tokenizeLine(text).forEach(function (tok) {
        if (tok.cls) src.appendChild(h("span", { class: tok.cls }, [tok.text]));
        else src.appendChild(document.createTextNode(tok.text));
      });
      lineEl.appendChild(marker);
      lineEl.appendChild(lno);
      lineEl.appendChild(src);
      if (opts && opts.clickableLines) {
        lineEl.classList.add("clickable");
        lineEl.setAttribute("tabindex", "0");
        lineEl.setAttribute("role", "button");
        lineEl.addEventListener("click", function () { opts.onLineClick(lineNo, lineEl); });
        lineEl.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onLineClick(lineNo, lineEl); }
        });
      }
      codebox.appendChild(lineEl);
      lineEls.push({ el: lineEl, marker: marker, lineNo: lineNo });
    });
    codebox._setCurrent = function (lineNo) {
      lineEls.forEach(function (le) {
        var isCur = le.lineNo === lineNo;
        le.el.classList.toggle("current", isCur);
        le.marker.textContent = isCur ? "▸" : "";
      });
    };
    codebox._lineEls = lineEls;
    return codebox;
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
        return;
      }
    } catch (e) { /* fall through */ }
    fallbackCopy(text);
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    } catch (e) { /* ignore: copy is a convenience, not a requirement */ }
  }

  function buildPythonListing(container, getCurrentLineFn, registerUpdater) {
    var fig = h("div", { class: "listing" });
    var codebox = buildListingBox(SC.PY.insertion.lines, {});
    fig.appendChild(codebox);
    var foot = h("div", { class: "listing-foot" });
    foot.appendChild(h("figcaption", { style: "margin:0;" }, [
      h("span", { class: "fignum" }, ["Listing 1. "]),
      "Insertion sort in Python. The highlighted line is the one the trace above is executing."
    ]));
    var copyBtn = h("button", { type: "button", class: "copybtn" }, ["copy"]);
    copyBtn.addEventListener("click", function () { copyToClipboard(SC.PY.insertion.code); });
    foot.appendChild(copyBtn);
    fig.appendChild(foot);
    container.appendChild(fig);
    if (registerUpdater) registerUpdater(function (lineNo) { codebox._setCurrent(lineNo); });
  }

  // ============================================================
  // Figure 2: stepper (+ tied Listing 1)
  // ============================================================
  var PRESETS = {
    example: function () { return [4, 1, 3, 5, 2]; },
    random8: function () { return SC.shuffleWith([1, 2, 3, 4, 5, 6, 7, 8], SC.mulberry32(SC.newSeed())); },
    sorted8: function () { return [1, 2, 3, 4, 5, 6, 7, 8]; },
    reversed8: function () { return [8, 7, 6, 5, 4, 3, 2, 1]; },
    nearly8: function () {
      var a = [1, 2, 3, 4, 5, 6, 7, 8];
      var rng = SC.mulberry32(SC.newSeed());
      for (var t = 0; t < 2; t++) {
        var i = Math.floor(rng() * (a.length - 1));
        var tmp = a[i]; a[i] = a[i + 1]; a[i + 1] = tmp;
      }
      return a;
    }
  };

  function buildStepperAndListing(container) {
    var state = {
      array: PRESETS.example(),
      trace: null,
      idx: 0,
      playing: false,
      speed: "normal",
      timer: null,
      preset: "example"
    };
    state.trace = SC.generateTrace(state.array);

    var SPEED_MS = { slow: 1200, normal: 700, fast: 300 };

    var fig = h("figure", { class: "stepper" });
    var box = h("div", { class: "figbox" });

    // visualization
    var svg = svgEl("svg", { width: "100%", viewBox: "0 0 620 150", preserveAspectRatio: "xMinYMin meet" });
    ensureHatchDef(svg);
    box.appendChild(svg);

    var legend = h("div", { class: "legend" }, [
      h("span", { class: "item" }, [h("span", { class: "sw sorted" }), "sorted prefix"]),
      h("span", { class: "item" }, [h("span", { class: "sw key" }), "key being inserted"]),
      h("span", { class: "item" }, [h("span", { class: "sw rest" }), "not yet processed"])
    ]);
    box.appendChild(legend);

    var ijline = h("div", { class: "ijline" }, ["i = —, j = —"]);
    box.appendChild(ijline);
    var statusline = h("div", { class: "statusline" }, [""]);
    box.appendChild(statusline);

    var counters = h("table", { class: "counters" }, [
      h("tr", {}, [
        h("td", { class: "k" }, ["comparisons"]), h("td", { class: "v" }, ["0"]),
        h("td", { class: "k" }, ["swaps"]), h("td", { class: "v" }, ["0"]),
        h("td", { class: "k" }, ["inversions left"]), h("td", { class: "v" }, ["0"])
      ])
    ]);
    box.appendChild(counters);
    var cmpVal = counters.rows[0].cells[1], swpVal = counters.rows[0].cells[3], invVal = counters.rows[0].cells[5];

    var scrub = h("input", { type: "range", min: "0", max: "0", value: "0", style: "width:100%;margin:6px 0;" });
    box.appendChild(scrub);

    var controls = h("div", { class: "controls" });
    var playBtn = h("button", { type: "button", class: "scbtn" }, ["play"]);
    var backBtn = h("button", { type: "button", class: "scbtn" }, ["step back"]);
    var fwdBtn = h("button", { type: "button", class: "scbtn" }, ["step forward"]);
    var resetBtn = h("button", { type: "button", class: "scbtn" }, ["reset"]);
    controls.appendChild(playBtn); controls.appendChild(backBtn); controls.appendChild(fwdBtn); controls.appendChild(resetBtn);

    var speedGroup = h("span", { class: "speedgroup" }, [
      h("span", { style: "color:var(--gray);" }, ["speed:"])
    ]);
    ["slow", "normal", "fast"].forEach(function (s) {
      var b = h("button", { type: "button", class: "scbtn" + (s === "normal" ? " active" : "") }, [s]);
      b.addEventListener("click", function () {
        state.speed = s;
        speedGroup.querySelectorAll(".scbtn").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        if (state.playing) { stopPlay(); startPlay(); }
      });
      speedGroup.appendChild(b);
    });
    controls.appendChild(speedGroup);
    box.appendChild(controls);

    var presetGroup = h("div", { class: "presetgroup" }, [h("span", { style: "color:var(--gray);font-family:var(--font-sans);font-size:13px;" }, ["presets:"])]);
    var PRESET_LABELS = [["example", "Example"], ["random8", "Random (8)"], ["sorted8", "Sorted (8)"], ["reversed8", "Reversed (8)"], ["nearly8", "Nearly sorted (8)"]];
    var presetBtns = {};
    PRESET_LABELS.forEach(function (pl) {
      var b = h("button", { type: "button", class: "scbtn" + (pl[0] === "example" ? " active" : "") }, [pl[1]]);
      b.addEventListener("click", function () {
        state.preset = pl[0];
        Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.remove("active"); });
        b.classList.add("active");
        loadArray(PRESETS[pl[0]]());
      });
      presetBtns[pl[0]] = b;
      presetGroup.appendChild(b);
    });
    box.appendChild(presetGroup);

    var customRow = h("div", { class: "customrow" });
    customRow.appendChild(h("span", { style: "color:var(--gray);" }, ["your array:"]));
    var customInput = h("input", { type: "text", placeholder: "e.g. 4, 1, 3, 5, 2" });
    var customApply = h("button", { type: "button", class: "scbtn" }, ["apply"]);
    customRow.appendChild(customInput); customRow.appendChild(customApply);
    box.appendChild(customRow);
    var customErr = h("div", { class: "inlineerr" });
    box.appendChild(customErr);

    fig.appendChild(box);
    fig.appendChild(h("figcaption", {}, [
      h("span", { class: "fignum" }, ["Figure 2. "]),
      "Insertion sort on your input. The shaded region is the sorted prefix. Watch the inversion counter fall by exactly one with every swap."
    ]));
    container.appendChild(fig);

    // tied listing
    var setListingLine = null;
    buildPythonListing(container, null, function (fn) { setListingLine = fn; });

    function fillFor(region) {
      if (region === "sorted") return "var(--sorted-fill)";
      if (region === "key") return "url(#hatchfill)";
      return "#fff";
    }

    function renderViz() {
      var step = state.trace.steps[state.idx];
      svg.innerHTML = "";
      ensureHatchDef(svg);
      var n = step.array.length;
      var cellW = Math.min(56, 580 / n);
      var totalW = cellW * n;
      var x0 = (620 - totalW) / 2;
      var y0 = 50;
      var cellH = 44;
      var cells = drawArrayCells(svg, step.array, {
        x0: x0, y0: y0, cellW: cellW, cellH: cellH,
        fillFor: function (i) { return fillFor(step.regions[i]); },
        strokeFor: function () { return "#111"; },
        strokeWidth: 1.2
      });
      // highlight compared / swapped cells
      if ((step.kind === "compare" || step.kind === "swap") && step.j != null && step.j > 0) {
        [step.j - 1, step.j].forEach(function (ci) {
          if (cells[ci]) { cells[ci].rect.setAttribute("stroke", "#9b1c1c"); cells[ci].rect.setAttribute("stroke-width", 2.2); }
        });
      }
      // index labels
      for (var i = 0; i < n; i++) {
        var t = svgEl("text", { x: x0 + i * cellW + cellW / 2, y: y0 + cellH + 16, "text-anchor": "middle", class: "arclabel", fill: "#6b6b6b" });
        t.textContent = i;
        svg.appendChild(t);
      }

      ijline.textContent = "i = " + (step.i == null ? "—" : step.i) + ", j = " + (step.j == null ? "—" : step.j);
      statusline.textContent = step.message;
      cmpVal.textContent = step.comparisons;
      swpVal.textContent = step.swaps;
      invVal.textContent = step.inversions;
      scrub.value = state.idx;
      if (setListingLine) setListingLine(step.line);

      playBtn.textContent = state.playing ? "pause" : "play";
      backBtn.disabled = state.idx === 0;
      fwdBtn.disabled = state.idx === state.trace.steps.length - 1;
      if (state.idx === state.trace.steps.length - 1) stopPlay();
    }

    function goTo(i) {
      state.idx = Math.max(0, Math.min(state.trace.steps.length - 1, i));
      renderViz();
    }

    function stopPlay() {
      state.playing = false;
      if (state.timer) { clearTimeout(state.timer); state.timer = null; }
      playBtn.textContent = "play";
    }
    function startPlay() {
      if (state.idx >= state.trace.steps.length - 1) state.idx = 0;
      state.playing = true;
      playBtn.textContent = "pause";
      function tick() {
        if (!state.playing) return;
        if (state.idx >= state.trace.steps.length - 1) { stopPlay(); renderViz(); return; }
        state.idx++;
        renderViz();
        if (REDUCED_MOTION) { if (state.idx < state.trace.steps.length - 1) state.timer = setTimeout(tick, 10); else stopPlay(); return; }
        state.timer = setTimeout(tick, SPEED_MS[state.speed]);
      }
      state.timer = setTimeout(tick, REDUCED_MOTION ? 10 : SPEED_MS[state.speed]);
    }

    playBtn.addEventListener("click", function () { state.playing ? stopPlay() : startPlay(); });
    backBtn.addEventListener("click", function () { stopPlay(); goTo(state.idx - 1); });
    fwdBtn.addEventListener("click", function () { stopPlay(); goTo(state.idx + 1); });
    resetBtn.addEventListener("click", function () { stopPlay(); goTo(0); });
    scrub.addEventListener("input", function () { stopPlay(); goTo(parseInt(scrub.value, 10)); });

    function loadArray(arr) {
      stopPlay();
      state.array = arr;
      state.trace = SC.generateTrace(arr);
      state.idx = 0;
      scrub.max = String(state.trace.steps.length - 1);
      renderViz();
    }

    customApply.addEventListener("click", function () {
      var res = parseArrayInput(customInput.value, 2, 12);
      if (res.error) { customErr.textContent = res.error; return; }
      customErr.textContent = "";
      Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.remove("active"); });
      loadArray(res.values);
    });
    customInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); customApply.click(); } });

    // keyboard: Space play/pause, arrows step — ignore while typing in an input
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); state.playing ? stopPlay() : startPlay(); }
      else if (e.key === "ArrowRight") { stopPlay(); goTo(state.idx + 1); }
      else if (e.key === "ArrowLeft") { stopPlay(); goTo(state.idx - 1); }
    });

    scrub.max = String(state.trace.steps.length - 1);
    renderViz();
  }

  // ============================================================
  // Table 1: trace table (static)
  // ============================================================
  function buildTraceTable(container) {
    var wrap = h("div", { class: "tablewrap" });
    wrap.appendChild(h("div", { class: "tablabel" }, [h("span", { class: "tabnum" }, ["Table 1. "]), "The array after each outer pass on $[4,3,1,5,2]$".replace("$[4,3,1,5,2]$", "$[4,1,3,5,2]$"), " . The bar separates the sorted prefix from the rest."]));
    var rows = [
      ["start", "4 ∣ 1 3 5 2"],
      ["$i = 1$", "1 4 ∣ 3 5 2"],
      ["$i = 2$", "1 3 4 ∣ 5 2"],
      ["$i = 3$", "1 3 4 5 ∣ 2"],
      ["$i = 4$", "1 2 3 4 5"]
    ];
    var table = h("table", { class: "booktabs" });
    var thead = h("thead", {}, [h("tr", {}, [h("th", {}, ["after pass"]), h("th", {}, ["array"])])]);
    var tbody = h("tbody");
    rows.forEach(function (r) {
      tbody.appendChild(h("tr", {}, [h("td", { html: r[0] }), h("td", { style: "font-family:var(--font-mono);" }, [r[1]])]));
    });
    table.appendChild(thead); table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
    renderMathIn(wrap);
  }

  // ============================================================
  // going-deeper collapsible
  // ============================================================
  function buildGoingDeeper(container) {
    var det = h("details", { class: "deeper" });
    if (REVEAL) det.setAttribute("open", "");
    det.appendChild(h("summary", {}, ["Going deeper: the exact average number of comparisons"]));
    var body = h("div", { class: "deeper-body" });
    body.innerHTML =
      '<p class="noindent">The bound $C \\le I + (n-1)$ overcounts by one for each key that travels all the way to the front: for that key, the loop ends on <code>j &gt; 0</code> without a final comparison. Position $i$ holds a new minimum (a key smaller than everything before it) with probability $\\frac{1}{i+1}$, since each of the first $i+1$ keys is equally likely to be the smallest of them. Summing over $i = 1, \\dots, n-1$, the expected number of such keys is $H_n - 1$, where $H_n = 1 + \\frac12 + \\dots + \\frac1n$. Therefore</p>' +
      '<div class="display-eq-wrap">$$\\mathbb{E}[C] \\;=\\; \\frac{n(n-1)}{4} + (n-1) - (H_n - 1) \\;=\\; \\frac{n(n-1)}{4} + n - H_n.$$<div class="eqtag-row"></div></div>' +
      '<p class="noindent">For $n = 3$ this gives $1.5 + 3 - \\frac{11}{6} = \\frac{8}{3}$, which matches a direct count over all six orderings.</p>';
    body.querySelector(".eqtag-row").appendChild(tagEl("proof"));
    det.appendChild(body);
    container.appendChild(det);
    renderMathIn(det);
  }

  // ============================================================
  // Figure 3: cost plot (pgfplots-like)
  // ============================================================
  function buildCostPlot(container) {
    var state = { seed: 20260101, data: null };
    function resample() {
      var ns = []; for (var n = 2; n <= 40; n += 2) ns.push(n);
      state.data = SC.sampleCosts(ns, 200, state.seed);
      state.seed = SC.newSeed();
    }
    resample();

    var fig = h("figure", {});
    var box = h("div", { class: "figbox" });
    var svg = svgEl("svg", { width: "100%", viewBox: "0 0 640 400", preserveAspectRatio: "xMinYMin meet" });
    box.appendChild(svg);
    var statusEl = h("div", { class: "legend", style: "min-height:1.3em;margin-top:6px;" }, ["Hover or tap a point to read its value."]);
    box.appendChild(statusEl);
    var resampleBtn = h("button", { type: "button", class: "scbtn" }, ["resample"]);
    box.appendChild(h("div", { class: "btnrow" }, [resampleBtn]));
    fig.appendChild(box);
    fig.appendChild(h("figcaption", {}, [
      h("span", { class: "fignum" }, ["Figure 3. "]),
      "Comparisons made by insertion sort. Dots: the mean over 200 random permutations for each $n$. ",
      tagEl("empirical"),
      " Curves: $n-1$ (sorted input), $\\frac{n(n-1)}{4} + n - H_n$ (exact average), $\\frac{n(n-1)}{2}$ (reversed input). ",
      tagEl("proof")
    ]));
    container.appendChild(fig);
    renderMathIn(fig.querySelector("figcaption"));

    function draw() {
      svg.innerHTML = "";
      var W = 640, H = 400;
      var margin = { top: 34, right: 16, bottom: 40, left: 50 };
      var plotW = W - margin.left - margin.right;
      var plotH = H - margin.top - margin.bottom;
      var narrow = container.getBoundingClientRect().width > 0 && container.getBoundingClientRect().width < 420;

      var maxN = 40;
      var maxY = SC.costWorst(maxN) * 1.05;
      function xFor(n) { return margin.left + (n - 2) / (maxN - 2) * plotW; }
      function yFor(c) { return margin.top + plotH - (c / maxY) * plotH; }

      // axis frame
      svg.appendChild(svgEl("rect", { x: margin.left, y: margin.top, width: plotW, height: plotH, fill: "#fff", stroke: "#111", "stroke-width": 0.8 }));

      // ticks x
      var xticks = narrow ? [2, 10, 20, 30, 40] : [2, 8, 14, 20, 26, 32, 40];
      xticks.forEach(function (n) {
        var x = xFor(n);
        svg.appendChild(svgEl("line", { x1: x, y1: margin.top + plotH, x2: x, y2: margin.top + plotH - 6, stroke: "#111", "stroke-width": 0.8 }));
        var t = svgEl("text", { x: x, y: margin.top + plotH + 16, "text-anchor": "middle", class: "arclabel" });
        t.textContent = n;
        svg.appendChild(t);
      });
      svg.appendChild((function () { var t = svgEl("text", { x: margin.left + plotW / 2, y: H - 4, "text-anchor": "middle", class: "arclabel" }); t.textContent = "n"; return t; })());

      // ticks y
      var yticks = narrow ? [0, 400, 800] : [0, 200, 400, 600, 800];
      yticks.forEach(function (c) {
        if (c > maxY * 1.02) return;
        var y = yFor(c);
        svg.appendChild(svgEl("line", { x1: margin.left, y1: y, x2: margin.left + 6, y2: y, stroke: "#111", "stroke-width": 0.8 }));
        var t = svgEl("text", { x: margin.left - 8, y: y + 4, "text-anchor": "end", class: "arclabel" });
        t.textContent = c;
        svg.appendChild(t);
      });
      var ylabel = svgEl("text", { x: margin.left, y: margin.top - 12, "text-anchor": "start", class: "arclabel" });
      ylabel.textContent = "comparisons";
      svg.appendChild(ylabel);

      // curves
      function pathFor(fn, dash) {
        var ns = [];
        for (var n = 2; n <= maxN; n += 1) ns.push(n);
        var d = ns.map(function (n, idx) { return (idx === 0 ? "M " : "L ") + xFor(n) + " " + yFor(fn(n)); }).join(" ");
        var attrs = { d: d, fill: "none", stroke: "#111", "stroke-width": 1.1 };
        if (dash) attrs["stroke-dasharray"] = dash;
        svg.appendChild(svgEl("path", attrs));
      }
      pathFor(SC.costBest, "1,3");        // dotted
      pathFor(SC.costAverage, null);      // solid
      pathFor(SC.costWorst, "6,4");       // dashed

      // dots + error bars
      state.data.forEach(function (d) {
        var x = xFor(d.n), yMean = yFor(d.mean), yMin = yFor(d.min), yMax = yFor(d.max);
        var bar = svgEl("line", { x1: x, y1: yMin, x2: x, y2: yMax, stroke: "#9b1c1c", "stroke-width": 0.8 });
        svg.appendChild(bar);
        svg.appendChild(svgEl("line", { x1: x - 4, y1: yMin, x2: x + 4, y2: yMin, stroke: "#9b1c1c", "stroke-width": 0.8 }));
        svg.appendChild(svgEl("line", { x1: x - 4, y1: yMax, x2: x + 4, y2: yMax, stroke: "#9b1c1c", "stroke-width": 0.8 }));
        var dot = svgEl("circle", { cx: x, cy: yMean, r: 4, fill: "#fff", stroke: "#9b1c1c", "stroke-width": 1.4, style: "cursor:pointer;" });
        dot.setAttribute("tabindex", "0");
        function show() {
          statusEl.textContent = "n = " + d.n + ": mean " + d.mean.toFixed(1) + " (min " + d.min + ", max " + d.max + ")";
        }
        dot.addEventListener("mouseenter", show);
        dot.addEventListener("focus", show);
        dot.addEventListener("click", show);
        svg.appendChild(dot);
      });

      // legend box
      var lx = margin.left + plotW - (narrow ? 150 : 180), ly = margin.top + 10;
      var lw = narrow ? 144 : 174, lh = 64;
      svg.appendChild(svgEl("rect", { x: lx, y: ly, width: lw, height: lh, fill: "#fff", stroke: "#111", "stroke-width": 0.8 }));
      var legendRows = [
        ["1,3", "best: n − 1"],
        [null, "average"],
        ["6,4", "worst: n(n−1)/2"]
      ];
      legendRows.forEach(function (row, i) {
        var yy = ly + 14 + i * 18;
        var lineAttrs = { x1: lx + 8, y1: yy, x2: lx + 34, y2: yy, stroke: "#111", "stroke-width": 1.1 };
        if (row[0]) lineAttrs["stroke-dasharray"] = row[0];
        svg.appendChild(svgEl("line", lineAttrs));
        var t = svgEl("text", { x: lx + 40, y: yy + 4, class: "arclabel" });
        t.textContent = row[1];
        svg.appendChild(t);
      });
    }

    resampleBtn.addEventListener("click", function () { resample(); draw(); });
    draw();
    window.addEventListener("resize", function () { draw(); });
  }

  // ============================================================
  // Figure 4: knowledge view (Hasse diagram)
  // ============================================================
  function buildKnowledgeView(container) {
    var VALUES = [1, 2, 3, 4, 5];
    var INPUT_ORDER = [4, 1, 3, 5, 2];
    var states = SC.knowledgeStates(); // k=0..8
    var state = { k: 0 };

    var fig = h("figure", {});
    var box = h("div", { class: "figbox" });
    var svg = svgEl("svg", { width: "100%", viewBox: "0 0 620 240", preserveAspectRatio: "xMinYMin meet" });
    box.appendChild(svg);

    var infoLine = h("div", { class: "statusline" }, [""]);
    box.appendChild(infoLine);
    var countsLine = h("div", { class: "ijline" }, [""]);
    box.appendChild(countsLine);

    var sliderRow = h("div", { class: "customrow" });
    sliderRow.appendChild(h("span", { style: "color:var(--gray);" }, ["after comparison k of 8:"]));
    var slider = h("input", { type: "range", min: "0", max: "8", value: "0", style: "flex:1 1 180px;" });
    sliderRow.appendChild(slider);
    box.appendChild(sliderRow);
    var controls = h("div", { class: "controls" });
    var prevBtn = h("button", { type: "button", class: "scbtn" }, ["prev"]);
    var nextBtn = h("button", { type: "button", class: "scbtn" }, ["next"]);
    controls.appendChild(prevBtn); controls.appendChild(nextBtn);
    box.appendChild(controls);

    fig.appendChild(box);
    fig.appendChild(h("figcaption", {}, [
      h("span", { class: "fignum" }, ["Figure 4. "]),
      "What insertion sort knows about $[4,1,3,5,2]$ after each comparison. A line from $x$ up to $y$ means $x < y$ is known, directly or by transitivity. The number of orderings still possible starts at $120$ and must reach $1$."
    ]));
    container.appendChild(fig);
    renderMathIn(fig.querySelector("figcaption"));

    var W = 620, H = 240;
    var marginB = 36, marginT = 34;
    var colW = (W - 80) / (VALUES.length - 1);
    var x0 = 40;
    function xFor(v) { return x0 + INPUT_ORDER.indexOf(v) * colW; }
    function yFor(level) { return H - marginB - level * ((H - marginB - marginT) / 4); }

    var nodeEls = {}, edgeEls = {};

    function ensureNodes(layout) {
      if (Object.keys(nodeEls).length) return;
      layout.nodes.forEach(function (node) {
        var g = svgEl("g", { class: "hasse-node" });
        var circle = svgEl("circle", { cx: xFor(node.value), cy: yFor(node.level), r: 9, fill: "#111", stroke: "#111" });
        var text = svgEl("text", { x: xFor(node.value), y: yFor(node.level) - 14, "text-anchor": "middle", class: "cellval" });
        text.textContent = node.value;
        g.appendChild(circle); g.appendChild(text);
        svg.appendChild(g);
        nodeEls[node.value] = { circle: circle, text: text };
      });
    }

    function edgeKey(e) { return e[0] + "-" + e[1]; }

    function render() {
      var k = state.k;
      var st = states[k];
      var layout = SC.hasseLayout(VALUES, st.relations, INPUT_ORDER);
      var prevLayout = k > 0 ? SC.hasseLayout(VALUES, states[k - 1].relations, INPUT_ORDER) : { edges: [] };
      var prevKeys = {};
      prevLayout.edges.forEach(function (e) { prevKeys[edgeKey(e)] = true; });

      ensureNodes(layout);

      // update node positions
      layout.nodes.forEach(function (node) {
        var ne = nodeEls[node.value];
        ne.circle.setAttribute("cy", yFor(node.level));
        ne.text.setAttribute("y", yFor(node.level) - 14);
        if (!REDUCED_MOTION) {
          ne.circle.style.transition = "cy 0.35s ease";
          ne.text.style.transition = "y 0.35s ease";
        } else {
          ne.circle.style.transition = "none";
          ne.text.style.transition = "none";
        }
      });

      // remove old edges, draw current ones
      Object.keys(edgeEls).forEach(function (key) {
        if (edgeEls[key]) { edgeEls[key].remove(); delete edgeEls[key]; }
      });
      layout.edges.forEach(function (e) {
        var isNew = !prevKeys[edgeKey(e)];
        var line = svgEl("line", {
          x1: xFor(e[0]), y1: yFor(layout.nodes.find(function (n) { return n.value === e[0]; }).level),
          x2: xFor(e[1]), y2: yFor(layout.nodes.find(function (n) { return n.value === e[1]; }).level),
          stroke: isNew ? "#9b1c1c" : "#111",
          "stroke-width": isNew ? 2.2 : 0.8
        });
        svg.insertBefore(line, svg.firstChild);
        edgeEls[edgeKey(e)] = line;
      });

      var bits = st.count > 0 ? Math.log2(st.count) : 0;
      if (k === 0) {
        infoLine.textContent = "No comparisons made yet.";
      } else {
        var cmp = SC.KNOWLEDGE_COMPARISONS[k - 1];
        var prevCount = states[k - 1].count;
        infoLine.textContent = "compared " + cmp.a + " and " + cmp.b + ": " + cmp.rel +
          " · orderings still possible: " + prevCount + " → " + st.count;
      }
      countsLine.textContent = "orderings possible: " + st.count + "  ·  bits remaining: " + bits.toFixed(2);
      slider.value = String(k);
      prevBtn.disabled = k === 0;
      nextBtn.disabled = k === 8;
    }

    slider.addEventListener("input", function () { state.k = parseInt(slider.value, 10); render(); });
    prevBtn.addEventListener("click", function () { state.k = Math.max(0, state.k - 1); render(); });
    nextBtn.addEventListener("click", function () { state.k = Math.min(8, state.k + 1); render(); });

    render();
  }

  // ============================================================
  // Checkpoint (Q1–Q4) with gating of Ledger + Next line
  // ============================================================
  function buildCheckpoint(container, gatedAfter) {
    var box = h("div", { class: "exbox" });
    box.appendChild(h("div", { class: "exlabel" }, ["Checkpoint"]));
    box.appendChild(h("div", { class: "exintro" }, [
      "Four questions. Each wrong answer explains itself. The ledger below opens once you've attempted all four, or press ‘continue anyway’, which records the skipped questions as gaps."
    ]));

    var attempted = [false, false, false, false];
    function markAttempt(i) {
      attempted[i] = true;
      checkAllDone();
    }

    // Q1 MC
    box.appendChild(h("div", { class: "exlabel", style: "font-size:12px;margin-top:14px;" }, ["Exercise 3.1"]));
    var q1 = buildMC({
      prompt: "An algorithm may only swap neighbours. What is the fewest number of swaps it can use to sort $[5,4,3,2,1]$?",
      options: [
        { letter: "a", text: "4.", correct: false, feedback: "That's $n-1$, as if each element needed a single move. But the 1 alone must travel four positions, the 2 three, and so on. Count inversions instead." },
        { letter: "b", text: "5.", correct: false, feedback: "One swap per element isn't enough: a swap moves just two elements, one position each." },
        { letter: "c", text: "10.", correct: true, feedback: "Right: $I = \\binom{5}{2} = 10$, and Theorem 1 says no adjacent-swap algorithm can do better." },
        { letter: "d", text: "20.", correct: false, feedback: "That counts every pair twice, in both orders. An inversion is a pair of positions $i < j$." }
      ],
      onCommit: function () { markAttempt(0); }
    });
    box.appendChild(q1);

    // Q2 numeric
    box.appendChild(h("div", { class: "exlabel", style: "font-size:12px;margin-top:14px;" }, ["Exercise 3.2"]));
    var q2 = buildNumeric({
      prompt: "How many comparisons does <code>insertion_sort</code> make on $[4, 1, 3, 5, 2]$?",
      answer: "8",
      correctText: "Right: $I + (n-1) - 1 = 5 + 4 - 1 = 8$. The first key, 1, reaches the front, so its loop ends on <code>j &gt; 0</code> without a comparison.",
      feedbacks: [
        { value: "5", text: "That's the number of swaps, $I(a)$. Add the final false test that ends each insertion, except for a key that reaches the front." },
        { value: "9", text: "Almost. The key 1 reaches position 0, so its loop ends on <code>j &gt; 0</code> without comparing." },
        { value: "10", text: "That's $\\binom{5}{2}$, the count for repeated selection. Insertion sort adapts to the input." }
      ],
      genericWrongText: "Not quite. Step through Figure 2 with the Example preset and watch the comparison counter.",
      onCommit: function () { markAttempt(1); }
    });
    box.appendChild(q2);

    // Q3 MC
    box.appendChild(h("div", { class: "exlabel", style: "font-size:12px;margin-top:14px;" }, ["Exercise 3.3"]));
    var q3 = buildMC({
      prompt: "Theorem 1 says adjacent-swap algorithms need $\\Omega(n^2)$ swaps in the worst case. What does it tell us about sorting in general?",
      options: [
        { letter: "a", text: "Every sorting algorithm needs $\\Omega(n^2)$ time in the worst case.", correct: false, feedback: "That would be a bound on the <em>problem</em>. Theorem 1 covers only algorithms that move elements between neighbours." },
        { letter: "b", text: "Nothing about algorithms that can move an element far in one step.", correct: true, feedback: "Right. It's a bound on a class of algorithms. Whether sorting itself needs $n^2$ work is still an open question for us." },
        { letter: "c", text: "Every sorting algorithm needs $\\Omega(n^2)$ comparisons.", correct: false, feedback: "Theorem 1 counts swaps, not comparisons, and it covers only one class of algorithms." },
        { letter: "d", text: "Insertion sort needs $\\Omega(n^2)$ swaps on every input.", correct: false, feedback: "Not on every input: on sorted input it makes $0$ swaps. The bound is about the worst case, and, as §5 showed, the average case." }
      ],
      onCommit: function () { markAttempt(2); }
    });
    box.appendChild(q3);

    // Q4 find the bug
    box.appendChild(h("div", { class: "exlabel", style: "font-size:12px;margin-top:14px;" }, ["Exercise 3.4"]));
    var q4wrap = h("div", { class: "exq" });
    q4wrap.appendChild(h("p", { text: "This version is meant to be insertion sort. Click the line that is wrong." }));
    var q4listing = h("div", { class: "listing" });
    var LINE_FEEDBACK = {
      3: "That's fine. $a[0:1]$ is already sorted, so the first element to insert is $a[1]$.",
      5: "That's fine. The key starts at position $i$.",
      6: "__CORRECT__",
      7: "That's fine. Python evaluates the right-hand side before assigning, so the tuple swap is safe.",
      8: "That's fine. Decrementing $j$ is what moves the key left."
    };
    var q4fb = h("div", { class: "feedback", style: "display:none;" });
    var q4codebox = buildListingBox(SC.PY.buggy.lines, {
      clickableLines: true,
      onLineClick: function (lineNo, lineEl) {
        q4codebox._lineEls.forEach(function (le) { le.el.classList.remove("bug-flagged"); });
        var text = LINE_FEEDBACK[lineNo] || "That line is fine. Look at the loop condition.";
        var correct = text === "__CORRECT__";
        if (correct) {
          lineEl.classList.add("bug-flagged");
          text = "Right. When $j = 0$, <code>a[j - 1]</code> is <code>a[-1]</code>. In Python that isn't an error: it's the <em>last</em> element. The loop can then swap the first element with the last one.";
        }
        q4fb.style.display = "";
        q4fb.classList.toggle("wrong", !correct);
        q4fb.innerHTML = "";
        q4fb.appendChild(h("span", { class: "fblabel" }, [correct ? "Right." : "Remark."]));
        q4fb.appendChild(h("span", { html: text }));
        renderMathIn(q4fb);
        markAttempt(3);
        if (correct && !q4wrap.querySelector(".runbuggy")) {
          var runBtn = h("button", { type: "button", class: "scbtn runbuggy" }, ["run the buggy version on [2, 1]"]);
          var runOut = h("div", { class: "reveal-note" });
          runBtn.addEventListener("click", function () {
            var res = SC.buggyInsertion([2, 1]);
            var sorted = res.length < 2 || res[0] <= res[1];
            runOut.textContent = "returns [" + res.join(", ") + "]: " + (sorted ? "sorted." : "not sorted.");
          });
          q4wrap.appendChild(h("div", { class: "btnrow" }, [runBtn]));
          q4wrap.appendChild(runOut);
        }
      }
    });
    q4codebox.classList.add("codebox");
    q4listing.appendChild(q4codebox);
    q4wrap.appendChild(q4listing);
    q4wrap.appendChild(q4fb);
    box.appendChild(q4wrap);

    var continueRow = h("div", { class: "btnrow" });
    var continueBtn = h("button", { type: "button", class: "scbtn" }, ["continue anyway"]);
    continueRow.appendChild(continueBtn);
    box.appendChild(continueRow);
    var gapNote = h("div", { class: "reveal-note", style: "display:none;" });
    box.appendChild(gapNote);

    container.appendChild(box);
    renderMathIn(box);

    function checkAllDone() {
      if (attempted.every(function (x) { return x; })) openGate([]);
    }
    var opened = false;
    function openGate(gaps) {
      if (opened) return;
      opened = true;
      gatedAfter.classList.remove("hidden");
      if (gaps.length) {
        gapNote.style.display = "";
        gapNote.textContent = "Continuing with gaps: you skipped " + gaps.map(function (n) { return "Exercise 3." + n; }).join(", ") + ".";
      }
      continueRow.style.display = "none";
    }
    continueBtn.addEventListener("click", function () {
      var gaps = [];
      attempted.forEach(function (a, i) { if (!a) gaps.push(i + 1); });
      openGate(gaps);
    });

    gatedAfter.classList.add("gated");
    if (!REVEAL) gatedAfter.classList.add("hidden"); else openGate([]);
  }

  // ============================================================
  // Ledger: booktabs "Summary of results" + compact paragraphs
  // ============================================================
  function buildLedger(container) {
    var wrap = h("div", {});
    var tw = h("div", { class: "tablewrap" });
    tw.appendChild(h("div", { class: "tablabel" }, [h("span", { class: "tabnum" }, ["Table 2. "]), "Summary of results."]));
    var rows = [
      ["$I(a)$ measures disorder: it is $0$ exactly when $a$ is sorted, and at most $\\binom{n}{2}$, reached exactly by the reversed array.", "proof"],
      ["Swapping an adjacent inverted pair removes exactly one inversion.", "proof"],
      ["Any adjacent-swap algorithm needs at least $I(a)$ swaps: $\\frac{n(n-1)}{2}$ in the worst case and $\\frac{n(n-1)}{4}$ on average. This is a bound on a class of algorithms.", "proof"],
      ["Insertion sort is correct. Invariant: $a[0:i]$ is a sorted rearrangement of the first $i$ input elements.", "proof"],
      ["Insertion sort makes exactly $I(a)$ swaps and $I(a) \\le C(a) \\le I(a) + n - 1$ comparisons: $n - 1$ at best, $\\frac{n(n-1)}{2}$ at worst, and $\\frac{n(n-1)}{4} + n - H_n$ on average over uniformly random permutations.", "proof"],
      ["Measured averages agree with the exact formula.", "empirical"]
    ];
    var table = h("table", { class: "booktabs" });
    var thead = h("thead", {}, [h("tr", {}, [h("th", {}, ["Result"]), h("th", {}, ["Status"])])]);
    var tbody = h("tbody");
    rows.forEach(function (r) {
      var tr = h("tr", {}, [h("td", { html: r[0] }), h("td", {})]);
      tr.cells[1].appendChild(tagEl(r[1]));
      tbody.appendChild(tr);
    });
    table.appendChild(thead); table.appendChild(tbody);
    tw.appendChild(table);
    wrap.appendChild(tw);

    function sub(label, html) {
      var d = h("div", { class: "ledger-sub" });
      d.appendChild(h("span", { class: "sublabel" }, [label]));
      d.appendChild(h("p", { html: html }));
      wrap.appendChild(d);
    }
    sub("Assumptions in force.", "distinct keys; information only through comparisons; uniformly random permutations for every average-case statement.");
    sub("Lenses in use.", "<em>Knowledge</em>, glimpsed in Figure 4. <em>Movement</em>, new: Theorem 1 is a bound on movement, not on information.");
    sub("Reasoning tools acquired.", "finding an invariant by tracing passes and rejecting a false candidate; indicator variables and linearity of expectation; bounding a whole class of algorithms by a quantity each step can change by at most one.");
    sub("Open question → Lesson 4.", "Insertion sort spends one comparison and one swap per inversion. If we found each key's place with fewer comparisons, would we still be stuck with $I(a)$ moves? Is knowing the order the same as moving into it?");

    container.appendChild(wrap);
    renderMathIn(wrap);
  }

  // ============================================================
  // init
  // ============================================================
  function initLesson() {
    // Render math in the static prose FIRST, before any component builder runs.
    // (Calling KaTeX auto-render twice over the same subtree can throw partway
    // through its walk — silently, since renderMathIn swallows errors — which
    // left later callouts/theorems unrendered. Rendering the static document
    // once up front, then letting each component render only its own freshly
    // built subtree, avoids ever re-processing the same span twice.)
    renderMathIn(document.body);

    var map = {
      "c-prereq-check": function (c) { buildPrereqCheck(c); },
      "c-inversion-diagram": function (c) { buildInversionDiagram(c); },
      "c-stepper": function (c) { buildStepperAndListing(c); },
      "c-trace-table": function (c) { buildTraceTable(c); },
      "c-going-deeper": function (c) { buildGoingDeeper(c); },
      "c-cost-plot": function (c) { buildCostPlot(c); },
      "c-knowledge-view": function (c) { buildKnowledgeView(c); },
      "c-ledger": function (c) { buildLedger(c); }
    };
    Object.keys(map).forEach(function (id) {
      var el = byId(id);
      if (el) map[id](el);
    });

    var predictInversionsEl = byId("c-predict-inversions");
    var gateInversions = byId("gate-inversions");
    if (predictInversionsEl && gateInversions) buildPredictInversions(predictInversionsEl, gateInversions);

    var predictSwapEl = byId("c-predict-swap");
    var gateSwap = byId("gate-swap");
    if (predictSwapEl && gateSwap) buildPredictSwap(predictSwapEl, gateSwap);

    var predictTotalEl = byId("c-predict-total-swaps");
    var gateTotal = byId("gate-total-swaps");
    if (predictTotalEl && gateTotal) buildPredictTotalSwaps(predictTotalEl, gateTotal);

    var checkpointEl = byId("c-checkpoint");
    var gateAfterCheckpoint = byId("gate-after-checkpoint");
    if (checkpointEl && gateAfterCheckpoint) buildCheckpoint(checkpointEl, gateAfterCheckpoint);

    if (REVEAL) {
      document.querySelectorAll("details.deeper").forEach(function (d) { d.setAttribute("open", ""); });
    }
  }

  function initIndex() {
    renderMathIn(document.body);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.getAttribute("data-page") === "lesson") initLesson();
    else initIndex();
  });
})();
