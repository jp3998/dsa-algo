# ---- v2 additions: claims of the rewritten prose, checked against the page HTML ----
import os, re, xml.etree.ElementTree as ET
from itertools import permutations
HTML = open(os.path.join('..','..','lesson-01.html'), encoding='utf-8').read()

def pairs_of(text):
    return {(a.strip(), b.strip()) for a, b in re.findall(r'\(([^(),]+),([^(),]+)\)', text)}

# Relations (definitions from the requests)
nums=[7,2,9,4]; relA={(str(x),str(y)) for x in nums for y in nums if x<y}
ages={'Ana':30,'Ben':25,'Cy':30,'Dee':22}; relB={(p,q) for p in ages for q in ages if ages[p]<ages[q]}
needs={'c':{'a','b'},'d':{'b'}}   # direct needs; closure computed below
relC={(x,y) for y in needs for x in needs[y]}
for _ in range(3): relC|={(x,z) for (x,y) in relC for (y2,z) in relC if y==y2}
assert relC=={('a','c'),('b','c'),('b','d')}          # "no task needed only through another"
relD={('rock','scissors'),('scissors','paper'),('paper','rock')}

# Table 1 lists == pair sets
tbl=re.search(r'id="tbl-1">.*?</figure>',HTML,re.S).group(0)
rows=re.findall(r'<tr><td>\(([A-D])\)[^<]*</td><td>([^<]*)</td></tr>',tbl)
got={k:pairs_of(v) for k,v in rows}
assert got=={'A':relA,'B':relB,'C':relC,'D':relD}, got
# the inset list for (B) in the page equals relB
inset=re.search(r'<p class="inset">([^<]*)</p>',HTML).group(1)
assert pairs_of(inset)==relB
# sizes: n items have n(n-1) ordered pairs of distinct items
for n in range(0,9): assert len([1 for x in range(n) for y in range(n) if x!=y])==n*(n-1)
# unconstrained pairs named in prose
unc=lambda r,x,y:(x,y) not in r and (y,x) not in r
assert unc(relB,'Ana','Cy') and unc(relC,'a','b') and unc(relC,'c','d') and unc(relC,'a','d')
assert ('Ben','Cy') in relB and ('Cy','Ben') not in relB
# (C): longest chain has 2 tasks (strict chain x1<x2<...), e.g. b then d
def longest_chain(items,rel):
    best=0
    def go(last,l):
        nonlocal best; best=max(best,l)
        for y in items:
            if (last,y) in rel: go(y,l+1)
    for x in items: go(x,1)
    return best
assert longest_chain('abcd',relC)==2 and ('b','d') in relC
assert longest_chain(list(ages),relB)==3
# the naive test (each item strictly before the next) has no valid row in (B), none in (C), one in (A)
naive=lambda row,rel: all((row[i],row[i+1]) in rel for i in range(len(row)-1))
assert [p for p in permutations(ages) if naive(p,relB)]==[]
assert [p for p in permutations('abcd') if naive(p,relC)]==[]
assert len([p for p in permutations(map(str,nums)) if naive(p,relA)])==1
# Dee,Ben,Ana,Cy fails only at its last step (30 to 30)
row=('Dee','Ben','Ana','Cy'); assert [i for i in range(3) if (row[i],row[i+1]) not in relB]==[2]
assert ages['Ana']==ages['Cy']==30
# sorted arrangements and the claimed answers
srt=lambda row,rel: not any((row[j],row[i]) in rel for i in range(len(row)) for j in range(i+1,len(row)))
assert srt(row,relB) and srt(('Dee','Ben','Cy','Ana'),relB)
assert srt(tuple('bdac'),relC)                      # "bdac is valid"
assert sorted(''.join(p) for p in permutations('abcd') if srt(p,relC))==['abcd','abdc','bacd','badc','bdac']
assert [p for p in permutations(['rock','paper','scissors']) if srt(p,relD)]==[]

# ---- Fig. 1: choice trees equal the brute-force "minimal elements at each step" trees
def minimal(rem,rel): return [m for m in rem if not any((x,m) in rel for x in rem)]
def tree(rem,rel,order=()):
    # returns list of (label, subtree-or-endstring); a leaf is the completed order
    if not rem: return ' '.join(order)
    return [(m, tree([x for x in rem if x!=m],rel,order+(m,))) for m in minimal(rem,rel)]
def canon(t):
    return t if isinstance(t,str) else sorted((l,canon(s)) for l,s in t)
def leaves(t):
    return [t] if isinstance(t,str) else [x for _,s in t for x in leaves(s)]
