"""The 7 presets of Fig. 1, as (name, values, before) and the verdict as CPython prints it."""
import json, sys
from listing2 import check_strict_weak

nan = float("nan")
beats = {("rock", "scissors"), ("scissors", "paper"), ("paper", "rock")}

PRESETS = [
    ("a < b", [3, 1, 2, 5], lambda a, b: a < b),
    ("len", ["pear", "fig", "kiwi", "plum", "apple"], lambda a, b: len(a) < len(b)),
    ("tolerance", [0.0, 0.6, 1.2, 1.8], lambda a, b: False if abs(a - b) < 1 else a < b),
    ("nan", [1.0, nan, 2.0], lambda a, b: a < b),
    ("beats", ["rock", "paper", "scissors"], lambda a, b: (a, b) in beats),
    ("subset", [{1}, {2}, {1, 2}, {3}], lambda a, b: a < b),
    ("concat", ["3", "30", "34", "5", "9"], lambda a, b: a + b > b + a),
]

def verdict_repr(v):
    return "None" if v is None else repr(v)

if __name__ == "__main__":
    out = {name: verdict_repr(check_strict_weak(vals, bf)) for name, vals, bf in PRESETS}
    json.dump(out, sys.stdout)
