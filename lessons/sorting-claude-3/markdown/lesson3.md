# Lesson 3: What exactly is the sorting problem, and what may an algorithm do?

*Stage 0 · Foundations*

> This is the Markdown edition of the interactive page. Exercises show their answers, feedback, hints and worked solutions in collapsible blocks: try each one before opening them.

## Where we are

Lessons 1 and 2 gave us a comparison we can trust. It is a strict weak ordering, and in Python it can come from `<`, from a key function, or from a comparison function that keeps its contract. We know what a sorted arrangement is, and how many there are.

Lesson 2 ended with two loose ends from watching Python’s sort. First, even with a broken comparison, every output was a rearrangement of the input: nothing was lost and nothing was duplicated. Second, on some lists the sort was satisfied after far fewer questions than there are pairs. Both loose ends point at the same gap. We never said exactly what the task of sorting is, or what a sort is allowed to do to carry it out.

The task can sound obvious: put the list in order. But this course is about what sorting *costs*, and to put a price on sorting we need more than “put it in order”. Say we want to compare two ways of sorting by their cost. Then we first have to be sure that both of them really sort, so we need an exact test for a correct answer. We also have to agree on what we are counting. As we’ll see, “cost” has no meaning at all until we have settled what an algorithm is allowed to do.

Before we put a price on sorting, though, you may fairly ask why anyone sorts at all. Sorting takes work, so a sorted list had better give something back. So this lesson takes up three questions, in this order: what a sorted list buys you, what counts as a correct answer, and what an algorithm may do to find one.

- [Lesson 1 §05: exactly one sorted arrangement](lesson1.md)
- [Lesson 1 §06: ties and tiers](lesson1.md)
- [Lesson 2 §01: Python asks only `<`](lesson2.md)

## Prerequisite check

**P1.** How many sorted arrangements does a strict total order on 5 elements have?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Ask what the first slot of a sorted row can hold. Could two different elements both qualify?

</details>

<details>
<summary>Hint 2</summary>

In a total order any two elements are related, so only one element is below all the others. It has to go first. Now ask the same question about the four that remain.

</details>

<details>
<summary>Answer and feedback</summary>

- **1** ✓ Yes, exactly one. In a total order every pair of elements is related. So exactly one element is below all the others, and that element has to go in the first slot. The same argument then fixes the second slot, and so on down the row. That’s lesson 1, Theorem 7.
- *If you answered 120:* 120 is $5!$, the number of *all* arrangements of five elements, sorted or not. Almost all of them have some pair out of order. The question asks how many have no pair out of order, and in a total order that condition pins down every slot.
- *If you answered 2:* It’s tempting to count both the increasing and the decreasing row. But a sorted row has no pair out of order. In the decreasing row, every one of its 10 pairs is out of order, because the later element always comes first in the order. Only the increasing row counts.
- *Any other answer:* Not quite. Think about the first slot. Every other element will stand after it, so the element in the first slot has to come before all of them in the order. In a strict total order, how many elements come before all the others? Once that’s settled, ask the same about the second slot.

</details>

<details>
<summary>Worked solution</summary>

Let’s build a sorted row slot by slot and count our choices. Picture five different numbers, say 4, 1, 5, 2, 3, compared with `<`. Every other element will stand after slot 0. Suppose slot 0 held the 4. Then the 1 would stand after it, although 1 comes before 4, and that pair would be out of order. The same goes for any element in slot 0 that some other element comes before. In a strict total order every pair is related: for each other element, either it comes before the one in slot 0 or the one in slot 0 comes before it. So slot 0 needs the element that comes before all the others, which is the minimum: here, the 1. Exactly one element qualifies, so that’s 1 choice.

Take the 1 away. The other four, 4, 5, 2 and 3, are still totally ordered, so slot 1 is forced in the same way: it holds their minimum, the 2, again 1 choice. Carrying on, every slot has exactly one choice, so the count is $1 \cdot 1 \cdot 1 \cdot 1 \cdot 1 = 1$. That’s lesson 1, Theorem 7.

The tempting 120 is $5! = 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1$, which counts every arrangement, sorted or not. And 2 would also count the decreasing row, which has all $\binom{5}{2} = 10$ of its pairs out of order.

</details>

**P2.** Python’s `sorted` is given a comparison that is not a strict weak ordering. What happens?

- **(a)** It returns some rearrangement of the input, with no error; which one depends on the starting order.
- **(b)** It raises a `ValueError`.
- **(c)** It returns the input unchanged.
- **(d)** It sorts correctly anyway, because it compares every pair.

<details>
<summary>Hint 1</summary>

Ask whether Python ever checks the comparison it’s given, or simply believes every answer.

</details>

<details>
<summary>Hint 2</summary>

Recall the experiments in lesson 2, §05. Did any broken comparison raise an error? Was any element lost or duplicated? Did the output stay the same when the starting order changed?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. That’s it. Python never checks the comparison: it believes every answer and runs its usual steps. In lesson 2, §05, the NaN, tolerance and rock–paper–scissors comparisons all ran without an error. Every output was a rearrangement of the input, and which rearrangement you got depended on where the elements started.
- **(b)** ✗. A natural thing to expect, but Python doesn’t check the comparison at all. It trusts every answer and returns whatever its steps produce. None of lesson 2’s broken comparisons raised an error. (Java’s library sort sometimes throws an error in this situation; Python never does.)
- **(c)** ✗. That did happen once in lesson 2: `sorted([3.0, nan, 1.0, 2.0])` came back unchanged. But it was luck, not a rule. The same four values starting as `[nan, 3.0, 1.0, 2.0]` came back as `[nan, 1.0, 2.0, 3.0]`, so the output depends on the starting order.
- **(d)** ✗. Two problems here. Python’s sort doesn’t compare every pair: on 1000 random numbers it makes about 8 600 comparisons, not 499 500 (§04 measures this). Instead it relies on its answers fitting together: once it has learned that `a < b` and `b < c`, it can treat `a < c` as settled without asking. A broken comparison is exactly one whose answers don’t fit together like that. And even asking every pair couldn’t rescue a cyclic comparison like rock–paper–scissors, which has no sorted arrangement at all (lesson 1, Lemma 1).

</details>

<details>
<summary>Worked solution</summary>

Think about what the sort actually does: it asks `<` about some pairs, believes every answer, and moves elements around accordingly. Nothing in that process checks whether the answers fit together, so no error is raised, and (b) is out.

What comes back? In every run of lesson 2’s experiments the output was a rearrangement of the input, with nothing lost or duplicated. Which rearrangement you get depends on the answers the sort received, and those depend on the starting order. `[3.0, nan, 1.0, 2.0]` came back unchanged, which is what makes (c) tempting. But `[nan, 3.0, 1.0, 2.0]` came back as `[nan, 1.0, 2.0, 3.0]`. That is exactly (a).

Option (d) fails twice. First, the sort doesn’t ask about every pair. It relies on its answers fitting together, and a broken comparison is exactly one whose answers don’t fit together. Second, for a cyclic comparison like rock–paper–scissors there is no correct output to find in the first place.

</details>

---

## 01 · Why pay for order?

So what does a sorted list actually buy you? A good way to find out is to take two everyday questions you might ask about a list, and answer each one twice: once for an unsorted list, and once for the same list after sorting.

**Duplicates.** Does any value occur twice? More precisely, are any two elements tied? Take the list 3, 1, 5, 3. Unsorted, the two 3s sit at opposite ends, and in general a tied pair could be hiding anywhere. So the obvious method checks every pair: (3, 1), (3, 5), (3, 3), (1, 5), (1, 3) and (5, 3), six pairs in all. A list of $n$ elements has $n(n-1)/2$ pairs to check this way.

Now sort the same list: 1, 3, 3, 5. The two 3s have ended up side by side. Was that luck? Let’s try to keep them apart and still have a sorted list. Put the 5 between them: 1, 3, 5, 3. Now the 5 stands before the second 3, although 5 is bigger, so that pair is out of order. Put the 1 between them instead: 3, 1, 3, 5. Now the first 3 stands before the 1, and that pair is out of order.

The same thing happens in every list. Both times, the element we squeezed between the two 3s came from a different tier. Lesson 1, Lemma 9 says that a different tier lies entirely before the 3s’ tier or entirely after it. The 1’s tier lies before, so the 1 standing after the first 3 made an out-of-order pair. The 5’s tier lies after, so the 5 standing before the second 3 made an out-of-order pair. In general, suppose $x$ and $y$ tie, so they belong to the same tier, and some $z$ from a different tier stands between them. If $z$’s tier lies before theirs, like the 1, then $z$ standing after $x$ makes $x, z$ an out-of-order pair. If $z$’s tier lies after theirs, like the 5, then $z$ standing before $y$ makes $z, y$ an out-of-order pair. Either way the list wouldn’t be sorted. So in a sorted list, tied elements always stand together in one unbroken block. If the list has a tie at all, some tied pair are neighbours, and to find a tie you only need to look at neighbours.

