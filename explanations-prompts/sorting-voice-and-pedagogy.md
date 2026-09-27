# Voice and Pedagogy

**Scope:** every lesson in `lessons/sorting-claude/`. This document outranks habit. When writing a
lesson, if something here conflicts with how a textbook would do it, this document wins.

Companion documents: `sorting-curriculum.md` (what to teach, in what order),
`sorting-production-spec.md` (how to build the page).

---

## 0. The one-sentence goal

> The reader should never once think *"wait, where did that come from?"* — and should never be able to
> put the series down at a lesson boundary without feeling that something is unfinished.

Everything below is a mechanism for producing those two feelings. If a rule below ever gets in the way
of them, the rule is wrong; fix the rule.

---

## 1. Register

Write like a good teacher talking to one person who is smart but has not seen this before.

- **Second person.** "You already know that…", "Notice what just happened."
- **Contractions are fine.** "isn't", "doesn't", "here's". They keep the pace conversational.
- **Short sentences.** When a sentence passes about 25 words, it is usually two ideas wearing one coat.
- **Simple words for hard ideas.** The difficulty should live in the idea, never in the vocabulary
  chosen to express it. "We cannot tell these two apart" beats "these remain indistinguishable under
  the induced equivalence."
- **First person plural for shared work.** "Let's count them." "We now have a problem."
- **Ask real questions.** A question mark in the prose should mark a question the reader is genuinely
  expected to sit with for a moment, not a rhetorical flourish. Then answer it.

