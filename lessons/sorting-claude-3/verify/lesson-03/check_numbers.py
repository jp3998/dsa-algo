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
print('all numbers OK')
