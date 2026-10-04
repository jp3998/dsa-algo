# Lesson 2: What must a comparison promise?

*Stage 0 · Foundations*

> This is the Markdown edition of the interactive page. Exercises show their answers, feedback, hints and worked solutions in collapsible blocks: try each one before opening them.

## Where we are

In lesson 1 we worked out what “in order” means. A request turned out to be a rule about pairs: Dee before Ben, because Dee is younger; task b before task d, because d needs b. A correct answer is a row in which no pair is the wrong way round. For the ages, Dee, Ben, Ana, Cy is such a row: read the ages from left to right, 22, 25, 30, 30, and they never go down.

Such a row exists exactly when the rule has no cycles. Rock–paper–scissors has a cycle, and no row works for it. The row is unique when the rule settles every pair (a strict total order): 7, 2, 9, 4 can only go 2, 4, 7, 9. And then there are rules like ages, where ties carry over: Ana and Cy are both 30, and anyone who ties with Ana also ties with Cy. Such a rule is a strict weak ordering. Its correct rows are the tiers in order: Dee, then Ben, then Ana and Cy in either order. For a rule like that, it is enough to check the side-by-side pairs: in Dee, Ben, Ana, Cy, those are Dee and Ben, Ben and Ana, and Ana and Cy.

But in all of that we could see the whole rule at once: we had it written out as a list of pairs, like lesson 1’s Table 1. To find out whether Dee goes before Ana, we looked for (Dee, Ana) on the list. A program never gets that luxury. A sorting program is handed the items and a way to ask about two of them at a time: “is Dee before Ana?”. It gets back yes or no, and it has to work from those answers alone. In Python, that question is the `<` operator.

So everything a sort knows comes through that one question. What must the code behind `<` promise for sorting to make sense? How does Python let us supply it? What actually happens when the promise is broken? And how can we prove that an unusual comparison keeps its promise?

- Depends on: [Lesson 1 §06: strict weak orderings and tiers](lesson1.md); [Lesson 1 §05: the neighbour test](lesson1.md).

## Prerequisite check

**Q1.** Under "noticeably smaller" ($x \prec y$ iff $y - x > 1$), which arrangement passes the neighbour test but is **not** sorted?

- **(a)** 2.2, 1.5, 1.0
- **(b)** 1.0, 1.5, 2.2
- **(c)** 2.2, 1.0, 1.5
- **(d)** 1.5, 1.0, 2.2

<details>
<summary>Hint 1</summary>

Before looking at the rows, work out what “sorted” asks for here. Which pairs of 1.0, 1.5 and 2.2 does the rule actually relate, that is, which are more than 1 apart?

</details>

<details>
<summary>Hint 2</summary>

Only 1.0 and 2.2 are more than 1 apart, so the whole requirement is “1.0 somewhere before 2.2”. The neighbour test only looks at pairs that sit side by side. So what must a row that breaks the requirement do to get past the test?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Look at the neighbours first: 2.2 and 1.5 are 0.7 apart, and 1.5 and 1.0 are 0.5 apart. Both gaps are under 1, so the rule calls each neighbour pair a tie, and a tie can’t be the wrong way round. But 2.2 and 1.0 are 1.2 apart, so 1.0 ≺ 2.2, and here 1.0 comes last. The 1.5 in the middle ties with both ends, and that’s how it hides the violation from the neighbour test.
- **(b)** ✗. This row is genuinely sorted, so it can’t be the answer. The rule makes only one demand, 1.0 ≺ 2.2 (the other two pairs are less than 1 apart, so they tie), and here 1.0 does come before 2.2. We want a row that fools the neighbour test, which means one that is *not* sorted.
- **(c)** ✗. This row isn’t sorted, but it doesn’t fool the neighbour test either. 2.2 and 1.0 sit side by side, and they are 1.2 apart, so 1.0 ≺ 2.2. The test sees that neighbour pair out of order straight away. To slip past the test, the pair that is out of order can’t be neighbours.
- **(d)** ✗. This one is sorted. The rule makes only one demand, 1.0 ≺ 2.2, and 1.0 comes before 2.2 here. It doesn’t matter that 1.5 comes before 1.0: they are only 0.5 apart, so they tie, and either may go first.

</details>

<details>
<summary>Worked solution</summary>

Let’s first find out what “sorted” even asks for. The rule puts one number before another only when they are more than 1 apart. Among 1.0, 1.5 and 2.2 there are three pairs: 1.0 and 1.5 are 0.5 apart, 1.5 and 2.2 are 0.7 apart, and 1.0 and 2.2 are 1.2 apart. So the rule says exactly one thing, 1.0 ≺ 2.2. A row is sorted when 1.0 comes somewhere before 2.2; where 1.5 goes is free.

Now, what does the neighbour test look at? Only pairs that sit side by side. There is only one way to break the rule: put 2.2 somewhere before 1.0. The test can catch that only when 2.2 and 1.0 are neighbours. So a row that fools it must put 2.2 before 1.0 with 1.5 between them: 2.2, 1.5, 1.0. Its neighbour pairs, (2.2, 1.5) and (1.5, 1.0), are both less than 1 apart, so the test passes, yet 1.0 comes after 2.2.

The other rows fail for different reasons. In 1.0, 1.5, 2.2 and in 1.5, 1.0, 2.2, 1.0 comes before 2.2, so they really are sorted. In 2.2, 1.0, 1.5 the violation is there, but 2.2 and 1.0 are neighbours, so the test catches it.

Why can the test be fooled at all? Because under this rule ties don’t carry over: 1.0 ∼ 1.5 and 1.5 ∼ 2.2, yet 1.0 ≺ 2.2. Lesson 1 showed that the neighbour test can be trusted when ties do carry over, that is, for strict weak orderings (Lemma 11). This rule is not one of them.

</details>

**Q2.** In a strict weak ordering, what is a tier?

- **(a)** A group of elements that all tie with one another and with nothing outside the group; the tiers themselves are totally ordered.
- **(b)** An element with nothing below it.
- **(c)** A chain $x_1 \prec x_2 \prec \cdots$.
- **(d)** The set of all elements below a given $x$.

<details>
<summary>Hint 1</summary>

Think of request (B) from lesson 1: people by age, youngest first. What do the people in one tier have in common, and how do any two of them compare?

</details>

<details>
<summary>Hint 2</summary>

Ana and Cy are both 30, so either of them may go first: they tie. Which option describes a group like {Ana, Cy}, and what does it say about how such groups compare with each other?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. A tier is a group of items that all tie with one another, like Ana and Cy (both 30) in request (B). And lesson 1’s Lemma 9 showed that the tiers line up one after another: every member of an earlier tier comes before every member of a later one. So ties live inside a tier, like Ana and Cy. Any two items from different tiers have a required order, like Dee before Ben, or Ben before Cy.
- **(b)** ✗. That describes a minimal element (lesson 1 §04), which is a single item, not a group. A tier is a whole group of items that tie with one another, and it can sit anywhere in the order. In request (B), {Ana, Cy} is the last tier, and both Ana and Cy have people who must come before them: Dee and Ben.
- **(c)** ✗. A chain is the opposite of a tier. In a chain every pair has a required order; inside a tier every pair ties. In request (B), Dee ≺ Ben ≺ Ana is a chain, and it takes one person from each tier.
- **(d)** ✗. That set can contain two items with a required order between them, and then it can’t be a tier. In request (B), the people below Ana are Dee and Ben, and Dee must come before Ben, so they don’t tie. A tier is defined by its members all tying with one another, not by which item they sit below.

</details>

<details>
<summary>Worked solution</summary>

Let’s rebuild the idea from request (B): Ana (30), Ben (25), Cy (30), Dee (22), youngest first. Ana and Cy are both 30, so either of them may go first: they tie. In a strict weak ordering ties carry over, so “ties with” splits the items into groups in which everyone ties with everyone. Those groups are the tiers: here {Dee}, {Ben} and {Ana, Cy}.

Two facts follow. Inside a tier every pair ties, like Ana and Cy. Between two tiers every pair has a required order, always in the same direction: Dee before Ben, Ben before Ana, Ben before Cy, and so on. Lesson 1’s Lemma 9 showed that every member of an earlier tier comes before every member of a later one. So the tiers themselves are totally ordered. That is exactly the first option.

The other options describe different things. A minimal element is a single item, such as Dee here: nobody has to come before Dee. A chain such as Dee ≺ Ben ≺ Ana has a required order for every pair, the opposite of a tier. And the set of people below Ana, {Dee, Ben}, contains Dee and Ben, and Dee must come before Ben, so it isn’t a tier either.

</details>

---

## 01 · The only question Python asks

What `<` has to promise depends on what the sort does with its answers. So let’s watch the sort. What does Python’s sort actually do with the items you give it? `sorted(xs)` and `xs.sort()` have exactly one way of finding out anything about your items: they ask `a < b`. Python’s documentation promises this: the sort routines use only `<` when comparing two objects. You can see it for yourself. A class that defines nothing but `__lt__` sorts without complaint:

**Listing 1.** *A class with only `__lt__` sorts without complaint.*

```python
class Box:
    def __init__(self, v):
        self.v = v

    def __lt__(self, other):
        return self.v < other.v

    def __repr__(self):
        return f"Box({self.v})"

print(sorted([Box(3), Box(1), Box(2)]))   # [Box(1), Box(2), Box(3)]
```

In lesson 1’s terms, this `<` is the rule $\prec$. But the sort meets that rule in a very different way. For the ages, lesson 1 handed us the whole list at once: Table 1’s five pairs, (Dee, Ben), (Dee, Ana), (Dee, Cy), (Ben, Ana) and (Ben, Cy). We could look up any pair. The sort gets no list. In Listing 1 it gets three boxes and the `__lt__` method, which it can call on any two boxes it chooses. To learn whether `Box(1)` goes before `Box(3)`, it has to call `Box(1) < Box(3)` and read the answer, `True`. It learns only the answers to the questions it asks.

