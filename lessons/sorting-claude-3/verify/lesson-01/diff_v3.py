# Sentence-by-sentence diff of the page's running prose against manuscript v3.
# Run from this directory: python3 diff_v3.py   (exit code 1 on any divergence)
import re, html, sys, os
from html.parser import HTMLParser

os.chdir(os.path.dirname(os.path.abspath(__file__)))
MS = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad/ms/lesson-01-v3.md'
H = open('../../lesson-01.html', encoding='utf-8').read()
md = open(MS, encoding='utf-8').read()

# Coordinator addition to v3 §02 (part of v3, word for word).
ANCHOR = 'For (A), (B) and (C) it works: §01 built every one of their answers this way.'
ADD = ('And whenever the procedure gets all the way to the end, the row it builds really does pass: '
       'each item was placed only when nothing still waiting had to come before it, so no item placed '
       'later is ever required before an earlier one.')
assert md.count(ANCHOR) == 1
md = md.replace(ANCHOR, ANCHOR + ' ' + ADD)

# ---------------------------------------------------------------- v3 prose
TAGS = {'intuition': 'intuition', 'sketch': 'proof sketch', 'proof': 'proof'}
body = md[md.index('## Where we are'):]
v3_lines = []
for line in body.split('\n'):
    l = line.strip()
    if not l or l == '---' or l.startswith('#'):
        continue
    if l.startswith('(unchanged; in the ledger'):
        m = re.search(r'reads: "(.*)"\)$', l)
        v3_lines.append(m.group(1))   # ledger item
        continue
    if l.startswith('(') and (l.endswith(')') or 'unchanged' in l):   # directives, "(callout unchanged: …)"
        if not re.match(r'^\((A|B|C|D)\)', l):
            continue
    if re.match(r'^(REVEAL|New section title)', l):
        continue
    l = re.sub(r'^- ', '', l).replace('`', '')
    l = re.sub(r'\*\*?([^*]+)\*\*?', r'\1', l)          # markdown emphasis
    l = re.sub(r'\[\[TAG:(\w+)\]\]', lambda m: TAGS[m.group(1)], l)
    v3_lines.append(l)
v3_text = '\n'.join(v3_lines)

# ---------------------------------------------------------------- page prose
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []
VOID = {'meta', 'link', 'br', 'img', 'input', 'hr', 'path', 'rect'}
class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root', [], None); self.cur = self.root
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur); self.cur.kids.append(n)
        if tag not in VOID: self.cur = n
    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))
    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag: n = n.parent
        if n is not None: self.cur = n.parent
    def handle_data(self, d):
        self.cur.kids.append(d)
p = P(); p.feed(H)

def cls(n): return (n.attrs.get('class') or '').split()
def text(n):
    return ''.join(k if isinstance(k, str) else text(k) for k in n.kids)
def find(n, pred, out):
    if isinstance(n, str): return out
    if pred(n): out.append(n)
    for k in n.kids: find(k, pred, out)
    return out

# Blocks v3 marks as unchanged (kept verbatim from the page) or that are not running prose.
def skip(n):
    c = cls(n)
    if n.tag in ('figure', 'details', 'table', 'pre', 'svg', 'nav', 'header', 'footer', 'style', 'script'): return True
    if 'ex' in c or 'callout' in c or 'checkpoint' in c or 'prereq' in c: return True
    if 'inset' in c or 'label' in c or 'gaps' in c or 'open-question' in c: return True
    if 'reveal' in c and n.parent is not None and n.parent.attrs.get('id') in ('pr-naive', 'pr-neighbours'): return True
    if n.attrs.get('id') == 'exercises': return True
    if n.tag == 'ul' and n.parent is not None:
        t = text(n)
        if re.search(r'\(A\) Put the numbers|\(A\) \\\(x \\prec y\\\) iff|\(A\) \\\(<\\\) on numbers', t): return True   # unchanged lists
    if 'ledger' in c: return True
    return False

def collect(n, out):
    if isinstance(n, str): return
    if skip(n): return
    if n.tag == 'h2': return
    if n.tag == 'p' and 'count_sorted' in text(n) and 'hopeless' in text(n): return   # §07 closing paragraph: unchanged
    if n.tag in ('p', 'li'):
        out.append(text(n)); return
    for k in n.kids: collect(k, out)

main = find(p.root, lambda n: n.tag == 'main', [])[0]
blocks = []
collect(main, blocks)
# the ledger's first "Established" item only (the rest are unchanged)
led = find(main, lambda n: 'ledger' in cls(n), [])[0]
est = [b for b in find(led, lambda n: 'ledger-block' in cls(n), []) if 'Established' in text(b)][0]
first_item = find(est, lambda n: n.tag == 'li', [])[0]
blocks.append(text(first_item))
page_text = '\n'.join(b for b in blocks if not b.strip().startswith(('Lesson 1', '← All')))
# section titles: compare against v3's titles separately
titles = [text(h) for h in find(main, lambda n: n.tag == 'h2' and 'sec-head' in cls(n), [])]

def norm(x):
    x = html.unescape(x).replace('’', "'")
    return re.sub(r'[^a-z0-9]', '', x.lower())
def sents(x):
    x = x.replace('Fig. ', 'Fig ')
    out = []
    for s in re.split(r'(?<=[.?!:])\s+|\n+', x):
        if len(norm(s)) > 6: out.append(s.strip())
    return out

vs = sents(v3_text); ps = sents(page_text)
VN = {norm(s) for s in vs}; PN = {norm(s) for s in ps}
missing = [s for s in vs if norm(s) not in PN]
extra = [s for s in ps if norm(s) not in VN]
want_titles = ['01Four requests', '02From a rule about pairs to a whole order', '03Which rules have answers?',
               '04Picturing a partial order, and counting its answers', '05When every pair is settled', '06Ties', '07In Python']
title_bad = [t for t in titles if t not in want_titles + ['Exercises']] + [t for t in want_titles if t not in titles]
# order check: v3 sentences appear in the page in the same order
order_bad = []
pos = {norm(s): i for i, s in enumerate(ps)}
last = -1
for s in vs:
    k = norm(s)
    if k in pos:
        if pos[k] < last: order_bad.append(s)
        last = max(last, pos[k])
print('v3 sentences:', len(vs), ' page prose sentences:', len(ps))
print('MISSING FROM PAGE:', len(missing)); [print('  -', s[:220]) for s in missing]
print('EXTRA ON PAGE:', len(extra)); [print('  +', s[:220]) for s in extra]
print('OUT OF ORDER:', len(order_bad)); [print('  ~', s[:220]) for s in order_bad]
print('TITLE PROBLEMS:', title_bad)
# strict pass: punctuation-sensitive (typographic quotes/apostrophes mapped to straight ones)
def strict(x):
    x = html.unescape(x)
    for a, b in (('\u2019', "'"), ('\u2018', "'"), ('\u201c', '"'), ('\u201d', '"'), ('\u00a0', ' ')):
        x = x.replace(a, b)
    return re.sub(r'\s+', ' ', x).strip()
VS = {strict(s) for s in vs}; PS = {strict(s) for s in ps}
smiss = [s for s in vs if strict(s) not in PS]
sextra = [s for s in ps if strict(s) not in VS]
print('STRICT (punctuation) MISMATCHES:', len(smiss) + len(sextra))
for s in smiss: print('  v3  :', strict(s)[:240])
for s in sextra: print('  page:', strict(s)[:240])
sys.exit(1 if (missing or extra or order_bad or title_bad or smiss or sextra) else 0)
