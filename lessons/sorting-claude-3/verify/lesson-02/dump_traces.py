"""Instrumented Python: runs Listing 2 on the 7 presets and on seeded random relations, logging every
before(a, b) call as (left, right, answer). Output JSON for parity.test.js."""
import json, random, sys
from presets import PRESETS, verdict_repr
from listing2 import check_strict_weak

def traced(before, name_of):
    log = []
    def b(x, y):
        r = bool(before(x, y))
        log.append([name_of(x), name_of(y), r])
        return r
    return b, log

out = {"presets": {}, "random": []}
for name, vals, bf in PRESETS:
    b, log = traced(bf, repr)
    out["presets"][name] = {"verdict": verdict_repr(check_strict_weak(vals, b)), "log": log}

rng = random.Random(7)
for t in range(400):
    n = rng.randint(0, 5)
    mode = rng.choice(["random", "key", "keyplus", "partial", "cycle"])
    if mode == "random":
        M = [[rng.random() < 0.4 for _ in range(n)] for _ in range(n)]
    elif mode == "key":       # strict weak ordering by key (may be total)
        ks = [rng.randint(0, 3) for _ in range(n)]
        M = [[ks[i] < ks[j] for j in range(n)] for i in range(n)]
    elif mode == "keyplus":   # key order with one flipped answer
        ks = [rng.randint(0, 3) for _ in range(n)]
        M = [[ks[i] < ks[j] for j in range(n)] for i in range(n)]
        if n:
            M[rng.randrange(n)][rng.randrange(n)] ^= True
    elif mode == "partial":   # random DAG closure
        M = [[False] * n for _ in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                M[i][j] = rng.random() < 0.4
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    if M[i][k] and M[k][j]:
                        M[i][j] = True
    else:
        M = [[(j - i) % n == 1 if n else False for j in range(n)] for i in range(n)]
    vals = list(range(n))
    b, log = traced(lambda x, y, M=M: M[x][y], repr)
    out["random"].append({"M": M, "verdict": verdict_repr(check_strict_weak(vals, b)), "log": log})
json.dump(out, sys.stdout)
