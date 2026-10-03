# Shared assets: theme and components

This is the contract between `assets/course.css` + `assets/course.js` and the lesson pages.
Lesson pages are written against it; if the implementation must deviate, update this file.

The visual design is §7.7 of `explanations-prompts/sorting-first-principles.md` (Swiss grid).
Technical rules are §8 there: works from `file://`, no modules, no fetch, classic `<script src>`.

## Files

```
index.html
lesson-NN.html          one per lesson
lesson-NN.js            that lesson's pure Python ports + widget wiring (UMD, see below)
assets/course.css       theme: every color, font, size, spacing as a custom property
assets/course.js        page behaviours, exercises, components (window.Course)
assets/vendor/katex/    katex.min.css, katex.min.js, contrib/auto-render.min.js, fonts/*.woff2
assets/vendor/prism/    prism-core.min.js, prism-python.min.js
verify/                 Python checks, JS-port parity tests, headless page checks
```

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lesson 1 · What does it mean for things to be in order?</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;800&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400&display=swap">
<link rel="stylesheet" href="assets/vendor/katex/katex.min.css">
<link rel="stylesheet" href="assets/course.css">
</head>
<body>
<main class="page" data-lesson="1">
  <header class="lesson-header">
    <nav class="lesson-nav">
      <a href="index.html">← All lessons</a>
      <span class="na">Previous: none</span>          <!-- or <a href="lesson-00.html">← Lesson 0</a> -->
      <a href="lesson-02.html">Lesson 2 →</a>        <!-- or <span class="na">Lesson 2: not yet available</span> -->
    </nav>
    <p class="kicker">Lesson 1</p>
    <h1 class="title">What does it mean for things to be in order?</h1>
    <p class="meta">Stage 0 · Foundations</p>
  </header>
  ... body ...
  <footer class="foot"><p>Order and Sorting from First Principles · Lesson 1</p></footer>
</main>
<script src="assets/vendor/katex/katex.min.js"></script>
<script src="assets/vendor/katex/contrib/auto-render.min.js"></script>
<script src="assets/vendor/prism/prism-core.min.js"></script>
<script src="assets/vendor/prism/prism-python.min.js"></script>
<script src="assets/course.js"></script>
<script src="lesson-01.js"></script>
</body>
</html>
```

The header is followed by the 4px rule automatically (`.lesson-header` has a heavy bottom rule).
Everything degrades gracefully if KaTeX or Prism failed to load (raw TeX / plain code shown).

## Math

Inline `\( ... \)`, display `\[ ... \]`. Never `$`. Escape `<` as `&lt;` inside TeX in HTML.
`Course.mathIn(el)` renders math inside nodes inserted after load (all components call it on
feedback, captions and messages they insert).

Display equation with a status tag flush right:

```html
<div class="eq-row"><div class="eq">\[ T(n)=\sum_{j=1}^{n-1}\frac{n!}{j!} \]</div><span class="tag t-proof">proof</span></div>
```

## Text blocks

```html
<section class="where" id="where">
  <p class="label">Where we are</p>
  <p>...</p>
  <ul class="deps"><li><a href="lesson-01.html#ledger">Lesson 1 ledger: ...</a></li></ul>
</section>

<section class="lsec" id="s01">
  <h2 class="sec-head"><span class="sec-num">01</span><span class="sec-title">Four requests</span></h2>
  ...
</section>
```

Callouts (`def`, `lemma`, `theorem`, `invariant`, `corollary`: 4px black left rule;
`proof`: red rule and red label, ∎ appended automatically; `proof sketch` the same with label
"Proof sketch"):

```html
<div class="callout def"><p class="callout-label">Definition (strict partial order)</p><p>...</p></div>
<div class="callout lemma" id="lem-asym"><p class="callout-label">Lemma 1 (asymmetry)</p><p>...</p></div>
<div class="callout proof"><p class="callout-label">Proof</p><p>...</p></div>
<div class="note"><p class="callout-label">Note</p><p>...</p></div>
<div class="open-question"><p class="callout-label">Open question</p><p class="oq">...</p></div>
<details class="deeper"><summary>Going deeper · Title</summary><div class="deeper-body">...</div></details>
<details class="deeper common"><summary>Common question · Title</summary><div class="deeper-body">...</div></details>
```

Epistemic tags (inline after the claim):

```html
<span class="tag t-proof">proof</span>        red outline, red text
<span class="tag t-sketch">proof sketch</span> red dashed outline
<span class="tag t-empirical">empirical</span> solid black, white text
<span class="tag t-heuristic">heuristic</span> black outline
<span class="tag t-intuition">intuition</span> gray dotted outline, gray text
```

Figures, tables, listings (label above, caption under the label):

```html
<figure class="fig" id="fig-1">
  <figcaption><span class="fig-label">Fig. 1</span><span class="fig-caption">...</span></figcaption>
  ... svg / component container ...
