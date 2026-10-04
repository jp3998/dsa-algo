# Course plan: Order and Sorting from First Principles

Working file (§9.2 of the authoring prompt). Read this and `ledger.md` before writing any lesson.

Algorithm names appear **only** in the last column of the overview table and in the final
section ("Spoilers"). Lesson titles, descriptions and the index page never name an algorithm.

Lesson files: `lesson-NN.html` + `lesson-NN.js` (pure Python ports and widget wiring), shared
`assets/course.css` and `assets/course.js`. Verification scripts live in `verify/`.
Every lesson also has a Markdown edition, `markdown/lessonN.md`, generated from the page with
`python3 verify/to_markdown.py lesson-NN.html markdown/lessonN.md` (regenerate after every edit to the page;
figures drawn by code need a static rendering added to FIGURES in that script).

---

## Authoring standards (user feedback, binding for every lesson)

### ★★ RULE ZERO (highest weight; check this before anything else)

**The reader understands every sentence on the first read, can picture it on one of the running examples, and always knows why it is there.** The user learns from these pages alone and has flagged the same six failures again and again in lessons 1–4, even after earlier fixes. They recur for one reason: the writer already knows the idea and writes it in its most compact correct form. The reader is meeting it for the first time. Write for that reader, every sentence, including reveals, feedback, hints and worked solutions.

| # | Failure | Flagged example | What to write instead |
|---|---|---|---|
| F1 | **Author's agenda instead of the reader's question.** A section or paragraph opens on what the author plans to cover. | §01 ended "But first we need to see clearly what a rule actually is"; §02 opened "So what is a rule?" | Open on the question the reader is already holding after the previous paragraph (a puzzle, a failure, a surprising count). See THE NARRATIVE RULE. |
| F2 | **Abstract or negated phrasing where a picture is possible.** Relations stated as double comparisons or negations ("no later … than an earlier …", "an item that nothing has to come before"). | "In Dee, Ben, Ana, Cy, no later person is younger than an earlier one, so the row is sorted." | Show it: "Read the ages from left to right: 22, 25, 30, 30. They never go down, so no pair is the wrong way round." Use names and numbers from the running examples; state the general version afterwards, in one short sentence. Formal phrasing ("\(x_j \prec x_i\) for some \(i < j\)") belongs in callouts only. |
| F3 | **A new idea whose difference from the old one never comes out.** A shortcut, a repaired test, a second method or a new definition is introduced in passing, and the reader can't say what changed. | "It's tempting to cut corners. Why not look only at neighbours, and demand that each item come before the next one? Let's try that shortcut on (B)." (The reader could not tell what was being proposed or how it differed from the full check.) | Name both things ("the full check", "the neighbour shortcut") and use those names consistently. Put them side by side on the same concrete example: which pairs each one looks at, what question each one asks about a pair, and what verdict each gives. Then state the difference in one sentence. If two things change at once, say so and separate them. |
| F4 | **Forcing instead of showing.** A conclusion is pushed through with logic words instead of reached through an example. | "So the only sensible meaning of 'the row follows the rule' is this: …" | Work a small example (a right row, then a wrong row) and let the reader see the conclusion; then name it. No "the only sensible", "it must be", "clearly", "obviously". |
| F5 | **Dense sentences.** Several ideas in one sentence, chains of clauses, noun stacks, pronouns pointing far back. | "To find an item that nothing has to come before, you just ask the rule about that item and each of the others, one pair at a time. So that procedure uses nothing but verdicts on pairs." | One idea per sentence, concrete first: "To see that Dee could go first, we asked the rule about Dee and Ben, then Dee and Ana, then Dee and Cy." See PLAIN LANGUAGE. |
| F6 | **A tool before its purpose.** A definition or property is introduced first, and only later (often inside a proof) does the reader see what problem it solves, so the chain of reasoning feels arbitrary. | §03 went "cycles are the enemy" → "look at the rows themselves" → irreflexive and transitive → definition, and only then did a proof show that these two properties rule out cycles. The user: "hard to understand … chain of reasoning to 2 properties". | Let the problem produce the tool. Try the failing case concretely and watch why it fails: put (D)'s cycle in a row; "before" carries over, so rock before scissors before paper gives rock before paper, and with paper before rock, rock before rock; nothing stands before itself. *Then* name the two facts that did the work and ask the rule to obey them, and say in one sentence why that kills every cycle, before the formal definition and proof. |

**Five questions for every paragraph** (ask them in this order; any "no" means rewrite):
1. What question is the reader holding right now, and does this paragraph's first sentence pick it up? (F1)
2. Can I point to the running example that shows what each sentence says? (F2, F4)
3. If this paragraph introduces anything new (a test, a shortcut, a method, a definition, a variant), can the reader say in one sentence how it differs from what they already had, and have they seen both on the same example? (F3)
4. If this paragraph introduces a definition, property or tool, has the reader already seen the problem it solves, on an example, so that the tool feels forced by that problem? (F6)
5. Would I say each sentence this way to a student sitting across the table, and would they follow it on first hearing? (F5)

