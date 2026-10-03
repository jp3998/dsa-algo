"""Reads JSON list of inputs on stdin; prints JSON list of results of the instrumented Python run."""
import json, sys
from common import instrumented, knowledge
from itertools import permutations

SRC = open('listing1.py').read()
CODE = compile(SRC, 'listing1.py', 'exec')
WATCH = {5, 6, 7, 8, 12, 13, 14}

def line_trace(a):
    ns = {}
    exec(CODE, ns)
    lines = []
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != 'listing1.py':
            return None
        def local(frame, event, arg):
            if event == 'line' and frame.f_lineno in WATCH:
                lines.append(frame.f_lineno)
            return local
        return local
    sys.settrace(tracer)
    try:
        ns['permutation_sort'](a)
    finally:
        sys.settrace(None)
    return lines

def main():
    cases = json.load(sys.stdin)
    res = []
    for a in cases['inputs']:
        out, cand, log = instrumented(a)
        r = {'out': out, 'candidates': cand, 'log': [[x, y, bool(z)] for x, y, z in log]}
        if len(set(a)) == len(a) and len(a) <= 6:
            r['know'] = [[s, e] for s, e in knowledge(a, log)]
        if cases.get('lines') and len(a) <= 6:
            r['lines'] = line_trace(a)
        res.append(r)
    perms = {}
    for n in range(0, 7):
        perms[str(n)] = [list(p) for p in permutations(range(n))]
    res_all = {'results': res, 'perms': perms}
    if 'permInputs' in cases:
        res_all['permsVals'] = [[list(p) for p in permutations(a)] for a in cases['permInputs']]
    json.dump(res_all, sys.stdout)
main()