That is the first saving. In 1, 3, 3, 5 there are only three neighbour pairs to look at, (1, 3), (3, 3) and (3, 5), where the unsorted list had six pairs. In general, write the sorted list as $b = [b_0, \ldots, b_{n-1}]$. It has $n - 1$ neighbour pairs, from $(b_0, b_1)$ up to $(b_{n-2}, b_{n-1})$.

The second saving happens inside each pair. How do we find out whether two elements tie, using only $<$? Take the two 3s. Is the first 3 smaller than the second? No. Is the second smaller than the first? No. Two noes, so they tie. Now take 1 and 3. Is 1 smaller than 3? Yes, so they don’t tie. So a tie test can take two questions, one each way round, and in an unsorted list it often does. In a sorted list we can skip one of them. Read 1, 3, 3, 5 from left to right. From one neighbour to the next the values go up (1 to 3) or stay level (3 to 3), and they never go down. So for each neighbour pair, all that is left to find out is whether it goes up or stays level. One question settles that: “is the left one smaller than the right one?”, that is, “is $b_i < b_{i+1}$?”. A yes means it goes up. A no means it stays level, and the two tie. In 1, 3, 3, 5 the question “is 3 < 3?” gets the no, and that is the tie.

So sorting the list changed two separate things. We look at fewer pairs: the $n - 1$ neighbour pairs instead of all $n(n-1)/2$. And each pair needs one question instead of up to two. Together they bring the cost down to $n - 1$ comparisons:

> **Lemma 1 (ties are neighbours)**
>
> A sorted list contains two tied elements if and only if some neighbour pair is tied. Checking this takes $n - 1$ comparisons: for neighbours with $b_{i+1} \not< b_i$ (true in a sorted list), they are tied exactly when also $b_i \not< b_{i+1}$.

> **Proof**
>
> Tiers appear as contiguous blocks (lesson 1, Theorem 10). If a tier has two elements, its block has two adjacent positions. The converse is immediate. One comparison per neighbour pair suffices because sortedness already rules out $b_{i+1} < b_i$. ∎

For 1000 elements, that is 999 comparisons. The unsorted list had 499 500 pairs to check, and each of them could need two questions. Searching a list gains even more from order.

**Search.** Is a value $v$ in the list, and if not, where would it go? Let’s look for 12 among seven values. Unsorted, say 11, 20, 2, 17, 5, 14, 8, the 12 could belong next to any of them. We can’t be sure where it goes until we have compared it with all seven. In general, an unsorted list makes you look at every element.

Now sort the same seven values: 2, 5, 8, 11, 14, 17, 20. The 12 could go in any of eight gaps: before the 2, between two neighbours, or after the 20. Compare 12 with the middle element, 11. 12 is bigger, so it goes somewhere to the right of 11, and we can forget the 2, 5 and 8 for good. That leaves four gaps. Among the three elements that are left, 14, 17 and 20, compare 12 with the middle one, 17. This time 12 is smaller, so it goes to the left of 17. That leaves two gaps. One more comparison, with 14: 12 is smaller again, so it goes in the gap between 11 and 14. The gaps went 8, 4, 2, 1, and it took three comparisons instead of seven.

Both methods compare 12 with elements of the list. What changed is which ones: the unsorted list makes us go through all of them one by one, while the sorted list lets each answer throw away half of what’s left. The general recipe is to compare $v$ with the middle element; if $v$ is smaller, it belongs in the left half, and otherwise in the right half. Then do the same with the half that’s left. How many comparisons does that take on a bigger list?

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

A sorted list holds 1000 values. A value $v$ could belong in any of the 1001 gaps (before the first element, between two neighbours, after the last). Each comparison of $v$ with an element of the list rules out, at best, half of the remaining gaps. How many comparisons are needed to pin down the gap?

*Your answer:* ______

<details>
<summary>Your prediction, compared</summary>

- **10** ✓ That’s it: ten. Nine can’t always do it, because $2^{9} = 512$ is less than 1001, but ten can, because $1001 \le 1024 = 2^{10}$.
- *If you answered 1000:* That’s what an unsorted list forces: looking at every element, one by one. A sorted list lets each comparison throw away half of what’s left, which is far quicker.
- *If you answered 500:* That would be removing a fixed amount each time. Halving is much faster than that: each comparison halves what’s left, so the gaps go from 1001 to about 500, then about 250, and so on, reaching 1 very quickly.
- *If you answered 9:* So close! But nine halvings can still leave $1001 / 2^9 \approx 2$ gaps, not one, so you need one more comparison.
- *Any other answer:* Try counting halvings: how many times do you have to halve 1001 before you’re down to a single gap?

</details>

<details>
<summary><b>Reveal</b></summary>

Ten. A comparison has two answers, and in the worst case we always get the answer that leaves the bigger part. So each comparison at best halves the gaps still possible, and after $k$ comparisons at least $1001 / 2^k$ gaps can remain. To be down to one gap we need $2^k \ge 1001$, that is $k \ge \log_2 1001 \approx 9.97$. So nine comparisons are not enough. Halving shows that ten are: the 1001 gaps go down to at most 501, then 251, 126, 63, 32, 16, 8, 4, 2 and finally 1. Getting the halving procedure exactly right takes care, because its boundaries are a classic source of bugs. Lesson 12 builds it properly, with its invariant.

</details>

Ten comparisons for 1000 values. That ten raises two questions. Why does halving get down to one gap so quickly? And is ten just what halving happens to achieve, or could a cleverer method do better? Both answers involve the same number, the logarithm $\log_2$ of the count. Logarithms will turn up in almost every lesson from here on, and we will read them in exactly the two ways below. The two readings answer different questions, so keep them apart. The first, halvings, counts what our search did, so it shows that ten comparisons are enough. The second, bits, is about every method that asks yes/no questions, and it shows that fewer than ten are never enough.

- **Halvings.** $\log_2 m$ is the number of times you have to halve $m$ to reach 1. That is what the search did. Among seven values, each comparison halved the gaps: 8, 4, 2, 1, which is 3 rounds, and $\log_2 8 = 3$. Among 1000 values the gaps went from 1001 down to 1 in $\lceil \log_2 1001 \rceil = 10$ rounds. Whenever an algorithm keeps halving its problem, the number of rounds is logarithmic.
- **Bits.** Think of the answers as a string of yeses and noes. One answer has 2 possible outcomes. Two answers have 4 (yes-yes, yes-no, no-yes, no-no), three have 8, and in general $k$ answers have at most $2^k$ combinations. Now go back to the search for 12 among seven values. Whatever method we use, once it has heard its answers it names one gap. So each string of answers leads to just one gap. Two questions give only 4 strings, too few to tell 8 gaps apart, so no method can always manage with two. Three questions give 8 strings, just enough. In general, to single out one of $m$ possibilities you need $2^k \ge m$, that is, at least $\log_2 m$ answers `[proof]`. A comparison is a yes/no answer, so the same floor holds for comparisons. For the search among 1000 values, $m = 1001$ gaps. Nine comparisons have only $2^9 = 512$ strings of answers, too few for 1001 gaps, so no method can always succeed with fewer than ten. Halving is as good as it gets. (A single yes/no answer is what computer scientists call one *bit*, which is where this reading gets its name.)

**Table 1.** *What order buys, for n = 1000. Comparisons in the worst case.*

| Question | Unsorted | Sorted |
|---|---|---|
| Any two elements tied? | 499 500 (every pair) | 999 (neighbours) |
| Where does $v$ belong? | 1000 (every element) | 10 (halving) |
| What is the 10th smallest? | (lesson 26) | 0 (read position 9) |

Table 1 collects what order bought us for 1000 elements. For the unsorted tie check it counts just one question per pair, 499 500. That is generous to the unsorted list, since a pair can need two questions, so the real gap is even wider. The table also adds a third question we haven’t looked at yet: what is the 10th smallest element? Once the list is sorted, the 10th smallest simply sits at position 9 (positions start at 0), so finding it takes no comparisons at all. (Finding it without sorting first is a story for lesson 26.)

So sorting is an investment. You pay once, and afterwards many questions become a quick scan of neighbours, a few halvings, or a direct lookup `[intuition]`. Whether the investment pays off depends on how many questions follow, and on how much the sorting itself costs. That second part, the price, is what the rest of the course is about.

---

## 02 · The specification

So what does sorting cost? Any answer will be a claim like “this function sorts, using so many comparisons”. A claim like that is only worth something if we can say exactly what “sorts” means. Otherwise the cheapest “sort” of all would be one that skips the work and returns something that merely looks right. “A function that sorts” sounds perfectly clear, until you try to write a test for one. Let’s try. Here are six functions that all claim to sort.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

Each function below claims to sort a list of numbers. Select every one that is a correct sorting function for all inputs.

*Select every option that applies.*

