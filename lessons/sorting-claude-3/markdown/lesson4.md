# Lesson 4: What is the simplest certainly-correct way to sort, and what does it waste?

*Stage 0 · Foundations*

> This is the Markdown edition of the interactive page. Exercises show their answers, feedback, hints and worked solutions in collapsible blocks: try each one before opening them.

## Where we are

Lesson 3 made the task exact. Assume the keys are distinct (Assumption A1). Then sorting means finding the one sorted arrangement among $n!$ candidates. The only way to learn about the elements is to ask “is $a_i < a_j$?”, and each question costs one unit. And lesson 1 gave us a way to check any candidate: $n - 1$ neighbour comparisons.

Put those two facts side by side and you can already write a sorting algorithm. It won’t be a fast one, but for now we only want one that is certainly correct. In this lesson we’ll build the most direct algorithm we can, prove that it is correct, and work out exactly what it costs. Then we’ll ask the question that will organise the rest of the course: at each moment, what does the algorithm actually *know*, and does it use it?

- [Lesson 1 §05–06: neighbour checks suffice](lesson1.md)
- [Lesson 1 §04: linear extensions, Corollary 6](lesson1.md)
- [Lesson 3 §03: the comparison model; worst and best case](lesson3.md)

## Prerequisite check

**P1.** At most how many neighbour comparisons does it take to check whether an arrangement of 6 distinct elements is sorted?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

The check compares neighbours only. So the real question is: how many neighbour pairs does a row of 6 elements have?

</details>

<details>
<summary>Hint 2</summary>

Write the pairs by position: (0,1), (1,2), … The last element sits at position 5. Where does the list end?

</details>

<details>
<summary>Answer and feedback</summary>

- **5** ✓ Yes, 5. A row of 6 elements has five places where two neighbours meet. Lesson 1, Lemma 8 says that checking those five pairs is enough: if each of them is in order, we can chain them together to show that every pair is in order. The check can stop sooner, but only when it finds a pair out of order.
- *If you answered 15:* 15 is the number of *all* pairs, $\binom{6}{2}$. You don’t need them all. If every neighbour pair is in order, the other pairs follow by chaining neighbours: if the first element is smaller than the second, and the second is smaller than the third, then the first is smaller than the third. That step is transitivity, and lesson 1, Lemma 8 uses it to cover every pair. So only the 5 neighbour pairs get asked.
- *If you answered 6:* That counts the elements rather than the gaps between them. Six elements in a row have five neighbour pairs, (0,1) up to (4,5), just as six fence posts have five gaps.
- *If you answered 720:* 720 is $6!$, the number of possible arrangements. But here you’re holding one arrangement and checking only that one. Checking it takes only its neighbour pairs.
- *Any other answer:* Picture the six elements in a row and count the places where two neighbours meet. Each of those is one comparison, and lesson 1 showed that they are all you need.

</details>

<details>
<summary>Worked solution</summary>

Number the positions 0 to 5. The neighbour pairs are (0,1), (1,2), (2,3), (3,4) and (4,5): five of them, one fewer than the elements, because each pair is a gap between two neighbours. Why are these enough? Lesson 1, Lemma 8 answers that. Take distinct elements, and suppose every neighbour pair is in order. Pick any earlier element and any later one, say the ones at positions 1 and 4. The neighbour facts in between chain together: $b_1 < b_2 < b_3 < b_4$. So the earlier element is smaller than the later one, and the same chaining works for every pair. So the check asks at most 5 questions, and fewer if it meets a pair out of order and stops early.

The tempting wrong answers count something else. 6 counts elements, not gaps. 15 counts every pair, $\binom{6}{2}$, but the other 10 follow from the neighbours by transitivity. And 720 counts arrangements, not the comparisons needed to check one.

</details>

**P2.** What is the worst-case cost $W_A(n)$ of an algorithm $A$?

- **(a)** The largest number of comparisons $A$ makes on any input of size $n$.
- **(b)** The number of comparisons on the reversed input.
- **(c)** The average number of comparisons over all inputs.
- **(d)** The number of comparisons needed to sort any input by the best possible algorithm.

<details>
<summary>Hint 1</summary>

Notice the subscript $A$: this cost belongs to one particular algorithm. Now, “worst” over what?

</details>

<details>
<summary>Hint 2</summary>

Imagine running $A$ on every input of size $n$ and writing down each comparison count. Which single number from that list is the worst case?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. The worst case is a maximum: run $A$ on every input of size $n$ and take the biggest count. By lesson 3, Lemma 3, the count depends only on the input’s rank pattern. So the maximum is taken over the $n!$ patterns.
- **(b)** ✗. The reversed input is a natural suspect, and for some algorithms it really is a worst case. But that has to be proved, one algorithm at a time; it isn’t part of the definition. The definition takes the largest count over all inputs, whichever input turns out to give it.
- **(c)** ✗. That’s the average case, a different measure. To take an average, you first have to say how likely each input is, which is called a distribution (lesson 10). And an average is often smaller than the worst case. The worst case is the single largest count.
- **(d)** ✗. That describes the *problem*, not algorithm $A$. It asks how few comparisons any algorithm at all could get by with, and we’ll study that in lesson 15. $W_A(n)$ is about one specific algorithm and how badly it can do.

</details>

<details>
<summary>Worked solution</summary>

Fix the algorithm $A$ and the size $n$. Each input of size $n$ makes $A$ perform some number of comparisons. By lesson 3, Lemma 3, that number depends only on the input’s rank pattern, so there are at most $n!$ different counts to look at. The worst case $W_A(n)$ is the largest of them: option (a).

The other options are close relatives, which is why they tempt. (b) picks one particular input. That input may or may not give the largest count, and for each algorithm that has to be proved. (c) is the average of the counts. An average is never larger than the maximum, and it also needs a distribution. (d) moves from one algorithm to all algorithms: that’s the cost of the problem itself, a question for lesson 15.

</details>

---

## 01 · The most direct idea

Lesson 3 ended by asking for the simplest algorithm that is *certainly* correct. The two facts above very nearly hand us one. The answer we’re looking for is one of the $n!$ arrangements of the input. With distinct keys, exactly one of them is sorted (lesson 1, Theorem 7). And we can test any single arrangement with at most $n - 1$ neighbour comparisons (lesson 1, Lemma 8). So why not simply try them all? That’s the most direct plan imaginable: **generate the arrangements one at a time, check each one, and stop at the first that passes.**

Take the input `[3, 1, 2]`. It has six arrangements, and one of them is 1, 2, 3. If we check the six one by one, we reach 1, 2, 3 at some point, and the search stops there. The same goes for every input: its sorted arrangement is somewhere in the list, so the search is bound to reach it. What we don’t know yet is how long the search takes. The first thing that decides it is how many candidates get checked before the sorted one turns up.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

For $n = 4$, how many candidates might the algorithm have to check in the worst case?

*Your answer:* ______

<details>
<summary>Your prediction, compared</summary>

- **24** ✓ That’s it: all $4! = 24$ of them, in the unlucky case where the sorted arrangement is generated last.
- *If you answered 1:* That’s the best case, when the very first arrangement generated happens to be the sorted one. The worst case asks how unlucky we could get.
- *If you answered 12:* Half is a sensible guess for a typical input. But the worst case is about the unluckiest input, and there the sorted arrangement could be the very last one generated.
- *If you answered 3:* 3 is what it costs to check *one* candidate, its three neighbour pairs. Here we’re counting how many candidates might need checking.
- *Any other answer:* How many arrangements of 4 elements are there, and where in the sequence could the sorted one sit?

</details>

<details>
<summary><b>Reveal</b></summary>

All 24. Four elements have $4! = 24$ arrangements. The plan doesn’t say which one comes last, so the sorted one may well be generated last. Then each of the 23 candidates before it gets checked and fails, and the search stops only at candidate 24.

</details>

---

## 02 · Construction

So in the worst case all $n!$ candidates get checked: that happens when the sorted arrangement is generated last. But which inputs are that unlucky? The plan doesn’t say. “Generate the arrangements one at a time” leaves open the order they come in. If 1, 2, 3 is generated last, then `[3, 1, 2]` is a worst case. If 1, 2, 3 is generated first, then `[3, 1, 2]` costs just 2 comparisons. So until the order is fixed, we can’t say which input is the worst one, and we can’t count its cost either. Let’s pin the plan down as code. It takes three ingredients, and we already have each one, or nearly:

