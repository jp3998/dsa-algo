# Lesson 1: What does it mean for things to be in order?

*Stage 0 · Foundations*

> This is the Markdown edition of the interactive page. Exercises show their answers, feedback, hints and worked solutions in collapsible blocks: try each one before opening them.

## Where we are

This is where the course begins, so let’s start with a question that sounds almost too simple to ask: what does it actually mean to put things in order?

Every later lesson asks how cheaply we can sort, and why sorting costs what it costs. But we can’t talk about the cost of producing something until we know exactly what we’re producing. “Put these in order” feels obvious, and this lesson is going to shake that feeling. We’ll look at four requests that sound alike and behave completely differently. Along the way we’ll find a handful of properties of a request. They decide what a correct answer is, whether there is one at all, and how many there are.

Depends on: nothing. Background assumed: algebra, logarithms, proof by induction.

## Prerequisite check

The statement “for every x, if P(x) then Q(x)” is **false**. What does that tell you?

- **(a)** There is at least one x for which P(x) is true and Q(x) is false.
- **(b)** P(x) is false for every x.
- **(c)** There is an x for which Q(x) is true and P(x) is false.
- **(d)** Q(x) is false for every x.

<details>
<summary>Hint 1</summary>

Think of the statement as a promise made about every x. What would a single x have to look like to break that promise?

</details>

<details>
<summary>Hint 2</summary>

A promise “if P then Q” is broken only when the condition happens and the conclusion doesn’t. Which option describes such an x?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. A promise of the form “for every x, if P(x) then Q(x)” is broken only by an x that meets the condition but misses the conclusion. One such x is enough to break it. Later in this lesson we’ll use counterexamples of exactly this shape, to show that a proof really needs one of its assumptions.
- **(b)** ✗. That would actually make the statement true, not false. If no x meets the condition, the “if … then” is never put to the test, so it can’t fail anywhere (we say the statement is vacuously true). To break the statement you need an x where P holds and Q fails.
- **(c)** ✗. That x doesn’t hurt the statement at all: when P(x) is false, “if P(x) then Q(x)” says nothing about it. It’s easy to get the direction backwards; the breaking case is P true and Q false.
- **(d)** ✗. That’s far more than we know. One x with P(x) true and Q(x) false already makes the statement false, and it tells us nothing about Q at any other x.

</details>

<details>
<summary>Worked solution</summary>

Let’s read “for every x, if P(x) then Q(x)” as a promise about every x: whenever P holds, Q holds too. When is a promise like that broken? Only when we find an x where the condition P(x) holds but the conclusion Q(x) doesn’t. An x where P(x) is false can never break it, because the promise says nothing about such an x. So the statement is false exactly when at least one x has P(x) true and Q(x) false.

Here is why each of the other options is wrong. If P(x) were false for every x, the promise would never be put to the test. Then the statement would be (vacuously) true, the opposite of what we were told. An x with Q(x) true and P(x) false has the direction backwards: the promise says nothing about it. And “Q(x) is false for every x” claims far more than one broken case can tell us.

</details>

You want to prove a statement S(n) for every n ≥ 1 by induction. What do you need to show?

- **(a)** S(1), and that S(k) implies S(k+1) for every k ≥ 1.
- **(b)** S(1) and S(2).
- **(c)** That S(k+1) implies S(k) for every k.
- **(d)** S(n) for n = 1, …, 10, chosen at random.

<details>
<summary>Hint 1</summary>

Picture a row of dominoes, one for each n. What do you need to be sure that every one of them falls?

</details>

<details>
<summary>Hint 2</summary>

The first domino has to fall, and each falling domino has to knock over the next. Which option gives you both?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Exactly: the base case gets the chain started, and the step carries it from each n to the next, so it reaches every n. In this lesson the step will often look like “remove one element and apply the statement to the remaining n − 1”.
- **(b)** ✗. Checking two cases shows those two cases and nothing more: S(3) could still fail. What carries the truth from each n to the next is the step S(k) ⇒ S(k+1), and that’s missing here.
- **(c)** ✗. This runs the implication backwards. It lets you walk down from a large n to smaller ones. But nothing starts the chain at n = 1 and moves it up, so no S(n) ever gets proved.
- **(d)** ✗. However many cases you check, infinitely many n stay unchecked, and S(11) might be the one that fails. Induction replaces endless checking with one general step.

</details>

<details>
<summary>Worked solution</summary>

We want S(n) for infinitely many n, so we can’t check them one at a time; we need a way to get from each n to the next. That’s the inductive step: show that whenever S(k) is true, S(k+1) is true as well. On its own the step proves nothing, because it only passes truth along, and something has to be true first. That’s the base case, S(1). With both in hand, S(1) gives S(2), S(2) gives S(3), and so on, reaching every n ≥ 1. So you need S(1) and the step S(k) ⇒ S(k+1).

Checking S(1) and S(2), or any ten cases, leaves infinitely many n unproved. And S(k+1) ⇒ S(k) points the wrong way: it moves truth from bigger n down to smaller ones, so starting from n = 1 it never gets anywhere.

</details>

<details>
<summary><b>Going deeper · Notation primer</b></summary>

- A **set** is written with braces: $\{a, b, c\}$. Order and repetition inside braces do not matter.
- An **ordered pair** $(x, y)$ is different from $(y, x)$ when $x \neq y$. Relations are sets of ordered pairs.
- “**iff**” means “if and only if”: each side implies the other.
- **Negating** “for every x, if P(x) then Q(x)” gives “for some x, P(x) and not Q(x)”.
- **Induction** on n: prove S(1), then prove S(k) ⇒ S(k+1). **Strong induction**: prove S(n) assuming S(m) for every m < n. We will use both.
- $n!$ (“n factorial”) is $1 \cdot 2 \cdots n$, with $0! = 1$.

</details>

---

## 01 · Four requests

Let’s begin with four requests. As you read them, notice how alike they sound. In everyday words, each one says “put these in order”.

- **(A)** Put the numbers 7, 2, 9, 4 in increasing order.
- **(B)** Put four people in order of age, youngest first: Ana (30), Ben (25), Cy (30), Dee (22).
- **(C)** Put four tasks in order, so that every task comes after the tasks it needs:
   a = write the code; b = write the tests; c = run the tests (needs a and b); d = review the tests (needs b).
- **(D)** Put rock, paper and scissors in order, so that each winner comes before the item it beats. (Rock beats scissors, scissors beats paper, paper beats rock.)

Before reading on, make a guess for each one. Does it have exactly one correct answer, several, or none at all? Don’t worry about being right. The point is to commit to an opinion we can then test.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

For each request, how many correct answers are there?

*Categories:* **Exactly one valid order** · **More than one** · **No valid order**

1. (A) numbers 7, 2, 9, 4
2. (B) people by age
3. (C) tasks
4. (D) rock, paper, scissors

<details>
<summary>Your prediction, compared</summary>

1. **Exactly one valid order.** Right, just one. Only 2 can go first. Any other number, say 7, has a smaller number, 2, that would have to come before it. After 2 only 4 can come next, then 7, then 9. We never get a choice, so 2, 4, 7, 9 is the only answer.
   - *If you chose More than one:* Try to build a second answer and see where you get stuck. Could 7 go first? Then 2 would stand after 7, but 2 is smaller, so 2 should come first. The same goes for 4 and 9. So the first number has to be the smallest, 2. The same argument then fixes 4, then 7, then 9. There’s never a choice, so there’s only one answer.
   - *If you chose No valid order:* There is an answer: 2, 4, 7, 9 is in increasing order. In fact it’s the only one, because at every step only one number can go next.
2. **More than one.** Right, two. Dee (22) has to come first and Ben (25) second. Ana and Cy are both 30, so neither is younger and either can come third: Dee, Ben, Ana, Cy and Dee, Ben, Cy, Ana.
   - *If you chose Exactly one valid order:* Ask who comes third, Ana or Cy. They’re both 30, so age doesn’t separate them, and the request has no other rule. Both choices are correct, which makes two answers.
   - *If you chose No valid order:* There is an answer: Dee, Ben, Ana, Cy, with ages 22, 25, 30, 30. In fact there are two, because Ana and Cy are the same age and can swap.
3. **More than one.** Right, several: five, in fact (abcd, abdc, bacd, badc, bdac). Tasks a and b need nothing, so either can start, and more choices follow. The reveal below walks through them.
   - *If you chose Exactly one valid order:* Look at the very first step: a and b both need nothing, so either one can start. That already gives at least two answers (there are five in all).
   - *If you chose No valid order:* There is an answer: in a, b, c, d, task c comes after a and b, and d comes after b, so every task follows the tasks it needs.
4. **No valid order.** Right, none. Think about what goes first. If something beats it, the winner would have to stand even earlier, and nothing stands before the first item. So the first item must be one that nothing beats. But paper beats rock, scissors beats paper and rock beats scissors. Every item is beaten by something, so nothing can go first, and no order works.
   - *If you chose Exactly one valid order or More than one:* Try to pick the first item. Whichever you pick, something beats it, and the winner would have to come before it. Every item is beaten by one of the others, so nothing can go first and no order works.

</details>

<details>
<summary><b>Reveal</b></summary>

One, two, five and none. If any of those surprised you, especially the “none”, you’re in good company. Let’s see where the numbers come from. The way we count them turns out to be the key idea of this whole lesson.

Imagine building an answer by hand, one position at a time. The first thing to decide is what goes first. So you ask: which items are allowed to go first? Take the people. Can Ben go first? No: Dee is younger, so Dee has to come before Ben. Can Dee go first? Yes: nobody has to come before Dee. So you set Dee down. Then you ask the same question about the people who are left, and so on, until everyone is placed.

That gives us a way to count. Every correct answer can be built by a run of these choices, and different choices build different answers. So the number of answers is the number of ways we can keep on choosing `[intuition]` (§04 turns this into a proof). Fig. 1 draws the choices for all four requests. Let’s walk through them.

**Fig. 1.** *Counting answers by asking, at every step, which items can go first. Each path from left to right is one correct answer.*

```text
(A)  2 ── 4 ── 7 ── 9                          → 2 4 7 9
     only 2, then only 4, then only 7, then 9
                                                  1 answer

(B)  Dee ── Ben ──┬── Ana ── Cy                → Dee Ben Ana Cy
                  └── Cy ── Ana                → Dee Ben Cy Ana
                                                  2 answers

(C)  a ── b ──┬── c ── d                       → a b c d
              └── d ── c                       → a b d c
     b ──┬── a ──┬── c ── d                    → b a c d
         │       └── d ── c                    → b a d c
         └── d ── a ── c                       → b d a c
                                                  5 answers

(D)  rock      ✗  paper must come first
     paper     ✗  scissors must come first
     scissors  ✗  rock must come first
                                                  nothing can go first: 0 answers
```

- **(A)** Which number can go first? Only 2: any other number has something smaller that would have to come before it. Once 2 is down, only 4 can go next, then 7, then 9. We never had a choice, so there is exactly **one** answer.
- **(B)** Who can go first? Only Dee: Ben, Ana and Cy are all older than Dee, so Dee would have to come before each of them. Next, only Ben can go, because Ben is younger than both Ana and Cy. Now something new happens: Ana and Cy can *both* go next, since they are the same age. Whichever we pick, the other follows. One moment of choice with two options gives **two** answers.
- **(C)** Which task can go first? Both a and b, since neither needs anything. Let’s follow each choice. If a goes first, only b can follow, because c and d both need b. After that, c and d can go in either order: two answers. If b goes first, then a and d are both free, because d only needed b. After b, a, the tasks c and d can again go either way: two more answers. After b, d, only a is free (c still needs a), and then c: one more answer. Altogether 2 + 2 + 1 = **five**.
- **(D)** Which item can go first? Try rock: paper beats rock, so paper would have to come before it. Try paper: scissors would have to come first. Try scissors: rock would. Nothing can go first, so we can’t even begin, and there is **no** answer at all.

So the counts come straight from the choices. If exactly one item can go next at every step, you get one answer. If two or more can go next at some step, the answers branch. And if at some step nothing can go next, there is no answer.

Now look back at *how* we answered “which items can go first?”, because there’s something worth noticing. To rule rock out, we needed just one fact: paper beats rock. To see that Dee could go first, we compared Dee with Ben, then with Ana, then with Cy, one at a time. To see that task d was free once b was down, we looked only at d and b. Every question we asked was about two items. We never asked about three or four items at once, and we never needed to. Notice also what *didn’t* matter: what the items are. Numbers, people, tasks, hand shapes: all we ever used was the answer to “of these two, does one have to come first, and which?”.