</figure>

<figure class="fig"><figcaption><span class="fig-label">Table 1</span><span class="fig-caption">...</span></figcaption>
  <table class="tbl"><thead>...</thead><tbody>...</tbody></table>
</figure>

<figure class="listing" id="lst-1">
  <figcaption><span class="fig-label">Listing 1</span><span class="fig-caption">...</span></figcaption>
  <pre class="py">def f(xs):
    return xs</pre>
</figure>
```

`pre.py` is upgraded to a highlighted, line-numbered block (keywords bold, comments gray italic)
with a "COPY CODE" button above, right-aligned; the copy is the original text. Inline identifiers:
`<code>is_sorted</code>`.

Array figures drawn in static HTML (no JS needed):

```html
<div class="cells">
  <span class="cell">7</span><span class="cell c-compare">2</span><span class="cell c-key">9</span><span class="cell c-sorted">4</span>
</div>
<div class="legend"><span class="sw c-sorted"></span>Sorted <span class="sw c-compare"></span>Compared ...</div>
```

Cell kinds: `c-compare` (red), `c-key` (solid black, white text), `c-sorted` (gray-1 fill),
`c-faded` (gray text), `c-outline` (heavy black outline). Never color alone: a region or state that
matters is also labeled.

## Exercises

All exercises share one wrapper. `id` must be unique on the page (used for progress).

```html
<div class="ex" data-type="mcq" id="q-axioms">
  <p class="ex-num">Q1</p>
  <div class="ex-prompt"><p>...</p></div>
  <ul class="ex-options">
    <li data-correct><div class="opt">...</div><div class="fb">✓ feedback ...</div></li>
    <li><div class="opt">...</div><div class="fb">misconception named and corrected ...</div></li>
  </ul>
  <div class="ex-hints"><div class="hint">...</div><div class="hint">...</div></div>
  <div class="ex-solution">... worked solution ...</div>
</div>
```

- `mcq`: one click answers; feedback for that option appears; after a wrong answer the learner may
  try another. Correct → option filled black, feedback block black with ✓. Wrong → thick red
  outline, feedback block red-outlined with ✗. Letters "(a)" in red.
- `multi`: same markup, several `data-correct`; a CHECK button; afterwards every option shows its
  feedback, marked by whether the learner's choice for it was right.
- `numeric`: `data-answer="5"` (number or fraction `a/b`), optional `data-tol="0.01"`.
  Feedback blocks: `<div class="fb" data-when="correct">`, `<div class="fb" data-when="24,25">`
  (exact values of common wrong answers), `<div class="fb" data-when="other">`.
  An input box and CHECK button are generated.
- `match`: `data-categories="total:Strict total order|weak:Strict weak ordering|partial:Partial, not weak|none:Not an order"`;
  items in `<ul class="ex-items"><li data-answer="weak"><div class="item">...</div><div class="fb" data-when="partial">...</div><div class="fb" data-when="correct">...</div><div class="fb" data-when="other">...</div></li></ul>`.
  Each item gets a joined toggle group of the categories; CHECK gives per-item feedback.
- `order`: `<ol class="ex-steps"><li data-pos="1">...</li><li data-pos="2">...</li><li data-pos="0" data-why="...">false step</li></ol>`.
  Shown shuffled (seeded by the exercise id); ↑/↓ buttons and an EXCLUDE toggle per step. Correct iff
  exactly the `data-pos="0"` steps are excluded and the rest are in ascending order. Feedback names
  the first misplaced step, shows `data-why` for a kept false step, and flags a true step excluded.
  `<div class="fb" data-when="correct">` for the success text.
- `lines` (find the bug): contains a `pre.py`; `data-answer="4"` (line numbers, comma-separated).
  Learner clicks a line; feedback `data-when="4"` / `data-when="correct"` / `data-when="other"`.
- `custom` (build an input, free answers): `data-check="L01.checkTasks"` names a global function
  (dotted path). An input box (placeholder from `data-placeholder`) and RUN button are generated;
  the function receives the raw string and returns `{ok: boolean, html: string}`.

Every exercise may have `.ex-hints` (revealed one at a time: "HINT 1 OF 2") and `.ex-solution`
(revealed by a small gray underlined uppercase "SKIP, JUST SHOW ME" link, or after a correct
answer via "SHOW WORKED SOLUTION"). Feedback text is plain HTML and may contain math.

`data-remedy="lesson-01.html#s05"` on an exercise adds a remediation panel ("Revisit: …") after any
wrong answer. Used in prerequisite checks and anywhere a wrong answer signals a gap.

### Predict-first

```html
<div class="predict" id="pr-requests">
  <p class="label">Predict first</p>
  <div class="ex" data-type="mcq" id="pr-requests-q">...</div>
  <div class="reveal"> ... hidden until the learner has committed an answer ... </div>
