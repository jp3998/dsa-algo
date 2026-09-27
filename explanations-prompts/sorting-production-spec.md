# Production Spec

How a lesson page is built. Companion documents: `sorting-voice-and-pedagogy.md` (how to write),
`sorting-curriculum.md` (what to write, in what order).

**Status:** covers everything built so far (lessons 00–06). The step-through player for animated
algorithm traces is specified in the phase that first needs it (Part II), not speculatively.

---

## 1. Hard constraints

- **Fully offline.** No network request at runtime, ever. No CDN, no Google Fonts, no analytics. A
  lesson opened by double-clicking the file with the machine in airplane mode must render perfectly.
- **No build step.** Plain static files. No bundler, no transpiler, no `npm run` anything. Open the
  `.html` and it works.
- **Light theme only.** By request. No dark-mode variants.
- **Responsive to 400px.** Must not scroll horizontally at phone width.
- **Prints sanely.** Players and nav hide; figures and prose survive.

---

## 2. File layout

```
lessons/sorting-claude/
  index.html                    series map — parts, lessons, the through-line
  NN-slug.html                  one file per lesson (00-what-order-is.html, …)
  assets/
    css/lesson.css              design tokens + all layout and typography
    css/lab.css                 interactive figures: cards, cells, readouts, matrices, sliders
    js/lesson.js                nav, collapsibles, KaTeX auto-render, sidenotes
    js/diagram.js               SVG drawing helpers (boxes, arrows, text, bands)
    js/lab.js                   interactive components: CellRow, Readout, Matrix, controls, legend
    js/viz-core.js              step-through player for algorithm traces (from Part II)
    js/lessons/NN-slug.js       per-lesson figures only
    vendor/katex/               katex.min.css, katex.min.js, contrib/auto-render.min.js, fonts/*.woff2
  tools/lint-lesson.py          mechanical pre-ship checks
```

Run `python3 tools/lint-lesson.py` before shipping any lesson. It checks banned phrases, the required
skeleton, the concept-ledger gate, offline-only assets, sidenote balance, figure references and
captions, exercise counts, and straight quotes. It has caught real ordering bugs — do not skip it.

Naming: zero-padded number, hyphen, short slug, lowercase. The number is the lesson's ledger position
and never changes once published; inserting a lesson later means appending a letter (`07a-…`) rather
than renumbering, because renumbering silently breaks every ledger check.

---

## 3. Design tokens

All in `:root` in `lesson.css`. Nothing in the series may hard-code a color.

### Ground and ink

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FDFCF9` | page ground — warm off-white, never `#fff` |
| `--paper-sunk` | `#F6F4EE` | code blocks, inset panels |
| `--ink` | `#1C1B19` | body text — near-black, never `#000` |
| `--ink-soft` | `#4A4843` | captions, sidenotes, secondary text |
| `--ink-faint` | `#8A867C` | labels, figure numbers, metadata |
| `--rule` | `#DDD8CB` | hairlines |

### The three meanings

Learned once, used identically in every figure and every player for the whole series. This consistency
is the point — a reader must never have to re-learn what a color means.

| Token | Value | Meaning |
|---|---|---|
| `--active` | `#B4553C` | under consideration right now — being compared, being asked about |
| `--settled` | `#3E6B54` | known and final — will not change again |
| `--discarded` | `#9A96A8` | ruled out — eliminated from consideration |

One neutral accent for links and interactive chrome: `--accent: #2E5C8A`.

### Type

```css
--serif: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
--mono:  "SF Mono", "JetBrains Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
--sans:  system-ui, -apple-system, "Segoe UI", sans-serif;   /* UI chrome only, never body */
```

Body is serif. Measure ~68ch. Generous leading (`1.7`). Base size `19px`, scaling down at narrow
widths.

### Space

A single scale: `--s1: 0.25rem` through `--s8: 6rem`. No arbitrary pixel values in layout.

---

## 4. Page structure

Three-column grid at wide viewports: a narrow left gutter for section numbers, the main measure, and a
right margin for sidenotes. Below `1100px` the sidenote column collapses and sidenotes become inline
expandable notes. Below `700px` the section-number gutter collapses too.

Figures may break out of the measure into the sidenote column (`.figure--wide`) when a diagram needs
the room.

---

## 5. Required lesson skeleton

Every lesson `.html` has exactly this spine. Deviating breaks the continuity contract.

```html
<article class="lesson">
  <header class="lesson-head">
    <p class="lesson-part">Part I · Order and Information</p>
    <p class="lesson-number">Lesson 00</p>
    <h1>What order is</h1>
  </header>

  <section class="where-we-are">
    <h2>Where we are</h2>
    <!-- 2-4 sentences: what we established, what it left unresolved,
         why this lesson is the next step. -->
  </section>

  <section class="lesson-body">
    <section id="s1"><h2><span class="sec-num">1</span> …</h2> … </section>
    <section id="s2"><h2><span class="sec-num">2</span> …</h2> … </section>
  </section>

  <section class="mental-model">
    <h2>The idea in one line</h2>
    <!-- The model, not a summary of facts. One or two sentences. -->
  </section>

  <section class="check-yourself">
    <h2>Check yourself</h2>
    <details class="q"><summary>…question…</summary> …fully worked answer… </details>
  </section>

  <section class="still-unanswered">
    <h2>What's still unanswered</h2>
    <!-- The specific dissatisfaction that makes the next lesson necessary. -->
  </section>

  <nav class="lesson-nav"> … prev / index / next … </nav>
</article>
```