- **(a)** `def f(a): return []`
- **(b)** `def f(a): return list(range(len(a)))`
- **(c)** `def f(a): return [min(a)] * len(a)`
- **(d)** `def f(a): return a`
- **(e)** `def f(a): return sorted(set(a))`
- **(f)** `def f(a): return sorted(a)`

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. The empty list is in order, trivially: it has no pair at all that could be out of order. But every element has been thrown away, so it isn’t a rearrangement of the input. Ordered, yet wrong.
- **(b)** ✗. The output 0, 1, …, n−1 is in order, but those aren’t the input’s elements; they’re just its positions. Ordered, yet the wrong elements.
- **(c)** ✗. In order and the right length, but every element has been replaced by a copy of the minimum, so the contents are wrong. Ordered, yet not the same elements.
- **(d)** ✗. The elements are exactly right, but they’re never rearranged, so they stay in their original order. That’s a rearrangement (the trivial one), yet not an ordered one, unless the input happened to be sorted already.
- **(e)** ✗. The sneaky one. It’s correct whenever all the values are distinct, but `set` throws duplicates away: `[2, 1, 2]` comes back as `[1, 2]`. Failing on some inputs means it isn’t a correct sort.
- **(f)** ✓ correct. The genuine one: its output is in order, and it’s a rearrangement of the input, duplicates included.

</details>

<details>
<summary><b>Reveal</b></summary>

Look at what goes wrong in each fake. (a), (b) and (c) produce something in order, but they lose elements or invent new ones. (d) keeps the right elements but doesn’t put them in order. (e) works on distinct values but drops duplicates, and a correct sort has to work on every input. So there are two separate things to get right: the output must be in order, and it must hold exactly the input’s elements. (a) to (d) each get one of them right and the other wrong, and (e) gets the second wrong whenever there are duplicates. A correct specification has to ask for both.

</details>

So a correct sort has to pass two separate tests, and the fakes show that the tests really are separate. Run four of the functions on `[2, 1, 2]`. Fake (a) returns `[]`, which is in order but has lost every element. Fake (d) returns `[2, 1, 2]`, which has exactly the right elements but isn’t in order: the 1 stands after a 2. Fake (e) returns `[1, 2]`, which is in order but one 2 short. Only `sorted` returns `[1, 2, 2]`, which passes both tests. Read left to right, its values 1, 2, 2 never go down, and it holds the 1 and both 2s. So the first test is about the order of the output. The second is about its contents: the output must hold exactly the input’s elements, each as often as the input does.

The first test is easy to write down: no pair out of order, as in lesson 1. The second is harder than it looks, and fake (e) shows why. Try saying it with values: “every value in the output occurs in the input, and every value in the input occurs in the output”. On `[2, 1, 2]`, fake (e)’s output `[1, 2]` passes that test. The values in the input are 1 and 2, and the values in `[1, 2]` are also 1 and 2. This value version only asks which values appear. It never counts how often.

What fixes it is to count positions instead of values. The input `[2, 1, 2]` has three positions, 0, 1 and 2, and a correct output uses each of them exactly once. Positions 0 and 2 both hold a 2, so the output has to hold two 2s. But `[1, 2]` has only two slots for three positions, so one position goes unused, and fake (e) fails. So the position version also counts how often each value appears: the output must contain each element exactly as often as the input does. That is precisely what fake (e) broke.

Let’s write both tests down precisely, with the second one in its position version. We also write down what the sort may assume about its input. That assumption is called the *precondition*, because it has to hold before the sort runs. The two tests on the output form the *postcondition*, because they have to hold after it.

> **Definition (the sorting problem)**
>
> **Precondition.** A list $a = [a_0, \ldots, a_{n-1}]$ and a comparison $<$ that is a strict weak ordering.
>
> **Postcondition.** A list $b = [b_0, \ldots, b_{n-1}]$ such that
>
> 1. $b$ is **sorted**: there are no $i < j$ with $b_j < b_i$ (by lesson 1, Lemma 11, equivalently $b_{i+1} \not< b_i$ for every $i$);
> 2. $b$ is a **permutation** of $a$: there is a bijection $\pi$ of $\{0, \ldots, n-1\}$ with $b_i = a_{\pi(i)}$ for every $i$.

Let’s read that back in plain words. The precondition says the sort is handed a list and a comparison it can trust. Condition 1 is lesson 1’s “no pair out of order”. For $b = [10, 20, 30]$, read the values from left to right: 10, 20, 30. They never go down. Lesson 1’s full check would look at all three pairs. Lesson 1, Lemma 11 says the neighbour test gives the same answer: look only at the side-by-side pairs, 10 then 20 and 20 then 30, and ask of each “is it the wrong way round?”.

Condition 2, “$b$ is a permutation of $a$”, is the part that four of the six fakes got wrong. It is the position version from above, written with a symbol, $\pi$. Think of $\pi$ as a set of instructions for building the output. Slot $i$ of $b$ receives the element that sat at position $\pi(i)$ of $a$. For example, to sort $a = [30, 10, 20]$ we use $\pi(0) = 1$, $\pi(1) = 2$ and $\pi(2) = 0$. So slot 0 receives $a_1 = 10$, slot 1 receives $a_2 = 20$, and slot 2 receives $a_0 = 30$, which gives $b = [10, 20, 30]$.

“Bijection” means that every input position is used exactly once, so nothing is lost and nothing is copied. (The name says that the matching works both ways: each slot gets exactly one input position, and each input position goes to exactly one slot.) Fake (c) breaks this. On $[30, 10, 20]$ it returns $[10, 10, 10]$, which would need $\pi(0) = \pi(1) = \pi(2) = 1$: position 1 is used three times, and positions 0 and 2 are never used. Fake (e) breaks it too, as we saw: on $[2, 1, 2]$ its output $[1, 2]$ leaves one of the three positions unused.

The same specification covers both of Python’s ways of sorting. `xs.sort()` rearranges the list in place, so its final contents must be $b$; `sorted(xs)` returns a new list $b$ and leaves `xs` alone.

Put the two conditions side by side and the job of a sort looks different. Condition 2 says the output must be one of the arrangements of the input, and there is one arrangement for each bijection $\pi$. Condition 1 says which of those arrangements are acceptable. For $[30, 10, 20]$, condition 2 allows $[30, 10, 20]$, $[10, 30, 20]$, $[20, 10, 30]$ and so on, and condition 1 picks out $[10, 20, 30]$. So a sort is really a search: among all the ways of arranging the input, find one that is sorted. How big is that search? Let’s count the arrangements first, and then the sorted ones among them.

> **Lemma 2 (counting arrangements)**
>
> A list of $n$ elements has exactly $n!$ arrangements $b = [a_{\pi(0)}, \ldots, a_{\pi(n-1)}]$, one for each bijection $\pi$.

> **Proof**
>
> Choose $\pi(0)$ in $n$ ways, then $\pi(1)$ among the $n - 1$ positions left, and so on: $n (n-1) \cdots 1 = n!$. ∎

And how many of those are correct? Suppose first that all the keys are different, as in $[30, 10, 20]$. Then no two elements tie, so every tier holds just one element, and the strict weak ordering is in fact a strict total order. Lesson 1, Theorem 7 says that a strict total order has exactly one sorted arrangement. For $[30, 10, 20]$ that is $[10, 20, 30]$, one of the $3! = 6$ arrangements. So, in its plainest form:

> **Sorting $n$ distinct elements means finding the one sorted arrangement among $n!$ candidates.**

When there are ties, there can be more sorted arrangements. Take $[2, 1, 2]$ again. The 1 has to come first, but the two 2s can stand in either order, so 2 of its $3! = 6$ arrangements are sorted. In general there are $n_1! \cdots n_k!$ sorted arrangements, where $n_1, \ldots, n_k$ are the sizes of the tiers (lesson 1, Theorem 10). For $[2, 1, 2]$ the tiers have sizes 1 and 2, and $1! \cdot 2! = 2$. The specification is happy with any of the sorted arrangements. (Python promises one particular arrangement, the stable one, as lesson 7 explains.)

Ties change how many answers count as correct, but not what the problem is about. And for our first analyses they’re a distraction. With distinct keys the answer is unique, and in every pair of elements one of the two is smaller. That keeps the counting clean. So for now we’ll assume:

> **Assumption A1 (distinct keys)**
>
> Until stated otherwise, all keys are distinct, so $<$ is a strict total order on the elements and the sorted output is unique. Lessons 7, 25 and 33 drop this assumption deliberately. Every algorithm will still be tested on duplicates among its edge cases.

#### Checkpoint 1

**Q1.** How many arrangements does a list of 6 distinct elements have?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Build an arrangement slot by slot. How many elements could you put in the first slot? How many are left for the next one?

</details>

<details>
<summary>Hint 2</summary>

The slots have 6, 5, 4, 3, 2 and 1 choices. Should those numbers be added or multiplied? Try it on just the first two slots, and list a few of the ways if you’re unsure.

</details>

<details>
<summary>Answer and feedback</summary>

