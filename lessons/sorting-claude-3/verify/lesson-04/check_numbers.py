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
print("ALL OK")