A lesson is not ready until every paragraph passes all five. When revising, fix the pattern everywhere in the lesson, not just the sentence that was pointed out.

### ★ THE NARRATIVE RULE: one continuous story (details for RULE ZERO F1, F4)

A lesson is one story told by a tutor, not a stack of sections. Every paragraph is there because the paragraph before it made the reader want it, and it is said the way a friend would say it at a whiteboard. If a reader feels a jump, a restart, or a sentence that pushes them to a conclusion, the lesson has failed, however correct it is.

1. **Every opening picks up a question the reader already has.** Before writing the first sentence of a section or paragraph, name the question the reader is holding after the one before: a puzzle, a failure, a surprising count, something they noticed in the running examples. The opening takes that up. If you can't name one, the gap is in the previous ending: fix that, not just the opening.
2. **No agenda openings.** Never open on what the author plans to cover: "So what is a rule?", "Next: …", "Now let's look at X", "Here are the results as code", "We're almost ready to…". A question in an opening is allowed only if the reader would ask it themselves at that moment.
3. **No bolted-on teasers.** Never set up the next section with a one-line promise at the end of this one ("But first we need to see what X is"). The end of section N and the start of N+1 are written together, as one passage.
4. **No jumping back.** If a section ends on a figure, exercise or side topic, bring the reader back to the open question before the next section begins, so the next section never has to reach back several paragraphs.
5. **No restarts.** When something was already shown, build on it ("that's exactly what §01's procedure did") instead of explaining it again as if it were new.
6. **No needs without reasons.** Never write "we first need X" unless the reader can already feel why: show the moment where not having X gets in the way.
7. **Plain words; let the reader arrive, don't force them.** Every sentence follows the PLAIN LANGUAGE rules below. Reach a conclusion by working a small example the reader can follow, so they see it for themselves; never push it through with "the only sensible meaning is", "so it must be", "clearly".

**Failure and fix, from lesson 1 (seams).** Before: §01 ended "…But first we need to see clearly what a rule actually is." and §02 opened "So what is a rule?". Nothing in §01 had made the reader unsure what a rule is: it was the author's plan dressed up as a question. Fix: §01's walkthrough had already shown that every "which item can go first?" was settled by looking at two items, and that (D) answers every pair question clearly yet has no answer at all. §01 now ends on that puzzle, and §02 opens by taking it up.

**Failure and fix, from lesson 1 (forcing).** Before: "The rule has a verdict on each of those six pairs, and there is nothing else in the row for it to have a verdict on. So the only sensible meaning of 'the row follows the rule' is this: every pair in the row is ordered the way the rule allows." Fix: take a row we know is right (Dee, Ben, Ana, Cy) and ask the rule about it two people at a time; every pair is fine. Then take a wrong row (Ben, Dee, Ana, Cy) and watch one bad pair spoil it. The meaning of "follows the rule" comes out of the example instead of being argued into place.

### ★ PLAIN LANGUAGE: how every sentence is written (details for RULE ZERO F2, F3, F5)

The reader should understand each sentence the first time they read it, without going back. Correct but dense prose is a failure. These rules apply to all prose, captions, predict reveals, feedback, hints and worked solutions. Formal callouts (definitions, theorems) may stay formal, but the read-back after each one must be plain.

1. **Concrete first, general second.** When a running example fits, use its names: Dee, Ben, rock, task d, the row 7, 2, 9, 4. Do the concrete case, then state the general version in one short sentence ("Every step went like that, one pair at a time"). Never give only the abstract version ("an item", "that item", "each of the others") when a concrete one is available.
2. **One idea per sentence.** Split any sentence that carries two ideas, or that needs a comma-separated chain of clauses to finish. A sentence over about 25 words is a warning sign: split it unless it is a simple list.
3. **Verbs, not noun stacks.** Say what someone does: "we asked the rule about Dee and Ben". Avoid nouny phrases: "verdicts on pairs", "pair-by-pair content", "the procedure uses nothing but…", "the requirement structure". A course term (relation, minimal, out-of-order pair…) appears only after it has been introduced, and only where it helps.
4. **Say it positively; avoid stacked negations.** "Nobody had to come before Dee" is fine once. "An item that nothing has to come before" or "no item placed later is ever required before an earlier one" makes the reader untangle negatives: say it positively, or show it on an example.
5. **No riddles in the grammar.** Avoid clauses that end on a dangling preposition ("an item that nothing has to come before"), pronouns whose referent is two sentences back, and "this/that/it" standing for a whole idea. Repeat the noun instead.
6. **Summaries in the reader's words.** End a step with what the reader now knows, in everyday words ("So §01's way of building a row only ever asks the rule about two items at a time"), not an abstract restatement ("So that procedure uses nothing but verdicts on pairs").
7. **No forcing words.** Don't use "the only sensible meaning", "it must be", "necessarily", "clearly", "obviously", "it is easy to see", "there is nothing else for it to…". If the example is clear, the reader doesn't need to be told so; if it isn't, fix the example.
8. **Comparisons as pictures.** When a sentence compares items ("younger", "before", "smaller", "required first"), prefer what the reader would see: the ages read left to right, the arrow from one task to another, the two numbers side by side. Avoid "no later X is Y-er than an earlier one" and similar double comparisons.
9. **New things side by side.** Whenever something new is offered as an alternative to something the reader already has, show both on the same example and say in one sentence what changed (RULE ZERO, F3).
10. **The read-aloud test.** Read each paragraph as if saying it to a student across a table. If you would stumble, pause to work out a clause, or reach for a simpler way to say it, write that simpler way.