1. **A way to generate every arrangement exactly once.** Python’s `itertools.permutations(a)` does exactly this: it yields the $n!$ arrangements of `a` as tuples. It works on *positions*, not values: each arrangement is described by the positions it takes its elements from, in order. And it produces these position tuples in lexicographic order, the dictionary order from lesson 2. For $n = 3$ the order is (0,1,2), (0,2,1), (1,0,2), (1,2,0), (2,0,1), (2,1,0). So on `[3, 1, 2]` the first candidate, (0,1,2), is the input itself, 3, 1, 2. The second, (0,2,1), takes position 0, then 2, then 1, which gives 3, 2, 1. This is the order we fix for the rest of the lesson. In §05 it will tell us exactly which input is the unlucky one.
2. **A check for each candidate.** This is lesson 1’s neighbour test, and it stops at the first neighbour pair that is out of order. To match Python’s convention it asks only `<`: “is $b_{i+1} < b_i$?”, that is, “is the later one smaller?”
3. **Return the first candidate that passes.**

**Listing 1.** *The direct algorithm. The stepper below runs a line-by-line JavaScript port of exactly this code.*

```python
from itertools import permutations

def is_sorted(b):
    for i in range(len(b) - 1):
        if b[i + 1] < b[i]:
            return False
    return True

def permutation_sort(a):
    for candidate in permutations(a):
        if is_sorted(candidate):
            return list(candidate)
```

This algorithm is usually called **permutation sort**, or brute-force sort.

<details>
<summary><b>Going deeper · Its randomised cousin</b></summary>

Instead of generating arrangements in order, one could shuffle at random until the result is sorted (“bogosort”). It can examine the same arrangement many times. And it has no worst-case bound at all: however large a number $N$ you pick, there is some chance that the first $N$ shuffles all fail `[proof]`. Its expected cost needs the tools of lesson 10. Our version, which runs through the arrangements in order, is at least certain to stop.

</details>

---

## 03 · A trace

We have the algorithm on the page now, but reading code only goes so far. Before proving anything about it, let’s watch it run. We want to see two things at work together: the fixed order of the candidates, and the check that stops at the first bad pair. Fig. 1 steps through permutation sort on any input you like, up to six distinct values. For now, ignore the diagram underneath the stepper; we’ll come back to it in §06.

**Fig. 1.** *Permutation sort on your input (distinct values, at most 6). The bottom row is the current candidate: red cells are being compared, gray cells passed the check so far. The diagram below the stepper is lesson 1’s Hasse diagram, now showing what the algorithm has learned.*

On the default input `[3, 1, 2]`, the algorithm examines 4 candidates and makes 6 comparisons:

**Table 1.** *Permutation sort on [3, 1, 2].*

| # | Candidate | Questions asked | Result |
|---|---|---|---|
| 1 | 3, 1, 2 | 1 < 3? yes | fail |
| 2 | 3, 2, 1 | 2 < 3? yes | fail |
| 3 | 1, 3, 2 | 3 < 1? no; 2 < 3? yes | fail |
| 4 | 1, 2, 3 | 2 < 1? no; 3 < 2? no | pass: return [1, 2, 3] |

Two things in this table are worth holding on to. The first is how much the algorithm repeats itself. Three elements have only three pairs, yet it asked six questions: about 1 and 3 twice (candidates 1 and 3), about 2 and 3 three times (candidates 2, 3 and 4), and about 1 and 2 just once, at the very end. Keep that in mind; it comes back in §06. The second is simply that the algorithm returned the right answer, `[1, 2, 3]`. But that was one input of three distinct numbers. Does it return the right answer on *every* input? That includes inputs with ties, which the stepper doesn’t even let you enter.

---

## 04 · Correctness

Trying more examples can’t settle that, because there are infinitely many inputs. We need an argument that covers all of them at once. First, recall what “the right answer” means. The specification from lesson 3 says: given a list `a` and a strict weak ordering `<`, return a sorted permutation of `a`.

How do we find the argument? A good habit is to ask what stays true while the loop runs. Look back at the trace on `[3, 1, 2]`. When the loop reached candidate 4, the three candidates before it had all failed the check. Each failed at a pair that was out of order: 3, 1, 2 at the pair 3, 1; then 3, 2, 1 at 3, 2; then 1, 3, 2 at 3, 2. So all three really were wrong. The same holds on every input. A candidate fails only when some neighbour pair is out of order. Because `<` is a strict weak ordering, lesson 1, Lemma 11 says that having a neighbour pair out of order is the same as being “not sorted”. So each time the loop moves on, one simple fact stays true: every candidate it has thrown away really was wrong. A fact that holds every time the loop comes round is called an **invariant** of the loop. The name says what it does: the loop changes everything else, but this fact does not vary.

That fact does more work than it seems. Turn it round. If every candidate thrown away was wrong, then a sorted candidate is never thrown away. On `[3, 1, 2]`, the sorted 1, 2, 3 was safe from the start, so the loop was bound to stop there or earlier. In general, a sorted candidate is somewhere among the $n!$. The loop reaches it at the latest, and returns before it runs out of candidates. But the invariant tells us nothing about the candidate the loop *does* return. So the proof has three claims to make. What the function returns is a permutation of `a`. It is sorted. And it returns at all, which is where the invariant does its work.

> **Theorem 1 (permutation sort is correct)**
>
> For every list `a` and every strict weak ordering `<`, `permutation_sort(a)` returns a sorted permutation of `a`.

> **Proof**
>
> *It returns a permutation.* Every candidate is an arrangement of the positions of `a`.
>
> *What it returns is sorted.* It returns a candidate only when `is_sorted` returned `True`, that is, when no neighbour pair is out of order. Since `<` is a strict weak ordering, lesson 1, Lemma 11 makes that equivalent to sorted.
>
> *It returns.* The candidates are all $n!$ arrangements, finitely many, generated one per iteration (termination measure: the number of arrangements not yet generated, which drops by 1 each iteration). At least one arrangement is sorted (lesson 1, Theorem 10; with distinct keys, Theorem 7), and it passes the check. So the loop reaches a passing candidate and returns it, possibly an earlier passing one. ∎

Notice that the proof never used distinct keys. So the algorithm is correct even with ties. That rests on a small detail in the check. It asks “is $b_{i+1} < b_i$?”, that is, “is this pair out of order?”. It does not ask “is $b_i < b_{i+1}$?”, that is, “is this pair strictly increasing?”. Take the tied pair 2, 2. Our check asks “is 2 < 2?”, gets “no”, and lets the pair pass. The other question would also get “no”, but for that question “no” means the pair fails.

Small details like that are exactly what goes wrong in real code. So let’s test the proof against two plausible mistakes, and see which step of the proof each one breaks.

1. **Mistake 1: checking for strict increase.** Suppose the check is written as `if not b[i] < b[i + 1]: return False`. This demands that each item be strictly smaller than the next. With distinct keys that makes no difference. But give it a tie, say `[2, 1, 2]`. Every sorted arrangement looks like 1, 2, 2, with the two 2s side by side. At the two 2s the check asks “is 2 < 2?”, gets “no”, and rejects the arrangement. So even the right answer fails the check. No candidate passes, and the loop runs out. The function then falls off the end and returns `None`. Where does the proof catch this? At the step “the sorted arrangement passes the check”. With ties, a sorted arrangement need not be strictly increasing: 1, 2, 2 is sorted, yet 2 < 2 is false.
2. **Mistake 2: stopping one pair early.** Suppose the loop is written as `for i in range(len(b) - 2)`. Then the last neighbour pair is never compared. On `[1, 3, 2]` the very first candidate is the input itself. The check compares 1 with 3 and finds nothing wrong. Then it stops, before it ever looks at 3 and 2, and the function returns `[1, 3, 2]`. The proof catches this at the step “passes the check, so it is sorted”. Lesson 1, Lemma 11 gives “sorted” only when *every* neighbour pair has been checked, and here the pair 3, 2 never was.

Both mistakes hide in a boundary case. The tie sits on the border between “smaller” and “larger”. The last pair sits at the end of the row. Code that is right in general also often trips on extreme inputs, so those are worth checking too: an empty list, a single element, a list of identical values. Here is what the proof predicts for each `[proof]`. Each prediction has also been checked by running the code:

- `[]`: `permutations([])` yields one empty tuple, which passes: returns `[]`, 0 comparisons.
- `[x]`: returns `[x]`, 0 comparisons.
- All equal, `[5, 5, 5]`: the first candidate passes after 2 comparisons.
- Already sorted: the first candidate passes after $n - 1$ comparisons.
- Duplicates, `[2, 1, 2]`: returns `[1, 2, 2]` after 3 candidates and 5 comparisons.