- **720** ✓ Yes: $6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1 = 6! = 720$. Six choices for the first slot, five for the second, and so on, because each element can be used only once. And since the elements are distinct, exactly one of those 720 is sorted.
- *If you answered 36:* 36 is $6 \cdot 6$: it picks something for two slots and allows the same element twice. An arrangement fills all six slots, and every choice uses up an element, so the pool shrinks as you go: $6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1$.
- *If you answered 46656:* $6^6 = 46\,656$ lets every slot pick any of the six elements, so the same element could appear several times. An arrangement uses each element exactly once, so each slot has one fewer choice than the slot before.
- *If you answered 21:* 21 is $1 + 2 + \cdots + 6$: you’ve added the choices. But choices combine: each of the 6 choices for the first slot can be followed by each of the 5 for the second, which already gives $6 \cdot 5 = 30$ ways to fill two slots. Combining choices multiplies.
- *If you answered 120:* 120 is $5!$, the count for five elements. With six there’s one more element to place, and it multiplies the count by 6.
- *Any other answer:* Not quite. Fill the six slots one at a time: how many elements can go in the first slot, and how many are left for the second?

</details>

<details>
<summary>Worked solution</summary>

Let’s build an arrangement one slot at a time and count the choices as we go.

Slot 0 can hold any of the 6 elements: 6 choices. Whichever we picked is now used up, so slot 1 has 5 choices, and each of the 6 first choices can be followed by each of the 5 second ones: $6 \cdot 5 = 30$ ways to fill two slots. Slot 2 has 4 choices left: $30 \cdot 4 = 120$. Then 3, 2 and 1 choices: $120 \cdot 3 = 360$, $360 \cdot 2 = 720$, $720 \cdot 1 = 720$. So there are $6! = 720$ arrangements, which is Lemma 2 with $n = 6$.

The tempting wrong answers each slip in one place. Adding the choices (21) forgets that they combine. $6^6 = 46\,656$ lets an element be reused. 36 stops after two slots and allows repeats. 120 is the count for five elements, one too few.

</details>

**Q2.** The list `[2, 2, 1, 1, 1]` has $5! = 120$ arrangements, counted as bijections $\pi$ of positions. How many of them are sorted?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Which elements tie with each other? In a sorted arrangement, which group has to come first, and is there any freedom left?

</details>

<details>
<summary>Hint 2</summary>

The three 1s must fill slots 0–2 and the two 2s slots 3–4. Count the orders inside each block, then decide whether to add or multiply.

</details>

<details>
<summary>Answer and feedback</summary>

- **12** ✓ Yes, 12. A sorted arrangement must put all three 1s before both 2s. The only freedom left is the order inside each group: $3! = 6$ ways for the 1s times $2! = 2$ for the 2s. As lists of *values* all 12 look the same, `[1, 1, 1, 2, 2]`, but they put different elements in each slot. That difference starts to matter as soon as elements carry more than their key, as records do; lesson 7 returns to it.
- *If you answered 1:* As a list of values, yes, there’s only one sorted result: `[1, 1, 1, 2, 2]`. But the question counts bijections of positions. The three 1s are three different elements that happen to tie. They can stand among themselves in $3!$ orders, and the two 2s in $2!$, and every one of those combinations is sorted.
- *If you answered 120:* That’s every arrangement, sorted or not. Most of them put a 2 before a 1, and that pair is out of order. Only the arrangements with all the 1s first survive.
- *If you answered 5:* 5 is $3 + 2$, the sizes of the two tiers added together. But each tier can be ordered internally in several ways. The choices for the two tiers are independent, so you multiply the numbers of orders: $3! \cdot 2!$.
- *If you answered 8:* 8 is $3! + 2!$: the right ingredients, combined the wrong way. Each of the 6 orders of the 1s can go with each of the 2 orders of the 2s, so the counts multiply.
- *If you answered 6:* 6 is $3!$, the orders of the three 1s. Don’t forget the two 2s: they can swap places too, which doubles the count.
- *Any other answer:* Not quite. Group the elements into tiers of tied elements. In a sorted arrangement, where must each tier stand, and how many ways can each tier be ordered inside?

</details>

<details>
<summary>Worked solution</summary>

Let’s name the elements by their positions, $a_0 = 2$, $a_1 = 2$, $a_2 = 1$, $a_3 = 1$, $a_4 = 1$, because the question counts arrangements of these five elements, not lists of values.

There are two tiers: the 1s $\{a_2, a_3, a_4\}$ and the 2s $\{a_0, a_1\}$. A 2 standing before a 1 would be a pair out of order, so in a sorted arrangement slots 0, 1 and 2 hold the three 1s and slots 3 and 4 hold the two 2s. That much is forced. The only freedom is the order inside each block. The 1s can fill slots 0–2 in $3 \cdot 2 \cdot 1 = 6$ ways, and the 2s can fill slots 3–4 in $2 \cdot 1 = 2$ ways. Each choice for the 1s goes with each choice for the 2s, so there are $6 \cdot 2 = 12$ sorted arrangements. That’s lesson 1, Theorem 10: $3! \cdot 2! = 12$.

Why not the other answers? 1 counts lists of values instead of arrangements of elements. 120 counts every arrangement, including those with a 2 before a 1. 5 and 8 add where the independent choices should multiply, and 6 forgets that the two 2s can swap.

</details>

**Q3.** When does `sorted(set(a))` meet the specification?

- **(a)** Exactly when `a` has no duplicates.
- **(b)** Always: it returns a sorted list.
- **(c)** Never: `set` destroys the order.
- **(d)** Only when `a` is already sorted.

<details>
<summary>Hint 1</summary>

Check the two conditions of the specification separately. Which one could `set` put at risk?

</details>

<details>
<summary>Hint 2</summary>

Try a list with a repeated value, say `[2, 1, 2]`, and then one without. Compare the length of the output with the length of the input.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. With distinct values, `set(a)` keeps every element and `sorted` puts them in order, so you get exactly the sorted arrangement. With a duplicate, the set keeps only one copy, so the output is shorter than the input and can’t be a permutation of it: condition 2 fails.
- **(b)** ✗. It does always return a sorted list, so condition 1 always holds. But the specification has two conditions, and condition 2 asks for every element with its multiplicity. On `[2, 1, 2]` the output is `[1, 2]`: in order, but one 2 has gone missing.
- **(c)** ✗. It’s true that a set doesn’t keep the list’s order, but that doesn’t matter here: `sorted` puts everything in order afterwards anyway. On distinct values nothing is lost and the result is exactly right; `[3, 1, 2]` gives `[1, 2, 3]`.
- **(d)** ✗. The input’s order doesn’t matter at all, because `sorted` reorders everything anyway. What breaks this function is duplicates, and an already sorted input such as `[1, 2, 2]` still loses a 2.

</details>

<details>
<summary>Worked solution</summary>

Let’s check the two conditions one at a time.

Condition 1, sorted: `sorted` always returns an ordered list, whatever it’s given, so this one always holds.

Condition 2, permutation: the output must contain each element of `a` exactly as often as `a` does. `set(a)` keeps one copy of each distinct value. If `a` has no duplicates, nothing is dropped, the output holds exactly the elements of `a`, and condition 2 holds. If `a` has a duplicate, at least one copy is dropped, the output is shorter than `a`, and condition 2 fails: `[2, 1, 2]` gives `[1, 2]`. So the function is correct exactly when `a` has no duplicates.

The other options each miss something. “Always” overlooks condition 2. “Never” blames the set’s lack of order, which `sorted` repairs anyway. And “only when sorted” can’t be right, because `[1, 2, 2]` is sorted and still loses an element.

</details>

---

## 03 · What may an algorithm do?

So the task is a search: find the one sorted arrangement among $n!$. How much work does that take? Try to answer and you hit a problem straight away: work measured in what? Take the list $[3, 0, 2, 1]$ and look at three ways of sorting it.

**Call the built-in.** Run `sorted([3, 0, 2, 1])`. If that call counts as a single step, sorting costs one step, and the whole question is empty.

**Use the keys as indices.** The keys here are exactly the numbers 0 to 3. An algorithm that is allowed to use a key as a list index can read the 3 and put it straight into slot 3, read the 0 and put it into slot 0, and so on. That sorts the list without a single comparison (lesson 30 explores exactly this).

**Compare.** An algorithm can ask about two elements at a time. Is the 3 smaller than the 0? No. Is the 0 smaller than the 2? Yes. It keeps asking until it knows where everything goes, and each question is one comparison.

Same list, same output $[0, 1, 2, 3]$, and three different costs: one step, no comparisons at all, or some number of comparisons. What differs between the three is what the algorithm is allowed to do. So “cost” means nothing until we fix two things: what an algorithm may do to learn about its input, and what we charge for.