That leaves us with a puzzle. (D) answers every one of those two-item questions just as clearly as (A) does: rock before scissors, scissors before paper, paper before rock. Yet (A) has exactly one answer and (D) has none. So clear answers about pairs are not always enough to build a whole row. Something can go wrong on the way from pairs to a row, and we don’t yet know what. That’s the first thing to find out, because until we know, we can’t even say which requests have an answer.

</details>

---

## 02 · From a rule about pairs to a whole order

Let’s look closely at what a request actually tells us. Read the four requests again, and think about pairs. “Increasing order” tells you, for any two numbers, which goes first: the smaller one. “Youngest first” tells you, for any two people, which goes first: the younger one. If they’re the same age, it doesn’t care. “Every task after the tasks it needs” tells you, for any two tasks, whether one has to come before the other, and which. “The winner first” tells you, for any two hand shapes, which goes first. That is all each request says. None of them says anything directly about three or four items at once. And none of them hands you the finished order.

So, for any two items, a request tells you one of three things: *this one first*, *that one first*, or *it doesn’t matter*. Everything we did in §01 came down to these answers about pairs. So let’s give this part of a request a name: we’ll call it the request’s *rule*. The rule is simply what the request says about two items at a time.

Now the puzzle becomes a question about rules. If a rule only ever tells us about two items at a time, is that enough to put all of them in order? For (A) it was. For (D) it wasn’t. To see why, let’s start with something easier than building a row: checking one. If someone hands us a whole row, how can the rule tell us whether it’s right?

Let’s try it on a row we already know is right: Dee, Ben, Ana, Cy. The rule can only talk about two people at a time, so let’s ask it about the row two people at a time. Dee and Ben: Dee is younger and stands first. Good. Dee and Ana, then Dee and Cy: the same again, Dee is younger and stands first. Ben and Ana, then Ben and Cy: Ben is younger and stands first. Ana and Cy: they’re the same age, so the rule doesn’t mind which of them comes first. That’s every pair in the row, six of them, and the rule is happy with each one.

Now a row that’s wrong: Ben, Dee, Ana, Cy. Ask the rule about Ben and Dee, and it says Dee comes first: Dee is younger, but stands second. That one pair is enough to make the row wrong. So this is what “the row follows the rule” means: *go through every pair in the row, and none of them is the wrong way round.* And that’s good news. Even though the rule only ever talks about two items at a time, it can check any row we show it.

But checking a row is not the same as building one. Can we build a right row using only what the rule says about pairs? We already did, back in §01. Each time, we asked “which items can go first?”. To see that Dee could go first, we asked the rule about Dee and Ben, then Dee and Ana, then Dee and Cy, and found that nobody had to come before Dee. Every step went like that, one pair at a time. So §01’s way of building a row only ever asks the rule about two items at a time.

For (A), (B) and (C) it works: §01 built every one of their answers this way. And when this way of building gets all the way to the end, the row it builds really does pass the check. Think about why. When we put Dee down first, we had already checked that nobody had to come before Dee. So everyone who ended up after Dee was allowed to stand there. Then Ben went down, once nobody left had to come before Ben, so everyone after Ben was allowed there too. Every item went down the same way. So when the check goes through the pairs of the finished row, it finds none the wrong way round. For these three requests, what the rule says about pairs was enough to build a whole row.

Then comes (D). For every pair in (D), the rule says clearly which comes first: rock before scissors, scissors before paper, paper before rock. Each one, on its own, is easy to satisfy. And yet our way of building gets stuck at the very first step: nothing can go first, and no row passes.

What went wrong? On paper, the three pairs look separate. But once they have to live together in one row, they affect each other. If a row puts rock before scissors, and scissors before paper, then it has *already* put rock before paper, whether we like it or not. In a row, “before” carries over from one pair to the next. But the rule of (D) says the opposite, paper before rock. So each of the three pairs is easy to satisfy on its own, but no row can satisfy all three at once.

That solves our puzzle. When what the rule says about its pairs fits together, as in (A), (B) and (C), it is enough to build a whole row. When the pairs clash, as in (D), no row can satisfy them all. Whether they fit depends on the rule, not on how clearly it speaks. And when they do fit, the pairs where the rule says “it doesn’t matter” leave room to choose. That is why (B) and (C) have more than one answer.

This leaves us with two questions, and the rest of the lesson answers them.

The first: for which rules do the pairs fit together, so that at least one row passes? For our four requests we found out by trying. But we can’t try every rule there is. We want something we can check on the rule itself. §03 finds it.

The second: when the pairs do fit together, how many rows pass, and when is there exactly one? In §01, every choice came from a pair where the rule said “it doesn’t matter”: Ana and Cy in (B), a and b in (C). So those pairs decide the count. §04 to §06 make this exact.

Both questions are about *every* rule, not just our four. So we can’t keep answering them by looking at examples. We need a way to write down any rule completely, in a form we can reason about.

What is the simplest complete record of a rule? Everything a rule says is about two items at a time. So we can write each “this one first” answer as a pair $(x, y)$, meaning “$x$ must come before $y$”, and collect the pairs in a list. For request (B) the list is

> (Dee, Ben), (Dee, Ana), (Dee, Cy), (Ben, Ana), (Ben, Cy).

Let’s check that nothing has been lost. Must Ben come before Cy? (Ben, Cy) is on the list, so yes. Must Cy come before Ben? (Cy, Ben) isn’t on the list, but (Ben, Cy) is, so no: Ben goes first. Must Ana come before Cy? Neither (Ana, Cy) nor (Cy, Ana) is on the list, so it doesn’t matter. All three kinds of answer can be read off the list. Notice, too, that the order inside each pair matters: (Ben, Ana) says Ben goes first, and (Ana, Ben) would say the opposite. So these are *ordered* pairs. Table 1 writes all four rules this way.

**Table 1.** *The four rules, each written as its list of “must come before” pairs.*

| Request | Pairs $(x, y)$ with $x$ before $y$ |
|---|---|
| (A) numbers | (2, 4), (2, 7), (2, 9), (4, 7), (4, 9), (7, 9) |
| (B) ages | (Dee, Ben), (Dee, Ana), (Dee, Cy), (Ben, Ana), (Ben, Cy) |
| (C) tasks | (a, c), (b, c), (b, d) |
| (D) rock, paper, scissors | (rock, scissors), (scissors, paper), (paper, rock) |

A list of ordered pairs like this has a name in mathematics: a *relation*. We’ll be saying “$(x, y)$ is on the list” all the time, so let’s give it a symbol.

> **Definition (relation)**
>
> A **relation** on a set $X$ is a set of ordered pairs $(x, y)$ with $x, y \in X$: the list of pairs for which a rule answers “yes”. We write $x \prec y$ when $(x, y)$ is in the relation, and read it “$x$ must come before $y$”.

Why the symbol $\prec$? It looks like a curved $<$, and that’s on purpose: it does the job of $<$ for any rule, not just for numbers. Writing out the whole list gets long quickly: $n$ items have $n(n-1)$ ordered pairs of distinct items. So in practice we describe a relation by the rule that produces it:

- (A) $x \prec y$ iff $x < y$.
- (B) $p \prec q$ iff $p$ is younger than $q$.
- (C) $x \prec y$ iff $y$ needs $x$, directly or through other tasks. (“Through other tasks” matters when needs form a chain: if d needed c, then d would also need a, through c. In (C) there are no such chains: d needs b, c needs a and b, and a and b need nothing. So the list is exactly the three pairs of Table 1.)
- (D) $x \prec y$ iff $x$ beats $y$.

What about the third answer, “it doesn’t matter”? On the list it shows up as a gap. Neither (Ana, Cy) nor (Cy, Ana) is there, because the rule doesn’t care which of the two comes first. We’ll call a pair like Ana and Cy **unconstrained**: the rule puts no constraint on its order. Tasks a and b are another unconstrained pair. In symbols, an unconstrained pair $p, q$ has neither $p \prec q$ nor $q \prec p$. Keep these pairs in mind. They are exactly where the choices in §01 came from.

Now we can say exactly what “the wrong way round” means. Take any two people in a row: one stands earlier, the other later. There are three possibilities:

- **in the right order**: the rule says the earlier one comes first, and so it does, like Dee before Ben. Fine.
- **unconstrained**: the rule doesn’t care, like Ana and Cy. Either order is fine.
- **out of order**: the rule wants the later one first, like Ben before Dee: Dee is younger, but stands second. This is the only case that breaks the request.

The check looks at every pair in the row, not only people standing side by side. Dee has to come before Cy wherever the two of them stand. So here is the definition we’ll use from now on. It says the same thing in symbols: positions $i < j$ mean “one earlier, one later”, and $x_j \prec x_i$ means “the later one should have come first”.

> **Definition (sorted arrangement)**
>
> An arrangement $x_0, x_1, \ldots, x_{n-1}$ of the elements is **sorted** with respect to $\prec$ if no pair is out of order: there are no positions $i < j$ with $x_j \prec x_i$. A pair of positions $i < j$ with $x_j \prec x_i$ is called an **out-of-order pair**.

Let’s try the definition on (B). Read the ages of Dee, Ben, Ana, Cy from left to right: 22, 25, 30, 30. They never go down. So no pair is out of order, and the row is sorted. Now swap Ana and Cy: Dee, Ben, Cy, Ana. The ages still read 22, 25, 30, 30, so this row is sorted too. Those are exactly the two answers we found in §01. From now on, “a correct answer” has a precise meaning: a sorted arrangement.

Let’s call this test **the full check**. It is thorough, but it is a lot of work. For four people it looks at six pairs, and for $n$ items at $n(n-1)/2$ pairs, which grows fast. Is there a quicker way? Think about how you check a row of numbers like 2, 4, 7, 9 at a glance. You don’t compare every pair. You run your eye along the row and check that each number is smaller than the next: 2 < 4, 4 < 7, 7 < 9.

Let’s turn that habit into a test for people, and call it **the strict shortcut**: go along the row and check that each person is strictly younger than the next. Here are the two tests side by side, on the row Dee, Ben, Ana, Cy:

- **The full check** looks at all six pairs. About each pair it asks: is it the wrong way round?
- **The strict shortcut** looks only at the three pairs standing side by side: Dee and Ben, Ben and Ana, Ana and Cy. About each of them it asks a stricter question: is the left person strictly younger than the right one?

So the shortcut changes two things at once. It looks at fewer pairs, three instead of six. And it asks more of each pair: not just “is it the wrong way round?”, but “does the left one have to come first?”. Is it still a fair test of request (B)?

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

The four people can stand in 24 different rows. How many of them pass the strict shortcut (each person strictly younger than the next)?

- **(a)** Two: the two correct answers.
- **(b)** One.
- **(c)** None.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. It’s a natural guess, since those two rows are the correct answers. But the shortcut asks more than the request does, and even these two fail it. The reveal below shows where.
- **(b)** ✗. Which one would it be? Try Dee, Ben, Ana, Cy and check its last step, from Ana to Cy: is Ana strictly younger than Cy?
- **(c)** ✓ correct. Yes, none at all, not even the two correct answers. The reveal below shows why.

</details>

<details>
<summary><b>Reveal</b></summary>

None. The strict shortcut wants the ages to go up at every step. If they go up at every step, they go up all the way along the row, so no age can appear twice. But Ana and Cy are both 30. So every row fails somewhere. Even our correct answer Dee, Ben, Ana, Cy fails, at its last step: is Ana (30) strictly younger than Cy (30)? No. The shortcut throws out a row that the request accepts.

The shortcut does no better on (C). There it asks, at each step, whether the next task needs the one before it. A row of all four tasks would need a chain of four, each task needing the one before. But the longest chain in (C) has two tasks, for example b, then d (d needs b). So no row of the tasks passes either.

</details>

So what went wrong? In both examples the trouble came from the stricter question, not from looking at neighbours. The request never asked that each person be younger than the next. It only rejects a pair that is the wrong way round, like Ben before Dee. Ana next to Cy is fine for the request, because the rule doesn’t care about their order. The shortcut calls it a failure anyway.

That suggests a repair: keep the cheap part and drop the strict part. Look only at neighbours, three checks instead of six, but ask each neighbour pair the request’s own question: is it the wrong way round? Let’s call this repaired version **the neighbour test**. Can it be trusted? The answer depends on the rule, and we’ll work it out in §05 and §06.

Until then, we use the full check. Fig. 2 shows it on a row of numbers, 7, 2, 9, 4, with the rule “smaller first”. A red arc joins each pair that is the wrong way round. Look at 7 and 4. They don’t stand side by side, but they are still the wrong way round: 4 is smaller, so it should come before 7. Only the full check looks at a pair like that.

