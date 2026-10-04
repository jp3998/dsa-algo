"""Numeric claims of lesson 2: f(a) values, the example order, largest_number outputs,
key-vs-comparator equivalence on 2000 random lists, exchange-argument brute force, float pitfall."""
import random, itertools, os, sys
from fractions import Fraction
from functools import cmp_to_key
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from listing2 import check_strict_weak

def f(a):
    s = str(a)
    return Fraction(a, 10 ** len(s) - 1)

assert f(3) == Fraction(1, 3) and f(30) == Fraction(30, 99) and f(34) == Fraction(34, 99)
assert f(12) == Fraction(12, 99) == Fraction(4, 33) == f(1212) == Fraction(1212, 9999)
assert f(9) == 1 and f(5) == Fraction(5, 9)
assert 12121 > 12112 and int("12" "1212") == int("1212" "12") == 121212   # 12|1212 = 1212|12
assert round(float(f(12)), 4) == 0.1212 and round(float(f(121)), 4) == 0.1211 and f(12) > f(121)

order = sorted([3, 30, 34, 5, 9], key=f, reverse=True)
assert order == [9, 5, 34, 3, 30], order
assert "".join(map(str, order)) == "9534330"
assert f(5) > f(34) > f(3) > f(30)
assert Fraction(34, 99) > Fraction(1, 3) > Fraction(30, 99)

def cmp(a, b):
    if a + b > b + a: return -1
    if a + b < b + a: return 1
    return 0

def largest_cmp(nums):
    strs = sorted((str(x) for x in nums), key=cmp_to_key(cmp))
    r = "".join(strs)
    return "0" if r[0] == "0" else r

def largest_key(nums):
    strs = sorted((str(x) for x in nums), key=lambda s: Fraction(int(s), 10 ** len(s) - 1), reverse=True)
    r = "".join(strs)
    return "0" if r[0] == "0" else r

assert largest_cmp([3, 30, 34, 5, 9]) == largest_key([3, 30, 34, 5, 9]) == "9534330"
assert largest_cmp([0, 0]) == largest_key([0, 0]) == "0"
assert largest_cmp([12, 121]) == largest_key([12, 121]) == "12121"

rng = random.Random(20260203)
for trial in range(2000):
    n = rng.randint(1, 8)
    nums = []
    for _ in range(n):
        d = rng.choice([1, 1, 2, 2, 3, 5, 10, 20])
        nums.append(rng.choice([0, rng.randint(0, 10 ** d - 1), rng.randint(10 ** (d - 1), 10 ** d - 1) if d > 1 else rng.randint(0, 9)]))
    a, b = largest_cmp(nums), largest_key(nums)
    assert a == b, (nums, a, b)
    if n <= 6:   # Theorem 4: sorted arrangement is the maximum (brute force)
        best = max(int("".join(map(str, p))) for p in itertools.permutations(nums))
        assert int(a) == best, (nums, a, best)
# the key rule and the comparator agree pairwise, ties included
for _ in range(20000):
    a, b = rng.randint(0, 10 ** 6), rng.randint(0, 10 ** 6)
    sa, sb = str(a), str(b)
    assert (sa + sb > sb + sa) == (f(a) > f(b)) and (sa + sb == sb + sa) == (f(a) == f(b))
# the concat preset passes the checker
assert check_strict_weak(["3", "30", "34", "5", "9"], lambda a, b: a + b > b + a) is None

# float pitfall: two different Fraction keys can round to the same float
found = None
for _ in range(10000):
    d = 17
    a = rng.randint(10 ** (d - 1), 10 ** d - 2)
    b = a + 1
    if f(a) != f(b) and float(f(a)) == float(f(b)):
        found = (a, b); break
assert found, "no float collision found"
print("float collision example:", found)
print("OK check_numbers: 2000 random lists agree")

# ---------------------------------------------------------------------------------------------
# v3 prose and the retrofitted exercise feedback / hints / worked solutions.
# §01: "n(n-1)/2 pairs, about half a million for 1000 items"
assert 1000 * 999 // 2 == 499500 and abs(499500 - 500000) / 500000 < 0.01

# Prerequisite Q1 ("noticeably smaller": x < y iff y - x > 1) on 1.0, 1.5, 2.2
NS = lambda x, y: y - x > 1
D = Fraction
vals = [D(10, 10), D(15, 10), D(22, 10)]
assert D(22, 10) - D(15, 10) == D(7, 10) and D(15, 10) - D(10, 10) == D(5, 10) and D(22, 10) - D(10, 10) == D(12, 10)
related = [(x, y) for x in vals for y in vals if NS(x, y)]
assert related == [(D(1), D(22, 10))]                     # the only requirement: 1.0 before 2.2
def is_sorted(row, before):  return not any(before(row[j], row[i]) for i in range(len(row)) for j in range(i + 1, len(row)))
def neighbour_ok(row, before): return not any(before(row[i + 1], row[i]) for i in range(len(row) - 1))
fools = [r for r in itertools.permutations(vals) if neighbour_ok(r, NS) and not is_sorted(r, NS)]
assert fools == [(D(22, 10), D(15, 10), D(1))]            # exactly option (a): 2.2, 1.5, 1.0
for row, sortd, nb in [((D(1), D(15, 10), D(22, 10)), True, True), ((D(22, 10), D(1), D(15, 10)), False, False),
                       ((D(15, 10), D(1), D(22, 10)), True, True)]:
    assert is_sorted(row, NS) == sortd and neighbour_ok(row, NS) == nb