Does it ask about every pair? It could, and that would be safe, but it would be expensive. With $n$ items there are $n(n-1)/2$ pairs, about half a million for 1000 items. A good sort makes far fewer comparisons than that (lesson 3 counts exactly how many Python’s sort makes). So the sort asks about some pairs and draws conclusions about the rest.

How can it conclude anything about a pair it never asked about? It lets answers carry over, and it does that with both kinds of answer. Take the row Dee, Ben, Ana, and suppose the sort never asks about Dee and Ana. Here is a “yes” carrying over. The sort asks “is Dee before Ben?” and hears yes. It asks “is Ben before Ana?” and hears yes. From those two answers it treats “Dee is before Ana” as known.

Here is a “no” carrying over, on the same row. This time the sort checks the two neighbour pairs, each time asking whether the right-hand person should come before the left-hand one. “Is Ben before Dee?” No. “Is Ana before Ben?” No. So neither neighbour pair is the wrong way round, and the sort treats the whole row as right, Dee and Ana included. Both times the sort settled Dee and Ana without asking about them. From two yeses it concluded a third yes: Dee is before Ana. From two noes it concluded a third no: Ana and Dee are not the wrong way round.

Are those conclusions safe? Lesson 1 has already answered that, once for each kind of answer. Carrying a “yes” is just transitivity, and every strict partial order has it. Carrying a “no” is exactly what lesson 1’s neighbour test does, and lesson 1, §05 found where it breaks. A “no” says less than it seems to. If “is Ben before Dee?” gets a no, it may be that Dee must come first, or it may be that the two tie and either can go first. And ties need not chain together. The tasks of request (C) showed this: d needs b, and c needs a and b. Take the row d, a, b, c and check its neighbours. d and a: neither needs the other, so they tie. a and b: they tie too. b and c: c needs b, and b is on the left, so that pair is fine. The neighbour test passes. Yet d needs b, and d stands first. The two ties, d with a and a with b, linked up a pair that is the wrong way round.

When ties do carry over, acting on a “no” is safe. That happens exactly when the rule is a strict weak ordering, like ages. Then checking the neighbours really is enough (lesson 1, Lemma 11). In Dee, Ben, Ana, Cy the ages read 22, 25, 30, 30, never going down from one person to the next, and that guarantees that no pair anywhere in the row is the wrong way round. And a sort can’t avoid acting on “no” answers. Ask about Ana and Cy, who are both 30, and both questions get a no: “is Ana before Cy?” no, and “is Cy before Ana?” no. That is all a tie ever tells the sort, yet the sort still has to put one of the two in front. Acting on “no” answers is safe for a strict weak ordering, and it can mislead the sort for any other rule. So we should expect a sort to give a meaningful answer only when the `<` it is handed is a strict weak ordering `[intuition]`. (Exactly how a particular sort gets misled depends on which pairs it happens to ask about. In §05 we’ll catch Python’s sort acting on “no” answers in just this way.)

And here is the catch: nobody checks. Python never tests whether your `<` is a strict weak ordering. It simply trusts it.

So the question for the rest of the lesson is a concrete one. When we hand Python a way to compare, how can we be sure it is a strict weak ordering? Python accepts two kinds of comparison, and they differ in what you write. Take sorting people by age. With a **key function**, you write something that looks at one person and returns a value: Dee gives 22, Ben gives 25. Python then compares those values with the numbers’ own `<`. With a **comparison function**, you write something that looks at two people at once and says which goes first: given Dee and Ben, it answers “Dee”. So a key describes one item at a time, and a comparison function judges a pair. Keys come first, because they turn out to be the safe kind.

---

## 02 · Keys always give a well-behaved order

Why should keys be the safe kind? Look at what Python does with one. Real data are rarely bare numbers. They’re records: people, tasks, intervals. And we rarely want to sort “the record” itself; we want to sort by some property of it, such as age, deadline or length. That’s what Python’s `key=` parameter is for. `sorted(people, key=age)` computes `age(p)` once for each person and then compares those ages with `<`.

Notice what is actually being compared. Sorting people by age never compares two people; it compares two ages, which are just numbers. To decide between Dee and Ben, it compares 22 with 25. The order on people is *borrowed* from the order on numbers. We’ll reason about borrowed orders a lot, so let’s give them a name. The usual word is *induced*: the order on the keys brings about, or induces, an order on the people.

> **Definition (relation induced by a key)**
>
> Let $f$ map each element of $X$ to a set $K$ of keys that carries a strict total order $<$. The relation **induced by** $f$ is $x \prec_f y$ iff $f(x) < f(y)$.

Request (B) from lesson 1 is exactly this kind of borrowed order. In the definition’s letters, $X$ is the four people, $f$ is “age”, and $K$ is the numbers. Dee ≺ Ben because 22 < 25. Ana and Cy tie because their keys are equal: 30 = 30.

And request (B) is a strict weak ordering: lesson 1 found its tiers, {Dee}, {Ben} and {Ana, Cy}. Is that a lucky accident of ages? Or is every borrowed order a strict weak ordering, the kind of rule §01 says a sort needs? If every one is, then `key=` is safe by construction, as §01 promised.

We can also ask the question the other way round. So far the key came first: we knew the ages, and the order followed from them. Now start from the order instead. Suppose all we had were Table 1’s five pairs for the ages, with the ages themselves hidden. Could we invent a number for each person that gives exactly those five pairs? And can that always be done for a strict weak ordering, or are there well-behaved rules that no key could ever produce? This direction will turn out to be just as useful. Suppose every strict weak ordering does have a key. Then a comparison that looks nothing like a key might still be hiding one. If we can find the hidden key, that proves the comparison is well behaved. Theorem 1 settles both directions: a borrowed order is always a strict weak ordering, and every strict weak ordering on a finite set is a borrowed order.

> **Theorem 1 (keys give exactly the strict weak orderings)**
>
> (a) Every relation induced by a key is a strict weak ordering; its tiers are the sets of elements with equal keys. (b) Conversely, every strict weak ordering on a finite set is induced by some key.

> **Proof**
>
> (a) Irreflexive: $f(x) < f(x)$ never holds. Transitive: $f(x) < f(y) < f(z)$ gives $f(x) < f(z)$. Ties: since $<$ is total on $K$, "neither $f(x) < f(y)$ nor $f(y) < f(x)$" means exactly $f(x) = f(y)$, and equality is transitive. So $\sim$ is transitive and its classes are the sets of equal keys.
>
> (b) By lesson 1, Lemma 9, the tiers line up as $T_1, T_2, \ldots, T_k$, and $x \prec y$ holds exactly when $x$'s tier comes before $y$'s. So the key $f(x) = i$ for $x \in T_i$ induces $\prec$. ∎

Let’s read that back slowly, because it is the whole reason `key=` is safe. Part (a) says that whatever key function you write, the order it produces is a strict weak ordering. There is one condition: *the key values themselves must be totally ordered by `<`*. That means: for any two different key values, `<` says which one is smaller, and its answers carry over along chains. Ages are plain numbers, so they pass. Of 22 and 25, 22 is smaller; of 25 and 30, 25 is smaller; and then 22 is smaller than 30 too. So sorting people by age is safe. Part (a) also says what the tiers are: the groups of items with equal keys. For ages those are {Dee}, {Ben} and {Ana, Cy}, just as lesson 1 found. Hold on to that condition about the key values, though. §05 meets a value that breaks it, NaN, and shows what goes wrong then.

Part (b) answers the other direction. Its proof builds the key out of the tiers: number the tiers 1, 2, 3, … from first to last, and give each item the number of its tier. For request (B) that gives Dee 1, Ben 2, and Ana and Cy both 3, and sorting by those numbers gives exactly the order by age. So nothing is lost by thinking of every well-behaved comparison as “compare some key”. In §06 that is what will let us prove that a strange-looking comparison is safe: we’ll go looking for its hidden key.

Ties raise one more question. Lesson 1 showed that the members of a tier may stand in any order among themselves (Theorem 10). So Dee, Ben, Ana, Cy and Dee, Ben, Cy, Ana are both correct answers. Which one does Python pick? It keeps tied items in their input order. If the input is Ana, Ben, Cy, Dee, with Ana listed before Cy, sorting by age gives Dee, Ben, Ana, Cy. If the input is Cy, Ben, Ana, Dee, with Cy listed first, the same sort gives Dee, Ben, Cy, Ana. The ages decide everything else; only the order of the tied pair, Ana and Cy, comes from the input. Words show the same thing. `sorted(["pear", "fig", "kiwi", "plum", "apple"], key=len)` returns `['fig', 'pear', 'kiwi', 'plum', 'apple']`. Pear, kiwi and plum all have 4 letters, so they tie, and they stay in the order they came in. Python guarantees this. It is called **stability**, because items that tie stay put relative to one another. Lesson 7 shows why anyone needs it.

---

## 03 · Several keys: lexicographic order

Input order is a fine way to settle ties when you don’t care how they come out. Often, though, you do. Ana and Cy are both 30, and you might want them in alphabetical order, Ana before Cy, whoever happened to be listed first. Take the input Cy, Ben, Ana, Dee. Sorting by age alone gives Dee, Ben, Cy, Ana: the ages are right, but Cy stays ahead of Ana because Cy was listed first. Sorting by name alone gives Ana, Ben, Cy, Dee: alphabetical, but now Ana, who is 30, stands ahead of Dee, who is 22. What you want is Dee, Ben, Ana, Cy. That needs an order on pairs (age, name) that compares ages first and looks at names only when the ages are equal.

You already know an order that works exactly like this: the one in a dictionary. The first letter decides: “bed” comes before “cat” because b comes before c. Only when the first letters agree does the second letter matter, and so on: “cab” comes before “cat” because, after the shared “ca”, b comes before t. The order is named after the dictionary: *lexicographic*, from “lexicon”. For pairs it reads:

> **Definition (lexicographic order on pairs)**
>
> Given strict total orders on the first and on the second coordinates, $(p, q) <_{\text{lex}} (p', q')$ iff $p < p'$, or $p = p'$ and $q < q'$.

Is it safe to sort by this? Here’s a neat way to find out. Suppose we treat the whole pair as one key: Ana’s key is (30, "Ana"), Cy’s is (30, "Cy"), Dee’s is (22, "Dee"). Then Theorem 1 would make the borrowed order safe straight away. And Theorem 1 asks only one thing of its keys: that the keys themselves are compared by a strict total order. So the question becomes: are pairs, compared lexicographically, a strict total order? In plain words: given any two different pairs, such as (30, "Ana") and (30, "Cy"), does the comparison always say which one is smaller, and do its answers carry over along chains?

> **Theorem 2 (lexicographic order is total)**
>
> If both coordinate orders are strict total orders, $<_{\text{lex}}$ is a strict total order on pairs.

> **Proof**
>
> Irreflexive: $(p,q) <_{\text{lex}} (p,q)$ would need $p < p$ or $q < q$.
>
> Transitive: let $(p_1,q_1) <_{\text{lex}} (p_2,q_2) <_{\text{lex}} (p_3,q_3)$. The first step gives $p_1 \le p_2$ and the second $p_2 \le p_3$. If either step was decided by the first coordinate, then $p_1 < p_3$ and we are done. Otherwise both steps were ties on the first coordinate, $p_1 = p_2 = p_3$, and $q_1 < q_2 < q_3$ gives $q_1 < q_3$.
>
> Total: two different pairs differ in the first coordinate, which decides, or agree there and differ in the second, which decides. ∎

So the pair (age, name) is a safe key. Dee’s (22, "Dee") comes first, because 22 is the smallest age, and Ben’s (25, "Ben") comes next. Ana’s (30, "Ana") and Cy’s (30, "Cy") agree on the age, so the names decide, and Ana comes before Cy. The input Cy, Ben, Ana, Dee now comes out as Dee, Ben, Ana, Cy, whatever order the names were listed in.

What about three or more keys? Say each person also has a team number, and the key is (age, name, team). Python compares (30, "Ana", 2) with (30, "Ana", 5) one position at a time: the ages agree, the names agree, and then 2 < 5 decides. That is the same as comparing the pairs (30, ("Ana", 2)) and (30, ("Ana", 5)). Their first coordinates agree, so their second coordinates decide, and each second coordinate is itself a pair. In general, a triple $(p, q, r)$ compared lexicographically behaves exactly like the pair $(p, (q, r))$. Theorem 2 makes the inner pairs $(q, r)$ a strict total order. Applied once more, with the inner pairs as second coordinates, it makes the triples a strict total order too. Longer tuples work the same way, one coordinate at a time. Python compares tuples (and lists, and strings) in exactly this way: it finds the first position where they differ and compares there. If one tuple is the start of the other, as with (1, 2) and (1, 2, 5), the shorter one comes first. That keeps the order total even for tuples of different lengths. So `key=lambda r: (r.age, r.name)` really is a key whose values are totally ordered. By Theorem 1 the order it produces is a strict weak ordering. Its tiers are the records with equal age *and* equal name.

What if you want one field in descending order? For a number, negate it: `key=lambda t: (-t[0], t[1])` sorts by score, highest first, and then by name. Negating turns the highest score, 90, into the smallest key, −90, so it comes first. On `[(90, "Lee"), (85, "Ana"), (90, "Bo"), (70, "Cy")]` that gives `[(90, 'Bo'), (90, 'Lee'), (85, 'Ana'), (70, 'Cy')]`.

<details>
<summary><b>Common question · How do I sort descending by a string?</b></summary>

You cannot negate a string. And `reverse=True` reverses the whole order, so it makes *every* level descending. Try `key=lambda t: (t[0], t[1])` with `reverse=True` on the example above. It gives `[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]`, with the names descending too. To mix directions when a string field has to descend, you have two options. You can sort twice and rely on stability (lesson 7 explains why that works). Or you can write a comparison function (§04).

</details>

> **Note**
>
> Note
>
> Tuple keys compare later components **only on ties**. But when a tie does happen, those later components must support `<`. A list of `(priority, record)` tuples, or any structure that keeps such tuples in priority order, works until two priorities are equal. Then Python compares the records. If they are dictionaries, that raises `TypeError: '<' not supported between instances of 'dict' and 'dict'`. Exercise E2 below is this bug.

#### Checkpoint 1

**Q1.** You want words sorted by length, and words of equal length alphabetically. Which call does it?

- **(a)** `sorted(words, key=len)`
- **(b)** `sorted(words, key=lambda w: (len(w), w))`
- **(c)** `sorted(words, key=lambda w: (w, len(w)))`
- **(d)** `sorted(words, key=lambda w: len(w) + w)`

<details>
<summary>Hint 1</summary>

Which criterion should decide first, and which should only break ties? Remember how tuples compare: the first coordinate decides, and the next one is consulted only on a tie.

</details>

<details>
<summary>Hint 2</summary>

You want a key that is a pair. Which goes first in the pair, the length or the word? Try the candidates on two words of the same length, such as pear and kiwi.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✗. Close, but this only settles the lengths. Words of equal length tie, and Python’s sort is stable, so tied words keep their *input* order rather than going alphabetical. On `['pear', 'fig', 'kiwi', 'plum', 'apple']` it gives `['fig', 'pear', 'kiwi', 'plum', 'apple']`, with pear before kiwi.
- **(b)** ✓ correct. Yes. The key is a pair, and pairs compare lexicographically: the length decides whenever two lengths differ, and only when they’re equal does Python look at the word itself. On `['pear', 'fig', 'kiwi', 'plum', 'apple']` it gives `['fig', 'kiwi', 'pear', 'plum', 'apple']`.
- **(c)** ✗. This has the priorities the wrong way round. In a pair, the first coordinate decides whenever it differs, and two different words always differ, so the length never gets a say. The result is plain alphabetical order: `['apple', 'fig', 'kiwi', 'pear', 'plum']`.
- **(d)** ✗. Python can’t add a number to a string, so this raises `TypeError: unsupported operand type(s) for +: 'int' and 'str'` before any sorting happens. To combine two criteria, put them in a tuple, which compares them one after the other.

</details>

<details>
<summary>Worked solution</summary>

We want two things at once: shorter words first, and alphabetical order only among words of the same length. That is exactly lexicographic order on the pair (length, word): compare lengths, and look at the words only when the lengths are equal. By Theorems 1 and 2 such a tuple key always gives a strict weak ordering, so the sort is safe.

Let’s run it on `['pear', 'fig', 'kiwi', 'plum', 'apple']`. The keys are (4, 'pear'), (3, 'fig'), (4, 'kiwi'), (4, 'plum') and (5, 'apple'). Length 3 is smallest, so fig leads. The three keys with length 4 tie on the first coordinate, so the words decide: kiwi, pear, plum. Last comes apple, with length 5. The result is `['fig', 'kiwi', 'pear', 'plum', 'apple']`.

Now the tempting alternatives. `key=len` gets the lengths right but leaves equal lengths in input order, because the sort is stable: pear stays ahead of kiwi. `(w, len(w))` puts the word first, and since different words always differ, length is never consulted: that’s alphabetical order. And `len(w) + w` tries to add a number to a string, which raises `TypeError`.

</details>

**Q2.** Records are `(score, name)`. You want the highest score first and, among equal scores, names A to Z. Which works?

- **(a)** `key=lambda t: (-t[0], t[1])`
- **(b)** `key=lambda t: (t[0], t[1]), reverse=True`
- **(c)** `key=lambda t: (-t[0], -t[1])`
- **(d)** `key=lambda t: t[0], reverse=True`

<details>
<summary>Hint 1</summary>

The two levels go in opposite directions: scores high to low, names A to Z. Can a single switch like `reverse=True` do that, or does it flip every level at once?

</details>

<details>
<summary>Hint 2</summary>

Make the score descend inside the key itself, and leave the name untouched. What can you do to a number that reverses its order?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Negating the score flips only the first level: a higher score becomes a smaller key, so it comes first. The name is left alone, so equal scores fall back on A to Z. On `[(90, "Lee"), (85, "Ana"), (90, "Bo"), (70, "Cy")]` this gives `[(90, 'Bo'), (90, 'Lee'), (85, 'Ana'), (70, 'Cy')]`.
- **(b)** ✗. This gets the scores right but the names wrong. `reverse=True` reverses the whole lexicographic order, every level at once, so among equal scores the names come out Z to A: `[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]`.
- **(c)** ✗. You can’t negate a string: `-t[1]` raises `TypeError: bad operand type for unary -: 'str'`. And even if you could, you wouldn’t want to here, because the names should stay A to Z.
- **(d)** ✗. This puts high scores first, but it never looks at the names. Equal scores tie, and a stable sort keeps tied records in their input order (`reverse=True` keeps that stability). So in the example Lee, who came first in the input, stays ahead of Bo: `[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]`.

</details>

<details>
<summary>Worked solution</summary>

The difficulty is that the two levels go in opposite directions, while a tuple key compares both coordinates in ascending order. So we need to turn “highest score first” into an ascending comparison. For numbers that’s easy: negate. Since 90 > 85, we get −90 < −85, so sorting by −score ascending is sorting by score descending.

With the key (−score, name) on `[(90, "Lee"), (85, "Ana"), (90, "Bo"), (70, "Cy")]`, the keys are (−90, 'Lee'), (−85, 'Ana'), (−90, 'Bo') and (−70, 'Cy'). The two −90s come first and tie on that coordinate, so the names decide: Bo before Lee. Then −85 (Ana), then −70 (Cy). Result: `[(90, 'Bo'), (90, 'Lee'), (85, 'Ana'), (70, 'Cy')]`.