The first two ways get around the work by using something extra. The built-in does the whole job for us, and the index trick uses the values themselves as list positions. The setting this course starts from takes both away and keeps only the third way. Think of each element as a closed box. The algorithm can’t open the boxes. On $[3, 0, 2, 1]$ it can’t see that the first box holds a 3. The one thing it may do to learn about the boxes is pick two of them and ask whether one is smaller than the other: “is box 0 smaller than box 1?” gets a no. Each such question costs one unit. It may still move the boxes around as much as it likes. Swapping box 0 and box 1, say, does the same thing whatever is inside, so it tells the algorithm nothing. We keep a separate count of those moves. Here is the same setting written out precisely:

> **Definition (the comparison model)**
>
> - The algorithm receives the list and its length $n$. It cannot look inside the elements.
> - To learn anything about the elements it may only ask: **is $a_i < a_j$?** Each such question is one **comparison**, with a yes/no answer.
> - It may **move** elements: copy them, swap them, store them in other lists. Moves are counted separately (as moves), and they never reveal anything about the elements.
> - Everything else, such as arithmetic on indices, loops, and memory for indices and counters, is allowed and is not counted as comparisons.
> - **Cost measure** (for now): the number of comparisons.

Why this model, rather than some other? Three reasons.

- **Generality.** An algorithm that only asks `<` sorts anything with a valid `<`: numbers, strings, tuples, records by key.
- **Python’s sort lives in it.** It asks only `<` (lesson 2, §01).
- **Comparisons are what is expensive in Python** `[intuition]`. Each one goes through a method call, such as a class’s `__lt__`; moving a list element just copies a reference. Lesson 29 measures this.

What the model leaves out matters just as much. It leaves out looking at the digits or bits of a key, doing arithmetic on keys, using a key as an index, and hashing. These are all real operations, and the model excludes them on purpose. That has a consequence worth stating now. We will prove results of the form “no algorithm can do this with fewer than so many comparisons”, like the ten comparisons for search in §01. Results like that are called *lower bounds*, because they put a floor under the cost. Every lower bound we prove in this model holds *only* in this model. So whenever an algorithm later seems to “beat” one of those bounds, the first question to ask will be which of the left-out operations it used.

<details>
<summary><b>Common question · Can’t I detect duplicates in linear time with a set?</b></summary>

Usually, yes, but only by stepping outside the comparison model. On `[3, 1, 5, 3]`, `set(a)` ends up holding three values, fewer than the four elements, so there is a duplicate, and no `<` was ever asked. To get there, `len(set(a)) < len(a)` hashes each element, and hashing reads what is inside the element, which the model doesn’t allow. The running time of that check also depends on how the hash function behaves on your keys. That is an assumption about the keys, not a guarantee. Both models are legitimate; they answer different questions. Within the comparison model, detecting duplicates turns out to be essentially as hard as sorting. We will be able to prove that once we have lower bounds.

</details>

Notice what all those exclusions add up to. A comparison algorithm never sees a key’s digits, its size, or how far apart two keys are. All that ever reaches it is a sequence of yes/no answers to `<`. So what happens when we give it two inputs whose values have nothing in common, such as `[10, 30, 20]` and `[1, 99, 50]`? The answer will simplify everything that follows. Make a prediction before reading on.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

A sorting algorithm in the comparison model runs on `[10, 30, 20]` and then on `[1, 99, 50]`. Will it ask the same comparisons, in the same order?

- **(a)** Yes, always.
- **(b)** Not necessarily: the values differ.
- **(c)** Only if the algorithm is simple.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✓ correct. That’s right, and it doesn’t depend on which algorithm it is. Can you say why before reading on? The reason is below.
- **(b)** ✗. The values certainly differ. But think about what the algorithm can actually find out about them: only answers to “is this one smaller than that one?”. Do those answers differ between the two lists? See below.
- **(c)** ✗. Simplicity has nothing to do with it: the reason applies to every algorithm in the model, however elaborate. See below for why.

</details>

<details>
<summary><b>Reveal</b></summary>

Both lists have the same pattern: the first element is the smallest, the second the largest, the third in the middle. So every question “is $a_i < a_j$?” gets the same answer on both lists. For example, “is $a_0 < a_1$?” is yes on both (10 against 30, 1 against 99), and “is $a_1 < a_2$?” is no on both (30 against 20, 99 against 50). An algorithm that can learn only through such questions gets the same answers on both lists, so it cannot tell them apart.

</details>

That reasoning works for any two lists with the same pattern, and for any algorithm in the model. An algorithm in the model can only act on the answers it gets. So if two lists give the same answer to every question, the algorithm does the same things on both:

> **Lemma 3 (only the pattern matters)**
>
> Let $a$ and $a'$ be lists of length $n$ with $a_i < a_j \iff a'_i < a'_j$ for all $i, j$. A deterministic algorithm in the comparison model asks the same comparisons in the same order on both, receives the same answers, and performs the same moves. In particular it outputs the same arrangement $\pi$.

> **Proof**
>
> Induction on the number of steps taken. Before the first step the algorithm knows only $n$, the same for both lists. Suppose the first $t$ steps were identical. The algorithm’s next step is determined by $n$ and the answers received so far, which are the same; so it is the same step. If it is a comparison of positions it has tracked identically, the answer is the same by assumption. If it is a move, it moves the elements at the same positions, so the elements’ positions stay in correspondence. ∎

Why is this worth a lemma? To say what an algorithm costs on $n$ elements, we will have to account for every input of size $n$, and there are infinitely many lists of $n$ numbers. Lemma 3 lets us replace each of them by something simpler. With distinct keys, write each element’s **rank** in its place: 0 for the smallest, $n - 1$ for the largest. Both `[10, 30, 20]` and `[1, 99, 50]` become `[0, 2, 1]`.

Why does that help? An element’s rank counts the elements smaller than it. In `[10, 30, 20]`, the 10 is the smallest, so its rank is 0. One element, the 10, is smaller than the 20, so the 20 gets rank 1. Two elements are smaller than the 30, so it gets rank 2. So a smaller element always gets a smaller rank, and a bigger element a bigger rank: $a_i < a_j$ exactly when rank$(a_i)$ < rank$(a_j)$. For example, “is $a_0 < a_1$?” asks “is 10 < 30?” in the input and “is 0 < 2?” in the rank list, and both answers are yes. Every other question matches in the same way. So an input and its list of ranks give the same answer to every question “is $a_i < a_j$?”. By Lemma 3, an algorithm runs identically on both: the same comparisons, the same moves, the same cost.

And what do rank lists look like? With distinct keys, the $n$ ranks are $0, 1, \ldots, n-1$, each used exactly once. So every rank list is a permutation of $0, \ldots, n-1$. And every such permutation turns up as a rank list. For instance, `[0, 2, 1]` is the rank list of `[10, 30, 20]`, and also of itself. So there are exactly $n!$ rank patterns, and they are the only inputs we ever need to consider.

So when we ask what an algorithm costs on $n$ elements, there are $n!$ inputs to look at. But it usually doesn’t cost the same on all of them. Take the simplest comparison algorithm there is: checking whether a list is sorted. It is lesson 1’s neighbour test: it walks along the side-by-side pairs and asks of each “is it the wrong way round?”, that is, whether the right one is smaller than the left one, “is $b_{i+1} < b_i$?”. It stops at the first yes, because that pair is out of order. On $[1, 0, 2, 3]$ the very first question, “is 0 < 1?”, gets a yes, so the check stops after 1 comparison. On the sorted $[0, 1, 2, 3]$ every answer is no, so it has to ask all 3. (§04 will show Python’s own sort varying in the same way, and by much more.)

So “its cost for $n$ elements” isn’t a single number until we say how to summarise over all the inputs. The two simplest summaries are the most it ever needs and the least it ever needs. The most is a guarantee: whatever the input, the algorithm never needs more. The least tells us how cheap the luckiest input can be.

> **Definition (worst and best case)**
>
> For an algorithm $A$ and input $x$, let $C_A(x)$ be the number of comparisons $A$ makes on $x$. The **worst case** is $W_A(n) = \max C_A(x)$ and the **best case** is $B_A(n) = \min C_A(x)$, both over all inputs $x$ of size $n$; by Lemma 3, over the $n!$ rank patterns.

For the sortedness check on 4 elements, that gives $B(4) = 1$, reached on $[1, 0, 2, 3]$, and $W(4) = 3$, reached on $[0, 1, 2, 3]$. Every run asks at least the first question, and at most the 3 questions for the 3 neighbour pairs. (Averages need a stated probability distribution over the inputs, so they wait until lesson 10, which introduces one.)

#### Checkpoint 2

**Q4.** Which of these is **not** allowed in the comparison model?

- **(a)** Ask whether `a[3] < a[5]`.
- **(b)** Swap `a[3]` and `a[5]`.
- **(c)** Compute `a[3] % 10`.
- **(d)** Store the index 5 in a variable.

<details>
<summary>Hint 1</summary>

For each option, ask: does it learn something about the elements? If so, does it learn it through a yes/no `<` question?

</details>

<details>
<summary>Hint 2</summary>

