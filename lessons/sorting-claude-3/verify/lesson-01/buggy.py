def is_sorted_neighbours(xs, before):
    for i in range(len(xs) - 2):
        if before(xs[i + 1], xs[i]):
            return False
    return True
