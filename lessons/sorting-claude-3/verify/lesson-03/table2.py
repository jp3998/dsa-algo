import random, sys, json
from listing1 import Counted, comparisons_used
res = {}
for n in (10, 100, 1000):
    rng = random.Random(2026 + n)
    rs = [comparisons_used(sorted, rng.sample(range(10**6), n)) for _ in range(20)]
    res[n] = dict(s=comparisons_used(sorted, list(range(n))), r=comparisons_used(sorted, list(range(n, 0, -1))),
                  mean=round(sum(rs)/20, 1), mn=min(rs), mx=max(rs))
    print(n, res[n])
print(sys.version)
json.dump(res, open('table2.json', 'w'))