Three of the options either ask `<` or never look at a value at all. One of them needs to know which number is actually stored in `a[3]`.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. That’s allowed. In fact it’s the one question the whole model is built around: it gets a yes/no answer and costs one comparison.
- **(b)** ✗. Swapping is allowed: it’s a move. Moves are counted separately from comparisons, and they can’t reveal anything about the elements, because a swap does the same thing whatever the two values are.
- **(c)** ✓ correct. Yes, this is the forbidden one. To compute `a[3] % 10` you have to look inside the element and do arithmetic on its value. But the model treats elements as closed boxes that can only be compared. Arithmetic on keys is excluded on purpose; lesson 30 shows what changes once it’s allowed.
- **(d)** ✗. That’s allowed, and free. 5 is a position, not an element. Bookkeeping on indices and counters never touches the elements, so it tells the algorithm nothing about them.

</details>

<details>
<summary>Worked solution</summary>

The model allows exactly one way of learning about the elements: asking whether one is smaller than another. Anything else is allowed only if it doesn’t look at the elements’ values. Let’s go through the options with that in mind.

(a) `a[3] < a[5]` is precisely that one question: allowed, and it costs one comparison. (b) A swap moves two elements, but it does the same thing whatever their values are, so it learns nothing: allowed, and counted as a move. (d) Storing the index 5 is bookkeeping on positions, which never touches an element: allowed, and free.

(c) is different. `a[3] % 10` takes the value inside `a[3]` and does arithmetic on it, learning something (its remainder on division by 10) without asking `<`. That is exactly what the model rules out, so (c) is the one that isn’t allowed.

</details>

**Q5.** Why may we analyse only inputs that are permutations of $0, \ldots, n-1$?

- **(a)** Because of Lemma 3: the algorithm behaves identically on all inputs with the same rank pattern, and with distinct keys every input has one of these $n!$ patterns.
- **(b)** Because real inputs are usually small integers.
- **(c)** Because Python converts elements to integers before sorting.
- **(d)** Because duplicates never occur.

<details>
<summary>Hint 1</summary>

What can a comparison algorithm actually observe about its input? Which result in §03 turns that into a statement about how it behaves?

</details>

<details>
<summary>Hint 2</summary>

Two inputs with the same rank pattern, like `[10, 30, 20]` and `[1, 99, 50]`, give the same answer to every `<` question. What does Lemma 3 then say about the algorithm’s runs on them?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Exactly. Lemma 3 says the algorithm can’t tell apart two inputs with the same rank pattern, so it does the same comparisons and moves on both. And with distinct keys, every input has one of the $n!$ patterns. Notice that this leans on the model: an algorithm allowed to read digits could tell `[10, 30, 20]` from `[1, 99, 50]`.
- **(b)** ✗. Real inputs can be anything: strings, records, floats. The reduction doesn’t depend on what inputs usually look like. It works because a comparison algorithm can’t see the values at all, only the answers to `<`.
- **(c)** ✗. Python does nothing of the kind: it only ever asks `<` (lesson 2, §01). Replacing an input by its ranks is something *we* do in the analysis, and Lemma 3 is what makes that safe.
- **(d)** ✗. Duplicates are excluded here, but by a separate assumption, A1. On its own, A1 doesn’t justify the reduction. Distinct keys only guarantee that each input’s ranks form a permutation of $0, \ldots, n-1$. What lets us study that permutation instead of the input is Lemma 3: the algorithm behaves the same on both.

</details>

<details>
<summary>Worked solution</summary>

We want to know why studying only the $n!$ permutations of $0, \ldots, n-1$ loses nothing. Two facts combine.

First, with distinct keys (Assumption A1), every input of size $n$ has a list of ranks, and that list is one of those permutations: `[10, 30, 20]` has ranks `[0, 2, 1]`. Second, an input and its rank list give the same answer to every question “is $a_i < a_j$?”. So by Lemma 3, a comparison algorithm runs identically on both: the same comparisons, the same moves, the same output arrangement. So whatever we find out about the algorithm on `[0, 2, 1]` holds for every input with that pattern. That is option (a).

The other options miss the logic. Real inputs needn’t be integers (b). Python never converts anything (c). And the absence of duplicates (d) is needed for the ranks to form a permutation, but on its own it says nothing about how the algorithm behaves.

</details>

**Q6.** A deterministic algorithm in the comparison model makes 3 comparisons on `[5, 1, 4]`. How many does it make on `[50, 10, 40]`?

- **(a)** Exactly 3, the same ones.
- **(b)** It depends on the algorithm.
- **(c)** More, because the numbers are larger.
- **(d)** Fewer, because the gaps are larger.

<details>
<summary>Hint 1</summary>

Compare the two lists from the point of view of someone who can only ask “is this one smaller than that one?”. What’s the same about them?

</details>

<details>
<summary>Hint 2</summary>

Write down each list’s rank pattern (0 for the smallest). Then recall what Lemma 3 says about inputs with the same pattern.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Right. Both lists have rank pattern `[2, 0, 1]`: the first element is the largest, the second the smallest, the third in between. So every `<` question gets the same answer on both, and Lemma 3 says the algorithm does exactly the same thing: the same 3 comparisons, in the same order.
- **(b)** ✗. It would, for an algorithm that reads values. But for any deterministic algorithm in the comparison model, Lemma 3 forces the same run on two inputs with the same pattern, whatever the algorithm is.
- **(c)** ✗. The size of the numbers is invisible in this model. The algorithm only learns answers like “is 50 < 10?”, which is no, exactly as “is 5 < 1?” is no. Bigger numbers don’t add questions or change any answer.
- **(d)** ✗. The gaps between values are invisible too. Only the yes/no answers to `<` reach the algorithm, and they’re the same on both lists, so it can’t take a shortcut on one list that it doesn’t take on the other.

</details>

<details>
<summary>Worked solution</summary>

Let’s look at what the algorithm can see. In `[5, 1, 4]` the first element is the largest, the second the smallest and the third in between: rank pattern `[2, 0, 1]`. In `[50, 10, 40]` it’s exactly the same, `[2, 0, 1]`.

So for every pair of positions $i, j$, the question “is $a_i < a_j$?” gets the same answer on both lists. For example, “is $a_0 < a_1$?” is no on both (5 against 1, 50 against 10), and “is $a_1 < a_2$?” is yes on both. By Lemma 3, a deterministic comparison algorithm asks the same first question on both lists and gets the same answer, so it asks the same second question, and so on. It makes exactly the same 3 comparisons.

“It depends on the algorithm” would be right only for two kinds of algorithm. One kind reads values, which the model forbids. The other kind makes random choices, and Lemma 3 sets those aside by assuming the algorithm is deterministic. “More” and “fewer” assume that the size of the numbers, or the gaps between them, make a difference. But the algorithm never sees either.

</details>

---

## 04 · Watching a real sort count

We now know what to count, and how to summarise the counts over all inputs. That brings back the second loose end from lesson 2: on some lists, Python’s sort was satisfied after far fewer questions than there are pairs. Now we can measure that properly. How many comparisons does the sort you use every day actually make, and how much does that number change from one input to another? The measurement will also show whether the model describes real code, or is just an abstraction that real code ignores.

But can we even count Python’s comparisons? We can’t edit its code. What we can use is that it asks only `<` (lesson 2, §01), and `<` on objects of our own class runs code we write. So the trick is to wrap each element in an object whose `__lt__` adds one to a counter every time it is called. Every comparison the sort makes then shows up in the count. In effect, we are watching Python’s sort live inside the comparison model.

**Listing 1.** *Counting the comparisons any Python sort makes.*

```python
class Counted:
    """Wraps a value and counts every < comparison between wrapped values."""
    comparisons = 0

    def __init__(self, value):
        self.value = value

    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value

def comparisons_used(sort_fn, data):
    Counted.comparisons = 0
    sort_fn([Counted(x) for x in data])
    return Counted.comparisons

print(comparisons_used(sorted, [1, 2, 3, 4, 5]))   # 4
```

Before looking at the numbers, make a guess.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

Python’s `sorted` is given 1000 numbers that are **already sorted**. How many comparisons does it make?

- **(a)** 0: it notices nothing needs doing.
- **(b)** 999
- **(c)** About 10 000
- **(d)** 499 500

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. It would be nice, but the sort can’t know the list is sorted without asking: in the comparison model, comparing is the only way to learn anything about the elements. See below for what it actually does.
- **(b)** ✓ correct. Yes, 999: one comparison per neighbour pair. The full measurements are below.
- **(c)** ✗. That’s the right ballpark for *random* input, as you’ll see below. Sorted input turns out to be much cheaper.
- **(d)** ✗. That would be asking about every pair, $1000 \cdot 999 / 2$. Python’s sort asks far fewer questions than that, even on random input. See below.

</details>

<details>
<summary><b>Reveal</b></summary>

**Table 2.** *Comparisons made by CPython 3.12’s `sorted` (3.12.3) `[empirical]`. Random inputs: 20 samples of distinct values, seed fixed; mean (min–max).*