---

## 05 · Cost

So the algorithm is always right. That answers half of lesson 3’s question. The other half was how many comparisons it makes. The edge cases already show the count moving around. An already sorted input costs $n - 1$ comparisons. `[2, 1, 2]` costs 5, spread over 3 candidates. And §01 warned that for $n = 4$ we might have to check all 24 candidates. Before we can pin those numbers down, we have to decide what to count. The comparison model says comparisons. We’ll also count candidates. As we’re about to see, each candidate is cheap to check; what explodes is the *number* of candidates. (Generating each candidate also copies $n$ element references into a new tuple. Those moves aren’t comparisons, but they are real work.)

The best case is easy. Every run ends with a candidate that passes. A passing candidate always costs exactly $n - 1$ comparisons, because every one of its neighbour pairs gets checked. So every run costs at least $n - 1$. On sorted input the very first candidate passes, so the run costs exactly that. So $B(n) = n - 1$ for $n \ge 1$ `[proof]`.

The worst case takes more thought. Make a guess first.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

How many comparisons does permutation sort make on the reversed input `[4, 3, 2, 1]`?

*Your answer:* ______

<details>
<summary>Your prediction, compared</summary>

- **40** ✓ Yes, 40. The explanation below shows exactly where that number comes from.
- *If you answered 24:* 24 is the number of candidates, and here every one of them is examined. But each costs at least one comparison, and some cost two or three, so the total is more than 24.
- *If you answered 72:* 72 = 24 × 3 charges every candidate all 3 comparisons. But the check stops at the first pair that’s out of order, and most candidates fail at the first or second pair.
- *Any other answer:* Split it into two questions: how many candidates get examined, and how many comparisons does each one cost before it fails?

</details>

<details>
<summary><b>Reveal</b></summary>

Forty. Let’s see where that number comes from. We’ll get it in four steps, and along the way we’ll find a formula for every $n$.

*Step 1: which candidates get examined?* In `[4, 3, 2, 1]` the 1 sits at position 3, the 2 at position 2, the 3 at position 1 and the 4 at position 0. So the sorted arrangement 1, 2, 3, 4 is the position tuple (3, 2, 1, 0). That is the very last tuple in lexicographic order, so all 24 candidates are examined.

*Step 2: what does one candidate cost?* Take the candidate 2, 3, 1, 4. The check asks “is 3 < 2?” and gets “no”. Then it asks “is 1 < 3?” and gets “yes”, so it stops; the third question, about 1 and 4, is never asked. In general, the check asks its questions in order and stops at the first “yes”. Its $j$-th question compares positions $j - 1$ and $j$, for $j = 1, \ldots, n-1$. The check gets that far exactly when all the earlier questions answered “no”. With distinct keys, “no” to each of the first $j - 1$ questions means $b_0 < b_1 < \cdots < b_{j-1}$. So the $j$-th question is asked exactly when the first $j$ entries of the candidate are increasing. In 2, 3, 1, 4 the first two entries are increasing and the first three are not, so questions 1 and 2 are asked and question 3 is not.

*Step 3: add it up over all candidates.* Instead of adding up candidate by candidate, let’s add up question by question. On how many candidates is the $j$-th question asked? On those whose first $j$ entries are increasing. Let’s count them for $n = 4$ and $j = 2$ first. Choose which 2 of the 4 elements go first: $\binom{4}{2} = 6$ ways. Those two have to appear in increasing order, so there is just 1 way to place them. The other 2 elements can follow in any order: $2! = 2$ ways. That gives $6 \cdot 1 \cdot 2 = 12$ candidates, which is $4!/2!$. The same count works for any $n$ and $j$. Choose the $j$ elements that go first, in $\binom{n}{j}$ ways. Put them in increasing order, in 1 way. Put the rest in any order, in $(n-j)!$ ways. That’s $\binom{n}{j}(n-j)! = n!/j!$ candidates. Adding over all the questions:

$$
T(n) \;=\; \sum_{j=1}^{n-1} \frac{n!}{j!}.
$$

<div align="right"><code>[proof]</code></div>

Read it back: the $j$-th term counts the candidates that survive long enough to be asked their $j$-th question. For $n = 4$, all 24 candidates are asked question 1, 12 of them get as far as question 2, and 4 get as far as question 3. That adds up to $24 + 12 + 4 = 40$, the number in the prediction. For $n = 3$ the formula gives $6/1 + 6/2 = 9$.

*Step 4: could some other input be even worse?* No. Take any input of distinct elements, say `[2, 3, 1, 4]`. Its candidates are the 24 arrangements of its own values. Step 3’s count never used which values they were, only that they are distinct. So checking *all* 24 of them would cost 40 comparisons here too, and in general $T(n)$, whatever the input. But each input stops at its sorted arrangement, somewhere along that sequence, so it checks only part of it. So every input costs at most $T(n)$. The reversed input is the one that stops at the very end, so it costs exactly $T(n)$.

</details>

> **Theorem 2 (exact cost)**
>
> With distinct keys, permutation sort makes $B(n) = n - 1$ comparisons in the best case (sorted input) and $W(n) = T(n) = \sum_{j=1}^{n-1} n!/j!$ in the worst case (reversed input). Moreover $T(n) < 2 \cdot n!$.

> **Proof**
>
> The best and worst cases were derived above. For the bound, write $T(n) = n!\,\bigl(\tfrac{1}{1!} + \tfrac{1}{2!} + \cdots + \tfrac{1}{(n-1)!}\bigr)$. Since $j! \ge 2^{j-1}$ (each of the factors $2, \ldots, j$ is at least 2), each term is at most $1/2^{j-1}$, and the bracket is less than $1 + \tfrac12 + \tfrac14 + \cdots = 2$. ∎

Read that back, because it’s surprising. $T(n) < 2 \cdot n!$ means that checking costs **fewer than two comparisons per candidate**, on average over the candidates. For $n = 4$ it is 40 comparisons for 24 candidates. Most candidates fail at the very first or second neighbour pair. The explosion comes entirely from the number of candidates.

<details>
<summary><b>Going deeper · The constant is e − 1</b></summary>

The bracket $\sum_{j \ge 1} 1/j!$ converges to $e - 1 \approx 1.71828$, because $e = \sum_{j \ge 0} 1/j!$. So $T(n)/n! \to e - 1$ `[proof sketch]`. Table 2 shows the ratio agreeing with $e - 1$ to four decimals by $n = 8$.

</details>

**Table 2.** *Exact counts `[proof]`. Computed from the formula and checked against the instrumented Python for n ≤ 8.*

| n | n! | T(n) | T(n)/n! | n(n−1)/2 |
|---|---|---|---|---|
| 1 | 1 | 0 | 0 | 0 |
| 2 | 2 | 2 | 1.0000 | 1 |
| 3 | 6 | 9 | 1.5000 | 3 |
| 4 | 24 | 40 | 1.6667 | 6 |
| 5 | 120 | 205 | 1.7083 | 10 |
| 6 | 720 | 1 236 | 1.7167 | 15 |
| 7 | 5 040 | 8 659 | 1.7181 | 21 |
| 8 | 40 320 | 69 280 | 1.7183 | 28 |
| 9 | 362 880 | 623 529 | 1.7183 | 36 |
| 10 | 3 628 800 | 6 235 300 | 1.7183 | 45 |

To feel the scale: $T(20) \approx 4.18 \times 10^{18}$. At a billion comparisons per second (an assumed rate, not a measurement), that’s about 132 years. And that is to sort just 20 numbers.

**Fig. 2.** *Comparisons against n, with a logarithmic vertical axis. Three series: the exact worst case $T(n)$ `[proof]`; the mean over sampled random inputs, with the range from smallest to largest `[empirical]`; and, for reference, the number of pairs $n(n-1)/2$.*

#### Checkpoint 1

**Q1.** How many comparisons does permutation sort make on `[2, 1, 3]`?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

There are two things to find: which candidates get examined before the search stops, and how many questions each one is asked.

</details>

<details>
<summary>Hint 2</summary>

The position tuples (0,1,2), (0,2,1), (1,0,2) give the candidates (2, 1, 3), (2, 3, 1), (1, 2, 3), and the third one is sorted. For each, ask the neighbour questions in order and stop at the first “yes”.

</details>

<details>
<summary>Answer and feedback</summary>