**Fig. 2.** *The arrangement 7, 2, 9, 4 under $<$. Each red arc joins an out-of-order pair.*

```text
 position :   0     1     2     3
 value    :  [7]   [2]   [9]   [4]

 out-of-order pairs:  positions 0–1 (7 before 2)
                      positions 0–3 (7 before 4)
                      positions 2–3 (9 before 4)
```

How many out-of-order pairs does 7, 2, 9, 4 have under $<$?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

A pair of positions is out of order when the later number is smaller than the earlier one. Do the two positions have to be neighbours?

</details>

<details>
<summary>Hint 2</summary>

Take each number in turn and count the smaller numbers that stand somewhere after it. For 7, those are 2 and 4.

</details>

<details>
<summary>Answer and feedback</summary>

- **3** ✓ That’s it: (7, 2), (7, 4) and (9, 4), the three red arcs of Fig. 2. In each of them the later number is smaller, so under $<$ it should have come first.
- *If you answered 2:* You’ve probably checked only neighbours, which gives (7, 2) and (9, 4). But the definition looks at every pair of positions, and 7 and 4 are out of order even though they don’t stand next to each other.
- *If you answered 6:* 6 is how many pairs of positions a row of four has, $4 \cdot 3 / 2$. Only some of them are out of order: the ones where the later number is smaller than the earlier one.
- *Any other answer:* Not quite. Go through the six pairs of positions one at a time, and keep only those where the later number is smaller than the earlier one.

</details>

<details>
<summary>Worked solution</summary>

Under $<$, a pair of positions is out of order when the later number is smaller than the earlier one. The smaller number is the one that must come first, and here it stands second. And the definition looks at every pair of positions, not just neighbours.

A tidy way to be sure we see every pair is to take each number in turn and look at everything after it:

- 7 (position 0): after it come 2, 9 and 4. Two of them, 2 and 4, are smaller: pairs (7, 2) and (7, 4).
- 2 (position 1): after it come 9 and 4, both larger: no pairs.
- 9 (position 2): after it comes 4, which is smaller: pair (9, 4).
- 4 (position 3): nothing comes after it.

That makes 2 + 0 + 1 = 3 out-of-order pairs, the three red arcs of Fig. 2. If you got 2, you probably checked only neighbours and missed (7, 4), which stand apart. If you got 6, you counted all $4 \cdot 3 / 2 = 6$ pairs of positions, including the three that are in order: (7, 9), (2, 9) and (2, 4).

</details>

---

## 03 · Which rules have answers?

So now we have the full check, and it can judge any row under any rule. But it judges one row at a time. That brings us back to the first question from §02: which rules let at least one row pass? For (D) we could simply try every row. Rock, paper and scissors can stand in only six rows, and you can check that each one has a pair out of order. That’s fine for three items. But ten items can stand in over three million rows. And the question matters: a sorting program handed a rule with no answer could never succeed, however clever it is. So we want a better way. We want to look at the rule itself, without trying rows, and tell whether it has an answer.

Let’s look at (D) once more. What exactly made it fail? In §01 nothing could go first. In §02 its three pairs clashed. Both come from the same shape. Follow the rule from rock: rock must come before scissors, scissors must come before paper, and paper must come before rock. We are back where we started. The “must come before”s run in a loop. And on a loop, no item can go first. Try scissors: rock must come before scissors, so rock would have to stand earlier still. The same happens wherever we start.

A loop like this is called a **cycle**. In general, a cycle is a chain of “must come before”s that comes back to where it started: the first item before the second, the second before the third, and so on, and then the last item before the first again. (D) is a cycle of three. The shortest possible cycle has two items: x before y, and also y before x.

> **Definition (cycle)**
>
> A **cycle** is a sequence of distinct elements $x_1, x_2, \ldots, x_k$ with $k \ge 2$ and $x_1 \prec x_2 \prec \cdots \prec x_k \prec x_1$.

Is a cycle always fatal, or was (D) just unlucky? It’s always fatal, however many other items there are. Here’s why. Put the items in any row you like, and look only at the items of the cycle. One of them stands earliest. Say it’s rock. On the cycle, one item must come just before rock: paper. But paper stands later than rock, because rock is the earliest of the three. So paper and rock are the wrong way round. Whichever cycle item stands earliest, the same thing happens: the item that must come just before it stands later. So every row has a pair out of order.

> **Lemma 1 (a cycle forbids order)**
>
> If $\prec$ has a cycle, no arrangement is sorted.

> **Proof**
>
> Take any arrangement. Among the elements of the cycle, let $x_m$ be the one at the earliest position. The element just before it on the cycle is $x_{m-1}$ (or $x_k$ if $m = 1$, since the cycle wraps around). That element must come before $x_m$, yet it stands at a later position. So the two form an out-of-order pair. The arrangement was arbitrary, so no arrangement is sorted. ∎

So cycles are the enemy: a rule with a cycle has no answer. We could hunt for cycles in every rule we meet, but there’s a better way. Let’s first understand how a cycle forms. Then maybe we can stop it from forming at all.

Picture a rule with a chain of pairs: x1 before x2, x2 before x3, x3 before x4. On its own, the chain is harmless. The row x1, x2, x3, x4 follows all three. Now add one more pair to the rule, one that links the end of the chain back to its start: x4 before x1. That single pair closes the loop, and suddenly no row works. (D) has exactly this shape, only shorter: the chain is rock before scissors, scissors before paper, and the pair that closes it is paper before rock.

So what exactly is wrong with that closing pair? Look at what the chain already forces. In any row that follows the chain, x1 stands before x2, x2 before x3, and x3 before x4. So x1 stands before x4. The chain never says “x1 before x4” in words, but every row that follows it does that anyway. The closing pair says the exact opposite. In (D), the chain forces rock before paper, and the closing pair says paper before rock. That is the whole cause of a cycle: the rule says something that clashes with what its own pairs already force.

Why doesn’t the rule notice the clash? Because the clash is hidden. The rule speaks about each pair separately. Its list says x1 before x2, x2 before x3, x3 before x4 and x4 before x1, and no two of those four pairs contradict each other directly. The pair that does clash, “x1 before x4”, isn’t on the list at all.

So the first step towards breaking the cycle is to bring the clash into the open. Ask the rule to write down what its chains force: whenever its list says x before y and y before z, it must also say x before z. Applied along our chain, this puts “x1 before x3” on the list, and then “x1 before x4”. Asking this costs nothing, because every row that follows the chain does it anyway. The rule just says so out loud. We’ll say that the rule’s pairs *carry over*.

Now look at the list again. It says x1 before x4, and it also says x4 before x1. The clash is out in the open: the list has both orders of the same pair. And carrying over one more time makes it even plainer. x1 before x4, and x4 before x1, give x1 before x1: an item before itself. In (D) the same steps give rock before paper, and then rock before rock. Every cycle ends up like this. Follow it round, writing down what each step forces, and you come back to the start with the first item listed before itself.

Now breaking the cycle is easy: forbid that one pair. The rule must never say that an item comes before itself. This costs nothing either, since no row can put Dee before Dee. And once the rule’s pairs carry over, this one small ban is enough. A cycle would force “x1 before x1”, which is banned, so the rule can’t contain a cycle. It can’t even list both orders of one pair, because that too would carry over to an item before itself.

Notice that both properties are things every row already follows: in a row, “before” carries over, and nothing stands before itself. All we have done is ask the rule to follow them too. These two properties have names, and so does a relation that has both.

> **Definition (strict partial order)**
>
> A relation $\prec$ on $X$ is a **strict partial order** if it is
>
> - **irreflexive**: $x \prec x$ holds for no $x$;
> - **transitive**: $x \prec y$ and $y \prec z$ imply $x \prec z$.

Transitive is the first property (“pairs carry over”), and irreflexive is the second (“nothing before itself”). “Strict” because nothing comes before itself, as with $<$ rather than $\le$. “Partial” because the rule is allowed to leave some pairs unconstrained, like Ana and Cy: it settles only part of the order.

Now let’s write down, carefully, what we just found. First, the small consequence we noticed on the way: a rule like this can never list both orders of the same pair. It can’t say Dee before Ben and also Ben before Dee, because transitivity would turn that into Dee before Dee.

> **Lemma 2 (asymmetry)**
>
> In a strict partial order, $x \prec y$ and $y \prec x$ never both hold.

> **Proof**
>
> If both held, transitivity would give $x \prec x$, which irreflexivity forbids. ∎

Second, the one we were after: no cycles, of any length. The proof is the argument we just made with x1, …, x4, written for a cycle of any length.

> **Lemma 3 (no cycles)**
>
> A strict partial order has no cycles.

> **Proof**
>
> Suppose $x_1 \prec x_2 \prec \cdots \prec x_k \prec x_1$. From $x_1 \prec x_2$ and $x_2 \prec x_3$, transitivity gives $x_1 \prec x_3$. With $x_3 \prec x_4$ it gives $x_1 \prec x_4$, and so on along the cycle, until $x_1 \prec x_k$. (Formally, induction on $j$ shows $x_1 \prec x_j$ for every $j \ge 2$.) Together with $x_k \prec x_1$, transitivity gives $x_1 \prec x_1$. Irreflexivity forbids it. ∎

Do we really need both properties? Yes, and two small examples show why.

**Transitivity alone isn’t enough.** Take just two people, Dee and Ben, and a rule whose list is (Dee, Ben), (Ben, Dee), (Dee, Dee), (Ben, Ben). Is it transitive? Check every place where two pairs chain together. (Dee, Ben) and (Ben, Dee) chain into “Dee before Dee”, and (Dee, Dee) is on the list. (Ben, Dee) and (Dee, Ben) chain into “Ben before Ben”, and that is on the list too. Any chain that uses (Dee, Dee) or (Ben, Ben) just gives back a pair we started with: (Dee, Dee) and (Dee, Ben) chain into (Dee, Ben) again. So every pair that transitivity asks for is already there, and the rule is transitive. Yet it has a cycle, Dee before Ben and Ben before Dee, and no row can follow it. Transitivity did its part: it followed the cycle round and produced “Dee before Dee”. What’s missing is a rule against that, and that is irreflexivity’s job.

**Irreflexivity alone isn’t enough either.** Rock–paper–scissors is irreflexive, since nothing beats itself. But it isn’t transitive: rock beats scissors and scissors beats paper, yet the rule doesn’t say rock beats paper. So nothing ever follows the cycle round to “rock before rock”, and irreflexivity has nothing to catch.

It takes both. Transitivity follows any cycle round to “x before x”, and irreflexivity forbids exactly that.

Let’s check our four requests against the definition:

- (A) $<$ on numbers is irreflexive and transitive.
- (B) “younger than”: nobody is younger than themselves, and someone younger than a younger person is younger still.
- (C) “needed directly or through other tasks” is transitive by its wording, and irreflexive as long as no task needs itself. A task that needed itself, directly or through others, would be a cycle: the “circular dependency” error that build tools report.
- (D) “beats” is not transitive: rock beats scissors and scissors beats paper, but rock does not beat paper.

So (A), (B) and (C) are strict partial orders, and (D), the request with no answer, isn’t.

Before we celebrate, let’s be honest about what we’ve shown. A rule with a cycle has no answer (Lemma 1). A strict partial order has no cycle (Lemma 3). So a strict partial order avoids the one obstacle we know about. But we haven’t shown that every strict partial order actually *has* an answer. Maybe there is some other obstacle we simply haven’t met yet. §04 settles that.

<details>
<summary><b>Common question · Why strict $\prec$ instead of $\le$?</b></summary>

Two reasons. First, “strictly before?” is the question a sorting algorithm asks: Python’s sort asks only `a < b`. Second, $\le$ gets muddled by ties. Order people by “age $\le$” and you get Ana $\le$ Cy and also Cy $\le$ Ana, although they are different people. The usual non-strict orders forbid exactly that: two different items may never each be $\le$ the other. (That rule is called *antisymmetry*.) So “age $\le$” isn’t a proper non-strict order at all. With the strict form there is no muddle: Ana and Cy are simply unrelated.

</details>

Before moving on, try the two properties on a few relations of your own.

#### Checkpoint 1

**Q1.** Which of these relations is a strict partial order?

- **(a)** $\le$ on the integers
- **(b)** “is a proper subset of” on the subsets of $\{1, 2, 3\}$
- **(c)** “beats” in rock–paper–scissors
- **(d)** “is a sibling of” on people

<details>
<summary>Hint 1</summary>

