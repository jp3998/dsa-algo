from itertools import permutations


def is_sorted_by(xs, before):
    """The definition: no pair of positions i < j has xs[j] before xs[i]."""
    n = len(xs)
    for i in range(n):
        for j in range(i + 1, n):
            if before(xs[j], xs[i]):
                return False
    return True


def is_sorted_neighbours(xs, before):
    """Lemma 11: equivalent to is_sorted_by when `before` is a strict weak ordering."""
    for i in range(len(xs) - 1):
        if before(xs[i + 1], xs[i]):
            return False
    return True


def count_sorted(items, before):
    """e(P) by brute force: tries all n! arrangements, so keep n small."""
    return sum(1 for p in permutations(items) if is_sorted_by(p, before))
