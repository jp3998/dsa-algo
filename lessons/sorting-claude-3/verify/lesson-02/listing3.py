import math

nan = float("nan")
data = [3.0, nan, 1.0, 2.0]
print(sorted(data, key=lambda x: (math.isnan(x), x)))   # [1.0, 2.0, 3.0, nan]


def bucket(x, eps=1.0):
    """Tolerance done safely: round to a grid, then compare exactly."""
    return round(x / eps)
