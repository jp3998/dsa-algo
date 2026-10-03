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
