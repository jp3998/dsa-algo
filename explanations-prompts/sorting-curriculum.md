# Sorting — Curriculum

**Status:** Part I detailed; lessons 00–06 written. Lessons 07–08 remain. Parts II–XII are one-line
placeholders and get expanded one part at a time, just ahead of production.

Companion documents: `sorting-voice-and-pedagogy.md` (how to write),
`sorting-production-spec.md` (how to build the page).

---

## The through-line

Everything in this series answers one question from a different angle:

> **Sorting is the acquisition, representation, maintenance and exploitation of information about
> order.**

Every algorithm becomes an answer to the same six questions:

- What do I know?
- What do I need to know?
- What information can I obtain, and at what price?
- What assumptions can I exploit?
- What structure can I maintain?
- What work is fundamentally unavoidable?

Three threads run the length of the series and converge at the end:

```
ordering → permutations → information → comparisons → decision trees → the n log n bound
                                     ↓
        more information? → key values → digits → distribution
                                     ↓
        algorithm → invariant → progress → correctness → complexity
```

The reader should finish able to meet an unfamiliar algorithmic problem and reason about it from
first principles. Sorting is the vehicle, not the destination.

---

## Part map

Lesson numbers are approximate until each part is expanded.

| Part | ~Lessons | Driving question |
|---|---|---|
| **I — Order and information** | 00–08 | What is order, and how much must anyone learn to establish it? |
| II — First algorithm, first proof | 09–12 | Bubble sort from local disorder; invariants, progress and termination discovered as needed |
| III — Two more derivations | 13–17 | Selection and insertion sort; inversions as a measure of disorder |
| IV — The language of cost | 18–20 | $O/\Omega/\Theta$ formalized; the $n\log n$ bound restated in notation it now has |
| V — Divide and conquer | 21–26 | Recurrences, merging, merge sort, optimality, stability born from a tie-break |
| VI — Partitioning and randomness | 27–32 | Partition invariants, quicksort, average-case vs. randomized guarantees |
| VII — Structures that hold order | 33–36 | Deriving the heap; what a heap deliberately refuses to know |
| VIII — Gaps and partial order | 37 | Shell sort; ideas easy to invent and hard to analyze |
| IX — Do we need to sort at all? | 38–39 | Selection, quickselect, deterministic linear selection |
| X — Lower bounds generalized | 40 | Adversary, counting and information-theoretic arguments compared |
| XI — Breaking the barrier | 41–44 | What assumption changed: counting, radix, bucket |
| XII — Synthesis | 45–49 | Taxonomy derived, networks, real machines, hybrids, the general framework |

### Deliberate ordering decisions

These are the places where the obvious order creates a gap, and what we do instead.

- **Growth intuition before notation.** Lesson 07 establishes how fast $n!$ grows and what a logarithm
  counts, in plain language with no $O/\Omega/\Theta$. The bound is first stated as *"at least about
  $n\log n$ comparisons."* Part IV later re-derives the identical result in formal notation, so the
  symbols arrive as compression of something already owned rather than as vocabulary to memorize.
- **Correctness machinery after the first algorithm.** Invariants cannot be discovered with nothing to
  be invariant about. Bubble sort is derived first (09), then the machinery is extracted from it
  (10–11).
- **Probability before average-case analysis.** Expectation and linearity of expectation get their own
  lesson immediately before average-case quicksort.
- **Stability where it is born.** Stability emerges from a tie-break choice inside merge (Part V), and
  becomes load-bearing in radix sort (Part XI). It is never a bullet in an end-of-course properties
  table.
- **Cost currencies separated early.** Comparisons, swaps and writes are established as distinct costs
  at selection sort (Part III), where the gap between them is widest.

---

# Part I — Order and Information

**Driving question:** What is order, and how much must anyone learn in order to establish it?

**Arc:** We start before mathematics — with what order *is*, and what it means to know something is
ordered rather than for it merely to be so. From there we find what a relation must do to produce an
order at all, then what the sorting problem precisely asks for, then what an algorithm is actually
able to find out. Counting the possibilities and measuring what a single comparison buys us leads to a
picture of any comparison algorithm as a tree, and the tree yields a limit that no algorithm of that
kind can beat. Part I ends by being precise about what that limit does and does not claim — which is
the hinge the entire rest of the series turns on.

---

### Lesson 00 — What order is

```
assumes:    []
introduces: order-as-relation, comparison, knowing-vs-being, information-thesis
```

**The question:** We say "put these in order" as though *order* were a property the things have. Is it?

**Beats:**
- Start with a pile of concrete things. Some can obviously be lined up; some resist. Push on why.
- Same objects, different relations, different orders — people by height and by age give two different
  rows from one set. The order was never in the objects. It is in the relation we chose to ask about.