- **5** ✓ Yes, 5. The first candidate, (2, 1, 3), fails at its first pair (1 comparison); the second, (2, 3, 1), fails at its second pair (2); and the third, (1, 2, 3), passes after both of its pairs are checked (2). That’s 1 + 2 + 2.
- *If you answered 3:* 3 is the number of candidates examined, not the number of comparisons. Each candidate costs at least one comparison, and some cost two.
- *If you answered 2:* 2 is what the final, passing candidate costs on its own. The two candidates rejected before it cost comparisons too.
- *If you answered 6:* That charges every candidate both of its comparisons. But the check stops at the first pair that’s out of order, and the very first candidate, (2, 1, 3), is out of order at its first pair.
- *If you answered 9:* 9 is the worst case for $n = 3$, when all 6 candidates are examined. Here the sorted arrangement turns up third, so the search stops long before that.
- *Any other answer:* List the candidates in the order `permutations` generates them; by positions that is (0,1,2), (0,2,1), (1,0,2), and so on. Count the questions each one is asked, and stop at the first sorted one.

</details>

<details>
<summary>Worked solution</summary>

Let’s walk through the candidates in the order `permutations` produces them, counting the questions as they’re asked.

1. Positions (0,1,2) give (2, 1, 3). Is 1 < 2? Yes, out of order: fail. **1 comparison.**
2. Positions (0,2,1) give (2, 3, 1). Is 3 < 2? No. Is 1 < 3? Yes: fail. **2 comparisons.**
3. Positions (1,0,2) give (1, 2, 3). Is 2 < 1? No. Is 3 < 2? No. Every pair is in order: pass, and the algorithm returns [1, 2, 3]. **2 comparisons.**

Total: 1 + 2 + 2 = 5. Each tempting wrong answer counts only part of the picture. 3 counts the candidates. 2 counts only the last candidate. 6 charges both questions to every candidate, but the first candidate stops after one. And 9 is the worst case for $n = 3$, which needs all six candidates.

</details>

**Q2.** `[2, 3, 4, 1]` and `[1, 4, 3, 2]` each have exactly 3 out-of-order pairs. Permutation sort examines 19 candidates on the first and 6 on the second. Why so different?

- **(a)** The cost depends on where the sorted arrangement falls in the generation order, not on how disordered the input is.
- **(b)** The first input has more disorder.
- **(c)** The second input is closer to sorted, so the check passes sooner.
- **(d)** Random variation.

<details>
<summary>Hint 1</summary>

The algorithm doesn’t improve the input step by step. It runs through a fixed list of candidates. So what decides when it stops?

</details>

<details>
<summary>Hint 2</summary>

Write each input’s sorted arrangement as a tuple of positions. In `[2, 3, 4, 1]` the smallest value sits at position 3, the next at position 0, and so on. Where does each tuple come in lexicographic order?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. The search runs through the same fixed list of position tuples every time, and it stops at the sorted arrangement. So the count is just the place where the sorted arrangement comes in that list. For `[2, 3, 4, 1]` it is (3, 0, 1, 2), number 19; for `[1, 4, 3, 2]` it is (0, 3, 2, 1), number 6.
- **(b)** ✗. Count them: both have exactly 3 out-of-order pairs, (2, 1), (3, 1), (4, 1) in the first and (4, 3), (4, 2), (3, 2) in the second. Equal disorder can’t explain unequal costs. In fact, this algorithm never measures disorder at all.
- **(c)** ✗. That would be true of an algorithm that repairs the input bit by bit. This one doesn’t build on the input’s order at all. It generates arrangements in a fixed sequence and checks each one from scratch. The input decides only one thing: where in that sequence the sorted arrangement appears.
- **(d)** ✗. Nothing here is random: `permutations` always produces the same sequence, and each check gives the same answers every time. Run it twice on the same input and you get exactly the same count.

</details>

<details>
<summary>Worked solution</summary>

Permutation sort stops at the first candidate that passes, and that is the sorted arrangement. So the number of candidates it examines is simply the place where the sorted arrangement comes in the generation order, the lexicographic order of position tuples.

- `[2, 3, 4, 1]`: the values 1, 2, 3, 4 sit at positions 3, 0, 1, 2, so the sorted arrangement is the tuple (3, 0, 1, 2). Every tuple that starts with 0, 1 or 2 comes before it: 6 of each, 18 in all. Then (3, 0, 1, 2) is the first tuple that starts with 3: number 19.
- `[1, 4, 3, 2]`: the values 1, 2, 3, 4 sit at positions 0, 3, 2, 1, giving (0, 3, 2, 1). That is the last of the six tuples that start with 0: number 6.

So (a) is the reason. The two inputs have equal disorder, which rules out (b). (c) assumes the algorithm builds on the input’s order, and it never does. And nothing in the process is random, so (d) is out too.

</details>

**Q3.** Build an input of 4 distinct numbers on which permutation sort examines **exactly 7** candidates.

*Type your answer in the interactive version of this page; the checker explains every answer.* (Input format, for example: `e.g. 7 3 9 5`.)

<details>
<summary>Hint 1</summary>

The search stops at the sorted arrangement. So ask: where in the generation order must the sorted arrangement come for the search to stop at candidate 7?

</details>

<details>
<summary>Hint 2</summary>

The order is lexicographic in the position tuples. How many tuples start with 0? So which tuple is 7th, and what does its first entry say about where the smallest number must sit?

</details>

<details>
<summary>Worked solution</summary>

Permutation sort examines candidates until the first sorted one, so it examines exactly 7 when the sorted arrangement is the 7th position tuple in lexicographic order. Let’s list the start of that order. The six tuples that begin with 0 come first: (0,1,2,3), (0,1,3,2), (0,2,1,3), (0,2,3,1), (0,3,1,2), (0,3,2,1). The 7th is the first tuple that begins with 1: (1, 0, 2, 3).

That tuple builds the candidate $(a_1, a_0, a_2, a_3)$. We need this candidate to be the sorted one: $a_1 < a_0 < a_2 < a_3$. So put the smallest number at position 1, the second smallest at position 0, and the two largest at positions 2 and 3, in increasing order. For example, `[2, 1, 3, 4]` gives 7 candidates and 14 comparisons. Every input with that pattern works. Any other pattern puts the sorted arrangement at a different place in the list, so it gives a different count.

A common first try is an input that looks “a little disordered”, such as `[1, 2, 4, 3]`. That one needs only 2 candidates. What matters is where the sorted arrangement sits in the list, not how disordered the input looks.

</details>

---

## 06 · What it knows, and what it wastes

The cost is absurd: about 132 years to sort twenty numbers. But why, exactly? Where does all that work go? Not into checking each candidate: by Theorem 2, that’s fewer than two comparisons per candidate. The trouble is the sheer number of candidates, and that raises a suspicion. Four items have only 6 different pairs to ask about, yet on `[4, 3, 2, 1]` the algorithm asks 40 questions. So it is asking about the same pairs again and again. In general there are only $n(n-1)/2$ pairs, and Table 2 shows the number of questions racing far past that. The trace in §03 already showed the repeats on a small scale: six questions about three pairs.

Repeats are easy to count, but they aren’t the whole story. A question about a brand-new pair can still teach nothing, because its answer follows from earlier ones. Once the algorithm has seen $1 < 2$ and $2 < 3$, asking about 1 and 3 is pointless: it already knows the answer, $1 < 3$. So counting repeated pairs won’t tell us how much of the work is really wasted. For that we need to say precisely what the algorithm *knows* at each moment. Let’s start with an experiment, on an input small enough that we can track everything the algorithm has learned.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

On `[2, 3, 1]`, permutation sort makes 7 comparisons. After how many of them does it have enough information to determine the sorted order? Step through Fig. 1 with the preset `[2, 3, 1]` if you like.

*Your answer:* ______

<details>
<summary>Your prediction, compared</summary>

- **3** ✓ Yes, after just 3. The other 4 comparisons tell it nothing new; the explanation below shows why.
- *If you answered 7:* 7 is when it *stops*, but stopping and knowing aren’t the same thing. Watch the diagram in Fig. 1: at which comparison does it become a single chain?
- *If you answered 2:* Close. After 2 comparisons it knows 2 < 3 and 1 < 3. It doesn’t yet know how 1 and 2 compare, so two orders are still possible: 1, 2, 3 and 2, 1, 3.
- *Any other answer:* Keep track of which pairs have been compared, and what follows from those answers by transitivity. When is every pair settled?

</details>

<details>
<summary><b>Reveal</b></summary>