**Before → after (from lesson 1 §02).**

| Hard | Plain |
|---|---|
| "To find an item that nothing has to come before, you just ask the rule about that item and each of the others, one pair at a time. So that procedure uses nothing but verdicts on pairs." | "To see that Dee could go first, we asked the rule about Dee and Ben, then Dee and Ana, then Dee and Cy, and found that nobody had to come before Dee. Every step went like that, one pair at a time. So §01's way of building a row only ever asks the rule about two items at a time." |
| "The rule has a verdict on each of those six pairs, and there is nothing else in the row for it to have a verdict on. So the only sensible meaning of 'the row follows the rule' is this: every pair in the row is ordered the way the rule allows." | "Let's try it on a row we already know is right: Dee, Ben, Ana, Cy… That's every pair in the row, six of them, and the rule is happy with each one. Now a row that's wrong: Ben, Dee, Ana, Cy. Ask about Ben and Dee, and the rule objects… That one pair is enough to make the row wrong." |
| "Since the items themselves played no part in §01, this pair-by-pair content is all there is to a request, and it deserves a name." | "Everything we did in §01 came down to these verdicts, so let's give this part of a request a name." |
| "Let's try it on (B). In Dee, Ben, Ana, Cy, no later person is younger than an earlier one, so the row is sorted." | "Let's try the definition on (B). Read the ages of Dee, Ben, Ana, Cy from left to right: 22, 25, 30, 30. They never go down, so no pair is the wrong way round, and the row is sorted." |
| "It's tempting to cut corners. Why not look only at neighbours, and demand that each item come before the next one? Let's try that shortcut on (B)." | Name the two checks and show both on Dee, Ben, Ana, Cy: the full check looks at all six pairs and asks of each "is it the wrong way round?"; the neighbour shortcut looks only at the three side-by-side pairs and asks of each "is the left one younger?". Then say what changed: fewer pairs, and a stricter question. |

### Check before delivery (RULE ZERO and both ★ sections)

Read every section boundary as one passage (last two paragraphs of N plus first two of N+1; Where we are → §01; last section → exercises and bridge), and every paragraph-to-paragraph step, asking: what question is the reader holding here, and does the next sentence pick it up? Then apply the PLAIN LANGUAGE read-aloud test to every paragraph, including reveals, feedback, hints and worked solutions.

### Further standards

0. **Voice and reasoning (second only to THE NARRATIVE RULE).** Everything the reader reads (prose, captions, reveals, feedback, hints, worked solutions) is written as a tutor talking the reader through it: conversational, narrative, "we" and "you", asking the questions the reader would ask, honest about what has and has not been shown yet.
   - **Never open cold.** No section or paragraph starts with a bare instruction or claim ("Start with the smallest case", "A relation is …"). First say what we are trying to find out, and why the next move helps answer it.
   - **Seams and plain words:** see THE NARRATIVE RULE above.
   - **Convince, don't assert.** Every claim that matters is reached by a visible chain of reasoning the reader can follow and check, built up from the simplest case, with a concrete instance at each step. Wherever a reader could ask "why?" or "how does that follow?", the answer is in the text before moving on.
   - *Worked example of the standard* (lesson 1 §02). Not "a rule for pairs decides whole rows", but: what each request actually says (verdicts on pairs only) → check a known-good row pair by pair, then a wrong one, to see what "a row follows the rule" means (no pair is the wrong way round) → how you would *build* such a row from pair verdicts alone (repeatedly pick an item nothing must precede) → try it (works for A–C, stuck on D) → why it can fail (in a row "before" carries over, so the verdicts must fit together) → the real answer (pair verdicts determine a whole order exactly when they fit together), which sets the agenda for the rest of the lesson.
   - Formal definitions, theorems and proofs stay crisp inside their callouts; the prose leading into and out of each one is conversational and says why it is needed and what it means.
   - The bar is a correct and complete argument, not a shorter one: write more rather than skip a step.

1. **No definition, lemma or theorem appears cold.** Before each one, in this order:
   - the question it answers, raised by something the reader has just seen (a running example, a failed attempt, a puzzling count);
   - the idea in plain words, with a concrete instance from the running examples (e.g. "write the rule as the list of its 'yes' pairs" before "a relation is a set of ordered pairs");
   - only then the formal statement, followed by a read-back that connects it to the instance.
