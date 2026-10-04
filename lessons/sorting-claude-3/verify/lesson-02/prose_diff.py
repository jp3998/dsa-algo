"""Sentence-by-sentence diff of the page's running prose against manuscript v3.

Page prose = the direct <p> children of #where and of #s01..#s07 (labels excluded) plus the
paragraph of the NaN predict reveal. Manuscript prose = every paragraph of lesson-02-v3.md between
"## Where we are" and the closing "(Exercises, ledger, bridge: unchanged.)", minus headings, rules
and builder notes in parentheses. Both sides are normalised (markup stripped, quotes made straight).
Exit status 1 on any difference."""
import difflib, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from htmltree import parse, inner, text_of

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "..", "lesson-02.html")
MS = os.environ.get("MS", "/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/"
                    "6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad/ms/lesson-02-v3.md")


def page_paragraphs(raw=False):
    src = open(PAGE, encoding="utf8").read()
    root = parse(src)
    out = []
    secs = [e for e in root.walk() if e.tag == "section" and e.attrs.get("id") in
            {"where", "s01", "s02", "s03", "s04", "s05", "s06", "s07"}]
    for sec in secs:
        for e in sec.walk():
            if e.tag != "p" or "label" in e.classes or "callout-label" in e.classes:
                continue
            par = e.parent
            if par is sec or ("reveal" in par.classes and par.parent.attrs.get("id") == "pr-nan"):
                out.append(inner(src, e) if raw else text_of(inner(src, e)))
    return out


def md_to_text(s):
    s = re.sub(r"`([^`]*)`", lambda m: m.group(1).replace("*", "\0"), s)   # protect * inside code
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = s.replace("\0", "*")
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s).strip()


def ms_paragraphs(raw=False):
    lines = open(MS, encoding="utf8").read().split("\n")
    start = next(i for i, l in enumerate(lines) if l.strip() == "## Where we are")
    out = []
    for l in lines[start + 1:]:
        t = l.strip()
        if t.startswith("(Exercises, ledger, bridge"):
            break
        if not t or t.startswith("#") or t == "---" or t.startswith("("):
            continue
        out.append(t if raw else md_to_text(t))
    return out


def spans_page(h):
    """(kind, text) of bold, italic and code spans in an HTML paragraph (code inside em/strong kept)."""
    res = []
    for kind, tag in (("b", "strong"), ("i", "em"), ("c", "code")):
        for m in re.finditer(r"<%s>(.*?)</%s>" % (tag, tag), h):
            res.append((kind, text_of(m.group(1))))
    return sorted(res)


def spans_ms(t):
    res = [("c", m.group(1)) for m in re.finditer(r"`([^`]*)`", t)]
    t2 = re.sub(r"`[^`]*`", lambda m: "`" + m.group(0)[1:-1].replace("*", "") + "`", t)
    for m in re.finditer(r"\*\*([^*]+)\*\*", t2):
        res.append(("b", md_to_text(m.group(1)).replace("`", "")))
    t3 = re.sub(r"\*\*[^*]+\*\*", "", t2)
    for m in re.finditer(r"\*([^*]+)\*", t3):
        res.append(("i", md_to_text(m.group(1)).replace("`", "")))
    return sorted((k, v.replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')) for k, v in res)


def sentences(p):
    return [s for s in re.split(r"(?<=[.?!:;])\s+(?=[A-Z(\\`\"'0-9])", p) if s]


def main():
    pg, ms = page_paragraphs(), ms_paragraphs()
    print(f"page paragraphs: {len(pg)}; manuscript paragraphs: {len(ms)}")
    bad = 0
    sm = difflib.SequenceMatcher(a=ms, b=pg, autojunk=False)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            continue
        bad += 1
        print(f"--- {op}: manuscript {a0}:{a1} vs page {b0}:{b1}")
        for line in difflib.unified_diff(sum((sentences(p) for p in ms[a0:a1]), []),
                                         sum((sentences(p) for p in pg[b0:b1]), []),
                                         "manuscript", "page", lineterm="", n=0):
            print("   ", line)
    for i, (h, t) in enumerate(zip(page_paragraphs(raw=True), ms_paragraphs(raw=True))):
        a, b = spans_ms(t), spans_page(h)
        if a != b:
            bad += 1
            print(f"--- markup differs in paragraph {i}:\n    manuscript {a}\n    page       {b}")
    n_sent = sum(len(sentences(p)) for p in ms)
    if bad:
        print(f"PROSE DIFF: {bad} differing block(s)")
        sys.exit(1)
    print(f"PROSE OK: {len(ms)} paragraphs, {n_sent} sentences identical to v3; bold/italic/code spans match")


if __name__ == "__main__":
    main()
