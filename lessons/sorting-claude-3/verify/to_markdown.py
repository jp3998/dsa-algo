"""Convert a lesson page into a readable Markdown file with the same content.

Usage:  python3 verify/to_markdown.py lesson-01.html markdown/lesson1.md

Everything the reader sees on the page is kept, in page order: prose, callouts, figures,
tables, listings, every exercise (prompt, options, per-answer feedback, hints, worked
solution), predict-first reveals, ledger and bridge. Interactive parts are rendered
statically (answers and feedback inside collapsible <details> blocks). Figures that the
page draws with code are rendered from FIGURES below, keyed by lesson and figure id.
Math is converted to $...$ / $$...$$ (KaTeX syntax, renders in VS Code and GitHub).
"""
import html
import random
import re
import sys
from html.parser import HTMLParser

VOID = {'br', 'img', 'input', 'hr', 'meta', 'link', 'path', 'rect', 'circle', 'line', 'source'}


class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs or {}), parent, []

    @property
    def cls(self):
        return set((self.attrs.get('class') or '').split())

    def find_all(self, pred):
        for k in self.kids:
            if isinstance(k, Node):
                if pred(k):
                    yield k
                yield from k.find_all(pred)

    def find(self, pred):
        return next(self.find_all(pred), None)

    def child(self, pred):
        return next((k for k in self.kids if isinstance(k, Node) and pred(k)), None)

    def children(self, pred=lambda n: True):
        return [k for k in self.kids if isinstance(k, Node) and pred(k)]


class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root')
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.kids.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def has(cls):
    return lambda n: cls in n.cls


def tagis(t):
    return lambda n: n.tag == t


# ---------------------------------------------------------------- inline text
TAG_LABEL = {'t-proof': 'proof', 't-sketch': 'proof sketch', 't-empirical': 'empirical',
             't-heuristic': 'heuristic', 't-intuition': 'intuition', 't-reference': 'reference'}


def math(s):
    s = re.sub(r'\\\[\s*(.*?)\s*\\\]', lambda m: '\n\n$$\n' + m.group(1).strip() + '\n$$\n\n', s, flags=re.S)
    s = re.sub(r'\\\((.*?)\\\)', lambda m: '$' + m.group(1).strip() + '$', s, flags=re.S)
    return s


def inline(node):
    """Inline Markdown for a node's contents."""
    out = []
    for k in node.kids:
        if isinstance(k, str):
            out.append(re.sub(r'\s+', ' ', k))
            continue
        c = k.cls
        if k.tag in ('em', 'i'):
            t = inline(k).strip()
            out.append(f'*{t}*' if t else '')
        elif k.tag in ('strong', 'b'):
            t = inline(k).strip()
            out.append(f'**{t}**' if t else '')
        elif k.tag == 'code':
            t = text_of(k)
            out.append(f'``{t}``' if '`' in t else f'`{t}`')
        elif k.tag == 'a':
            href = k.attrs.get('href', '')
            t = inline(k).strip()
            target = md_href(href)
            out.append(f'[{t}]({target})' if target else t)
        elif k.tag == 'span' and c & set(TAG_LABEL):
            out.append(f' `[{TAG_LABEL[(c & set(TAG_LABEL)).pop()]}]`')
        elif k.tag == 'br':
            out.append('  \n')
        elif k.tag in ('svg', 'script', 'style'):
            continue
        else:
            out.append(inline(k))
    return ''.join(out)


def md_href(h):
    if h.startswith('#'):
        return None          # in-page anchors: the section numbers in the text are enough
    m = re.match(r'lesson-0?(\d+)\.html(#.*)?$', h)
    if m:
        return f'lesson{int(m.group(1))}.md'
    return h


def text_of(node):
    if isinstance(node, str):
        return node
    return ''.join(text_of(k) for k in node.kids if not (isinstance(k, Node) and k.tag in ('script', 'style')))


def clean(s):
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r' *\n *', '\n', s)
    return math(s.strip())


