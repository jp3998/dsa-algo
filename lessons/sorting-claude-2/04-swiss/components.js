(function () {
  'use strict';

  var ALL_GATES = [];
  function registerGate(elm) { if (elm) ALL_GATES.push(elm); }
  function revealGate(elm) { if (elm) elm.hidden = false; }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function mkBtn(text, variant) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn' + (variant ? ' ' + variant : '');
    b.textContent = text;
    return b;
  }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function highlightPy(line) {
    var hashIdx = line.indexOf('#');
    var code = hashIdx >= 0 ? line.slice(0, hashIdx) : line;
    var comment = hashIdx >= 0 ? line.slice(hashIdx) : '';
    code = escapeHtml(code);
    comment = escapeHtml(comment);
    var kws = ['def', 'for', 'while', 'in', 'range', 'return', 'and'];
    kws.forEach(function (k) {
      var re = new RegExp('\\b' + k + '\\b', 'g');
      code = code.replace(re, '<span class="code-kw">' + k + '</span>');
    });
    code = code.replace(/\b\d+\b/g, '<span class="code-num">$&</span>');
    return comment ? code + '<span class="code-com">' + comment + '</span>' : code;
  }
  function renderMath(root) {
    try {
      if (window.renderMathInElement) {
        renderMathInElement(root, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      }
    } catch (e) { /* no-op */ }
  }
  function makeCaption(label, bodyHTML) {
    var p = document.createElement('p');
    p.className = 'caption';
    p.innerHTML = label + '<span class="caption-body">' + bodyHTML + '</span>';
    return p;
  }
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ===================================================================
  // Generic numeric / multiple-choice question mounts
  // ===================================================================
  function mountNumeric(container, opts) {
    var qp = document.createElement('p');
    qp.className = 'question-text';
    qp.innerHTML = opts.promptHTML;
    container.appendChild(qp);

    var row = el('div', 'field-row');
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'field';
    input.inputMode = 'numeric';
    input.setAttribute('aria-label', 'your answer');
    var btn = mkBtn('Check');
    row.appendChild(input);
    row.appendChild(btn);
    container.appendChild(row);

    var fb = el('div', 'feedback-area');
    container.appendChild(fb);

    if (opts.gate) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'skip-link';
      skip.textContent = 'skip, just show me';
      skip.addEventListener('click', function () { revealGate(opts.gate); });
      container.appendChild(skip);
    }

    var committed = false;
    function evaluate() {
      var val = input.value.trim();
      if (val === '') return;
      var isCorrect = val === String(opts.answer);
      var msg;
      if (isCorrect) msg = opts.correctMsg;
      else if (opts.wrongMap && Object.prototype.hasOwnProperty.call(opts.wrongMap, val)) msg = opts.wrongMap[val];
      else msg = opts.genericWrong;
      var html = '<div class="feedback ' + (isCorrect ? 'correct' : 'wrong') + '">' + msg + '</div>';
      if (opts.extraRevealHTML) html += '<div class="reveal-text">' + opts.extraRevealHTML + '</div>';
      fb.innerHTML = html;
      renderMath(fb);
      if (!committed) {
        committed = true;
        if (opts.gate) revealGate(opts.gate);
        if (opts.committedCb) opts.committedCb(isCorrect);
      }
    }
    btn.addEventListener('click', evaluate);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); evaluate(); }
    });
  }

  function mountMC(container, opts) {
    var qp = document.createElement('p');
    qp.className = 'question-text';
    qp.innerHTML = opts.promptHTML;
    container.appendChild(qp);

    var optsWrap = el('div', 'mc-options');
    var letters = ['a', 'b', 'c', 'd', 'e'];
    var fb = el('div', 'feedback-area');
    var buttons = [];
    var committed = false;

    opts.options.forEach(function (o, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mc-option';
      b.innerHTML = '<span class="opt-letter">(' + letters[idx] + ')</span>' + o.label;
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.classList.remove('chosen-right', 'chosen-wrong'); });
        b.classList.add(o.correct ? 'chosen-right' : 'chosen-wrong');
        var html = '<div class="feedback ' + (o.correct ? 'correct' : 'wrong') + '">' + o.feedback + '</div>';
        if (opts.extraRevealHTML) html += '<div class="reveal-text">' + opts.extraRevealHTML + '</div>';
        fb.innerHTML = html;
        renderMath(fb);
        if (!committed) {
          committed = true;
          if (opts.gate) revealGate(opts.gate);
          if (opts.committedCb) opts.committedCb(o.correct);
        }
      });
      optsWrap.appendChild(b);
      buttons.push(b);
    });
    container.appendChild(optsWrap);
    container.appendChild(fb);

    if (opts.gate) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'skip-link';
      skip.textContent = 'skip, just show me';
      skip.addEventListener('click', function () { revealGate(opts.gate); });
      container.appendChild(skip);
    }
  }

  // ===================================================================
  // Prereq check
  // ===================================================================
  function buildPrereqCheck(root) {
    var block = el('div', 'prereq-block');
    var label = el('span', 'label-caps');
    label.textContent = 'Before you start';
    var intro = document.createElement('p');
    intro.textContent = 'Two quick questions. If either goes wrong, revisit the lesson it points to.';
    block.appendChild(label);
    block.appendChild(intro);

    var p1 = el('div', '');
    mountNumeric(p1, {
      promptHTML: '<b>P1.</b> How many comparisons does it take to verify that an array of $8$ distinct keys is sorted?',
      answer: '7',
      correctMsg: 'Right: one comparison per adjacent pair, and transitivity does the rest.',
      wrongMap: {
        '28': 'That\'s $\\binom{8}{2}$, every pair. You only need the adjacent pairs; transitivity covers the others. Revisit Lesson 1, §2.',
        '8': 'Off by one: 8 elements have 7 adjacent pairs.',
      },
      genericWrong: 'Not quite. Think about which pairs you actually need to compare. Revisit Lesson 1, §2.',
    });
    block.appendChild(p1);

    var p2 = el('div', 'sub-question');
    mountMC(p2, {
      promptHTML: '<b>P2.</b> Repeated selection runs once on a sorted array and once on a reversed array of the same length. On the sorted one it makes:',
      options: [
        { label: 'fewer comparisons.', correct: false, feedback: 'That\'s the intuition this lesson is about, but repeated selection can\'t use it. To be sure an element is the smallest remaining, it must compare it with every remaining element, whatever the input looks like. Revisit Lesson 2.' },
        { label: 'the same number of comparisons.', correct: true, feedback: 'Right. The count is $n(n-1)/2$ regardless of the input. That rigidity is what this lesson tries to escape.' },
        { label: 'more comparisons.', correct: false, feedback: 'No: the count doesn\'t depend on the input at all. Revisit Lesson 2.' },
      ],
    });
    block.appendChild(p2);

    root.appendChild(block);
    renderMath(block);
  }

  // ===================================================================
  // Predict-first blocks
  // ===================================================================
  function buildPredictInversions(root, gate) {
    var block = el('div', 'predict-block');
    var label = el('span', 'label-caps');
    label.textContent = 'Predict first';
    block.appendChild(label);
    mountNumeric(block, {
      promptHTML: 'Before reading on: how many inversions does $a = [4, 1, 3, 5, 2]$ have?',
      answer: '5',
      correctMsg: 'Exactly right.',
      wrongMap: {
        '10': 'That\'s the number of pairs, $\\binom{5}{2}$. Only some of them are out of order.',
        '4': 'Close. One pair is easy to miss: check $(3, 2)$.',
      },
      genericWrong: 'Not quite. Go through each element and count the smaller elements to its right.',
      extraRevealHTML: 'Five: $(4,1)$, $(4,3)$, $(4,2)$, $(3,2)$ and $(5,2)$. Each is a pair of values where the larger one comes first. The diagram below draws them.',
      gate: gate,
    });
    root.appendChild(block);
    renderMath(block);
  }

  function buildPredictSwap(root, gate) {
    var block = el('div', 'predict-block');
    var label = el('span', 'label-caps');
    label.textContent = 'Predict first';
    block.appendChild(label);
    mountMC(block, {
      promptHTML: 'We swap an adjacent inverted pair. How many inversions does that remove?',
      options: [
        { label: 'Exactly one.', correct: true, feedback: 'Right. And the proof shows why it can never be more.' },
        { label: 'At least one, sometimes more.', correct: false, feedback: 'It feels as if moving a large element rightward could fix several pairs at once. But check which pairs actually change their relative order.' },
        { label: 'It depends on the other elements.', correct: false, feedback: 'The other elements matter less than you\'d think: relative to the swapped pair, each of them stays on the same side.' },
        { label: 'One, but it may create new ones.', correct: false, feedback: 'Only the swapped pair changes order. It goes from inverted to not inverted, and nothing else changes.' },
      ],
      gate: gate,
    });
    root.appendChild(block);
    renderMath(block);
  }

  function buildPredictTotalSwaps(root, gate) {
    var block = el('div', 'predict-block');
    var label = el('span', 'label-caps');
    label.textContent = 'Predict first';
    block.appendChild(label);
    mountNumeric(block, {
      promptHTML: 'Keep $a[0:i]$ sorted. Take $a[i]$ and swap it leftward while its left neighbour is larger. On $[4,1,3,5,2]$, how many swaps happen in total?',
      answer: '5',
      correctMsg: 'Five: exactly $I(a)$, as Lemma 1 promised. Every swap removed an inversion.',
      wrongMap: {},
      genericWrong: 'Not quite. Count, for each element, how many larger elements stand to its left, and add those up. The trace below lets you check.',
      gate: gate,
    });
    root.appendChild(block);
    renderMath(block);
  }

  // ===================================================================
  // Figure 1: inversion diagram
  // ===================================================================
  function buildInversionDiagram(root) {
    var state = { array: [4, 1, 3, 5, 2] };
    var wrap = el('div', 'figure');
    wrap.appendChild(makeCaption('FIG. 1', 'Every arc joins one inverted pair. Edit the array or shuffle it, and the count updates.'));
    var body = el('div', 'figure-body');

    var controls = el('div', 'inv-controls');
    var shuffleBtn = mkBtn('Shuffle', 'secondary');
    var reverseBtn = mkBtn('Reverse', 'secondary');
    var sortBtn = mkBtn('Sort', 'secondary');
    var countEl = el('span', 'inv-count');
    controls.appendChild(shuffleBtn);
    controls.appendChild(reverseBtn);
    controls.appendChild(sortBtn);
    controls.appendChild(countEl);

    var fieldRow = el('div', 'field-row');
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'field';
    input.placeholder = 'e.g. 4, 1, 3, 5, 2';
    input.setAttribute('aria-label', 'custom array for inversion diagram');
    var applyBtn = mkBtn('Apply', 'secondary');
    fieldRow.appendChild(input);
    fieldRow.appendChild(applyBtn);

    var errorEl = el('div', 'field-error');
    errorEl.hidden = true;
    var svgWrap = el('div', 'inv-svg-wrap');
    var hintEl = el('div', 'inv-arc-hint');
    hintEl.setAttribute('aria-live', 'polite');

    body.appendChild(controls);
    body.appendChild(fieldRow);
    body.appendChild(errorEl);
    body.appendChild(svgWrap);
    body.appendChild(hintEl);
    wrap.appendChild(body);
    root.appendChild(wrap);

    function render() {
      var a = state.array;
      var pairs = SC.inversionPairs(a);
      countEl.innerHTML = 'Inversions: <span class="n">' + pairs.length + '</span>';
      var n = a.length;
      var cellSize = 48, gap = 14;
      var slot = cellSize + gap;
      var width = n * slot - gap;
      var maxSpan = 0;
      pairs.forEach(function (p) { maxSpan = Math.max(maxSpan, p.j - p.i); });
      var archUnit = 16;
      var topPad = 24 + maxSpan * archUnit;
      var height = topPad + cellSize + 10;
      var cellY = topPad;
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', height);
      svg.style.display = 'block';
      svg.style.minWidth = Math.max(300, n * 62) + 'px';

      pairs.forEach(function (p) {
        var x1 = p.i * slot + cellSize / 2;
        var x2 = p.j * slot + cellSize / 2;
        var archHeight = 20 + (p.j - p.i) * archUnit;
        var y0 = cellY;
        var midX = (x1 + x2) / 2;
        var topY = y0 - archHeight;
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M ' + x1 + ' ' + y0 + ' Q ' + midX + ' ' + topY + ' ' + x2 + ' ' + y0);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#e30613');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('tabindex', '0');
        path.setAttribute('role', 'button');
        path.style.cursor = 'pointer';
        var label = '(' + p.ai + ', ' + p.aj + '): ' + p.ai + ' comes first but is larger.';
        path.setAttribute('aria-label', label);
        function activate(on) {
          path.setAttribute('stroke-width', on ? '4' : '2');
          hintEl.textContent = on ? label : '';
          Array.prototype.forEach.call(svg.querySelectorAll('.cell-rect[data-idx="' + p.i + '"], .cell-rect[data-idx="' + p.j + '"]'), function (r) {
            r.setAttribute('stroke', on ? '#e30613' : '#111111');
            r.setAttribute('stroke-width', on ? '3' : '1.5');
          });
        }
        path.addEventListener('mouseenter', function () { activate(true); });
        path.addEventListener('mouseleave', function () { activate(false); });
        path.addEventListener('focus', function () { activate(true); });
        path.addEventListener('blur', function () { activate(false); });
        path.addEventListener('click', function () { activate(true); });
        path.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(true); } });
        svg.appendChild(path);
      });

      a.forEach(function (v, idx) {
        var x = idx * slot;
        var g = document.createElementNS(svgNS, 'g');
        var rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('class', 'cell-rect');
        rect.setAttribute('data-idx', idx);
        rect.setAttribute('x', x);
        rect.setAttribute('y', cellY);
        rect.setAttribute('width', cellSize);
        rect.setAttribute('height', cellSize);
        rect.setAttribute('fill', '#ffffff');
        rect.setAttribute('stroke', '#111111');
        rect.setAttribute('stroke-width', '1.5');
        var text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x + cellSize / 2);
        text.setAttribute('y', cellY + cellSize / 2 + 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'IBM Plex Mono, monospace');
        text.setAttribute('font-weight', '700');
        text.setAttribute('font-size', '17');
        text.setAttribute('fill', '#111111');
        text.textContent = v;
        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
      });

      svgWrap.innerHTML = '';
      svgWrap.appendChild(svg);
      hintEl.textContent = '';
      errorEl.hidden = true;
    }

    function parseInput(str) {
      var parts = str.split(/[\s,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (parts.length < 2 || parts.length > 10) return null;
      var nums = parts.map(Number);
      if (nums.some(function (x) { return !Number.isFinite(x) || !Number.isInteger(x); })) return null;
      if (new Set(nums).size !== nums.length) return null;
      return nums;
    }

    shuffleBtn.addEventListener('click', function () {
      var rng = SC.mulberry32(SC.newSeed());
      state.array = SC.shuffle(state.array, rng);
      render();
    });
    reverseBtn.addEventListener('click', function () {
      state.array = state.array.slice().reverse();
      render();
    });
    sortBtn.addEventListener('click', function () {
      state.array = state.array.slice().sort(function (a, b) { return a - b; });
      render();
    });
    function applyCustom() {
      var parsed = parseInput(input.value);
      if (!parsed) {
        errorEl.textContent = 'Enter 2–10 distinct integers, separated by commas or spaces.';
        errorEl.hidden = false;
        return;
      }
      state.array = parsed;
      render();
    }
    applyBtn.addEventListener('click', applyCustom);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyCustom(); } });

    render();
  }

  // ===================================================================
  // Listing 1: python listing (tied to stepper)
  // ===================================================================
  function buildPythonListing(root) {
    var wrap = el('div', 'figure');
    wrap.appendChild(makeCaption('LISTING 1', 'Insertion sort in Python. The highlighted line is the one the trace above is executing.'));
    var toolbar = el('div', 'code-toolbar');
    var copyBtn = mkBtn('Copy code', 'secondary');
    copyBtn.classList.add('small');
    toolbar.appendChild(copyBtn);
    wrap.appendChild(toolbar);

    var body = el('div', 'figure-body');
    var codeBlock = el('div', 'code-block');
    var lineEls = [];
    SC.PY.insertion.lines.forEach(function (line, idx) {
      var lineNum = idx + 1;
      var row = el('div', 'code-line');
      row.dataset.line = lineNum;
      var lnSpan = el('span', 'ln');
      lnSpan.textContent = lineNum;
      var srcSpan = el('span', 'src');
      srcSpan.innerHTML = highlightPy(line);
      row.appendChild(lnSpan);
      row.appendChild(srcSpan);
      codeBlock.appendChild(row);
      lineEls.push(row);
    });
    body.appendChild(codeBlock);
    wrap.appendChild(body);
    root.appendChild(wrap);

    copyBtn.addEventListener('click', function () {
      var text = SC.PY.insertion.code;
      function done() {
        var orig = 'Copy code';
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = orig; }, 1200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (e) { /* ignore */ }
        done();
      }
    });

    function setCurrentLine(n) {
      lineEls.forEach(function (row) {
        row.classList.toggle('current', Number(row.dataset.line) === n);
      });
    }
    return { setCurrentLine: setCurrentLine };
  }

  // ===================================================================
  // Figure 2: stepper
  // ===================================================================
  function buildStepper(root, listingApi) {
    var SPEEDS = { slow: 1200, normal: 700, fast: 300 };
    var state = { arr: [4, 1, 3, 5, 2], data: null, idx: 0, playing: false, speed: 'normal', timer: null };

    var wrap = el('div', 'figure');
    wrap.appendChild(makeCaption('FIG. 2', 'Insertion sort on your input. The shaded region is the sorted prefix. Watch the inversion counter fall by exactly one with every swap.'));
    var body = el('div', 'figure-body');

    var presetsRow = el('div', 'stepper-presets');
    var presetDefs = [['example', 'Example'], ['random', 'Random (8)'], ['sorted', 'Sorted (8)'], ['reversed', 'Reversed (8)'], ['nearly', 'Nearly sorted (8)']];
    var presetBtns = {};
    presetDefs.forEach(function (pd) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'preset-btn';
      b.textContent = pd[1];
      b.addEventListener('click', function () { applyPreset(pd[0]); });
      presetsRow.appendChild(b);
      presetBtns[pd[0]] = b;
    });

    var customRow = el('div', 'custom-input-row');
    var customLabel = el('span', 'label-caps');
    customLabel.textContent = 'Your array';
    var customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.className = 'field';
    customInput.placeholder = 'e.g. 4, 1, 3, 5, 2';
    customInput.setAttribute('aria-label', 'custom array for stepper');
    var applyBtn = mkBtn('Apply', 'secondary');
    customRow.appendChild(customLabel);
    customRow.appendChild(customInput);
    customRow.appendChild(applyBtn);
    var customError = el('div', 'field-error');
    customError.hidden = true;

    var arrWrap = el('div', 'stepper-array-wrap');
    var legend = el('div', 'legend-row');
    legend.innerHTML =
      '<span class="legend-swatch"><span class="legend-box prefix"></span>sorted prefix</span>' +
      '<span class="legend-swatch"><span class="legend-box key"></span>key being inserted</span>' +
      '<span class="legend-swatch"><span class="legend-box rest"></span>not yet processed</span>';

    var controls = el('div', 'stepper-controls');
    var playBtn = mkBtn('Play');
    var backBtn = mkBtn('◀ Step', 'secondary');
    var fwdBtn = mkBtn('Step ▶', 'secondary');
    var resetBtn = mkBtn('Reset', 'secondary');
    var speedGroup = el('div', 'speed-group');
    var speedBtns = {};
    ['slow', 'normal', 'fast'].forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'speed-btn' + (s === 'normal' ? ' active' : '');
      b.textContent = s;
      b.addEventListener('click', function () { setSpeed(s); });
      speedGroup.appendChild(b);
      speedBtns[s] = b;
    });
    controls.appendChild(playBtn);
    controls.appendChild(backBtn);
    controls.appendChild(fwdBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(speedGroup);

    var scrub = document.createElement('input');
    scrub.type = 'range';
    scrub.className = 'scrub';
    scrub.min = 0;
    scrub.max = 0;
    scrub.value = 0;
    scrub.setAttribute('aria-label', 'scrub through steps');

    var counters = el('div', 'counters');
    function counterEl(label) {
      var c = el('div', 'counter');
      var num = el('span', 'num');
      num.textContent = '0';
      var lbl = el('span', 'lbl');
      lbl.textContent = label;
      c.appendChild(num);
      c.appendChild(lbl);
      return { el: c, num: num };
    }
    var compCounter = counterEl('comparisons');
    var swapCounter = counterEl('swaps');
    var invCounter = counterEl('inversions left');
    counters.appendChild(compCounter.el);
    counters.appendChild(swapCounter.el);
    counters.appendChild(invCounter.el);

    var varsLine = el('div', 'vars-line');
    var statusLine = el('div', 'status-line');
    statusLine.setAttribute('aria-live', 'polite');

    body.appendChild(presetsRow);
    body.appendChild(customRow);
    body.appendChild(customError);
    body.appendChild(arrWrap);
    body.appendChild(legend);
    body.appendChild(controls);
    body.appendChild(scrub);
    body.appendChild(counters);
    body.appendChild(varsLine);
    body.appendChild(statusLine);
    wrap.appendChild(body);
    root.appendChild(wrap);

    function load(arr) {
      pause();
      state.arr = arr;
      state.data = SC.insertionSortSteps(arr);
      state.idx = 0;
      scrub.max = state.data.steps.length - 1;
      scrub.value = 0;
      renderArray(true);
      renderInfo();
    }

    function captureRects() {
      var map = {};
      Array.prototype.forEach.call(arrWrap.querySelectorAll('.cell'), function (c) { map[c.dataset.key] = c.getBoundingClientRect(); });
      return map;
    }
    function applyFlip(oldRects) {
      if (REDUCED_MOTION) return;
      Array.prototype.forEach.call(arrWrap.querySelectorAll('.cell'), function (c) {
        var old = oldRects[c.dataset.key];
        if (!old) return;
        var now = c.getBoundingClientRect();
        var dx = old.left - now.left;
        if (Math.abs(dx) < 0.5) return;
        c.style.transition = 'none';
        c.style.transform = 'translateX(' + dx + 'px)';
        requestAnimationFrame(function () {
          c.style.transition = 'transform 220ms ease';
          c.style.transform = 'translateX(0)';
        });
      });
    }

    function renderArray(skipFlip) {
      var step = state.data.steps[state.idx];
      var oldRects = skipFlip ? {} : captureRects();
      arrWrap.innerHTML = '';
      var row = el('div', 'cell-row');
      step.array.forEach(function (v, i) {
        var region = step.regions[i];
        var cell = el('div', 'cell ' + region);
        cell.dataset.key = v;
        cell.textContent = v;
        if ((step.kind === 'compare' || step.kind === 'swap') && step.j != null && (i === step.j || i === step.j - 1)) {
          cell.classList.add('compared');
        }
        row.appendChild(cell);
      });
      arrWrap.appendChild(row);
      applyFlip(oldRects);
      listingApi.setCurrentLine(step.line);
    }

    function renderInfo() {
      var step = state.data.steps[state.idx];
      compCounter.num.textContent = step.comparisons;
      swapCounter.num.textContent = step.swaps;
      invCounter.num.textContent = step.inversionsLeft;
      varsLine.innerHTML = '<b>i</b> = ' + (step.i == null ? '—' : step.i) + ' &nbsp;&nbsp; <b>j</b> = ' + (step.j == null ? '—' : step.j);
      statusLine.textContent = step.message;
      scrub.value = state.idx;
      playBtn.textContent = state.playing ? 'Pause' : 'Play';
      backBtn.disabled = state.idx === 0;
      fwdBtn.disabled = state.idx === state.data.steps.length - 1;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(state.data.steps.length - 1, i));
      if (i === state.idx) { renderInfo(); return; }
      state.idx = i;
      renderArray(false);
      renderInfo();
    }
    function stepForward() { if (state.idx < state.data.steps.length - 1) goTo(state.idx + 1); else pause(); }
    function stepBack() { goTo(state.idx - 1); }
    function reset() { pause(); goTo(0); }

    function tick() {
      state.timer = setTimeout(function () {
        if (!state.playing) return;
        if (state.idx >= state.data.steps.length - 1) { pause(); return; }
        goTo(state.idx + 1);
        tick();
      }, SPEEDS[state.speed]);
    }
    function play() {
      if (state.idx >= state.data.steps.length - 1) return;
      state.playing = true;
      playBtn.textContent = 'Pause';
      tick();
    }
    function pause() {
      state.playing = false;
      if (state.timer) clearTimeout(state.timer);
      playBtn.textContent = 'Play';
    }
    function togglePlay() { if (state.playing) pause(); else play(); }

    function setSpeed(s) {
      state.speed = s;
      Object.keys(speedBtns).forEach(function (k) { speedBtns[k].classList.toggle('active', k === s); });
    }

    function generatePreset(name) {
      switch (name) {
        case 'example': return [4, 1, 3, 5, 2];
        case 'random': { var rng = SC.mulberry32(SC.newSeed()); return SC.shuffle([1, 2, 3, 4, 5, 6, 7, 8], rng); }
        case 'sorted': return [1, 2, 3, 4, 5, 6, 7, 8];
        case 'reversed': return [8, 7, 6, 5, 4, 3, 2, 1];
        case 'nearly': {
          var arr = [1, 2, 3, 4, 5, 6, 7, 8];
          var rng2 = SC.mulberry32(SC.newSeed());
          for (var k = 0; k < 2; k++) {
            var i = Math.floor(rng2() * (arr.length - 1));
            var t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
          }
          return arr;
        }
      }
    }
    function applyPreset(name) {
      Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.toggle('active', k === name); });
      load(generatePreset(name));
    }
    function parseCustom(str) {
      var parts = str.split(/[\s,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (parts.length < 2 || parts.length > 12) return null;
      var nums = parts.map(Number);
      if (nums.some(function (x) { return !Number.isFinite(x) || !Number.isInteger(x); })) return null;
      if (new Set(nums).size !== nums.length) return null;
      return nums;
    }

    playBtn.addEventListener('click', togglePlay);
    backBtn.addEventListener('click', function () { pause(); stepBack(); });
    fwdBtn.addEventListener('click', function () { pause(); stepForward(); });
    resetBtn.addEventListener('click', reset);
    scrub.addEventListener('input', function () { pause(); goTo(Number(scrub.value)); });
    applyBtn.addEventListener('click', function () {
      var parsed = parseCustom(customInput.value);
      if (!parsed) {
        customError.textContent = 'Enter 2–12 distinct integers, separated by commas or spaces.';
        customError.hidden = false;
        return;
      }
      customError.hidden = true;
      Object.keys(presetBtns).forEach(function (k) { presetBtns[k].classList.remove('active'); });
      load(parsed);
    });
    customInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyBtn.click(); } });

    presetBtns.example.classList.add('active');
    load(state.arr);

    return { stepForward: stepForward, stepBack: stepBack, togglePlay: togglePlay };
  }

  // ===================================================================
  // Table 1: trace table
  // ===================================================================
  function buildTraceTable(root) {
    var cap = makeCaption('TABLE 1', 'The array after each outer pass on $[4,1,3,5,2]$. The bar separates the sorted prefix from the rest.');
    var rows = [
      ['start', '4 ∣ 1 3 5 2'],
      ['$i = 1$', '1 4 ∣ 3 5 2'],
      ['$i = 2$', '1 3 4 ∣ 5 2'],
      ['$i = 3$', '1 3 4 5 ∣ 2'],
      ['$i = 4$', '1 2 3 4 5'],
    ];
    var table = document.createElement('table');
    table.className = 'sc-table';
    var thead = '<thead><tr><th>After pass</th><th>Array</th></tr></thead>';
    var bodyRows = rows.map(function (r) {
      var parts = r[1].split('∣').map(function (s) { return s.trim(); });
      var html = parts.length === 2 ? (parts[0] + ' <span class="bar">∣</span> ' + parts[1]) : parts[0];
      return '<tr><td>' + r[0] + '</td><td class="arr-cell">' + html + '</td></tr>';
    }).join('');
    table.innerHTML = thead + '<tbody>' + bodyRows + '</tbody>';
    root.appendChild(cap);
    root.appendChild(table);
    renderMath(root);
  }

  // ===================================================================
  // Going deeper (collapsible)
  // ===================================================================
  function buildGoingDeeper(root) {
    var wrap = el('div', 'details-block');
    var summary = document.createElement('button');
    summary.type = 'button';
    summary.className = 'details-summary';
    summary.setAttribute('aria-expanded', 'false');
    summary.innerHTML = '<span>Going deeper: the exact average number of comparisons</span><span class="chev" aria-hidden="true">+</span>';
    var content = el('div', 'details-content');
    content.hidden = true;
    content.innerHTML =
      '<p>The bound $C \\le I + (n-1)$ overcounts by one for each key that travels all the way to the front: for that key, the loop ends on <code>j &gt; 0</code> without a final comparison. Position $i$ holds a new minimum (a key smaller than everything before it) with probability $\\frac{1}{i+1}$, since each of the first $i+1$ keys is equally likely to be the smallest of them. Summing over $i = 1, \\dots, n-1$, the expected number of such keys is $H_n - 1$, where $H_n = 1 + \\frac12 + \\dots + \\frac1n$. Therefore</p>' +
      '<div class="eq-row"><div class="eq-math">$$\\mathbb{E}[C] \\;=\\; \\frac{n(n-1)}{4} + (n-1) - (H_n - 1) \\;=\\; \\frac{n(n-1)}{4} + n - H_n.$$</div><span class="tag tag-proof">proof</span></div>' +
      '<p>For $n = 3$ this gives $1.5 + 3 - \\frac{11}{6} = \\frac{8}{3}$, which matches a direct count over all six orderings.</p>';
    summary.addEventListener('click', function () {
      var willOpen = content.hidden;
      content.hidden = !willOpen;
      summary.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    wrap.appendChild(summary);
    wrap.appendChild(content);
    root.appendChild(wrap);
    renderMath(content);
    return { contentEl: content, summaryEl: summary };
  }

  // ===================================================================
  // Figure 3: cost plot
  // ===================================================================
  function buildCostPlot(root) {
    var state = { seed: 0x5eed0001 };
    var wrap = el('div', 'figure');
    wrap.appendChild(makeCaption('FIG. 3', 'Comparisons made by insertion sort. Dots: the mean over 200 random permutations for each $n$. <span class="tag tag-empirical">empirical</span> Curves: $n-1$ (sorted input), $\\frac{n(n-1)}{4} + n - H_n$ (exact average), $\\frac{n(n-1)}{2}$ (reversed input). <span class="tag tag-proof">proof</span>'));
    var body = el('div', 'figure-body');
    var top = el('div', 'plot-top');
    var legendEl = el('div', 'plot-legend');
    legendEl.innerHTML =
      '<span class="plot-legend-item"><svg width="20" height="10" aria-hidden="true"><line x1="0" y1="5" x2="20" y2="5" stroke="#111111" stroke-width="2"/></svg>best (n&minus;1)</span>' +
      '<span class="plot-legend-item"><svg width="20" height="10" aria-hidden="true"><line x1="0" y1="5" x2="20" y2="5" stroke="#111111" stroke-width="2" stroke-dasharray="4,3"/></svg>average</span>' +
      '<span class="plot-legend-item"><svg width="20" height="10" aria-hidden="true"><line x1="0" y1="5" x2="20" y2="5" stroke="#e30613" stroke-width="2"/></svg>worst (n(n&minus;1)/2)</span>' +
      '<span class="plot-legend-item"><svg width="10" height="10" aria-hidden="true"><rect width="10" height="10" fill="#111111"/></svg>sampled mean</span>';
    var resampleBtn = mkBtn('Resample', 'secondary');
    top.appendChild(legendEl);
    top.appendChild(resampleBtn);
    var plotWrap = el('div', 'plot-wrap');
    var tooltip = el('div', 'plot-tooltip');
    tooltip.setAttribute('aria-live', 'polite');
    body.appendChild(top);
    body.appendChild(plotWrap);
    body.appendChild(tooltip);
    wrap.appendChild(body);
    root.appendChild(wrap);
    renderMath(wrap);

    function render() {
      var data = SC.sampleCosts(state.seed);
      var W = 680, H = 360;
      var padL = 48, padR = 16, padT = 16, padB = 36;
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var xMax = 40, yMax = SC.worstC(40);
      function xPix(n) { return padL + (n / xMax) * plotW; }
      function yPix(c) { return padT + plotH - (c / yMax) * plotH; }

      var isNarrow = window.innerWidth <= 480;
      var xTicks = isNarrow ? [2, 10, 20, 30, 40] : [2, 8, 16, 24, 32, 40];
      var yTicks = isNarrow ? [0, 400, 800] : [0, 200, 400, 600, 800];

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', '100%');
      svg.style.display = 'block';

      function line(x1, y1, x2, y2, stroke, dash, w) {
        var l = document.createElementNS(svgNS, 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('stroke', stroke);
        l.setAttribute('stroke-width', w || 2);
        if (dash) l.setAttribute('stroke-dasharray', dash);
        return l;
      }
      function text(x, y, str, anchor, size, fill) {
        var t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', x); t.setAttribute('y', y);
        t.setAttribute('text-anchor', anchor || 'middle');
        t.setAttribute('font-family', 'Inter Tight, sans-serif');
        t.setAttribute('font-size', size || 11);
        t.setAttribute('fill', fill || '#111111');
        t.textContent = str;
        return t;
      }

      svg.appendChild(line(padL, padT, padL, padT + plotH, '#111111', null, 2.5));
      svg.appendChild(line(padL, padT + plotH, padL + plotW, padT + plotH, '#111111', null, 2.5));

      xTicks.forEach(function (n) {
        var x = xPix(n);
        svg.appendChild(line(x, padT + plotH, x, padT + plotH + 6, '#111111'));
        svg.appendChild(text(x, padT + plotH + 20, String(n)));
      });
      yTicks.forEach(function (c) {
        var y = yPix(c);
        svg.appendChild(line(padL - 6, y, padL, y, '#111111'));
        svg.appendChild(text(padL - 10, y + 4, String(c), 'end'));
      });
      svg.appendChild(text(padL + plotW / 2, H - 4, 'n', 'middle', 12));
      var yLabel = text(14, padT + plotH / 2, 'comparisons', 'middle', 11);
      yLabel.setAttribute('transform', 'rotate(-90 14 ' + (padT + plotH / 2) + ')');
      svg.appendChild(yLabel);

      function curvePath(fn) {
        var pts = [];
        for (var n = 2; n <= 40; n++) pts.push(xPix(n) + ',' + yPix(fn(n)));
        return 'M' + pts.join(' L');
      }
      var pBest = document.createElementNS(svgNS, 'path');
      pBest.setAttribute('d', curvePath(SC.bestC));
      pBest.setAttribute('fill', 'none'); pBest.setAttribute('stroke', '#111111'); pBest.setAttribute('stroke-width', '2');
      svg.appendChild(pBest);
      var pAvg = document.createElementNS(svgNS, 'path');
      pAvg.setAttribute('d', curvePath(SC.exactAverageC));
      pAvg.setAttribute('fill', 'none'); pAvg.setAttribute('stroke', '#111111'); pAvg.setAttribute('stroke-width', '2'); pAvg.setAttribute('stroke-dasharray', '5,4');
      svg.appendChild(pAvg);
      var pWorst = document.createElementNS(svgNS, 'path');
      pWorst.setAttribute('d', curvePath(SC.worstC));
      pWorst.setAttribute('fill', 'none'); pWorst.setAttribute('stroke', '#e30613'); pWorst.setAttribute('stroke-width', '2');
      svg.appendChild(pWorst);

      svg.appendChild(text(xPix(40) - 6, yPix(SC.bestC(40)) - 6, 'best', 'end', 11));
      svg.appendChild(text(xPix(40) - 6, yPix(SC.exactAverageC(40)) - 10, 'avg', 'end', 11));
      svg.appendChild(text(xPix(40) - 6, yPix(SC.worstC(40)) + 16, 'worst', 'end', 11, '#e30613'));

      data.forEach(function (d) {
        var x = xPix(d.n);
        var yMean = yPix(d.mean), yMin = yPix(d.min), yMax2 = yPix(d.max);
        svg.appendChild(line(x, yMin, x, yMax2, '#8a8a8a', null, 1.5));
        svg.appendChild(line(x - 4, yMin, x + 4, yMin, '#8a8a8a'));
        svg.appendChild(line(x - 4, yMax2, x + 4, yMax2, '#8a8a8a'));
        var size = 7;
        var rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', x - size / 2); rect.setAttribute('y', yMean - size / 2);
        rect.setAttribute('width', size); rect.setAttribute('height', size);
        rect.setAttribute('fill', '#111111');
        rect.setAttribute('tabindex', '0');
        rect.setAttribute('role', 'button');
        var label = 'n = ' + d.n + ': mean ' + d.mean.toFixed(1) + ' (min ' + d.min + ', max ' + d.max + ')';
        rect.setAttribute('aria-label', label);
        rect.style.cursor = 'pointer';
        function show() { tooltip.textContent = label; }
        rect.addEventListener('mouseenter', show);
        rect.addEventListener('focus', show);
        rect.addEventListener('click', show);
        svg.appendChild(rect);
      });

      plotWrap.innerHTML = '';
      plotWrap.appendChild(svg);
    }

    resampleBtn.addEventListener('click', function () { state.seed = SC.newSeed(); render(); });
    render();
  }

  // ===================================================================
  // Figure 4: knowledge view (Hasse diagram)
  // ===================================================================
  function buildKnowledgeView(root) {
    var states = SC.buildKnowledgeStates();
    var state = { k: 0 };
    var order = [4, 1, 3, 5, 2];
    var orderIndex = {};
    order.forEach(function (v, i) { orderIndex[v] = i; });
    var values = [1, 2, 3, 4, 5];

    var wrap = el('div', 'figure');
    wrap.appendChild(makeCaption('FIG. 4', 'What insertion sort knows about $[4,1,3,5,2]$ after each comparison. A line from $x$ up to $y$ means $x < y$ is known, directly or by transitivity. The number of orderings still possible starts at $120$ and must reach $1$.'));
    var body = el('div', 'figure-body');
    body.tabIndex = 0;
    body.setAttribute('role', 'group');
    body.setAttribute('aria-label', 'Knowledge view. Use the left and right arrow keys to move through comparisons.');

    var controls = el('div', 'know-controls');
    var prevBtn = mkBtn('◀ Prev', 'secondary');
    var nextBtn = mkBtn('Next ▶', 'secondary');
    var kDisplay = el('span', 'know-k-display');
    controls.appendChild(prevBtn);
    controls.appendChild(kDisplay);
    controls.appendChild(nextBtn);

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0; slider.max = 8; slider.value = 0;
    slider.className = 'scrub';
    slider.setAttribute('aria-label', 'comparison step k, 0 to 8');

    var svgWrap = el('div', 'inv-svg-wrap');
    var statsEl = el('div', 'know-stats');

    body.appendChild(controls);
    body.appendChild(slider);
    body.appendChild(svgWrap);
    body.appendChild(statsEl);
    wrap.appendChild(body);
    root.appendChild(wrap);

    var cellSize = 42, slotW = 118, levelH = 72;
    var W = 5 * slotW, H = 5 * levelH + 30;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.style.display = 'block';
    svg.style.minWidth = '280px';
    var edgesLayer = document.createElementNS(svgNS, 'g');
    var nodesLayer = document.createElementNS(svgNS, 'g');
    svg.appendChild(edgesLayer);
    svg.appendChild(nodesLayer);
    svgWrap.appendChild(svg);

    var nodeEls = {};
    values.forEach(function (v) {
      var g = document.createElementNS(svgNS, 'g');
      var rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('width', cellSize); rect.setAttribute('height', cellSize);
      rect.setAttribute('x', -cellSize / 2); rect.setAttribute('y', -cellSize / 2);
      rect.setAttribute('fill', '#111111'); rect.setAttribute('stroke', '#111111');
      var text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', 0); text.setAttribute('y', 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-size', '17');
      text.setAttribute('fill', '#ffffff');
      text.textContent = v;
      g.appendChild(rect);
      g.appendChild(text);
      nodesLayer.appendChild(g);
      nodeEls[v] = g;
    });

    function nodePos(k) {
      var s = states[k];
      var byLevel = {};
      values.forEach(function (v) {
        var lvl = s.level[v];
        (byLevel[lvl] = byLevel[lvl] || []).push(v);
      });
      var pos = {};
      Object.keys(byLevel).forEach(function (lvlStr) {
        var lvl = Number(lvlStr);
        var arr = byLevel[lvl].slice().sort(function (a, b) { return orderIndex[a] - orderIndex[b]; });
        var count = arr.length;
        arr.forEach(function (v, slotIdx) {
          var totalWidth = count * slotW;
          var xOffset = (W - totalWidth) / 2;
          var x = xOffset + (slotIdx + 0.5) * slotW;
          var y = H - 26 - lvl * levelH;
          pos[v] = { x: x, y: y };
        });
      });
      return pos;
    }

    function render() {
      var k = state.k;
      var s = states[k];
      var pos = nodePos(k);
      values.forEach(function (v) {
        var p = pos[v];
        nodeEls[v].style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
      });
      edgesLayer.innerHTML = '';
      var justKey = s.justLearned ? (s.justLearned.x + ',' + s.justLearned.y) : null;
      var drewJust = false;
      s.edges.forEach(function (e) {
        var isJust = justKey === (e[0] + ',' + e[1]);
        if (isJust) drewJust = true;
        var p1 = pos[e[0]], p2 = pos[e[1]];
        var l = document.createElementNS(svgNS, 'line');
        l.setAttribute('x1', p1.x); l.setAttribute('y1', p1.y - cellSize / 2);
        l.setAttribute('x2', p2.x); l.setAttribute('y2', p2.y + cellSize / 2);
        l.setAttribute('stroke', isJust ? '#e30613' : '#111111');
        l.setAttribute('stroke-width', isJust ? '3' : '2');
        edgesLayer.appendChild(l);
      });
      if (s.justLearned && !drewJust) {
        var p1b = pos[s.justLearned.x], p2b = pos[s.justLearned.y];
        var l2 = document.createElementNS(svgNS, 'line');
        l2.setAttribute('x1', p1b.x); l2.setAttribute('y1', p1b.y);
        l2.setAttribute('x2', p2b.x); l2.setAttribute('y2', p2b.y);
        l2.setAttribute('stroke', '#e30613'); l2.setAttribute('stroke-width', '3'); l2.setAttribute('stroke-dasharray', '5,4');
        edgesLayer.appendChild(l2);
      }

      kDisplay.innerHTML = 'After comparison <span class="k">' + k + '</span> of 8';
      slider.value = k;
      prevBtn.disabled = k === 0;
      nextBtn.disabled = k === 8;

      var lines = [];
      if (k === 0) {
        lines.push('No comparisons made yet.');
        lines.push('Orderings still possible: <b>120</b>.');
      } else {
        var rel = s.justLearned;
        lines.push('Compared ' + rel.y + ' and ' + rel.x + ': $' + rel.x + ' < ' + rel.y + '$.');
        lines.push('Orderings still possible: <b>' + s.prevCount + ' → ' + s.count + '</b>.');
      }
      lines.push('Bits remaining: $\\log_2 ' + s.count + ' \\approx ' + s.bits.toFixed(2) + '$.');
      statsEl.innerHTML = lines.map(function (t) { return '<div class="line">' + t + '</div>'; }).join('');
      renderMath(statsEl);
    }

    function goTo(k) { state.k = Math.max(0, Math.min(8, k)); render(); }

    prevBtn.addEventListener('click', function () { goTo(state.k - 1); });
    nextBtn.addEventListener('click', function () { goTo(state.k + 1); });
    slider.addEventListener('input', function () { goTo(Number(slider.value)); });
    body.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); goTo(state.k + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); goTo(state.k - 1); }
    });

    render();
    renderMath(wrap);
    requestAnimationFrame(function () {
      values.forEach(function (v) { nodeEls[v].style.transition = 'transform 300ms ease'; });
    });
  }

  // ===================================================================
  // Checkpoint
  // ===================================================================
  function buildCheckpointQ4(container, markAttempted) {
    var head = el('div', 'q-head');
    head.innerHTML = '<span class="q-num">Q4</span>';
    var promptP = document.createElement('p');
    promptP.className = 'q-prompt';
    promptP.textContent = 'Find the bug. This version is meant to be insertion sort. Click the line that is wrong.';
    container.appendChild(head);
    container.appendChild(promptP);

    var lineFeedbacks = {
      3: 'That\'s fine. $a[0:1]$ is already sorted, so the first element to insert is $a[1]$.',
      5: 'That\'s fine. The key starts at position $i$.',
      7: 'That\'s fine. Python evaluates the right-hand side before assigning, so the tuple swap is safe.',
      8: 'That\'s fine. Decrementing $j$ is what moves the key left.',
    };
    var genericLineMsg = 'That line is fine. Look at the loop condition.';
    var correctMsg = 'Right. When $j = 0$, <code>a[j - 1]</code> is <code>a[-1]</code>. In Python that isn\'t an error: it\'s the <em>last</em> element. The loop can then swap the first element with the last one.';
    var bugLine = SC.PY.buggy.bugLine;

    var codeBlock = el('div', 'code-block');
    var fb = el('div', 'feedback-area');
    var lineEls = [];
    var markAttemptedCalled = false;

    SC.PY.buggy.lines.forEach(function (line, idx) {
      var num = idx + 1;
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'code-line bug-line';
      row.dataset.line = num;
      row.setAttribute('aria-label', 'line ' + num + ': ' + line.trim());
      var ln = el('span', 'ln');
      ln.textContent = num;
      var src = el('span', 'src');
      src.innerHTML = highlightPy(line);
      row.appendChild(ln);
      row.appendChild(src);
      row.addEventListener('click', function () {
        if (!markAttemptedCalled) { markAttemptedCalled = true; markAttempted(); }
        lineEls.forEach(function (r) { r.classList.remove('bug-picked-wrong', 'bug-picked-right'); });
        if (num === bugLine) {
          row.classList.add('bug-picked-right');
          fb.innerHTML = '<div class="feedback correct">' + correctMsg + '</div>';
          renderMath(fb);
          runBtn.hidden = false;
        } else {
          row.classList.add('bug-picked-wrong');
          var msg = Object.prototype.hasOwnProperty.call(lineFeedbacks, num) ? lineFeedbacks[num] : genericLineMsg;
          fb.innerHTML = '<div class="feedback wrong">' + msg + '</div>';
          renderMath(fb);
        }
      });
      codeBlock.appendChild(row);
      lineEls.push(row);
    });

    container.appendChild(codeBlock);
    container.appendChild(fb);
    var runBtn = mkBtn('Run the buggy version on [2, 1]', 'secondary');
    runBtn.hidden = true;
    var runResultEl = el('div', 'reveal-text');
    runBtn.addEventListener('click', function () {
      var result = SC.buggyInsertion([2, 1]);
      runResultEl.textContent = 'returns [' + result.join(', ') + ']: not sorted.';
    });
    container.appendChild(runBtn);
    container.appendChild(runResultEl);
  }

  function buildCheckpoint(root, gate) {
    var wrap = el('div', 'checkpoint-block');
    var introP = document.createElement('p');
    introP.className = 'checkpoint-intro';
    introP.textContent = 'Four questions. Each wrong answer explains itself. The ledger below opens once you\'ve attempted all four, or press “continue anyway”, which records the skipped questions as gaps.';
    wrap.appendChild(introP);

    var attempted = [false, false, false, false];
    var qNames = ['Q1', 'Q2', 'Q3', 'Q4'];

    function checkAll() {
      if (attempted.every(Boolean)) {
        revealGate(gate);
        gapsNote.hidden = true;
      }
    }

    var q1 = el('div', 'q-block');
    q1.appendChild(Object.assign(document.createElement('div'), { className: 'q-head', innerHTML: '<span class="q-num">Q1</span>' }));
    var q1body = el('div', '');
    mountMC(q1body, {
      promptHTML: 'An algorithm may only swap neighbours. What is the fewest number of swaps it can use to sort $[5,4,3,2,1]$?',
      options: [
        { label: '4.', correct: false, feedback: 'That\'s $n-1$, as if each element needed a single move. But the 1 alone must travel four positions, the 2 three, and so on. Count inversions instead.' },
        { label: '5.', correct: false, feedback: 'One swap per element isn\'t enough: a swap moves just two elements, one position each.' },
        { label: '10.', correct: true, feedback: 'Right: $I = \\binom{5}{2} = 10$, and Theorem 1 says no adjacent-swap algorithm can do better.' },
        { label: '20.', correct: false, feedback: 'That counts every pair twice, in both orders. An inversion is a pair of positions $i < j$.' },
      ],
      committedCb: function () { attempted[0] = true; checkAll(); },
    });
    q1.appendChild(q1body);
    wrap.appendChild(q1);

    var q2 = el('div', 'q-block');
    q2.appendChild(Object.assign(document.createElement('div'), { className: 'q-head', innerHTML: '<span class="q-num">Q2</span>' }));
    var q2body = el('div', '');
    mountNumeric(q2body, {
      promptHTML: 'How many comparisons does <code>insertion_sort</code> make on $[4, 1, 3, 5, 2]$?',
      answer: '8',
      correctMsg: 'Right: $I + (n-1) - 1 = 5 + 4 - 1 = 8$. The first key, 1, reaches the front, so its loop ends on <code>j &gt; 0</code> without a comparison.',
      wrongMap: {
        '5': 'That\'s the number of swaps, $I(a)$. Add the final false test that ends each insertion, except for a key that reaches the front.',
        '9': 'Almost. The key 1 reaches position 0, so its loop ends on <code>j &gt; 0</code> without comparing.',
        '10': 'That\'s $\\binom{5}{2}$, the count for repeated selection. Insertion sort adapts to the input.',
      },
      genericWrong: 'Not quite. Step through Figure 2 with the Example preset and watch the comparison counter.',
      committedCb: function () { attempted[1] = true; checkAll(); },
    });
    q2.appendChild(q2body);
    wrap.appendChild(q2);

    var q3 = el('div', 'q-block');
    q3.appendChild(Object.assign(document.createElement('div'), { className: 'q-head', innerHTML: '<span class="q-num">Q3</span>' }));
    var q3body = el('div', '');
    mountMC(q3body, {
      promptHTML: 'Theorem 1 says adjacent-swap algorithms need $\\Omega(n^2)$ swaps in the worst case. What does it tell us about sorting in general?',
      options: [
        { label: 'Every sorting algorithm needs $\\Omega(n^2)$ time in the worst case.', correct: false, feedback: 'That would be a bound on the <em>problem</em>. Theorem 1 covers only algorithms that move elements between neighbours.' },
        { label: 'Nothing about algorithms that can move an element far in one step.', correct: true, feedback: 'Right. It\'s a bound on a class of algorithms. Whether sorting itself needs $n^2$ work is still an open question for us.' },
        { label: 'Every sorting algorithm needs $\\Omega(n^2)$ comparisons.', correct: false, feedback: 'Theorem 1 counts swaps, not comparisons, and it covers only one class of algorithms.' },
        { label: 'Insertion sort needs $\\Omega(n^2)$ swaps on every input.', correct: false, feedback: 'Not on every input: on sorted input it makes $0$ swaps. The bound is about the worst case, and, as §5 showed, the average case.' },
      ],
      committedCb: function () { attempted[2] = true; checkAll(); },
    });
    q3.appendChild(q3body);
    wrap.appendChild(q3);

    var q4 = el('div', 'q-block');
    var q4body = el('div', '');
    buildCheckpointQ4(q4body, function () { attempted[3] = true; checkAll(); });
    q4.appendChild(q4body);
    wrap.appendChild(q4);

    var continueBtn = mkBtn('Continue anyway', 'secondary');
    var gapsNote = el('div', 'checkpoint-gate-note');
    gapsNote.hidden = true;
    continueBtn.addEventListener('click', function () {
      revealGate(gate);
      var gaps = [];
      attempted.forEach(function (done, i) { if (!done) gaps.push(qNames[i]); });
      if (gaps.length) {
        gapsNote.innerHTML = 'Skipped questions, recorded as gaps: <ul>' + gaps.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>';
        gapsNote.hidden = false;
      } else {
        gapsNote.hidden = true;
      }
    });
    wrap.appendChild(continueBtn);
    wrap.appendChild(gapsNote);

    root.appendChild(wrap);
    renderMath(wrap);
  }

  // ===================================================================
  // Ledger
  // ===================================================================
  function buildLedger(root) {
    var wrap = el('div', 'ledger-block');
    function section(title, html) {
      var s = el('div', 'ledger-section');
      var h = document.createElement('h4');
      h.textContent = title;
      s.appendChild(h);
      var b = document.createElement('div');
      b.innerHTML = html;
      s.appendChild(b);
      wrap.appendChild(s);
    }
    section('Established', '<ul>' + [
      '$I(a)$ measures disorder: it is $0$ exactly when $a$ is sorted, and at most $\\binom{n}{2}$, reached exactly by the reversed array. <span class="tag tag-proof">proof</span>',
      'Swapping an adjacent inverted pair removes exactly one inversion. <span class="tag tag-proof">proof</span>',
      'Any adjacent-swap algorithm needs at least $I(a)$ swaps: $\\frac{n(n-1)}{2}$ in the worst case and $\\frac{n(n-1)}{4}$ on average. This is a bound on a class of algorithms. <span class="tag tag-proof">proof</span>',
      'Insertion sort is correct. Invariant: $a[0:i]$ is a sorted rearrangement of the first $i$ input elements. <span class="tag tag-proof">proof</span>',
      'Insertion sort makes exactly $I(a)$ swaps and $I(a) \\le C(a) \\le I(a) + n - 1$ comparisons: $n - 1$ at best, $\\frac{n(n-1)}{2}$ at worst, and $\\frac{n(n-1)}{4} + n - H_n$ on average over uniformly random permutations. <span class="tag tag-proof">proof</span>',
      'Measured averages agree with the exact formula. <span class="tag tag-empirical">empirical</span>',
    ].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>');
    section('Assumptions in force', '<p>distinct keys; information only through comparisons; uniformly random permutations for every average-case statement.</p>');
    section('Lenses in use', '<p><em>Knowledge</em>, glimpsed in Figure 4. <em>Movement</em>, new: Theorem 1 is a bound on movement, not on information.</p>');
    section('Reasoning tools acquired', '<p>finding an invariant by tracing passes and rejecting a false candidate; indicator variables and linearity of expectation; bounding a whole class of algorithms by a quantity each step can change by at most one.</p>');
    section('Open question → Lesson 4', '<p>Insertion sort spends one comparison and one swap per inversion. If we found each key\'s place with fewer comparisons, would we still be stuck with $I(a)$ moves? Is knowing the order the same as moving into it?</p>');
    root.appendChild(wrap);
    renderMath(wrap);
  }

  // ===================================================================
  // Init
  // ===================================================================
  function init() {
    var stepperApi = null;
    var goingDeeperRef = null;

    var elPrereq = document.getElementById('c-prereq-check');
    if (elPrereq) buildPrereqCheck(elPrereq);

    var gateSec1 = document.getElementById('gate-sec1'); registerGate(gateSec1);
    var elPredictInv = document.getElementById('c-predict-inversions');
    if (elPredictInv) buildPredictInversions(elPredictInv, gateSec1);
    var elInvDiagram = document.getElementById('c-inversion-diagram');
    if (elInvDiagram) buildInversionDiagram(elInvDiagram);

    var gateSec2 = document.getElementById('gate-sec2'); registerGate(gateSec2);
    var elPredictSwap = document.getElementById('c-predict-swap');
    if (elPredictSwap) buildPredictSwap(elPredictSwap, gateSec2);

    var gateSec3 = document.getElementById('gate-sec3'); registerGate(gateSec3);
    var elPredictTotal = document.getElementById('c-predict-total-swaps');
    if (elPredictTotal) buildPredictTotalSwaps(elPredictTotal, gateSec3);

    var elListing = document.getElementById('c-python-listing');
    var listingApi = elListing ? buildPythonListing(elListing) : { setCurrentLine: function () {} };
    var elStepper = document.getElementById('c-stepper');
    if (elStepper) stepperApi = buildStepper(elStepper, listingApi);

    var elTrace = document.getElementById('c-trace-table');
    if (elTrace) buildTraceTable(elTrace);

    var elGoingDeeper = document.getElementById('c-going-deeper');
    if (elGoingDeeper) goingDeeperRef = buildGoingDeeper(elGoingDeeper);

    var elCostPlot = document.getElementById('c-cost-plot');
    if (elCostPlot) buildCostPlot(elCostPlot);

    var elKnowledge = document.getElementById('c-knowledge-view');
    if (elKnowledge) buildKnowledgeView(elKnowledge);

    var gateLedger = document.getElementById('gate-ledger'); registerGate(gateLedger);
    var elCheckpoint = document.getElementById('c-checkpoint');
    if (elCheckpoint) buildCheckpoint(elCheckpoint, gateLedger);
    var elLedger = document.getElementById('c-ledger');
    if (elLedger) buildLedger(elLedger);

    renderMath(document.body);

    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('reveal') === '1') {
        ALL_GATES.forEach(revealGate);
        if (goingDeeperRef) {
          goingDeeperRef.contentEl.hidden = false;
          goingDeeperRef.summaryEl.setAttribute('aria-expanded', 'true');
        }
      }
    } catch (e) { /* no-op */ }

    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (!stepperApi) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        stepperApi.togglePlay();
      } else if (e.key === 'ArrowLeft') {
        stepperApi.stepBack();
      } else if (e.key === 'ArrowRight') {
        stepperApi.stepForward();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
