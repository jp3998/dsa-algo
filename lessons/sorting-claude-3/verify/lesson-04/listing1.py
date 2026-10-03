from itertools import permutations


def is_sorted(b):
    for i in range(len(b) - 1):
        if b[i + 1] < b[i]:
            return False
    return True


def permutation_sort(a):
    for candidate in permutations(a):
        if is_sorted(candidate):
            return list(candidate)