# ---------------------------------------------------------------- blocks
def blocks(node, depth=0):
    """Render the block-level children of node."""
    parts = []
    pending_inline = []

    def flush():
        if pending_inline:
            t = clean(''.join(pending_inline))
            if t:
                parts.append(t)
            pending_inline.clear()

    for k in node.kids:
        if isinstance(k, str):
            if k.strip() or pending_inline:
                pending_inline.append(k)
            continue
        if k.tag in ('em', 'strong', 'code', 'a', 'span', 'b', 'i', 'br'):
            pending_inline.append(inline(Node('x', {}, None)) if False else inline_wrap(k))
            continue
        flush()
        r = block(k, depth)
        if r:
            parts.append(r)
    flush()
    return '\n\n'.join(p for p in parts if p.strip())


def inline_wrap(k):
    w = Node('w')
    w.kids = [k]
    return inline(w)


def para(n):
    return clean(inline(n))


def block(n, depth):
    c = n.cls
    t = n.tag
    if t in ('script', 'style', 'svg') or 'gate-bar' in c or 'gaps' in c:
        return ''
    if t == 'p':
        if 'label' in c or 'ex-num' in c:
            return ''
        if 'inset' in c:
            return '> ' + para(n)
        return para(n)
    if t in ('ul', 'ol'):
        return listing(n, ordered=(t == 'ol'))
    if t == 'blockquote':
        return '\n'.join('> ' + line if line else '>' for line in blocks(n).split('\n'))
    if t == 'pre':
        return '```python\n' + text_of(n).strip('\n') + '\n```'
    if t == 'figure':
        return figure(n)
    if t == 'details':
        return details(n)
    if t == 'div':
        if 'callout' in c:
            return callout(n)
        if 'note' in c:
            return quote_block('Note', blocks(n))
        if 'open-question' in c:
            body = Node('b')
            body.kids = [k for k in n.kids if not (isinstance(k, Node) and 'callout-label' in k.cls)]
            return quote_block('Open question', blocks(body))
        if 'ex' in c:
            return exercise(n)
        if 'predict' in c:
            return predict(n)
        if 'checkpoint' in c:
            return checkpoint(n)
        if 'eq-row' in c:
            eq = n.child(has('eq'))
            tag = n.child(lambda x: x.tag == 'span')
            s = clean(text_of(eq))
            if tag is not None:
                s += f'\n\n<div align="right"><code>[{TAG_LABEL.get((tag.cls & set(TAG_LABEL)).pop(), "")}]</code></div>'
            return s
        if 'legend' in c:
            return '*' + clean(text_of(n)) + '*'
        return blocks(n, depth)
    if t == 'section':
        return section(n)
    if t == 'nav':
        return ''
    return blocks(n, depth)


def listing(n, ordered=False, indent=''):
    lines = []
    for i, li in enumerate(n.children(tagis('li')), 1):
        sub = [k for k in li.kids if isinstance(k, Node) and k.tag in ('ul', 'ol')]
        body = Node('li')
        body.kids = [k for k in li.kids if k not in sub]
        txt = clean(blocks(body))
        mark = f'{i}.' if ordered else '-'
        txt = txt.replace('\n', '\n' + indent + '   ')
        lines.append(f'{indent}{mark} {txt}')
        for s in sub:
            lines.append(listing(s, s.tag == 'ol', indent + '   '))
    return '\n'.join(lines)


def quote_block(label, body, red=False):
    head = f'**{label}**'
    body = body.strip()
    lines = [head, ''] + body.split('\n') if body else [head]
    return '\n'.join('> ' + l if l else '>' for l in lines)


def callout(n):
    label_node = n.child(has('callout-label'))
    label = clean(inline(label_node)) if label_node else ''
    body = Node('b')
    body.kids = [k for k in n.kids if k is not label_node]
    text = blocks(body)
    if n.cls & {'proof', 'sketch'}:
        text = text.rstrip() + ' ∎'
    return quote_block(label, text)


def details(n):
    summ = n.child(tagis('summary'))
    title = clean(inline(summ)) if summ else 'More'
    body = Node('b')
    body.kids = [k for k in n.kids if k is not summ]
    return f'<details>\n<summary><b>{title}</b></summary>\n\n{blocks(body)}\n\n</details>'


def fold(title, body):
    return f'<details>\n<summary>{title}</summary>\n\n{body.strip()}\n\n</details>'


