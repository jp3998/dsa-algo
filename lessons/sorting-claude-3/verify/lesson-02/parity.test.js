'use strict';
// Parity: JS port of Listing 2 (lesson-02.js) vs instrumented CPython (dump_traces.py).
const assert = require('assert');
const { execFileSync } = require('child_process');
const path = require('path');
const L = require('../../lesson-02.js');

const py = JSON.parse(execFileSync('python3', [path.join(__dirname, 'dump_traces.py')], { maxBuffer: 1 << 28 }).toString());
const names = ['a < b', 'len', 'tolerance', 'nan', 'beats', 'subset', 'concat'];
assert.strictEqual(L.PRESETS.length, 7);

L.PRESETS.forEach((p, i) => {
  const log = [];
  const before = (a, b) => { const r = !!p.before(a, b); log.push([L.repr(p.kind, a), L.repr(p.kind, b), r]); return r; };
  const v = L.verdictRepr(p.kind, L.check_strict_weak(p.values, before));
  const ref = py.presets[names[i]];
  assert.strictEqual(v, ref.verdict, 'verdict ' + names[i]);
  assert.deepStrictEqual(log, ref.log, 'comparison sequence ' + names[i]);
  console.log('preset', names[i].padEnd(10), v);
});
// expected verdicts quoted in the manuscript
const expect = ['None', 'None', "('ties not transitive', 0.0, 0.6, 1.2)", "('ties not transitive', 1.0, nan, 2.0)",
  "('not transitive', 'rock', 'scissors', 'paper')", "('ties not transitive', {1}, {3}, {1, 2})", 'None'];
L.PRESETS.forEach((p, i) => assert.strictEqual(L.verdictRepr(p.kind, L.runPreset(p)), expect[i]));

let nfail = 0;
py.random.forEach((c, t) => {
  const n = c.M.length, vals = [], log = [];
  for (let i = 0; i < n; i++) vals.push(i);
  const before = (a, b) => { const r = !!c.M[a][b]; log.push([String(a), String(b), r]); return r; };
  const res = L.check_strict_weak(vals, before);
  const v = res === null ? 'None' : '(' + ["'" + res[0] + "'"].concat(res.slice(1).map(String)).join(', ') + ')';
  assert.strictEqual(v, c.verdict, 'random ' + t);
  assert.deepStrictEqual(log, c.log, 'random log ' + t);
  if (res) nfail++;
});
console.log('random relations:', py.random.length, 'identical traces;', nfail, 'with counterexamples,', py.random.length - nfail, 'passing');
assert(nfail > 20 && nfail < py.random.length - 20);
console.log('PARITY OK');
