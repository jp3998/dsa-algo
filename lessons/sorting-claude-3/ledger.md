# Cumulative ledger: notation, assumptions, results

Working file (§9.2). Read before writing each lesson; update after each lesson. Results are tagged
with their status. "L1 Thm 7" = lesson 1, Theorem 7 (numbering restarts in each lesson).

---

## Notation (fixed for the whole course)

| Symbol | Meaning | Introduced |
|---|---|---|
| \(\prec\) | a relation, read "must come before"; in a sort, the comparison | L1 §02 |
| \(<\) | the comparison as Python asks it (`a < b`); on numbers, the usual order | L2 §01 |
| \(x \sim y\) | tie: neither \(x \prec y\) nor \(y \prec x\) (includes \(x \sim x\)) | L1 §06 |
| \(x \not\prec y\) | "\(x \prec y\)" does not hold | L1 §05 |
| out-of-order pair | positions \(i < j\) with \(x_j \prec x_i\) (later named inversion, L8) | L1 §02 |
| \(P\) | a strict partial order; also what an algorithm knows | L1 §04, L4 §06 |
| \(e(P)\) | number of linear extensions of \(P\) | L1 §04 |
| tiers \(T_1, \ldots, T_k\); sizes \(n_i\) | classes of \(\sim\) in a strict weak ordering, in order | L1 §06 |
| \(n\) | number of elements; positions are \(0, \ldots, n-1\) (Python indexing) | L1 |
| \(a = [a_0, \ldots, a_{n-1}]\) | input list; \(b\) the output list | L3 §02 |
| \(\pi\) | bijection of positions with \(b_i = a_{\pi(i)}\) | L3 §02 |
| \(\lvert a\rvert\) | number of decimal digits of a non-negative integer | L2 §06 |
| \(\log\) | \(\log_2\) unless written \(\ln\) | L3 §01 |
| \(C_A(x)\), \(W_A(n)\), \(B_A(n)\) | comparisons of \(A\) on \(x\); worst case; best case (max / min over inputs of size \(n\)) | L3 §03 |
| \(T(n)\) | \(\sum_{j=1}^{n-1} n!/j!\), permutation sort's worst case | L4 §05 |
| rank | number of smaller elements | L4 §07 |