| n | already sorted | reversed | random | every pair $n(n-1)/2$ |
|---|---|---|---|---|
| 10 | 9 | 9 | 23.0 (21–25) | 45 |
| 100 | 99 | 99 | 534.0 (525–543) | 4 950 |
| 1000 | 999 | 999 | 8629.8 (8596–8664) | 499 500 |

There are three things here to carry forward.

- On sorted input Python uses exactly $n - 1$ comparisons: one per neighbour pair, the same number of questions lesson 1’s neighbour test asks just to *check* sortedness. Lesson 5 shows that $n - 1$ is the least any algorithm can get away with on this input, even one that only has to check whether the list is sorted.
- Reversed input costs the same $n - 1$. Lesson 34 explains how Python’s sort notices it.
- Random input costs far fewer comparisons than every pair, but far more than $n - 1$: for 1000 elements, about 8 630, against 499 500 for every pair and 999 for $n - 1$. Where between those does the true cost of sorting lie? That question drives lessons 4 to 16.

These are measurements of one implementation on particular inputs `[empirical]`. Another Python version, or other inputs, might give other numbers.

</details>

---

## 05 · In Python: testing a sort

Listing 1 will count the comparisons of anything we hand it, fakes included. Hand it fake (d), `return a`, on `[3, 1, 2]`, and it counts 0 comparisons, against 4 for `sorted`. Fakes (a) and (b) make no comparisons either. By that count alone, these three would be the cheapest sorts there are. Yet fake (d) hands back `[3, 1, 2]`, still unsorted. Counting comparisons tells us how many questions a sort asked. It says nothing about whether the answer is right.

From the next lesson on we’ll be writing sorts of our own, and a cost means nothing if the sort is wrong. So every sort we write needs a second check next to its cost: is it correct? The specification hands us that check. It tells us what a sort must do, so it also tells us how to test one. Run the sort on lots of small inputs, including inputs with duplicates, and check both halves of the specification on every output. This is called a *stress test*, because it puts the sort under a flood of inputs to see whether it breaks. It is worth having ready for any contest or interview preparation. Most sorting bugs already show up on small inputs: an off-by-one boundary, a tie handled the wrong way, an element dropped at the end. Thousands of random small inputs hit those cases quickly `[heuristic]`.

**Listing 2.** *Checking the two halves of the specification, and a randomized stress test.*

```python
import random
from collections import Counter

def is_sorted(b):
    """Condition 1: no neighbour pair out of order (uses only <)."""
    return all(not b[i + 1] < b[i] for i in range(len(b) - 1))

def is_permutation(a, b):
    """Condition 2: same elements, same multiplicities."""
    return Counter(a) == Counter(b)

def stress_test(sort_fn, trials=2000, max_n=8, seed=1):
    rng = random.Random(seed)
    for _ in range(trials):
        n = rng.randint(0, max_n)
        a = [rng.randint(0, 3) for _ in range(n)]      # small range: many duplicates
        b = sort_fn(list(a))
        if not (is_sorted(b) and is_permutation(a, b)):
            return a                                    # a failing input
    return None

print(stress_test(sorted))                       # None
print(stress_test(lambda a: sorted(set(a))))     # [3, 3, 1, 0, 3, 0, 3]
```

The last line shows the harness at work. It catches fake (e) with the input `[3, 3, 1, 0, 3, 0, 3]`, on which `sorted(set(a))` returns `[0, 1, 3]`: three elements where there should be seven. Two more things in this harness deserve a comment.

First, `is_permutation` uses `Counter`, which hashes the elements, so it lives outside the comparison model. That’s fine: the harness is a *test* of a sort, not part of one.

Second, notice the small value range in `stress_test`: the values run only from 0 to 3, so duplicates are common. Ties are where a common bug hides. There are two ways to check a neighbour pair, and they differ only on a tie. The *out-of-order* check asks “is the right one smaller than the left one?”, and rejects the pair on a yes. That is lesson 1’s neighbour test, and it is what `is_sorted` does. The *strictly-increasing* check asks “is the left one smaller than the right one?”, and rejects the pair on a no. That is the question of lesson 1’s strict shortcut. On the sorted list 1, 3, 3, 5 the out-of-order check gets no, no, no, and accepts the list. The strictly-increasing check gets a yes for 1 and 3, then a no for 3 and 3, because 3 < 3 is false, so it wrongly rejects the list. On distinct values the two checks always agree, so only inputs with ties tell them apart. Lesson 4 will show a one-character bug that gets exactly this wrong.

---

## EX · Exercises

**E1.** A sorted list has 50 elements. At most how many comparisons does Lemma 1’s method use to decide whether two elements are tied?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Lemma 1 tells you where a tie must show up in a sorted list. How many such places are there in a list of 50 elements?

</details>

<details>
<summary>Hint 2</summary>

Read a sorted list from left to right: each neighbour pair goes up or stays level, never down. What single question tells you which, and so whether the two tie?

</details>

<details>
<summary>Answer and feedback</summary>

- **49** ✓ Yes, 49: one comparison for each neighbour pair, and a list of 50 has 49 of them, (0, 1), (1, 2), …, (48, 49).
- *If you answered 50:* Close, but count the neighbour pairs rather than the elements. The pairs are (0, 1), (1, 2), …, (48, 49): the last element has no right-hand neighbour, so there are 49 pairs, one comparison each.
- *If you answered 98:* Two comparisons per pair would be needed if the list weren’t sorted. To know that two elements tie, you ask “is the left one smaller?” and “is the right one smaller?”, and need a no both times, as with 3 and 3. But read a sorted list from left to right: neighbours go up or stay level, and never go down. So the right one is never the smaller, and the single question “is the left one smaller?” settles it: a no means they tie.
- *If you answered 1225:* That’s $\binom{50}{2}$, the number of all pairs, which is what you’d have to check if the list weren’t sorted. Lemma 1 says that in a sorted list a tie, if there is one, always shows up between neighbours, so only the neighbour pairs need checking.
- *Any other answer:* Not quite. Count the neighbour pairs in a list of 50 elements, then ask how many comparisons each pair needs when the list is already sorted.

</details>

<details>
<summary>Worked solution</summary>

Lemma 1 tells us where to look: in a sorted list, if any two elements tie, then some neighbour pair ties. So we only check neighbour pairs.

How many are there? With 50 elements at positions 0 to 49, the neighbour pairs are (0, 1), (1, 2), …, (48, 49): one starting at every position except the last, so $50 - 1 = 49$ pairs.

How many comparisons per pair? Two elements tie when both questions, “is the left one smaller?” and “is the right one smaller?”, get a no, as with 3 and 3. In a sorted list the second answer is known in advance: read from left to right, neighbours go up or stay level, and never go down. So the one question “is $b_i < b_{i+1}$?” settles it: a “no” means they tie. Total: $49 \cdot 1 = 49$ comparisons. (If you stop at the first tie you find, you can finish sooner. 49 is what it takes when there is no tie, and that is the most it ever needs.)

The tempting wrong answers: 50 counts elements instead of pairs; 98 forgets that sortedness answers one of the two questions for free; and $1225 = 50 \cdot 49 / 2$ checks every pair, which is what you’d have to do without order.

</details>

**E2.** A sorted list holds 1 000 000 values, so a new value could belong in any of 1 000 001 gaps. How many halving comparisons are needed in the worst case?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Each comparison can at best halve the number of gaps still possible. After $k$ comparisons, how many gaps can remain in the worst case, and when is that down to one?

</details>

<details>
<summary>Hint 2</summary>

You need the smallest $k$ with $2^k \ge 1\,000\,001$. Since $2^{10} = 1024$ is just over a thousand, a million is a bit less than $2^{10} \cdot 2^{10}$. Then check whether one fewer would still do.

</details>

<details>
<summary>Answer and feedback</summary>

- **20** ✓ Yes, 20. Nineteen aren’t enough, since $2^{19} = 524\,288 < 1\,000\,001$, but twenty are, since $1\,000\,001 \le 1\,048\,576 = 2^{20}$. A thousand times as many values as in §01 cost only ten more comparisons.
- *If you answered 19:* Very close. But $2^{19} = 524\,288$ is less than 1 000 001, so after nineteen halvings about two gaps can still remain ($1\,000\,001 / 2^{19} \approx 1.9$). One more comparison is needed.
- *If you answered 1000000,1000001:* That’s the cost of checking every element, or every gap, one by one, which is what an unsorted list forces. On a sorted list each comparison halves the gaps still possible, so you only need to count halvings.
- *If you answered 6:* 6 is the number of times you divide a million by 10 to reach 1. But a comparison has only two answers, so it splits the gaps in two, not in ten. The logarithm you want is base 2.
- *Any other answer:* Not quite. Find the smallest $k$ with $2^k \ge 1\,000\,001$. It helps to know that $2^{10} = 1024$, a little over a thousand.

</details>

<details>
<summary>Worked solution</summary>