fig=re.search(r'<figure class="fig" id="fig-1">.*?</figure>',HTML,re.S).group(0)
panels=re.findall(r'<div class="ctree" data-panel="([A-D])">(.*?)</p></div>(?=<div class="ctree"|\s*</div>\s*</figure>)',fig,re.S)
assert [k for k,_ in panels]==list('ABCD')
def parse_tree(xml):
    root=ET.fromstring('<r>'+xml+'</r>')
    def node(el):          # el: div.ct
        label=el[0].text
        kids=[c for c in el if c.get('class')=='ct-kids']
        ends=[c for c in el if c.get('class')=='ct-end']
        if kids: return (label,[node(k) for k in kids[0]])
        return (label,ends[0].text)
    return node
def to_t(n):
    label,sub=n
    return (label, sub if isinstance(sub,str) else [to_t(k) for k in sub])
expect={'B':tree(list(ages),relB),'C':tree(list('abcd'),relC)}
counts={'A':1,'B':2,'C':5,'D':0}
for k,body in panels:
    total=re.search(r'<p class="ct-total">(.*)$',fig[fig.index('data-panel="%s"'%k):],re.S)
    inner=body.split('</p>',1)[1] if k!='A' else body.split('</p>',1)[1]
    inner=inner.rsplit('<p class="ct-total">',1)[0]
    if k=='A':
        cells=re.findall(r'<span class="ct-cell">(\d)</span><span class="ct-note">only (\d)</span>',inner)
        end=re.search(r'ct-end[^>]*>([^<]*)<',inner).group(1)
        assert all(a==b for a,b in cells)
        # single path: at each step exactly the printed number is the only candidate
        rem=[str(x) for x in nums]; seq=[]
        while rem:
            m=minimal(rem,relA); assert len(m)==1; seq.append(m[0]); rem.remove(m[0])
        assert [a for a,_ in cells]==seq==['2','4','7','9'] and end=='2 4 7 9'
        assert leaves(tree([str(x) for x in nums],relA))==['2 4 7 9']
    elif k in 'BC':
        root=ET.fromstring('<r>'+inner+'</r>')
        topkids=root[0]; assert topkids.get('class')=='ct-kids ct-top'
        def node(el):
            label=el[0].text
            kids=[c for c in el if c.get('class')=='ct-kids']
            if kids: return (label,[node(x) for x in kids[0]])
            return (label,[c for c in el if c.get('class')=='ct-end'][0].text)
        def tt(n):
            return (n[0], n[1] if isinstance(n[1],str) else [tt(x) for x in n[1]])
        page=[tt(node(x)) for x in topkids]
        assert canon(page)==canon(expect[k]), (k,page,expect[k])
        assert len(leaves(expect[k]))==counts[k]==len(leaves(page))
    else:
        cells=re.findall(r'ct-out">(\w+)</span><span class="ct-note">(\w+): (\w+) must come first',inner)
        assert [c[0] for c in cells]==[c[1] for c in cells]==['rock','paper','scissors']
        for a,_,b in cells:
            assert (b,a) in relD                       # the named item beats it, so must come first
        assert minimal(['rock','paper','scissors'],relD)==[]
    assert ('%s answer'%counts[k]) in total.group(1) or (counts[k]==1 and '1 answer' in total.group(1)) or (k=='D' and '0 answers' in total.group(1)), (k,total.group(1)[:80])
# totals of the figure equal the three answer counts: 1,2,5,0
assert [len(leaves(tree(r,rel))) for r,rel in [([str(x) for x in nums],relA),(list(ages),relB),(list('abcd'),relC),(['rock','paper','scissors'],relD)]]==[1,2,5,0]
# prose of (C) in words: 2 + 2 + 1 = 5, branch by branch
tc=dict(tree(list('abcd'),relC))
assert len(leaves(tc['a']))==2 and len(leaves(tc['b']))==3
assert [(l,len(leaves(s))) for l,s in dict(tc['b']).items()]==[('a',2),('d',1)]
assert [l for l,_ in tc['a']]==['b'] and sorted(l for l,_ in dict(tc['a'])['b'])==['c','d']
assert sorted(l for l,_ in tc['b'])==['a','d'] and [l for l,_ in dict(tc['b'])['d']]==['a'] and [l for l,_ in dict(dict(tc['b'])['d'])['a']]==['c']
# (B) prose: only Dee, then only Ben, then Ana and Cy both
tb=tree(list(ages),relB); assert [l for l,_ in tb]==['Dee']
t2=dict(tb)['Dee']; assert [l for l,_ in t2]==['Ben']
assert sorted(l for l,_ in dict(t2)['Ben'])==['Ana','Cy']
# (C) prose: a and b minimal; d needs only b (b<d, nothing else below d)
assert minimal('abcd',relC)==['a','b'] and [x for x in 'abcd' if (x,'d') in relC]==['b']
# Q5-ish and other numbers repeated from prose
assert len([1 for i in range(4) for j in range(i+1,4) if nums[j]<nums[i]])==3
print('v2 checks passed')