A strict partial order needs two properties: irreflexive (nothing comes before itself) and transitive. For each option, look for one counterexample to either property; one is enough to rule it out.

</details>

<details>
<summary>Hint 2</summary>

Two of the wrong options pass irreflexivity and fail elsewhere. For “sibling”, ask what transitivity would say about Ana ≺ Ben and Ben ≺ Ana.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. This one fails the first test, irreflexivity: $3 \le 3$, so 3 would have to come before itself. $\le$ is the non-strict cousin of $<$. The strict version, $<$, is a strict partial order (in fact one that settles every pair).
- **(b)** ✓ correct. Yes. No set is a proper subset of itself, so it’s irreflexive, and $A \subsetneq B \subsetneq C$ gives $A \subsetneq C$, so it’s transitive. It also leaves pairs unconstrained, such as $\{1\}$ and $\{2\}$. That makes it a good example of a partial order that doesn’t settle every pair.
- **(c)** ✗. Nothing beats itself, so it is irreflexive, but transitivity fails: rock beats scissors and scissors beats paper, yet rock doesn’t beat paper. That’s no accident: it is the cycle of (D), and Lemma 3 says a strict partial order never has a cycle.
- **(d)** ✗. It passes irreflexivity, since nobody is their own sibling, and that’s the trap. Sibling goes both ways: if Ana is Ben’s sibling, Ben is Ana’s. And Lemma 2 says a strict partial order never relates a pair both ways. Transitivity fails too: Ana ≺ Ben and Ben ≺ Ana would force Ana ≺ Ana.

</details>

<details>
<summary>Worked solution</summary>

A relation is a strict partial order when it is irreflexive (nothing is related to itself) and transitive ($x \prec y$ and $y \prec z$ give $x \prec z$). So for each option we hunt for a counterexample to either property; a single one rules the option out.

- $\le$ on the integers: $3 \le 3$, so it isn’t irreflexive. Out.
- “beats” in rock–paper–scissors: nothing beats itself, so it is irreflexive. But rock beats scissors and scissors beats paper, while rock doesn’t beat paper, so it isn’t transitive. Out.
- “is a sibling of”: nobody is their own sibling, so it is irreflexive. But siblings come in both directions: Ana is Ben’s sibling and Ben is Ana’s. Transitivity applied to those two facts would say that Ana is a sibling of Ana, which is false. Out. (This is Lemma 2 at work: a strict partial order never relates a pair both ways.)
- “is a proper subset of”: no set is a proper subset of itself, and a proper subset of a proper subset of $C$ is a proper subset of $C$. Both properties hold, so this is the strict partial order.

Notice that it doesn’t settle every pair: $\{1\}$ and $\{2\}$ are unrelated, and so are $\{1, 2\}$ and $\{3\}$. That’s fine; “partial” means some pairs may be left unconstrained.

</details>

**Q2.** Someone proposes to “fix” rock–paper–scissors by adding every pair that transitivity calls for. What happens?

- **(a)** It becomes a strict partial order with exactly one sorted arrangement.
- **(b)** Adding the implied pairs eventually forces rock ≺ rock, so it can never become a strict partial order.
- **(c)** It becomes a strict partial order with several sorted arrangements.
- **(d)** It becomes a strict total order.

<details>
<summary>Hint 1</summary>

Start from rock ≺ scissors and scissors ≺ paper. Which pair does transitivity call for, and how does that pair combine with paper ≺ rock?

</details>

<details>
<summary>Hint 2</summary>

Keep applying transitivity around the loop until you reach a pair of the form $x \prec x$. Which property does that break?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. Adding pairs can never remove the cycle: rock ≺ scissors ≺ paper ≺ rock stays on the list. Following transitivity around it eventually adds rock ≺ rock. So the result isn’t even a strict partial order, let alone one with an answer.
- **(b)** ✓ correct. That’s it. Rock ≺ scissors and scissors ≺ paper call for rock ≺ paper, and together with paper ≺ rock that calls for rock ≺ rock. It’s exactly the argument in the proof of Lemma 3. Adding pairs can’t break a cycle; it only brings the contradiction into the open.
- **(c)** ✗. It doesn’t become a strict partial order at all. Every pair you add still follows the loop, and going all the way round forces an item before itself, rock ≺ rock, which irreflexivity forbids.
- **(d)** ✗. It does end up relating every pair, but in both directions, and each item to itself as well: all nine pairs of the three items. That breaks irreflexivity and asymmetry, so it isn’t an order of any kind.

</details>

<details>
<summary>Worked solution</summary>

Let’s just do what the proposal says and watch what happens. We start with rock ≺ scissors, scissors ≺ paper and paper ≺ rock.

- Rock ≺ scissors and scissors ≺ paper: transitivity calls for rock ≺ paper, so we add it.
- Rock ≺ paper and paper ≺ rock: transitivity now calls for rock ≺ rock.

And rock ≺ rock is exactly what irreflexivity forbids. Carrying on only makes things worse: in the end all nine pairs of the three items are on the list, each item with itself included. So no amount of adding implied pairs turns this rule into a strict partial order. That rules out every option that says it becomes one: with one answer, with several, or as a total order.

The moral: a cycle can’t be repaired by adding pairs, because every new pair still follows the loop. The only way out is to remove a pair and so break the loop.

</details>

---

## 04 · Picturing a partial order, and counting its answers

So here is where we stand. (A), (B) and (C) are strict partial orders, and each of them has at least one answer. Two questions are still open. Does *every* strict partial order have an answer? And how many answers does it have? (C) has five and (B) has two. In §01 we answered both questions by hand, with the choice tree, by asking again and again “which items can go first?”. To answer them in general, we’ll make that question precise.

First, though, a list of pairs is hard to read. Look at Table 1. Can you see at a glance which tasks are free to go first, or where the choices are? A picture can show both, and we’ll use pictures like it throughout the course.

What should the picture leave out? The lists in Table 1 are repetitive. Look at (B): once the list has (Dee, Ben) and (Ben, Ana), it has to have (Dee, Ana) as well, by transitivity. Drawing that third pair adds nothing. In general, once a list contains $x \prec y$ and $y \prec z$, it contains $x \prec z$ too. So a good picture shows only the direct steps: pairs like Dee and Ben, where one item comes right after the other with nothing that must come in between. Dee and Ana is not a direct step, because Ben sits between them.

> **Definition (covering pair, Hasse diagram)**
>
> $y$ **covers** $x$ if $x \prec y$ and there is no $z$ with $x \prec z \prec y$. The **Hasse diagram** of $\prec$ (named after the mathematician Helmut Hasse) draws each element as a node, places $y$ above $x$ whenever $y$ covers $x$, and joins them with a line.

Do we lose anything by drawing only these direct steps? No. Take Dee $\prec$ Ana again. It isn’t drawn, but we can climb from Dee up to Ben, and from Ben up to Ana. The same works in general. If $x \prec y$ but $y$ doesn’t cover $x$, something sits between them, so we can split the step in two. Then we split again wherever a step still has something in between, until only direct steps are left. The splitting can’t go on forever: a chain can’t visit the same item twice without making a cycle, and there are only finitely many items. So $x \prec y$ holds exactly when you can climb from $x$ to $y$ along the lines of the diagram `[proof sketch]`. Fig. 3 draws the tasks of (C).

**Fig. 3.** *The tasks of request (C). Lines are covering pairs; up means later. a and b are unrelated, as are c and d, and a and d. Below the diagram: the five sorted arrangements.*

```text
   c         d          up means later; lines are covering pairs
   │ ╲       │
   │   ╲     │
   │     ╲   │
   a         b

   a = write the code · b = write the tests · c = run the tests · d = review the tests
```
e(P) = 5 orderings are still possible: **a b c d**, **a b d c**, **b a c d**, **b a d c**, **b d a c**.

Now back to our two questions. Both are about the answers of a partial order. We’ll be counting those answers a lot, so they deserve a name. Take (C). The rule settles three pairs: a before c, b before c, and b before d. It leaves the other pairs open. An answer such as a, b, d, c puts all four tasks in one line, so it settles every pair, and it still agrees with the three pairs the rule settled. It extends what the rule says to a complete line. That’s where the name comes from: “linear” because the result is a line, and “extension” because it extends the rule.

> **Definition (linear extension, e(P))**
>
> A **linear extension** of a strict partial order $P$ is a sorted arrangement of its elements. We write $e(P)$ for the number of linear extensions.

For the tasks, $e(P) = 5$, and the five are listed under Fig. 3: the same five we found by hand in §01.

So, does every strict partial order have at least one linear extension? (A), (B) and (C) do, but three examples aren’t a proof. The choice tree of §01 suggests how a proof might go: build the line-up by repeatedly choosing an item that can go first. An item can go first exactly when nothing must come before it, like a and b in (C). Such an item has a name.

> **Definition (minimal element)**
>
> $m$ is **minimal** if there is no $x$ with $x \prec m$.

Careful: minimal doesn’t mean “smallest”. The tasks have two minimal elements, a and b, and neither is below the other. A minimal element is simply one with nothing below it. The name says it is as low as things go: in Fig. 3, a and b sit at the bottom.

This way of building only works if a minimal element is always there when we need one. Could a partial order have none at all, so that every item has something below it? That is exactly what happened in (D): every hand shape had something that had to come before it. But (D) is a cycle, and a strict partial order has no cycles. Without a cycle, there is always a minimal element:

> **Lemma 4 (minimal elements exist)**
>
> Every strict partial order on a finite nonempty set has a minimal element.

> **Proof**
>
> Start at any element. If it is not minimal, some element is below it; move there, and repeat. The walk never revisits an element: if it did, the elements visited in between, read in reverse, would form a cycle (or give $x \prec x$), which Lemma 3 (or irreflexivity) rules out. A finite set has only finitely many elements to visit, so the walk stops, and it can only stop at a minimal element. ∎

Here is that walk on the tasks. Start at c. Task a is below c (so is b), so move to a. Nothing is below a, so the walk stops, and a is minimal. With Lemma 4 in hand, the procedure from §01 becomes a proof.

> **Theorem 5 (linear extensions exist)**
>
> Every strict partial order on a finite set has at least one linear extension.

> **Proof**
>
> Induction on the number of elements $n$. For $n \le 1$ there is nothing to prove. For $n \ge 2$, choose a minimal element $m$ (Lemma 4) and put it first. The remaining $n-1$ elements, with $\prec$ restricted to them, still form a strict partial order (restricting keeps irreflexivity and transitivity), so by induction they have a linear extension $L'$. The arrangement $m, L'$ is sorted: pairs inside $L'$ are fine, and no element of $L'$ must come before $m$ because $m$ is minimal. ∎

Read the proof again and you’ll find it is the procedure from §01, “repeatedly choose an item that can go first”, now shown to work for every partial order. The procedure comes back in lesson 35, where it becomes an algorithm.

The proof also shows why §01’s way of counting was right. Think about the first item of any sorted arrangement. It has to be minimal. In (C), for example, c can’t go first. If it did, a would stand after c, although a has to come before c: an out-of-order pair. The same goes for the second item among the rest, and so on. So every sorted arrangement comes from exactly one run of choices. And every run of choices produces a sorted arrangement (Theorem 5). That means $e(P)$ is exactly the number of paths through the choice tree of Fig. 1 `[proof]`.

Putting §03 and this section together, we can now fully answer the question §03 started with, “which rules have answers?”. A rule has an answer exactly when it has no cycle.

> **Corollary 6**
>
> A relation has a sorted arrangement if and only if it has no cycle.

> **Proof**
>
> If it has a cycle, Lemma 1. If it has no cycle, add every pair that transitivity calls for. The result is transitive by construction, and irreflexive because $x \prec x$ could only arise from a cycle through $x$. By Theorem 5 it has a linear extension; that arrangement follows every original pair too, since the original pairs are among those added to. ∎

Fig. 4 is a playground for all of this. Build your own partial orders and watch the count change.

**Fig. 4 · Playground.** *Click an element, then another, to say the first must come before the second. The view keeps only covering lines, counts the orders still possible, and says when a new pair adds nothing.*

*The playground is interactive in the HTML edition: click an element, then another, to require the first before the second, and watch e(P) change.*

1. Add a pair that is already implied (for example a ≺ b, b ≺ c, then a ≺ c). What does the count do?
2. Try to close a loop. What does the view do, and which result explains it?
3. Get $e(P)$ down to 1 using as few pairs as possible. How many did you need?

<details>
<summary><b>Going deeper · The fewest pairs that leave one order</b></summary>