Python conventions: comparisons are written with `<` only, as `b[i + 1] < b[i]` ("is the later one
smaller?"); lists are 0-indexed; code follows PEP 8; every listing is run in CPython before publishing.

---

## Assumptions in force (after lesson 4)

- **Model:** comparison model (L3 §03). Elements are opaque; the only query is "is \(a_i < a_j\)?";
  moves are counted separately and reveal nothing; index arithmetic is free.
- **Cost measure:** number of comparisons; worst case unless stated. No averages yet (they need a
  stated distribution; first in L10).
- **Comparison:** a strict weak ordering (L2 contract).
- **Keys:** A1, all keys distinct (L3 §02), for cost results. Correctness results allow ties.
  A1 is dropped deliberately in L7 (stability), L25 (duplicates in partitioning), L33 (entropy bound).
- **Inputs:** by L3 Lemma 3, rank patterns (permutations of \(0..n-1\)) suffice.

---

## Lenses

| Lens | Introduced | Explained so far |
|---|---|---|
| Knowledge | L4 §06 (informal; formal in L15) | Knowledge = partial order; \(e(P)\) = inputs still possible; known/implied comparisons teach nothing. Explains permutation sort's waste. |
| Certificate | L5 (planned) | — |
| Movement | L11 (planned) | — |
| Representation | L30 (planned) | (L3 lists what the comparison model excludes) |
| Distribution | L10 (planned) | — |
| Machine | L29 (planned) | (L3 §04: CPython comparison counts, empirical) |

---

## Established results

### Lesson 1 — What does it mean for things to be in order?
- Running idea: count answers by asking, step by step, "which items can go first?" (Fig. 1 choice trees: 1 / 2 / 5 / 0). Formalised as minimal elements (L1 Thm 5); returns as the knowledge view and in lesson 35.
- Two items are easy to order; a row of n items is n(n−1)/2 pairs at once, and the row obeys the request iff every pair does, so a request is fully described by its rule for pairs (relation = list of "must come before" pairs). The difficulty: pairs in a row are not independent (x before y, y before z forces x before z). The shortcut "each item before the next" fails on ties (0 rows of (B) pass); corrected neighbour tests are L1 Lemmas 8 and 11.
- e(P) = number of paths in the "which items can go first?" choice tree [proof, L1 §04].
- Def: sorted arrangement = no out-of-order pair. Strict partial order = irreflexive + transitive.
- L1 Lem 1: a cycle forbids any sorted arrangement [proof].
- L1 Lem 2: asymmetry [proof]. L1 Lem 3: no cycles in a strict partial order [proof].
- L1 Lem 4: minimal elements exist (finite) [proof]. L1 Thm 5: linear extensions exist (remove a minimal element repeatedly) [proof]. L1 Cor 6: sorted arrangement exists iff no cycle [proof].
- Hasse diagrams: \(x \prec y\) iff upward path of covering pairs [proof sketch].
- Fewest requirements leaving \(e(P) = 1\) on \(n\) elements is \(n - 1\) [proof] (deeper box; returns in L5).
- L1 Thm 7: strict total order → exactly one sorted arrangement; first element forced to be the minimum [proof].
- L1 Lem 8: neighbours suffice for total orders [proof]; fail for partial orders (d a b c on the tasks poset) [proof by counterexample].
- L1 Lem 9: tiers of a strict weak ordering are totally ordered [proof]. L1 Thm 10: \(\prod n_i!\) sorted arrangements [proof]. L1 Lem 11: neighbours suffice for strict weak orderings [proof].
- "Noticeably smaller" (\(y - x > 1\)): strict partial, not weak; arrangements of 1..n are Fibonacci [proof sketch].
- Running examples: tasks poset a≺c, b≺c, b≺d (\(e = 5\): abcd, abdc, bacd, badc, bdac); traps dabc, bcda, cdab; people by age (2 arrangements).

### Lesson 2 — What must a comparison promise?
- Python's sort asks only `<` (documented).
- L2 Thm 1: key-induced relations are exactly the strict weak orderings; tiers = equal keys [proof].
- L2 Thm 2: lexicographic order of strict total orders is a strict total order [proof].
- Comparator contract: \(\texttt{cmp}(a,b) < 0\) must be a strict weak ordering, signs consistent.
- `check_strict_weak(values, before)`: brute-force sample check, returns first counterexample triple.
- Broken comparisons (tolerance, NaN, rock–paper–scissors, set `<`): CPython 3.12 returns a rearrangement, no error, input-order dependent [empirical].
- L2 Thm 3: concatenation rule induced by key \(a/(10^{|a|}-1)\) [proof]. L2 Thm 4: sorting by it gives the largest number [proof, exchange argument].

### Lesson 3 — What exactly is the sorting problem, and what may an algorithm do?
- L3 Lem 1: ties are neighbours in sorted order; \(n - 1\) comparisons detect a tie [proof].
- Halving: \(\ge \log_2 m\) yes/no answers to single out one of \(m\); halving achieves \(\lceil\log_2 m\rceil\) [proof]. Binary search proper: L12.
- Specification: sorted AND permutation (bijection \(\pi\)). L3 Lem 2: \(n!\) arrangements [proof].
- Comparison model defined; L3 Lem 3: identical runs on inputs with the same rank pattern [proof].
- Defs: worst case \(W\), best case \(B\).
- CPython 3.12 `sorted`: \(n - 1\) comparisons on sorted and reversed input (n = 10, 100, 1000); random n = 1000 ≈ 8 600 [empirical]. Puzzles handed on: why \(n - 1\) is optimal (L5); how reversed is detected (L34).
- Tools: `is_sorted`, `is_permutation` (Counter; outside the model, fine for tests), `stress_test`, `Counted` instrumentation.

### Lesson 4 — What is the simplest certainly-correct way to sort, and what does it waste?
- Permutation sort (itertools.permutations, lexicographic over positions) is correct for any strict weak ordering [proof].
- L4 Thm 2: \(B(n) = n - 1\); \(W(n) = T(n) = \sum_{j=1}^{n-1} n!/j! < 2\,n!\), attained by reversed input [proof]; \(T(n)/n! \to e - 1\) [proof sketch]. Values: T(3..10) = 9, 40, 205, 1236, 8659, 69280, 623529, 6235300.
- Cost depends on the answer's position in generation order, not on disorder ([2,3,4,1]: 19 candidates; [1,4,3,2]: 6; both 3 out-of-order pairs).
- L4 Thm 3 (knowledge theorem): knowledge = transitive closure \(P\) of outcomes; consistent inputs = linear extensions (\(e(P)\)); unrelated pairs can go either way [proof].
- Waste: reversed n = 4: 40 comparisons, 6 distinct pairs, 34 repeats, full order known after comparison 24. [2,3,1]: answer known after 3 of 7.
- L4 Thm 4: comparison counting (rank sort): exactly \(n(n-1)/2\) comparisons, every input; `else` branch breaks ties by position (stable) [proof]; the `elif` variant breaks on ties.

---

## Reasoning tools acquired (cumulative)

- Precise definitions from vague requests (L1); counterexamples locate where an assumption is used (L1).
- Induction by removing a forced or minimal element (L1).
- Counting by symmetry (L1); counting "on how many candidates does event j happen" (L4); geometric-series bounds (L4).
- Hidden-key proofs of transitivity (L2); sample checking of comparators (L2); exchange arguments (L2).
- Specifications as pre/postconditions; stress tests against `sorted` (L3).
- Reduction to rank patterns (L3).
- Correctness = permutation + sorted + returns (+ termination measure); stress a proof with buggy variants (L4).
- Knowledge view: partial orders, \(e(P)\), wasted comparisons (L4).

---

## Open question handed to lesson 5

Asking every pair costs \(n(n-1)/2\) comparisons, yet on a sorted input the \(n - 1\) neighbour answers
already prove the whole order. How many comparisons are truly necessary? Start with the smallest
questions: how many to check that an array is sorted, or to find its smallest element?

Planned answers (L5): both need exactly \(n - 1\) (certificate / adversary); the information bound gives
only 1 and \(\log_2 n\); explain the gap (answers vs certificates); for sorting itself the certificate needs
only \(n - 1\), so information binds there. Explain CPython's 999 from L3.
