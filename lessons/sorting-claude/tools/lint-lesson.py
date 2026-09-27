#!/usr/bin/env python3
"""
lint-lesson.py — mechanical checks from the voice doc and the production spec.

    python3 tools/lint-lesson.py 00-what-order-is.html [more.html ...]
    python3 tools/lint-lesson.py            # every NN-*.html in the folder

Checks that a machine can do. The seam test, the "does the prose actually
build this" test and the read-aloud test still have to be done by a person.
"""

import html
import re
import sys
import pathlib

HERE = pathlib.Path(__file__).resolve().parent.parent

BANNED = [
    "simply", "obviously", "clearly", "of course", "just",
    "it's easy to see", "it is easy to see", "trivially",
    "needless to say", "evidently", "it should be clear", "note that",
]

# Terms that must not appear before the lesson that introduces them.
# Key: term (regex, word-bounded). Value: first lesson number that may use it.
LEDGER_GATE = {
    r"\bO\(": 18, r"\bbig-?o\b": 18, r"\basymptotic": 18,
    r"\btime complexity\b": 18, r"\bcomplexity\b": 18,
    r"\brunning time\b": 18, r"\befficien": 18,
    r"\bin-?place\b": 25, r"\bstabilit(y|ies)\b": 25, r"\bstable sort": 25,
    r"\badaptive\b": 16, r"\brecurrence\b": 21,
    r"\bdivide and conquer\b": 20, r"\bexpected value\b": 29,
    r"\baverage case\b": 19, r"\bamortis|amortiz": 18,
    r"\binversion\b": 15, r"\bloop invariant\b": 10, r"\binvariant\b": 10,
    r"\bpivot\b": 26, r"\bpartition\b": 26, r"\bheap\b": 32,
    r"\bdecision tree\b": 6, r"\bfactorial\b": 4, r"\bpermutation\b": 2,
    r"\btransitiv": 1, r"\btotal order\b": 1,
}

REQUIRED_SECTIONS = [
    ("lesson-head", r'class="lesson-head"'),
    ("where-we-are", r'class="where-we-are"'),
    ("lesson-body", r'class="lesson-body"'),
    ("mental-model", r'class="mental-model"'),
    ("check-yourself", r'class="check-yourself"'),
    ("still-unanswered", r'class="still-unanswered"'),
    ("lesson-nav", r'class="lesson-nav"'),
]


def prose_of(raw: str) -> str:
    """Visible prose only: no tags, no script/style, no code blocks."""
    s = re.sub(r"<(script|style)\b.*?</\1>", " ", raw, flags=re.S | re.I)
    s = re.sub(r"<pre\b.*?</pre>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<code\b.*?</code>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(s)


def lesson_number(path: pathlib.Path):
    m = re.match(r"(\d+)", path.name)
    return int(m.group(1)) if m else None


def check(path: pathlib.Path):
    raw = path.read_text(encoding="utf-8")
    prose = prose_of(raw)
    n = lesson_number(path)
    problems, notes = [], []

    # 1. banned phrases
    for phrase in BANNED:
        for m in re.finditer(r"\b" + re.escape(phrase) + r"\b", prose, re.I):
            ctx = " ".join(prose[max(0, m.start() - 55):m.end() + 55].split())
            problems.append(f'banned phrase "{phrase}" — …{ctx}…')

    # 2. skeleton
    for name, pat in REQUIRED_SECTIONS:
        if not re.search(pat, raw):
            problems.append(f"missing required section: {name}")

    # 3. ledger gate
    if n is not None:
        for pat, first in LEDGER_GATE.items():
            if n < first and re.search(pat, prose, re.I):
                m = re.search(pat, prose, re.I)
                ctx = " ".join(prose[max(0, m.start() - 55):m.end() + 55].split())
                problems.append(
                    f"term matching /{pat}/ used in lesson {n:02d} but not "
                    f"introduced until {first:02d} — …{ctx}…")

    # 4. no network
    for m in re.finditer(r'(?:src|href)="(https?:)?//[^"]+"', raw):
        problems.append(f"external URL breaks the offline rule: {m.group(0)}")

    # 5. sidenotes balanced
    refs = len(re.findall(r'class="sidenote-ref"', raw))
    notes_n = len(re.findall(r'class="sidenote"', raw))
    if refs != notes_n:
        problems.append(f"{refs} sidenote refs but {notes_n} sidenotes")

    # 6. every figure referenced by number from the prose
    for m in re.finditer(r'class="figure-label">Figure ([\d.]+)<', raw):
        num = m.group(1)
        if len(re.findall(r"Figure " + re.escape(num), prose)) < 2:
            problems.append(f"Figure {num} is never referenced by number in the prose")

    # 7. every figure caption says what to look for
    for m in re.finditer(r"<figcaption>(.*?)</figcaption>", raw, re.S):
        cap = " ".join(prose_of(m.group(1)).split())
        if not re.search(r"\b(look|watch|notice|follow|compare|count|read|step through)\b", cap, re.I):
            notes.append(f"caption may be decorative (no what-to-look-for cue): {cap[:80]}…")

    # 8. exercises
    qs = len(re.findall(r'<details class="q"', raw))
    if qs < 3:
        problems.append(f"only {qs} exercises; the voice doc asks for 3–5")
    answers = len(re.findall(r'class="answer"', raw))
    if answers != qs:
        problems.append(f"{qs} questions but {answers} worked answers")

    # 9. straight quotes left in running prose. Math is excluded: a prime in
    #    $m'$ is notation, not a typographic slip.
    outside_math = re.sub(r"\$\$?.*?\$\$?", " ", prose, flags=re.S)
    for ch, name in (('"', "straight double quote"), ("'", "straight apostrophe")):
        if ch in outside_math:
            notes.append(f"{outside_math.count(ch)}× {name} in prose — use curly")

    return problems, notes


def main():
    args = sys.argv[1:]
    paths = ([pathlib.Path(a) for a in args] if args
             else sorted(HERE.glob("[0-9][0-9]-*.html")))
    total = 0
    for p in paths:
        if not p.is_absolute():
            p = HERE / p
        if not p.exists():
            print(f"!! {p} not found")
            total += 1
            continue
        problems, notes = check(p)
        total += len(problems)
        head = "FAIL" if problems else ("warn" if notes else "ok  ")
        print(f"{head}  {p.name}")
        for x in problems:
            print(f"      ✗ {x}")
        for x in notes:
            print(f"      · {x}")
    print(f"\n{total} problem(s).")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