</div>
```

The reveal opens after the first committed answer (right or wrong). A "SKIP, JUST SHOW ME" link
opens it without committing.

### Checkpoints and soft gates

```html
<div class="checkpoint" id="cp1"><p class="label">Checkpoint 1</p> ... .ex items ... </div>
<section class="lsec" id="s04" data-gate="cp1"> ... </section>
```

A section with `data-gate` stays collapsed behind a bar ("Attempt checkpoint 1 above to continue ·
CONTINUE ANYWAY") until every `.ex` in that checkpoint has an answer. "Continue anyway" opens it and
records the checkpoint as an open gap. `<div class="gaps"></div>` (in the ledger) lists open gaps
with links. Progress lives in `localStorage["order-course:v1"]` (all access in try/catch; the page
works fully without it): per lesson, attempted / correct exercise ids and skipped checkpoints.

### Prerequisite check

```html
<section class="prereq" id="prereq"><p class="label">Prerequisite check</p> ... .ex items with data-remedy ... </section>
```

## Ledger and bridge

```html
<section class="ledger" id="ledger">
  <h2 class="ledger-head">Ledger</h2>
  <div class="ledger-block"><p class="label">Established</p><ul><li>... <span class="tag t-proof">proof</span> <a href="#s03">§03</a></li></ul></div>
  <div class="ledger-block"><p class="label">Assumptions in force</p><ul>...</ul></div>
  <div class="ledger-block"><p class="label">Lenses in use</p><ul>...</ul></div>
  <div class="ledger-block"><p class="label">Reasoning tools acquired</p><ul>...</ul></div>
  <div class="ledger-block"><p class="label">Open gaps</p><div class="gaps"></div></div>
  <div class="open-question"><p class="callout-label">Open question</p><p class="oq">...</p></div>
