# ---- v2 additions: claims of the rewritten prose, checked against the page HTML ----
import os, re, xml.etree.ElementTree as ET
try:
    is_sorted_neighbours  # defined when run from check_numbers.py
except NameError:
    import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from listing1 import is_sorted_by, is_sorted_neighbours, count_sorted
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

# =====================================================================================
# ---- v3: facts used in the rewritten exercise feedback, hints and worked solutions ----
from itertools import product, combinations
from math import factorial, comb
def is_spo(items, r):
    return all(not r(x, x) for x in items) and all(r(x, z) for x in items for y in items for z in items if r(x, y) and r(y, z))
def unrel(r, x, y): return not r(x, y) and not r(y, x)
def is_total(items, r): return all(not unrel(r, x, y) for x in items for y in items if x != y)
def is_weak(items, r): return all(unrel(r, x, z) for x in items for y in items for z in items if unrel(r, x, y) and unrel(r, y, z))
def classify(items, r):
    if not is_spo(items, r): return 'none'
    if is_total(items, r): return 'total'
    return 'weak' if is_weak(items, r) else 'partial'
def sorted_by(row, r): return not any(r(row[j], row[i]) for i in range(len(row)) for j in range(i + 1, len(row)))
def exts(items, r): return [p for p in permutations(items) if sorted_by(p, r)]
def mins(rem, r): return [m for m in rem if not any(r(x, m) for x in rem)]

# l1-pre-1: "for every x, if P then Q" is false  <=>  some x has P and not Q; vacuous truth; other options
for n in range(1, 4):
    for P in product([0, 1], repeat=n):
        for Q in product([0, 1], repeat=n):
            stmt = all((not P[i]) or Q[i] for i in range(n))
            assert (not stmt) == any(P[i] and not Q[i] for i in range(n))
            if not any(P): assert stmt                                   # P false everywhere -> vacuously true
            # an x with Q true and P false never breaks the statement
            for i in range(n):
                if Q[i] and not P[i]: assert (not P[i]) or Q[i]
# "Q false for every x" is not implied by the statement being false
assert not all((not P) or Q for P, Q in [(1, 0), (0, 1)]) and any(Q for Q in (0, 1))

# l1-q-oop: per-number counts 2,0,1,0; in-order pairs; 4*3/2 = 6; neighbours-only gives 2
xs = [7, 2, 9, 4]
assert [sum(1 for j in range(i + 1, 4) if xs[j] < xs[i]) for i in range(4)] == [2, 0, 1, 0]
assert [(xs[i], xs[j]) for i in range(4) for j in range(i + 1, 4) if xs[j] > xs[i]] == [(7, 9), (2, 9), (2, 4)]
assert 4 * 3 // 2 == 6 and sum(1 for i in range(3) if xs[i + 1] < xs[i]) == 2
assert [y for y in xs[1:] if y < 7] == [2, 4] and [y for y in xs[2:] if y < 2] == [] and [y for y in xs[3:] if y < 9] == [4]

# l1-cp1-a: <= not irreflexive; proper subset is a strict partial order, not total; RPS; sibling
ints = range(-3, 4)
assert not is_spo(ints, lambda x, y: x <= y) and (3 <= 3) and is_spo(ints, lambda x, y: x < y) and is_total(ints, lambda x, y: x < y)
subs = [frozenset(c) for k in range(4) for c in combinations({1, 2, 3}, k)]
psub = lambda A, B: A < B
assert len(subs) == 8 and is_spo(subs, psub) and not is_total(subs, psub)
assert unrel(psub, frozenset({1}), frozenset({2})) and unrel(psub, frozenset({1, 2}), frozenset({3}))
beats_ = lambda x, y: (x, y) in relD
rps = ['rock', 'paper', 'scissors']
assert all(not beats_(x, x) for x in rps) and beats_('rock', 'scissors') and beats_('scissors', 'paper') and not beats_('rock', 'paper')
assert classify(rps, beats_) == 'none'
sib = {('Ana', 'Ben'), ('Ben', 'Ana')}; sibr = lambda x, y: (x, y) in sib
assert all(not sibr(x, x) for x in ['Ana', 'Ben']) and not is_spo(['Ana', 'Ben'], sibr) and not sibr('Ana', 'Ana')

# l1-cp1-b: closing RPS under transitivity: rock<paper first, then rock<rock, finally all 9 pairs
cl = set(relD)
step1 = {(x, z) for (x, y) in cl for (y2, z) in cl if y == y2} - cl
assert ('rock', 'paper') in step1
cl |= step1
assert ('rock', 'rock') in {(x, z) for (x, y) in cl for (y2, z) in cl if y == y2}
while True:
    new = {(x, z) for (x, y) in cl for (y2, z) in cl if y == y2} - cl
    if not new: break
    cl |= new