2. **Explain every name.** Say why a term is called what it is when the name carries meaning (linear extension, lexicographic, equivalence relation, tier, certificate…). Define every term before use, even "standard" ones.
3. **Show the obvious version failing** when the right definition differs from the one a reader would guess (e.g. "each item before the next" gives zero valid orders for ages with a tie, which is why "sorted" means "no pair out of order").
4. **Explain every answer, case by case.** Every predict-first reveal and every exercise solution says *why* each answer is what it is, simply, for each case asked about. Prefer one reusable question that explains all cases (e.g. "which items can go first?" explains 1 / 2 / 5 / 0 orders). Feedback that only restates the answer is not enough. (Retrofit of lessons 1–4 still pending: user asked to hold it for now.)
5. **No logical leaps.** Every step must follow visibly from the one before. Start from the simplest case and show how it grows into the general one (e.g. ordering two items is easy → a row is many pairs at once → the pairs are not independent, which is where the difficulty lies). Never assert what is proved later: say what has been shown so far, and name the question still open. A result used in a proof must be stated in the text, not only in a checkpoint question.
6. **Read as one text.** Revisions rewrite whole paragraphs so the lesson reads continuously; never insert patches that the surrounding prose does not lead into. Writing more is better than leaving a step out.
7. **Review pass before delivery:** read the lesson's prose end to end as plain text (exercises removed), then read every reveal, feedback, hint and worked solution against PLAIN LANGUAGE. For every callout and new term, check items 1–3 against the two paragraphs before it; for every step, ask "why does this follow?" and check item 5. Then read every section boundary (last two paragraphs of N, first two of N+1, and Where we are → §01, last section → bridge) as one passage and check it against THE NARRATIVE RULE.

---

## Overview