The first three questions are 3 < 2? (no), 1 < 3? (yes), 1 < 2? (yes). After them the algorithm knows 1 < 2 < 3, the whole order. But it keeps going. It examines (3, 2, 1) and (3, 1, 2), two candidates that contradict what it already knows: both put 3 first. Then it checks (1, 2, 3). Along the way it asks four more questions, and it already had the answer to every one of them.

</details>

So stopping and knowing really are different things. On `[2, 3, 1]` the algorithm knew the answer after 3 comparisons and stopped after 7. To measure that gap on every input, we have to say exactly what “knows” means. Each comparison hands the algorithm one fact, $x < y$ or $y < x$; on `[2, 3, 1]` the first fact was $2 < 3$. And facts combine. From $1 < 2$ and $2 < 3$ the algorithm can conclude $1 < 3$ without asking; that step is transitivity. Those two sources, the answers and what transitivity adds to them, are all it ever learns from. In the comparison model it can’t look at the elements themselves (lesson 3, §03).

Lesson 1 already gave us the right object to hold that kind of information. Take a set of facts “$x$ before $y$” and add everything transitivity gives. The result is a strict partial order. It can’t contain a cycle, because all the facts are true of one real input. Lesson 1 drew such orders as Hasse diagrams. The arrangements that agree with a partial order $P$ are its linear extensions, and there are $e(P)$ of them. After two comparisons on `[2, 3, 1]`, the facts are $2 < 3$ and $1 < 3$. That partial order has two linear extensions, 1, 2, 3 and 2, 1, 3, and those are exactly the two orders the algorithm can’t yet tell apart. So here’s a natural guess: what the algorithm knows *is* a partial order, and the inputs it can’t yet rule out are its linear extensions. In fact, Fig. 1 has been drawing that partial order under the stepper all along.

Before trusting the guess, though, there’s a worry from the other side. Could the facts settle some pair even when no chain of facts links its two elements? Some cleverer argument than transitivity might do it. Then the algorithm would know more than $P$, and a comparison that looks useful could turn out to have a known answer. The theorem below settles both points. Part (a) confirms the guess. Part (b) removes the worry: when two elements are unrelated in $P$, their order really can still go either way.

> **Theorem 3 (knowledge is a partial order)**
>
> Let $O$ be the outcomes of the comparisons made so far on some input with distinct keys, and $P$ the strict partial order they generate (their transitive closure). Then:
>
> (a) the inputs (rank patterns) that would have produced exactly these outcomes are those whose sorted order is a linear extension of $P$; there are $e(P)$ of them;
>
> (b) if $x$ and $y$ are unrelated in $P$, some input consistent with $O$ has $x < y$ and another has $y < x$.

> **Proof**
>
> (a) A rank pattern is a strict total order on the elements. It produces the observed outcomes exactly when it agrees with every outcome in $O$. A total order is transitive, so agreeing with $O$ is the same as agreeing with everything $O$ implies, that is, with $P$; and a total order agreeing with $P$ is precisely one whose sorted arrangement is a linear extension of $P$.
>
> (b) Adding $x \prec y$ to $P$ creates no cycle, because a cycle through the new pair would need $y \prec x$ in $P$ already. By lesson 1, Corollary 6, some linear extension puts $x$ before $y$. Symmetrically, some puts $y$ before $x$. By (a), both are consistent inputs. ∎

Let’s read it back. At any moment, the algorithm’s knowledge **is** a partial order $P$. $P$ holds the facts it has observed plus what transitivity adds, and by part (b) the algorithm knows nothing beyond $P$. By part (a), the number of inputs it still can’t rule out is $e(P)$. It can be certain of the sorted order exactly when $e(P) = 1$, that is, when $P$ has become a total order. On `[2, 3, 1]`, $e(P)$ starts at 6 and drops to 3, then 2, then 1 over the first three comparisons.

The theorem also tells wasted questions apart from useful ones. Suppose the answer to a comparison is already in $P$, either because the pair was asked before or because transitivity gives it. Then the comparison can’t change $P$ at all: it teaches nothing. The four questions after the third one on `[2, 3, 1]` were all like that. Now suppose the two elements are unrelated in $P$. By part (b), either answer is still possible. So whichever answer comes back rules out at least one input that was still possible, and the comparison teaches something.

This way of looking at an algorithm is the **knowledge lens**. It is a lens because we will look through it at every algorithm in turn, and it will be the main lens of this course. For every algorithm we meet, we’ll ask: what partial order does it hold, what shape is it, and does each comparison change it?

Through this lens we can now say exactly how permutation sort wastes its effort. There are two ways:

- **It asks questions it can already answer.** On the reversed input `[4, 3, 2, 1]` it makes 40 comparisons, but only $\binom{4}{2} = 6$ pairs exist. So at least 34 of its comparisons ask about a pair it has already asked about. It knows the full order after comparison 24, and keeps going for 16 more.
- **It tests candidates its knowledge has already ruled out.** On `[2, 3, 1]` it knew the answer after 3 comparisons. It still went on to check two candidates that contradicted that answer.

In short, the algorithm treats each candidate as a brand-new question. Whatever it learned from the candidates before, it forgets.

#### Checkpoint 2

**Q4.** After some comparisons, the algorithm knows $a < c$, $b < c$ and $b < d$, and nothing else (four elements). Which comparison would teach it nothing?

- **(a)** $a$ vs $b$
- **(b)** $c$ vs $d$
- **(c)** $b$ vs $c$
- **(d)** $a$ vs $d$

<details>
<summary>Hint 1</summary>

A comparison teaches nothing exactly when its answer is already certain. For which pair can you already say the answer from the three facts?

</details>

<details>
<summary>Hint 2</summary>

For each option, look for a chain of known facts from one element to the other, like $x < y < z$. If there is one, the answer is known. If there isn’t, Theorem 3(b) says it could still go either way.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. No fact mentions both $a$ and $b$, and no chain of facts leads from one to the other. So they are unrelated in what’s known. By Theorem 3(b), either answer is still possible: abcd puts $a$ first, and bacd puts $b$ first. So this comparison would teach something.
- **(b)** ✗. $c$ and $d$ both sit above $b$, but nothing says which of the two is higher. Some consistent orders put $c$ first (abcd) and others put $d$ first (abdc), so the answer is genuinely unknown.
- **(c)** ✓ correct. Yes. $b < c$ is one of the facts already known, so the answer is certain before you ask. Every order still possible already has $b$ before $c$, so asking can’t rule any of them out.
- **(d)** ✗. Tempting, since $a$ and $d$ both appear in the facts. But no chain links them: $a < c$ and $b < d$ say nothing about $a$ versus $d$. Both abcd ($a$ first) and bdac ($d$ first) fit everything known. (These facts are lesson 1’s tasks poset.)

</details>

<details>
<summary>Worked solution</summary>

By Theorem 3, the algorithm already knows the answer to “$x$ vs $y$” exactly when $x$ and $y$ are related in $P$. That means a chain of known facts leads from one to the other. Here the facts are $a < c$, $b < c$ and $b < d$, and they don’t chain into anything longer. To extend $a < c$, for instance, we would need a fact that starts at $c$, like $c < d$. But every fact starts at $a$ or $b$. So the related pairs are exactly those three.

- (a) $a$ vs $b$: no chain. Consistent orders include abcd ($a$ first) and bacd ($b$ first).
- (b) $c$ vs $d$: no chain. abcd has $c$ first, abdc has $d$ first.
- (d) $a$ vs $d$: no chain. abcd has $a$ first, bdac has $d$ first.
- (c) $b$ vs $c$: $b < c$ is a known fact. All five orders still possible put $b$ before $c$, so the answer removes none of them.

Only (c) teaches nothing. It isn’t enough for both elements to appear somewhere in the facts, as $a$ and $d$ do. What settles a pair is an actual chain of facts from one to the other.

</details>

**Q5.** In the situation of Q4, how many orderings of the four elements are still possible?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

By Theorem 3(a), the orderings still possible are the linear extensions of what’s known. Lesson 1’s question counts them: which elements could go first?

</details>

<details>
<summary>Hint 2</summary>

$c$ can’t go first, because $a$ and $b$ are known to be below it. $d$ can’t go first, because $b$ is below it. So $a$ or $b$ goes first. If $a$ goes first, the next one has to be $b$, since $c$ and $d$ both have $b$ below them. If $b$ goes first, what could come next?

</details>

<details>
<summary>Answer and feedback</summary>