Avoid: the lecture-hall voice ("We shall now consider…"), the breathless-blog voice ("🚀 Let's dive
in!"), and the summary voice that states conclusions without earning them.

---

## 2. The order of presentation

Every idea, without exception, arrives in this order:

1. **Felt need.** Something the reader wants is currently out of reach, or something they believed
   turns out to be shaky. No new idea may appear before the reader wants it.
2. **A concrete instance.** Small, specific, with actual numbers or actual elements. Four items, not
   $n$ items.
3. **The claim in plain language.** Say the true thing in ordinary words. The reader should be able to
   repeat it to someone else after reading this sentence alone.
4. **The formal statement.** Now, and only now, the notation. The symbols must feel like shorthand for
   something already understood.
5. **The argument.** Why it is true — including how a person could have found the argument.
6. **The boundary.** What this does **not** say. What still isn't settled. Where it stops applying.

Step 6 is the one most often skipped, and skipping it is how false confidence gets built. A result
whose limits are unstated will be over-applied later.

---

## 3. The naming rule

**Never name a thing before it exists.**

The wrong shape:

> *A total order is a binary relation that is transitive, antisymmetric and total. For example…*

The right shape:

> *Try to line up three things where each beats the next, and the last beats the first. Go ahead —
> what happens when you try to put them in a row? … Nothing works. The property we were leaning on
> without saying so is that "beats" never loops back on itself. That property has a name:
> transitivity.*

The name is a handle for something the reader is already holding. A definition that arrives before the
need is itself a gap, even though it looks like rigor.

Same rule for notation. $n!$ shows up after the reader has counted arrangements of 3 and 4 things by
hand and noticed the pattern — not before.

---

## 4. Transitions carry the argument

Each section must open from the dissatisfaction the previous section produced. The reader should be
able to see *why this is next* before reading what it is.

**Banned openers:** "Now let's discuss…", "Next, we turn to…", "In this section we will…",
"Moving on…", "Another important concept is…". Every one of them signals that the connective tissue
was never written.

**Good openers** name the unresolved thing:

> *We have a definition of sorted that works. But it says nothing about where the output comes from —
> and that turns out to matter more than it sounds like.*

A useful test: delete every heading from a lesson. If the prose still reads as continuous argument,
the transitions are doing their job. If it reads as disconnected blocks, they aren't.

---

## 5. Show the discovery path

For every invariant, every proof, every clever step: explain **how a person could have found it.**

A finished proof presented on its own is a gap disguised as rigor. The reader learns that the result
is true and learns nothing about how to ever produce such a thing themselves — which is the actual
goal of this series.

The shape to use:

> *What do we want at the end? … What's true right now, at the start? … Is there a statement that's
> true in both places? … Let's try the obvious guess and watch it break. … It breaks here, because of
> the duplicates. Patch it: … Now check it again.*

Failed first attempts are content, not embarrassment. Showing a guess that breaks, and why, teaches
more than the polished version that replaced it.

---

## 6. Rigor arrives second, but it does arrive

Intuition first is not permission to be vague. Every informal claim must be followed by the precise
version, and the precise version must be actually precise.

- Quantifiers stated where they matter ("for **every** input", "there **exists** an input").
- Proofs complete, not gestured at. If a step is genuinely routine, say what it would take and why
  it goes through — don't write "it follows easily."
- If something is stated without proof, say so explicitly and say why (out of scope, proved later,
  taken on trust for now with a forward reference).

Being conversational and being rigorous are not in tension. The conversation is *about* something
exact.

---

## 7. Label what kind of claim you are making

Never flatten these for convenience. When the text shifts from one to another, say so:

intuition · claim · proof · empirical observation · heuristic · upper bound · lower bound · tight
bound · worst case · average case · expected case · amortized

Two specific confusions to actively prevent, because nearly every treatment of sorting creates them:

- **$O$ is not "worst case."** Growth-rate notation and which-input-are-we-talking-about are two
  independent axes. You can have an upper bound on the best case and a lower bound on the average case.
- **"Average case" is not "expected time of a randomized algorithm."** One draws randomness from an
  assumed distribution over inputs; the other draws it from the algorithm's own coin flips and holds
  for *every* input. These give guarantees of genuinely different strength.

---

## 8. Analogies

An analogy may **follow** a mechanism as a sanity check. It may never **stand in for** one.

Bad: "Think of merge sort like organizing a deck of cards with a friend." (The reader now has a warm
feeling and no mechanism.)

Acceptable: full derivation of merge, then — "If you have ever merged two sorted piles by repeatedly
taking the smaller top card, you have run this loop by hand."

The mechanism is the explanation. The analogy is at most a confirmation that the mechanism landed.

---

## 9. Banned phrases

Each of these marks a place where a gap was papered over. Grep for them before shipping a lesson;
target is zero.

```
simply          obviously        clearly         of course
just            it's easy to see    as we know     trivially
it should be clear    needless to say    evidently
```

The rule behind the list: if a step really is small, showing it costs one line. If it isn't small, the
word was hiding that fact from both of us.

Related: avoid "note that" as a way of smuggling in an unargued claim. If it's worth noting, it's
worth a sentence saying why it's true.

---

## 10. The concept ledger — the central mechanism

This is what actually enforces "no concept thrown around without being built to," across ~45 lessons
where memory alone will fail.

### The ledger

`sorting-curriculum.md` holds one table: every named concept, term and symbol in the series, mapped to
the **single** lesson that introduces it.

### Per-lesson declarations

Every lesson brief carries:

```
assumes:    [total-order, permutation, comparison-model]
introduces: [decision-tree, leaf-count-bound]
```

### The rule

> A lesson may use a concept only if that concept's introducing lesson number is **strictly lower**
> than its own.

### The procedure — run it twice, every lesson

**Before writing.** Check every entry in `assumes:` resolves to a lower-numbered lesson. If one
doesn't, stop. Either it belongs earlier (move it and amend the ledger), or this lesson must build it
(add to `introduces:`), or it must be cut.

**After writing.** Read the finished prose hunting for technical terms. Every one must be either
(a) in the ledger at a lower number, (b) in this lesson's `introduces:` and actually built here, or
(c) ordinary English. Anything else is a gap — fix it before shipping.

This scan catches the terms that slip in unnoticed while writing: "asymptotic", "amortized", "in
place", "stable", "recurrence", "expected value". These are exactly the words that feel like plain
speech to someone who already knows them, and are opaque to someone who doesn't.

### Forward references

Pointing forward is allowed and often good — it builds the sense of a single long argument. But it
must be explicit and must not be load-bearing:

> *There is a reason this works that we're not equipped to prove yet. It needs a counting argument
> we'll build in Lesson 07. For now, check it on the four-element case and hold the general claim
> loosely.*

What's forbidden is *using* the unbuilt thing as if it were available.

---

## 11. The continuity contract

Lessons are not standalone tutorials. They are consecutive sections of one argument.

Each lesson opens with **"Where we are"** (2–4 sentences: what we established, what it left unresolved,
why this is the next step) and closes with **"What's still unanswered"** (the specific dissatisfaction
that makes the next lesson necessary).

**The test, run on every lesson boundary:** take lesson *N*'s "What's still unanswered", paste lesson
*N+1*'s "Where we are" directly after it, and read the two together with nothing in between. If it
reads as one continuous thought by one person, the seam is good. If it reads as an ending followed by
a beginning, rewrite both halves.

A closing section that summarizes the lesson instead of opening the next question has failed. The
reader should finish every lesson slightly unsatisfied, in a way that points somewhere specific.

---

## 12. Visualizations must argue

Every figure, diagram and animation makes a **specific claim visible**. Its caption states what to
look for.

- Bad caption: *"Figure 4.1 — Bubble sort."*
- Good caption: *"Figure 4.1 — After each pass, the shaded region on the right never changes again.
  Step through and watch it grow by exactly one element per pass."*

If a figure cannot be given a caption of the second kind, it is decoration. Cut it.

The prose must reference the figure by number and must say what the reader should have seen. A figure
the text never points at is a figure nobody looks at carefully.

---

## 13. Exercises

3–5 per lesson, at the end, each collapsible to a **fully worked** answer.

- Test understanding, not recall. "Why would this break if…" beats "What is the complexity of…".
- Prefer questions that a reader who *half*-understands will get wrong. A question everyone passes
  measures nothing.
- The answer explains, it doesn't just state. These answers are part of the teaching, not an answer
  key.
- At least one question per lesson should probe a boundary — a case where the lesson's result stops
  applying.

---

## 14. Code

Python, and only where it earns its place.

- Derive the idea in prose first. Code is a *record* of a decision already made, never the place where
  the idea is introduced.
- Readable over clever. No comprehension golf, no walrus operators, no one-line swaps where two lines
  read better.
- Comments mark *why*, not *what*. `# everything left of i is settled` is useful;
  `# increment i` is noise.
- Where Python hides a real cost (list slicing copies, `sorted()` allocating, `pop(0)` being linear),
  say so explicitly at the point it matters. Silently letting a slice look free will corrupt the cost
  reasoning the whole series is building.
- Every snippet must actually run and produce whatever output the text claims it produces.

---

## 15. Length

No target. A lesson is as long as its one idea needs, and not longer.

If a lesson is running past roughly 25 minutes of reading, that is evidence it holds two ideas. Split
it — the curriculum is explicitly allowed to grow. Lesson count is not a constraint; felt gaps are.

Conversely, a three-paragraph lesson is fine if the idea is genuinely that size. Padding a short
lesson to look substantial adds the exact kind of filler that makes readers skim, and skimming is how
gaps form.

---

## 16. Pre-ship checklist

Run all of it, per lesson:

- [ ] `assumes:` all resolve to strictly lower lesson numbers.
- [ ] Post-write term scan clean — every technical term is in the ledger below this lesson, or built here.
- [ ] Seam test passes against the previous lesson.
- [ ] Closing section opens a question; it does not summarize.
- [ ] Banned-phrase grep returns zero.
- [ ] Every figure has a what-to-look-for caption and is referenced by number from the prose.
- [ ] Every formal statement has a plain-language version before it.
- [ ] Every proof shows how it could have been found.
- [ ] Every result states its boundary.
- [ ] Exercises have complete worked answers; at least one probes a boundary.
- [ ] Every Python snippet runs and matches its stated output.
- [ ] Read it aloud. Anywhere the voice stops sounding like a person talking, rewrite that paragraph.