| # | Title (the question) | Opens with | Hands on | Lenses | Algorithms (spoiler) |
|---|---|---|---|---|---|
| 1 | What does it mean for things to be in order? | What property must the output of "put these in order" have? | A program only ever asks about one pair at a time. What must its answers satisfy? | — | — |
| 2 | What must a comparison promise? | What must the code behind "is a before b?" satisfy? | With a trustworthy comparison, what exactly is the task, and what may an algorithm do? | — | (Python `key=`, `cmp_to_key`) |
| 3 | What exactly is the sorting problem, and what may an algorithm do? | Specify the task and the allowed operations. | What is the simplest certainly-correct algorithm, and what does it cost? | (machine, teased) | — |
| 4 | What is the simplest certainly-correct way to sort, and what does it waste? | Simplest correct algorithm; its cost. | Asking every pair is n(n−1)/2, but 3 answers proved 4 sorted elements. How many comparisons are truly needed, even for the smallest questions? | knowledge | brute-force permutation sort; comparison counting (rank placement) |
| 5 | How many comparisons does it take to check order, or to find the smallest? | Smallest questions: is it sorted? which is smallest? | Can one set of comparisons answer two questions at once? | certificate | linear scan for min; sortedness check |
| 6 | Can one set of comparisons answer two questions at once? | Min and max together; the runner-up. | Sorting is repeated "find the smallest of what remains". What does that cost, and what does it forget? | certificate, knowledge | pairwise min-max; tournament for second smallest |
| 7 | What does sorting by repeated "find the smallest" cost, and what does it forget? | Repeated selection. | Can we instead measure disorder and repair it locally? | knowledge, (movement hint) | selection sort |
| 8 | How can we measure disorder, and what does one local repair buy? | A measure of disorder; adjacent repair. | Can we keep a sorted prefix and grow it, paying only for the disorder present? | movement (seeded) | bubble sort, early exit, cocktail shaker sort |
| 9 | What if we grow a sorted prefix one element at a time? | Grow a sorted prefix. | How disordered is a typical input? | knowledge, movement | insertion sort |
| 10 | How disordered is a typical input? | Expected disorder of a random arrangement. | Can any method that only swaps neighbours escape n² moves? | distribution | — |
| 11 | Can any neighbour-swapping method escape quadratic cost? | Lower bound for a class of algorithms. | Could we at least find each element's place with fewer comparisons? | movement (introduced) | bubble/insertion/selection contrasted |
| 12 | Can we find each element's place with fewer comparisons? | Halving search inside the growing prefix. | Comparisons fell, moves did not. What does rearranging cost under other moves? | knowledge vs movement | binary search; binary insertion sort |
| 13 | What does rearranging cost when any two elements may trade places? | Arbitrary swaps; cycle structure. | What if the only move is flipping a prefix? | movement | cycle decomposition, min swaps, cycle sort, cyclic placement, first missing positive |
| 14 | What if the only allowed move is flipping a prefix? | Prefix reversals; the geometry of move sets. | Moving is cheap; knowing is hard. Is there a floor on comparisons? | movement | pancake sorting |
| 15 | Is there a floor on the number of comparisons? | Decision trees and adversaries. | How large is log₂ n!, and how close have we come? | knowledge (formal), information | — |
| 16 | How large is log₂ n!, and how close have we come? | Bounding n!; auditing bits per comparison. | Can we get near-optimal comparisons and cheap movement at once? Start inside the prefix-growing method. | information, certificate | merge-insertion (awareness) |
| 17 | Can the prefix-growing method take long steps? | Long moves inside insertion. | Rather than repair, can we divide the array and combine? | movement, empirical | Shell sort |
| 18 | What if we split by position and combine sorted halves? | Combining two sorted lists; recursion. | What else does combining give us, and what does it cost in space? | knowledge, information | merging; top-down merge sort |
| 19 | What else does combining give us, and what does it cost? | Bottom-up, stability, inversions, a merging lower bound. | What if the data does not fit in memory? | certificate returns | bottom-up merge sort; inversion counting |
| 20 | What if the data does not fit in memory? | A two-level memory. | With an n log n guarantee in hand: what does sorted order make cheap? | machine (I/O) | external merge sort |
| 21 | What does sorted order make cheap? | Sort-then-scan patterns and exchange arguments. | Splitting by position puts all the work into combining. What if the work happened while splitting? | — | interval merging, meeting rooms, sweep line, two pointers, coordinate compression |
| 22 | What if we split by value instead of position? | Partitioning around a pivot. | Can partitioning be done with fewer moves, and why is it so easy to get wrong? | knowledge | Lomuto partition; quicksort |
| 23 | Can partitioning use fewer moves, and why is it so easy to get wrong? | A second partition scheme and its subtle invariant. | What does value-splitting cost on typical inputs, and with random pivots? | — | Hoare partition |
| 24 | What does splitting by value cost on typical inputs, and with random pivots? | Average vs expected; indicator variables. | What breaks it in practice? | distribution, randomness | randomized quicksort; tree sort correspondence |
| 25 | What breaks value-splitting in practice? | Recursion depth, duplicates, adversarial inputs. | How much order do we need to find the k-th smallest? | machine | three-way partition (Dutch national flag), sort colors, introsort |
| 26 | How much order do we need to find the k-th smallest? | Selection without sorting. | What if repeated selection kept what it learned? | knowledge, certificate | quickselect; median of medians; partial sort |
| 27 | What if repeated selection kept what it learned? | A partial order cheap to maintain. | What else can that structure do besides sort? | knowledge | tournament tree; binary heap; build-heap; heapsort |
| 28 | What else can a cheaply maintained partial order do? | Repeatedly taking the smallest of a changing collection, in practice. | Three different routes reach n log n. What actually differs? | machine | heapq; k-way merge; top-k; top-k frequent |
| 29 | Three roads to n log n: what actually differs? | Contrast on every dimension; measurements in Python. | Every bound so far assumed keys are opaque. What if they are not? | machine | merge sort vs quicksort vs heapsort; introsort, pdqsort (awareness) |
| 30 | What if we may look inside the keys? | Keys as indices. | How do we handle long keys one digit at a time? | representation (introduced) | counting sort |
| 31 | How do we sort long keys one digit at a time? | Digit passes; why stability is required. | What if we know how the keys are distributed? | representation | LSD radix sort; MSD radix sort (strings) |
| 32 | What if we know how the keys are distributed? | Distribution assumptions; the "linear-time" label. | The floor log₂ n! assumed every arrangement possible. What if inputs are not arbitrary? | distribution | bucket sort; maximum gap; top-k frequent via buckets |
| 33 | What is the floor when inputs are not arbitrary? | Duplicates and presortedness refine the information bound. | How does Python itself exploit this? | information (refined) | natural merge sort; three-way quicksort revisited |
| 34 | How does Python itself sort? | Order already present in the data, and a bug found by formal verification. | What if only some pairs must be ordered? | machine, information | Timsort / Powersort |
| 35 | What if only some pairs must be ordered? | Sorting under a partial order. | How long can a chain be, and how few antichains cover everything? | knowledge | topological sort (Kahn, DFS) |
| 36 | How long can an increasing subsequence be? | Chains, antichains, piles. | What changes beyond one processor and flat memory? | knowledge | patience sorting; LIS in O(n log n) |
| 37 | What changes beyond one processor and flat memory? | Oblivious comparisons; parallel depth; caches. | Assemble the whole map. | machine | sorting networks; 0-1 principle; bitonic sort (awareness) |
| 38 | What is the whole map? | Synthesis. | — | all | reference index |

---

## Shared components (build once, in `assets/`)

1. **Theme** (`course.css`): §7.7 Swiss grid; all tokens as custom properties.
2. **Page behaviours** (`course.js`): KaTeX render (and re-render for inserted nodes), Python code blocks
   (highlighting, line numbers, copy), callouts, epistemic tags, "going deeper" / "common question"
   panels, predict-first blocks, checkpoints with soft gates, prerequisite checks, progress in
   `localStorage` (wrapped in try/catch), seeded RNG.
3. **Exercises**: multiple choice (per-option feedback), multi-select, numeric (feedback per common
   wrong answer), matching/classification, ordering (with distractor steps), custom "build an input"
   and "find the bug" (line picking), staged hints and worked solutions.
4. **Array stepper**: driven by a trace produced by a faithful JS port; synced Python line, variables,
   counters, regions, presets, custom input with caps, keyboard control.
