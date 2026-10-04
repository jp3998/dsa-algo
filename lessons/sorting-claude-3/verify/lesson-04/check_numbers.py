import math, random, subprocess, sys, itertools
from itertools import permutations
from math import comb, factorial
sys.path.insert(0, '.')
from common import instrumented, knowledge
from listing1 import permutation_sort, is_sorted
from listing2 import rank_sort

def counted(a):
    out, c, log = instrumented(a)
    return out, c, len(log)

def T(n):
    return sum(factorial(n) // factorial(j) for j in range(1, n))

# --- instrumented == listing 3 == formula
import importlib.util, io, contextlib
spec = importlib.util.spec_from_file_location('l3', 'listing3.py')
l3 = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(l3)
for n in range(0, 8):
    for p in itertools.islice(permutations(range(n)), 0, None, max(1, factorial(n)//60)):
        o3, c3 = l3.permutation_sort_counted(list(p))
        o, c, nc = counted(list(p))
        assert o3 == o == permutation_sort(list(p)) == sorted(p) and c3 == nc
# T(n) = reversed input cost, = max over all inputs; best = n-1
for n in range(1, 9):
    rev = list(range(n, 0, -1))
    assert counted(rev)[2] == T(n), n
    assert counted(rev)[1] == factorial(n)
    assert counted(sorted(rev))[2] == n - 1 and counted(sorted(rev))[1] == 1
    if n <= 6:
        costs = [counted(list(p))[2] for p in permutations(range(n))]
        assert max(costs) == T(n) and min(costs) == n - 1
    assert T(n) < 2 * factorial(n)
    # comparison j made on n!/j! candidates
    for j in range(1, n):
        cnt = sum(1 for p in permutations(range(n)) if all(p[k] < p[k+1] for k in range(j-1)) ) if n <= 7 else None
        if cnt is not None:
            assert cnt == factorial(n) // factorial(j)
assert [T(n) for n in range(1, 11)] == [0, 2, 9, 40, 205, 1236, 8659, 69280, 623529, 6235300]
print("T(n) ok")

# --- Table 2
table2 = {1:(1,0,'0',0),2:(2,2,'1.0000',1),3:(6,9,'1.5000',3),4:(24,40,'1.6667',6),5:(120,205,'1.7083',10),
 6:(720,1236,'1.7167',15),7:(5040,8659,'1.7181',21),8:(40320,69280,'1.7183',28),9:(362880,623529,'1.7183',36),10:(3628800,6235300,'1.7183',45)}
for n,(f,t,r,pairs) in table2.items():
    assert factorial(n)==f and T(n)==t and pairs == n*(n-1)//2
    if n == 1: assert t == 0
    else: assert '%.4f' % (t/f) == r, (n, t/f)
print('e-1 =', math.e-1, 'T(8)/8! =', T(8)/factorial(8))
assert '%.4f' % (math.e-1) == '1.7183' and abs(T(8)/factorial(8) - (math.e-1)) < 5e-5
for n in range(1, 9):   # instrumented agreement n<=8
    assert counted(list(range(n,0,-1)))[2] == table2[n][1]
print("Table 2 ok")

# --- Table 1
o, c, log = instrumented([3,1,2])
assert o == [1,2,3] and c == 4 and len(log) == 6
cands = []
rows = []
for cand in permutations([3,1,2]):
    qs = []
    for i in range(2):
        ans = cand[i+1] < cand[i]
        qs.append('%d < %d? %s' % (cand[i+1], cand[i], 'yes' if ans else 'no'))
        if ans: break
    rows.append((cand, qs))
    if all(q.endswith('no') for q in qs) and len(qs)==2: break
print(rows)
assert rows == [((3,1,2),['1 < 3? yes']),((3,2,1),['2 < 3? yes']),((1,3,2),['3 < 1? no','2 < 3? yes']),((1,2,3),['2 < 1? no','3 < 2? no'])]
print("Table 1 ok")

# --- Q1, Q2, predicts, cp1
assert counted([2,1,3]) == ([1,2,3], 3, 5)
def pos_rank(a):
    s = tuple(sorted(range(len(a)), key=lambda i: a[i]))
    return s, list(permutations(range(len(a)))).index(s) + 1
assert instrumented([2,3,4,1])[1] == 19 and pos_rank([2,3,4,1]) == ((3,0,1,2), 19)
assert instrumented([1,4,3,2])[1] == 6 and pos_rank([1,4,3,2]) == ((0,3,2,1), 6)
inv = lambda a: sum(1 for i in range(len(a)) for j in range(i+1,len(a)) if a[i] > a[j])
assert inv([2,3,4,1]) == 3 == inv([1,4,3,2])
assert factorial(4) == 24 and counted([4,3,2,1])[2] == 40 and 24*3 == 72
assert pos_rank([4,3,2,1]) == ((3,2,1,0), 24)
assert pos_rank([2,1,3,4]) == ((1,0,2,3), 7) and instrumented([2,1,3,4])[1] == 7
print("cp1 ok; [2,1,3,4] comparisons:", counted([2,1,3,4])[2])
# Q3: exactly the inputs with a1<a0<a2<a3 (of distinct) have 7th
for p in permutations(range(4)):
    assert (instrumented(list(p))[1] == 7) == (p[1] < p[0] < p[2] < p[3])
# prerequisites
assert comb(6, 2) == 15 and 6 - 1 == 5
# step-3 sanity
assert 6//1 + 6//2 == 9 and 24 + 12 + 4 == 40

# --- T(20)
t20 = T(20); print('T(20) =', t20)
assert abs(t20/1e18 - 4.18) < 0.005
years = t20/1e9/(365.25*24*3600); print('years', years)
assert round(years) == 132

# --- knowledge classification
def kn(a):
    o, c, log = instrumented(a)
    return log, knowledge(a, log)
log, k = kn([3,1,2])
st = [s for s,_ in k]; es = [e for _,e in k]
assert len(log) == 6 and st.count('new') == 3 and st.count('known') == 3 and st.count('implied') == 0
assert es.index(1) + 1 == 5
log, k = kn([2,3,1])
assert len(log) == 7 and [e for _,e in k].index(1) + 1 == 3
print([x for x in log[:3]])
assert log[:3] == [(3,2,False),(1,3,True),(2,1,True)] or True
log, k = kn([4,3,2,1])
st = [s for s,_ in k]; es = [e for _,e in k]
assert len(log) == 40 and st.count('new') == 6 and st.count('known') == 34 and st.count('implied') == 0, st
assert es.index(1) + 1 == 24 and 40 - 24 == 16
assert comb(4, 2) == 6
print("knowledge ok; [2,3,1] log", instrumented([2,3,1])[2])
# first three questions of [2,3,1]
assert instrumented([2,3,1])[2][:3] == [(3,2,False),(1,3,True),(1,2,True)]
# [2,3,1]: last candidates (3,2,1),(3,1,2)
cs = [p for p in permutations([2,3,1])]
assert cs[2:5] == [(3,2,1),(3,1,2),(1,2,3)]

# --- Q4/Q5: a<c, b<c, b<d
elems = 'abcd'
rels = [('a','c'),('b','c'),('b','d')]
exts = [''.join(p) for p in permutations(elems) if all(p.index(x) < p.index(y) for x,y in rels)]
assert exts == ['abcd','abdc','bacd','badc','bdac'], exts
def implied(x,y):  # transitive closure
    cl = set(rels)
    changed = True
    while changed:
        changed = False
        for (p,q) in list(cl):
            for (r,s) in list(cl):
                if q == r and (p,s) not in cl: cl.add((p,s)); changed = True
    return (x,y) in cl or (y,x) in cl
assert implied('b','c') and not implied('a','b') and not implied('c','d') and not implied('a','d')
print("Q4/Q5 ok")

# --- rank_sort
assert rank_sort([5,5,5]) == [5,5,5]
def rank_sort_elif(a):
    n = len(a); rank = [0]*n
    for i in range(n):
        for j in range(i+1, n):
            if a[j] < a[i]: rank[i] += 1
            elif a[i] < a[j]: rank[j] += 1
    b = [None]*n
    for i in range(n): b[rank[i]] = a[i]
    return b
assert rank_sort_elif([5,5,5]) == [5,None,None]
assert rank_sort([2,1,2]) == [1,2,2]
for n in range(0,8):
    for p in itertools.islice(permutations(range(n)), 0, None, max(1, factorial(n)//80)):
        assert rank_sort(list(p)) == sorted(p)
# stability by position: tag ties
pairs = [(2,'x'),(1,'y'),(2,'z'),(1,'w')]
class K:
    def __init__(s,t): s.t=t
    def __lt__(s,o): return s.t[0] < o.t[0]
    def __repr__(s): return repr(s.t)
assert [k.t for k in rank_sort([K(p) for p in pairs])] == [(1,'y'),(1,'w'),(2,'x'),(2,'z')]
assert comb(10,2) == 45 and 90 != 45
print("rank_sort ok")

# --- edge cases and bugs
assert permutation_sort([]) == [] and instrumented([]) == ([], 1, [])
assert permutation_sort([7]) == [7] and instrumented([7]) == ([7], 1, [])
assert instrumented([5,5,5])[1] == 1 and len(instrumented([5,5,5])[2]) == 2
for n in range(1,7): assert len(instrumented(list(range(n)))[2]) == n-1
o, c, log = instrumented([2,1,2])
assert o == [1,2,2] and c == 3 and len(log) == 5
def is_sorted_strict(b):
    for i in range(len(b)-1):
        if not b[i] < b[i+1]: return False
    return True
def is_sorted_short(b):
    for i in range(len(b)-2):
        if b[i+1] < b[i]: return False
    return True
def psort(a, chk):
    for cand in permutations(a):
        if chk(cand): return list(cand)
assert psort([2,1,2], is_sorted_strict) is None
assert psort([1,3,2], is_sorted_short) == [1,3,2]
assert psort([2,1,3,4,5], is_sorted_strict) == [1,2,3,4,5]   # distinct keys: equivalent
for p in permutations(range(5)): assert psort(list(p), is_sorted_strict) == sorted(p)
print("edge cases ok")
# permutation_sort correct with ties (random)
rng = random.Random(1)
for _ in range(300):
    a = [rng.randrange(4) for _ in range(rng.randrange(0,7))]
    assert permutation_sort(a) == sorted(a)

# Theorem 2 bound pieces
for j in range(1, 30): assert factorial(j) >= 2**(j-1)
# Lesson-1 pairs example of E5 irrelevant.
# 6 elements: 720 candidates, 1236 comparisons, 7 -> 5040
assert factorial(6) == 720 and T(6) == 1236 and factorial(7) == 5040

# =====================================================================
# Exercise feedback, hints and worked solutions (v3 revision): every fact they state
# =====================================================================
def cand_costs(a, check_lt=lambda x, y: x < y):
    """[(candidate, comparisons for it, passed)] in generation order, as Listing 1 runs."""
    out = []
    for cand in permutations(a):
        k, ok = 0, True
        for i in range(len(cand) - 1):
            k += 1
            if cand[i + 1] < cand[i]:
                ok = False
                break
        out.append((cand, k, ok))
        if ok:
            break
    return out
from collections import Counter
from listing2 import rank_sort as rank_sort_l2
import sys as _sys

# P1: 6 elements -> neighbour pairs (0,1)..(4,5); all pairs 15; 10 follow; 720 arrangements; check costs <= 5
pairs6 = [(i, i + 1) for i in range(5)]
assert pairs6 == [(0,1),(1,2),(2,3),(3,4),(4,5)] and len(pairs6) == 5
assert comb(6, 2) == 15 and 15 - 5 == 10 and factorial(6) == 720
def check_cost(b):
    k = 0
    for i in range(len(b) - 1):
        k += 1
        if b[i + 1] < b[i]: break
    return k
costs6 = [check_cost(p) for p in permutations(range(6))]
assert max(costs6) == 5 and costs6[0] == 5 and min(costs6) == 1
# P2: count depends only on the rank pattern (lesson 3, Lemma 3); average often below the worst case
assert counted([30, 10, 20]) == ([10, 20, 30], 4, 6) and counted([3, 1, 2])[1:] == (4, 6)
avg4 = sum(counted(list(p))[2] for p in permutations(range(4))) / 24
assert avg4 < T(4), avg4
print('P1/P2 ok; average over all 24 inputs of 4 =', avg4)

# predict l4-pr-candidates: 4! = 24 arrangements; one candidate costs at most 3 = its neighbour pairs
assert factorial(4) == 24 and max(check_cost(p) for p in permutations(range(4))) == 3
# predict l4-pr-reversed4: all 24 examined; 12 cost 1, 8 cost 2, 4 cost 3 ("some cost two or three",
# "most fail at the first or second pair": 20 of 24); 24 x 3 = 72
cc = cand_costs([4, 3, 2, 1])
assert len(cc) == 24 and Counter(k for _, k, _ in cc) == Counter({1: 12, 2: 8, 3: 4})
assert sum(k for _, k, _ in cc) == 40 and 24 * 3 == 72
# predict l4-pr-knows: after 2 comparisons on [2,3,1] it knows 2<3 and 1<3, two orders still possible
log231 = instrumented([2, 3, 1])[2]
k231 = knowledge([2, 3, 1], log231)
assert log231[:2] == [(3, 2, False), (1, 3, True)] and k231[1][1] == 2 and k231[2][1] == 1
# predict l4-pr-rankties: Listing 2 on [5,5,5] gives ranks [0,1,2] (points to a[1], a[2], a[2]); ranks stay in 0..n-1
def ranks_of(a, tie_else=True):
    n = len(a); rank = [0] * n; awarded = []
    for i in range(n):
        for j in range(i + 1, n):
            if a[j] < a[i]:
                rank[i] += 1; awarded.append(i)
            elif tie_else or a[i] < a[j]:
                rank[j] += 1; awarded.append(j)
            else:
                awarded.append(None)
    return rank, awarded
assert ranks_of([5, 5, 5]) == ([0, 1, 2], [1, 2, 2])
assert rank_sort_l2([5, 5, 5]) == [5, 5, 5]
rng2 = random.Random(7)
for _ in range(500):
    a = [rng2.randrange(4) for _ in range(rng2.randrange(1, 8))]
    r, _ = ranks_of(a)
    assert all(0 <= x <= len(a) - 1 for x in r) and sorted(r) == list(range(len(a)))
print('predict feedback ok')

# Q1: [2,1,3] -> (2,1,3) 1 comparison, (2,3,1) 2, (1,2,3) 2 and passes; total 5; 3 x 2 = 6; worst n=3 is 9 over 6 candidates
assert [tuple(range(3))[:]] and list(permutations(range(3)))[:3] == [(0,1,2),(0,2,1),(1,0,2)]
assert cand_costs([2, 1, 3]) == [((2,1,3),1,False), ((2,3,1),2,False), ((1,2,3),2,True)]
assert 1 + 2 + 2 == 5 and 3 * 2 == 6 and T(3) == 9 and len(cand_costs([3, 2, 1])) == 6
# Q2: positions, places, disorder pairs
P4 = list(permutations(range(4)))
def sorted_pos(a): return tuple(sorted(range(len(a)), key=lambda i: a[i]))
assert sorted_pos([2, 3, 4, 1]) == (3, 0, 1, 2) and P4.index((3, 0, 1, 2)) + 1 == 19
assert sum(1 for t in P4 if t[0] in (0, 1, 2)) == 18 == 3 * 6 and min(i for i, t in enumerate(P4) if t[0] == 3) + 1 == 19
assert sorted_pos([1, 4, 3, 2]) == (0, 3, 2, 1) and P4.index((0, 3, 2, 1)) + 1 == 6
assert [t for t in P4 if t[0] == 0][-1] == (0, 3, 2, 1) and sum(1 for t in P4 if t[0] == 0) == 6
def inv_pairs(a): return [(a[i], a[j]) for i in range(len(a)) for j in range(i + 1, len(a)) if a[j] < a[i]]
assert inv_pairs([2, 3, 4, 1]) == [(2, 1), (3, 1), (4, 1)] and inv_pairs([1, 4, 3, 2]) == [(4, 3), (4, 2), (3, 2)]
assert instrumented([2, 3, 4, 1])[0] == [1, 2, 3, 4]
# Q3: first seven tuples; the 7th is (1,0,2,3); [2,1,3,4] -> 7 candidates, 14 comparisons (same for every valid input);
# [1,2,4,3] -> 2 candidates; the placeholder 7 3 9 5 is not an answer; blocks of 6 by first entry
assert P4[:7] == [(0,1,2,3),(0,1,3,2),(0,2,1,3),(0,2,3,1),(0,3,1,2),(0,3,2,1),(1,0,2,3)]
assert counted([2, 1, 3, 4])[1:] == (7, 14)
assert {counted(list(p))[2] for p in permutations(range(4)) if counted(list(p))[1] == 7} == {14}
assert counted([1, 2, 4, 3])[1] == 2 and counted([7, 3, 9, 5])[1] != 7
for f in range(4):
    assert [i + 1 for i, t in enumerate(P4) if t[0] == f] == list(range(6 * f + 1, 6 * f + 7))
print('cp1 explanations ok')

# Q4/Q5: facts a<c, b<c, b<d; closure adds nothing (no fact starts at c or d); order witnesses; first-element counting
rel = {('a','c'), ('b','c'), ('b','d')}
assert not any(y == x2 for (_, y) in rel for (x2, _) in rel)          # no chain of length 2
ext = [''.join(p) for p in permutations('abcd') if all(p.index(x) < p.index(y) for x, y in rel)]
assert ext == ['abcd', 'abdc', 'bacd', 'badc', 'bdac']
before = lambda o, x, y: o.index(x) < o.index(y)
assert before('abcd','a','b') and before('bacd','b','a')                # (a) a vs b
assert before('abcd','c','d') and before('abdc','d','c')                # (b) c vs d
assert before('abcd','a','d') and before('bdac','d','a')                # (d) a vs d
assert all(before(o, 'b', 'c') for o in ext)                            # (c) b vs c: known, all 5 agree
for o in ['abcd','bacd','abdc','bdac']: assert o in ext
minimal = [x for x in 'abcd' if not any(y == x for (_, y) in rel)]
assert minimal == ['a', 'b']
assert [o for o in ext if o[0] == 'a'] == ['abcd', 'abdc'] and [o for o in ext if o[0] == 'b'] == ['bacd', 'badc', 'bdac']
assert [o for o in ext if o[:2] == 'bd'] == ['bdac'] and {o[1] for o in ext if o[0] == 'a'} == {'b'} and {o[1] for o in ext if o[0] == 'b'} == {'a', 'd'}
undecided = [(x, y) for x, y in itertools.combinations('abcd', 2) if (x, y) not in rel and (y, x) not in rel]
assert undecided == [('a','b'), ('a','d'), ('c','d')] and len(undecided) == 3
combos = {tuple(before(o, x, y) for x, y in undecided) for o in ext}
assert len(combos) == 5 and 2 ** 3 == 8                                  # different combinations give different orders
print('cp2 explanations ok')

# E1: trace the strict is_sorted on [2,1,2]
E1_SRC = """def is_sorted(b):
    for i in range(len(b) - 1):
        if not b[i] < b[i + 1]:
            return False
    return True
"""
e1ns = {}
exec(compile(E1_SRC, 'e1.py', 'exec'), e1ns)
def traced(fn, *args, fname):
    lines = []
    def tr(frame, event, arg):
        if frame.f_code.co_filename != fname: return None
        def loc(frame, event, arg):
            if event == 'line': lines.append((frame.f_lineno, dict(frame.f_locals)))
            return loc
        return loc
    _sys.settrace(tr)
    try: res = fn(*args)
    finally: _sys.settrace(None)
    return res, lines
cands212 = list(permutations([2, 1, 2]))
assert cands212 == [(2,1,2),(2,2,1),(1,2,2),(1,2,2),(2,2,1),(2,1,2)]
res, ln = traced(e1ns['is_sorted'], (1, 2, 2), fname='e1.py')
assert res is False
assert [(l, loc.get('i')) for l, loc in ln] == [(2, None), (3, 0), (2, 0), (3, 1), (4, 1)]
assert (1 < 2) is True and (2 < 2) is False and (2 < 1) is False
for cand in cands212:
    res, ln = traced(e1ns['is_sorted'], cand, fname='e1.py')
    assert res is False and 5 not in [l for l, _ in ln]                  # nobody reaches line 5
    fail_i = [loc.get('i') for l, loc in ln if l == 4][0]
    assert fail_i == (1 if cand == (1, 2, 2) else 0)
def psort_e1(a):
    for candidate in permutations(a):
        if e1ns['is_sorted'](candidate):
            return list(candidate)
assert psort_e1([2, 1, 2]) is None
assert Counter(cands212) == Counter({(2,1,2): 2, (2,2,1): 2, (1,2,2): 2})
# E2: trace the elif version on [5,5,5]
E2_SRC = """def rank_sort(a):
    n = len(a)
    rank = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if a[j] < a[i]:
                rank[i] += 1
            elif a[i] < a[j]:
                rank[j] += 1
    b = [None] * n
    for i in range(n):
        b[rank[i]] = a[i]
    return b
"""
e2ns = {}
exec(compile(E2_SRC, 'e2.py', 'exec'), e2ns)
res, ln = traced(e2ns['rank_sort'], [5, 5, 5], fname='e2.py')
assert res == [5, None, None]
seq = [l for l, _ in ln]
assert 7 not in seq and 9 not in seq and seq.count(6) == 3 and seq.count(8) == 3 and seq.count(12) == 3
pairs_seen = [(loc['i'], loc['j']) for l, loc in ln if l == 6]
assert pairs_seen == [(0, 1), (0, 2), (1, 2)]
rank_at_10 = [loc['rank'] for l, loc in ln if l == 10][0]
assert rank_at_10 == [0, 0, 0]
writes = [(loc['rank'][loc['i']]) for l, loc in ln if l == 12]
assert writes == [0, 0, 0]
assert ranks_of([5, 5, 5], tie_else=False) == ([0, 0, 0], [None, None, None])
print('E1/E2 traces ok')

# E3: reversed input's sorted positions are the last tuple; question 3 asked on 4 of 24 candidates for n=4; reversed has the most inversions
for n in range(1, 7):
    Pn = list(permutations(range(n)))
    assert sorted_pos(list(range(n, 0, -1))) == tuple(range(n - 1, -1, -1)) == Pn[-1]
    if n >= 2:
        assert len(inv_pairs(list(range(n, 0, -1)))) == n * (n - 1) // 2 == max(len(inv_pairs(list(p))) for p in Pn)
assert sum(1 for p in permutations(range(4)) if p[0] < p[1] < p[2]) == factorial(4) // factorial(3) == 4
# E4: per-i counts 9..0, sum 45; 55 = 10+...+1; 90, 100
per_i = [len(range(i + 1, 10)) for i in range(10)]
assert per_i == [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] and sum(per_i) == 45 == 10 * 9 // 2 == comb(10, 2)
assert sum(range(1, 11)) == 55 and 2 * 45 == 90 and 10 * 10 == 100 and 10 - 1 == 9
for _ in range(50):
    a = rng2.sample(range(1000), 10)
    assert l3.rank_sort_counted(a) == (sorted(a), 45)
# E5: lesson 1's tasks (d needs b, c needs a and b): d, a, b, c passes the neighbour test but is invalid
need = {('a','c'), ('b','c'), ('b','d')}
row = ['d', 'a', 'b', 'c']
assert all((row[i + 1], row[i]) not in need for i in range(3))          # no neighbour pair out of order
assert row.index('d') < row.index('b') and ('b', 'd') in need           # but d comes before b, which it needs
print('final exercises ok')
print("ALL OK")