# ---------------------------------------------------------------- figures
FIGURES = {}


def figure(n):
    cap = n.child(tagis('figcaption'))
    label = clean(text_of(cap.child(has('fig-label')))) if cap else ''
    caption = clean(inline(cap.child(has('fig-caption')))) if cap and cap.child(has('fig-caption')) else ''
    head = f'**{label}.** *{caption}*' if caption else f'**{label}.**'
    fid = n.attrs.get('id', '')
    key = (LESSON, fid)
    if key in FIGURES:
        return head + '\n\n' + FIGURES[key](n)
    if 'listing' in n.cls:
        pre = n.find(tagis('pre'))
        return head + '\n\n```python\n' + text_of(pre).strip('\n') + '\n```'
    table = n.find(tagis('table'))
    if table is not None:
        rest = Node('b')
        rest.kids = [k for k in n.kids if k is not cap and k is not table and not (isinstance(k, Node) and table in list(k.find_all(lambda x: True)))]
        return head + '\n\n' + md_table(table) + ('\n\n' + blocks(rest) if blocks(rest).strip() else '')
    body = Node('b')
    body.kids = [k for k in n.kids if k is not cap]
    return head + '\n\n' + blocks(body)


def md_table(t):
    rows = []
    for tr in t.find_all(tagis('tr')):
        cells = [clean(inline(c)).replace('|', '\\|') for c in tr.children(lambda x: x.tag in ('td', 'th'))]
        rows.append(cells)
    if not rows:
        return ''
    w = max(len(r) for r in rows)
    rows = [r + [''] * (w - len(r)) for r in rows]
    out = ['| ' + ' | '.join(rows[0]) + ' |', '|' + '---|' * w]
    out += ['| ' + ' | '.join(r) + ' |' for r in rows[1:]]
    return '\n'.join(out)


# ---------------------------------------------------------------- exercises
LETTERS = 'abcdefghij'


def ex_parts(n):
    num = n.child(has('ex-num'))
    prompt = n.child(has('ex-prompt'))
    hints = [clean(inline(h)) for h in n.find_all(has('hint'))]
    sol = n.child(has('ex-solution'))
    return (clean(text_of(num)) if num else ''), (blocks(prompt) if prompt else ''), hints, (blocks(sol) if sol else '')


def fb_text(fb):
    return blocks(fb).strip()


