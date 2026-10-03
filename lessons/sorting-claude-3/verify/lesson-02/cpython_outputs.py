"""Re-runs every CPython output quoted in lesson 2 and asserts it equals the text on the page."""
import math, sys, subprocess, os
from functools import cmp_to_key

here = os.path.dirname(os.path.abspath(__file__))
assert sys.version_info[:2] == (3, 12), sys.version

def show(label, got, expected):
    print(f"{label}: {got}")
    assert got == expected, (label, got, expected)

def run(path):
    return subprocess.run([sys.executable, os.path.join(here, path)], capture_output=True, text=True, check=True).stdout

# Listings 1, 3, 4 (their trailing comments are the quoted outputs)
show("Listing 1", run("listing1.py").strip(), "[Box(1), Box(2), Box(3)]")
show("Listing 3", run("listing3.py").strip(), "[1.0, 2.0, 3.0, nan]")
show("Listing 4", run("listing4.py").split(), ["9534330", "0"])

# §02 stability
show("len key", repr(sorted(["pear", "fig", "kiwi", "plum", "apple"], key=len)), "['fig', 'pear', 'kiwi', 'plum', 'apple']")

# §03 tuple keys
recs = [(90, "Lee"), (85, "Ana"), (90, "Bo"), (70, "Cy")]
show("neg key", repr(sorted(recs, key=lambda t: (-t[0], t[1]))), "[(90, 'Bo'), (90, 'Lee'), (85, 'Ana'), (70, 'Cy')]")
show("reverse", repr(sorted(recs, key=lambda t: (t[0], t[1]), reverse=True)), "[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]")
try:
    sorted([(2, {"id": 1}), (2, {"id": 7})])
    raise SystemExit("no TypeError")
except TypeError as e:
    show("dict TypeError", f"TypeError: {e}", "TypeError: '<' not supported between instances of 'dict' and 'dict'")

# Checkpoint 1
words = ['pear', 'fig', 'kiwi', 'plum', 'apple']
show("cp1 a", repr(sorted(words, key=len)), "['fig', 'pear', 'kiwi', 'plum', 'apple']")
show("cp1 b", repr(sorted(words, key=lambda w: (len(w), w))), "['fig', 'kiwi', 'pear', 'plum', 'apple']")
show("cp1 c", repr(sorted(words, key=lambda w: (w, len(w)))), "['apple', 'fig', 'kiwi', 'pear', 'plum']")
assert sorted(words, key=lambda w: (w, len(w))) == sorted(words)
try:
    sorted(words, key=lambda w: len(w) + w); raise SystemExit("no TypeError")
except TypeError as e:
    print("len(w)+w:", e)
try:
    sorted(recs, key=lambda t: (-t[0], -t[1])); raise SystemExit("no TypeError")
except TypeError as e:
    print("-t[1]:", e)
show("cp1 Q2 (t0,t1) reverse", repr(sorted(recs, key=lambda t: (t[0], t[1]), reverse=True)),
     "[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]")
# key=t[0], reverse=True: equal scores keep INPUT order?  (reverse preserves stability)
show("cp1 Q2 key=t0 reverse", repr(sorted(recs, key=lambda t: t[0], reverse=True)), "[(90, 'Lee'), (90, 'Bo'), (85, 'Ana'), (70, 'Cy')]")

# §05 NaN
nan = float("nan")
def rs(xs): return repr(sorted(xs))
show("nan 1", rs([3.0, nan, 1.0, 2.0]), "[3.0, nan, 1.0, 2.0]")
show("nan 2", rs([nan, 3.0, 1.0, 2.0]), "[nan, 1.0, 2.0, 3.0]")
show("nan 3", rs([3.0, 1.0, nan, 2.0]), "[1.0, 2.0, 3.0, nan]")
show("max 1", repr(max([nan, 1.0, 2.0])), "nan")
show("max 2", repr(max([1.0, nan, 2.0])), "2.0")
assert not (nan < 1.0) and not (1.0 < nan)

# Table 2
def tol(a, b): return 0 if abs(a - b) < 1 else (-1 if a < b else 1)
beats = {("rock", "scissors"), ("scissors", "paper"), ("paper", "rock")}
def rps(a, b): return -1 if (a, b) in beats else (1 if (b, a) in beats else 0)
show("T2 r1", repr(sorted([3.0, 2.4, 1.8, 1.2, 0.6], key=cmp_to_key(tol))), "[3.0, 2.4, 1.8, 1.2, 0.6]")
show("T2 r2", repr(sorted([2.2, 1.0, 1.5], key=cmp_to_key(tol))), "[1.0, 2.2, 1.5]")
show("T2 r3", repr(sorted(['rock', 'paper', 'scissors'], key=cmp_to_key(rps))), "['scissors', 'paper', 'rock']")
show("T2 r4", repr(sorted(['rock', 'scissors', 'paper'], key=cmp_to_key(rps))), "['rock', 'scissors', 'paper']")
show("T2 r5", repr(sorted([{1, 2}, {3}, {1}])), "[{1, 2}, {3}, {1}]")
for inp in ([3.0, 2.4, 1.8, 1.2, 0.6], [2.2, 1.0, 1.5]):
    assert sorted(sorted(inp, key=cmp_to_key(tol))) == sorted(inp)  # rearrangement
# facts in the explanation column
assert tol(3.0, 0.6) == 1 and abs(3.0 - 0.6) > 1 and all(abs(a - b) < 1 for a, b in zip([3.0, 2.4, 1.8, 1.2], [2.4, 1.8, 1.2, 0.6]))
assert ("rock", "scissors") in beats and ("paper", "rock") in beats
assert {1} < {1, 2}
# "nothing (lucky): a valid order of the partial order": 2.2 > 1.0 by 1.2 >= 1, so 1.0 must precede 2.2; 1.5 ties both
assert tol(1.0, 2.2) == -1 and tol(1.0, 1.5) == 0 and tol(1.5, 2.2) == 0

# Listing 3 / bucket
def bucket(x, eps=1.0): return round(x / eps)
print("bucket 0.49, 0.51, 1.49:", bucket(0.49), bucket(0.51), bucket(1.49))
assert bucket(0.49) != bucket(0.51) and bucket(0.51) == bucket(1.49)

# Checkpoint 2
assert tol(0.6, 3.0) == -1 and abs(3.0 - 0.6) >= 1
def by_value(a, b): return a < b
show("cp2 b", repr(sorted([3, 1, 2], key=cmp_to_key(by_value))), "[3, 1, 2]")
assert isinstance(True < 0, bool) and not (by_value(1, 2) < 0)
assert abs(3.0 - 2.4) < 1 and abs(2.4 - 1.8) < 1 and abs(1.8 - 3.0) >= 1

# §06
assert sorted(["3", "30", "34", "5", "9"], reverse=True) == ["9", "5", "34", "30", "3"]
assert "".join(["9", "5", "34", "30", "3"]) == "9534303" and int("9534303") < 9534330
assert "30" > "3" and 330 > 303
# E1
show("E1", None or __import__("subprocess").run([sys.executable, "-c", open(os.path.join(here, "listing4.py")).read().split("print(")[0] + "print(largest_number([12, 121]))"], capture_output=True, text=True).stdout.strip(), "12121")
assert int("12" + "121") == 12121 and int("121" + "12") == 12112 and 12121 > 12112
# E2: sets; tuples of dicts
try:
    [(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})].sort(); raise SystemExit("no TypeError")
except TypeError as e:
    print("E2:", e)
t = [(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})]
t.sort(key=lambda t: t[0]); print(t)
print("OK cpython_outputs")
