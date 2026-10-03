from itertools import permutations


def permutation_sort_counted(a):
    comparisons = 0
    for candidate in permutations(a):
        ok = True
        for i in range(len(candidate) - 1):
            comparisons += 1
            if candidate[i + 1] < candidate[i]:
                ok = False
                break
        if ok:
            return list(candidate), comparisons


def rank_sort_counted(a):
    n = len(a)
    rank = [0] * n
    comparisons = 0
    for i in range(n):
        for j in range(i + 1, n):
            comparisons += 1
            if a[j] < a[i]:
                rank[i] += 1
            else:
                rank[j] += 1
    b = [None] * n
    for i in range(n):
        b[rank[i]] = a[i]
    return b, comparisons


print(permutation_sort_counted([4, 3, 2, 1]))   # ([1, 2, 3, 4], 40)
print(rank_sort_counted([4, 3, 2, 1]))          # ([1, 2, 3, 4], 6)