def exercise(n, in_predict=False):
    typ = n.attrs.get('data-type')
    num, prompt, hints, sol = ex_parts(n)
    head = f'**{num}.** ' if num else ''
    out = [head + prompt if head else prompt]
    answer_lines = []

    if typ in ('mcq', 'multi'):
        opts = n.child(has('ex-options')).children(tagis('li'))
        out.append('\n'.join(f'- **({LETTERS[i]})** ' + clean(blocks(li.child(has('opt')))) for i, li in enumerate(opts)))
        for i, li in enumerate(opts):
            ok = 'data-correct' in li.attrs
            fb = li.child(has('fb'))
            mark = '✓ correct' if ok else '✗'
            answer_lines.append(f'- **({LETTERS[i]})** {mark}. ' + (fb_text(fb) if fb else ''))
        if typ == 'multi':
            out.insert(1, '*Select every option that applies.*')
    elif typ == 'numeric':
        out.append('*Your answer:* ______')
        ans = n.attrs.get('data-answer')
        for fb in n.children(has('fb')):
            when = fb.attrs.get('data-when', '')
            if when == 'correct':
                answer_lines.insert(0, f'- **{ans}** ✓ ' + fb_text(fb))
            elif when == 'other':
                answer_lines.append('- *Any other answer:* ' + fb_text(fb))
            else:
                answer_lines.append(f'- *If you answered {when}:* ' + fb_text(fb))
    elif typ == 'match':
        cats = [c.split(':', 1) for c in n.attrs.get('data-categories', '').split('|')]
        catname = {k: v for k, v in cats}
        out.append('*Categories:* ' + ' · '.join(f'**{v}**' for _, v in cats))
        items = n.child(has('ex-items')).children(tagis('li'))
        out.append('\n'.join(f'{i}. ' + clean(blocks(li.child(has('item')))) for i, li in enumerate(items, 1)))
        for i, li in enumerate(items, 1):
            a = li.attrs.get('data-answer')
            fbs = li.children(has('fb'))
            right = next((f for f in fbs if f.attrs.get('data-when') == 'correct'), None)
            answer_lines.append(f'{i}. **{catname.get(a, a)}.** ' + (fb_text(right) if right else ''))
            for f in fbs:
                w = f.attrs.get('data-when')
                if w == 'correct':
                    continue
                who = 'any other choice' if w == 'other' else ' or '.join(catname.get(x, x) for x in w.split(','))
                answer_lines.append(f'   - *If you chose {who}:* ' + fb_text(f))
    elif typ == 'order':
        steps = n.child(has('ex-steps')).children(tagis('li'))
        shown = steps[:]
        random.Random(n.attrs.get('id')).shuffle(shown)
        out.append('*Steps (shuffled; some are false):*')
        out.append('\n'.join(f'- **{LETTERS[i].upper()}.** ' + clean(inline(li)) for i, li in enumerate(shown)))
        true_steps = sorted((s for s in steps if s.attrs.get('data-pos') != '0'), key=lambda s: int(s.attrs['data-pos']))
        letter = {id(s): LETTERS[i].upper() for i, s in enumerate(shown)}
        answer_lines.append('**Order:** ' + ' → '.join(letter[id(s)] for s in true_steps))
        for s in steps:
            if s.attrs.get('data-pos') == '0':
                why = re.sub(r"^It[’']s false(?: as stated)?[:,.]\s*", '', clean(s.attrs.get('data-why', '')))
                answer_lines.append(f'- **{letter[id(s)]}** is false: ' + why[:1].lower() + why[1:] if why else f'- **{letter[id(s)]}** is false.')
        right = n.child(lambda x: 'fb' in x.cls and x.attrs.get('data-when') == 'correct')
        if right is not None:
            answer_lines.append('\n' + fb_text(right))
    elif typ == 'lines':
        pre = n.find(tagis('pre'))
        code = text_of(pre).strip('\n').split('\n')
        out.append('```python\n' + '\n'.join(f'{i:>2}  {l}' for i, l in enumerate(code, 1)) + '\n```')
        out.append('*Which line is wrong?*')
        ans = n.attrs.get('data-answer')
        for fb in n.children(has('fb')):
            w = fb.attrs.get('data-when')
            if w == 'correct':
                answer_lines.insert(0, f'- **Line {ans}** ✓ ' + fb_text(fb))
            elif w == 'other':
                answer_lines.append('- *Any other line:* ' + fb_text(fb))
            else:
                answer_lines.append(f'- *If you picked line {w}:* ' + fb_text(fb))
    elif typ == 'custom':
        ph = n.attrs.get('data-placeholder')
        out.append('*Type your answer in the interactive version of this page; the checker explains every answer.*'
                   + (f' (Input format, for example: `{ph}`.)' if ph else ''))

    if in_predict:
        if answer_lines:
            out.append(fold('Your prediction, compared', '\n'.join(answer_lines)))
        return '\n\n'.join(x for x in out if x)
    for i, h in enumerate(hints, 1):
        out.append(fold(f'Hint {i}', h))
    if answer_lines:
        out.append(fold('Answer and feedback', '\n'.join(answer_lines)))
    if sol:
        out.append(fold('Worked solution', sol))
    return '\n\n'.join(x for x in out if x)


def predict(n):
    ex = n.child(has('ex'))
    rev = n.child(has('reveal'))
    out = ['> **PREDICT FIRST.** Commit to an answer before opening the reveal.', exercise(ex, in_predict=True)]
    if rev is not None:
        out.append(fold('<b>Reveal</b>', blocks(rev)))
    return '\n\n'.join(out)


def checkpoint(n):
    label = n.child(has('label'))
    title = clean(text_of(label)) if label else 'Checkpoint'
    body = Node('b')
    body.kids = [k for k in n.kids if k is not label]
    return f'#### {title}\n\n' + blocks(body)