5. **Knowledge view (poset view)**: Hasse diagram, transitive closure, covering edges, e(P) by
   subset DP and log₂ e(P), list of linear extensions for small n, flags implied / repeated
   comparisons, rejects cycles; interactive or driven by a stepper.
6. **Operation-count plot**: SVG, linear or log y, exact curves [proof] vs sampled points with range
   bars [empirical], reference curves, direct labels.
7. Later (built when first needed): decision-tree explorer (L5/L15), permutation-space explorer
   (L11–L14), recursion-tree builder (L18), heap tree+array view (L27), bucket/digit views (L30–L32),
   run/merge-stack view (L33–L34), memory/disk view (L20).

---

## Lessons in detail

### Lesson 1 — What does it mean for things to be in order?

- **Answers:** what property the output of "put these in order" must have.
- **Key observations:** four requests (numbers; people by age; tasks with prerequisites;
  rock–paper–scissors) have exactly one, several, several, and zero valid outputs. The difference
  comes from properties of the relation, not from the items.
- **Ideas:** relation; sorted arrangement = no later element strictly before an earlier one;
  irreflexive + transitive (strict partial order); cycles; Hasse diagrams and covering pairs; linear
  extensions and e(P); totality; ties and strict weak orderings (tiers).
- **Results:** asymmetry follows from the axioms [proof]; a cycle admits no sorted arrangement
  [proof]; every finite strict partial order has a linear extension [proof]; a strict total order has
  exactly one sorted arrangement [proof]; for strict weak orders, checking adjacent pairs suffices
  [proof]; for general partial orders it does not [proof by counterexample]; a weak order with tiers
  n₁,…,n_k has ∏ nᵢ! sorted arrangements [proof].
- **Lenses:** none yet (foundations).
- **Components / exercises:** predict-first on the four requests; poset playground (knowledge view
  in free mode); MCQ on the axioms; numeric e(P) counts; classification of relations; build an
  arrangement that passes the adjacent test but is invalid.
- **Hands on:** a program only ever asks about one pair at a time. What must its answers satisfy,
  and what goes wrong in practice when they don't?

### Lesson 2 — What must a comparison promise?

- **Answers:** what the code behind "is a before b?" must satisfy, in Python.
- **Key observations:** Python's sort only calls `<`; key functions always produce a well-behaved
  order; hand-written comparators can silently break it (tolerance comparisons, NaN, cyclic
  comparators) and Python returns garbage without an error.
- **Ideas:** relations induced by keys are exactly strict weak orderings; lexicographic order and
  tuple keys; `cmp_to_key` and the comparator contract; checking a comparator on a finite sample;
  proving transitivity by finding a hidden key; the first exchange argument.
- **Results:** key-induced ⇔ strict weak ordering [proof]; lexicographic order of total orders is a
  total order [proof]; CPython outputs on broken comparators [empirical]; concatenation comparator
  is induced by the key a/(10^len(a) − 1) [proof]; sorting by it gives the largest number [proof,
  exchange argument].
- **Lenses:** none yet.
- **Components / exercises:** comparator checker (finds a counterexample triple); "what did CPython
  return" lab with embedded real outputs; MCQs on keys; find-the-bug (boolean comparator; tie on
  dicts); ordering problem for the concatenation proof; numeric largest-number.
- **Hands on:** with a trustworthy comparison, what exactly is the task, and what may an algorithm do?

### Lesson 3 — What exactly is the sorting problem, and what may an algorithm do?

- **Answers:** a precise specification and a precise model of computation.
- **Key observations:** sorted data makes later questions cheap (duplicates: n−1 adjacent checks;
  search: about log₂ n halvings); fake "sorts" pass half the specification; an algorithm's cost is
  meaningless until we say which operations it may use; inputs with the same relative order are
  indistinguishable.
- **Ideas:** precondition/postcondition (ordered *and* a permutation); n! candidates; the comparison
  model (opaque keys, one yes/no query, moves counted separately); order types; the distinct-keys
  assumption; logarithm as number of halvings and number of bits; instrumented comparisons.
- **Results:** equal keys are adjacent in sorted order [proof]; n distinct elements have n!
  arrangements [proof]; comparison algorithms behave identically on order-isomorphic inputs [proof];
  CPython's sort uses 999 comparisons on 1000 sorted or reversed items and about 8,640 on random
  ones [empirical].
- **Lenses:** machine lens teased (Python counts), knowledge lens foreshadowed.
- **Components / exercises:** predict-first multi-select on six fake sorts; MCQs on the model;
  predict on order-isomorphic inputs; numeric counts; halving predict.
- **Hands on:** what is the simplest certainly-correct algorithm, and what does it cost?

### Lesson 4 — What is the simplest certainly-correct way to sort, and what does it waste?

- **Answers:** a correct baseline and its exact cost; what it knows versus what it asks.
- **Key observations:** testing all n! candidates works; the check is cheap (fewer than 2
  comparisons per candidate) and the number of candidates is what explodes; the baseline re-asks
  questions whose answers it already has; asking each pair once suffices.