- Consequence: "sorted" is never complete on its own. It is always *sorted with respect to something*.
- The atomic act. You cannot perceive the order of a pile all at once. You find it out by asking about
  **pairs**. Every bit of order knowledge you will ever have came from such a question.
- **Being ordered vs. knowing it is ordered.** A shuffled deck might already be in order by accident.
  It would *be* ordered, and you would not *know*. Closing that gap costs work — and that work is the
  whole subject.
- Seed the through-line: this series is about acquiring, keeping and spending information about order.

**Figures:**
- One set, two relations, two different rows. *Look at: the objects never moved; only the question did.*
- An "is this sorted?" strip where adjacent pairs are revealed one at a time. *Look at: how much stays
  unknown after each reveal, and that certainty arrives only at the last one.*

**Mental model:** Order is a question you ask about pairs, not a property you observe in a pile.

**Leaves open:** We waved at relations as if any relation would do. Try to build a row from an
arbitrary one and it falls apart. Which relations actually work?

---

### Lesson 01 — What a relation must do

```
assumes:    order-as-relation, comparison
introduces: transitivity, antisymmetry, totality, total-order, partial-order,
            incomparable, ties, weak-order
```

**The question:** Lesson 00 said order comes from a relation. Not every relation gives one. What
exactly is required?

**Beats:**
- Break it first, three times, each break naming one requirement:
  - **The cycle.** Rock beats scissors, scissors beats paper, paper beats rock. Try to put them in a
    row. Watch it fail concretely — every candidate row has a contradiction in it. What we were
    silently relying on is that "beats" never loops. → **transitivity**.
  - **The mutual win.** A relation where $a$ beats $b$ and $b$ beats $a$. Which goes first? The
    question has no answer. → **antisymmetry**.
  - **The missing edge.** A relation where some pairs simply have no answer — proper subsets of a set,
    say, where $\{1,2\}$ and $\{2,3\}$ neither contains the other. You get *a* structure, but not a
    single row: several arrangements are equally valid and nothing distinguishes them. → **totality**,
    and its absence is a **partial order**.
- Only now name the three properties, and assemble them: a **total order**.
- Partial orders are not a failure mode — flag that we will deliberately build a structure later that
  maintains only a partial order, because full order costs more than it needs. (Forward reference,
  not load-bearing.)
- **Ties.** Two distinct things where neither precedes the other, yet they are not the same thing.
  Strict antisymmetry says they must be equal; reality says two people can share a height. Loosen to a
  **weak order**: ties allowed, cycles still forbidden. Note that this creates more than one valid
  arrangement, and set that aside pointedly — it comes back.

**Figures:**
- The rock-paper-scissors cycle with three attempted rows, each with its contradiction marked. *Look
  at: the contradiction is in a different place each time and never absent.*
- A partial order drawn as a lattice beside the several total orders compatible with it. *Look at: the
  relation is fixed, yet the row is not determined.*

**Mental model:** A total order is exactly the set of guarantees you need to lay things in a single
row with no argument about any pair.

**Leaves open:** We know what a valid ordering relation is. We still have not said what the sorting
problem actually *asks for* — and the obvious answer is wrong.

---

### Lesson 02 — What the sorting problem asks for

```
assumes:    total-order, ties, comparison, weak-order
introduces: permutation, multiset, sorting-specification, precondition, postcondition
```

**The question:** What exactly counts as a correct answer? Before any algorithm exists, we need to be
able to judge one.

**Beats:**
- Take the obvious answer: *the output is in non-decreasing order.* Then break it immediately —
  input `[5, 9, 2]`, output `[1, 2, 3]`. Non-decreasing. Completely wrong. The condition is necessary
  and nowhere near sufficient.
- What is missing is that the output must contain *the same things*. Try "the same set" — breaks on
  duplicates, since `[3, 3, 7]` and `[3, 7]` have the same set. What we need counts multiplicity: a
  **multiset**.
- Equivalently and more usefully: the output is a **rearrangement** of the input. Nothing added,
  nothing lost, nothing duplicated. Name it: a **permutation** of the input.
- Assemble the specification. Given input $A$ of length $n$, produce $B$ such that
  (1) $B$ is a permutation of $A$, and (2) $B[i] \preceq B[i+1]$ for every $i$.
- Why both clauses are load-bearing: drop (1) and `[1,2,3]` passes; drop (2) and the input itself
  passes. Neither alone is the problem.
- Frame it as **precondition / postcondition** — what we are handed, what we promise — and note that
  this framing is going to be how we judge every algorithm in the series.