assert cl == {(x, y) for x in rps for y in rps} and len(cl) == 9
for drop in relD:                                   # removing any one requirement breaks the loop
    r2 = relD - {drop}
    assert len(exts(rps, lambda x, y: (x, y) in r2)) >= 1

# l1-cp2-a: choice tree: only a free first; then b and c; two paths; 3! = 6, four start with b or c
r3 = {('a', 'b'), ('a', 'c')}; R3 = lambda x, y: (x, y) in r3
assert mins('abc', R3) == ['a'] and sorted(mins('bc', R3)) == ['b', 'c']
assert sorted(''.join(p) for p in exts('abc', R3)) == ['abc', 'acb'] and factorial(3) == 6
assert sum(1 for p in permutations('abc') if p[0] != 'a') == 4 and all(not sorted_by(p, R3) for p in permutations('abc') if p[0] != 'a')

# l1-cp2-b: 4! = 24; the a<->b swap is an involution pairing a-before-b with b-before-a; 6 position pairs * 2 = 12
r4 = lambda x, y: (x, y) == ('a', 'b')
perms4 = [''.join(p) for p in permutations('abcd')]
sw = lambda s: s.translate(str.maketrans('ab', 'ba'))
assert len(perms4) == 24 == factorial(4) and all(sw(sw(s)) == s for s in perms4)
assert all((s.index('a') < s.index('b')) != (sw(s).index('a') < sw(s).index('b')) for s in perms4)
assert len(exts('abcd', r4)) == 12 == 4 * 3 // 2 * 2

# l1-cp2-c: (C) has two minimal elements; c first leaves a (a < c) after it
assert sorted(mins('abcd', lambda x, y: (x, y) in relC)) == ['a', 'b'] and ('a', 'c') in relC

# l1-ex-neighbour-trap: the worked solution's case analysis on the position of c
RC = lambda x, y: (x, y) in relC
passes = lambda s: not any(RC(s[i + 1], s[i]) for i in range(3))
caught_succ = {(x, y) for x in 'abcd' for y in 'abcd' if x != y and RC(y, x)}
assert caught_succ == {('c', 'a'), ('c', 'b'), ('d', 'b')}
P = [s for s in perms4 if passes(s)]
assert [s for s in P if s.index('c') == 0] == ['cdab'] and not sorted_by('cdab', RC)
assert [s for s in P if s.index('c') == 1] == ['bcda'] and not sorted_by('bcda', RC) and not passes('acdb')
assert sorted(s for s in P if s.index('c') == 2) == ['abcd', 'bacd'] and all(sorted_by(s, RC) for s in ['abcd', 'bacd'])
assert [s for s in P if s.index('c') == 3 and not sorted_by(s, RC)] == ['dabc']
assert all(s[s.index('c') + 1] == 'd' for s in P if s.index('c') < 3)              # c's right neighbour is d
traps = sorted(s for s in P if not sorted_by(s, RC)); assert traps == ['bcda', 'cdab', 'dabc']
unc_pairs = {frozenset(p) for p in combinations('abcd', 2) if unrel(RC, *p)}
assert unc_pairs == {frozenset('ab'), frozenset('ad'), frozenset('cd')}
for s in traps:
    for i in range(4):
        for j in range(i + 1, 4):
            if RC(s[j], s[i]):                                 # a broken pair: never adjacent, bridged by unconstrained steps
                assert j - i > 1 and all(frozenset((s[k], s[k + 1])) in unc_pairs for k in range(i, j))
for s in ['abcd', 'abdc', 'bacd', 'badc', 'bdac']:
    assert s.index('a') < s.index('c') and s.index('b') < s.index('c') and s.index('b') < s.index('d')

# l1-cp3-a
assert len([(i, i + 1) for i in range(1000 - 1)]) == 999 and 1000 * 999 // 2 == 499500 == comb(1000, 2)

# l1-cp3-b: (C) finite, transitive, asymmetric, not total, 2 minimal; in any total order a minimal element is below all others
assert is_spo('abcd', RC) and not is_total('abcd', RC) and all(not (RC(x, y) and RC(y, x)) for x in 'abcd' for y in 'abcd')
for n in range(1, 6):
    for perm in permutations(range(n)):
        rank = {v: i for i, v in enumerate(perm)}; T = lambda x, y: rank[x] < rank[y]
        m = mins(list(range(n)), T); assert len(m) == 1 and all(T(m[0], y) for y in range(n) if y != m[0])