Why not the others? `reverse=True` on `(t[0], t[1])` reverses the entire order, so it flips the names too and puts Lee before Bo. `key=lambda t: t[0]` with `reverse=True` never consults the names, so the tied 90s stay in input order, which again puts Lee first. And `-t[1]` tries to negate a string, which Python refuses with a `TypeError`. (For a descending *string* field, see the common question in §03.)

</details>

---

## 04 · Comparators and their contract

Keys are safe, so why would you ever want anything else? Because some rules are much easier to state about two items than about one. Lesson 1 met two of them. “Task c needs task a” is a fact about two tasks. “Rock beats scissors” is a fact about two hands, not a number attached to each one. Neither rule is a strict weak ordering, so by §01 Python’s sort can’t be trusted with them. But rules about pairs also turn up in perfectly reasonable problems.

Here is one, which we’ll solve in §06. You want to arrange numbers so that writing them side by side gives the largest possible number. Writing numbers side by side is called *concatenation*, from the Latin for “chaining together”. The natural way to decide between two numbers is to write them both ways round and keep the bigger result. For 5 and 34 that means comparing 534 with 345, so 5 goes first. In general, for two numbers $a$ and $b$ you compare the two concatenations $ab$ and $ba$. Set that beside a key. A key would give 5 a value of its own, give 34 a value of its own, and compare the two values. This rule gives neither number a value. It glues the two numbers together, both ways round, and compares the results. That is a rule about the pair, and there’s no obvious key in sight.

For rules like this, Python accepts a comparison function. You write `cmp(a, b)` to return a negative number if a should come first, a positive number if b should, and 0 if it doesn’t matter. For the concatenation rule, `cmp("5", "34")` returns −1, because 534 beats 345, so "5" should come first. But `sorted` has no parameter for a comparison function; it only takes `key=`. So Python offers `functools.cmp_to_key(cmp)`, and its name says what it does: it turns a comparison function into something you can pass as a key. It wraps each item in a small object. When the sort asks the wrapped "5" “are you less than the wrapped "34"?”, the object answers by checking `cmp("5", "34") < 0`, which is true. So the wrapped items are not real keys with values of their own: every answer still comes from calling `cmp` on the pair. Since the sort only ever asks `<`, the rule the sort actually sees is

$$
a \prec b \iff \texttt{cmp}(a, b) < 0.
$$

What must that rule satisfy? §01 has already told us: it has to be a strict weak ordering. The sort itself only ever looks at whether `cmp(a, b)` is negative, so for the sort, that is all that matters. But a comparison function gives other answers too, and they make promises of their own. A positive value is supposed to mean “b first”, and zero “it doesn’t matter”. Suppose `cmp(5, 34)` said 0, “it doesn’t matter”, while `cmp(34, 5)` said −1, “34 first”. Then the function would be contradicting itself. Any code that reads those answers, yours or a library’s, would see a different order from the one the sort used. So we also ask that swapping the arguments flips the sign: if `cmp(5, 34)` is negative, `cmp(34, 5)` must be positive. Together, these two conditions are the promises every comparison function has to keep. They are called its *contract*, because the sort, and any other code that calls the function, relies on them, the way both sides of a contract rely on its terms.

> **Definition (comparator contract)**
>
> A comparison function is **valid** if the relation $a \prec b \iff \texttt{cmp}(a,b) < 0$ is a strict weak ordering, and its signs agree: $\texttt{cmp}(a,b) < 0$ exactly when $\texttt{cmp}(b,a) > 0$.

With a key, Theorem 1 does the checking for us, once and for all values: the order is a strict weak ordering as long as the key values are totally ordered. A comparison function has no such guarantee. That is what makes it risky: it can break its contract silently, and nothing in Python will warn you. Here is one that does. People often compare floats with a tolerance: call two numbers a tie when they are less than 1 apart, and otherwise put the smaller one first. Try it on 0.0, 0.6 and 1.2. 0.0 and 0.6 are 0.6 apart, so they tie. 0.6 and 1.2 are 0.6 apart, so they tie too. If ties carried over, 0.0 and 1.2 would tie as well. But they are 1.2 apart, so the comparison puts 0.0 first. Those three numbers prove that this comparison is not a strict weak ordering.

So how could you find such a triple, if there is one? On a finite sample of values you can simply try every case, which is called checking by *brute force*. There are three kinds of question to ask. First, is any value before itself? On the sample 0.0, 0.6, 1.2, 1.8 that means four questions, “is 0.0 before 0.0?” and so on, and each answer must be no (irreflexivity). Second, do “before” answers carry over? For every triple: if the first is before the second, and the second is before the third, the first must be before the third (transitivity). Third, do ties carry over? For every triple: if the first ties the second, and the second ties the third, the first must tie the third (transitivity of ties). With four values there are 4 × 4 × 4 = 64 triples for each of the last two questions. One value or one triple that breaks a rule is called a *counterexample*, and it is enough to prove that the comparison is broken; for the tolerance comparison, 0.0, 0.6, 1.2 is one. Passing on a sample is evidence about other values, but not a proof: unlike Theorem 1, the check covers only the values it was given.

Listing 2 is that check. It asks its questions through a function `before(x, y)` that answers “is x before y?”, so it tests the half of the contract the sort depends on, the strict weak ordering. Fig. 1 runs it on seven comparisons, some sound and some broken.

**Listing 2.** *Checking a relation on a finite sample. Returns None, or the first counterexample.*

```python
def check_strict_weak(values, before):
    """Brute-force check of the strict-weak-ordering axioms on a sample."""
    for x in values:
        if before(x, x):
            return ("not irreflexive", x)
    for x in values:
        for y in values:
            for z in values:
                if before(x, y) and before(y, z) and not before(x, z):
                    return ("not transitive", x, y, z)

    def tie(x, y):
        return not before(x, y) and not before(y, x)

    for x in values:
        for y in values:
            for z in values:
                if tie(x, y) and tie(y, z) and not tie(x, z):
                    return ("ties not transitive", x, y, z)
    return None
```

**Fig. 1.** *Comparator checker. Pick a comparison and a sample. The table shows every answer to "is the row before the column?"; the verdict is the output of `check_strict_weak`, computed by a line-by-line port of Listing 2.*

---

## 05 · What happens when the promise breaks

Four of the seven comparisons in Fig. 1 fail the check. None of them is far-fetched; each is something people really write. There’s the tolerance for floats that are “close enough”, which we just met, plain `<` on floats that include NaN, the cyclic “beats” of rock–paper–scissors, and `<` on sets. So what does Python do when it’s handed one of these? Let’s start with NaN, and make a prediction first.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

`nan = float("nan")`. What does `sorted([3.0, nan, 1.0, 2.0])` return?

- **(a)** `[1.0, 2.0, 3.0, nan]`
- **(b)** `[nan, 1.0, 2.0, 3.0]`
- **(c)** `[3.0, nan, 1.0, 2.0]`, unchanged
- **(d)** It raises an error.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. That’s the natural guess: NaN isn’t a number, so surely it gets pushed to the end. But the sort has no special rule for NaN; all it ever does is ask `<`. The explanation below shows what those answers do.
- **(b)** ✗. Python has no rule that puts NaN first, either. The sort only asks `<`, and NaN gives it some strange answers. The explanation is just below.
- **(c)** ✓ correct. Yes, surprisingly, the sort changes nothing at all. The explanation below shows why it found nothing to fix.
- **(d)** ✗. A reasonable fear, but Python raises no error: comparing NaN with a number is perfectly legal; it just always answers `False`. The explanation below shows what that does to the sort.

</details>

<details>
<summary><b>Reveal</b></summary>

CPython returns the list **unchanged**: `[3.0, nan, 1.0, 2.0]` `[empirical]`. Here’s why. Every comparison involving NaN is false: `nan < 3.0` is `False`, and `3.0 < nan` is `False` too. So, as far as the sort can tell, NaN ties with every number. That links any two numbers through NaN: 1.0 ∼ NaN and NaN ∼ 3.0, yet 1.0 < 3.0. So ties don’t carry over here, and lesson 1, [§06](lesson1.md) showed that the neighbour test can then be fooled.

And the sort falls into exactly that trap. If you log the comparisons, you’ll find that CPython asks just three questions on this list, one for each neighbour pair. It is looking for a stretch that is already in order. Each question asks whether the right-hand number of a neighbour pair should come before the left-hand one: is nan < 3.0? is 1.0 < nan? is 2.0 < 1.0? Every answer is “no”, so no neighbour pair looks the wrong way round. So the sort concludes that the whole list is already sorted, and stops. It never asks about 3.0 and 1.0, the one pair that would have exposed the problem.

</details>

Worse, the output depends on where NaN happens to start `[empirical]`:

**Table 1.** *CPython 3.12.3. Same four values, three starting orders.*

| Input | `sorted(input)` |
|---|---|
| `[3.0, nan, 1.0, 2.0]` | `[3.0, nan, 1.0, 2.0]` |
| `[nan, 3.0, 1.0, 2.0]` | `[nan, 1.0, 2.0, 3.0]` |
| `[3.0, 1.0, nan, 2.0]` | `[1.0, 2.0, 3.0, nan]` |

`max` and `min` are affected the same way, because they compare too: `max([nan, 1.0, 2.0])` is `nan`, but `max([1.0, nan, 2.0])` is `2.0`.

The other broken comparisons behave just like NaN: no error, and an answer that depends on the starting order.

**Table 2.** *CPython 3.12.3, broken comparisons. Every output except the lucky one has a pair that is out of order, marked in red (bold and underlined).*