- **How many correct answers are there?** With all elements distinct, exactly one. With ties among
  *distinguishable* items — records that compare equal on the sort key but differ elsewhere — several
  outputs satisfy the specification. State this plainly and leave it deliberately unresolved: the
  specification as written does not care which one you produce, and later we will find situations
  where it should.

**Figures:**
- The two failure modes side by side: sorted-but-wrong-elements, and right-elements-but-unsorted. *Look
  at: each satisfies exactly one clause of the specification.*
- Records sharing a key, arranged two different ways, both passing the specification. *Look at: the
  specification cannot tell these apart, though a person might care.*

**Mental model:** Sorting is a promise about two things at once — *these same items*, and *this
order*. Forget either half and the problem is not sorting.

**Leaves open:** We can now recognise a correct answer when we see one. But an algorithm cannot see
answers — it only gets to *ask things*. What can it actually ask, and what does an answer tell it?

---

### Lesson 03 — What an algorithm is able to find out

```
assumes:    sorting-specification, comparison, total-order
introduces: computational-model, comparison-model, comparison-query, opaque-elements,
            knowledge-state
```

**The question:** An algorithm does not perceive the input. It performs operations. Which operations,
and what do they yield?

**Beats:** Elements as opaque objects whose only accessible property is how they compare. Why this
restriction is a *choice* — and a temporarily useful one, since it is the weakest honest assumption.
What one answer to "is $a \preceq b$?" pins down, and the far larger amount it leaves open. Knowledge
accumulating across queries; transitivity as free inference, giving knowledge the algorithm never paid
for. Introduce the idea of a **computational model** as the thing that decides what is knowable at
all, and promise that changing it later will change everything.

**Leaves open:** If knowledge is a set of still-possible arrangements shrinking as we ask, we had
better find out how large that set is to begin with.

---

### Lesson 04 — Counting the arrangements

```
assumes:    permutation, knowledge-state, total-order
introduces: factorial, counting-by-choices, permutation-space
```

**The question:** How many arrangements must an algorithm be able to tell apart?

**Beats:** Count by hand for 3 and 4 elements before any formula. Notice the structure of the choices.
Derive the product; only then name it $n!$. Get a felt sense of its size. Frame the whole problem as
*locating one point in a space of $n!$ candidates*.

**Leaves open:** We know how many candidates there are. How much does a single question remove?

---

### Lesson 05 — What one comparison buys

```
assumes:    permutation-space, comparison-query, factorial, knowledge-state
introduces: candidate-set, information-narrowing, halving, best-case-split
```

**The question:** A comparison has two possible answers. What does each do to the candidate set?

**Beats:** Track the candidate set concretely across a few queries on 3 or 4 elements. Every query
splits it in two; the answer keeps one part. The best a query can do is halve. Why no query can do
better, and why some do much worse. The question that sets up everything: starting from $n!$
candidates and needing to reach 1, how many halvings could that possibly take?

**Leaves open:** We have been tracking one run by hand. An algorithm has many possible runs. We need a
picture of all of them at once.

---

### Lesson 06 — Every comparison algorithm is a tree

```
assumes:    candidate-set, information-narrowing, comparison-query, factorial
introduces: decision-tree, root-to-leaf-path, tree-height, leaf-count-bound
```

**The question:** What does the *whole* behaviour of a comparison algorithm look like, across every
possible input?

**Beats:** Build the tree for 3 elements by hand — the whole thing. Nodes are queries, branches are
answers, a leaf is the point where the algorithm commits to an output. Why every one of the $n!$
arrangements needs its own leaf (two arrangements at one leaf means one gets the wrong answer). Why a
binary tree of height $h$ has at most $2^h$ leaves. Put them together: $2^h \ge n!$, so
$h \ge \log_2(n!)$. The height is the worst-case number of comparisons.

**Leaves open:** We have an exact answer that is useless until we know how big $\log_2(n!)$ actually
is.

---

### Lesson 07 — How big is $\log_2(n!)$?

```
assumes:    leaf-count-bound, tree-height, factorial
introduces: logarithm-as-question-count, growth-comparison, stirling-informal,
            n-log-n-bound
```

**The question:** Turn $\log_2(n!)$ into something we can feel.

**Beats:** What a logarithm counts, built from the halving picture rather than from algebra. Why $n!$
outruns every power of a constant. The clean half-of-the-terms argument giving a lower bound on
$\log(n!)$, then the easy upper bound, then the two squeezing together at roughly $n\log n$. Stirling
mentioned as the sharp version, not needed for the conclusion. **No $O$, $\Omega$ or $\Theta$ — the
result is stated in words: *any comparison-based sorting algorithm must, on some input, make at least
about $n\log n$ comparisons.*** This is the first major milestone.

