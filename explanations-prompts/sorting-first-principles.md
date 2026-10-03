# Order and Sorting from First Principles: An Interactive Course

## Settings

- **Language:** Python 3 (CPython 3.11 or later) for every code example, implementation and exercise. JavaScript is used only inside the pages, to drive visualizations and exercises.
- **Deliverable:** a static, interactive HTML course: one page per lesson, plus an index page. Using it needs no AI, no server and no backend.
- **Runnable Python in the browser:** off for now. Snippets are displayed, highlighted and copyable. (This can be turned on later with Pyodide, which runs Python in the browser without a backend.)
- **Theme:** "Swiss grid", light only. The full specification is in §7.7.
- **Output location:** `sorting/` in the current project. If the project already has a lesson structure or shared assets, follow its conventions.
- **My background:** comfortable with algebra, logarithms and proof by induction. Introduce everything else (summations, bounds on factorials, Stirling's approximation, probability and expectation, recurrences) when it becomes necessary.
- **Why I'm learning this:** competitive programming and software-engineering interviews. But the main goal is understanding; the practical skills should fall out of it.

---

## 1. Your role

You are the author of an interactive course on **order and sorting**, delivered as static HTML pages, one per lesson. I'll work through the pages on my own. There will be no AI, server or backend while I learn, so everything a good tutor would do in person has to be built into the pages: asking me to attempt the next step, checking my understanding, diagnosing my misconceptions, refusing to move on over a gap.

The course is not a catalogue of sorting algorithms. It is one line of inquiry: what it means to put things in order, what that costs, why it costs that much, and what changes when the assumptions change. The algorithms appear as consequences of that inquiry. They are not its subject.

Each step should feel forced by the step before it:

> We hit this limitation, which raises this question. The question forces us to introduce this idea. The idea lets us build this algorithm. Now we have to prove it works. Then we have to find out what it costs. That reveals another limitation, which leads to the next idea.

That sense of necessity and discovery is the most important property of the course. If you can't say which question a new idea answers, you aren't ready to introduce it.

## 2. Where we are going

By the end I should have a mathematical and algorithmic mental model of sorting, not a set of algorithms and a table of complexities. Concretely, I should be able to:

1. State precisely what an order is, what the sorting problem is, and what an algorithm is and isn't allowed to do (the model of computation).
2. Explain what sorting costs through the lenses of §4: how much the input leaves uncertain, what must be proven, what rearranging costs, what the keys reveal, which inputs occur, and what the machine charges for each operation.
3. Take any sorting algorithm, including one I've never seen, and say what structure it exploits, which assumptions it relies on, what its invariant is, where its cost comes from, which bounds apply to it, and which inputs or assumption changes would break it.
4. Find an invariant myself and turn it into a correctness proof.
5. Derive complexities rather than recall them, including exact counts or leading constants where those are revealing.
6. Explain why an algorithm that seems to "beat" a lower bound doesn't contradict it.
7. Explain why the usual categories of sorting algorithms exist, what each one measures, and what each one hides.
8. Pick an algorithm for a concrete situation and justify the choice from assumptions and costs, not from memory.
9. As a by-product: implement all of it correctly in Python under contest and interview conditions, and avoid the classic pitfalls (inconsistent comparators, off-by-one partitions, unstable passes where stability is needed, recursion limits).

## 3. What must be covered

Everything below must appear, but only at the point where the reasoning needs it. This list is a checklist, not a teaching order; §10 sketches the order.

**Required.** Each of these is built from observations, proved correct, analyzed, implemented in Python, visualized and exercised:

- The brute-force baseline: try permutations until one is sorted.
- Selection sort; bubble sort (with early exit, and the cocktail variant); insertion sort; binary insertion sort.
- Shell sort.
- Merge sort, top-down and bottom-up; merging; counting inversions; external merge sort.
- Quicksort: Lomuto and Hoare partitioning, random pivots, three-way partitioning (Dutch national flag), recursion-depth control; introsort as the way libraries guard against the worst case.
- Tree sort (sorting with a binary search tree) and its exact correspondence with quicksort.
- Quickselect; median of medians.
- Heaps: sift-up, sift-down, build-heap, heapsort, priority queues, k-way merging, top-k.
- Counting sort; radix sort (LSD and MSD, including strings); bucket sort.
- Natural merge sort and Timsort, which is Python's own sort.
- Cycle decomposition of a permutation: minimum swaps to sort, cycle sort, and the "cyclic placement" interview pattern for arrays holding 1..n.
- Pancake sorting.
- Topological sort (Kahn's algorithm and DFS), as sorting under a partial order.
- Patience sorting and the longest increasing subsequence in O(n log n).

**Applications and patterns.** Each of these is woven in where it fits, with an exercise:

- Custom orderings in Python: `key=` functions, tuple (lexicographic) keys, `functools.cmp_to_key`, and what a comparator must satisfy (a strict weak ordering). Include a comparator whose transitivity is not obvious and must be proved, such as the ordering used to form the largest number by concatenation.
- Sort-then-scan problems: merging intervals, meeting rooms, two pointers, sweep lines. Exchange arguments for proving greedy algorithms correct.
- Coordinate compression; k-th element; top-k frequent elements (heap versus buckets); maximum gap via pigeonhole buckets; sort colors; first missing positive.
- Python tools and what each one guarantees: `sorted` and `list.sort` (stability; only `<` is used), `heapq` (`heapify`, `nsmallest`, `nlargest`, `merge`), `bisect`, `collections.Counter`, and the recursion limit.

**Awareness level.** Explain the idea and its place on the map; no full implementation needed:

- merge-insertion (Ford–Johnson); pdqsort;
- sorting networks, the 0-1 principle, bitonic sort; parallel sorting;
- integer sorting in o(n log n) in the word-RAM model;
- the Ω(n log n) bound for element distinctness in algebraic decision trees; lower bounds for selection;
- sorting under partial information.

**Exercises on unseen algorithms**, for the synthesis lesson: comb sort, gnome sort, stooge sort, odd-even transposition sort, library sort, and similar.

## 4. The central thread: knowledge, information, and what else constrains sorting

### 4.1 The primary lens: what the algorithm knows

Make this lens explicit early and sharpen it as the course goes on.

- Assume distinct keys at first. Before any comparison, all n! orderings are possible.
- After some comparisons, the algorithm's knowledge is a **partial order** on the elements: the outcomes it has observed, plus everything that follows from them by transitivity. Nothing more is known. For any two elements the partial order leaves unrelated, both relative orders are still possible. This is a theorem; prove it when you first use it.
- The orderings still possible are exactly the **linear extensions** of that partial order. Write e(P) for their number. Sorting is finished exactly when e(P) = 1, that is, when the partial order has become a total order.
- Comparing two unrelated elements a and b splits the possibilities into two disjoint sets: e(P) = e(P with a < b) + e(P with b < a). An adversary can always answer so that the larger set survives. So after t comparisons at least n!/2ᵗ possibilities remain, which gives the lower bound log₂ n!. The bound is *derived* from the knowledge view, not asserted.
- A comparison is informative to the extent that it splits the possibilities evenly. Comparing two elements whose order is already implied yields nothing; it is a wasted comparison. Throwing away a known relation is wasted knowledge.
- **Invariants are statements about knowledge.** A sorted prefix, a heap, a partition around a pivot and a set of sorted runs are each a particular shape of partial order. Describe every algorithm by the shape of the knowledge it builds and maintains, and draw that shape as a Hasse diagram. Then the correctness proof and the cost analysis are visibly about the same object.
- **Refinement.** When the possible inputs form a smaller class (many equal keys, nearly sorted input, a known distribution), replace n! with the size of that class, or with the entropy of the input distribution for average-case statements. The lens is the same; only the starting set changes.

### 4.2 Where this lens isn't enough

The information bound is a valid lower bound on the number of queries in any model where an operation has a bounded number of outcomes. But it isn't always tight, it says nothing about the cost of acting on what is known, and in some models it stops being the constraint that matters. The course must not pretend otherwise. Use these complementary lenses. Introduce each one at the moment the primary lens visibly fails to explain something.

1. **Certificates and adversaries: what must be proven, not just identified.** The information bound counts how many answers are possible, but an algorithm must also have seen enough to be certain of its answer. Finding the minimum has only n possible answers, so the information bound is log₂ n. Yet n − 1 comparisons are necessary, because every other element must be seen to lose. Checking whether an array is sorted has two possible answers, so the bound is 1. Yet n − 1 comparisons are necessary. For sorting itself, a certificate needs only n − 1 comparisons, so information is what binds. When two lenses disagree, the true cost is at least the larger bound, and the course should explain why they disagree.
2. **Movement: what rearranging costs under the allowed moves.** Treat sorting as a walk through the space of permutations whose steps are the allowed physical operations. With adjacent swaps, the distance to sorted is the number of inversions. With arbitrary swaps it is n minus the number of cycles. With prefix reversals it is the pancake problem. The Ω(n²) barrier for algorithms that only swap neighbors is a movement bound, not an information bound. Binary insertion sort shows the difference concretely: it makes close to the minimum number of comparisons, but still a quadratic number of moves.
3. **Key representation: what the algorithm can see inside a key.** The comparison model treats keys as opaque: all an algorithm can learn is the outcome of a < b. Real keys often have structure, such as bounded integers, digits or characters. Using a key's value as an array index is an operation with k outcomes, and reading one digit has b outcomes. The information bound still holds as a count, but it stops binding: n reads of log₂ k bits each already exceed log₂ n! once k ≥ n. Cost is then governed by the parameters of the keys (range, number of digits, base). This lens is where the so-called linear-time sorts come from, and it explains why "linear" always comes with conditions.
4. **Input distribution: what is known about which inputs occur.** Average-case analysis, adaptive sorting and bucket sort all depend on assumptions about the inputs. Keep two things separate: what is assumed about the inputs (average case), and the randomness the algorithm creates for itself (expected case).
5. **Computation and the machine: what running it actually costs.** The number of queries is not the running time. An algorithm can use nearly optimal comparisons and still spend a lot of other work choosing them; merge-insertion is the classic example. Memory, locality and recursion depth matter too. In Python specifically:
   - interpreter overhead per operation dominates;
   - a comparison is relatively expensive, because it dispatches through `__lt__` or a key function;
   - moving a list element is a cheap reference copy;
   - the built-in sort runs in C.

   These facts explain why a hand-written Python sort with the same Θ is much slower than `sorted` [empirical], and why Python's own sort is designed to minimize comparisons and to exploit runs already present in the data.

### 4.3 How to use the lenses

- The knowledge lens is the spine and the default question. Introduce each other lens only when the course runs into something the spine can't explain, and use that failure as the motivation. The natural first encounters are:
  - the gap in finding the minimum (certificates);
  - the adjacent-swap barrier and binary insertion sort (movement);
  - counting sort (representation);
  - average-case analysis and bucket sort (distribution);
  - Python measurements and hybrid algorithms (machine).
- For every question the course asks, say which constraint binds and why the others don't.
- When two lenses give different lower bounds, explain the gap rather than picking one.
- The final mental model is the set of lenses together with their scopes: for any setting, which constraints apply and which one dominates.

### 4.4 Questions to ask of every algorithm

- **Knowledge:** what partial order does it hold at each stage, and what shape is it?
- **Information:** how evenly does its next comparison split the possibilities? Does it make comparisons whose outcomes are already implied? Does it discard what it knew?
- **Certificate:** what has it observed that proves its output correct?
- **Movement:** which moves does it use, and how much disorder does each move remove?
- **Representation:** does it treat keys as opaque? If not, what structure does it use, and which assumption makes that legal?
- **Distribution and randomness:** does its cost depend on which inputs occur, or on its own random choices?
- **Machine:** what dominates its actual running time in Python?

## 5. Categories and labels

Textbooks group sorting algorithms in several ways:

- by cost: "elementary" or "quadratic", "n log n", and "linear-time";
- as comparison or non-comparison sorts;
- by guarantees: stable, in-place, adaptive, online;
- as internal or external;
- by strategy: insertion, selection, exchange, merging, partitioning, distribution.

I don't understand why these categories exist or why they are defined the way they are. The course must make them make sense:

- For every category, give a precise definition, the question it answers (why anyone needed it), and what it hides. Stability, for example, matters because of sorting by several keys, and because LSD radix sort is correct only if each pass is stable.
- Show that the categories are values along independent dimensions. The dimensions are what the algorithm may learn about keys (the model), its strategy, its cost, its guarantees and its memory setting. Every algorithm has a value on each dimension.
- Show that grouping by cost class lumps unrelated ideas together. Bubble sort and insertion sort are both Θ(n²) in the worst case, for different reasons; merge sort and heapsort are both Θ(n log n), for different reasons.
- On "linear-time sorts" in particular, explain three things:
  - where the label comes from: textbooks present these algorithms right after the Ω(n log n) proof, as the way around it;
  - why it is misleading: the costs are Θ(n + k), Θ(d(n + b)), or Θ(n) expected under an assumed input distribution, which is linear only when the key parameters are suitably bounded relative to n;
  - what the real dividing line is: whether an algorithm learns about keys only through comparisons, or also through their representation.
- Show where algorithms cut across categories. MSD radix sort partitions the way quicksort does. Heapsort is selection sort that keeps its knowledge. Binary insertion sort is near-optimal in comparisons but quadratic in moves. Tree sort compares exactly the same pairs as one particular quicksort.
- Introduce each category when the course first needs it, not as a list up front. In the synthesis lesson, have me build the classification myself as an interactive exercise, then show the reference version.

## 6. How to explain

### 6.1 Necessity before construction

- Don't name an algorithm before it has been built. Build it from the observations first, then give its conventional name.
- Before introducing any idea, state the open question it answers.
- At the key moments, make me commit to a prediction or an attempt before showing the next step (§7.1).
- Show naive or broken attempts when they teach something. A failed idea that motivates the right one belongs in the chain.
- For every algorithm, say explicitly what structure exists, which assumption gives us access to it, and how the algorithm exploits it.

### 6.2 Mathematics: the need first, then the equation

- Before any equation, say what question we're asking that words can't answer precisely enough, and why this piece of mathematics is the right tool for it.
- After the equation, read it back: what each term means, where it comes from, and a sanity check on a small case.
- Introduce tools at the moment they become necessary:
  - logarithms as "number of halvings" and "number of bits";
  - sums; bounds on n!; Stirling's approximation;
  - indicator random variables and linearity of expectation;
  - recurrences and recursion trees.
- Don't use the Master Theorem as a black box. Build the recursion tree first, so I can see why the result takes the form it does.
- Prefer elementary bounds first, such as (n/2)^(n/2) ≤ n! ≤ n^n. Sharpen them when the constant matters.

### 6.3 Correctness: show how the proof is found

A proof that appears from nowhere teaches me to verify, not to reason. For every algorithm:

1. **Specification.** Precondition and postcondition. For sorting, the output must be ordered *and* be a permutation of the input. Explain why both conditions matter.
2. **Discovery.** Trace a small example and record the state after each step. Ask what is true of the processed part, what the algorithm knows, and what never changes. Propose a candidate invariant. Show candidates that are too weak (the maintenance step fails) or simply false, and strengthen them until one works.
3. **Proof.** Show initialization, maintenance, and that termination implies the postcondition. For recursive algorithms, use strong induction on input size. Give a termination argument: a measure that strictly decreases.
4. **Stress.** Show at least one plausible buggy variant (an off-by-one, a wrong boundary, `<` versus `<=`, a lost stability guarantee), and show exactly where the proof fails for it.
5. **Edge cases.** Empty input, n = 1, all keys equal, many duplicates, already sorted, reverse sorted.

Teach lower bounds the same discovery-first way, whether through adversary arguments or decision trees. Show how to think like the adversary, and why the adversary's strategy is the natural one.

Label partial arguments honestly as *proof*, *proof sketch* or *intuition*.

### 6.4 Cost: derive it, don't announce it

- First decide **what to count** (comparisons, swaps, data moves, writes, extra space, recursion depth) and why that measure matters here.
- Derive the cost from the structure of the algorithm. Loops give sums. Recursion gives a recurrence, which is solved with a recursion tree. Randomness gives indicator variables.
- Say where every factor comes from. If a log n appears, say what it is the logarithm *of*.
- Give exact counts when they reveal something, for instance when the count depends on a property of the input rather than only on n.
- Compare the cost with the relevant lower bound: how far from optimal is it, and why?
- Operation counts measured on sampled inputs are **[empirical]**; exact formulas are **[proof]**. Never present JavaScript timings as evidence about how fast Python is.

### 6.5 Epistemic precision: don't flatten distinctions

Define these terms when they first come up, and keep them distinct for the rest of the course. Tag every non-trivial claim with a visible badge for its status: **[intuition]**, **[proof]**, **[proof sketch]**, **[empirical]** or **[heuristic]**.

- **Intuition:** a reason to expect something. Not a guarantee.
- **Proof:** a guarantee, valid under the stated assumptions.
- **Empirical observation:** measured on particular inputs, hardware or implementations. It can change when any of those change.
- **Heuristic:** a design choice that usually helps but carries no guarantee, such as median-of-three pivot selection.
- **Upper bound (O), lower bound (Ω), tight bound (Θ):** statements about how a function grows. "Merge sort is O(n²)" is true and useless. Don't write O when you mean Θ.
- **What a bound is about.** Keep three levels separate:
  - a bound on *one algorithm*;
  - a bound on *a class of algorithms*, for example all algorithms that only swap adjacent elements;
  - a bound on *a problem within a model of computation*, for example comparison sorting.

  A lower bound stated without its model is incomplete.
- **Worst case and best case:** the maximum and minimum cost over all inputs of size n.
- **Average case:** the expected cost over a *stated distribution of inputs*. The algorithm may be deterministic. Always name the distribution.
- **Expected case**, for randomized algorithms: the expected cost over the *algorithm's own random choices*, for every fixed input, including the worst one. Always name the source of randomness. Show that randomized quicksort, and deterministic quicksort on random permutations, give the same number for different reasons, and that those reasons matter.
- **With high probability:** a statement about the tail of the distribution, stronger than a statement about its expectation.
- **Amortized:** a worst-case guarantee on the total cost of a *sequence* of operations, with no probability involved. Never confuse it with average case. Use it only where it actually arises; if a topic doesn't need it, say so rather than forcing it.
- **Asymptotic cost, constant factors and measured speed** are three different questions.

Never use these phrases without the missing qualification:

- "quicksort is O(n log n)";
- "counting sort is linear", without the dependence on k;
- "sorting needs n log n", without the model;
- "average", when the meaning is "expected";
- "fast", without saying fast in what measure and on which inputs.

### 6.6 Same complexity, different idea

When two algorithms share an asymptotic class but rest on different ideas, stop and contrast them. Cover:

- what they split on, and where the work happens (dividing or combining);
- what knowledge they keep, and what they discard;
- their invariants;
- their physical costs;
- which inputs hurt them.

Algorithms with the same Θ are not interchangeable, and the course should make the reasons visible.

### 6.7 When a limitation seems to break

Whenever an algorithm appears to beat an earlier barrier, ask **which assumption changed**. It could be the model of computation, the structure of the keys, the input distribution, the operations allowed, or the cost measure. State explicitly that the earlier theorem still holds, and say exactly why it doesn't apply here.

### 6.8 Style

- Keep analogies to a minimum. If you use one, keep it brief and replace it right away with the actual structure. Concrete small instances (n = 3, 4, 5) and explicit traces are better than analogies.
- Use precise language and define terms before using them. Keep notation consistent across all lessons, and record it in `ledger.md`. Say "obviously" or "clearly" only after showing the thing.
- No complexity tables until the synthesis lesson, and then only as a summary of results already derived, with their epistemic labels.

## 7. The pages: replacing the tutor

### 7.1 What each tutor behavior becomes

| A live tutor would... | The page does this instead |
|---|---|
| ask me to attempt the next step first | **Predict-first blocks.** I commit to an answer (a choice, a number, a click on the array) before the explanation or animation unlocks. The page then compares my prediction with what actually happens. |
| check that I understood | **Checkpoints** after each section, checked automatically in JavaScript. |
| diagnose what I got wrong | Every wrong option, and every common wrong answer, is designed around one specific misconception. Its feedback names that misconception and corrects it. "Incorrect, try again" is not feedback. |
| not move on over a gap | A **prerequisite check** at the top of each lesson, linking to the exact section to revisit. The section after a checkpoint stays collapsed until I've attempted it. This is a soft gate: a "continue anyway" button opens it and records the skipped checkpoint as an open gap. **Remediation panels** appear after wrong answers. |
| answer my side questions | **"Common question"** and **"Going deeper"** panels that expand, placed wherever a tangent predictably arises. |
| come back to old ideas | **Spiral-back exercises** in later lessons that re-ask an earlier result from the new vantage point, linking back to where it was established. |
| keep track of the chain | The **ledger** at the end of every lesson (§7.6). |

### 7.2 Anatomy of a lesson page

1. **A title phrased as the question** the lesson answers, never as an algorithm name, which would spoil the discovery.
2. **Where we are:** the open question handed over by the previous lesson, and the ledger entries this lesson depends on, with links.
3. **Prerequisite check:** two or three quick items.
4. **The chain itself**, as a sequence of sections:
   - the limitation, and the question it raises;
   - observations, with predict-first blocks;
   - the idea;
   - construction, step by step, with the algorithm named only at the end;
   - an interactive trace;
   - correctness: discovering the invariant, then the proof;
   - cost: the derivation, then interactive counts;
   - comparison with what came before;
   - the new limitation.
5. **The Python implementation**, after the idea, the proof and the cost are understood.
6. **Checkpoints** after sections, and a final exercise set.
7. **The ledger.**
8. **A bridge:** the open question the next lesson takes up, with a link.

A lesson covers one coherent step of the chain, in depth. If a step is too big for one page, split it into several lessons rather than compressing it.

### 7.3 Interactive components

Build these once as reusable components and use them in every lesson, so the visual language stays consistent:

- **Array stepper.**
  - Controls: play, pause, step forward and back, speed, reset.
  - Input: my own array, or presets (random, sorted, reversed, few distinct values, nearly sorted, and the worst case for the current algorithm).
  - Displays: the current line of the Python code highlighted in sync, a variables panel, counters for comparisons, swaps and writes, and the invariant's regions shaded and labeled.
- **Knowledge view.** A Hasse diagram of what the algorithm knows, updated after every comparison. For small n it shows e(P) and log₂ e(P), computed exactly by enumeration, and it flags comparisons whose outcome was already implied.
- **Decision-tree explorer** for n = 3 and 4. I choose comparisons and watch the set of possible orderings split. I can play against an adversary, or be the adversary against an algorithm.
- **Permutation-space explorer** for n = 3 and 4. Every permutation is a node, with edges for a chosen set of moves (adjacent swaps, any swap, prefix reversals) and each node's distance to sorted displayed.
- **Recursion-tree builder.** Cost per level, depth and totals, for divide-and-conquer algorithms and their recurrences.
- **Operation-count plots.** Counts, never wall-clock time, plotted against n with reference curves (n², n log₂ n, log₂ n!). Measured counts are labeled [empirical]; exact formulas are drawn separately and labeled [proof].
- **Structure views**, wherever an algorithm needs one:
  - a heap shown as a tree and as an array at the same time;
  - buckets and digit passes for counting, radix and bucket sort;
  - runs and the merge stack for natural merge sort and Timsort;
  - memory and disk for external sorting.
- **Math** typeset with KaTeX. Long derivations can unfold one step at a time, with each step's justification available on demand.

### 7.4 Exercises

Mix these types, choosing whichever best tests the idea:

- **Multiple choice**, with separate feedback for each option and every wrong option tied to a specific misconception.
- **Numeric answers**, such as the exact number of comparisons on a given input.
- **Hand traces:** I perform the algorithm by clicking the next comparison or swap. The page checks every step against the real algorithm and explains where I diverged.
- **Build an input:** I construct an array that drives an algorithm to its worst case or breaks a buggy variant. The page runs it and reports what happened.
- **Find the bug:** I pick the faulty line in a Python snippet. The feedback shows an input on which the snippet fails.
- **Ordering problems:** I arrange the steps of a proof, or the lines of an implementation, with plausible but false steps mixed in.
- **Invariant spotting:** at a paused state, I select which statements are invariants.
- **Classification**, in the synthesis lesson: I place algorithms along the dimensions of §5.

Every exercise has hints in stages and a worked solution that explains the reasoning, not just the answer. Generate answer keys by running code, never by hand.

### 7.5 Python on the page

- All code is Python 3, syntax-highlighted, with a copy button.
- Code appears only after the idea, the correctness argument and the cost are understood. Comments name the invariant. Where useful, show both a clean version and an instrumented one that counts comparisons and moves.
- Write idiomatic Python, but don't hide the algorithm behind built-ins. Say when a built-in is the right tool in practice.
- The JavaScript that drives each visualization must be a faithful port of the Python on the page: same variable names, same control flow, same order of operations. Only then do the highlighted line, the counters and the animation tell the truth about the Python code.

### 7.6 The ledger

End every lesson with a ledger panel:

- **Established:** results so far, each tagged with its status (proof, empirical, and so on).
- **Assumptions in force:** the model, the key type, distinctness, the input distribution.
- **Lenses in use:** which have been introduced, and what each has explained so far.
- **Reasoning tools acquired:** for example, invariants found from traces, adversary arguments, inversions, indicator variables, recursion trees, exchange arguments, changing the model.
- **Open question:** the question the next lesson takes up.

The index page shows the chain of open questions across all lessons, so the course reads as one argument.

### 7.7 Visual design: Swiss grid

The course uses the International Typographic Style. It is bold, rational and poster-like. Structure is made visible through typography and a strict grid, never through decoration: no rounded corners, no shadows, no gradients, no ornament. Hierarchy comes from size, weight and rules alone.

A sample of this theme is in `lessons/sorting-claude-2/04-swiss/` (`index.html` and `lesson-03.html`). Use it only as a visual reference. Its text is placeholder content, not course material, and it is an unfinished draft. Where it and this section disagree, this section wins.

**Layout**
- One centered column, 760px wide. Everything inside it is flush left, with ragged-right text, never justified.
- Figures, code, tables, exercises and callouts are exactly the column width.
- On phones: 16px side gutters and no horizontal page scroll.

**Type**
- "Inter Tight" (Google Fonts) for all text, in weights 400, 600 and 800. Use tabular numerals wherever numbers line up (counters, tables, plot ticks).
- "IBM Plex Mono" for code and for inline identifiers such as `insertion_sort`.
- Body: 18px, line-height 1.55.
- Title: 800 weight, about 44px, tight leading.
- Section headings: 600–800 weight, about 26px.
- Labels: small uppercase, letterspaced (about 0.08em), 11–12px, weight 600–700.

**Palette: these five colors only**

| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#ffffff` | page background |
| `--c-ink` | `#111111` | text, rules, primary marks |
| `--c-red` | `#e30613` | signal: section numerals, proofs, the current or compared item, the worst case |
| `--c-gray-1` | `#f1f1f1` | fills: code blocks, notes, the sorted region |
| `--c-gray-2` | `#8a8a8a` | secondary text, captions, ticks, disabled states |

Define them, and every font and size, as CSS custom properties in `course.css`.

**Page structure**
- Lesson header, in order:
  - a nav row of small uppercase links: "← ALL LESSONS", plus the previous and next lessons (or "NOT YET AVAILABLE");
  - the kicker "LESSON n", uppercase in red;
  - the title;
  - the meta line, uppercase in gray;
  - a 4px black rule.
- Numbered sections open with a huge two-digit red numeral (01, 02, …): about 72px, weight 800. The heading is set tightly beside it.
- 4px black rules separate major parts (header, ledger, footer).
- Figure labels go above the figure: "FIG. 1", "LISTING 1", "TABLE 1" as uppercase labels, with the caption in small gray text under the label.
- The footer is a thin rule, then a small gray line.

**Callouts**
- Definition, Lemma, Theorem and Invariant: a 4px black left rule, an uppercase label ("LEMMA 1", "DEFINITION (INVERSION)"), then the statement.
- Proof: the same shape, but with a red left rule and a red "PROOF" label. It ends with a filled black square ∎.
- Note: a `--c-gray-1` block with a gray uppercase "NOTE" label.
- Open question: a red rule above it, a red "OPEN QUESTION" label, and the question in large bold type.
- Going deeper: a collapsible block with an uppercase label and a × or + toggle.

**Epistemic tags.** Small uppercase labels in thin boxes, about 9–10px. The tags differ by line style and fill, not only by color:

| Tag | Style |
|---|---|
| proof | red outline, red text |
| proof sketch | red dashed outline, red text |
| empirical | solid black box, white text |
| heuristic | black outline, black text |
| intuition | gray dotted outline, gray text |

Inline, a tag follows the claim. After a display equation, it sits flush right, like an equation number.

**Figures**
- Flat and geometric: square cells with thin black outlines and bold numerals.
- Region encoding:
  - sorted prefix: `--c-gray-1` fill;
  - key: a heavy black outline, or a solid black cell with white text;
  - compared items: red;
  - unprocessed: plain.
  
  The legend uses small squares with uppercase labels.
- Arcs, brackets and connectors are clean strokes, red when they carry the point.
- Graphs (Hasse diagrams, trees): solid black square nodes with white numerals and straight black lines. The element just learned or changed is red.
- Plots:
  - bold black axes, few ticks, gray tick labels;
  - the curves, in this order of use: black solid, black dashed, red solid;
  - sampled data as small black squares with thin gray range bars;
  - direct labels at the line ends where they fit, plus a one-line legend.
- Motion is mechanical and brief: 150–250ms ease-out slides, with no bounce and no easing flourishes. Respect `prefers-reduced-motion`.

**Code.** A `--c-gray-1` block, black IBM Plex Mono, gray line numbers. Keywords are bold; comments are gray italic. The current line in a synced trace is a solid red bar with white text. A small outlined "COPY CODE" button sits above the block, aligned right.

**Controls and exercises**
- Buttons:
  - primary: a black rectangle with white uppercase 11–12px text;
  - secondary: a black outline;
  - disabled: gray.
  
  Toggle groups (speed, presets) are joined rectangles, with the active one filled black.
- Inputs: a rectangle with a thin black outline and no radius.
- Multiple-choice options are full-width outlined rectangles, with the option letter "(a)" in red. When chosen, the option fills black with white text, or takes a thick red outline if it's wrong.
- Feedback:
  - correct: a black block with white text and a "✓";
  - wrong: a red-outlined block with a "✗".
- Checkpoint questions are numbered with large red numerals "Q1", "Q2", …
- "Skip, just show me" and "continue anyway" are small, underlined, uppercase and gray.
- Predict-first blocks have a thin black frame and an uppercase "PREDICT FIRST" label.

**Index page.** Poster-like contents:
- the course title in 800 weight, then a 4px rule and the intro;
- the "How a lesson works" list, with the tag legend as a tight grid;
- each lesson as a row, separated by thin rules: a huge numeral, the title in bold, and the one-line description in gray;
- available lessons marked "AVAILABLE" in red and linked; unwritten ones gray and not linked.

**Implementation notes** (bugs found while building the sample):
- A KaTeX display equation inside a flex row needs `min-width: 0` on its flex item and `overflow-x: auto` on the equation. Without them, a wide equation forces the whole page wider on phones.
- Escape `<` as `&lt;` in TeX written directly into HTML (for example `\sum_{i&lt;j}`). Otherwise the browser parses `<j` as a tag and silently drops the rest of the equation.
- Run KaTeX auto-render again on any caption or label that JavaScript inserts after page load.

## 8. Technical requirements

- **Static and self-sufficient.** Pages must work when opened directly from disk (`file://`), with no server and no build step. That rules out ES-module imports between local files and `fetch` of local files. Use classic `<script src>` tags, and embed data in the page.
- **Files.** One HTML file per lesson, an `index.html`, and shared `assets/course.css` and `assets/course.js` for the theme and the components.
- **Theme tokens.** Every color, font and spacing value is a CSS custom property in `course.css`, implementing the Swiss grid design of §7.7. Light theme only: no dark mode.
- **One centered column.** All content sits in a single centered column. Every figure, visualization, code block, table and exercise is exactly the width of the text column: no full-bleed figures, sidebars or margin notes.
- **Libraries.** KaTeX for math, and a syntax highlighter (Prism or highlight.js). Load them from a CDN, or copy them into `assets/` if the course must work offline. Draw visualizations with plain JavaScript and SVG or Canvas. Add a library such as D3 only if it clearly earns its place.
- **No images or videos.** Code draws every visual.
- **Reproducible randomness.** Use a seeded random number generator for presets and generated exercises, so their answers are reproducible.
- **Progress.** Save completed checkpoints and skipped gaps in `localStorage`, wrapped in `try/catch`. Pages must work fully without it.
- **Accessibility.**
  - Steppers have keyboard controls, for example space to play or pause and the arrow keys to step.
  - Respect `prefers-reduced-motion`.
  - Never use color as the only signal; label regions and states as well.
  - Layouts must work at phone width.
- **Robustness.** No console errors. Components handle anything a learner can type in: empty input, a single element, duplicates, large n. Cap n in animations, and say why.

## 9. Authoring workflow

1. **The course plan comes first.** Before writing any HTML, give me a plan in Markdown. For each lesson, list:
   - its title, phrased as a question;
   - the open question it answers;
   - the key observations;
   - the ideas introduced;
   - the results established, with their labels;
   - the lenses introduced or used;
   - the planned interactive components and exercises;
   - the open question it hands on.

   Put algorithm names in a separate final column, so I can avoid reading them. Also list the shared components to build. Then wait for my approval.
2. **Keep two working files** next to the pages: `course-plan.md` (the approved plan) and `ledger.md` (the cumulative ledger, notation and assumptions). Read both before writing each lesson, and update the ledger afterward. They keep the course consistent across separate authoring sessions.
3. **Build the shared components and the placeholder theme**, then write the lessons one at a time, in order.
4. **Verify each lesson before delivering it:**
   - run every Python snippet, including on edge cases;
   - check that each JavaScript port produces the same sequence of operations as its Python version on random and edge-case inputs (for example, by running the JavaScript under Node);
   - compute every answer key, and every number in the text, by running code;
   - check derivations numerically for small n;
   - open the page and confirm there are no console errors;
   - review the lesson against §6 and §11.
5. **The reference index** of algorithms, linked to where each one was built, goes in the synthesis lesson rather than on the index page, so it doesn't spoil the discovery.

If anything in this prompt is ambiguous or conflicts with the project's existing conventions, ask me before planning.

## 10. A possible spine

This is the chain of reasoning behind the course. Stages are not lessons; one stage may need several lessons. You may reorder or merge stages if you find a more natural chain, but every transition must be driven by the open question of the stage before.

**Stage 0: What is order, and why do we want it?**
- Relations; total orders; strict weak orderings (equal keys, ties); partial orders as the general case.
- Why sort at all: order is structure that makes later questions cheap (searching, detecting duplicates, merging, sweeping).
- Comparisons and keys in Python: what a comparison must satisfy, and what goes wrong when it doesn't.
- A precise specification of sorting: the output is ordered *and* is a permutation of the input, so there are n! candidates.
- The model of computation, stated explicitly as an assumption.
- The brute-force baseline: try permutations until one is sorted. It is correct and hopeless, and it frames sorting as a search among n! candidates.
- Assume distinct keys for now and relax this later.

**Stage 1: The smallest questions.**
- How many comparisons does it take to verify that an array is sorted, or to find its minimum?
- The information bound says log₂ of the number of answers; the truth is n − 1. That gap brings in the certificate lens.
- Minimum and maximum together in ⌈3n/2⌉ − 2 comparisons.
- The second smallest in n + ⌈log₂ n⌉ − 2 comparisons, via a tournament. This sets up heaps later.

**Stage 2: Sorting by repeated selection.**
- Exact comparison and swap counts. The algorithm is non-adaptive: its cost doesn't depend on the input.
- The knowledge view shows it throwing away what it learned.
- Yet it makes at most n − 1 swaps: a first hint that comparisons and moves are separate costs.

**Stage 3: Disorder and local repair.**
- Inversions as a measure of disorder. Swapping an adjacent inverted pair removes exactly one inversion.
- From that fact: bubble sort (with early exit, and the cocktail variant) and insertion sort.
- Insertion sort's cost as a function of the number of inversions (adaptivity).
- The expected number of inversions in a random permutation: the first use of indicator variables and linearity of expectation.
- Theorem: any algorithm that only swaps adjacent elements needs Ω(n²) swaps, in the worst case and on average. This is a bound on a class of algorithms, and it comes from movement. It brings in the movement lens.
- Contrast the three quadratic algorithms: the same Θ from different ideas.

**Stage 4: Separating knowing from moving.**
- Binary insertion sort: comparisons drop to about n log₂ n, but moves stay quadratic.
- The geometry of rearrangement: the space of permutations under different move sets.
- The cycle decomposition: n − c swaps suffice and are necessary, where c is the number of cycles. Cycle sort (minimum writes). The cyclic-placement pattern for arrays holding 1..n. Pancake sorting.
- Conclusion: when long moves are allowed, rearranging is cheap. The hard part is knowing where everything goes.

**Stage 5: Is there a floor?**
- Decision trees. Knowledge as a partial order; linear extensions. The adversary keeps the larger half, which gives log₂ n!.
- Elementary bounds first, then Stirling's approximation.
- The bound holds in the worst case and on average (average leaf depth).
- Binary insertion sort already comes close in comparisons. Go back over every algorithm so far and measure it in bits per comparison. Mention merge-insertion.
- Open question: can we get near-optimal comparisons and cheap movement at the same time?

**Stage 6: Long moves inside insertion sort.**
- Shell sort. Later passes preserve h-sortedness.
- The dependence on the gap sequence.
- An honest mix of proofs, empirical results and open problems.

**Stage 7: Divide by position.**
- Merge sort, top-down and bottom-up. Correctness of merging, and induction for the whole algorithm.
- The recursion tree, and where the log n comes from. The exact worst-case comparison count.
- Extra space and stability. Counting inversions as a by-product.
- The lower bound for merging: 2m − 1 comparisons by an adversary argument, compared with the information bound log₂ C(2m, m). The certificate lens returns.
- External merge sort, for data that doesn't fit in memory.

**Stage 8: Divide by value.**
- Partitioning, and quicksort. Partition invariants: Lomuto, then Hoare, and why Hoare's is subtler.
- The worst case, which inputs trigger it, and why, in terms of knowledge.
- Average case over random permutations versus expected case with random pivots. The derivation that two elements i and j (numbered by rank) are compared with probability 2/(j − i + 1), which gives about 2n ln n ≈ 1.39 n log₂ n comparisons.
- Python's recursion limit and how a naive quicksort hits it; recursing on the smaller side first.
- Duplicate keys and three-way partitioning.
- Tree sort, and the fact that it compares exactly the same pairs as a particular quicksort.
- Why quicksort is often fast in lower-level languages [empirical]. Introsort.

**Stage 9: How much order do we actually need?**
- The selection problem. Quickselect. Median of medians: derive why groups of 5 work and the naive groups-of-3 version doesn't.
- Top-k and partial sorting, and what each costs compared with a full sort.

**Stage 10: Keeping the knowledge.**
- Selection sort revisited: what if we kept the outcomes of its comparisons? Tournament trees, then the heap: a partial order that is cheap to maintain.
- Correctness of sift-up and sift-down.
- Build-heap in O(n), by deriving Σ h/2ʰ. A clear example of an upper bound (n log n) that holds but isn't tight.
- Heapsort. Priority queues with `heapq`; k-way merging; top-k.

**Stage 11: Three ways to reach n log n.**
- Merge sort, quicksort and heapsort compared explicitly, along the dimensions of §6.6.
- Hybrids (introsort, pdqsort) as engineering, with their empirical claims tagged.

**Stage 12: Leaving the comparison model.**
- Which assumption changed? This brings in the representation lens.
- Counting sort: prefix sums, stability, Θ(n + k).
- LSD radix sort: stability is required for correctness. Its invariant; choosing the base; Θ(d(n + b)). What "word size" means for Python's arbitrary-precision integers.
- MSD radix sort, for strings, and its kinship with quicksort.
- Bucket sort, which brings in the distribution lens: linear expected cost under an assumed distribution, its worst case, and what happens when the assumption is wrong.
- Pigeonhole buckets (maximum gap); buckets for top-k frequent elements.
- The "linear-time sorts" label examined (§5). Integer sorting in o(n log n) exists in theory (awareness).
- For each algorithm, say why the Ω(n log n) theorem isn't contradicted.

**Stage 13: Information, refined.**
- The lower bound depends on the class of possible inputs.
- With duplicates, the bound is log₂(n! / ∏ nᵢ!), an entropy, and three-way quicksort comes close to it.
- Presorted input: adaptive sorting and its lower bounds. Runs; natural merge sort.
- Timsort as Python's own sort: runs, minimum run length, galloping, stability, using only `<`. CPython 3.11 and later use the Powersort merge policy.
- The bug in Timsort's invariant that formal verification found, as a lesson in why proofs matter.
- Amortized analysis, if it arises naturally here.

**Stage 14: Order beyond a single total order.**
- Partial orders as the general object.
- Topological sort (Kahn's algorithm and DFS) as finding one linear extension.
- Chains and antichains. Patience sorting, the number of piles, and the longest increasing subsequence in O(n log n). Dilworth's and Mirsky's theorems as the structure behind it.
- Sorting under partial information (awareness): there is always a comparison that splits the linear extensions fairly evenly (Kahn–Saks), and the 1/3–2/3 conjecture is still open.

**Stage 15 (awareness): Beyond the RAM model.**
- Cache effects and the I/O model.
- Sorting networks and the 0-1 principle; bitonic sort; parallel sorting.

**Stage 16: Synthesis.**
- I build the mental model myself: the lenses, their scopes, and which constraint binds in which setting.
- Place every algorithm on that map; the classification exercise of §5.
- The reference index, and a summary table of derived results with their labels.
- Exercises on unseen algorithms.

**The practical thread** from §3 (applications and patterns) is woven into the stages wherever it fits naturally, not collected into a separate tutorial.

## 11. Failure modes to avoid

- Catalogue transitions ("Next, let's look at heap sort").
- Lesson titles or index entries that name an algorithm before it has been built.
- Presenting an algorithm and then justifying it, instead of letting the observations produce it.
- Stating a complexity without deriving it.
- A formal proof without showing how its invariant was found.
- Analogies doing work that structure should do.
- Flattened claims: O for Θ, "average" for "expected", lower bounds without a model, "linear" without its parameters.
- Using the information lens where another constraint binds, or switching lenses without saying why.
- Moving on because the material has been covered rather than understood.
- Feedback that only says "correct" or "incorrect".
- Visualizations that don't match the Python code, or JavaScript timings presented as Python performance.
- Passing off empirical observations as theorems, or the reverse.
- Skipping edge cases and duplicate keys.
- Overloading a page. Depth beats breadth: split rather than compress.

## 12. Begin

Start with step 1 of §9: the course plan. Don't write any HTML yet.
