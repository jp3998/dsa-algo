"""Shared helpers: instrumented runs of Listing 1 (comparison log), independent knowledge classification."""
from itertools import permutations
import math

def instrumented(a):
    """Run Listing 1's logic, logging each comparison as (b[i+1], b[i], answer)."""
    log = []
    candidates = 0
    out = None
    for candidate in permutations(a):
        candidates += 1
        ok = True
        for i in range(len(candidate) - 1):
            ans = candidate[i + 1] < candidate[i]
            log.append((candidate[i + 1], candidate[i], ans))
            if ans:
                ok = False
                break
        if ok:
            out = list(candidate)
            break
    return out, candidates, log

def knowledge(a, log):
    """Independent classification (distinct values). For each comparison: status, e(P) after.
    e = number of rank patterns (permutations of the values) consistent with all outcomes so far
    (Theorem 3a). new iff pair not asked before and e decreases; implied iff not asked and e unchanged."""
    vals = sorted(a)
    patterns = list(permutations(vals))  # each pattern: a total order given as ranking list; use rank dict
    # a rank pattern assigns each element a distinct rank; element x has rank pos in tuple
    ranks = [{v: r for r, v in enumerate(p)} for p in patterns]
    asked = set()
    res = []
    cur = ranks
    for (x, y, ans) in log:
        pair = frozenset((x, y))
        before = len(cur)
        cur = [r for r in cur if (r[x] < r[y]) == ans]
        after = len(cur)
        if pair in asked:
            st = 'known'
        elif after < before:
            st = 'new'
        else:
            st = 'implied'
        asked.add(pair)
        res.append((st, after))
    return res