**Leaves open:** A result this strong is easy to over-apply. Exactly what did we prove?

---

### Lesson 08 — What the bound does and does not say

```
assumes:    n-log-n-bound, comparison-model, computational-model, decision-tree
introduces: model-dependence, lower-bound-vs-upper-bound, worst-case-quantifier
```

**The question:** What are the limits of the limit?

**Beats:** Restate the claim with its quantifiers exposed — *for every comparison-based algorithm,
there exists an input requiring at least about $n\log n$ comparisons.* Then list what it does not say:
not that every input is hard; not that comparisons are the only cost; not that sorting in general is
hard — only sorting *in this model*. A lower bound is a statement about all possible algorithms; an
upper bound is a statement about one. Close the part by pointing at the hinge: if the bound depends on
the model, then changing the model changes the bound — and Part XI will do exactly that.

**Leaves open:** We know what any algorithm must spend. We do not have a single algorithm. Time to
build one — and to find out how we would ever know it was right.

---

# Parts II–XII

Placeholders. Each is expanded into full briefs at the start of its production phase.

- **Part II — First algorithm, first proof.** Bubble sort derived from local disorder; invariants,
  progress and termination extracted from it; its cost and its adaptiveness.
- **Part III — Two more derivations.** Selection sort and the separation of cost currencies; insertion
  sort; inversions as a measure of disorder; input-sensitive cost.
- **Part IV — The language of cost.** Why growth needs a language; $O/\Omega/\Theta$; case analysis as
  an independent axis; the $n\log n$ bound restated formally.
- **Part V — Divide and conquer.** The general idea; recurrences; merging; merge sort; the recursion
  tree; optimality; stability born from a tie-break.
- **Part VI — Partitioning and randomness.** Partition invariants; quicksort; partition shapes and two
  recurrences; expectation; average-case; randomized quicksort.
- **Part VII — Structures that hold order.** Deriving the heap; heap operations; linear-time build;
  heapsort; what a heap refuses to know.
- **Part VIII — Gaps and partial order.** Shell sort; gap sequences; when analysis outruns invention.
- **Part IX — Do we need to sort at all?** The selection problem; quickselect; median of medians.
- **Part X — Lower bounds generalized.** Adversary arguments; the family of lower-bound techniques.
- **Part XI — Breaking the barrier.** What assumption changed; counting sort; radix sort; bucket sort.
- **Part XII — Synthesis.** Taxonomy derived; sorting networks; the machine; hybrids; the general
  framework.

---

# Concept ledger

Every named concept, term and symbol, mapped to the one lesson that introduces it. A lesson may use a
concept only if its introducing lesson number is **strictly lower**.

Grows as parts are written. Part I only, for now.

| Concept | Introduced in |
|---|---|
| order-as-relation | 00 |
| comparison | 00 |
| knowing-vs-being | 00 |
| information-thesis | 00 |
| transitivity | 01 |
| antisymmetry | 01 |
| totality | 01 |
| total-order | 01 |
| partial-order | 01 |
| incomparable | 01 |
| ties | 01 |
| weak-order | 01 |
| permutation | 02 |
| multiset | 02 |
| sorting-specification | 02 |
| precondition | 02 |
| postcondition | 02 |
| computational-model | 03 |
| comparison-model | 03 |
| comparison-query | 03 |
| opaque-elements | 03 |
| knowledge-state | 03 |
| factorial | 04 |
| counting-by-choices | 04 |
| permutation-space | 04 |
| candidate-set | 05 |
| information-narrowing | 05 |
| halving | 05 |
| best-case-split | 05 |
| decision-tree | 06 |
| root-to-leaf-path | 06 |
| tree-height | 06 |
| leaf-count-bound | 06 |
| logarithm-as-question-count | 07 |
| growth-comparison | 07 |
| stirling-informal | 07 |
| n-log-n-bound | 07 |
| model-dependence | 08 |
| lower-bound-vs-upper-bound | 08 |
| worst-case-quantifier | 08 |

### Terms deliberately NOT yet available in Part I

Using any of these before its lesson is a gap. Listed because they are the ones most likely to slip in
while writing.

`O` · `Ω` · `Θ` · asymptotic · complexity · time complexity · efficiency · running time ·
in-place · stable/stability · adaptive · recurrence · recursion · divide and conquer ·
expected value · average case · amortized · inversion · invariant · loop invariant · pivot ·
partition · heap · data structure

(*Sequence*, *list* and indexing like $A[i]$ are ordinary English plus notation defined on the spot,
and are fine. What is deferred is **array as a cost model** — indexing being constant-time, memory
being contiguous — which belongs with the machine discussion in Part XII.)