- **Ideas:** worst/best case; counting comparisons by "comparison j happens iff the first j entries
  increase"; knowledge as the transitive closure of observed outcomes; consistent arrangements =
  linear extensions; wasted comparisons; ranking by counting wins.
- **Results:** the baseline is correct [proof]; best case n−1 [proof]; worst case
  T(n) = Σ_{j=1}^{n−1} n!/j! < 2·n! and reverse input attains it [proof]; T(n)/n! → e−1 [proof
  sketch]; knowledge theorem: after any outcomes the possible orders are the linear extensions, and
  any unrelated pair can still go either way [proof]; rank placement uses exactly n(n−1)/2 comparisons
  and needs a tie rule [proof].
- **Lenses:** knowledge lens introduced (informally, with e(P)).
- **Components / exercises:** array stepper synced with the knowledge view; count plot (log scale);
  find the bug ×2; build an input that forces exactly 7 candidates; numeric counts; tie-collision
  build-an-input.
- **Hands on:** asking every pair costs n(n−1)/2, yet 3 answers proved 4 elements sorted. How many
  comparisons are truly needed, starting with the smallest questions?

### Lesson 5 — How many comparisons does it take to check order, or to find the smallest?

- **Answers:** the exact cost of checking sortedness and of finding the minimum.
- **Observations:** information bound says 1 and log₂ n; truth is n−1 for both; a certificate must
  be connected.
- **Ideas:** certificates; adversary arguments; "each comparison makes at most one loser"; outcomes
  of different branches can share answers.
- **Results:** n−1 necessary and sufficient for both [proof]; information bound valid but loose
  [proof]; for sorting, a certificate needs only n−1, so information binds there [proof sketch];
  Python's 999 explained.
- **Lenses:** certificate introduced.
- **Components / exercises:** adversary game in the knowledge view (learner plays algorithm);
  decision-tree explorer n=3; numeric; MCQ on why log₂ n is not achievable.
- **Hands on:** can one set of comparisons answer two questions at once?

### Lesson 6 — Can one set of comparisons answer two questions at once?

- **Answers:** min+max together; second smallest.
- **Observations:** pairing first halves the candidates for each role; the runner-up must have lost
  directly to the winner.
- **Ideas:** element states (untouched / won / lost / both) as units of information; tournaments;
  weight adversary.
- **Results:** ⌈3n/2⌉ − 2 suffices and is necessary [proof]; n + ⌈log₂ n⌉ − 2 suffices and is
  necessary [proof].
- **Lenses:** certificate, knowledge.
- **Components / exercises:** stepper with knowledge view; adversary game; numeric counts.
- **Hands on:** sorting is repeated "find the smallest of what remains". What does that cost, and
  what does it forget?

### Lessons 7–38 (summary; detail is written when each lesson is reached)

- **7.** Repeated selection: exact counts n(n−1)/2 comparisons for every input (non-adaptive), at most
  n−1 swaps; the knowledge view shows it discarding all relations among the rest; long swaps break
  ties → stability defined (what it answers: multi-key sorting). Invariant: sorted prefix of the
  smallest elements. Lenses: knowledge; comparisons vs moves (first hint of movement).
- **8.** Inversions; an adjacent swap of an inverted pair removes exactly one [proof]; bubble passes,
  early exit, cocktail; counts in terms of inversions and passes. Hands on: grow a prefix instead.
- **9.** Insertion: invariant "prefix is a sorted permutation of the original prefix"; comparisons
  between inv and inv + n − 1, moves = inv [proof]; adaptive and online defined.
- **10.** Indicator variables, linearity of expectation; E[inv] = n(n−1)/4 under the uniform
  distribution [proof]; average case vs best/worst; distribution lens introduced.
- **11.** Any adjacent-swap algorithm needs ≥ inv swaps, so Ω(n²) worst and on average [proof]; bound
  on a *class*; movement lens; contrast of the three quadratic algorithms (same Θ, different reasons).
- **12.** Halving search (binary search) with its invariant; binary insertion: comparisons ≤ Σ⌈log₂(i+1)⌉
  ≈ log₂ n! + O(n) [proof], moves still inv [proof]; knowing vs moving separated.
- **13.** Permutation space with any-swap moves: distance n − c [proof]; cycle sort (minimum writes);
  cyclic placement for 1..n; first missing positive.
- **14.** Prefix reversals; bounds for pancake numbers (awareness of exact values); permutation-space
  explorer comparing move sets. Conclusion: with long moves, rearranging is O(n); knowing is the hard part.
- **15.** Decision trees; knowledge theorem revisited formally; adversary keeps the larger half:
  e(P) = e(P+a<b) + e(P+b<a) ⇒ ≥ log₂ n! comparisons in the worst case [proof]; model stated.
- **16.** (n/2)^(n/2) ≤ n! ≤ nⁿ, then Stirling; average leaf depth ≥ log₂ n! [proof]; bits-per-comparison
  audit of every algorithm so far [empirical + proof]; merge-insertion (awareness). Open question:
  near-optimal comparisons *and* cheap moves?
