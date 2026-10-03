/* figures.js — the four big interactive figures for theme 05.
   Depends on engine.js (SC) and components.js (SC.ui). Browser-only. */
(function () {
  'use strict';
  var SC = window.SC;
  var ui = SC.ui;
  var el = ui.el;

  function parseIntList(raw, opts) {
    opts = opts || {};
    var min = opts.min || 2, max = opts.max || 10;
    var parts = raw.split(/[\s,]+/).filter(function (s) { return s.length; });
    var nums = parts.map(Number);
    if (!nums.length || nums.some(function (n) { return !Number.isFinite(n) || !Number.isInteger(n); })) {
      return { error: 'Enter ' + min + '–' + max + ' distinct integers, separated by commas or spaces.' };
    }
    if (nums.length < min || nums.length > max) {
      return { error: 'Enter ' + min + '–' + max + ' distinct integers, separated by commas or spaces.' };
    }
    if (new Set(nums).size !== nums.length) {
      return { error: 'All values must be distinct.' };
    }
    return { values: nums };
  }

  // ================= Figure 1: inversion diagram =================
  SC.ui.mountInversionDiagram = function (root) {
    var state = { array: [4, 1, 3, 5, 2], pinned: null };

    var controls = el('div', { class: 'field-row' });
    var input = el('input', { type: 'text', class: 'tinput', placeholder: 'e.g. 4, 1, 3, 5, 2', 'aria-label': 'custom array', size: '18' });
    var applyBtn = el('button', { class: 'tbtn', type: 'button' }, '[apply]');
    var shuffleBtn = el('button', { class: 'tbtn', type: 'button' }, '[Shuffle]');
    var reverseBtn = el('button', { class: 'tbtn', type: 'button' }, '[Reverse]');
    var sortBtn = el('button', { class: 'tbtn', type: 'button' }, '[Sort]');
    controls.appendChild(input); controls.appendChild(applyBtn);
    controls.appendChild(shuffleBtn); controls.appendChild(reverseBtn); controls.appendChild(sortBtn);
    var errorLine = el('div', { class: 'inline-error', hidden: true });

    var countersEl = ui.buildCounters([['Inversions', 0]]);
    var arrayWrap = el('div', { class: 'array-wrap' });
    var bracketsWrap = el('div', { class: 'inversion-rows' });
    var readout = el('div', { class: 'status-line', 'aria-live': 'polite' }, ' ');

    root.appendChild(controls);
    root.appendChild(errorLine);
    root.appendChild(countersEl);
    root.appendChild(arrayWrap);
    root.appendChild(bracketsWrap);
    root.appendChild(readout);

    var cellSpans = [];

    function setActive(pairIdx, rowEls) {
      cellSpans.forEach(function (s) { s.classList.remove('region-compared-hl'); s.style.color = ''; s.style.fontWeight = ''; });
      rowEls.forEach(function (r) { r.classList.remove('active'); });
      if (pairIdx == null) { readout.textContent = ' '; return; }
      var inv = SC.listInversions(state.array)[pairIdx];
      var i = inv[0], j = inv[1];
      [cellSpans[i], cellSpans[j]].forEach(function (s) { s.style.color = 'var(--red)'; s.style.fontWeight = '700'; });
      rowEls[pairIdx].classList.add('active');
      var a = state.array;
      readout.textContent = '(' + a[i] + ', ' + a[j] + '): ' + a[i] + ' comes first but is larger.';
    }

    function render() {
      arrayWrap.innerHTML = '';
      bracketsWrap.innerHTML = '';
      var n = state.array.length;
      var fw = ui.fieldWidthFor(state.array);
      var built = ui.buildArrayRowDom(state.array, null, null, fw);
      cellSpans = built.cellSpans;
      arrayWrap.appendChild(built.root);

      var invs = SC.listInversions(state.array);
      ui.updateCounters(countersEl, { Inversions: invs.length });

      var rowEls = [];
      invs.forEach(function (pair, idx) {
        var text = ui.buildBracketText(n, fw, pair[0], pair[1], '╰', '╯', '─');
        var rowBtn = el('button', { class: 'inv-row', type: 'button' }, text);
        rowBtn.addEventListener('mouseenter', function () { setActive(idx, rowEls); });
        rowBtn.addEventListener('mouseleave', function () { if (state.pinned == null) setActive(null, rowEls); else setActive(state.pinned, rowEls); });
        rowBtn.addEventListener('focus', function () { setActive(idx, rowEls); });
        rowBtn.addEventListener('blur', function () { if (state.pinned == null) setActive(null, rowEls); });
        rowBtn.addEventListener('click', function () {
          state.pinned = (state.pinned === idx) ? null : idx;
          setActive(state.pinned, rowEls);
        });
        rowEls.push(rowBtn);
        bracketsWrap.appendChild(rowBtn);
      });
      if (!invs.length) {
        bracketsWrap.appendChild(el('div', { class: 'legend-line' }, 'No inversions: the array is sorted.'));
      }
      state.pinned = null;
      readout.textContent = ' ';
    }

    function applyArray(arr) { state.array = arr.slice(); render(); }

    applyBtn.addEventListener('click', function () {
      var res = parseIntList(input.value, { min: 2, max: 10 });
      if (res.error) { errorLine.hidden = false; errorLine.textContent = res.error; return; }
      errorLine.hidden = true;
      applyArray(res.values);
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyBtn.click(); });
    shuffleBtn.addEventListener('click', function () { applyArray(SC.shuffle(state.array, SC.mulberry32(SC.newSeed()))); });
    reverseBtn.addEventListener('click', function () { applyArray(state.array.slice().reverse()); });
    sortBtn.addEventListener('click', function () { applyArray(state.array.slice().sort(function (a, b) { return a - b; })); });

    render();
    return state;
  };

  // ================= Figure 2: stepper (+ Listing 1) =================
  SC.ui.mountStepperAndListing = function (stepperRoot, listingRoot) {
    var SPEEDS = { slow: 1200, normal: 700, fast: 300 };
    var state = { base: [4, 1, 3, 5, 2], trace: null, idx: 0, playing: false, speed: 'normal', timer: null };
    state.trace = SC.insertionTrace(state.base);

    // --- presets / custom input ---
    var presetsRow = el('div', { class: 'tbtn-row' });
    var presetDefs = [
      ['Example', function () { return [4, 1, 3, 5, 2]; }],
      ['Random (8)', function () { return SC.randomPermutation(8, SC.mulberry32(SC.newSeed())); }],
      ['Sorted (8)', function () { return [1, 2, 3, 4, 5, 6, 7, 8]; }],
      ['Reversed (8)', function () { return [8, 7, 6, 5, 4, 3, 2, 1]; }],
      ['Nearly sorted (8)', function () {
        var a = [1, 2, 3, 4, 5, 6, 7, 8];
        var rng = SC.mulberry32(SC.newSeed());
        for (var k = 0; k < 2; k++) {
          var p = Math.floor(rng() * 7);
          var t = a[p]; a[p] = a[p + 1]; a[p + 1] = t;
        }
        return a;
      }]
    ];
    presetDefs.forEach(function (p) {
      var b = el('button', { class: 'tbtn', type: 'button' }, '[' + p[0] + ']');
      b.addEventListener('click', function () { applyArray(p[1]()); });
      presetsRow.appendChild(b);
    });

    var customRow = el('div', { class: 'field-row' });
    customRow.appendChild(el('label', { for: 'stepper-custom-input' }, 'Your array:'));
    var customInput = el('input', { id: 'stepper-custom-input', type: 'text', class: 'tinput', size: '20', placeholder: 'e.g. 4, 1, 3, 5, 2' });
    var customApply = el('button', { class: 'tbtn', type: 'button' }, '[Apply]');
    customRow.appendChild(customInput); customRow.appendChild(customApply);
    var customError = el('div', { class: 'inline-error', hidden: true });

    var arrayWrap = el('div', { class: 'array-wrap' });
    var regionRow = el('div', { class: 'region-label-row' });
    var legend = ui.legendLine();
    var countersEl = ui.buildCounters([['comparisons', 0], ['swaps', 0], ['inversions left', 0], ['i', '–'], ['j', '–']]);
    var statusLine = el('div', { class: 'status-line', 'aria-live': 'polite' });

    var controlsRow = el('div', { class: 'tbtn-row' });
    var btnPrev = el('button', { class: 'tbtn', type: 'button' }, '[◂ prev]');
    var btnPlay = el('button', { class: 'tbtn', type: 'button' }, '[▶ play]');
    var btnNext = el('button', { class: 'tbtn', type: 'button' }, '[next ▸]');
    var btnReset = el('button', { class: 'tbtn', type: 'button' }, '[reset]');
    controlsRow.appendChild(btnPrev); controlsRow.appendChild(btnPlay); controlsRow.appendChild(btnNext); controlsRow.appendChild(btnReset);

    var speedRow = el('div', { class: 'tbtn-row' });
    var speedLabel = el('span', {}, 'speed: ');
    var speedChoice = el('span', { class: 'speed-choice' });
    var speedBtns = {};
    ['slow', 'normal', 'fast'].forEach(function (s, idx) {
      var b = el('button', { class: 'tbtn', type: 'button' }, s);
      b.addEventListener('click', function () { state.speed = s; updateSpeedButtons(); if (state.playing) restartTimer(); });
      speedBtns[s] = b;
      speedChoice.appendChild(b);
      if (idx < 2) speedChoice.appendChild(document.createTextNode(' | '));
    });
    speedRow.appendChild(speedLabel); speedRow.appendChild(speedChoice);

    var scrub = el('input', { type: 'range', min: '0', max: '0', value: '0', 'aria-label': 'step scrubber' });
    scrub.style.width = '100%';
    var scrubRow = el('div', { class: 'field-row' }, scrub);

    stepperRoot.appendChild(presetsRow);
    stepperRoot.appendChild(customRow);
    stepperRoot.appendChild(customError);
    stepperRoot.appendChild(arrayWrap);
    stepperRoot.appendChild(regionRow);
    stepperRoot.appendChild(legend);
    stepperRoot.appendChild(countersEl);
    stepperRoot.appendChild(statusLine);
    stepperRoot.appendChild(scrubRow);
    stepperRoot.appendChild(controlsRow);
    stepperRoot.appendChild(speedRow);

    // --- listing ---
    var listingHead = el('div', { class: 'listing-head' },
      el('span', { class: 'fig-caption' }, el('span', { class: 'fnum' }, 'Listing 1. '), 'Insertion sort in Python. The highlighted line is the one the trace above is executing.')
    );
    var listingBody = el('div', { class: 'listing' });
    listingRoot.appendChild(listingHead);
    listingRoot.appendChild(listingBody);
    var listing = ui.renderCodeListing(listingBody, SC.PY.insertion.highlighted, {});
    listingHead.appendChild(ui.copyButton(SC.PY.insertion.code));

    function updateSpeedButtons() {
      Object.keys(speedBtns).forEach(function (s) { speedBtns[s].classList.toggle('active', s === state.speed); });
    }
    updateSpeedButtons();

    function render() {
      var step = state.trace.steps[state.idx];
      arrayWrap.innerHTML = '';
      var fw = ui.fieldWidthFor(step.array);
      var built = ui.buildArrayRowDom(step.array, step.regions, step.compareIdx, fw);
      arrayWrap.appendChild(built.root);
      regionRow.textContent = ui.buildRegionLabelRow(step.array.length, fw, step.regions);
      ui.updateCounters(countersEl, {
        comparisons: step.comparisons, swaps: step.swaps, 'inversions left': step.inversions,
        i: step.i == null ? '–' : step.i, j: step.j == null ? '–' : step.j
      });
      statusLine.textContent = step.message;
      listing.setCurrentLine(step.line);
      scrub.max = String(state.trace.steps.length - 1);
      scrub.value = String(state.idx);
      btnPrev.disabled = state.idx === 0;
      btnNext.disabled = state.idx === state.trace.steps.length - 1;
      btnPlay.textContent = state.playing ? '[❚❚ pause]' : '[▶ play]';
      if (state.idx === state.trace.steps.length - 1) stopPlaying();
    }

    function applyArray(arr) {
      stopPlaying();
      state.base = arr.slice();
      state.trace = SC.insertionTrace(state.base);
      state.idx = 0;
      render();
    }

    function stepTo(i) {
      stopPlaying();
      state.idx = Math.max(0, Math.min(state.trace.steps.length - 1, i));
      render();
    }

    function stopPlaying() {
      state.playing = false;
      if (state.timer) { clearTimeout(state.timer); state.timer = null; }
      if (btnPlay) btnPlay.textContent = '[▶ play]';
    }

    function tick() {
      if (state.idx >= state.trace.steps.length - 1) { stopPlaying(); render(); return; }
      state.idx++;
      render();
      if (state.playing) restartTimer();
    }

    function restartTimer() {
      if (state.timer) clearTimeout(state.timer);
      var ms = REDUCE_MOTION() ? 0 : SPEEDS[state.speed];
      state.timer = setTimeout(tick, ms);
    }
    function REDUCE_MOTION() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function togglePlay() {
      if (state.idx >= state.trace.steps.length - 1) return;
      state.playing = !state.playing;
      btnPlay.textContent = state.playing ? '[❚❚ pause]' : '[▶ play]';
      if (state.playing) restartTimer(); else if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    }

    btnPrev.addEventListener('click', function () { stepTo(state.idx - 1); });
    btnNext.addEventListener('click', function () { stepTo(state.idx + 1); });
    btnReset.addEventListener('click', function () { stepTo(0); });
    btnPlay.addEventListener('click', togglePlay);
    scrub.addEventListener('input', function () { stepTo(Number(scrub.value)); });
    customApply.addEventListener('click', function () {
      var res = parseIntList(customInput.value, { min: 2, max: 12 });
      if (res.error) { customError.hidden = false; customError.textContent = res.error; return; }
      customError.hidden = true;
      applyArray(res.values);
    });
    customInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') customApply.click(); });

    document.addEventListener('keydown', function (e) {
      if (ui.isTypingTarget(e.target)) return;
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepTo(state.idx - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepTo(state.idx + 1); }
    });

    render();
    return state;
  };

  // ================= Figure 3: cost plot =================
  SC.ui.mountCostPlot = function (root) {
    var state = { seed: 1234, samples: null };
    state.samples = SC.sampleCosts(state.seed);

    var resampleBtn = el('button', { class: 'tbtn', type: 'button' }, '[Resample]');
    var plotBox = el('div', { class: 'ascii-plot' });
    var legendLine = el('div', { class: 'plot-legend' },
      el('span', { class: 'plot-sample' }, '●'), ' sampled mean (200 reps)  ',
      el('span', { class: 'plot-best' }, '.'), ' best n−1  ',
      el('span', { class: 'plot-avg' }, '*'), ' average  ',
      el('span', { class: 'plot-worst' }, '+'), ' worst n(n−1)/2'
    );
    var readout = el('div', { class: 'status-line plot-readout', 'aria-live': 'polite' }, ' ');
    root.appendChild(el('div', { class: 'tbtn-row' }, resampleBtn));
    root.appendChild(plotBox);
    root.appendChild(legendLine);
    root.appendChild(readout);

    function narrow() { return window.innerWidth < 480; }

    function render() {
      plotBox.innerHTML = '';
      var ns = state.samples.map(function (s) { return s.n; });
      var cols = narrow() ? 24 : 39; // one column per n-step plus a couple margins, interpolated
      var rows = narrow() ? 12 : 15;
      var nMin = 2, nMax = 40;
      var maxVal = SC.worstC(nMax);
      function nForCol(c) { return nMin + (c / (cols - 1)) * (nMax - nMin); }
      function rowForVal(v) { return Math.round((maxVal - v) / maxVal * (rows - 1)); }
      function colForN(n) { return Math.round((n - nMin) / (nMax - nMin) * (cols - 1)); }

      var grid = [];
      for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(' '));
      var cls = [];
      for (r = 0; r < rows; r++) cls.push(new Array(cols).fill(null));
      var info = [];
      for (r = 0; r < rows; r++) info.push(new Array(cols).fill(null));

      for (var c = 0; c < cols; c++) {
        var n = nForCol(c);
        var best = SC.bestC(n), avg = SC.avgC(n), worst = SC.worstC(n);
        var rb = rowForVal(best), ra = rowForVal(avg), rw = rowForVal(worst);
        if (rb >= 0 && rb < rows) { grid[rb][c] = '.'; cls[rb][c] = 'plot-best'; }
        if (ra >= 0 && ra < rows) { grid[ra][c] = '*'; cls[ra][c] = 'plot-avg'; }
        if (rw >= 0 && rw < rows) { grid[rw][c] = '+'; cls[rw][c] = 'plot-worst'; }
      }
      // range bars + sample dots (actual sampled n points only)
      state.samples.forEach(function (s) {
        var c2 = colForN(s.n);
        if (c2 < 0 || c2 >= cols) return;
        var rMin = rowForVal(s.max), rMax = rowForVal(s.min);
        for (var rr = rMin; rr <= rMax; rr++) {
          if (rr < 0 || rr >= rows) continue;
          if (grid[rr][c2] === ' ') { grid[rr][c2] = '¦'; cls[rr][c2] = 'plot-axis'; }
          info[rr][c2] = s;
        }
        var rDot = rowForVal(s.mean);
        if (rDot >= 0 && rDot < rows) { grid[rDot][c2] = '●'; cls[rDot][c2] = 'plot-sample hoverable'; info[rDot][c2] = s; }
      });

      for (r = 0; r < rows; r++) {
        var rowEl = el('span', { class: 'row' });
        rowEl.appendChild(el('span', { class: 'plot-axis' }, '│'));
        for (c = 0; c < cols; c++) {
          var ch = grid[r][c];
          var span = el('span', { class: 'plot-ch' + (cls[r][c] ? ' ' + cls[r][c] : '') }, ch);
          if (info[r][c]) {
            span.classList.add('hoverable');
            span.tabIndex = 0;
            (function (s) {
              function show() {
                readout.textContent = 'n = ' + s.n + ': mean ' + s.mean.toFixed(1) + ' (min ' + s.min + ', max ' + s.max + ')';
              }
              span.addEventListener('mouseenter', show);
              span.addEventListener('focus', show);
              span.addEventListener('click', show);
            })(info[r][c]);
          }
          rowEl.appendChild(span);
        }
        plotBox.appendChild(rowEl);
        plotBox.appendChild(document.createTextNode('\n'));
      }
      // x axis
      var axisEl = el('span', { class: 'row plot-axis' });
      axisEl.appendChild(el('span', {}, '└'));
      for (c = 0; c < cols; c++) axisEl.appendChild(el('span', { class: 'plot-ch' }, '─'));
      plotBox.appendChild(axisEl);
      plotBox.appendChild(document.createTextNode('\n'));

      var tickEl = el('span', { class: 'row plot-tick' });
      tickEl.appendChild(el('span', {}, ' '));
      var tickNs = narrow() ? [2, 10, 20, 30, 40] : [2, 8, 16, 24, 32, 40];
      var lastCol = -1;
      var tickStr = new Array(cols).fill(' ');
      tickNs.forEach(function (tn) {
        var c3 = colForN(tn);
        var label = String(tn);
        for (var k = 0; k < label.length && c3 + k < cols; k++) tickStr[c3 + k] = label[k];
      });
      tickEl.appendChild(document.createTextNode(tickStr.join('')));
      plotBox.appendChild(tickEl);
      plotBox.appendChild(document.createTextNode('\n'));
      var capEl = el('span', { class: 'row plot-tick' }, ' n →');
      plotBox.appendChild(capEl);

      readout.textContent = ' ';
    }

    resampleBtn.addEventListener('click', function () {
      state.seed = SC.newSeed();
      state.samples = SC.sampleCosts(state.seed);
      render();
    });
    window.addEventListener('resize', debounce(render, 200));

    function debounce(fn, ms) {
      var t = null;
      return function () { clearTimeout(t); t = setTimeout(fn, ms); };
    }

    render();
    return state;
  };

  // ================= Figure 4: knowledge view (Hasse diagram) =================
  SC.ui.mountKnowledgeView = function (root) {
    var values = SC.KNOWLEDGE_VALUES;
    var relations = SC.KNOWLEDGE_RELATIONS;
    var inputOrder = SC.KNOWLEDGE_INPUT;
    var states = SC.knowledgeStates(values, relations, inputOrder);
    var counts = SC.linearExtensionCounts(values, relations);
    var k = 0;

    var controls = el('div', { class: 'knowledge-controls' });
    var btnPrev = el('button', { class: 'tbtn', type: 'button' }, '[◂ prev]');
    var slider = el('input', { type: 'range', min: '0', max: String(relations.length), value: '0', 'aria-label': 'comparisons made (k)' });
    var btnNext = el('button', { class: 'tbtn', type: 'button' }, '[next ▸]');
    var kLabel = el('span', { class: 'kv' }, el('span', { class: 'k' }, 'after comparison '), el('span', { class: 'v' }, '0'), el('span', { class: 'k' }, ' of ' + relations.length));
    controls.appendChild(btnPrev); controls.appendChild(slider); controls.appendChild(btnNext); controls.appendChild(kLabel);

    var svgWrap = el('div', {});
    var readout = el('div', { class: 'knowledge-readout', 'aria-live': 'polite' });

    root.appendChild(controls);
    root.appendChild(svgWrap);
    root.appendChild(readout);

    var NS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs) {
      var e = document.createElementNS(NS, tag);
      for (var a in attrs) e.setAttribute(a, attrs[a]);
      return e;
    }

    function edgeKey(e) { return e[0] + '>' + e[1]; }

    function render() {
      svgWrap.innerHTML = '';
      var st = states[k];
      var prevSt = k > 0 ? states[k - 1] : null;
      var prevEdgeSet = {};
      if (prevSt) prevSt.edges.forEach(function (e) { prevEdgeSet[edgeKey(e)] = true; });

      var maxLevel = 0;
      values.forEach(function (v) { if (st.levels[v] > maxLevel) maxLevel = st.levels[v]; });
      var levelGap = 48, margin = 30, nodeW = 34, nodeH = 24;
      var byLevel = {};
      values.forEach(function (v) {
        var lv = st.levels[v];
        byLevel[lv] = byLevel[lv] || [];
        byLevel[lv].push(v);
      });
      Object.keys(byLevel).forEach(function (lv) {
        byLevel[lv].sort(function (a, b) { return inputOrder.indexOf(a) - inputOrder.indexOf(b); });
      });
      var width = Math.max(260, values.length * 70);
      var height = margin * 2 + maxLevel * levelGap + nodeH;
      var pos = {};
      Object.keys(byLevel).forEach(function (lv) {
        var arr = byLevel[lv];
        var n = arr.length;
        arr.forEach(function (v, idx) {
          var x = width * (idx + 1) / (n + 1);
          var y = height - margin - (Number(lv)) * levelGap;
          pos[v] = { x: x, y: y };
        });
      });

      var svg = svgEl('svg', { viewBox: '0 0 ' + width + ' ' + height, class: 'hasse-svg', role: 'img', 'aria-label': 'Hasse diagram at step ' + k });
      st.edges.forEach(function (e) {
        var a = pos[e[0]], b = pos[e[1]];
        var isNew = !prevEdgeSet[edgeKey(e)];
        svg.appendChild(svgEl('line', { x1: a.x, y1: a.y - nodeH / 2 - 2, x2: b.x, y2: b.y + nodeH / 2 + 2, class: 'edge' + (isNew ? ' new-edge' : '') }));
      });
      values.forEach(function (v) {
        var p = pos[v];
        var g = svgEl('g', {});
        g.appendChild(svgEl('rect', { x: p.x - nodeW / 2, y: p.y - nodeH / 2, width: nodeW, height: nodeH, class: 'node-box', rx: 2 }));
        var t = svgEl('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle' });
        t.textContent = '[' + v + ']';
        g.appendChild(t);
        svg.appendChild(g);
      });
      svgWrap.appendChild(svg);

      kLabel.querySelector('.v').textContent = String(k);
      slider.value = String(k);

      var bits = counts[k] > 0 ? Math.log2(counts[k]) : 0;
      var lines = [];
      if (k > 0) {
        var rel = relations[k - 1];
        lines.push('compared ' + rel[0] + ' and ' + rel[1] + ': ' + rel[0] + ' < ' + rel[1]);
        lines.push('orderings still possible: ' + counts[k - 1] + ' → ' + counts[k]);
      } else {
        lines.push('orderings still possible: ' + counts[0]);
      }
      lines.push('bits remaining: log₂(' + counts[k] + ') ≈ ' + bits.toFixed(2));
      readout.innerHTML = lines.map(function (l) { return '<div>' + l + '</div>'; }).join('');

      btnPrev.disabled = k === 0;
      btnNext.disabled = k === relations.length;
    }

    function setK(nk) {
      k = Math.max(0, Math.min(relations.length, nk));
      render();
    }
    btnPrev.addEventListener('click', function () { setK(k - 1); });
    btnNext.addEventListener('click', function () { setK(k + 1); });
    slider.addEventListener('input', function () { setK(Number(slider.value)); });

    render();
    return { setK: setK };
  };
})();