Challenge 3 needs exactly $n - 1 = 4$ pairs for 5 elements `[proof]`. Four are enough: a chain $x_0 \prec x_1 \prec \cdots \prec x_4$. Why can’t fewer work? First, if $e(P) = 1$, every pair is related. To see why, suppose $x$ and $y$ were unrelated. Adding the pair $x \prec y$ would create no cycle, because a cycle through the new pair would need $y \prec x$ to be there already. So by Corollary 6 some valid order puts $x$ before $y$. In the same way, some valid order puts $y$ before $x$. That is two orders, not one. So when $e(P) = 1$ the order settles every pair, and its Hasse diagram is a single chain with $n - 1$ covering pairs. A covering pair can never be implied by other pairs, because anything implying $x \prec y$ would need some $z$ between them. So each of those $n-1$ pairs had to be put in directly. This “the picture needs $n-1$ lines” argument returns in lesson 5, where it becomes a lower bound on the cost of checking that an array is sorted.

</details>

#### Checkpoint 2

**Q3.** On $\{a, b, c\}$, the rule’s only pairs are $a \prec b$ and $a \prec c$. How many linear extensions are there?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Use the question from §01: which items can go first, that is, which items have nothing that must come before them?

</details>

<details>
<summary>Hint 2</summary>

Only a can go first. Once a is placed, does either of b and c still have to come before the other?

</details>

<details>
<summary>Answer and feedback</summary>

- **2** ✓ Right. Only a can go first, because a must come before both b and c. After that, b and c are unconstrained and can go in either order: a b c and a c b.
- *If you answered 6:* 6 is the number of all arrangements of three items, as if the rule said nothing. An arrangement that starts with b or c puts that item before a, which breaks one of the rule’s pairs. Four of the six start with b or c, so four are out.
- *If you answered 1:* Only one would mean everything is forced. a is forced to go first, but nothing relates b and c, so after a they can go in either order: two extensions.
- *If you answered 3:* Try listing them. Since a ≺ b and a ≺ c, a must come first, and that leaves only the order of b and c to choose: two ways, not three.
- *Any other answer:* Not quite. Ask the §01 question: which items can go first? Then count how many ways the rest can follow.

</details>

<details>
<summary>Worked solution</summary>

Let’s build the choice tree, asking at each step which items can go first.

- First position: a must come before b, and before c. Only a is free, so a goes first. No choice.
- Second position: with a placed, nothing else must come before b or before c, so either can go next. Two choices.
- Third position: whichever of b and c is left goes last. No choice.

The tree splits once, into two paths, so there are 2 linear extensions: a b c and a c b.

If you got 6, you counted all $3! = 6$ arrangements and ignored the rule. The four that start with b or c put that item ahead of a, although a must come before both b and c. If you got 1, you treated b and c as forced too, but nothing relates them.

</details>

**Q4.** On $\{a, b, c, d\}$, the rule’s only pair is $a \prec b$. How many linear extensions are there?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Forget the rule for a moment: how many arrangements of four items are there? Then ask what fraction of them could have a before b.

</details>

<details>
<summary>Hint 2</summary>

Take any arrangement and swap a and b, leaving c and d where they are. That matches up arrangements with a before b and arrangements with b before a, one for one.

</details>

<details>
<summary>Answer and feedback</summary>

- **12** ✓ Right, 12. Swapping a and b turns an arrangement with a before b into one with b before a: a c b d becomes b c a d, for example. So the swap pairs each arrangement with a before b with exactly one that has b before a. The 24 arrangements split evenly, and half of them, 12, have a before b.
- *If you answered 24:* 24 counts every arrangement of four items, as if the rule said nothing. Half of them put b before a, which a ≺ b forbids.
- *If you answered 6:* 6 would be right if c and d also had to go in a fixed order (that’s Exercise 2 at the end). Here only a and b are constrained, so c and d can go either way round.
- *If you answered 2:* That’s far too few: only one pair is constrained, and c and d can stand anywhere. Try comparing how many arrangements have a before b with how many have b before a.
- *Any other answer:* Not quite. Pair each arrangement with the one where a and b trade places; exactly one of each pair is valid. How many pairs are there?

</details>

<details>
<summary>Worked solution</summary>

Without any rule, four items have $4! = 24$ arrangements. The pair a ≺ b throws out exactly the ones with b before a. How many is that?

Here’s a neat way to see it. Take any arrangement and swap the positions of a and b, leaving c and d where they are. If a was before b, now b is before a, and the other way round; swapping again gives back the original. So the swap sorts the 24 arrangements into 12 pairs, and each pair has exactly one arrangement with a before b. That gives 12 linear extensions.

You can also build the count directly. Choose the two positions that a and b will occupy: $4 \cdot 3 / 2 = 6$ ways. Put a in the earlier one and b in the later one. Then c and d fill the other two positions in either order: 2 ways. Every choice combines with every other, so that’s $6 \cdot 2 = 12$.

</details>

**Q5.** Why must the first element of any sorted arrangement be minimal?

- **(a)** Anything that must come before the first element would have to stand after it, and that pair would be out of order.
- **(b)** Because a minimal element is the smallest element.
- **(c)** It need not be; any element can go first.
- **(d)** Because there is exactly one minimal element.

<details>
<summary>Hint 1</summary>

Suppose the first element were not minimal. Then some $x$ must come before it. Where does $x$ stand in the arrangement?

</details>

<details>
<summary>Hint 2</summary>

Every other element stands after the first one. What do we call a pair in which the later item must come before the earlier one?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Exactly. Everything else stands after the first element, so anything that must come before it would make an out-of-order pair. That’s why the construction in Theorem 5, and the counting in §04, always start with a minimal element.
- **(b)** ✗. Careful: “minimal” only means that nothing is below it, not that it is below everything. In (C), a and b are both minimal and neither is below the other, so there isn’t a smallest task at all.
- **(c)** ✗. Try putting c first in (C): a must come before c but now stands after it, which is an out-of-order pair. So not every element can go first.
- **(d)** ✗. (C) has two minimal elements, a and b, and either can go first, so there needn’t be just one. A unique minimal element needs more than a partial order; §05 says what.

</details>

<details>
<summary>Worked solution</summary>

Let’s see what would go wrong otherwise. Take a sorted arrangement and call its first element $f$. Suppose $f$ were not minimal: then there is some $x$ with $x \prec f$. But $f$ is first, so $x$ stands somewhere after it. In that pair the later item, $x$, must come before the earlier one, $f$: an out-of-order pair, and a sorted arrangement has none. So $f$ must be minimal.

The wrong options mix up “minimal” with something stronger. A minimal element is only one with nothing below it. It needn’t be below everything (that’s what “smallest” would mean), and there can be several. The tasks of (C) show both: a and b are both minimal, neither is below the other, and either can go first. “Any element can go first” fails on the same example: with c first, a stands after c, although a must come before c.

</details>

---

## 05 · When every pair is settled

That settles the first question from §02: we know exactly which rules have answers, and §04 showed how to count them. The second question also asked when there is exactly one answer. That is the case this course cares about most. When you sort numbers you expect a single correct result, so that it makes sense to speak of *the* sorted list. (A) has exactly one answer, while (C) has five. What makes the difference?

Look at where the choices in (C) came from. At the start, a and b could go in either order. Later, c and d could, and so could a and d (b d a c is a valid answer). Every single choice involved a pair that the rule leaves unconstrained. In (A) there are no such pairs: of any two numbers, one is smaller. So here is a natural guess: a rule that settles every pair should leave no choice at all. Such a rule is called total, because it settles every pair.

> **Definition (strict total order)**
>
> A strict partial order is **total** if every two distinct elements are related: for $x \ne y$, either $x \prec y$ or $y \prec x$.

The guess is right, and the proof shows exactly where the single answer comes from.

> **Theorem 7 (exactly one sorted arrangement)**
>
> A strict total order on a finite set has exactly one sorted arrangement. In it, $x_0 \prec x_1 \prec \cdots \prec x_{n-1}$.

> **Proof**
>
> Existence is Theorem 5. For uniqueness, use induction on $n$; for $n \le 1$ it is clear. The first element of a sorted arrangement must be minimal (§04). In a total order a minimal element $m$ is below every other element: for $y \ne m$, either $y \prec m$, impossible since $m$ is minimal, or $m \prec y$. Two different such elements $m, m'$ would satisfy $m \prec m'$ and $m' \prec m$, which Lemma 2 forbids. So the first position is forced: it holds the **minimum**. The other $n - 1$ elements form a strict total order, whose sorted arrangement is unique by induction. Finally, any two positions $i < j$ are related (totality) and $x_j \prec x_i$ is excluded, so $x_i \prec x_j$. ∎

In the language of §01: in a total order, exactly one item can go first at every step, the smallest of those that remain. So the choice tree never branches, just like the tree of (A): 2, then 4, then 7, then 9. Every later lesson sorts under a total order, or under the slightly looser kind we meet in §06. So from now on “sorting” means finding this one forced arrangement.

And there’s a bonus. Remember the strict shortcut from §02, which checks that each item is strictly before the next? The tie between Ana and Cy broke it. A total order has no ties, so perhaps the strict shortcut is safe here. It is:

> **Lemma 8 (neighbours suffice for total orders)**
>
> An arrangement of a strict total order is sorted if and only if $x_i \prec x_{i+1}$ for every $i = 0, 1, \ldots, n-2$.

> **Proof**
>
> If it is sorted, Theorem 7 gives $x_i \prec x_{i+1}$. Conversely, suppose every neighbour pair satisfies $x_i \prec x_{i+1}$. For $i < j$, transitivity applied along $x_i \prec x_{i+1} \prec \cdots \prec x_j$ gives $x_i \prec x_j$, and asymmetry rules out $x_j \prec x_i$. So no pair is out of order. ∎

That’s $n - 1$ checks instead of $n(n-1)/2$. For the four numbers of (A), it’s 3 checks instead of 6. It’s the first time transitivity saves us work, and it won’t be the last.

What about rules that aren’t total? There the strict shortcut is hopeless, as §02 showed: two unconstrained neighbours, like Ana and Cy, already break it. So let’s bring back the neighbour test from §02. It still looks only at side-by-side pairs, but it asks each of them the request’s own question: is it the wrong way round? For a total order, the strict shortcut and the neighbour test always agree. There, of any two different neighbours one must come first. So if it isn’t the right one, it’s the left one. But does the neighbour test still work for a partial order like (C)?

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

Does the neighbour test work for the tasks of request (C)? That is: if no neighbour pair is out of order, is the arrangement valid?

- **(a)** Yes: transitivity still holds in a partial order.
- **(b)** No: some invalid arrangement has no out-of-order neighbours.
- **(c)** It depends on how many tasks there are.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. Transitivity does still hold, so it’s a reasonable guess. But look at what the proof of Lemma 8 actually chained together. The reveal below shows the catch.
- **(b)** ✓ correct. Yes: there is an invalid arrangement whose neighbours all look fine. The reveal below shows one.
- **(c)** ✗. The four tasks of (C) are already enough to break it, so we don’t need a bigger example. The reveal below shows one.

</details>

<details>
<summary><b>Reveal</b></summary>

Take d, a, b, c. The neighbour pairs are (d, a): unrelated, fine; (a, b): unrelated, fine; (b, c): b ≺ c, fine. No neighbour pair is out of order. But b must come before d, and d stands first: the row is wrong.

Where does the proof of Lemma 8 break? It chained **$x_i \prec x_{i+1}$**, which holds in a total order. In a partial order, passing the neighbour test only tells us that a side-by-side pair isn’t the wrong way round (in symbols, $x_{i+1} \not\prec x_i$). The two might simply be unrelated, like d and a. And being unrelated doesn’t chain: d and a are unrelated, a and b are unrelated, yet b must come before d.

</details>

Find a **different** arrangement of a, b, c, d that passes the neighbour test but is not a valid order of the tasks. Type four letters.

*Type your answer in the interactive version of this page; the checker explains every answer.* (Input format, for example: `d a b c`.)

<details>
<summary>Hint 1</summary>

The arrangement has to break one of the pairs a ≺ c, b ≺ c or b ≺ d. But the two items of the broken pair must stand apart, so that no neighbour pair gives it away. Which pair could you try to break?

</details>

<details>
<summary>Hint 2</summary>

Try putting c before a or b. The item right after c can’t be a or b, or the neighbour test would catch it. So what must come right after c, and what can follow that?

</details>

<details>
<summary>Worked solution</summary>

We need an arrangement that is invalid and yet has no neighbour pair out of order. First, let’s pin down what the neighbour test catches. The rule’s pairs are a ≺ c, b ≺ c and b ≺ d. So the test complains exactly when c is immediately followed by a or b, or when d is immediately followed by b. In particular, whenever c has a right-hand neighbour, it must be d.