`<head>` loads, in order: `assets/vendor/katex/katex.min.css`, `assets/css/lesson.css`. Scripts go at
the end of `<body>`, deferred: katex, auto-render, `lesson.js`, then any per-lesson JS.

---

## 6. Content components

### Sidenote

Both elements go **inside the paragraph**, and both are `<span>`s. The note is floated into the right
margin, and a floated element cannot be a direct grid child — so `<aside>` as a sibling of the
paragraph would drop below it instead of sitting beside it.

```html
<p>… prose <span class="sidenote-ref" tabindex="0"></span><span class="sidenote">Text of
the aside.</span> continues …</p>
```

`lesson.js` numbers refs and notes automatically in document order. At wide viewports the note floats
into the margin beside its line; below `1100px` it hides and the ref becomes a tap-to-expand inline
note. Asides, caveats and historical remarks live here so the main line never breaks stride.

### Figure

```html
<figure class="figure" id="fig-1-2">
  <div class="figure-art"> …inline SVG or a mount point for JS… </div>
  <figcaption>
    <span class="figure-label">Figure 1.2</span>
    What to look for, stated explicitly.
  </figcaption>
</figure>
```

Numbering is `<lesson section>.<figure within section>`, assigned by hand in the `id` and label.
**Every figure must make a specific claim visible, and the caption must say what to look for.** A
figure the prose never references by number gets cut.

### Callout blocks

Distinguished by a left rule and a small-caps label — never by background fill.

```html
<div class="block block--definition"><p class="block-label">Definition</p> … </div>
```

Variants: `definition`, `claim`, `proof`, `warning` (for "what this does not say"), `aside`.

### Math

KaTeX, auto-rendered. `$…$` inline, `$$…$$` display. Delimiters configured in `lesson.js`. Because
auto-render walks text nodes, **never put a literal `$` in prose** unless it is math.

### Code

```html
<pre class="code"><code class="lang-python"> … </code></pre>
```

No syntax-highlighting library — it is one more dependency for little gain at this scale. Emphasis
inside code, where needed, via a `<b class="code-hi">` span.

---

## 7. Visualizations

### The default: a lab, not an illustration

**A figure the reader cannot operate is the exception, not the rule.** Every figure in Part I is a
*lab*: the reader manipulates something and a live readout says what their change did to the
conditions under discussion. A static diagram is acceptable only where the thing being shown genuinely
does not vary (the three facts of a cyclic relation, a pair of fixed constraints), and then it sits
*inside* a lab as context for the part that does move.

The lab card, in order:

1. `.lab-title` — `Figure N.N` plus a short name.
2. One or more `.lab-stage` panels — the thing being operated.
3. `.lab-controls` — buttons, plus a live counter on the right.
4. `.lab-readout` — a table of conditions, each with a pass/fail/neutral tag and a sentence saying
   **why**, naming the specific index or item responsible. The readout is the teaching; a tag with no
   explanation is wasted.
5. `figcaption` — what to look for, and what to try.

`lab.js` supplies the pieces: `CellRow` (clickable, reorderable, FLIP-animated), `Readout`, `Matrix`
(pair-knowledge grid), `controls`, `legend`. `diagram.js` supplies SVG primitives for the parts that
have to be drawn — trees, arrows between rows, charts. Both read colour from the CSS tokens via
`getComputedStyle`; zero hard-coded palette in JS.

**Interaction consistency matters more than cleverness.** Click-one-then-another-to-swap is used in
six different labs across Part I. The reader learns the control once and can then attend to what
differs.

### From Part II: the step-through player

`viz-core.js`, specified when built. Sketch of the contract so Part I's CSS can reserve for it:
a trace recorder emitting `compare` / `swap` / `write` / `pointer` / `region` / `note`; a player with
play, pause, step, step-back, scrub, speed and reset; an array view with highlight states and an
invariant-band overlay; live comparison/swap/write counters.

### Rules for all visualizations

- SVG, not canvas — inspectable, scalable, styleable from CSS, and printable.
- Must degrade: with JS disabled, a figure mount shows a static fallback or is hidden, never a broken
  empty box.
- Honour `prefers-reduced-motion`: no autoplay, no transitions; players default to step mode.
- Keyboard operable: every control reachable by tab, arrow keys step.
- Text in figures uses the same serif at a readable size — no 9px labels.

---

## 8. Accessibility

- Heading hierarchy is real and unskipped (`h1` once, then `h2`, then `h3`).
- Every `<details>` summary reads as a question on its own.
- Color is never the only channel. The three meanings are always also carried by a label, a border
  style, or a position.
- Contrast: body text ≥ 7:1 against paper; all figure text ≥ 4.5:1.
- `<html lang="en">`, sensible `<title>` of the form `Lesson 00 · What order is`.

---

## 9. Per-lesson build checklist

- [ ] Skeleton sections all present and in order.
- [ ] `<head>` loads only vendored assets; no absolute URLs anywhere in the file.
- [ ] Opened with network disabled: renders perfectly, no console errors.
- [ ] Every figure referenced by number from the prose; every caption says what to look for.
- [ ] Checked at 400px, 768px, and wide. No horizontal scroll. Sidenotes collapse cleanly.
- [ ] `prefers-reduced-motion` honoured.
- [ ] Tab through the page: every interactive element reachable and visibly focused.
- [ ] Print preview is readable.
- [ ] Prev/next/index links resolve; `index.html` updated.
- [ ] Voice-doc pre-ship checklist also run.