| Comparison | Input | Output | What is wrong |
|---|---|---|---|
| tolerance 1 (`cmp_to_key`) | `[3.0, 2.4, 1.8, 1.2, 0.6]` | `[3.0, 2.4, 1.8, 1.2, 0.6]` | unchanged: every neighbour pair is a "tie", yet 0.6 is more than 1 below 3.0 |
| tolerance 1 | `[2.2, 1.0, 1.5]` | `[1.0, 2.2, 1.5]` | nothing (lucky): this is a valid order of the partial order |
| rock–paper–scissors (`cmp_to_key`) | `['rock', 'paper', 'scissors']` | `['scissors', 'paper', 'rock']` | scissors before rock, but rock beats scissors |
| rock–paper–scissors | `['rock', 'scissors', 'paper']` | `['rock', 'scissors', 'paper']` | paper after rock, but paper beats rock |
| sets (`<` is proper subset) | `[{1, 2}, {3}, {1}]` | `[{1, 2}, {3}, {1}]` | {1} ⊂ {1, 2} but comes after it |

In every run the output was at least a rearrangement of the input: nothing was lost or duplicated `[empirical]`. But Python’s documentation promises nothing about *which* rearrangement you get when the comparison is inconsistent. So don’t rely on any of these outputs.

Why does a sort fall for this? We already watched it happen with NaN, and it is the failure §01 warned us about `[intuition]`. The sort never asks about every pair, and it acts on its “no” answers as if they carried over. When ties don’t carry over, a chain of “ties” can connect two items that are actually ordered. With NaN the chain was 1.0 ∼ NaN ∼ 3.0. The tolerance comparison builds a longer chain out of ordinary numbers. 3.0 ties 2.4, 2.4 ties 1.8, and so on down to 0.6, so the chain links 3.0 all the way to 0.6. Yet 3.0 and 0.6 are 2.4 apart, so the comparison puts 0.6 first. The sort never asks about that one pair, the pair that would give the game away. This is lesson 1’s “noticeably smaller” trap, and Python’s sort walks straight into it.

Rock–paper–scissors is broken more deeply. There even the “yes” answers don’t carry over. Rock beats scissors, and scissors beats paper, so carrying the yeses would put rock before paper. Yet paper beats rock. That cycle means no arrangement of the three is sorted at all (lesson 1, Lemma 1), so every possible output is wrong.

In every one of these cases, the algorithm isn’t at fault. It relies on being handed a strict weak ordering, and it wasn’t. A condition that an algorithm counts on before it starts is called its *precondition*, and here the precondition was violated. (Some languages detect some violations: Java’s library sort sometimes throws “Comparison method violates its general contract!”. Python doesn’t.)

So how do we repair a broken comparison? Theorem 1 points the way. Replace the comparison with a key whose values are totally ordered. Then the order is a strict weak ordering by construction, whatever the data. Listing 3 does this for NaN and for the tolerance. On the same list, `[3.0, nan, 1.0, 2.0]`, plain `sorted` changed nothing, and the repaired key gives `[1.0, 2.0, 3.0, nan]`.

**Listing 3.** *Repairs that turn a broken comparison into a key.*

```python
import math

nan = float("nan")
data = [3.0, nan, 1.0, 2.0]
print(sorted(data, key=lambda x: (math.isnan(x), x)))   # [1.0, 2.0, 3.0, nan]

def bucket(x, eps=1.0):
    """Tolerance done safely: round to a grid, then compare exactly."""
    return round(x / eps)
```

Here is what those repairs do. The NaN key gives each ordinary number the key `(False, value)` and each NaN the key `(True, nan)`. For `[3.0, nan, 1.0, 2.0]` the keys are `(False, 3.0)`, `(True, nan)`, `(False, 1.0)` and `(False, 2.0)`. `False` comes before `True`, so the NaNs all go last, and the ordinary numbers are compared by value. The NaNs all tie with one another, and that is perfectly consistent. So the numbers are compared just as before; what changed is that NaN now has a definite place, after every number.

The grid key, `key=bucket`, is a genuine key too, so it’s safe. Set it beside the tolerance comparison on 3.0, 2.4, 1.8, 1.2, 0.6. The tolerance comparison asks a question about each pair: are these two less than 1 apart? The grid key asks a question about each number on its own: which whole number is it closest to? That gives buckets 3, 2, 2, 1, 1, and sorting by them gives `[1.2, 0.6, 2.4, 1.8, 3.0]`. Under the tolerance, 3.0 and 2.4 tied; under the grid key, 2.4 (bucket 2) comes before 3.0 (bucket 3). So the grid key changes the meaning of “tie”. 0.49 and 0.51 land in different buckets, 0 and 1, even though they’re close. Meanwhile 0.51 and 1.49 land in the same bucket, 1, even though they are almost 1 apart.

That trade-off can’t be avoided. In a strict weak ordering ties carry over, and “close” doesn’t: 3.0 is close to 2.4, and 2.4 is close to 1.8, but 3.0 and 1.8 are 1.2 apart. Any strict weak ordering that calls 3.0 and 2.4 a tie, and 2.4 and 1.8 a tie, has to call 3.0 and 1.8 a tie as well. So no strict weak ordering can make “close” mean exactly “tie”.

So each repair came down to finding a key. Here that was easy, because both broken comparisons were sloppy versions of the ordinary order on numbers, and the key was the number itself, tidied up. But what about a rule that is about pairs from the start, like “write 5 and 34 both ways round and keep the bigger”? There is no number in sight to use as a key. That is exactly the kind of rule §04 gave us comparison functions for. And we have just seen what we risk if such a rule quietly breaks its contract.

#### Checkpoint 2

**Q3.** Under the tolerance-1 comparator, CPython returned `[3.0, 2.4, 1.8, 1.2, 0.6]` unchanged. Which statement explains it?

- **(a)** Every neighbour pair differs by less than 1, so each is a "tie"; ties are not transitive here, so the arrangement passes every check the sort makes while 0.6 and 3.0 are out of order.
- **(b)** Python's sort has a bug with floats.
- **(c)** The comparator is not transitive.
- **(d)** The list was already sorted under the comparator.

<details>
<summary>Hint 1</summary>

Which pairs did the sort actually compare? Work out what the comparator says about each neighbour pair, and then what it says about 3.0 and 0.6.

</details>

<details>
<summary>Hint 2</summary>

Every neighbour pair is less than 1 apart, so each is a tie: 3.0 ∼ 2.4 ∼ 1.8 ∼ 1.2 ∼ 0.6. If ties carried over, 3.0 and 0.6 would tie too. Do they? Which axiom does that test?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Each neighbour pair is less than 1 apart, so the comparator calls it a tie. The sort only compared those four neighbour pairs, so it saw nothing to fix. But ties don’t carry over here: 3.0 and 0.6 are 2.4 apart, so 0.6 ≺ 3.0, and 0.6 comes last. It’s the same trap as lesson 1’s “noticeably smaller” rule: the neighbour test can only be trusted when ties carry over.
- **(b)** ✗. It’s tempting to blame the sort, but Python sorts floats perfectly well when the comparison keeps its promise. Here the comparator broke the sort’s precondition: its ties don’t carry over. So the answers about neighbours told the sort nothing reliable about pairs it never asked about, such as 3.0 and 0.6.
- **(c)** ✗. Careful: the “before” part of this comparator *is* transitive. If a comes before b, then b − a ≥ 1; if b comes before c, then c − b ≥ 1; adding, c − a ≥ 2, so a comes before c. What fails is transitivity of *ties*: 3.0 ∼ 2.4 and 2.4 ∼ 1.8, yet 1.8 ≺ 3.0.
- **(d)** ✗. It isn’t sorted. The comparator says 0.6 ≺ 3.0, because they are 2.4 apart, and in this list 0.6 comes after 3.0. The list only *looks* sorted to a check that compares neighbours.

</details>

<details>
<summary>Worked solution</summary>

Let’s look at what the sort was told. The tolerance comparator calls two floats a tie when they are less than 1 apart, and otherwise puts the smaller one first. In `[3.0, 2.4, 1.8, 1.2, 0.6]` each neighbour pair is 0.6 apart, so every neighbour pair is a tie. If we log CPython’s calls, we find exactly four comparisons, one for each neighbour pair. The sort finds no pair out of order, and concludes that the list is already in order.

But is it? 3.0 and 0.6 are 2.4 apart, so the comparator says 0.6 ≺ 3.0, and 0.6 is at the end. The list is not sorted; it only passes the neighbour test. That can happen because ties don’t carry over: 3.0 ∼ 2.4 ∼ 1.8 ∼ 1.2 ∼ 0.6, yet 0.6 ≺ 3.0. The sort never asked about 3.0 and 0.6, the one pair that would have given it away.

So the explanation is that ties are not transitive here: they don’t carry over. The other options misplace the blame. The comparator’s “before” relation *is* transitive (two gaps of at least 1 add up to at least 2), so “not transitive” names the wrong axiom. Python’s sort has no bug: its precondition was violated. And “already sorted” confuses passing the neighbour test with being sorted.

</details>

**Q4.** This prints `[3, 1, 2]`. Click the line that causes it.

