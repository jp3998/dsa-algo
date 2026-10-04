"""Compare the page's running prose with manuscript v3, sentence by sentence.
Page prose = <p> children of #where and #s01-#s05 (labels excluded) plus the paragraphs of the
l3-pr-python1000 reveal, which v3 rewrites; everything v3 marks "(unchanged: ...)" is excluded on both
sides. Usage: python3 prose_diff.py [path/to/lesson-03-v3.md]"""
import difflib, html, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, '..', '..', 'lesson-03.html')
MS = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad/ms/lesson-03-v3.md'

def norm(t):
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = t.replace(' ', ' ').replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'\s+', ' ', t).strip()

# ---- manuscript
ms = open(MS, encoding='utf8').read()
ms = ms[ms.index('## Where we are'):]
ms_paras, ms_titles = [], []
for block in re.split(r'\n\s*\n', ms):
    b = block.strip()
    if not b or b == '---':
        continue
    if b.startswith('## '):
        ms_titles.append(b[3:].strip())
        continue
    if re.match(r'\((unchanged|PREDICT|Depends|Exercises)', b):
        continue
    b = re.sub(r'\*\*(.*?)\*\*', r'\1', b)
    b = re.sub(r'\*(.*?)\*', r'\1', b)
    b = b.replace('`', '')
    ms_paras.append(norm(b))

# ---- page
src = open(PAGE, encoding='utf8').read()
def text(h):
    h = re.sub(r'<span class="tag t-(\w+)">[^<]*</span>', lambda m: '[[TAG:%s]]' % m.group(1), h)
    return norm(html.unescape(re.sub(r'<[^>]+>', '', h)))

def section(sid):
    m = re.search(r'<section class="[^"]*" id="%s"[^>]*>(.*?)\n  </section>' % sid, src, re.S)
    return m.group(1)

page_paras, page_titles = [], []
for sid in ['where', 's01', 's02', 's03', 's04', 's05']:
    body = section(sid)
    if sid != 'where':
        num = re.search(r'<span class="sec-num">(\d+)</span><span class="sec-title">(.*?)</span>', body)
        page_titles.append('%s · %s' % (num.group(1), text(num.group(2))))
    else:
        page_titles.append('Where we are')
    # direct-child paragraphs: four-space indent inside the section
    for m in re.finditer(r'^    <p(?: class="[^"]*")?>(.*?)</p>\s*$', body, re.M):
        if m.group(0).lstrip().startswith('<p class="label">'):
            continue
        page_paras.append(text(m.group(1)))
    if sid == 's04':
        rv = re.search(r'id="l3-pr-python1000-p".*?<div class="reveal">(.*?)\n      </div>\n    </div>', body, re.S).group(1)
        rv = re.sub(r'<figure.*?</figure>', '', rv, flags=re.S)
        rv = re.sub(r'<ul>.*?</ul>', '', rv, flags=re.S)
        page_paras += [text(p) for p in re.findall(r'<p>(.*?)</p>', rv, re.S)]

# order on the page: the python1000 reveal paragraphs come after the §04 intro, as in v3
problems = 0
if page_titles != ms_titles:
    problems += 1
    print('TITLES differ:\n page', page_titles, '\n v3  ', ms_titles)

def sentences(p):
    return [s for s in re.split(r'(?<=[.?!:;])\s+(?=[A-Z(\\"])', p) if s]

if len(page_paras) != len(ms_paras):
    problems += 1
    print('PARAGRAPH COUNT page %d vs v3 %d' % (len(page_paras), len(ms_paras)))
sm = difflib.SequenceMatcher(a=ms_paras, b=page_paras, autojunk=False)
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op == 'equal':
        continue
    problems += 1
    print('==', op, 'v3[%d:%d] page[%d:%d]' % (a0, a1, b0, b1))
    va = [s for p in ms_paras[a0:a1] for s in sentences(p)]
    vb = [s for p in page_paras[b0:b1] for s in sentences(p)]
    for line in difflib.unified_diff(va, vb, 'v3', 'page', lineterm='', n=0):
        print('   ', line)
n_sent = sum(len(sentences(p)) for p in ms_paras)
print('v3 paragraphs: %d (%d sentences); page paragraphs: %d' % (len(ms_paras), n_sent, len(page_paras)))
print('prose matches v3' if not problems else 'PROSE DIFFERS (%d blocks)' % problems)
sys.exit(1 if problems else 0)
