'use strict';
// Run: node parity.test.js   (spawns python3 py_dump.py; compares the JS port with the instrumented Python)
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const L04 = require('../../lesson-04.js');

function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(20260404);
function sample(n) { const pool = []; for (let v = 0; v < 100; v++) pool.push(v); for (let k = 99; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; } return pool.slice(0, n); }

const inputs = [];
for (let n = 0; n <= 6; n++) {
  for (let t = 0; t < 25; t++) inputs.push(sample(n));
  const asc = Array.from({ length: n }, (_, k) => k + 1);
  inputs.push(asc, asc.slice().reverse());
}
const edge = [[], [7], [5, 5, 5], [2, 1, 2], [2, 2, 1], [1, 1], [3, 1, 3, 1], [1, 3, 2], [2, 1, 3], [4, 3, 2, 1], [3, 1, 2], [2, 3, 1], [2, 3, 4, 1], [1, 4, 3, 2]];
for (let t = 0; t < 40; t++) { const n = Math.floor(rnd() * 7); inputs.push(Array.from({ length: n }, () => Math.floor(rnd() * 3))); }  // duplicates
inputs.push(...edge);
const permInputs = [[], [9], [3, 1, 2], [5, 5, 5], [2, 1, 2, 1], [8, 6, 7, 5, 3], sample(6)];

const py = spawnSync('python3', ['py_dump.py'], { cwd: __dirname, input: JSON.stringify({ inputs, lines: true, permInputs }), maxBuffer: 1 << 28 });
if (py.status !== 0) { console.error(py.stderr.toString()); process.exit(1); }
const P = JSON.parse(py.stdout.toString());

// permutations order, n = 0..6 (positions) and over assorted value lists (incl. duplicates)
for (let n = 0; n <= 6; n++) {
  const mine = [...L04.permutations(Array.from({ length: n }, (_, k) => k))];
  assert.deepStrictEqual(mine, P.perms[String(n)], 'permutations n=' + n);
}
permInputs.forEach((a, k) => assert.deepStrictEqual([...L04.permutations(a)], P.permsVals[k], 'permutations of ' + a));

let maxSteps = 0, checkedKnow = 0, checkedLines = 0;
inputs.forEach((a, k) => {
  const r = L04.run(a, a.length <= 6);
  const p = P.results[k];
  const tag = JSON.stringify(a);
  assert.deepStrictEqual(r.out === undefined ? null : r.out, p.out, 'output ' + tag);
  assert.strictEqual(r.candidates, p.candidates, 'candidates ' + tag);
  assert.strictEqual(r.comparisons, p.log.length, 'comparisons ' + tag);
  assert.deepStrictEqual(r.log.map(x => [x[0], x[1], x[2]]), p.log, 'comparison sequence ' + tag);
  if (p.know) {
    assert.deepStrictEqual(r.log.map(x => [x[3], x[4]]), p.know, 'knowledge ' + tag);
    checkedKnow++;
  }
  if (p.lines) {
    const lines = r.steps.map(s => s.line);
    assert.deepStrictEqual(lines, p.lines, 'executed lines ' + tag);
    checkedLines++;
    maxSteps = Math.max(maxSteps, lines.length);
    // counters never decrease and end at the totals; last step is line 14
    const c = r.steps[r.steps.length - 1].counters;
    assert.strictEqual(c.comparisons, r.comparisons); assert.strictEqual(c.candidates, r.candidates);
    assert.strictEqual(r.steps[r.steps.length - 1].line, 14);
  }
});

// trace sizes (stepper cap is 20 000)
for (let n = 0; n <= 6; n++) {
  const rev = Array.from({ length: n }, (_, k) => n - k);
  const steps = L04.trace(rev).length;
  console.log('reversed n=' + n + ': ' + steps + ' steps');
  assert(steps < 20000);
}

// the three knowledge cases from the manuscript
function know(a) { const r = L04.run(a, false); return r.log; }
let lg = know([3, 1, 2]);
assert.strictEqual(lg.length, 6); assert.strictEqual(lg.filter(x => x[3] === 'new').length, 3); assert.strictEqual(lg.filter(x => x[3] === 'known').length, 3);
assert.strictEqual(lg.findIndex(x => x[4] === 1) + 1, 5);
lg = know([2, 3, 1]); assert.strictEqual(lg.length, 7); assert.strictEqual(lg.findIndex(x => x[4] === 1) + 1, 3);
lg = know([4, 3, 2, 1]); assert.strictEqual(lg.length, 40);
assert.strictEqual(lg.filter(x => x[3] === 'new').length, 6); assert.strictEqual(lg.filter(x => x[3] === 'known').length, 34);
assert.strictEqual(lg.findIndex(x => x[4] === 1) + 1, 24);

// stepping back restores knowledge: the know state of every step is a pure function of the history prefix
{
  const steps = L04.trace([4, 3, 2, 1]);
  let comps = 0, wasted = 0;
  steps.forEach((s, k) => {
    if (s.line === 6) comps++;
    if (s.know.last) assert(s.know.last.k <= comps);
    assert(s.know.rels.length <= 6);
  });
  assert.strictEqual(steps[steps.length - 1].know.wasted, 34);
}

// listing text equals the Python file and the page
const l1 = fs.readFileSync(path.join(__dirname, 'listing1.py'), 'utf8').replace(/\n+$/, '');
assert.strictEqual(L04.LISTING1, l1);
const htmlPath = path.join(__dirname, '../../lesson-04.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const un = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const m = [...html.matchAll(/<pre class="py">([\s\S]*?)<\/pre>/g)].map(x => un(x[1]).replace(/\n+$/, ''));
  assert(m.includes(l1), 'Listing 1 on the page equals listing1.py');
  assert(m.includes(fs.readFileSync(path.join(__dirname, 'listing2.py'), 'utf8').replace(/\n+$/, '')), 'Listing 2 on page');
  const l3 = fs.readFileSync(path.join(__dirname, 'listing3.py'), 'utf8').replace(/\n+$/, '');
  assert(m.includes(l3), 'Listing 3 on page');
}

// checker
const c = L04.checkSevenCandidates;
assert(c('2 1 3 4').ok && /\(1, 0, 2, 3\)/.test(c('2 1 3 4').html));
assert(c('5, 4, 6, 7').ok);
assert(!c('1 2 3 4').ok && /number 1 in/.test(c('1 2 3 4').html));
assert(!c('4 3 2 1').ok && /number 24 in/.test(c('4 3 2 1').html));
assert(!c('1 2 3').ok && !c('1 1 2 3').ok && !c('1 a 2 3').ok && !c('').ok && !c('1.5 2 3 4').ok);
// every 4-permutation: ok iff a1 < a0 < a2 < a3
const perms4 = [...L04.permutations([0, 1, 2, 3])];
perms4.forEach(p => assert.strictEqual(c(p.join(' ')).ok, p[1] < p[0] && p[0] < p[2] && p[2] < p[3]));
// examined candidate number equals the lexicographic rank of the sorted positions
perms4.forEach(p => {
  const pos = L04.sortedPositions(p);
  const rank = perms4.findIndex(q => q.join() === pos.join()) + 1;
  assert.strictEqual(L04.run(p, false).candidates, rank);
});
// plot data equals plot_data.py
const pd = JSON.parse(fs.readFileSync(path.join(__dirname, 'plot_data.json'), 'utf8'));
assert.deepStrictEqual(L04.PLOT, pd);
console.log('PARITY OK: ' + inputs.length + ' inputs; knowledge checked on ' + checkedKnow + '; executed-line traces checked on ' + checkedLines + '; max steps ' + maxSteps);
