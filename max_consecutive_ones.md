**Platform:** NeetCode
**Problem:** Max Consecutive Ones
**Problem Link:** https://neetcode.io/problems/max-consecutive-ones/question
**Submission History:** https://neetcode.io/problems/max-consecutive-ones/history

---

## 1. Articulation / Variable Naming

My first issue was not clearly expressing the roles of my variables.

I used:

```python
ones_length
max_ones_length
```

Better names would be:

```python
current_streak
max_streak
```

This makes the intent much clearer:

* `current_streak` → the streak I am currently counting
* `max_streak` → the longest streak I have seen so far

Good variable names should make the **mental model of the algorithm easier to see**.

---

## 2. Mental Model & Mistake

My mental model was:

> Count consecutive `1`s. Whenever I see a `0`, the current streak ends, so compare it with the maximum and reset.

The problem was that I unconsciously assumed that **`0` is the only thing that can end a streak**.

But a streak can end in two ways:

```text
1. We encounter 0
2. We reach the end of the array
```

For example:

```text
[1, 1, 0, 1, 1, 1]
```

The first streak ends because of `0`:

```text
1 1 → 0
```

But the second streak ends because the array ends:

```text
1 1 1 → END
```

I had considered the first case but missed the second.

---

## 3. Coding Mistake — Partial Implementation of the Mental Model

Because my mental model only considered `0` as the end of a streak, my code only updated the maximum when it encountered `0`.

So after processing:

```text
[1, 1, 0, 1, 1, 1]
```

I ended up with:

```text
current_streak = 3
max_streak = 2
```

The final streak was counted correctly, but it was **never compared with `max_streak`** because there was no `0` after it.

So the coding mistake was not a completely wrong implementation.

It was a **partial implementation of an incomplete mental model**.

I handled:

```text
streak → 0 → update max
```

but forgot:

```text
streak → END → update max
```

---

## 4. Lesson

Before coding, clearly define:

> **What does my state represent, and what events can cause that state to end?**

For this problem:

```text
current_streak → current sequence of 1s
max_streak     → longest sequence seen so far
```

And a streak can end because of:

```text
0 OR end of array
```

### Key habit

> **When a loop finishes, always ask: "Could the thing I was tracking still be unfinished at the end?"**
