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

# ---------------------------------------------------------------------------------------------
# Exercise feedback, hints and worked solutions (v3 retrofit): every Python output they quote,
# and every claim about WHICH comparisons CPython makes (logged by instrumenting __lt__ / cmp).
class Logged:
    log = []
    def __init__(self, v): self.v = v
    def __lt__(self, other):
        r = self.v < other.v
        Logged.log.append((self.v, other.v, r))
        return r

def logged_sort(xs):
    Logged.log = []
    return [o.v for o in sorted(Logged(x) for x in xs)], Logged.log

# NaN reveal / predict: the sort checks the three neighbour pairs only, all "not out of order"
out, log = logged_sort([3.0, nan, 1.0, 2.0])
assert repr(out) == "[3.0, nan, 1.0, 2.0]"
assert [(repr(a), repr(b), r) for a, b, r in log] == [("nan", "3.0", False), ("1.0", "nan", False), ("2.0", "1.0", False)], log
print("nan comparisons:", log)

# CP2 Q3 + §05 prose: tolerance sort makes exactly four comparisons, one per neighbour pair,
# all ties; 3.0 and 0.6 are never compared.
tlog = []
def tol_logged(a, b):
    r = tol(a, b); tlog.append((a, b, r)); return r
show("CP2 Q3 output", repr(sorted([3.0, 2.4, 1.8, 1.2, 0.6], key=cmp_to_key(tol_logged))), "[3.0, 2.4, 1.8, 1.2, 0.6]")
assert tlog == [(2.4, 3.0, 0), (1.8, 2.4, 0), (1.2, 1.8, 0), (0.6, 1.2, 0)], tlog
assert all({a, b} != {3.0, 0.6} for a, b, _ in tlog)
print("tolerance comparisons:", tlog)

# CP2 Q4 worked solution: exactly two questions, by_value(1, 3) -> True, by_value(2, 1) -> False;
# the wrapper tests result < 0, which is False for both bools.
blog = []
def by_value_logged(a, b):
    r = a < b; blog.append((a, b, r)); return r
show("CP2 Q4 output", repr(sorted([3, 1, 2], key=cmp_to_key(by_value_logged))), "[3, 1, 2]")
assert blog == [(1, 3, True), (2, 1, False)], blog
assert True == 1 and False == 0 and (True < 0) is False and (False < 0) is False and (0 < 0) is False
K = cmp_to_key(by_value)
assert all(not (K(a) < K(b)) for a in range(-3, 4) for b in range(-3, 4))   # no pair ever "before"
fixed = lambda a, b: -1 if a < b else (1 if b < a else 0)
show("CP2 Q4 fix", repr(sorted([3, 1, 2], key=cmp_to_key(fixed))), "[1, 2, 3]")
print("by_value comparisons:", blog)

# E3 worked solution: CPython asks {3} < {1, 2}? and {1} < {3}?, both False, nothing else.
out, log = logged_sort([{1, 2}, {3}, {1}])
assert out == [{1, 2}, {3}, {1}] and log == [({3}, {1, 2}, False), ({1}, {3}, False)], log
print("set comparisons:", log)

# E2 worked solution: three tuple comparisons; the third has equal priorities and reaches the dicts.
elog = []
class Tup:
    def __init__(self, t): self.t = t
    def __lt__(self, other):
        elog.append((self.t, other.t))
        return self.t < other.t
try:
    sorted(Tup(t) for t in [(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})])
    raise SystemExit("no TypeError")
except TypeError as e:
    assert str(e) == "'<' not supported between instances of 'dict' and 'dict'", e
assert elog == [((1, {"id": 2}), (2, {"id": 1})), ((2, {"id": 7}), (1, {"id": 2})), ((2, {"id": 7}), (2, {"id": 1}))], elog
assert ((1, {"id": 2}) < (2, {"id": 1})) is True and ((2, {"id": 7}) < (1, {"id": 2})) is False
print("E2 tuple comparisons:", elog)
t = [(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})]
t.sort(key=lambda t: t[0])
show("E2 fix key=t[0]", repr(t), "[(1, {'id': 2}), (2, {'id': 1}), (2, {'id': 7})]")
t = [(p, i, d) for i, (p, d) in enumerate([(2, {"id": 1}), (1, {"id": 2}), (2, {"id": 7})])]
t.sort()   # unique index tie-breaker: never reaches the dicts
assert [d["id"] for _, _, d in t] == [2, 1, 7]
sorted([(1, {"id": 1}), (2, {"id": 2}), (3, {"id": 3})])   # all-different priorities: no TypeError

# CP1 Q1 / Q2 feedback: exact TypeError messages and results
try:
    sorted(words, key=lambda w: len(w) + w); raise SystemExit("no TypeError")
except TypeError as e:
    show("cp1 Q1 (d) message", str(e), "unsupported operand type(s) for +: 'int' and 'str'")
try:
    sorted(recs, key=lambda t: (-t[0], -t[1])); raise SystemExit("no TypeError")
except TypeError as e:
    show("cp1 Q2 (c) message", str(e), "bad operand type for unary -: 'str'")
show("cp1 Q1 (c) alphabetical", repr(sorted(words, key=lambda w: (w, len(w)))), "['apple', 'fig', 'kiwi', 'pear', 'plum']")
assert [(len(w), w) for w in words] == [(4, 'pear'), (3, 'fig'), (4, 'kiwi'), (4, 'plum'), (5, 'apple')]
assert [(-t[0], t[1]) for t in recs] == [(-90, 'Lee'), (-85, 'Ana'), (-90, 'Bo'), (-70, 'Cy')]
assert -90 < -85 and 90 > 85

# E1 / E4 / E5 string facts
assert "121" > "12" and "30" > "3" and "3" + "30" == "330" and "30" + "3" == "303"
assert "12" + "1212" == "1212" + "12" == "121212"

print("OK cpython_outputs")