```python
 1  from functools import cmp_to_key
 2  
 3  def by_value(a, b):
 4      return a < b
 5  
 6  print(sorted([3, 1, 2], key=cmp_to_key(by_value)))
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

The sort only ever asks “is this item before that one?”. When the comparison goes through `cmp_to_key`, how is that question answered from `by_value`’s return value?

</details>

<details>
<summary>Hint 2</summary>

`cmp_to_key` answers “is a before b?” with `by_value(a, b) < 0`. Can `a < b` ever be negative?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 4** ✓ Yes, line 4. `a < b` returns a bool, `True` or `False`, which count as 1 and 0. Neither is negative. But a comparator says “a comes first” with a *negative* number. `cmp_to_key` answers every “is a before b?” by testing `by_value(a, b) < 0`, and that test is therefore always `False`. To the sort, every number ties with every other. So it finds nothing to fix, and, being stable, it returns the input order. A fix: `return -1 if a < b else (1 if b < a else 0)`, or skip the comparator and use `key=`.
- *If you picked line 1:* The import is fine: `cmp_to_key` lives in `functools`, and the program gets past this line without complaint. The trouble is in what the comparator hands back.
- *If you picked line 3:* The signature is right: a comparator takes the two items being compared, in that order. Look at what the body returns, and at what `cmp_to_key` does with it.
- *If you picked line 6:* The call is fine: `cmp_to_key` wraps a valid comparator correctly, and passing the result as `key=` is exactly how it’s meant to be used. The problem is in what `by_value` returns. What values can it give back?
- *Any other line:* A blank line can’t cause anything. What values can `by_value` return, and which of them would mean “a comes first”?

</details>

<details>
<summary>Worked solution</summary>

Let’s trace the call on line 6. `sorted` wraps each number with `cmp_to_key`, and from then on the only question it asks is “is this wrapped item less than that one?”. Each time, the wrapper runs `by_value(a, b) < 0`.

Logging the calls shows that CPython asks exactly two questions. First: is 1 before 3? That runs line 4 with a = 1 and b = 3, which returns `1 < 3`, that is `True`. The wrapper then checks `True < 0`. `True` counts as 1, so the answer is `False`: “1 is not before 3”. Second: is 2 before 1? Line 4 returns `2 < 1`, that is `False`, which counts as 0, and `0 < 0` is `False` again.

So the sort has checked both neighbour pairs and found neither out of order. As far as it can tell the list is already sorted, so it returns `[3, 1, 2]`. In fact no question could ever get a “yes”. A bool is never negative, so the test the sort sees, $\texttt{cmp}(a,b) < 0$, is false for every pair: “is 1 before 3?” gets no, and so does “is 3 before 1?”. Every number ties with every other, everything is one tier, and a stable sort keeps a single tier in input order.

So the fault is on line 4: it gives a yes/no answer where a three-way answer is expected. Return a negative number, a positive number or 0, or better, use `key=`. Lines 1, 3 and 6 are all correct; with a valid comparator, the same call would sort the list.

</details>

---

## 06 · A comparison whose transitivity is not obvious

So let’s take the pairwise rule we set aside in §04 and find out whether it can be trusted. The problem: given some non-negative integers, arrange them so that writing them one after another forms the largest possible number. For `[3, 30, 34, 5, 9]` the answer is `9534330`. Keys are safe by Theorem 1, so it’s worth asking first whether some obvious key already does the job. If one does, we don’t need a rule about pairs at all.

> **PREDICT FIRST.** Commit to an answer before opening the reveal.

Does sorting the numbers as strings in descending order give the answer?

- **(a)** Yes.
- **(b)** No.

<details>
<summary>Your prediction, compared</summary>

- **(a)** ✗. It’s a tempting idea: string order compares leading digits first, and big leading digits should go first. But watch what it does with 3 and 30, just below.
- **(b)** ✓ correct. Right, it doesn’t. The explanation below shows exactly which pair it gets wrong.

</details>

<details>
<summary><b>Reveal</b></summary>

Descending string order gives 9, 5, 34, 30, 3, that is `9534303`, smaller than `9534330`. The culprit is 3 versus 30. As strings, `"30" > "3"`, because a longer string that starts the same way counts as larger. So string order puts 30 first, which gives 303. But putting 3 first gives 330, and $330 > 303$: 3 should come first.

</details>

So the order of the strings themselves is the wrong key. What’s the right comparison? The one the problem itself asks about: put $a$ before $b$ when writing $a$ and then $b$ gives the bigger number. Let’s write $ab$ for the number formed by $a$ followed by $b$. Then:

$$
a \prec b \iff ab > ba
$$

For example, $3 \prec 30$, because $330 > 303$. Set the two comparisons side by side on 3 and 30. String order compares "3" with "30" as they stand, and puts 30 first. The concatenation rule compares the two numbers you would actually write, 330 and 303, and puts 3 first. So string order looks at the two numbers’ digits, and the rule looks at what you get by gluing them together.

In code the rule is `a + b > b + a` on the decimal strings. Comparing strings is fine here, because the two strings `a + b` and `b + a` have the same length. And two digit strings of the same length compare as strings exactly as they compare as numbers. Both comparisons look for the first position where the digits differ, and there the larger digit wins. For numbers that is right because a larger digit in an earlier place outweighs everything that follows it. For instance, "330" and "303" first differ in the second place, where 3 beats 0, and indeed $330 > 303$.

Before we sort by this rule, we want to know it honours the contract from §04. Otherwise, as §05 showed, Python could hand us garbage without a word. The checker in Fig. 1 found nothing wrong with it on the sample 3, 30, 34, 5, 9. But a pass on a sample is evidence, not proof, and we want to use the rule on every list of numbers. So let’s try to prove the axioms. Is it irreflexive? Is 3 before 3? That would need 33 > 33, which is false. The same goes for every number: $aa > aa$ is false. Is it transitive? On examples it seems to be. 534 > 345 puts 5 before 34, and 343 > 334 puts 34 before 3; and sure enough, 53 > 35 puts 5 before 3. But why should that always happen? Suppose $ab > ba$ and $bc > cb$. Does $ac > ca$ follow? Try to see it directly and you’ll get stuck. With ages, a chain like Dee before Ben before Ana was easy: the ages 22, 25, 30 grow along it. Here each comparison builds its own numbers. 5 and 34 gave 534 and 345; 34 and 3 gave 343 and 334; and the conclusion is about 53 and 35, numbers that appeared in neither comparison. So there’s no obvious quantity that grows along the chain.

Here is where Theorem 1(b) earns its keep. It says that if the rule is a strict weak ordering, then some key produces it. So if the rule is safe, a hidden key exists, and looking for one isn’t hopeless. And if we do find that key, Theorem 1(a) proves the rule safe immediately, without checking any cases at all. So let’s go looking for a number attached to each $a$ on its own, one number for 5, one for 34, one for 3, that gets bigger exactly when $a$ should come earlier. Since 5 goes before 34, 5’s number has to be the bigger one.

> **Theorem 3 (the hidden key)**
>
> Let $|a|$ be the number of decimal digits of $a$ and $f(a) = \dfrac{a}{10^{|a|} - 1}$. Then $ab > ba \iff f(a) > f(b)$. Hence $\prec$ is induced by a key (sort by $f$, largest first) and is a strict weak ordering.

> **Proof**
>
> As numbers, $ab = a \cdot 10^{|b|} + b$ and $ba = b \cdot 10^{|a|} + a$. So
>
>
>
> $$
> ab > ba \iff a\,10^{|b|} + b > b\,10^{|a|} + a \iff a\,(10^{|b|} - 1) > b\,(10^{|a|} - 1).
> $$
>
>
>
> Both $10^{|a|} - 1$ and $10^{|b|} - 1$ are positive, so dividing by their product keeps the direction: $ab > ba \iff f(a) > f(b)$. Ordering by $f$ in decreasing order is ordering by the key $-f(a)$, so Theorem 1(a) applies. ∎

What is this mysterious $f$? Read it as a decimal: $f(a)$ is the value of $0.aaa\ldots$, the digits of $a$ repeated forever. $f(3) = 0.333\ldots = 1/3$, $f(30) = 0.3030\ldots = 30/99$, and $f(34) = 0.3434\ldots = 34/99$. So the question “which concatenation is bigger?” is secretly the question “which infinite repetition is bigger?”.

Let’s check it on our example: $f(9) = 1$, $f(5) = 0.555\ldots$, $f(34) = 0.3434\ldots$, $f(3) = 0.333\ldots$, $f(30) = 0.3030\ldots$. Largest first, that is the order 9, 5, 34, 3, 30, and it spells `9534330`. Ties really happen, too: $f(12) = 12/99 = 4/33 = 1212/9999 = f(1212)$. And indeed, writing a bar where one number ends and the next begins, $12|1212 = 121212 = 1212|12$.

Knowing the rule is safe tells us that sorting by it is meaningful. Python will return 9, 5, 34, 3, 30, and in that row every pair is the right way round under the rule. But it doesn’t yet tell us that the sorted arrangement forms the *largest* number. Five numbers can be arranged in 120 ways, and we haven’t shown that 9534330 beats all the others. That’s a different claim, and it needs its own argument.

> **Theorem 4 (sorting gives the maximum)**
>
> Every arrangement sorted by $\prec$ forms the largest possible number.

> **Proof**
>
> Take an arrangement that is **not** sorted. Since $\prec$ is a strict weak ordering, lesson 1, Lemma 11 gives a neighbour pair out of order: $b$ immediately followed by $a$ with $a \prec b$, that is $ab > ba$. Swap them. The digits before and after the pair do not move, and the block $ba$ in the middle becomes $ab$: the same length, and larger. So the whole number grows: a non-sorted arrangement is never the largest.
>
> Among the finitely many arrangements one is the largest; by what we just showed it is sorted. Finally, all sorted arrangements give the same number. They differ only in the order inside tiers (lesson 1, Theorem 10). Elements of a tier sit next to each other, and for two elements $a, b$ of the same tier $ab = ba$. So swapping neighbours inside a tier never changes the digits. And any order of a tier can be reached from any other by such swaps: bring the element that should come first to the front of the block one neighbour swap at a time, then the next one, and so on. So every sorted arrangement gives the maximum. ∎

Here is the first half of the proof on our numbers. Take the arrangement 9, 5, 3, 34, 30, which is not sorted: 34 should come before 3, because 343 > 334. It spells 9533430. 3 and 34 are neighbours, so swap them. The 95 in front and the 30 at the end stay where they are, and the block 334 in the middle becomes 343. The result, 9, 5, 34, 3, 30, spells 9534330, which is bigger. Every unsorted arrangement can be improved like this, so the largest one has to be sorted.

This style of proof is called an **exchange argument**, because it works by exchanging two neighbours. You show that any solution that breaks the rule can be made strictly better by swapping two neighbours, so the best solution can’t break the rule. An exchange argument is the standard way to prove that a strategy of the form “sort by the right key, then take the items in order” is optimal. Such strategies are called *greedy*, because they take whatever looks best at each step without looking ahead. Exchange arguments come back in lesson 21.

**Listing 4.** *Largest number by concatenation. Precondition: at least one number, all non-negative.*

```python
from functools import cmp_to_key