- **5** ✓ Yes, $e(P) = 5$: abcd, abdc, bacd, badc and bdac. It’s lesson 1’s tasks poset again, and these are the same five orders lesson 1 found.
- *If you answered 24:* 24 is every ordering of four elements, as if nothing were known. But each known fact rules orderings out: by Theorem 3(a), only the linear extensions of the known partial order remain.
- *If you answered 3:* 3 is the number of pairs still undecided ($a$ and $b$, $c$ and $d$, $a$ and $d$), not the number of orders. Each of those pairs can still go either way, and different combinations give different orders. So count the orders directly: which element can go first?
- *Any other answer:* Count the linear extensions of a ≺ c, b ≺ c, b ≺ d (lesson 1, Fig. 3). Ask which elements can go first, then which can go next, and so on.

</details>

<details>
<summary>Worked solution</summary>

Theorem 3(a) says the orderings still possible are exactly the linear extensions of a ≺ c, b ≺ c, b ≺ d. Let’s count them with lesson 1’s question: which element can go first? $c$ can’t, because $a$ and $b$ are known to be smaller. $d$ can’t, because $b$ is known to be smaller. That leaves $a$ or $b$, and either can go first, since no fact puts anything below them.

- **$a$ first.** Next only $b$ can go, because $c$ and $d$ both need $b$ before them. Then $c$ and $d$ are both free, in either order: abcd, abdc. That’s 2.
- **$b$ first.** Next $a$ or $d$ can go ($c$ still needs $a$). After b, a: $c$ and $d$ in either order, giving bacd and badc. After b, d: only $a$ can go, then $c$, giving bdac. That’s 3.

Total: 2 + 3 = 5. Answering 24 ignores what’s known. Answering 3 counts the undecided pairs, not the orders they lead to.

</details>

---

## 07 · Remember what you learn

The waste points straight at a fix: never ask a question whose answer you already know. Following that advice perfectly means keeping track of everything transitivity gives, and that takes some machinery. So let’s start with a blunter version, which cures only the most visible waste, the repeats. Ask about every pair exactly once. On `[4, 3, 2, 1]` that means 6 questions instead of 40. This version still asks some questions whose answers transitivity has already supplied; we’ll come back to those at the end of this section. But it is already enough to finish the job. With distinct keys, every pair comes out one way or the other. So once every pair has been asked, the algorithm knows the whole strict total order, and $e(P) = 1$. All that’s left is bookkeeping: turning that knowledge into the one sorted arrangement.

How do we turn “all pairs known” into an arrangement? Look at the answer we’re aiming for. Take `[3, 1, 2]` again, whose sorted answer is 1, 2, 3. The 1 has no smaller element, and it sits at position 0. The 2 has one smaller element, and it sits at position 1. The 3 has two, and it sits at position 2. The same holds in general. By lesson 1, Theorem 7, the sorted arrangement is $x_0 \prec x_1 \prec \cdots \prec x_{n-1}$. The element at position $r$ has exactly $r$ elements before it, all smaller, and all the others after it, all larger. So an element’s position is simply the number of elements smaller than it. That number is its **rank**.

We can compute the ranks by letting every pair award a point to its larger element. On `[3, 1, 2]`, the pair 3, 1 gives a point to 3, the pair 3, 2 gives another point to 3, and the pair 1, 2 gives a point to 2. So 3 ends with 2 points, 2 with 1 point and 1 with none: exactly their positions in 1, 2, 3.

**Listing 2.** *Ask every pair once; place each element by its rank.*

```python
def rank_sort(a):
    n = len(a)
    rank = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if a[j] < a[i]:      # one comparison per pair; the larger element earns a point
                rank[i] += 1
            else:
                rank[j] += 1
    b = [None] * n
    for i in range(n):
        b[rank[i]] = a[i]
    return b
```

Why the `else`? With distinct keys, if $a_j < a_i$ is false, then $a_i < a_j$. So the `else` gives the point to $a_j$, which is the larger of the two, and each pair awards exactly one point, to its larger element.

> **Invariant (after the double loop)**
>
> `rank[i]` equals the number of elements $a_j$ with $a_j < a_i$.

> **Theorem 4 (comparison counting)**
>
> With distinct keys, `rank_sort` returns the sorted permutation of `a` and makes exactly $n(n-1)/2$ comparisons on every input.

> **Proof**
>
> Each pair $\{i, j\}$ is compared exactly once and gives one point to its larger element, which proves the invariant. If $x < y$, everything smaller than $x$ is also smaller than $y$, and so is $x$ itself; so rank($x$) < rank($y$). Hence the $n$ ranks are distinct numbers in $\{0, \ldots, n-1\}$, so they are exactly $0, \ldots, n-1$: every slot of `b` is written exactly once, which makes `b` a permutation of `a`. And smaller elements get smaller positions, so `b` is sorted. The comparison count is the number of pairs, $\binom{n}{2}$, whatever the input. ∎

Knuth calls this **comparison counting**, because each element finds its place by counting the comparisons it wins. Now compare the two algorithms. For $n = 10$, permutation sort’s worst case is 6 235 300 comparisons. Comparison counting always uses 45. That whole gap comes from one change: comparison counting keeps what each answer told it, so it never needs to ask the same pair twice.

Before celebrating, there’s one loose end. In §04 we proved that permutation sort stays correct with ties. Theorem 4, though, assumed distinct keys. So did the explanation of the `else`, which relied on “if $a_j < a_i$ is false, then $a_i < a_j$”. For a tied pair, say 5 and 5, that step fails: 5 < 5 is false both ways round. So what does the `else` do on a tie, and does the algorithm survive it? Make a prediction.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

What does `rank_sort([5, 5, 5])` return?

- **(a)** `[5, 5, 5]`
- **(b)** `[5, None, None]`
- **(c)** It raises an `IndexError`.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✓ correct. Yes, `[5, 5, 5]`, and correctly so. The explanation below shows why the ties do no harm.
- **(b)** ✗. That’s what a tempting “more careful” version returns, the one that gives no point on a tie. Listing 2’s `else` behaves differently, and the explanation below shows how.
- **(c)** ✗. A reasonable worry, but every rank stays between 0 and $n - 1$, so no index goes out of range. The explanation below shows what happens instead.

</details>

<details>
<summary><b>Reveal</b></summary>

It returns `[5, 5, 5]`, correctly. Here’s why. Take the tied pair at positions 0 and 1. The test `a[1] < a[0]` asks “is 5 < 5?”, which is false, so the `else` hands the point to `a[1]`, the *later* element. The same happens for the pairs at positions 0 and 2 and at positions 1 and 2. So the ranks come out as 0, 1, 2. In general, for a tied pair $i < j$, `a[j] < a[i]` is false, and the point goes to `a[j]`. In effect, ties are broken by position. The code is really ranking by the pair (key, position), and by lesson 2, Theorem 2, that is a strict total order. So the ranks are still all different, and the proof goes through unchanged. As a bonus, tied elements keep their input order. Lesson 7 will call that property stability.

Now look at a tempting “more careful” version, which gives no point to either element on a tie:

```python
if a[j] < a[i]:
    rank[i] += 1
elif a[i] < a[j]:
    rank[j] += 1
```

On `[5, 5, 5]` all the ranks stay 0. Every element is written into `b[0]`, and the result is `[5, None, None]`, which isn’t even a permutation. The proof fails at the step “the ranks are distinct”. So the `else` was never a shortcut: it is the rule that breaks ties.

</details>

With ties broken by position, comparison counting is correct on every input. Now back to the compromise we made at the start of this section. Asking each pair once removes the repeats. But comparison counting never uses transitivity: it asks about every pair, even when the answer follows from earlier ones. Look at a sorted input of 4 elements, say `[1, 2, 3, 4]`. The three neighbour questions give $1 < 2$, $2 < 3$ and $3 < 4$. Those three answers already prove the whole order (lesson 1, Lemma 8). The other three answers, about 1 and 3, 1 and 4, and 2 and 4, just follow from them. So are all $n(n-1)/2$ questions really needed? And how few could possibly be enough? That’s where lesson 5 begins.

---

## 08 · In Python

Before we take that question to lesson 5, let’s make sure of the numbers that raised it. Every count in this lesson was worked out by hand, from the 40 comparisons on `[4, 3, 2, 1]` to comparison counting’s 45 for ten elements. You shouldn’t have to take any of them on trust. Here are both algorithms again, this time instrumented: each one returns its output together with the number of comparisons it made. So you can check every comparison count yourself. (The counts of what the algorithm *knows*, such as “the whole order after comparison 24”, come from the knowledge view in Fig. 1.)

