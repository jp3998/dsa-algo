'use strict';
const assert = require('assert');
const { execFileSync } = require('child_process');
const path = require('path');
const L = require('../../lesson-01.js');
const data = JSON.parse(execFileSync('python3', [path.join(__dirname, 'trace.py')], { cwd: __dirname, maxBuffer: 1 << 28 }).toString());

const rels = { task: L.taskBefore, nb: (x, y) => y - x > 1 };
function traced(fn, xs, rel) {
  const log = [];
  const before = (x, y) => { const r = rel(x, y); log.push([x, y, r]); return r; };
  return { res: fn(xs, before), log };
}
let n = 0;
for (const c of data.cases) {
  const fn = c.fn === 'by' ? L.isSortedBy : L.isSortedNeighbours;
  const got = traced(fn, c.xs.slice(), rels[c.rel]);
  assert.deepStrictEqual(got.log, c.log, 'log ' + JSON.stringify(c));
  assert.strictEqual(got.res, c.res);
  n++;
}
for (const c of data.counts) {
  const items = c.rel === 'nb' ? c.items : c.items.join('');
  const got = traced((xs, b) => L.countSorted(xs, b), items, rels[c.rel]);
  assert.deepStrictEqual(got.log, c.log, 'count log');
  assert.strictEqual(got.res, c.res);
  n++;
}

// checker: every branch
const ck = L.checkNeighbourTrap;
let r;
for (const bad of ['', 'abc', 'abcde', 'aabc', 'abcx', '1234']) { r = ck(bad); assert(!r.ok && /exactly once/.test(r.html), bad); }
r = ck('dabc'); assert(!r.ok && /example above/.test(r.html));
r = ck('D, A, B, C'); assert(!r.ok && /example above/.test(r.html));
for (const v of ['abcd', 'abdc', 'bacd', 'badc', 'bdac']) { r = ck(v); assert(!r.ok && /is valid/.test(r.html), v); }
r = ck('cabd'); assert(!r.ok && /neighbour test already catches/.test(r.html) && /<b>c<\/b> and <b>a<\/b> are neighbours and a \u227A c/.test(r.html), r.html);
// first out-of-order neighbour pair naming: 'dcba' -> (d,c)? c<d? no. c,b: b<c yes
r = ck('dcba'); assert(!r.ok && /<b>c<\/b> and <b>b<\/b> are neighbours and b ≺ c/.test(r.html), r.html);
r = ck('cbad'); assert(!r.ok && /<b>c<\/b> and <b>b<\/b>/.test(r.html));
// exact expected successes
assert(ck('bcda').ok && /three such arrangements are dabc, bcda and cdab/.test(ck('bcda').html));
assert(ck('cdab').ok);
// brute force: exactly dabc, bcda, cdab are ok:true overall except dabc (excluded by branch)
const all = L.permutations(['a', 'b', 'c', 'd']).map(p => p.join(''));
const oks = all.filter(s => ck(s).ok).sort();
assert.deepStrictEqual(oks, ['bcda', 'cdab']);
// named pairs in success message agree with an independent search
for (const s of oks) {
  const xs = s.split(''); let named = null;
  for (let i = 0; i < 4 && !named; i++) for (let j = i + 1; j < 4 && !named; j++) if (L.taskBefore(xs[j], xs[i])) named = [xs[j], xs[i]];
  assert(ck(s).html.indexOf('yet ' + named[0] + ' ≺ ' + named[1] + ' with ' + named[1] + ' earlier') >= 0, s);
}
// case-insensitivity / separators
assert(ck('B C D A').ok);
assert.strictEqual(L.countSorted('abcd', L.taskBefore), 5);
console.log('parity ok: ' + n + ' trace comparisons, checker branches ok');
