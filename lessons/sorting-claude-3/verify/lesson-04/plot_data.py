"""Fig. 2 data: exact T(n), n(n-1)/2, and 200 random samples per n (Listing 3's counter). Writes plot_data.json."""
import json, random, io, contextlib, importlib.util
from math import factorial
spec = importlib.util.spec_from_file_location('l3', 'listing3.py')
l3 = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(l3)
T = lambda n: sum(factorial(n) // factorial(j) for j in range(1, n))
out = {'T': [[n, T(n)] for n in range(1, 9)], 'pairs': [[n, n*(n-1)//2] for n in range(1, 9)], 'random': []}
for n in range(1, 9):
    rng = random.Random(4000 + n)
    cs = []
    for _ in range(200):
        a = rng.sample(range(100), n)
        res, c = l3.permutation_sort_counted(a)
        assert res == sorted(a)
        cs.append(c)
    assert max(cs) <= T(n) and min(cs) >= n - 1
    out['random'].append([n, round(sum(cs)/len(cs), 2), min(cs), max(cs)])
json.dump(out, open('plot_data.json', 'w'))
print(json.dumps(out))