Now ask where c stands.

- c first: d must follow it. After d, b isn’t allowed, so a comes next, and then b: c, d, a, b. It passes the test, but c stands before a (and before b), so it’s invalid. A trap.
- c second: again d follows c, so the row is x, c, d, y. If x were a, the row would end d, b, and the test would catch it. So x is b: b, c, d, a. It passes, and c stands before a, so it’s invalid. A trap.
- c third: d follows c, so a and b fill the first two places: a, b, c, d or b, a, c, d. Both are valid, so they’re no use here.
- c last: c comes after a and b, so the only pair left to break is b ≺ d, and d must stand before b without touching it. In the first three places that forces d, a, b, so the row is d, a, b, c: the example from the reveal.

So exactly three arrangements fool the neighbour test: d a b c, b c d a and c d a b. Either of the last two answers the question. In each one, the broken pair is two items that never stand side by side. Every step between them is an unconstrained pair (a–b, a–d or c–d). A “must come before” pair hidden behind a chain of unconstrained steps is exactly what checking neighbours can’t see in a partial order.

</details>

#### Checkpoint 3

**Q6.** To check that an arrangement of 1000 elements of a strict total order is sorted, how many neighbour comparisons does Lemma 8 need?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Lemma 8 checks only neighbour pairs, $x_i$ and $x_{i+1}$. How many such pairs does a row of $n$ elements have?

</details>

<details>
<summary>Hint 2</summary>

Count the positions $i$ that start a neighbour pair: $i$ runs from 0 up to $n - 2$.

</details>

<details>
<summary>Answer and feedback</summary>

- **999** ✓ Right: 1000 elements have 999 neighbouring pairs, one between each element and the next. Compare that with the 499 500 pairs the definition would check.
- *If you answered 1000:* Close, but off by one. The neighbour pairs are (0, 1), (1, 2), …, (998, 999): each starts at a position from 0 to 998, which makes 999 pairs. The last element has no neighbour after it.
- *If you answered 499500:* That’s every pair of positions, $1000 \cdot 999 / 2$, which is what the definition checks. Lemma 8 is exactly where transitivity lets us skip every pair that isn’t a neighbour pair.
- *Any other answer:* Not quite. List the neighbour pairs (0, 1), (1, 2), …, (n − 2, n − 1) and count them for n = 1000.

</details>

<details>
<summary>Worked solution</summary>

Lemma 8 says that for a strict total order it’s enough to check each element against the next one: $x_i \prec x_{i+1}$ for $i = 0, 1, \ldots, n-2$. So the number of comparisons is the number of values of $i$, which is $n - 1$. You can picture them as the gaps between neighbours. 1000 elements in a row have 999 gaps, one fewer than the elements, because the last element has nothing after it. So the answer is 999.

For comparison, the definition looks at every pair of positions: $1000 \cdot 999 / 2 = 499\,500$ of them. Transitivity is what lets Lemma 8 skip all but 999.

</details>

**Q7.** In Theorem 7, which property makes the first position forced?

- **(a)** Totality: it makes a minimal element lie below every other element, and so be unique.
- **(b)** Asymmetry.
- **(c)** Transitivity.
- **(d)** Finiteness.

<details>
<summary>Hint 1</summary>

Test each candidate against (C). It is a finite strict partial order, and its first position is not forced. Which of the four properties does (C) lack?

</details>

<details>
<summary>Hint 2</summary>

(C) is asymmetric, transitive and finite. Find the property it lacks, then find the sentence of the proof that uses it.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Totality turns “nothing is below it” into “it is below everything else”, and only one element can be below everything. Without totality, as in (C), there can be several minimal elements, and any of them may go first.
- **(b)** ✗. Asymmetry does appear in the proof, but it holds in every strict partial order, including (C), where the first position isn’t forced. It only shows that two elements can’t both be below everything. It’s totality that makes a minimal element below everything in the first place.
- **(c)** ✗. (C) is transitive too, and there either a or b may start, so transitivity on its own can’t be what forces the first position.
- **(d)** ✗. Finiteness gives us at least one minimal element (Lemma 4), but it says nothing about how many there are: (C) is finite and has two.

</details>

<details>
<summary>Worked solution</summary>

A good way to find which property does the work is to look at an example where the conclusion fails. In (C) the first position is not forced: a or b may start. Yet (C) is finite, transitive and asymmetric, so none of those can be what forces the first position in Theorem 7. What (C) lacks is totality: a and b are unrelated.

Now let’s see where totality enters the proof. Let $m$ be minimal. For any other element $y$, totality says $y \prec m$ or $m \prec y$; minimality rules out $y \prec m$, so $m \prec y$. So a minimal element is below every other element. Asymmetry then shows there can’t be two such elements (each would be below the other), but it only tidies up after totality has done the main work. Finiteness, through Lemma 4, guarantees that a minimal element exists, not that there is only one.

</details>

---

## 06 · Ties

So the neighbour test is safe for a total order like (A), and the tasks of (C) fool it. That leaves (B) in between. (B) isn’t total, because Ana and Cy are unrelated. Yet it feels much tidier than (C). In (B), the unconstrained pair is a harmless tie: two people of the same age. In (C), the unconstrained pairs are what fooled the neighbour test. What exactly is the difference? And does the neighbour test survive ties?

The difference lies in what “unrelated” means. In (B), two people are unrelated when they are the same age, and “same age” carries over. Suppose a fifth person, Eve, also 30, joined the line-up. Ana is unrelated to Cy, and Cy is unrelated to Eve. All three are 30, so Ana is unrelated to Eve too. In (C), being unrelated doesn’t carry over: d is unrelated to a, a is unrelated to b, and yet b must come before d. Rules in which “unrelated” carries over get their own name.

> **Definition (strict weak ordering)**
>
> Write $x \sim y$ when neither $x \prec y$ nor $y \prec x$ (in particular $x \sim x$). A strict partial order is a **strict weak ordering** if $\sim$ is transitive: $x \sim y$ and $y \sim z$ imply $x \sim z$.

“Weak” because it is weaker than total: it allows ties. You can read $x \sim y$ as “$x$ and $y$ tie”.

In a rule like this, ties behave exactly like “same age”. Every item ties with itself; that follows from irreflexivity. A tie goes both ways: if Ana ties with Cy, Cy ties with Ana. And ties carry over, because that is what we assumed. These three properties are called reflexive, symmetric and transitive, and a relation with all three is called an **equivalence relation**. The name says that tied items count as equal, as far as the rule is concerned. An equivalence relation splits the items into groups, and inside each group everyone ties with everyone, just as “same age” splits people into age groups. In a strict weak ordering these groups are called **tiers**, a word for levels stacked one above another. In (B) the tiers are {Dee}, {Ben} and {Ana, Cy}.

Notice how neatly the tiers of (B) line up by age: {Dee} (22), then {Ben} (25), then {Ana, Cy} (30). Dee comes before everyone in the later tiers, and Ben comes before both Ana and Cy. Is that luck, or is it always so? Could some tier be only partly before another, with some of its members coming before the other tier and some not? The definition rules that out:

> **Lemma 9 (tiers are totally ordered)**
>
> In a strict weak ordering, if $x \prec y$ and $y \sim y'$, then $x \prec y'$; likewise if $x \prec y$ and $x \sim x'$, then $x' \prec y$. Hence whether $x \prec y$ depends only on the tiers of $x$ and $y$, and any two different tiers $T, T'$ satisfy either “every element of $T$ is below every element of $T'$” or the reverse.

> **Proof**
>
> Suppose $x \prec y$, $y \sim y'$, but not $x \prec y'$. Then either $y' \prec x$ or $x \sim y'$. If $y' \prec x$, then $y' \prec x \prec y$ gives $y' \prec y$, contradicting $y \sim y'$. If $x \sim y'$, then $x \sim y' \sim y$ gives $x \sim y$ by transitivity of $\sim$, contradicting $x \prec y$. The second statement is symmetric. For two different tiers, pick $t \in T$, $t' \in T'$: they are not $\sim$, so one is below the other, and by the first part the same holds for every pair of representatives. ∎

So the tiers line up in a total order $T_1, T_2, \ldots, T_k$, just as {Dee}, {Ben}, {Ana, Cy} do in (B). Once we know that, we can say exactly which rows are sorted, and how many there are.

> **Theorem 10 (counting with ties)**
>
> An arrangement of a strict weak ordering is sorted if and only if it lists all of $T_1$, then all of $T_2$, …, then all of $T_k$, each tier in any internal order. Hence, if the tiers have sizes $n_1, \ldots, n_k$, there are exactly $n_1!\, n_2! \cdots n_k!$ sorted arrangements.

> **Proof**
>
> If an element of a later tier came before an element of an earlier tier, that pair would be out of order (Lemma 9). Conversely, if tiers appear in order, elements of the same tier are unrelated and never out of order, and elements of different tiers appear in the right order. Each tier’s internal order can be chosen independently, in $n_i!$ ways. ∎

Let’s sanity-check it. (B) has tiers of sizes 1, 1 and 2, so $1! \cdot 1! \cdot 2! = 2$, just as we counted. A total order has every tier of size 1, so it gets exactly 1, which is Theorem 7 again.

And here is the good news: the neighbour test from §02, the one that (C) fooled in §05, does work once “unrelated” carries over:

> **Lemma 11 (neighbours suffice for strict weak orderings)**
>
> An arrangement of a strict weak ordering is sorted if and only if no neighbour pair is out of order: $x_{i+1} \prec x_i$ for no $i$.

> **Proof**
>
> Number the tiers $1, \ldots, k$ in their order and let $t(x)$ be the number of $x$’s tier. “$x_{i+1} \prec x_i$ fails” means $t(x_i) \le t(x_{i+1})$ (Lemma 9). If this holds for every neighbour pair, then $t(x_0) \le t(x_1) \le \cdots \le t(x_{n-1})$, because $\le$ on numbers is transitive. So tiers appear in order, and Theorem 10 says the arrangement is sorted. The converse is immediate. ∎

So the whole difference between (B) and (C) comes down to one property. Think about what the neighbour test learns from a side-by-side pair: only that it isn’t the wrong way round. In (B) that means the ages don’t go down at that step. And “doesn’t go down” chains along a row. In the row Ben, Cy, Ana, the ages are 25, 30, 30: they don’t go down from Ben to Cy, and they don’t go down from Cy to Ana, so they don’t go down from Ben to Ana either. So if every side-by-side step passes, every pair passes. In (C) nothing like that chains. In the row d, a, b, c, the pair d, a is fine (unconstrained) and the pair a, b is fine (unconstrained), yet d and b are the wrong way round.

You might think that only rules about very different things, like tasks, can fail this way, and that rules built from plain numbers are safe. Here is a rule on numbers that shows otherwise. It’s worth remembering because it looks so innocent. Say $x \prec y$ when $y - x > 1$: $x$ has to come first only when it is smaller by more than 1. Call it “noticeably smaller”. It is irreflexive, and it is transitive (if $y - x > 1$ and $z - y > 1$, then $z - x > 2$). But look at 1.0, 1.5 and 2.2. 1.0 and 1.5 are only 0.5 apart, so they tie. 1.5 and 2.2 are only 0.7 apart, so they tie too. Yet 1.0 and 2.2 are 1.2 apart, so 1.0 has to come first. Ties don’t carry over. Now look at the row 2.2, 1.5, 1.0. Each side-by-side step is less than 1, so the neighbour test finds nothing wrong. But 1.0 should come before 2.2, so the row isn’t sorted. In lesson 2 you’ll watch Python’s own sort fall into exactly this trap.

<details>
<summary><b>Common question · Isn’t (B) just sorting the ages?</b></summary>

Yes. Assign each person their age. Then $p \prec q$ exactly when age($p$) $<$ age($q$), and the tiers are the distinct ages. Every strict weak ordering arises this way from some “key”: a value attached to each item, like the age here. That is the first theorem of lesson 2, and it is why sorting by a key always makes sense.

</details>

#### Checkpoint 4

**Q8.** Classify each relation.

*Categories:* **Strict total order** · **Strict weak ordering, not total** · **Strict partial order, not weak** · **Not a strict partial order**

1. “has fewer letters than”, on English words
2. “comes earlier in the dictionary than”, on distinct words
3. “is a proper divisor of”, on 1, 2, …, 12
4. “is at least 1 cm shorter than”, on people
5. “beats”, in rock–paper–scissors

<details>
<summary>Hint 1</summary>