# l1-cp4-a: classification, with the feedback's examples
words = ['a', 'I', 'to', 'be', 'cat', 'dog', 'sun', 'tree', 'word', 'apple']
assert classify(words, lambda u, v: len(u) < len(v)) == 'weak' and len('cat') == len('dog') == 3
assert classify(words, lambda u, v: u < v) == 'total'
pdiv = lambda x, y: x != y and y % x == 0
assert classify(range(1, 13), pdiv) == 'partial' and unrel(pdiv, 2, 3) and unrel(pdiv, 3, 4) and pdiv(2, 4)
hts = [170, 170.6, 171.2, 172.5, 168.4, 170.5]
shorter = lambda x, y: y - x >= 1 - 1e-9
assert classify(hts, shorter) == 'partial'
assert unrel(shorter, 170, 170.6) and unrel(shorter, 170.6, 171.2) and shorter(170, 171.2) and abs((171.2 - 170) - 1.2) < 1e-9
assert unrel(shorter, 170, 170.5)                                  # 0.5 cm apart: unrelated
assert classify(rps, beats_) == 'none'
# transitivity of "at least 1 cm shorter": >= 1 and >= 1 give >= 2
assert all(z - x >= 2 - 1e-9 for x in hts for y in hts for z in hts if shorter(x, y) and shorter(y, z))

# l1-cp4-b: six runners, finishing places 1,1,3,4,4,4
place = {'r1': 1, 'r2': 1, 'r3': 3, 'r4': 4, 'r5': 4, 'r6': 4}
RR = lambda p, q: place[p] < place[q]
assert classify(list(place), RR) == 'weak'
assert len(exts(list(place), RR)) == 12 == factorial(2) * factorial(1) * factorial(3) == 2 * 1 * 6
assert factorial(6) == 720 and 2 + 1 + 3 == 6 and len(set(place.values())) == 3 and factorial(3) == 6

# l1-ex-bug: range(len(xs)-2) on n = 3 gives only i = 0; the fixed loop also checks i = 1 and returns False
assert list(range(3 - 2)) == [0] and list(range(3 - 1)) == [0, 1]
import buggy
assert buggy.is_sorted_neighbours([1, 3, 2], lambda x, y: x < y) is True and is_sorted_neighbours([1, 3, 2], lambda x, y: x < y) is False

# l1-ex-chains: listing by positions of a and b; 24/2/2; swapping c,d keeps a,b in place
r22 = lambda x, y: (x, y) in {('a', 'b'), ('c', 'd')}
E2 = sorted(''.join(p) for p in exts('abcd', r22))
by_pos = {(s.index('a'), s.index('b')): s for s in E2}
assert by_pos == {(0, 1): 'abcd', (0, 2): 'acbd', (0, 3): 'acdb', (1, 2): 'cabd', (1, 3): 'cadb', (2, 3): 'cdab'}
assert len(E2) == 6 == 24 // 2 // 2 == 4 * 3 // 2 and 'acbd' in E2 and 'cadb' in E2

# l1-ex-acyclic: only abc; every other arrangement breaks a requirement; b pinned in the middle
rE3 = lambda x, y: (x, y) in {('a', 'b'), ('b', 'c')}
assert [''.join(p) for p in exts('abc', rE3)] == ['abc'] and not is_spo('abc', rE3)
assert all(p.index('a') < p.index('b') < p.index('c') for p in ['abc'])

# l1-ex-fib: candidates are exactly k and k+1; picking k+1 forces k; recurrence; the eight; the two-swap ones
nbr = lambda x, y: y - x > 1
for n in range(1, 9):
    for size in range(1, n + 1):
        for rem in combinations(range(1, n + 1), size):
            rem = list(rem)
            k = min(rem); m = sorted(mins(rem, nbr))
            assert m == [v for v in (k, k + 1) if v in rem]
            if k + 1 in rem:
                assert mins([v for v in rem if v != k + 1], nbr) == [k]
f = [len(exts(range(1, n + 1), nbr)) for n in range(1, 9)]
assert f[:5] == [1, 2, 3, 5, 8] and all(f[i] == f[i - 1] + f[i - 2] for i in range(2, 8))
E4 = {''.join(map(str, p)) for p in exts(range(1, 6), nbr)}
assert E4 == {'12345', '21345', '13245', '12435', '12354', '21435', '21354', '13254'}
singles = {s for s in E4 if sum(1 for i in range(5) if s[i] != str(i + 1)) == 2}
doubles = {s for s in E4 if sum(1 for i in range(5) if s[i] != str(i + 1)) == 4}
assert len(singles) == 4 and doubles == {'21435', '21354', '13254'} and factorial(5) == 120
assert nbr(1, 5) and not sorted_by((5, 1, 2, 3, 4), nbr) and sorted_by((2, 1, 3, 4, 5), nbr) and sorted_by((2, 1, 4, 3, 5), nbr)
# arranging 2..n works like 1..n-1 (only differences matter)
assert all(len(exts(range(2, n + 1), nbr)) == f[n - 2] for n in range(2, 8))

# l1-ex-proof-order: 7,2,9,4 starts with a non-minimal element under <; (C) has two minimal elements
assert 7 not in mins([7, 2, 9, 4], lambda x, y: x < y) and len(mins('abcd', RC)) == 2
print('v3 exercise checks passed')