def largest_number(nums):
    strs = [str(x) for x in nums]

    def cmp(a, b):
        # a goes first iff a+b > b+a. A strict weak ordering: the key is a / (10**len(a) - 1).
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(cmp))
    result = "".join(strs)
    return "0" if result[0] == "0" else result   # all zeros: "00" must become "0"

print(largest_number([3, 30, 34, 5, 9]))   # 9534330
print(largest_number([0, 0]))              # 0
```

Theorem 3 also hands us a key directly, so we don’t even need `cmp_to_key`: `sorted(strs, key=lambda s: Fraction(int(s), 10 ** len(s) - 1), reverse=True)`, with `from fractions import Fraction`. On `[3, 30, 34, 5, 9]` it puts the strings in the same order, 9, 5, 34, 3, 30. Use `Fraction`, which stores a fraction exactly, rather than floats. A float keeps only about 16 significant digits, so for long numbers two different keys can round to the same float.

---

## 07 · In Python: summary of the contract

We set out to find what the code behind `<` has to promise. Here is the answer, put in terms of everyday Python.

- `sorted` and `list.sort` ask only `<`. The result is meaningful when that `<` is a strict weak ordering; otherwise you get some rearrangement, with no error.
- A `key=` function always yields a strict weak ordering, provided the key values are totally ordered: plain numbers without NaN, strings, and tuples of such values.
- Tuples break ties lexicographically. Later components are compared only on ties, and then they must support `<`.
- `cmp_to_key(cmp)` is the tool for pairwise rules. The contract: $\texttt{cmp}(a,b) < 0$ must be a strict weak ordering, with consistent signs. Check a comparator on a sample with `check_strict_weak` (Listing 2) when in doubt.
- To prove a pairwise rule is well behaved, look for a key (Theorem 1(b)). To prove sorting by it is optimal for some goal, use an exchange argument.

---

## Exercises

**E1.** What does `largest_number([12, 121])` return? Type the digits.

*Your answer:* ______

<details>
<summary>Hint 1</summary>

How many ways are there to arrange two numbers? For each one, what number do you get by writing them side by side?

</details>

<details>
<summary>Hint 2</summary>

Compare 12|121 with 121|12. They have the same number of digits, so find the first digit where they differ.

</details>

<details>
<summary>Answer and feedback</summary>

- **12121** ✓ Yes, 12121. With two numbers there are only two arrangements: 12 then 121 gives 12121, and 121 then 12 gives 12112. The first is bigger, so 12 goes first. The hidden key agrees: $f(12) = 12/99 = 0.1212\ldots$ is bigger than $f(121) = 121/999 = 0.121121\ldots$.
- *If you answered 12112:* That puts 121 first, probably because 121 is the bigger number, or because `"121" > "12"` as strings. But the rule compares the two concatenations, not the numbers or their strings: 12|121 = 12121 is bigger than 121|12 = 12112, so 12 goes first.
- *Any other answer:* With only two numbers there are just two arrangements. Write out both concatenations, 12 followed by 121 and 121 followed by 12, and keep the bigger one.

</details>

<details>
<summary>Worked solution</summary>

With two numbers there are only two candidates, so we can simply try both. Writing 12 and then 121 gives 12121; writing 121 and then 12 gives 12112. Both have five digits, so compare them digit by digit: the first three digits agree (1, 2, 1), and at the fourth, 2 beats 1. So 12121 is bigger, and that is what `largest_number([12, 121])` returns.

This is exactly the rule of §06: $a \prec b$ when $ab > ba$. Here 12|121 > 121|12, so 12 ≺ 121 and 12 goes first. Theorem 3’s key says the same thing. $f(12) = 12/99 = 0.121212\ldots$ and $f(121) = 121/999 = 0.121121\ldots$ agree up to 0.121, and then 2 beats 1. So 12 has the bigger key and comes first.

The tempting answer, 12112, puts 121 first. That happens if you go by size, since 121 is the larger number. It also happens if you go by string order, since `"121" > "12"` (a longer string that starts the same way is larger). But the rule doesn’t look at the size of the numbers or at their string order. It compares the two concatenations, and 3 and 30 in §06 showed that size and string order can both mislead.

</details>

**E2.** This raises `TypeError`. Click the line responsible.

```python
 1  tasks = [(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})]
 2  tasks.sort()
 3  for priority, task in tasks:
 4      print(priority, task["id"])