Ask three questions in turn. Is it a strict partial order (irreflexive and transitive)? If so, is every pair of different items related (total)? If not, does “unrelated” carry over (weak)?

</details>

<details>
<summary>Hint 2</summary>

To test “carries over”, look for three items x, y, z with x and y unrelated, y and z unrelated, but x and z related. Try small numbers for the divisors and nearby heights for the people.

</details>

<details>
<summary>Answer and feedback</summary>

1. **Strict weak ordering, not total.** Right. Two words tie when they have the same length, and “same length” carries over, so ties carry over. The tiers are the 1-letter words, the 2-letter words, and so on.
   - *If you chose Strict total order:* Not every pair is settled: “cat” and “dog” have the same length, so neither has fewer letters than the other. That’s a tie, so the order isn’t total.
   - *If you chose Strict partial order, not weak:* It is a strict partial order, but it’s more than that. Here “unrelated” means “same length”, and that carries over: two words that each match a third in length match each other. So it’s a strict weak ordering.
   - *If you chose Not a strict partial order:* It is a strict partial order. No word has fewer letters than itself. And if u is shorter than v, and v is shorter than w, then u is shorter than w.
2. **Strict total order.** Right. Two different words always differ somewhere, so the dictionary puts one of them first: every pair is settled. It’s also irreflexive and transitive, so it’s a strict total order.
   - *If you chose any other choice:* Ask whether two different words can ever tie. They can’t: they differ somewhere, so the dictionary puts one of them first. With every pair settled, and being irreflexive and transitive, it’s a strict total order.
3. **Strict partial order, not weak.** Right. 2 and 3 are unrelated (neither divides the other), and so are 3 and 4, yet 2 is a proper divisor of 4. “Unrelated” doesn’t carry over, so it isn’t weak.
   - *If you chose Strict weak ordering, not total:* Check whether “unrelated” carries over: 2 and 3 are unrelated, and 3 and 4 are unrelated, but 2 is a proper divisor of 4. So ties don’t carry over, and it isn’t weak.
   - *If you chose Strict total order:* Not every pair is settled: of 2 and 3, neither is a divisor of the other.
   - *If you chose Not a strict partial order:* It is a strict partial order. A proper divisor differs from the number, so nothing is related to itself. And a proper divisor of a proper divisor is again a proper divisor.
4. **Strict partial order, not weak.** Right. It has the same shape as the “noticeably smaller” example from §06. Take people of heights 170, 170.6 and 171.2 cm. The first two are unrelated, and so are the last two. Yet the 170 cm person is at least 1 cm shorter than the 171.2 cm one.
   - *If you chose Strict weak ordering, not total:* Here “unrelated” means “less than 1 cm apart”, and that doesn’t carry over: 170 ∼ 170.6 and 170.6 ∼ 171.2, yet 170 is 1.2 cm shorter than 171.2. So it isn’t weak.
   - *If you chose Strict total order:* Two people 0.5 cm apart in height are unrelated, since neither is at least 1 cm shorter than the other. So not every pair is settled.
   - *If you chose Not a strict partial order:* It is a strict partial order. Nobody is shorter than themselves. And if y is at least 1 cm taller than x, and z is at least 1 cm taller than y, then z is at least 2 cm taller than x.
5. **Not a strict partial order.** Right. It has a cycle, and Lemma 3 says a strict partial order never does. Concretely, transitivity fails: rock beats scissors and scissors beats paper, yet rock doesn’t beat paper.
   - *If you chose any other choice:* Every other category is some kind of strict partial order, and this isn’t one. Rock beats scissors and scissors beats paper, but rock doesn’t beat paper, so transitivity fails.

</details>

<details>
<summary>Worked solution</summary>

For each relation we ask the same three questions, in this order. Is it a strict partial order at all? If so, is it total? If not, does “unrelated” carry over?

- “has fewer letters than”: no word has fewer letters than itself, and “fewer” chains, so it’s a strict partial order. It isn’t total, because “cat” and “dog” tie. Unrelated means “same length”, which carries over. Strict weak ordering, with one tier for each word length.
- “comes earlier in the dictionary than”, on distinct words: irreflexive and transitive, and two different words always differ somewhere, so one of them comes first. Strict total order.
- “is a proper divisor of”, on 1 to 12: irreflexive (a proper divisor differs from the number) and transitive. Not total: 2 and 3 are unrelated. Unrelated doesn’t carry over: 2 ∼ 3 and 3 ∼ 4, yet 2 ≺ 4. Strict partial order, not weak.
- “is at least 1 cm shorter than”: irreflexive and transitive. Not total: two people 0.5 cm apart are unrelated. Unrelated means “less than 1 cm apart”, which doesn’t carry over: 170 ∼ 170.6 and 170.6 ∼ 171.2, yet 170 ≺ 171.2. Strict partial order, not weak; it has the same shape as “noticeably smaller”.
- “beats”: not transitive (rock beats scissors and scissors beats paper, but rock doesn’t beat paper), and it has a cycle. Not a strict partial order.

The most tempting slip is calling the divisors or the heights “weak”, because they seem to have ties. But the test isn’t whether there are ties; it’s whether ties carry over. One example is enough to rule “weak” out: two ties in a row whose ends are related, like 2 ∼ 3 and 3 ∼ 4 with 2 ≺ 4.

</details>

**Q9.** Six runners finish a race. Two tie for first, one is third, and three tie for last. How many arrangements of the six runners are sorted by finishing position?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Runners who tie are unrelated, so group them into tiers. What are the tiers, and in what order must they appear?

</details>

<details>
<summary>Hint 2</summary>

The tiers have sizes 2, 1 and 3. In how many ways can each tier be arranged inside itself, and how do those counts combine?

</details>

<details>
<summary>Answer and feedback</summary>

- **12** ✓ Right. The tiers are the two winners, the third-placed runner and the three last, of sizes 2, 1 and 3, so Theorem 10 gives $2! \cdot 1! \cdot 3! = 2 \cdot 1 \cdot 6 = 12$.
- *If you answered 720:* 720 = 6! counts every arrangement of the six runners, ignoring the results. But the tiers must come in order, winners first; only the order inside each tier is free.
- *If you answered 6:* 6 = 2 + 1 + 3 adds up the tier sizes, which just counts the runners. A tier of size $m$ can be arranged internally in $m!$ ways, and the choices in different tiers are independent, so they multiply.
- *If you answered 3:* 3 is the number of tiers, not the number of arrangements. The three last-place runners alone can stand in $3! = 6$ orders.
- *Any other answer:* Not quite. Find the tiers and their sizes, then use Theorem 10: multiply the factorials of the tier sizes.

</details>

<details>
<summary>Worked solution</summary>

Finishing position is a strict weak ordering: runner $p$ comes before runner $q$ when $p$ finished ahead of $q$, and runners who tie are unrelated. So let’s find the tiers. The two joint winners form the first tier, the third-placed runner the second, and the three joint last the third: sizes 2, 1 and 3.

By Theorem 10, a sorted arrangement lists the tiers in order, and only the order inside each tier is free. So we build it tier by tier:

- the two winners first, in either order: $2! = 2$ ways;
- then the third-placed runner: $1! = 1$ way;
- then the three last-place runners, in any order: $3! = 6$ ways.

Each choice in one tier combines with every choice in the others, so the total is $2 \cdot 1 \cdot 6 = 12$.

720 = 6! would let runners from different tiers swap, which puts someone ahead of a runner who beat them. Adding the tier sizes (6) or counting the tiers (3) misses that the choices inside the tiers multiply.

</details>

---

## 07 · In Python

So far we’ve done all the checking and counting by hand, on rows of three or four items. A program can do it too, and it is in the same position we were in §02. It can’t see a rule as a whole; it can only ask about one pair at a time. So in code a rule becomes a function, `before(x, y)`, that returns `True` when $x \prec y$. Everything else is built from calls to that function. Listing 1 turns this lesson’s results into such functions: the definition of a sorted arrangement, the neighbour test of Lemma 11, and $e(P)$ counted the slowest possible way. Notice that the second function asks only one kind of question, “is the later item strictly before the earlier one?”. That’s the only question Python’s own sort ever asks, as lesson 2 will show.

**Listing 1.** *Checking arrangements, and counting sorted arrangements by trying them all.*

```python
from itertools import permutations

def is_sorted_by(xs, before):
    """The definition: no pair of positions i < j has xs[j] before xs[i]."""
    n = len(xs)
    for i in range(n):
        for j in range(i + 1, n):
            if before(xs[j], xs[i]):
                return False
    return True

def is_sorted_neighbours(xs, before):
    """Lemma 11: equivalent to is_sorted_by when `before` is a strict weak ordering."""
    for i in range(len(xs) - 1):
        if before(xs[i + 1], xs[i]):
            return False
    return True

def count_sorted(items, before):
    """e(P) by brute force: tries all n! arrangements, so keep n small."""
    return sum(1 for p in permutations(items) if is_sorted_by(p, before))
```

Listing 2 runs these functions on the tasks of (C) and on the “noticeably smaller” rule from §06. It gets the same answers we found by hand.

**Listing 2.** *The tasks of request (C), and the “noticeably smaller” trap.*

```python
needs = {("a", "c"), ("b", "c"), ("b", "d")}   # (x, y): y needs x
task_before = lambda x, y: (x, y) in needs

print(count_sorted("abcd", task_before))                 # 5
print(is_sorted_neighbours("dabc", task_before))         # True  (passes the neighbour test)
print(is_sorted_by("dabc", task_before))                 # False (b must precede d)

noticeably = lambda x, y: y - x > 1
print(is_sorted_neighbours([2.2, 1.5, 1.0], noticeably))  # True
print(is_sorted_by([2.2, 1.5, 1.0], noticeably))          # False (1.0 must come before 2.2)
```

`count_sorted` tries all $n!$ arrangements. That is fine for $n \le 8$ or so, since $8!$ is 40 320, and hopeless beyond: $20!$ is over two billion billion. Lesson 4 asks what “trying every arrangement” would cost as a way to *sort*, and why it is hopeless.

---

## Exercises

**E1.** This version of the neighbour test has one wrong line. Click it.

