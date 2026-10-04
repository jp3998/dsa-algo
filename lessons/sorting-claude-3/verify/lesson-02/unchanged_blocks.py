"""Blocks that manuscript v3 marks "unchanged" must be byte-identical to the committed page
(git HEAD): definitions, theorems, proofs, notes, the common question, display equations,
listings, figures and tables, the comparator checker, the concat reveal, the dependency list,
the §07 bullets, the ledger, the bridge, header and footer. For every exercise, the id, type,
answer key, prompt, option texts and order steps must also be unchanged (only feedback, hints
and solutions may change). Ids must be unique and appear in the same order."""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from htmltree import parse, outer, inner

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_PATH = "lessons/sorting-claude-3/lesson-02.html"
REF = os.environ.get("REF", "HEAD")

new_src = open(os.path.join(HERE, "..", "..", "lesson-02.html"), encoding="utf8").read()
old_src = subprocess.run(["git", "show", f"{REF}:{REPO_PATH}"], cwd=HERE, capture_output=True,
                         text=True, check=True).stdout


def blocks(src):
    root = parse(src)
    out = []
    for e in root.walk():
        c = e.classes
        if any(k in c for k in ("callout", "note", "deeper", "eq-row", "deps", "ledger", "bridge",
                                "lesson-header", "foot", "listing", "fig")):
            if not any(("callout" in a.classes or "fig" in a.classes or "listing" in a.classes
                        or "ledger" in a.classes) for a in e.ancestors()):
                out.append(("block", e.attrs.get("id") or c[0], outer(src, e)))
        if e.tag == "ul" and e.parent.attrs.get("id") == "s07":
            out.append(("s07-list", "", outer(src, e)))
        if "reveal" in c and e.parent.attrs.get("id") == "pr-concat":
            out.append(("concat-reveal", "", outer(src, e)))
        if "ex" in c:
            key = [e.attrs.get(k) for k in ("id", "data-type", "data-answer", "data-remedy")]
            prompt = [outer(src, x) for x in e.walk() if "ex-prompt" in x.classes]
            opts = [(("data-correct" in li.attrs), inner(src, o)) for li in e.walk()
                    if li.tag == "li" and "ex-options" in li.parent.classes
                    for o in li.children if "opt" in o.classes]
            steps = [(li.attrs.get("data-pos"), inner(src, li)) for li in e.walk()
                     if li.tag == "li" and "ex-steps" in li.parent.classes]
            code = [outer(src, x) for x in e.walk() if x.tag == "pre"]
            out.append(("exercise", e.attrs.get("id"), repr((key, prompt, opts, steps, code))))
    ids = [e.attrs["id"] for e in root.walk() if "id" in e.attrs]
    return out, ids


old, old_ids = blocks(old_src)
new, new_ids = blocks(new_src)
bad = 0
if len(old) != len(new):
    print("block count differs:", len(old), len(new)); bad += 1
# Deliberate later edits (author review, rule 0): new block text must contain one of these markers.
INTENTIONAL = (
    "bring the element that should come first to the front of the block",   # Theorem 4 proof
    "all tie with one another and with nothing outside the group",          # l2-pre-2 correct option
)
for a, b in zip(old, new):
    if a != b:
        if any(m in str(b) for m in INTENTIONAL):
            print("intentional change:", b[0], b[1]); continue
        bad += 1
        print("CHANGED:", a[0], a[1], "->", b[0], b[1])
assert len(set(new_ids)) == len(new_ids), "duplicate ids"
if old_ids != new_ids:
    bad += 1
    print("id sequence changed:", [x for x in old_ids if x not in new_ids], [x for x in new_ids if x not in old_ids])
kinds = {}
for k, _, _ in new:
    kinds[k] = kinds.get(k, 0) + 1
print("compared:", kinds, "| ids:", len(new_ids))
if bad:
    print("UNCHANGED-BLOCKS FAIL:", bad); sys.exit(1)
print("UNCHANGED-BLOCKS OK: identical to", REF)
