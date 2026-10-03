import re, html, sys
MS='/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad/ms/lesson-01-v2.md'
H=open('../../lesson-01.html',encoding='utf-8').read()
md=open(MS,encoding='utf-8').read()
# v2 region: Where we are .. before "## 07"
a=md.index('## Where we are'); b=md.index('## 07 ·')
md=md[a:b]
# drop manuscript directives / meta lines
drop=re.compile(r'^(\(?(copy|statement and proof copied|copy the)[^\n]*|:::[^\n]*|REVEAL:|CHECKPOINT[^\n]*|FIG\. \d[^\n]*|\(Render this[^\n]*|@@EX[^\n]*|EX [a-z]+ id[^\n]*|PREDICT FIRST[^\n]*|categories:[^\n]*|Items:|Steps:|Checker behaviour[^\n]*|Solution:|Hints:|---|## [^\n]*|Static figure[^\n]*|On phones[^\n]*|Prompt:)',re.M)
def md_text(t):
    out=[]
    for line in t.split('\n'):
        l=line.strip()
        if re.match(r'^(:::|REVEAL:|CHECKPOINT|---|## |PREDICT FIRST|categories:|Items:|Steps:|\(copy|\(statement|\(Then|\(Render|@@EX|EX [a-z]+ id|Static figure|On phones|Checker behaviour|FIG\. 1 — caption|FIG\. [234] —)',l) and not l.startswith('## Where'): 
            if l.startswith('FIG. 1 — caption'): out.append(l.split('caption:',1)[1])
            continue
        out.append(l)
    return '\n'.join(out)
mt=md_text(md)
# remove Fig.1 spec bullets (A)-(D) of the figure and the checker spec lines
mt=re.sub(r'- \(A\): 2 → 4.*?End: "nothing can go first: 0 answers"\.\n','',mt,flags=re.S)
mt=re.sub(r'^Prompt:\s*','',mt,flags=re.M)
mt=re.sub(r'^(Hints|Solution|Correct feedback):\s*','',mt,flags=re.M)
mt=re.sub(r'- (not a permutation|equals dabc|valid linear|has an out-of|otherwise \(bcda).*','',mt)
mt=re.sub(r'^\s*- when [^→\n]*→','',mt,flags=re.M)
mt=re.sub(r'→ \((prediction feedback)\)','→',mt)
mt=re.sub(r'(?m)^(Meta|Nav|Same conv|Lines of|Figure and table)[^\n]*','',mt)
mt=re.sub(r'(?:(?<=Hints: )|(?<=\. ))\d\) ','',mt)
def norm(x):
    x=html.unescape(x)
    x=x.replace('✓','').replace('✗','')
    return re.sub(r'[^a-z0-9]','',x.lower())
def sents(x):
    return [s for s in re.split(r'(?<=[.?!])\s+|\n+|→',x) if len(norm(s))>12]
# HTML visible text of where..s06 (to cp4 end)
h0=H.index('<section class="where"'); h1=H.index('<section class="lsec" id="s07"')
ht=H[h0:h1]
ht=re.sub(r'<style.*?</style>','',ht,flags=re.S)
ht=re.sub(r'<svg.*?</svg>','',ht,flags=re.S)
ht=re.sub(r'<div class="ctrees"[^>]*>.*?</div>\s*</figure>','</figure>',ht,flags=re.S)  # fig 1 checked separately
ht=re.sub(r'<(/p|/li|/div|br)[^>]*>','\n',ht)
ht=re.sub(r'<[^>]+>',' ',ht)
ht=html.unescape(ht)
H_N=norm(ht); M_N=norm(mt)
missing=[s for s in sents(mt) if norm(s) not in H_N]
extra=[s for s in sents(ht) if norm(s) not in M_N]
print('MISSING FROM HTML (v2 sentences):',len(missing))
for s in missing: print('  -',s.strip()[:200])
print('EXTRA IN HTML (not in v2):',len(extra))
for s in extra: print('  +',s.strip()[:200])
