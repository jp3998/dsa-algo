"""Sentence-by-sentence diff of the page's running prose against the v3 manuscript.
Run: python3 prose_diff.py   (spawns node prose_extract.cjs). Exits non-zero on any divergence."""
import json, re, subprocess, sys, difflib
MS = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad/ms/lesson-04-v3.md'
# page blocks that v3 keeps unchanged (not part of its rewritten prose)
EXPECTED_EXTRA = ['In practice neither is how you sort']

def norm(t):
    t = t.replace(' ', ' ').replace(' ', ' ').replace('\xa0', ' ')
    t = t.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    t = re.sub(r'\[\[TAG:proof\]\]', 'proof', t)
    t = t.replace('**', '').replace('`', '')
    t = re.sub(r'(?<![\\\w])\*([^*]+)\*', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip()

def sentences(t):
    return [s for s in re.split(r'(?<=[.?!])\s+(?=[A-Z"(\\*])', t) if s]

ms = []
for line in open(MS, encoding='utf8'):
    line = line.rstrip('\n')
    if not line.strip() or line.startswith(('#', '(', '---', 'v3 rewrites', 'Rules for the builder', '- **Mistake')):  # stress bullets are list items, reviewed by hand
        continue
    line = re.sub(r'^\d+\.\s+', '', line)
    ms.extend(sentences(norm(line)))

blocks = json.loads(subprocess.run(['node', 'prose_extract.cjs'], capture_output=True, text=True, check=True).stdout)
page = []
for b in blocks:
    txt = norm(b['text'])
    if any(txt.startswith(x) for x in EXPECTED_EXTRA):
        continue
    page.extend(sentences(txt))

sm = difflib.SequenceMatcher(a=ms, b=page, autojunk=False)
bad = 0
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        continue
    bad += 1
    print('---', op)
    for s in ms[i1:i2]: print('  v3  :', s)
    for s in page[j1:j2]: print('  page:', s)
print('v3 sentences:', len(ms), ' page sentences:', len(page), ' divergences:', bad)
sys.exit(1 if bad else 0)
