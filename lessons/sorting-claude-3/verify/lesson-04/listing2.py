def rank_sort(a):
    n = len(a)
    rank = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if a[j] < a[i]:      # one comparison per pair; the larger element earns a point
                rank[i] += 1
            else:
                rank[j] += 1
    b = [None] * n
    for i in range(n):
        b[rank[i]] = a[i]
    return b
