import random
from collections import Counter


def is_sorted(b):
    """Condition 1: no neighbour pair out of order (uses only <)."""
    return all(not b[i + 1] < b[i] for i in range(len(b) - 1))


def is_permutation(a, b):
    """Condition 2: same elements, same multiplicities."""
    return Counter(a) == Counter(b)


def stress_test(sort_fn, trials=2000, max_n=8, seed=1):
    rng = random.Random(seed)
    for _ in range(trials):
        n = rng.randint(0, max_n)
        a = [rng.randint(0, 3) for _ in range(n)]      # small range: many duplicates
        b = sort_fn(list(a))
        if not (is_sorted(b) and is_permutation(a, b)):
            return a                                    # a failing input
    return None


print(stress_test(sorted))                       # None
print(stress_test(lambda a: sorted(set(a))))     # a failing input, e.g. one with a duplicate