</section>
<nav class="bridge"><a href="lesson-02.html"><span class="label">Next · Lesson 2</span><span class="bridge-title">What must a comparison promise?</span></a></nav>
```

## JavaScript API (`window.Course`)

Auto-initialised on `DOMContentLoaded`: math, code blocks, exercises, predicts, gates, gaps.

- `Course.mathIn(el)` — render math inside `el`.
- `Course.rng(seed)` — seeded PRNG (mulberry32) returning floats in [0, 1).
  `Course.shuffle(array, rng)`, `Course.randInt(rng, lo, hi)`.
- `Course.parseArray(text, {maxN, min, max, integers})` → `{ok, values, error}`. Accepts commas
  and/or spaces. Errors are human sentences ("Use at most 6 numbers: …").
- `Course.fmt(n)` — integer with thin-space thousands separators, tabular.
- `Course.codeBlock(el, pythonSource)` — render a static highlighted block; returns
  `{setLine(lineNumber|null)}` (used by the stepper).

### `Course.Stepper(container, opts)`

Plays a trace produced by a **faithful JS port** of the Python on the page (same variable names,
same control flow, same order of operations).

```js
const s = new Course.Stepper(el, {
  code: PY_SOURCE,                 // exact Python text shown on the page
  trace: input => steps,           // pure function, the port; returns Step[]
  input: [3, 1, 2],                // initial input
  presets: [ {label: 'Sorted', values: [1,2,3,4]},
             {label: 'Random', make: (rng, n) => [...]} ],
  maxN: 6, capReason: 'n! grows fast: 6 elements already means 720 candidates.',
  allowDuplicates: true, min: 0, max: 99,
  counters: [{key: 'comparisons', label: 'Comparisons'}, {key: 'candidates', label: 'Candidates'}],
  vars: ['i', 'candidate'],        // display order of variables
  legend: [{kind: 'compare', label: 'Compared'}, {kind: 'sorted', label: 'Passed so far'}],
  renderExtra: (step, el) => {},   // optional custom panel under the array
  onStep: (step, index, steps) => {} // optional sync hook (e.g. a PosetView)
});
```

`Step = { line, arr, marks?: {index: kind}, regions?: [{from, to, kind, label}], vars?: {...},
counters?: {...}, msg?: html, arrays?: [{label, values, marks}] }`. `line` is 1-based in `code`.
`counters` are cumulative values at that step. `regions` draw a labeled bracket under cells
`from..to-1`. `arrays` are extra rows (e.g. the current candidate).

Controls: reset, back, play/pause, forward, speed (0.5× 1× 2× 4×, joined toggle group),
preset toggle group, a custom-input box with LOAD (validated with `parseArray`, cap explained).
Keyboard when the stepper has focus: Space play/pause, ←/→ step, Home reset. Traces longer than
20,000 steps are refused with a message. Motion 150–250ms ease-out, none under
`prefers-reduced-motion`. Methods: `load(array)`, `goto(i)`, `next()`, `prev()`, `play()`,
`pause()`; properties `steps`, `index`.

### `Course.PosetView(container, opts)`

Knowledge view: a Hasse diagram of a strict partial order on `labels.length` elements.

```js
const pv = new Course.PosetView(el, {
  labels: ['a','b','c','d'],     // node labels (short)
  relations: [[0,2],[1,2]],      // [i, j] means labels[i] ≺ labels[j]
  interactive: true,             // click a node, then another: adds first ≺ second
  showCount: true,               // e(P) and log2 e(P)
  showExtensions: 24,            // list linear extensions when e(P) ≤ this (false to hide)
  truth: null,                   // optional total order (array of indices) to mark the true one
  onAdd: result => {}
});
pv.add(i, j)   // → {status: 'new'|'known'|'implied'|'cycle'|'self', before, after}  (e(P) before/after)
pv.set(relations); pv.reset(); pv.count(); pv.extensions(limit); pv.closure();
```

- Stores the observed relations and their transitive closure; draws covering edges only; smaller
  elements at the bottom; level = length of the longest chain below; nodes are solid black squares
  with white labels; the element(s) of the most recent new relation are red.
- `known`: this exact relation was observed before. `implied`: follows by transitivity
  (message names a chain, e.g. "a ≺ c ≺ d"). Both teach nothing; the view says so.
  `cycle`: rejected with the cycle named. `self`: same node twice.
- Count panel: "e(P) = 5 orderings still possible · log₂ e(P) = 2.32 bits still unknown". e(P) by
  DP over subsets (n ≤ 16). With `showExtensions`, lists the linear extensions as rows of cells.
- Interactive mode has RESET and UNDO buttons and a status line.

### `Course.Plot(container, opts)`

```js
new Course.Plot(el, {
  xLabel: 'n', yLabel: 'comparisons', logY: true,
  series: [
    {label: 'T(n) exact', type: 'line',   data: [[1,0],[2,2],...], tag: 'proof'},
    {label: 'n²',         type: 'dashed', data: [...],             tag: 'reference'},
    {label: 'random inputs', type: 'points', data: [[n, mean]], ranges: [[n, lo, hi]], tag: 'empirical'}
  ]
});
```

Bold black axes, few ticks, gray tick labels with tabular numerals, curves in the order black solid,
black dashed, red solid; points as small black squares with thin gray range bars; direct labels at
line ends where they fit, plus a one-line legend with each series' tag.

## Lesson JS files (UMD)

Ports must be testable under Node and usable in the page:

```js
(function (root) {
  'use strict';
  function bruteForceTrace(a) { /* faithful port; returns steps */ }
  const L01 = { bruteForceTrace /* , checkTasks, ... */ };
  if (typeof module !== 'undefined' && module.exports) module.exports = L01;
  else root.L01 = L01;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { /* wire widgets */ });
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

## Implementation notes (deviations and additions, as built)

- **Proof sketch** callout: use `class="callout sketch"` (also accepted: `proof-sketch`); same red rule and ∎.
- **Feedback marks**: write feedback text without a leading ✓/✗; the theme adds the mark (a leading one is stripped if present).
- **Tags**: a sixth style `t-reference` (gray solid outline) exists for Plot series with `tag: 'reference'`.
- **Legend** (static): `<span class="sw c-kind"></span>Label` repeated, or `<span class="item"><span class="sw c-kind"></span><span>Label</span></span>`.
- **Tables**: `table.tbl` is wrapped in `.tbl-wrap` automatically so it scrolls inside the column on phones.
- **`lines` exercises**: a click on a line answers immediately (no CHECK). Correct line: `data-when="correct"` is used; a wrong line uses `data-when="<n>"` then `"other"`. Any line in `data-answer` counts as correct.
- **`order` exercises**: steps get fixed letters A, B, C… (in source order) that stay with the step while shuffled; feedback refers to "Step C". Source order should be a valid arrangement (false steps anywhere).
- **`custom`**: the checker is resolved from `window` by dotted path; it may return math-bearing HTML.
- **Gate bar text**: "Attempt <checkpoint label> above to continue." Completing the checkpoint later removes the gap. Skipped checkpoints are remembered across reloads (progress key unchanged).
- **Course API additions**: `Course.getProgress(lessonId)` → `{attempted, correct, skipped}`; `Course.tagClass(tag)`; `Course.init()` (runs automatically).
  `Course.codeBlock(target, source)` replaces a `<pre>` (or appends into any other element) and returns `{el, lines, setLine}`.
- **`Course.parseArray` options** also take `allowEmpty`, `allowDuplicates` (false rejects duplicates) and `capReason` (appended to the "at most N" error). Result may include `tooMany: true`.
- **Stepper**: presets take `{label, values}` or `{label, make(rng, n)}` (`n` = current input length capped by `maxN`; the seed is derived from the label plus the click count). User input is parsed as integers unless `integers: false`; duplicates allowed unless `allowDuplicates: false`. An empty custom input is allowed (the trace must cope). Mark kinds: `compare`, `key`, `sorted`, `faded`, `outline`. Region kinds: `sorted` (gray fill), `compare`/`red` (red), anything else black. `step.arrays` rows have no index row. Optional `label` (aria-label) and `placeholder` options. Instance methods also include `preset(i)`.
- **PosetView**: `add()` result also carries `message` (plain text), `chain` (implied) or `cycle` (cycle: first element repeated at the end). Extra methods `relations()`; `extensions()` with no argument lists all. When `showExtensions` is a number and e(P) exceeds it, a note replaces the list. Rows wider than the column shrink uniformly (12 unrelated nodes stay legible but small on a phone).
- **Plot**: `type: 'line'` series are black solid for the first and red solid for later ones; `dashed` is black dashed. Zero/negative values are dropped on a log axis (with a note). `xMin` option. Axis titles keep the case you type.
- **Vendor**: `katex.min.css` still names woff and ttf fallbacks, but only `fonts/*.woff2` are shipped; browsers choose woff2 first so nothing else is requested.
- **Options** (`mcq`, `multi`): the option's content is wrapped in `span.opt-body` automatically, so inline code and math stay inline. Inline `code` inside black blocks (correct option, correct feedback) is drawn as a white chip.
- **Stepper / parseArray**: `duplicateReason` replaces the generic "must be distinct" message.
- **Order symbols**: ≺ ≻ ≼ ≽ ⊀ ⊁ ∼ ∥ ⪯ ⪰ typed as plain text are drawn from KaTeX_Main (font family "Order Symbols", by unicode-range), because Inter Tight's fallback ≺ looks like "<". Write them as plain characters or as TeX; both match.
- **blockquote**: a key statement set apart, with the heavy left rule and semibold text.