**Listing 3.** *Both algorithms, instrumented: each returns its output and the number of comparisons it made.*

```python
from itertools import permutations

def permutation_sort_counted(a):
    comparisons = 0
    for candidate in permutations(a):
        ok = True
        for i in range(len(candidate) - 1):
            comparisons += 1
            if candidate[i + 1] < candidate[i]:
                ok = False
                break
        if ok:
            return list(candidate), comparisons

def rank_sort_counted(a):
    n = len(a)
    rank = [0] * n
    comparisons = 0
    for i in range(n):
        for j in range(i + 1, n):
            comparisons += 1
            if a[j] < a[i]:
                rank[i] += 1
            else:
                rank[j] += 1
    b = [None] * n
    for i in range(n):
        b[rank[i]] = a[i]
    return b, comparisons

print(permutation_sort_counted([4, 3, 2, 1]))   # ([1, 2, 3, 4], 40)
print(rank_sort_counted([4, 3, 2, 1]))          # ([1, 2, 3, 4], 6)
```

In practice you wouldn’t sort with either one: you’d call `sorted(a)`. Permutation sort is a baseline: it shows sorting as a search among $n!$ candidates. Comparison counting is occasionally useful when $n$ is tiny and you need each element’s rank anyway, and its stable tie-breaking is a plus. Both are stepping stones. Permutation sort shows that a correct sort is easy to come by. Comparison counting shows that remembering answers brings the worst case down from about $1.7 \cdot n!$ comparisons to $n(n-1)/2$: for ten elements, from 6 235 300 to 45. How much further the cost can fall is the question §07 left open.

---

## Exercises

**E1.** With this `is_sorted`, `permutation_sort([2, 1, 2])` returns `None`. Click the faulty line.

```python
 1  def is_sorted(b):
 2      for i in range(len(b) - 1):
 3          if not b[i] < b[i + 1]:
 4              return False
 5      return True
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

The input has a tie. Take the candidate that really is sorted, (1, 2, 2), and ask: does this function accept it?

</details>

<details>
<summary>Hint 2</summary>

Follow (1, 2, 2) through the loop. At $i = 1$ the pair is (2, 2). What does line 3 conclude about two equal neighbours?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 3** ✓ Yes, line 3. It demands that each neighbour pair be *strictly* increasing, so two equal neighbours fail. In any sorted arrangement of `[2, 1, 2]` the two 2s sit side by side. So no candidate passes, and the loop in `permutation_sort` runs out. The function then falls off its end and returns `None`. The right test asks whether a pair is *out of order*: `if b[i + 1] < b[i]:`.
- *If you picked line 2:* Line 2 is fine: `range(len(b) - 1)` gives $i = 0, \ldots, n-2$, so the pairs $(i, i+1)$ cover every neighbour pair exactly once. The trouble is in what gets asked about each pair.
- *If you picked line 4:* Returning `False` when a pair fails the test is the right reaction. The question is whether the pair should have failed in the first place, so look at the test itself.
- *If you picked line 5:* Returning `True` once every neighbour pair has passed is exactly right. On `[2, 1, 2]` no candidate even gets this far. Something earlier rejects them all.
- *Any other line:* That line is fine. Follow the candidate (1, 2, 2), which *is* sorted: at which line does it get rejected, and why?

</details>

<details>
<summary>Worked solution</summary>

A sorted arrangement of `[2, 1, 2]` exists: (1, 2, 2). So if the function returns `None`, the check is rejecting even that one. Let’s trace `is_sorted((1, 2, 2))` line by line.

1. Line 2: $i = 0$. Line 3: is 1 < 2? Yes, so `not` makes the condition false, and the loop carries on.
2. Line 2: $i = 1$. Line 3: is 2 < 2? No, so `not` makes the condition true. Line 4: return `False`.

The sorted candidate is rejected because of its two equal neighbours. The other candidates fail too, at $i = 0$: (2, 1, 2) because 2 < 1 is false, and (2, 2, 1) because 2 < 2 is false. `permutations` yields each of these three twice, so all six candidates fail. The `for` loop in `permutation_sort` ends without returning, and Python returns `None`.

So line 3 is the culprit. It asks “is this pair strictly increasing?”, and equal neighbours aren’t. The right question is “is this pair out of order?”, `if b[i + 1] < b[i]:`. That test lets equal neighbours through (lesson 1, Lemma 11). With distinct keys the two tests agree, which is why the bug hides until a tie appears. Lines 2, 4 and 5 are correct: the loop visits every neighbour pair, a failing pair should return `False`, and a candidate that passes every pair should return `True`.

</details>

**E2.** This version of comparison counting returns `[5, None, None]` on `[5, 5, 5]`. Click the line that causes it.

```python
 1  def rank_sort(a):
 2      n = len(a)
 3      rank = [0] * n
 4      for i in range(n):
 5          for j in range(i + 1, n):
 6              if a[j] < a[i]:
 7                  rank[i] += 1
 8              elif a[i] < a[j]:
 9                  rank[j] += 1
10      b = [None] * n
11      for i in range(n):
12          b[rank[i]] = a[i]
13      return b
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

The output has `None`s, so some slots of `b` were never written. That happens when two elements get the same rank. Where could equal ranks come from?

</details>

<details>
<summary>Hint 2</summary>

Take the pair $i = 0$, $j = 1$ of `[5, 5, 5]`. Is 5 < 5? Then which of lines 7 and 9 runs?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 8** ✓ Yes, line 8. On a tie neither test is true. So neither line 7 nor line 9 runs, and the pair awards no point at all. Tied elements end up with equal ranks and get written into the same slot of `b`. There they overwrite each other, and the slots left over stay `None`. With a plain `else:` the later element of a tied pair gets the point, and the ranks come out all different.
- *If you picked line 6:* Line 6 is right: if $a_j < a_i$, then $a_i$ is the larger of the pair and earns the point. The trouble is what happens when this test is false.
- *If you picked line 9:* Line 9 does the right thing whenever it runs: it gives the point to `a[j]`, the larger element. The question is *when* it runs, and on `[5, 5, 5]` it never does.
- *If you picked line 10:* Starting `b` full of `None` is fine, as long as every slot gets written later. The `None`s you see are slots where no element was placed. So ask why two elements landed in the same slot.
- *If you picked line 12:* Placing each element at `b[rank[i]]` is right *provided* the ranks are all different. On `[5, 5, 5]` they are all 0. Where should the difference between them have come from?
- *Any other line:* That line is fine. Trace `[5, 5, 5]`: for each pair $(i, j)$, which branch runs, and what are the ranks at the end?

</details>

<details>
<summary>Worked solution</summary>

Let’s trace `rank_sort([5, 5, 5])`. Lines 2–3 set $n = 3$ and `rank = [0, 0, 0]`. Then the double loop visits three pairs:

1. $i = 0$, $j = 1$: line 6, is 5 < 5? No. Line 8, is 5 < 5? No. Neither line 7 nor line 9 runs: no point.
2. $i = 0$, $j = 2$: the same, no point.
3. $i = 1$, $j = 2$: the same, no point.

So `rank` is still `[0, 0, 0]`. Line 10 makes `b = [None, None, None]`, and lines 11–12 write `b[0] = 5` three times. Slots 1 and 2 are never touched, and the result is `[5, None, None]`.

Placing by rank needs the ranks to be distinct; that is the step Theorem 4’s proof relies on. The line that made them equal is line 8: on a tie, it gives the point to nobody. Replace it with `else:`, and the three pairs give their points to `a[1]`, `a[2]` and `a[2]`. Then the ranks become `[0, 1, 2]`, and the result is `[5, 5, 5]`. Line 12 only looks guilty: placing by rank is correct whenever the ranks are distinct. And line 10’s `None`s are just slots that nobody wrote.

</details>

**E3.** Why is the reversed input a worst case for permutation sort?

- **(a)** Its sorted arrangement is the last one generated, and the total cost of checking all $n!$ candidates is the same $T(n)$ for every input.
- **(b)** It has the most out-of-order pairs.
- **(c)** Every candidate fails at the last neighbour pair.
- **(d)** Because $n!$ is the largest factorial.

<details>
<summary>Hint 1</summary>

Calling an input a worst case takes two facts: it costs a lot, and nothing costs more. Which option supplies both?

</details>

<details>
<summary>Hint 2</summary>