assert 2.2 - 1.5 < 1 and 1.5 - 1.0 < 1 and 2.2 - 1.0 > 1  # same verdicts in floats

# Prerequisite Q2: request (B) by age; tiers, a chain, minimal elements, the set below Ana / Ben
age = {"Ana": 30, "Ben": 25, "Cy": 30, "Dee": 22}
B = lambda x, y: age[x] < age[y]
tiers = sorted({tuple(sorted(p for p in age if age[p] == a)) for a in age.values()}, key=lambda t: age[t[0]])
assert tiers == [("Dee",), ("Ben",), ("Ana", "Cy")]
assert B("Dee", "Ben") and B("Ben", "Ana") and B("Dee", "Ana")                     # chain Dee < Ben < Ana
assert [p for p in age if not any(B(q, p) for q in age)] == ["Dee"]                # minimal = first tier
assert sorted(p for p in age if B(p, "Ana")) == ["Ben", "Dee"] and B("Dee", "Ben")  # below Ana: related pair
assert [p for p in age if B(p, "Ben")] == ["Dee"]                                  # below Ben happens to be a tier
assert all(not B(p, q) for p in ("Ana", "Cy") for q in ("Ana", "Cy"))             # Ana, Cy tie
# every member of an earlier tier before every member of a later one
assert all(B(x, y) for i, s in enumerate(tiers) for t in tiers[i + 1:] for x in s for y in t)

# CP2 Q3: tolerance comparator: "before" is transitive, ties are not; distances quoted
def tol_before(a, b): return not abs(a - b) < 1 and a < b
grid = [D(k, 10) for k in range(0, 41)]
assert all(tol_before(a, c) for a in grid for b in grid for c in grid if tol_before(a, b) and tol_before(b, c))
assert all(D(k + 6, 10) - D(k, 10) == D(6, 10) for k in (6, 12, 18, 24))            # neighbours 0.6 apart
assert D(30, 10) - D(6, 10) == D(24, 10) and tol_before(0.6, 3.0)                  # 0.6 before 3.0
assert all(abs(a - b) < 1 for a, b in [(3.0, 2.4), (2.4, 1.8), (1.8, 1.2), (1.2, 0.6)])
assert tol_before(1.8, 3.0) and not tol_before(2.4, 3.0) and not tol_before(1.8, 2.4)

# E1: 12121 vs 12112 (first three digits agree, fourth 2 > 1); f(12) vs f(121) decimal expansions
a, b = "12121", "12112"
k = next(i for i in range(5) if a[i] != b[i])
assert k == 3 and a[:3] == b[:3] == "121" and (a[k], b[k]) == ("2", "1") and len(a) == len(b) == 5
assert f(12) == Fraction(12, 99) and f(121) == Fraction(121, 999) and f(12) > f(121)
def decimals(fr, n):
    out = []
    for _ in range(n):
        fr *= 10; d = int(fr); out.append(str(d)); fr -= d
    return "".join(out)
assert decimals(f(12), 6) == "121212" and decimals(f(121), 6) == "121121"
assert decimals(f(3), 3) == "333" and decimals(f(30), 4) == "3030" and decimals(f(34), 4) == "3434" and decimals(f(5), 3) == "555"

# E4: algebra steps on many pairs; 3|30 = 3*100 + 30
def L(x): return len(str(x))
assert 3 * 10 ** L(30) + 30 == 330 == int("3" + "30")
for _ in range(20000):
    x, y = rng.randint(0, 10 ** 7), rng.randint(0, 10 ** 7)
    xy, yx = int(str(x) + str(y)), int(str(y) + str(x))
    assert xy == x * 10 ** L(y) + y and yx == y * 10 ** L(x) + x                      # step A
    assert (xy > yx) == (x * (10 ** L(y) - 1) > y * (10 ** L(x) - 1))               # step B
    assert (10 ** L(x) - 1) * (10 ** L(y) - 1) > 0                                   # step C: positive
    assert (xy > yx) == (f(x) > f(y))                                                # step C result
# false steps refuted by 3 and 30
assert 3 < 30 and 330 > 303 and "30" > "3" and 303 < 330

# E5: 12 and 1212 tie; lesson 1's tasks: d, a, b, c unsorted with no out-of-order neighbour pair
assert int("12" + "1212") == int("1212" + "12") == 121212 and f(12) == f(1212)
tasks = {("a", "c"), ("b", "c"), ("b", "d")}
TB = lambda x, y: (x, y) in tasks
row = ["d", "a", "b", "c"]
assert neighbour_ok(row, TB) and not is_sorted(row, TB) and TB("b", "d")

# E3: proper subset is irreflexive and transitive on all subsets of {1, 2, 3}; ties not transitive
subsets = [set(c) for r in range(4) for c in itertools.combinations([1, 2, 3], r)]
assert not any(s < s for s in subsets)
assert all(a < c for a in subsets for b in subsets for c in subsets if a < b and b < c)
tie = lambda x, y: not x < y and not y < x
assert tie({1}, {3}) and tie({3}, {1, 2}) and {1} < {1, 2}
print("OK check_numbers: v3 prose and exercise explanations")
