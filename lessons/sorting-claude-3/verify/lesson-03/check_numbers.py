import math, itertools, json, subprocess, sys
from math import comb, factorial
from collections import Counter
from listing1 import comparisons_used
assert 2**9 < 1001 <= 2**10 and 2**9 == 512 and 2**10 == 1024
assert math.ceil(math.log2(1001)) == 10 and round(math.log2(1001), 2) == 9.97
assert 1001 / 2**9 < 2 and 1001 / 2**9 > 1.9          # "about 2 gaps"
assert 2**19 < 1000001 <= 2**20 and 2**19 == 524288 and 2**20 == 1048576
assert math.ceil(math.log2(1000001)) == 20
assert factorial(6) == 720 and 6**2 == 36 and 6**6 == 46656 and sum(range(1, 7)) == 21
assert factorial(3) * factorial(2) == 12 and factorial(5) == 120
assert comb(50, 2) == 1225 and comb(1000, 2) == 499500 and comb(10, 2) == 45 and comb(100, 2) == 4950
assert 1000 - 1 == 999 and 50 - 1 == 49 and 2 * 49 == 98
assert comparisons_used(sorted, [1, 2, 3, 4, 5]) == 4
# sorted arrangements of [2,2,1,1,1] counted as bijections
a = [2, 2, 1, 1, 1]
cnt = sum(1 for p in itertools.permutations(range(5)) if all(a[p[i]] <= a[p[i + 1]] for i in range(4)))
assert cnt == 12
# Lemma 3 example inputs share rank pattern
def ranks(x): s = sorted(x); return [s.index(v) for v in x]
assert ranks([10, 30, 20]) == ranks([1, 99, 50]) == [0, 2, 1]
assert ranks([5, 1, 4]) == ranks([50, 10, 40]) == [2, 0, 1]
# E4 average expression
assert factorial(4) == 24 and 1 + 23 == 24
# exactly one sorted arrangement for distinct keys of size 5
assert sum(1 for p in itertools.permutations(range(5)) if list(p) == sorted(p)) == 1
# six fake sorts: which are correct on all inputs (tested on small lists with duplicates)
fakes = {'a': lambda a: [], 'b': lambda a: list(range(len(a))), 'c': lambda a: [min(a)] * len(a),
         'd': lambda a: a, 'e': lambda a: sorted(set(a)), 'f': lambda a: sorted(a)}
ok = {k: True for k in fakes}
for n in range(1, 5):
    for a in itertools.product(range(3), repeat=n):
        a = list(a)
        for k, f in fakes.items():
            if f(list(a)) != sorted(a): ok[k] = False
assert ok == dict(a=False, b=False, c=False, d=False, e=False, f=True), ok
assert sorted(set([2, 1, 2])) == [1, 2]
# set(a) correct iff distinct
for n in range(0, 6):
    for a in itertools.product(range(4), repeat=n):
        assert (sorted(set(a)) == sorted(a)) == (len(set(a)) == len(a))
# checker E3: Counter fix
assert Counter([1]) != Counter([])
# Table 2 vs table2.json
t = json.load(open('table2.json'))
for n in ('10', '100', '1000'):
    assert t[n]['s'] == t[n]['r'] == int(n) - 1, ('sorted/reversed not n-1', n, t[n])
    assert t[n]['mx'] < comb(int(n), 2) and t[n]['mn'] > int(n) - 1

# ---------------------------------------------------------------------------------------------
# v3 exercise rewrite: every number and Python fact quoted in feedback, hints and worked
# solutions. VER collects each verified number; the scan at the end fails on any other number.
# ---------------------------------------------------------------------------------------------
import html as _html, os as _os, re as _re
from listing1 import Counted
VER = set()
def eq(got, shown):
    assert got == shown, (got, shown)
    VER.update(shown if isinstance(shown, (list, tuple)) else [shown])
def approx(got, shown, tol):
    assert abs(got - shown) <= tol, (got, shown); VER.add(shown)

def out_of_order_pairs(row):
    return sum(1 for i in range(len(row)) for j in range(i + 1, len(row)) if row[j] < row[i])

# P1: strict total order on 5 elements
eq(sum(1 for p in itertools.permutations(range(5)) if out_of_order_pairs(p) == 0), 1)
eq(factorial(5), 120); eq(5 * 4 * 3 * 2 * 1, 120); eq(1 * 1 * 1 * 1 * 1, 1)
eq(out_of_order_pairs([4, 3, 2, 1, 0]), 10); eq(comb(5, 2), 10)
eq(len({(1, 2, 3, 4, 5), (5, 4, 3, 2, 1)}), 2)
VER.update({0, 2, 4, 5})   # slot numbers 0, 1 and "the four that remain", "five elements"