```

*Which line is wrong?*

<details>
<summary>Hint 1</summary>

Which line makes Python compare one tuple with another? And when two tuples are compared, what happens if their first components are equal?

</details>

<details>
<summary>Hint 2</summary>

Two tasks have priority 2. To order those two tuples, Python must compare their second components. Can two dicts be compared with `<`?

</details>

<details>
<summary>Answer and feedback</summary>

- **Line 2** ✓ Yes, line 2. Sorting tuples compares them lexicographically, and two of these tuples share priority 2. When the first components are equal, Python moves on to the second. So it has to ask whether one dict is less than the other, and dicts don’t support `<`: `TypeError: '<' not supported between instances of 'dict' and 'dict'`. Fix: compare priorities only, `tasks.sort(key=lambda t: t[0])`, or add a unique tie-breaker such as an index, `(priority, index, task)`, so the dicts are never reached.
- *If you picked line 1:* Storing `(priority, record)` pairs is a common and perfectly good pattern, and building this list raises nothing. The trouble starts when the pairs are compared. Which line compares them?
- *If you picked line 3:* Unpacking each pair into `priority, task` is fine, and the program never even gets here: the error is raised before the loop starts. Which line compares the tuples?
- *If you picked line 4:* `task["id"]` is valid for these dicts, and the loop never runs: the error happens earlier. Which line compares the tuples?
- *Any other line:* Which line compares tuples, and what happens when their first components are equal?

</details>

<details>
<summary>Worked solution</summary>

Line 1 only builds a list; nothing is compared yet. Line 2 sorts it with no key, so the tuples themselves are compared, and tuples compare lexicographically: Python finds the first position where they differ and compares there.

Logging the comparisons shows what CPython asks, in order. First, is `(1, {"id": 2})` less than `(2, {"id": 1})`? The priorities 1 and 2 differ, so they decide: yes. Second, is `(2, {"id": 7})` less than `(1, {"id": 2})`? Again the priorities decide: no. Third, is `(2, {"id": 7})` less than `(2, {"id": 1})`? Now both priorities are 2, so Python moves on to the second position, finds two different dicts there, and asks whether `{"id": 7} < {"id": 1}`. Dicts have no `<`, so it raises `TypeError: '<' not supported between instances of 'dict' and 'dict'`. Lines 3 and 4 never run.

So the bug is on line 2, and it only shows up when two priorities are equal. With all-different priorities the dicts are never reached, which is why a bug like this can hide for a long time. The cure is to make sure the comparison never reaches the dicts. `tasks.sort(key=lambda t: t[0])` compares priorities only. Stability keeps equal priorities in input order, giving `[(1, {'id': 2}), (2, {'id': 1}), (2, {'id': 7})]`. Or insert a unique tie-breaker, `(priority, index, task)`, so that two tuples always differ before the dicts.

</details>

**E3.** `sorted([{1, 2}, {3}, {1}])` returns `[{1, 2}, {3}, {1}]` unchanged. Which axiom does `<` on sets break, and where?

- **(a)** Ties are not transitive: {1} ties {3} and {3} ties {1, 2}, yet {1} < {1, 2}.
- **(b)** `<` on sets is not transitive.
- **(c)** `<` on sets is not irreflexive.
- **(d)** Nothing is wrong; the output is sorted.

<details>
<summary>Hint 1</summary>

For each pair of these three sets, ask: is one a proper subset of the other, or do they tie, with neither containing the other?

</details>

<details>
<summary>Hint 2</summary>

{1} and {3} tie, and {3} and {1, 2} tie. If ties carried over, {1} and {1, 2} would tie too. Do they?

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. For sets, `<` means “is a proper subset of”. {1} and {3} share nothing, so neither is a subset of the other: they tie. {3} and {1, 2} tie for the same reason. But {1} ⊂ {1, 2}. So subset order is a strict partial order whose ties don’t carry over, not a strict weak ordering. Finding one valid order of a partial order like this is a lesson 35 problem, and `sorted` doesn’t solve it.
- **(b)** ✗. Proper subset *is* transitive. If $A \subsetneq B$ and $B \subsetneq C$, then every element of $A$ is in $C$. And $B$ has an element that $A$ lacks, which is in $C$ too, so $A \subsetneq C$. The failing axiom is the one about ties: look at pairs where neither set contains the other.
- **(c)** ✗. Irreflexivity holds: no set is a proper subset of itself, so `s < s` is always `False`. Look instead at pairs of sets where neither contains the other.
- **(d)** ✗. It isn’t sorted: {1} ⊂ {1, 2}, so {1} must come before {1, 2}, and here it comes last. The list only passed the checks the sort made, which compared neighbours.

</details>

<details>
<summary>Worked solution</summary>

First, what does `<` mean for sets? It asks “is the left set a proper subset of the right one?”. So let’s classify the three pairs. {1} and {3}: neither contains the other, so they tie. {3} and {1, 2}: again neither contains the other, a tie. {1} and {1, 2}: {1} is a proper subset, so {1} must come first.

Now look at what the sort checked. Logging shows that CPython asked just two questions, both about neighbours: is {3} < {1, 2}? No. Is {1} < {3}? No. Neither neighbour pair is out of order, so the sort concluded that the list was already in order and returned it unchanged. It never compared {1} with {1, 2}, the pair that is out of order.

Which axiom let that happen? Irreflexivity holds (no set is a proper subset of itself), and so does transitivity of ⊊ (if $A \subsetneq B \subsetneq C$, then $A \subsetneq C$). What fails is transitivity of ties: {1} ∼ {3} and {3} ∼ {1, 2}, yet {1} ⊊ {1, 2}. That is exactly the triple the checker in Fig. 1 reports for its sample of sets. And since {1} ends up after {1, 2}, the output is not sorted, so “nothing is wrong” fails too.

</details>

**E4.** Arrange the steps proving that the concatenation rule is a strict weak ordering, and exclude the false steps.

*Steps (shuffled; some are false):*

- **A.** $ab > ba$ iff $a > b$ as strings.
- **B.** So the rule is induced by a key, and every key-induced relation is a strict weak ordering (Theorem 1).
- **C.** As numbers, $ab = a \cdot 10^{|b|} + b$ and $ba = b \cdot 10^{|a|} + a$.
- **D.** So $ab > ba$ iff $a(10^{|b|} - 1) > b(10^{|a|} - 1)$.
- **E.** Dividing by the positive number $(10^{|a|}-1)(10^{|b|}-1)$: iff $f(a) > f(b)$ with $f(a) = a/(10^{|a|}-1)$.
- **F.** $ab > ba$ iff $a > b$ as numbers.

<details>
<summary>Hint 1</summary>

Where must the proof end up? Theorem 1 needs a key: a number computed from $a$ alone. Which step first turns $ab$ and $ba$ into something you can do algebra with?

</details>

<details>
<summary>Hint 2</summary>

Go from the concatenations to arithmetic, then rearrange the inequality, then divide so that each side involves only one of the two numbers. To spot the false steps, test each candidate on 3 and 30.

</details>

<details>
<summary>Answer and feedback</summary>

**Order:** C → D → E → B
- **F** is false: it sounds natural that the bigger number should go first, but try 3 and 30: 3 &lt; 30, yet 330 &gt; 303, so 3 must come first. The size of the numbers alone doesn’t decide which concatenation is bigger. Exclude this step.
- **A** is false: this is the obvious string key from the predict-first question, and it fails on the same pair: '30' &gt; '3' as strings, yet 303 &lt; 330, so 3 must come first. Exclude this step.

That’s the proof. Writing the concatenations as arithmetic turns a question about digit strings into one about numbers. Rearranging collects each number with its own factor. Dividing by a positive number then leaves something that depends on $a$ alone on one side and on $b$ alone on the other, and that is a key. Theorem 1 does the rest. The two excluded steps are the tempting shortcuts, and the pair 3 and 30 refutes both.

</details>

<details>
<summary>Worked solution</summary>

Let’s start from where the proof has to end up. Theorem 1 says that any order borrowed from a key is a strict weak ordering. So we want to show that “$ab > ba$” is the same as comparing a number worked out from $a$ alone with the same kind of number worked out from $b$ alone. Once we have that, we’re done. Every step should move us toward that.

The first step, “As numbers, …”, turns the concatenations into arithmetic. Writing $a$ and then $b$ shifts $a$ left by as many places as $b$ has digits, so $ab = a \cdot 10^{|b|} + b$, and likewise $ba = b \cdot 10^{|a|} + a$. For example, $3|30 = 3 \cdot 100 + 30 = 330$.

The second step subtracts $a + b$ from both sides of $ab > ba$, which leaves $a(10^{|b|} - 1) > b(10^{|a|} - 1)$. Each side still mixes the two numbers: $a$ is multiplied by something that depends on $b$.

The third step, “Dividing by the positive number …”, separates them. Divide both sides by $(10^{|a|}-1)(10^{|b|}-1)$, which is positive, so the inequality keeps its direction. The left side becomes $a/(10^{|a|}-1) = f(a)$ and the right side $b/(10^{|b|}-1) = f(b)$. Now each side depends on one number only: $f$ is a key.

The last step cashes it in. $a \prec b$ exactly when $f(a) > f(b)$, so the rule is an order borrowed from the key $f$ (largest first). By Theorem 1 it is a strict weak ordering.

The other two steps are the shortcuts people reach for, and one pair refutes both. As numbers, 3 < 30, so “bigger number first” would put 30 first and give 303, but 330 is bigger. As strings, `'30' > '3'`, so string order also puts 30 first, with the same wrong result.

</details>

**E5.** Theorem 4's proof needed a neighbour pair out of order in every non-sorted arrangement. Which earlier result supplied it, and why does it apply?

- **(a)** Lesson 1, Lemma 11, because the rule is a strict weak ordering (Theorem 3).
- **(b)** Lesson 1, Lemma 8, because the rule is a strict total order.
- **(c)** Theorem 2, because concatenation is lexicographic.
- **(d)** No earlier result is needed: any unsorted list has an out-of-order neighbour pair.

<details>
<summary>Hint 1</summary>

The proof needs “if an arrangement is not sorted, then some *neighbour* pair is out of order”. Which lesson 1 result says that, and what kind of rule does it require?

</details>

<details>
<summary>Hint 2</summary>

Lesson 1 proved the neighbour test twice: once for strict total orders and once for rules with ties. Does the concatenation rule have ties? Try 12 and 1212.

</details>

<details>
<summary>Answer and feedback</summary>

- **(a)** ✓ correct. Yes. Lemma 11 says that, for a strict weak ordering, an arrangement with no neighbour pair out of order is sorted. So an unsorted arrangement always has a neighbour pair out of order. Theorem 3 is what makes the lemma applicable, because it proved that the concatenation rule is a strict weak ordering. Without it, an unsorted arrangement might have no out-of-order neighbours at all (like the tasks of lesson 1), and swapping neighbours would get us nowhere.
- **(b)** ✗. Lemma 8 would do the job if the rule were a strict total order, but it isn’t: 12 and 1212 tie, since writing them in either order gives 121212. With ties around, you need the version of the neighbour test that allows them, which is Lemma 11.
- **(c)** ✗. Theorem 2 is about pairs compared coordinate by coordinate, as in tuple keys. The concatenation rule isn’t built that way: each comparison glues the two numbers together in both orders, so there are no fixed coordinates to compare. And Theorem 2 says nothing about neighbours anyway.
- **(d)** ✗. That is exactly the step that needs proof, and for general partial orders it’s false. In lesson 1, the tasks arranged as d, a, b, c are not sorted (b must come before d), yet no neighbour pair is out of order. The guarantee needs ties to carry over, which is what a strict weak ordering provides.

</details>

<details>
<summary>Worked solution</summary>

Let’s pin down the step in question. Theorem 4’s proof starts from an arrangement that is not sorted and improves it by swapping two *neighbours*. That only works if some neighbour pair is out of order. So the proof needs this fact: under the concatenation rule, every unsorted arrangement has a neighbour pair out of order.

That is lesson 1’s neighbour test read backwards: if no neighbour pair were out of order, the arrangement would be sorted. Lesson 1 proved the neighbour test twice, as Lemma 8 for strict total orders and as Lemma 11 for strict weak orderings, which allow ties. Which one applies? The concatenation rule has ties (12 and 1212 give 121212 in either order), so it is not a strict total order, and Lemma 8 is out. But Theorem 3 proved it is a strict weak ordering, so Lemma 11 applies.

Why can’t we skip the lemma? Because the fact is false for rules that aren’t strict weak orderings. Lesson 1’s tasks, arranged as d, a, b, c, are unsorted, yet no neighbour pair is out of order. And Theorem 2, about lexicographic order on pairs, has nothing to say about neighbours, so it can’t supply this step.

</details>

---

## Ledger

**Established**

- Python's sort asks only `<`; the result is meaningful when `<` is a strict weak ordering (documented guarantee + lesson 1). §01
- The relations induced by keys are exactly the strict weak orderings; tiers are the sets of equal keys. `[proof]` §02
- Lexicographic order of strict total orders is a strict total order, so tuple keys are safe. `[proof]` §03
- A comparator for `cmp_to_key` must make $\texttt{cmp}(a,b) < 0$ a strict weak ordering (the contract). §04
- When the contract is broken (tolerance, NaN, cycles, subset order), CPython 3.12 raises no error and returns some rearrangement that depends on the starting order. `[empirical]` §05
- The concatenation rule is induced by the key $a/(10^{|a|}-1)$ `[proof]`; sorting by it gives the largest number `[proof]` (exchange argument). §06

**Assumptions in force**

- From now on every comparison is assumed to be a strict weak ordering (the precondition of every sort).

**Lenses in use**

- None yet.

**Reasoning tools acquired**

- Proving a pairwise rule is well behaved by finding a hidden key.
- Checking a comparator on a finite sample; a counterexample triple refutes it.
- Exchange arguments: any solution breaking the rule can be strictly improved by swapping two neighbours.

**Open gaps**

*(Your open gaps are listed here in the interactive version.)*

> **Open question**
>
> We now have a comparison we can trust. Watching Python’s sort at work also raised two things we haven’t pinned down. First, even with a broken comparison, every output was a rearrangement of the input: nothing was lost or duplicated. In lesson 1 that went without saying, because we only ever chose among arrangements of the given items. But a program could return any list at all. So is “a rearrangement of the input” part of the task? Second, on `[3.0, nan, 1.0, 2.0]` the sort asked just three questions, one per neighbour pair, and decided the list was in order. Asking about every pair would have taken six. How few questions can a sort get away with, and what is it allowed to do besides asking them? So: what exactly is the task of sorting, what may an algorithm do to carry it out, and how do we measure what that costs?

---

**Next:** [Lesson 3: What exactly is the sorting problem, and what may an algorithm do?](lesson3.md)
