class Counted:
    """Wraps a value and counts every < comparison between wrapped values."""
    comparisons = 0

    def __init__(self, value):
        self.value = value

    def __lt__(self, other):
        Counted.comparisons += 1
        return self.value < other.value


def comparisons_used(sort_fn, data):
    Counted.comparisons = 0
    sort_fn([Counted(x) for x in data])
    return Counted.comparisons


print(comparisons_used(sorted, [1, 2, 3, 4, 5]))   # 4