- **17.** h-sorting; h-sorted stays h-sorted after k-sorting [proof]; gap sequences; honest mix of
  proofs (O(n^{3/2}) for Knuth/Hibbard-type gaps), empirical results, open problems.
- **18.** Merge correctness (invariant), merge sort by strong induction; recursion tree; exact worst
  case n⌈log₂ n⌉ − 2^⌈log₂ n⌉ + 1 [proof]; where the log comes from.
- **19.** Bottom-up; Θ(n) extra space; stability; inversion counting as a by-product; merging needs
  2m − 1 in the worst case by adversary vs log₂ C(2m, m) [proof]; certificate lens returns.
- **20.** External sorting: run formation, k-way passes, I/O counts.
- **21.** Sort-then-scan: merging intervals, meeting rooms (sweep line), two pointers, coordinate
  compression; exchange arguments (with L2's largest-number argument revisited).
- **22.** Partition invariant (Lomuto), quicksort by strong induction, worst case on sorted input,
  explained as knowledge (a pivot that teaches little).
- **23.** Hoare partition: subtle invariant; off-by-one variants and where proofs fail.
- **24.** Pr[i and j compared] = 2/(j − i + 1) [proof]; 2n ln n ≈ 1.39 n log₂ n; average case over random
  permutations vs expected case with random pivots: same number, different reasons; tree sort
  compares exactly the same pairs [proof].
- **25.** Python's recursion limit; smaller-side-first gives O(log n) depth [proof]; duplicates and
  three-way partition; sort colors; introsort as the library guard; machine-lens measurements.
- **26.** Quickselect expected linear [proof]; median of medians: groups of 5 work, groups of 3 don't
  [proof]; top-k and partial sorting costs; lower bounds for selection (awareness).
- **27.** Tournament tree → heap; sift-up / sift-down correctness; build-heap Σ h/2^h = O(n) [proof];
  heapsort ("selection that keeps its knowledge").
- **28.** `heapq` (heapify, push/pop, nsmallest, nlargest, merge); k-way merging; top-k; top-k frequent.
- **29.** Merge sort vs quicksort vs heapsort along §6.6; operation counts and Python timings
  [empirical]; hybrids (introsort, pdqsort awareness); machine lens fully introduced.
- **30.** Representation lens; counting sort with prefix sums; stability; Θ(n + k) [proof]; why the
  Ω(n log n) theorem is not contradicted.
- **31.** LSD radix: invariant and why stability is required [proof]; base choice; Θ(d(n + b));
  Python's big integers and "word size"; MSD radix for strings; kinship with quicksort.
- **32.** Bucket sort: expected Θ(n) under a uniform assumption [proof], worst case, wrong
  assumptions; pigeonhole buckets (maximum gap); buckets for top-k frequent; the "linear-time" label
  examined (§5); o(n log n) integer sorting (awareness).
- **33.** log₂(n!/∏nᵢ!) for duplicates [proof]; three-way quicksort near it [proof sketch/empirical];
  presortedness measures, runs, natural merge sort.
- **34.** Timsort / Powersort: runs, minrun, galloping, stability, only `<`; the invariant bug found by
  formal verification; amortized cost if it arises.
- **35.** Topological sort as one linear extension; Kahn and DFS with proofs; cycle detection.
- **36.** Patience sorting; piles = LIS length [proof]; O(n log n) with `bisect`; Dilworth / Mirsky;
  sorting under partial information (Kahn–Saks; 1/3–2/3 conjecture) awareness.
- **37.** Sorting networks, 0-1 principle [proof sketch], bitonic sort, parallel depth, the I/O
  model and caches (awareness).
- **38.** Synthesis: learner builds the classification (§5) interactively; lenses and their scopes;
  reference index; summary table of derived results with labels; exercises on unseen algorithms
  (comb, gnome, stooge, odd-even transposition, library sort).

---

## Spoilers: algorithm names by lesson

| Lesson | Names |
|---|---|
| 4 | permutation (brute-force) sort; comparison counting (Knuth, TAOCP §5.2, Algorithm C) |
| 5 | linear scan; sortedness check |
| 6 | pairwise min–max; tournament method |
| 7 | selection sort |
| 8 | bubble sort; cocktail shaker sort |
| 9 | insertion sort |
| 12 | binary search; binary insertion sort |
| 13 | cycle sort; cyclic placement |
| 14 | pancake sorting |
| 16 | merge-insertion (Ford–Johnson) |
| 17 | Shell sort |
| 18–20 | merge sort (top-down, bottom-up, external) |
| 22–25 | quicksort; Lomuto, Hoare, three-way (Dutch national flag); introsort; tree sort |
| 26 | quickselect; median of medians |
| 27–28 | binary heap; heapsort; priority queue |
| 30–32 | counting sort; LSD/MSD radix sort; bucket sort |
| 33–34 | natural merge sort; Timsort; Powersort |
| 35 | Kahn's algorithm; DFS topological sort |
| 36 | patience sorting |
| 37 | bitonic sort; odd-even merge (awareness) |