Think about what each comparison can do. Before any comparison, 1 000 001 gaps are possible. Comparing the value with the middle element gives a yes or a no, and at best that rules out half of the remaining gaps. So after $k$ comparisons, in the worst case, about $1\,000\,001 / 2^k$ gaps can remain. We’re done only when that’s at most 1, that is, when $2^k \ge 1\,000\,001$.

Now build up powers of two: $2^{10} = 1024$, so $2^{20} = 1024 \cdot 1024 = 1\,048\,576$, which is at least 1 000 001. One fewer, $2^{19} = 524\,288$, is not. So the answer is $20 = \lceil \log_2 1\,000\,001 \rceil$.

The bits argument from §01 shows that no yes/no method can do better: 19 answers have only $2^{19} = 524\,288$ combinations, too few to single out one of 1 000 001 gaps. As for the wrong answers: 1 000 000 is the cost of scanning, 19 stops one halving short, and 6 is a base-10 logarithm, which would need questions with ten possible answers.

</details>

**E3.** This test function is meant to check a sorting function on one input. It accepts a wrong sort. Click the line where it draws a wrong conclusion.

```python
 1  def check_sort(sort_fn, a):
 2      b = sort_fn(list(a))
 3      for i in range(len(b) - 1):
 4          if b[i + 1] < b[i]:
 5              return False
 6      return True
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

The specification has two conditions. For each line, ask which condition it helps to check.

</details>

<details>
<summary>Hint 2</summary>

Imagine a “sort” that returns `[]` whatever it’s given. Trace the function with it: which line does it end on, and what does it return?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 6** ✓ Yes, line 6. Reaching it only shows that no neighbour pair of `b` is out of order, which is condition 1. Nothing ever compares `b` with `a`, so condition 2 is never checked, and a “sort” like `lambda a: []` sails through. Line 6 should be `return Counter(b) == Counter(a)` (with `from collections import Counter`).
- *If you picked line 1:* The signature is fine: the function takes the sort to test and one input to test it on. The trouble is in what the function concludes, not in what it receives.
- *If you picked line 2:* This line is fine. Passing a copy, `list(a)`, is good practice: the sort can’t then damage `a`, which you need intact to compare the output against. (Whether the function ever does that comparison is another matter.)
- *If you picked line 3:* The loop visits every neighbour pair, which is exactly what checking condition 1 needs. It is lesson 1’s neighbour test, and lesson 1, Lemma 11 says that for a strict weak ordering, neighbours suffice.
- *If you picked line 4:* This test is right: a neighbour pair is out of order exactly when the later element is smaller, `b[i + 1] < b[i]`.
- *If you picked line 5:* Returning `False` here is correct: one out-of-order neighbour pair already proves that `b` isn’t sorted, so the sort has failed.
- *Any other line:* Which of the two conditions in the specification does this function actually check?

</details>

<details>
<summary>Worked solution</summary>

Let’s match the code against the specification, one condition at a time.

Condition 1 says `b` is sorted. Lines 3–5 check exactly that: they look at every neighbour pair and return `False` at the first one that is out of order. That part is right, and lesson 1, Lemma 11 says that checking neighbours is enough.

Condition 2 says `b` is a permutation of `a`: the same elements, with the same multiplicities. Look for a line that uses `a` after line 2. There isn’t one. So when the loop finishes, the function knows only that `b` is in order, and yet line 6 concludes that the sort is correct.

To see it fail, take `sort_fn = lambda a: []` and `a = [3, 1, 2]`. Then `b = []`, the loop has nothing to check, and line 6 returns `True` for a “sort” that threw every element away. The fix is to make line 6 `return Counter(b) == Counter(a)`, so that `True` means both conditions hold. Lines 1–5 are all fine as they stand.

</details>

**E3b.** Give an input list (integers, at most 8) on which `sorted(set(a))` violates the specification.

*Type your answer in the interactive version of this page; the checker explains every answer.* (Input format, for example: `e.g. 5 2 8`.)

<details>
<summary>Hint 1</summary>

`sorted` always produces an ordered list, so condition 1 can’t fail. Which condition is left, and what could `set` do to it?

</details>

<details>
<summary>Hint 2</summary>

A set keeps only one copy of each value. What happens to a list in which some value appears more than once?

</details>

<details>
<summary>Worked solution</summary>

The output of `sorted(set(a))` is always in order, so condition 1 never fails. We need an input on which condition 2 fails: the output must not be a permutation of the input.

`set(a)` keeps one copy of each distinct value, so any list with a repeated value loses something. Take `[3, 1, 3, 2]`: the set holds 1, 2 and 3, and `sorted` gives `[1, 2, 3]`, three elements where the input had four. One of the 3s is gone, so condition 2 fails. The smallest example is `[1, 1]`, which comes back as `[1]`.

Any list with a duplicate works. A list without one comes back as exactly its sorted arrangement, so it can’t serve as a counterexample.

</details>

**E4.** An algorithm makes 3 comparisons on the sorted input of size 4 and 6 on every other input of size 4. What are its best and worst case for $n = 4$?

- **(a)** $B(4) = 3$, $W(4) = 6$.
- **(b)** $B(4) = W(4) = 6$, since only one input is cheaper.
- **(c)** The average, $(3 + 23 \cdot 6)/24$.
- **(d)** They cannot be determined without running it on every input.

<details>
<summary>Hint 1</summary>

Go back to the definitions: the best and worst case are a minimum and a maximum. Over which set of inputs?

</details>

<details>
<summary>Hint 2</summary>

List the cost on each of the $4! = 24$ rank patterns of size 4: one pattern costs 3 and the other 23 cost 6. What are the smallest and the largest values on that list?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. The best case is the fewest comparisons over all inputs of size 4, and the sorted input gets away with 3. The worst case is the most, and every other input costs 6. So $B(4) = 3$ and $W(4) = 6$.
- **(b)** ✗. It’s true that only one input is cheap, but the best case doesn’t care how many inputs achieve it. It’s a minimum over all inputs, and a single input costing 3 is enough to make that minimum 3.
- **(c)** ✗. That’s the average over the 24 rank patterns taken as equally likely, $141/24 = 5.875$. It’s a legitimate number, but it needs a stated probability distribution over the inputs, and it is neither the best nor the worst case. Lesson 10 introduces averages properly.
- **(d)** ✗. No need to run anything: the question already tells us the cost on every input of size 4. By Lemma 3 every input behaves like one of the 24 rank patterns. We know the count for each pattern, so we can read off the smallest and the largest.

</details>

<details>
<summary>Worked solution</summary>

By definition, $B(4)$ is the fewest comparisons the algorithm makes on any input of size 4, and $W(4)$ is the most. By Lemma 3 we only need to look at the $4! = 24$ rank patterns.

The question gives us the cost on every one of them: the sorted pattern `[0, 1, 2, 3]` costs 3, and each of the other 23 costs 6. The smallest value on that list is 3 and the largest is 6, so $B(4) = 3$ and $W(4) = 6$.

Why the others fail: a single cheap input is enough to set the minimum, so (b) is wrong. (c) computes an average, $(3 + 23 \cdot 6)/24 = 141/24 = 5.875$, which is a different summary and needs a probability distribution. And (d) forgets that the question has already told us the cost on every input.

</details>

---

## Ledger

**Established**

- In a sorted list, tied elements are neighbours, so $n-1$ comparisons detect a tie `[proof]` §01
- Singling out one of $m$ possibilities with yes/no answers needs at least $\log_2 m$ of them, and halving achieves $\lceil \log_2 m \rceil$ when every answer can halve `[proof]` §01
- Specification: the output is sorted **and** a permutation of the input; there are $n!$ candidates and, for distinct keys, exactly one is sorted `[proof]` §02
- The comparison model; a deterministic comparison algorithm behaves identically on inputs with the same rank pattern, so $n!$ patterns are all the inputs there are `[proof]` §03
- CPython 3.12’s sort uses $n - 1$ comparisons on sorted and on reversed input of size 10, 100 and 1000, and far fewer than $n(n-1)/2$ on random input `[empirical]` §04

**Assumptions in force**

- Model: comparison model; cost = number of comparisons; worst case unless stated.
- Keys: A1, all keys distinct, so $<$ is a strict total order.

**Lenses in use**

- None formally yet. Two seeds: a comparison is a yes/no answer worth at most one bit (§01), and Python’s real sort can be measured in comparisons (§04).

**Reasoning tools acquired**

- A specification as precondition and postcondition; testing both halves.
- Reducing inputs to rank patterns (only possible because of the model).
- Logarithms as halvings and as bits.
- Instrumenting comparisons; stress-testing a sort by checking both halves of the specification on thousands of small inputs with many duplicates.

**Open gaps**

*(Your open gaps are listed here in the interactive version.)*

> **Open question**
>
> The task and the rules are now exact: find the one sorted arrangement among $n!$, learning only through comparisons. What is the simplest algorithm that is certainly correct, and how many comparisons does it make?

---

**Next:** [Lesson 4: What is the simplest certainly-correct way to sort, and what does it waste?](lesson4.md)