Where in the generation order does the reversed input’s sorted arrangement appear? And does the cost of checking *all* $n!$ candidates depend on the input?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes, and both halves matter. The first says the reversed input makes the search check every candidate. The second says checking every candidate costs the same $T(n)$ for any input. No input can cost more than checking everything. So the reversed input reaches the maximum.
- **(b)** ✗. It does have the most, but that isn’t why it’s worst here. This algorithm never measures disorder. Q2 showed two inputs with equal disorder and very different costs. What matters is where the sorted arrangement sits in the generation order.
- **(c)** ✗. Most candidates fail at the very first or second pair, not the last. That’s exactly why $T(n) < 2 \cdot n!$. For $n = 4$, only 4 of the 24 candidates even reach the third pair.
- **(d)** ✗. $n!$ is the number of candidates for *every* input of size $n$, so it can’t single out the reversed one. What changes from input to input is how many of those candidates get examined before the search stops.

</details>

<details>
<summary>Worked solution</summary>

To show that an input is a worst case we need two facts: what it costs, and that no input costs more.

1. *The reversed input checks every candidate.* Its sorted arrangement takes positions $(n-1, \ldots, 1, 0)$. That is the very last tuple in lexicographic order, so the search runs all the way to the end.
2. *Nothing can cost more.* For any input of distinct elements, the candidates are the $n!$ arrangements of its values. §05 showed that checking all of them costs $T(n) = \sum_{j=1}^{n-1} n!/j!$, whatever the input. Every input stops somewhere along that sequence, so it costs at most $T(n)$.

That’s option (a). Option (b) states something true about the reversed input, but it gives the wrong reason. Q2’s inputs `[2, 3, 4, 1]` and `[1, 4, 3, 2]` have equal disorder, yet they need 19 and 6 candidates. Option (c) is false: the $j$-th question is asked on only $n!/j!$ candidates, so most candidates fail at the first or second pair. Option (d) confuses the number of candidates, which is $n!$ for every input, with the number examined.

</details>

**E4.** How many comparisons does comparison counting make on any input of 10 elements?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Look at the loops in Listing 2. Does the number of comparisons depend on the answers, or only on $n$?

</details>

<details>
<summary>Hint 2</summary>

For $i = 0$, `j` runs from 1 to 9: that’s 9 comparisons. How many for $i = 1$, and so on down to $i = 9$?

</details>

<details>
<summary>Answer and feedback</summary>

- **45** ✓ Yes, 45. There is one comparison for each pair of positions $i < j$, and there are $\binom{10}{2} = 10 \cdot 9/2 = 45$ such pairs. It’s the same on every input, because the loops decide what to ask without looking at any answer.
- *If you answered 90:* 90 counts each pair twice, once as $(i, j)$ and once as $(j, i)$. But `j` starts at `i + 1`, so each pair is compared only once: half of 90.
- *If you answered 100:* 100 would let $i$ and $j$ both run over all 10 positions. The inner loop starts at $j = i + 1$. So no element is compared with itself, and each pair is visited only once.
- *If you answered 55:* Close, but 55 = 10 + 9 + ⋯ + 1 gives each $i$ one comparison too many. When $i = 0$, `j` runs from 1 to 9, which is 9 comparisons, not 10; and when $i = 9$ there are none.
- *If you answered 9:* $n - 1 = 9$ is what it costs to *check* a sorted input. Comparison counting doesn’t check. It asks about every pair, whatever the input.
- *Any other answer:* Count the pairs $(i, j)$ with $0 \le i < j \le 9$: how many comparisons does each value of $i$ contribute?

</details>

<details>
<summary>Worked solution</summary>

Each comparison is one execution of `if a[j] < a[i]`. The loop bounds never depend on the answers. So all we need is to count the $(i, j)$ pairs the loops visit.

- $i = 0$: $j = 1, \ldots, 9$, so 9 comparisons.
- $i = 1$: $j = 2, \ldots, 9$, so 8.
- And so on, one fewer each time, down to $i = 8$: $j = 9$ only, so 1; and $i = 9$: none.

Total: $9 + 8 + \cdots + 1 + 0 = 45 = \binom{10}{2}$, on every input of 10 elements. The tempting answers miscount the pairs. 90 counts each pair in both orders. 100 also includes $i = j$ and the repeats. And 55 gives each $i$ one comparison too many. And 9 is the cost of checking a sorted row, not of ranking every element.

</details>

**E5.** `is_sorted` compares only neighbours. Which earlier result guarantees that this is enough, even with ties?

- **(a)** Lesson 1, Lemma 11, because the comparison is a strict weak ordering.
- **(b)** Lesson 1, Lemma 8.
- **(c)** Lesson 1, Theorem 5.
- **(d)** Nothing: checking neighbours is always enough.

<details>
<summary>Hint 1</summary>

The words “even with ties” are the key. Which kind of order allows ties and still behaves well?

</details>

<details>
<summary>Hint 2</summary>

Lesson 1 proved the neighbour test twice: first for orders without ties, then again once ties were allowed. Which result was the second?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Lemma 11 says that for a strict weak ordering, “no neighbour pair out of order” is equivalent to “sorted”, ties included. That is exactly what `is_sorted` relies on. It’s also why lesson 2 insisted that a comparison keep its contract.
- **(b)** ✗. Close, but Lemma 8 is about strict total orders, where no two elements tie. The question says “even with ties”, and the result that covers ties is Lemma 11.
- **(c)** ✗. Theorem 5 says a sorted arrangement always exists: every finite partial order has a linear extension. That’s about existence, not about checking whether a given arrangement is sorted.
- **(d)** ✗. It isn’t always enough. For a partial order that isn’t a weak ordering, the neighbour check can fail. Take lesson 1’s tasks example: d, a, b, c passes every neighbour check. Yet it puts d before b, and b has to come before d. So the guarantee has to come from a property of the order.

</details>

<details>
<summary>Worked solution</summary>

`is_sorted` is correct only if “no neighbour pair is out of order” implies “the whole arrangement is sorted”. Lesson 1 proved that implication twice.

- Lemma 8 proved it for strict total orders, where any two distinct elements are related, so there are no ties.
- Lemma 11 extended it to strict weak orderings, where elements can tie by sitting in the same tier.

Since the question allows ties, the result we need is Lemma 11, option (a). It needs the comparison to really be a strict weak ordering, which is the contract lesson 2 asked every comparison to keep. Option (b), Lemma 8, is the right idea but doesn’t cover ties. Option (c), Theorem 5, is about whether a sorted arrangement exists, not how to check one. And (d) is false: for a general partial order the neighbour test can pass an invalid arrangement, as d, a, b, c did in lesson 1.

</details>

---

## Ledger

**Established**

- Permutation sort is correct for any strict weak ordering `[proof]` §04
- Its best case is $n - 1$ comparisons (sorted input) and its worst case is $T(n) = \sum_{j=1}^{n-1} n!/j! < 2 \cdot n!$ (reversed input) `[proof]`; $T(n)/n! \to e - 1$ `[proof sketch]` §05
- Its cost depends on where the answer sits in the generation order, not on how disordered the input is `[proof]` §05
- Knowledge theorem: after any comparisons, the algorithm’s knowledge is a partial order $P$; the inputs still possible are the $e(P)$ linear extensions; unrelated pairs can still go either way `[proof]` §06
- Comparison counting sorts with exactly $n(n-1)/2$ comparisons on every input, correctly with ties thanks to its tie-breaking by position `[proof]` §07

**Assumptions in force**

- Comparison model; cost = comparisons, worst case; A1 (distinct keys) for the cost results; the correctness results allow ties.

**Lenses in use**

- **Knowledge** (introduced): what the algorithm knows is a partial order; $e(P)$ counts what it still cannot rule out; comparisons whose answers are known or implied teach nothing. So far it has explained why permutation sort wastes almost all of its work.

**Reasoning tools acquired**

- Correctness as three claims (permutation, sorted, returns) plus a decreasing termination measure.
- Stress-testing a proof by finding where a buggy variant breaks it.
- Exact counting by asking “on how many candidates is comparison $j$ made?”.
- Bounding a sum by a geometric series.
- The knowledge view: partial order, linear extensions, wasted comparisons.

**Open gaps**

*(Your open gaps are listed here in the interactive version.)*

> **Open question**
>
> Asking every pair costs $n(n-1)/2$ comparisons. Yet on a sorted input, the $n - 1$ neighbour answers already prove the whole order. How many comparisons are truly necessary? Start with the smallest questions: how many does it take just to check that an array is sorted, or to find its smallest element?

---

**Next:** Next · Lesson 5How many comparisons does it take to check order, or to find the smallest? (not yet available)
