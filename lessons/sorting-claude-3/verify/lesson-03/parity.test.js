// Parity test: JS sortedSet / checkSetInput vs Python sorted(set(a)).
const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');
const L03 = require(path.join(__dirname, '..', '..', 'lesson-03.js'));

// seeded PRNG (mulberry32)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(2026);
const cases = [[], [5], [1, 1], [2, 1, 2], [1, 2, 3], [3, 2, 1], [0, 0, 0], [-1, 0, -1, 5], [3, 1, 3, 2]];
for (let t = 0; t < 500; t++) {
  const n = Math.floor(r() * 9);
  cases.push(Array.from({ length: n }, () => Math.floor(r() * 9) - 3));
}
const py = spawnSync('python3', ['-c', 'import sys,json\nprint(json.dumps([sorted(set(a)) for a in json.load(sys.stdin)]))'],
  { input: JSON.stringify(cases), encoding: 'utf8' });
assert.strictEqual(py.status, 0, py.stderr);
const expected = JSON.parse(py.stdout);
cases.forEach((a, i) => assert.deepStrictEqual(L03.sortedSet(a), expected[i], JSON.stringify(a)));

// checker, with a minimal Course stub mirroring Course.parseArray (real one is exercised in the page check)
const course = require('fs').readFileSync(path.join(__dirname, '..', '..', 'assets', 'course.js'), 'utf8');
let parse = null;
try { const m = course.match(/function parseArray[\s\S]*?\n  }\n/); parse = new Function(m[0] + '; return parseArray;')(); } catch (e) { /* fall back */ }
assert(parse, 'could not extract parseArray');
globalThis.Course = { parseArray: parse };
cases.forEach((a, i) => {
  if (a.length > 8) return;
  const res = L03.checkSetInput(a.join(' '));
  const dup = new Set(a).size < a.length;
  assert.strictEqual(res.ok, dup, JSON.stringify(a));
  if (dup) assert(res.html.includes('[' + expected[i].join(', ') + ']'));
});
assert.strictEqual(L03.checkSetInput('1 2 3 4 5 6 7 8 9').ok, false);
assert.strictEqual(L03.checkSetInput('1.5 1.5').ok, false);
assert.strictEqual(L03.checkSetInput('abc').ok, false);
console.log('parity OK on', cases.length, 'cases');