# P2: lesson 2's NaN runs (CPython 3.12), Table 2 random count, every pair for 1000
nan = float('nan')
r1 = sorted([3.0, nan, 1.0, 2.0]); r2 = sorted([nan, 3.0, 1.0, 2.0])
assert repr(r1) == '[3.0, nan, 1.0, 2.0]' and repr(r2) == '[nan, 1.0, 2.0, 3.0]', (r1, r2)
VER.update({3.0, 1.0, 2.0})
t = json.load(open('table2.json'))
approx(t['1000']['mean'], 8600, 50); assert t['1000']['mn'] >= 8550 and t['1000']['mx'] <= 8700
eq(comb(1000, 2), 499500); eq(1000 * 999 // 2, 499500); VER.add(1000); VER.add(999)

# predict: halving 1001 gaps
eq(2**9, 512); eq(2**10, 1024); assert 512 < 1001 <= 1024; VER.update({9, 10, 1001})
approx(1001 / 2, 500, 1); approx(1001 / 4, 250, 1); approx(1001 / 2**9, 2, 0.05)
assert math.ceil(math.log2(1001)) == 10

# CP1 Q1: 6 distinct elements
eq(len(list(itertools.permutations(range(6)))), 720)
eq(6 * 5, 30); eq(30 * 4, 120); eq(120 * 3, 360); eq(360 * 2, 720); eq(720 * 1, 720); eq(factorial(6), 720)
eq(6 * 6, 36); eq(6**6, 46656); eq(len(list(itertools.product(range(6), repeat=6))), 46656)
eq(sum(range(1, 7)), 21); eq(factorial(5) * 6, 720)
VER.update({1, 3, 6})

# CP1 Q2: [2, 2, 1, 1, 1]
a = [2, 2, 1, 1, 1]
srt = [p for p in itertools.permutations(range(5)) if out_of_order_pairs([a[i] for i in p]) == 0]
eq(len(srt), 12)
assert {tuple(a[i] for i in p) for p in srt} == {(1, 1, 1, 2, 2)}          # one list of values
assert all(set(p[:3]) == {2, 3, 4} and set(p[3:]) == {0, 1} for p in srt)  # 1s fill slots 0-2, 2s slots 3-4
eq(factorial(3), 6); eq(factorial(2), 2); eq(3 * 2 * 1, 6); eq(2 * 1, 2); eq(6 * 2, 12)
eq(3 + 2, 5); eq(factorial(3) + factorial(2), 8)
eq(sum(1 for p in itertools.permutations(range(5)) if any(a[p[i]] == 2 and a[p[j]] == 1 for i in range(5) for j in range(i + 1, 5))), 108)
assert 108 > 120 / 2                                                        # "most of them put a 2 before a 1"
eq(len(list(itertools.permutations(range(5)))), 120)

# CP1 Q3 and E3b: sorted(set(a))
eq(sorted(set([2, 1, 2])), [1, 2]); eq(sorted(set([3, 1, 2])), [1, 2, 3]); eq(sorted(set([1, 2, 2])), [1, 2])
assert [1, 2, 2] == sorted([1, 2, 2])
eq(sorted(set([3, 1, 3, 2])), [1, 2, 3]); eq(len([3, 1, 3, 2]), 4); eq(len(sorted(set([3, 1, 3, 2]))), 3)
eq(sorted(set([1, 1])), [1])
assert min(len(x) for n in range(5) for x in itertools.product(range(3), repeat=n) if sorted(set(x)) != sorted(x)) == 2

# CP2 Q4: a[3] % 10 is the remainder on division by 10
assert all(x % 10 == x - 10 * (x // 10) for x in range(-50, 50))

# CP2 Q5 / Q6 and Lemma 3, observed on CPython's own sort: same pattern -> same comparisons
def comparison_log(data):
    log = []
    class Tracked:
        def __init__(self, v, i): self.v, self.i = v, i
        def __lt__(self, o): log.append((self.i, o.i)); return self.v < o.v
    out = sorted(Tracked(v, i) for i, v in enumerate(data))
    return log, [x.i for x in out]
eq(ranks([5, 1, 4]), [2, 0, 1]); eq(ranks([50, 10, 40]), [2, 0, 1]); eq(ranks([10, 30, 20]), [0, 2, 1])
for x, y in (([5, 1, 4], [50, 10, 40]), ([10, 30, 20], [1, 99, 50])):
    assert all((x[i] < x[j]) == (y[i] < y[j]) for i in range(3) for j in range(3))
    assert comparison_log(x) == comparison_log(y)
assert (5 < 1) is False and (50 < 10) is False and (1 < 4) is True and (10 < 40) is True
for p in itertools.permutations(range(6)):                                 # rank lists are permutations
    vals = [10 * v + 7 for v in p]
    assert ranks(vals) == list(p) and comparison_log(vals) == comparison_log(list(p))
VER.update({50, 40, 99, 20, 30})

# E1: 50 sorted elements
def lemma1_comparisons(b):
    c = 0
    for i in range(len(b) - 1):
        c += 1
        if not b[i] < b[i + 1]:
            pass                                                           # tie found (keep counting worst case)
    return c
eq(lemma1_comparisons(list(range(50))), 49); eq(50 - 1, 49); eq(49 * 1, 49); eq(2 * 49, 98)
eq(comb(50, 2), 1225); eq(50 * 49 // 2, 1225)
def lemma1_early_stop(b):                                                  # stop at the first tie found
    c = 0
    for i in range(len(b) - 1):
        c += 1
        if not b[i] < b[i + 1]:
            return c
    return c
assert lemma1_early_stop([0, 0] + list(range(1, 49))) == 1                 # "you can finish sooner"
assert max(lemma1_early_stop(sorted(x)) for x in itertools.product(range(60), repeat=1)) <= 49
assert lemma1_early_stop(list(range(50))) == 49                             # no tie: the most it ever needs
assert all(lemma1_early_stop(sorted([v % k for v in range(50)])) <= 49 for k in range(1, 60))
eq(len([(i, i + 1) for i in range(50 - 1)]), 49); eq([(i, i + 1) for i in range(49)][-1], (48, 49))
VER.update({48})

# E2: 1 000 001 gaps
eq(2**19, 524288); eq(2**20, 1048576); eq(1024 * 1024, 1048576); assert 524288 < 1000001 <= 1048576
eq(math.ceil(math.log2(1000001)), 20); approx(1000001 / 2**19, 1.9, 0.01)
eq(math.ceil(math.log10(1000000)), 6); eq(10**6, 1000000); VER.update({1000001, 19})
eq(20 - math.ceil(math.log2(1001)), 10); eq(1000000 // 1000, 1000)           # "a thousand times as many", "ten more"
assert 10**6 < (2**10) * (2**10)                                           # "a million is a bit less than 2^10 * 2^10"

# E3: the fixed checker
def check_sort_fixed(sort_fn, a):
    b = sort_fn(list(a))
    for i in range(len(b) - 1):
        if b[i + 1] < b[i]:
            return False
    return Counter(b) == Counter(a)
assert check_sort_fixed(lambda a: [], [3, 1, 2]) is False and check_sort_fixed(sorted, [3, 1, 2]) is True
for k, f in fakes.items():
    assert all(check_sort_fixed(f, list(x)) == (f(list(x)) == sorted(x)) for n in range(1, 5) for x in itertools.product(range(3), repeat=n))

# E4: costs on the 24 rank patterns
costs = {p: (3 if list(p) == sorted(p) else 6) for p in itertools.permutations(range(4))}
eq(len(costs), 24); eq(factorial(4), 24); eq(min(costs.values()), 3); eq(max(costs.values()), 6)
eq(sum(1 for c in costs.values() if c == 6), 23)
eq(3 + 23 * 6, 141); eq(sum(costs.values()), 141); eq(141 / 24, 5.875); VER.add(4)

# ---------------------------------------------------------------------------------------------
# Scan: every number in a feedback, hint or worked solution on the page must be in VER, apart from
# references (lesson N, §NN, Lemma N, Theorem N, Table N, line N, condition N, slot(s) N, E1, Q4 ...).
# ---------------------------------------------------------------------------------------------
PAGE = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', '..', 'lesson-03.html')
src = open(PAGE, encoding='utf8').read()
ex_html = src[src.find('<section class="prereq"'):src.find('<section class="ledger"')]
chunks = _re.findall(r'<div class="(?:fb|hint)"[^>]*>(.*?)</div>', ex_html, _re.S)
chunks += _re.findall(r'<div class="ex-solution">(.*?)</div>', ex_html, _re.S)
assert len(chunks) > 60, len(chunks)
REF = _re.compile(r'(lesson|Lesson|§|Lemma|Theorem|Table|Listing|line|lines|Lines|condition|Condition|Assumption A|slot|slots|E|Q|P)\s?\d+(?:\s?[–-]\s?\d+)?')
bad = []
for c in chunks:
    t = _html.unescape(_re.sub(r'<[^>]+>', '', c))
    t = t.replace('\u2009', '').replace('\\,', '')
    t = _re.sub(r'\\(?:binom|frac)\{(\d+)\}\{(\d+)\}', r'\1 \2', t)
    t = _re.sub(r'(\d)\s?[–]\s?(\d)', r'\1 \2', t)          # ranges like 0–2
    t = REF.sub(' ', t)
    t = _re.sub(r'log_\d+|log_\{?\d+\}?|2\^\{?\d+\}?|\d+\^\d+|a_\d|b_\{?i\+1\}?|base[- ]\d+', ' ', t)   # notation checked separately
    t = _re.sub(r'\d+!|n\s?-\s?1|i\s?\+\s?1', ' ', t)
    for m in _re.finditer(r'(?<![\w.])(\d+(?:\.\d+)?)(?![\w])', t):
        v = float(m.group(1)) if '.' in m.group(1) else int(m.group(1))
        if v not in VER and not any(isinstance(x, (int, float)) and x == v for x in VER):
            bad.append((m.group(1), t[max(0, m.start() - 40):m.end() + 40]))
assert not bad, '\n'.join(map(str, bad))
print('exercise numbers verified:', len(VER), 'values over', len(chunks), 'text blocks')
print('all numbers OK')
