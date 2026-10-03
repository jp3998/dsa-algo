import json, random, sys
sys.path.insert(0, '.')
from listing1 import is_sorted_by, is_sorted_neighbours, count_sorted

needs = {("a", "c"), ("b", "c"), ("b", "d")}
def task_before_raw(x, y): return (x, y) in needs
noticeably_raw = lambda x, y: y - x > 1

def run(fn, xs, rel):
    log = []
    def before(x, y):
        r = rel(x, y); log.append([x, y, r]); return r
    res = fn(xs, before)
    return {"res": res, "log": log}

rng = random.Random(2024)
cases = []
for fn_name, fn in (("by", is_sorted_by), ("nb", is_sorted_neighbours)):
    inputs = [[], ["a"], list("abcd"), list("dcba"), list("dabc")]
    for _ in range(40):
        p = list("abcd"); rng.shuffle(p); inputs.append(p)
    for xs in inputs:
        cases.append({"fn": fn_name, "rel": "task", "xs": xs, **run(fn, xs, task_before_raw)})
    finputs = [[], [1.0], [1.0, 1.5, 2.2], [2.2, 1.5, 1.0]]
    for _ in range(60):
        finputs.append([round(rng.uniform(0, 4), 1) for _ in range(rng.randint(0, 6))])
    for xs in finputs:
        cases.append({"fn": fn_name, "rel": "nb", "xs": xs, **run(fn, xs, noticeably_raw)})
# count_sorted
cnt = []
for items, rel, name in (("abcd", task_before_raw, "task"), ("abc", task_before_raw, "task"), ("", task_before_raw, "task"), ("a", task_before_raw, "task"), ([1, 2, 3, 4, 5], noticeably_raw, "nb")):
    log = []
    def before(x, y, rel=rel, log=log):
        r = rel(x, y); log.append([x, y, r]); return r
    cnt.append({"items": list(items), "rel": name, "res": count_sorted(items, before), "log": log})
json.dump({"cases": cases, "counts": cnt}, sys.stdout)