```python
 1  def is_sorted_neighbours(xs, before):
 2      for i in range(len(xs) - 2):
 3          if before(xs[i + 1], xs[i]):
 4              return False
 5      return True
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

The loop is meant to look at every neighbour pair. Which values of `i` does it need, and which does it actually take?

</details>

<details>
<summary>Hint 2</summary>

Take $n = 3$, say `[1, 3, 2]`. Its neighbour pairs start at $i = 0$ and $i = 1$. What does `range(len(xs) - 2)` give here?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 2** ✓ That’s the one. `range(len(xs) - 2)` stops one pair early, so the last neighbour pair, $x_{n-2}, x_{n-1}$, is never checked. On `[1, 3, 2]` with `<` the function returns `True`. Lemma 11 needs every neighbour pair, $i = 0, \ldots, n-2$, which is `range(len(xs) - 1)`.
- *If you picked line 1:* The header is fine: like the version in Listing 1, the function takes the arrangement and the rule. The problem is in which pairs the body looks at.
- *If you picked line 3:* This line is fine. It asks whether the later element, `xs[i + 1]`, is strictly before the earlier one, `xs[i]`, which is exactly what makes a neighbour pair out of order.
- *If you picked line 4:* Returning `False` as soon as one neighbour pair is out of order is right: a single out-of-order pair is enough to make the arrangement unsorted. The question is whether every pair gets looked at.
- *If you picked line 5:* Returning `True` after the loop is right, provided the loop really checked every neighbour pair. Does it? Count the values of `i` for a short list.
- *Any other line:* That line is fine. Run the function by hand on `[1, 3, 2]` with `before = lambda x, y: x < y`: which pairs does the loop actually look at?

</details>

<details>
<summary>Worked solution</summary>

The neighbour test should look at every neighbour pair, `xs[i]` and `xs[i + 1]`. The last such pair starts at $i = n - 2$, so $i$ has to run over $0, 1, \ldots, n-2$, which is `range(len(xs) - 1)`.

Now read the loop: `range(len(xs) - 2)` gives $i = 0, \ldots, n-3$. It stops one pair early, so line 2 is the bug: the last pair, `xs[n - 2]` and `xs[n - 1]`, is never checked.

Let’s confirm it on `[1, 3, 2]` with `before = lambda x, y: x < y`. Here $n = 3$, so `range(1)` gives only $i = 0$. The loop compares 1 and 3 and finds them in order. Then the function returns `True`, although 3 and 2 are out of order. With `range(len(xs) - 1)` it would also check $i = 1$ and return `False`.

The other lines are fine. Line 3 asks exactly the out-of-order question: is the later item strictly before the earlier one? Line 4 stops as soon as one such pair turns up. Line 5 returns `True` once every pair has passed, which is correct as long as the loop really saw every pair.

</details>

**E2.** On $\{a, b, c, d\}$, the rule’s only pairs are $a \prec b$ and $c \prec d$. How many linear extensions?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Start from the 24 arrangements of four items. What does each pair do to the count? (Q4 did this for one pair.)

</details>

<details>
<summary>Hint 2</summary>

Or pick the two positions that will hold a and b. Once you’ve picked them, is there any freedom left in where a, b, c and d go?

</details>

<details>
<summary>Answer and feedback</summary>

- **6** ✓ Right, 6. Choose which 2 of the 4 positions hold a and b: there are $4 \cdot 3 / 2 = 6$ ways. Once you have, everything else is forced. a takes the earlier of the two positions and b the later, and c and d fill the other two positions with c first.
- *If you answered 12:* 12 is the count with only $a \prec b$ (that was Q4). The second pair, $c \prec d$, throws out half of those again: swapping c and d pairs them up.
- *If you answered 24:* 24 counts every arrangement of four items, as if the rule said nothing. Each of the two pairs rules out half of what’s left.
- *If you answered 4:* The two chains can interleave in more ways than that: a c b d and c a d b are both valid, for example. Try counting the interleavings systematically.
- *Any other answer:* Not quite. Try deciding which two positions a and b occupy. Once you have, is anything left to choose?

</details>

<details>
<summary>Worked solution</summary>

Here we have two separate chains, $a \prec b$ and $c \prec d$, with nothing between them. A linear extension interleaves the two chains while keeping each in its own order.

One way to count: choose the two positions that a and b will occupy. Then a must take the earlier one and b the later one, and c and d take the remaining two positions, c first. So each choice of two positions gives exactly one extension, and there are $4 \cdot 3 / 2 = 6$ ways to choose two positions out of four. Listing them by the positions of a and b:

- positions 0 and 1: a b c d
- positions 0 and 2: a c b d
- positions 0 and 3: a c d b
- positions 1 and 2: c a b d
- positions 1 and 3: c a d b
- positions 2 and 3: c d a b

Another way, by the swap trick of Q4: swapping a and b pairs up the 24 arrangements, leaving 12 with a before b. Swapping c and d doesn’t move a or b, so it pairs up those 12 in the same way, leaving 6 with c before d as well.

</details>

**E3.** A relation on $\{a, b, c\}$ contains only $a \prec b$ and $b \prec c$. It is not transitive ($a \prec c$ is missing). How many sorted arrangements does it have?

- **(a)** None: it is not a strict partial order.
- **(b)** Exactly one: a, b, c.
- **(c)** Two.
- **(d)** Three.

<details>
<summary>Hint 1</summary>

Sorted means no pair is out of order. Which arrangements put a before b and b before c?

</details>

<details>
<summary>Hint 2</summary>

Where must b stand, given that a has to come before it and c after it?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. A rule can have an answer without being transitive. Corollary 6 says what matters is whether there is a cycle, and this rule has none. A missing pair only takes something away from the rule, so it makes the rule easier to satisfy, not harder.
- **(b)** ✓ correct. Right. b has to stand after a and before c, so a, b, c is the only arrangement that follows both pairs. Adding the missing $a \prec c$ would change nothing, since a row with a before b and b before c already has a before c.
- **(c)** ✗. Which second arrangement would it be? b has to stand after a and before c, so b is in the middle, a first and c last: all three positions are fixed.
- **(d)** ✗. Try listing all six arrangements and checking both pairs: only a, b, c puts a before b and b before c.

</details>

<details>
<summary>Worked solution</summary>

Does the missing pair $a \prec c$ cause trouble? Let’s just count. A sorted arrangement has no pair out of order, so a must stand before b, and b before c. Then b has something before it and something after it, so b is in the middle, with a first and c last: a, b, c. Every other arrangement of the three letters breaks at least one of the two pairs, so there is exactly one sorted arrangement.

Notice what happened to $a \prec c$. In a row, a before b and b before c already puts a before c. So $a \prec c$ would have been satisfied anyway. That’s the observation from §03: asking a rule to include the pairs transitivity calls for costs nothing.

So “none, because it is not a strict partial order” mixes up two questions. A rule has an answer exactly when it has no cycle (Corollary 6); it doesn’t have to be transitive. And leaving out a pair only takes something away from the rule. And “two” or “three” would need some freedom in where b goes, but b is pinned between a and c.

</details>

**E4.** Under “noticeably smaller” ($x \prec y$ iff $y - x > 1$), how many arrangements of 1, 2, 3, 4, 5 are sorted?

*Your answer:* ______

<details>
<summary>Hint 1</summary>

Ask the §01 question: which numbers can go first? A number can go first if no remaining number is more than 1 below it.

</details>

<details>
<summary>Hint 2</summary>

Among the numbers left, only the smallest, $k$, and the next one, $k + 1$, can go first. If you pick $k + 1$, what is forced to come right after it?

</details>

<details>
<summary>Answer and feedback</summary>

- **8** ✓ Right, 8. Here the only unrelated pairs are numbers that differ by exactly 1. So a sorted arrangement can only swap some non-overlapping pairs of consecutive numbers: 12345, 21345, 13245, 12435, 12354, 21435, 21354, 13254. The counts for n = 1, …, 5 are 1, 2, 3, 5, 8. From 3 on, each is the sum of the two before it: these are the Fibonacci numbers.
- *If you answered 1:* Only one would mean every pair is settled, and here it isn’t: 1 and 2 differ by only 1, so they’re unrelated and can trade places. 2, 1, 3, 4, 5 is sorted too.
- *If you answered 120:* 120 = 5! counts every arrangement. Most of them put some number before one that is more than 1 smaller, like 5 before 1, and that pair is out of order.
- *If you answered 5:* You may have counted the identity plus the four single swaps. But swaps that don’t overlap can be combined: 2, 1, 4, 3, 5 is sorted as well.
- *Any other answer:* Not quite. Which pairs are unrelated here? Then build the arrangements the §01 way, asking at each step which numbers can go first.

</details>

<details>
<summary>Worked solution</summary>

Let’s count with the choice tree from §01, asking at each step which numbers can go first. A number can go first when nothing remaining must come before it, that is, when no remaining number is more than 1 below it. With all of 1, …, 5 waiting, 1 and 2 can go first, but 3 can’t, because 1 is more than 1 below 3. In general, if the smallest number left is $k$, the candidates are $k$ and $k + 1$, and nothing else. Every number from $k + 2$ up has $k$ more than 1 below it.

- Pick $k$: then we face the same question for the numbers above $k$.
- Pick $k + 1$: now $k$ is still waiting, and it is the only candidate. Everything else left is at least $k + 2$, more than 1 above $k$. So $k$ is forced next, and the pair goes $k + 1, k$. Then we face the same question for the numbers above $k + 1$.

Write $f(n)$ for the number of sorted arrangements of 1, …, n. Only differences matter for this rule, so arranging 2, …, n works exactly like arranging 1, …, n − 1. The first choice therefore gives $f(n) = f(n-1) + f(n-2)$: either 1 goes first and we arrange 2, …, n, or 2, 1 go first and we arrange 3, …, n. Starting from $f(1) = 1$ (just 1) and $f(2) = 2$ (1 2 and 2 1), we build up:

> $f(3) = 2 + 1 = 3,\quad f(4) = 3 + 2 = 5,\quad f(5) = 5 + 3 = 8.$

The eight are 12345, 21345, 13245, 12435, 12354, 21435, 21354 and 13254: the identity with some non-overlapping neighbouring pairs swapped. `[proof]`

If you got 5, you counted the identity and the four single swaps but missed the three that combine two swaps: 21435, 21354 and 13254.

</details>

**E5.** Put the steps of the proof of Theorem 7 (a strict total order has exactly one sorted arrangement) in order, and exclude the false steps.

*Steps (shuffled; some are false):*

- **A.** The first element of any arrangement is minimal.
- **B.** Removing that element leaves a strict total order on n − 1 elements, whose arrangement is forced by induction.
- **C.** In a partial order, the minimal element is unique.
- **D.** Two different elements cannot both lie below everything, by asymmetry, so the first position is forced.
- **E.** In a total order, a minimal element lies below every other element.
- **F.** The first element of any sorted arrangement must be minimal.

<details>
<summary>Hint 1</summary>

The theorem says there is exactly one sorted arrangement. A natural plan: show that the first position is forced, then let induction handle the rest. Which steps belong to the first part?

</details>

<details>
<summary>Hint 2</summary>

To force the first position you need what the first element must be (minimal), what minimal means in a total order (below everything), and why there can’t be two such elements. Two steps are false: test each one on the tasks of (C) or on the row 7, 2, 9, 4.

</details>

<details>
<summary>Answer and feedback</summary>

**Order:** F → E → D → B
- **A** is false: 7, 2, 9, 4 is an arrangement of numbers that starts with 7, and 7 isn’t minimal. Only the first element of a sorted arrangement has to be minimal, and that is a different step.
- **C** is false: the tasks of (C) form a partial order with two minimal elements, a and b. Uniqueness is exactly what totality adds, and the argument gets it from the steps about total orders.

That’s the proof. The first three steps force the first position: the first element must be minimal, in a total order a minimal element is below everything, and only one element can be below everything. Then induction handles the remaining n − 1 elements.

</details>

<details>
<summary>Worked solution</summary>

Let’s rebuild the argument the way §05 does. We want to show there is only one sorted arrangement. The plan is to show that the first position is forced, then let induction take care of the rest.

- First, narrow down what can go first: the first element of any sorted arrangement must be minimal (if something were below it, that something would stand later although it must come earlier). This turns the question into a question about minimal elements.
- Next, use totality to see what a minimal element $m$ looks like. For any other $y$, either $y \prec m$ or $m \prec y$. Minimality rules out the first, so $m$ is below every other element.
- Then, only one element can be below everything: two such elements would each be below the other, which asymmetry forbids. So the first position holds this one element, and it is forced.
- Finally, remove that element. The other $n - 1$ elements still form a strict total order, so by induction their arrangement is forced too.

The two false steps both overstate a true fact. “The first element of any arrangement is minimal” drops the word *sorted*: 7, 2, 9, 4 starts with 7, which isn’t minimal. “In a partial order, the minimal element is unique” fails for (C), which has two minimal elements, a and b; uniqueness is what totality buys.

Strictly speaking, the first two true steps don’t depend on each other, so the argument would still be valid with them swapped. The exercise asks for the order used in §05, which first asks what can go first and then what minimal elements look like in a total order.

</details>

---

## Ledger

**Established**

- A rule only ever speaks about two items at a time, and a row follows the rule when every pair in the row does. What the rule says about pairs is enough to build a whole row exactly when the pairs fit together; in (D) they don’t. A rule is written as a relation, its list of ‘must come before’ pairs. A correct answer is a sorted arrangement, with no pair out of order. The strict shortcut, ‘each item strictly before the next’, fails on ties. §02
- A strict partial order (irreflexive, transitive) is asymmetric and has no cycles. `[proof]` §03
- A relation has a sorted arrangement iff it has no cycle; every finite strict partial order has a linear extension, built by repeatedly removing a minimal element. `[proof]` §04
- A strict total order has exactly one sorted arrangement; its first element is forced to be the minimum. `[proof]` §05
- In a strict weak ordering, the tiers are totally ordered and there are $n_1! \cdots n_k!$ sorted arrangements. `[proof]` §06
- Checking neighbours suffices for strict weak orderings ($n - 1$ checks) `[proof]` §05–06, but not for general partial orders `[proof]` §05.

**Assumptions in force**

- Finite sets. Nothing yet about algorithms or costs.

**Lenses in use**

- None yet. (Partial orders will become the main lens in lesson 4: what an algorithm knows at any moment is a partial order.)

**Reasoning tools acquired**

- Turning a vague request into a definition precise enough to count with.
- Induction by removing a forced (or a minimal) element.
- Locating where a proof uses an assumption by building a counterexample that lacks it.
- Counting by symmetry (swapping two elements halves the count).

**Open gaps**

*(Your open gaps are listed here in the interactive version.)*

> **Open question**
>
> A program never sees the whole relation. It can only ask, one pair at a time, “is x before y?” In Python that question is `x < y`, or a comparison built from a key function. What must the code behind that question satisfy for sorting to make sense, and what happens in practice when it doesn’t?

---

**Next:** [Lesson 2: What must a comparison promise?](lesson2.md)