# ---------------------------------------------------------------- sections
def section(n):
    c = n.cls
    if 'where' in c:
        return '## Where we are\n\n' + blocks(n)
    if 'prereq' in c:
        return '## Prerequisite check\n\n' + blocks(n)
    if 'ledger' in c:
        out = ['---', '## Ledger']
        for b in n.children(lambda x: 'ledger-block' in x.cls):
            lab = b.child(has('label'))
            body = Node('b')
            body.kids = [k for k in b.kids if k is not lab]
            content = blocks(body).strip()
            if 'gaps' in ''.join(' '.join(x.cls) for x in b.find_all(lambda x: True)) and not content:
                content = '*(Your open gaps are listed here in the interactive version.)*'
            out.append(f'**{clean(text_of(lab))}**\n\n{content}')
        oq = n.child(has('open-question'))
        if oq is not None:
            out.append(block(oq, 0))
        return '\n\n'.join(out)
    h2 = n.child(tagis('h2'))
    if h2 is not None:
        num = h2.find(has('sec-num'))
        title = h2.find(has('sec-title'))
        head = f'## {clean(text_of(num))} · {clean(text_of(title))}' if num is not None else f'## {clean(text_of(h2))}'
        body = Node('b')
        body.kids = [k for k in n.kids if k is not h2]
        return '---\n\n' + head + '\n\n' + blocks(body)
    return blocks(n)


def convert(path):
    b = Builder()
    b.feed(open(path, encoding='utf8').read())
    main = b.root.find(lambda x: x.tag == 'main')
    header = main.find(tagis('header'))
    kicker = clean(text_of(header.find(has('kicker'))))
    title = clean(text_of(header.find(tagis('h1'))))
    meta = clean(text_of(header.find(has('meta'))))
    out = [f'# {kicker}: {title}', f'*{meta}*',
           '> This is the Markdown edition of the interactive page. Exercises show their answers, feedback, '
           'hints and worked solutions in collapsible blocks: try each one before opening them.']
    for k in main.kids:
        if isinstance(k, Node) and k.tag in ('section',):
            out.append(section(k))
        elif isinstance(k, Node) and k.tag == 'div':
            out.append(block(k, 0))
        elif isinstance(k, Node) and k.tag == 'nav' and 'bridge' in k.cls:
            a = k.find(tagis('a'))
            if a is not None:
                lab = a.find(has('label'))
                ttl = a.find(has('bridge-title'))
                name = (clean(text_of(lab)).replace('Next · ', '') + ': ' + clean(text_of(ttl))) if lab is not None and ttl is not None else clean(text_of(a))
                out.append('---\n\n**Next:** ' + f'[{name}]({md_href(a.attrs.get("href", ""))})')
            else:
                out.append('---\n\n**Next:** ' + clean(text_of(k)))
    md = '\n\n'.join(x for x in out if x.strip())
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip() + '\n'


# ---------------------------------------------------------------- lesson-specific static figures
def _fig1(n):
    return '''```text
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
```'''


def _fig2(n):
    return """```text
 position :   0     1     2     3
 value    :  [7]   [2]   [9]   [4]

 out-of-order pairs:  positions 0–1 (7 before 2)
                      positions 0–3 (7 before 4)
                      positions 2–3 (9 before 4)
```"""


def _fig3(n):
    return '''```text
   c         d          up means later; lines are covering pairs
   │ ╲       │
   │   ╲     │
   │     ╲   │
   a         b

   a = write the code · b = write the tests · c = run the tests · d = review the tests
```
e(P) = 5 orderings are still possible: **a b c d**, **a b d c**, **b a c d**, **b a d c**, **b d a c**.'''


def _fig4(n):
    rest = Node('b')
    cap = n.child(tagis('figcaption'))
    rest.kids = [k for k in n.kids if k is not cap]
    return ('*The playground is interactive in the HTML edition: click an element, then another, to require '
            'the first before the second, and watch e(P) change.*\n\n' + blocks(rest))


FIGURES.update({
    (1, 'fig-1'): _fig1,
    (1, 'fig-2'): _fig2,
    (1, 'fig-3'): _fig3,
    (1, 'fig-4'): _fig4,
})

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    LESSON = int(re.search(r'lesson-(\d+)', src).group(1))
    open(dst, 'w', encoding='utf8').write(convert(src))
    print('wrote', dst)
