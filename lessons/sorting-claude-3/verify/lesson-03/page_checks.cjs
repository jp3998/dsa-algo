// Gates, per-answer feedback and KaTeX checks for lesson-03.html. Usage: node page_checks.cjs
const path = require('path');
const SCRATCH = process.env.SCRATCH || '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
const url = 'file://' + path.resolve(__dirname, '..', '..', 'lesson-03.html');
const problems = [];
const bad = (m) => { problems.push(m); console.log('FAIL', m); };
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const fresh = async () => { const p = await browser.newPage(); await p.goto(url, { waitUntil: 'load' }); await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto(url, { waitUntil: 'load' }); return p; };
  // Phase A: gates
  let p = await fresh();
  const gated = () => p.evaluate(() => ['s03', 's04', 's05'].map(i => document.getElementById(i).classList.contains('gated')));
  let g = await gated(); if (g.join() !== 'true,true,true') bad('gates not initially closed ' + g);
  const num = async (id, v) => { await p.evaluate((id) => document.querySelector('#' + id + ' input.txt').value = '', id); await p.type('#' + id + ' input.txt', String(v)); await p.click('#' + id + ' button.btn.primary'); };
  await num('l3-cp1-a', 36); await num('l3-cp1-b', 12);
  g = await gated(); if (g[0] !== true) bad('s03 opened early');
  await p.click('#l3-cp1-c .ex-options li:nth-child(2) .opt');
  g = await gated(); if (g.join() !== 'false,true,true') bad('after cp1 expected s03 open only: ' + g);
  await num('l3-cp2-a'.replace('a', 'a'), 1).catch(() => {});
  for (const id of ['l3-cp2-a', 'l3-cp2-b', 'l3-cp2-c']) await p.click('#' + id + ' .ex-options li:nth-child(1) .opt');
  g = await gated(); if (g.join() !== 'false,false,false') bad('after cp2 expected all open: ' + g);
  await p.close();

  // Phase B: feedback
  p = await fresh();
  await p.evaluate(() => document.querySelectorAll('.gate-bar .linkbtn').forEach(b => b.click()));
  const exIds = await p.evaluate(() => [...document.querySelectorAll('.ex')].map(e => e.id));
  const info = await p.evaluate(() => [...document.querySelectorAll('.ex')].map(e => ({ id: e.id, type: e.dataset.type, whens: [...e.querySelectorAll(':scope > .ex-fbbox > .fb[data-when], .fb[data-when]')].map(f => f.dataset.when), ans: e.dataset.answer, nopt: e.querySelectorAll('.ex-options > li').length })));
  const shown = (id) => p.evaluate((id) => { const e = document.getElementById(id); return [...e.querySelectorAll('.fb.show')].filter(f => f.offsetParent !== null).map(f => f.textContent.trim()); }, id);
  for (const x of info) {
    if (x.type === 'numeric') {
      const vals = [...new Set(x.whens.flatMap(w => w.split(',')).filter(w => w !== 'correct' && w !== 'other'))];
      vals.push('7777'); vals.push(x.ans);
      for (const v of vals) {
        await p.evaluate((id) => document.querySelector('#' + id + ' input.txt').value = '', x.id);
        await p.type('#' + x.id + ' input.txt', v); await p.click('#' + x.id + ' button.btn.primary');
        const s = await shown(x.id); if (s.length !== 1) bad(`${x.id} answer ${v}: ${s.length} feedback blocks`);
      }
    } else if (x.type === 'mcq') {
      const order = [...Array(x.nopt).keys()].map(i => i + 1);
      for (const i of order) {
        const done = await p.evaluate((id) => document.getElementById(id).dataset.solved, x.id);
        await p.click(`#${x.id} .ex-options li:nth-child(${i}) .opt`).catch(() => {});
        const s = await shown(x.id); if (s.length < 1) bad(`${x.id} option ${i}: no feedback`);
      }
    } else if (x.type === 'multi') {
      const nopt = x.nopt;
      for (let i = 1; i <= nopt; i++) if (i === nopt) await p.click(`#${x.id} .ex-options li:nth-child(${i}) .opt`);
      const btns = await p.$$(`#${x.id} button.btn`); for (const b of btns) { const t = await b.evaluate(n => n.textContent); if (/check/i.test(t)) await b.click(); }
      const s = await shown(x.id); if (s.length !== nopt) bad(`${x.id}: expected ${nopt} feedback blocks after CHECK, got ${s.length}`);
    } else if (x.type === 'lines') {
      for (const n of [1, 2, 3, 4, 5, 6]) {
        const nl = await p.evaluate((id) => document.querySelectorAll('#' + id + ' [role=button][aria-label^="Line"]').length, x.id);
        await p.evaluate((id, n) => { const r = document.querySelector('#' + id + ' [aria-label="Line ' + n + '"]'); r.click(); }, x.id, n);
        const s = await shown(x.id); if (s.length !== 1) bad(`${x.id} line ${n}: ${s.length} feedback`);
        if (n === 1) { if (nl !== 6) bad('lines count ' + nl); }
        if (n === 6 && !s[0].includes('condition 1')) bad('line 6 not correct feedback');
      }
    } else if (x.type === 'custom') {
      for (const [v, ok] of [['3 1 3 2', true], ['1 2 3', false], ['', false], ['x', false]]) {
        const r = await p.evaluate((v) => L03.checkSetInput(v), v);
        if (r.ok !== ok) bad(`custom ${v}: ok=${r.ok}`);
      }
      await p.type('#' + x.id + ' input.txt', '3 1 3 2'); await p.click('#' + x.id + ' button.btn.primary');
      const t = await p.evaluate((id) => document.getElementById(id).textContent, x.id);
      if (!t.includes('[1, 2, 3]') || !t.includes('1 fewer element')) bad('custom feedback text: ' + t);
    }
  }
  console.log('exercises checked:', exIds.length);
  // Phase C: math + predicts
  const r = await p.evaluate(() => ({
    katexErr: document.querySelectorAll('.katex-error').length,
    katex: document.querySelectorAll('.katex').length,
    raw: [...document.querySelectorAll('p, li, td, th, .fb, .opt, .hint, .ex-solution')].filter(n => !n.closest('pre') && /\\\(|\\\[/.test(n.textContent)).length,
  }));
  if (r.katexErr || r.raw || !r.katex) bad('katex ' + JSON.stringify(r));
  console.log('katex', JSON.stringify(r));
  const reveals = await p.evaluate(() => [...document.querySelectorAll('.predict')].map(x => x.querySelector('.reveal').classList.contains('open')));
  console.log('reveals open after answering:', reveals.join());
  if (reveals.some(v => !v)) bad('a predict reveal did not open');
  // Phase D: every non-predict exercise has 2 staged hints and a worked solution; predicts have neither;
  // no feedback is bare or starts with a mark; hints and solution reveal on click.
  p = await fresh();
  await p.evaluate(() => document.querySelectorAll('.gate-bar .linkbtn').forEach(b => b.click()));
  const struct = await p.evaluate(() => [...document.querySelectorAll('.ex')].map(e => ({
    id: e.id, predict: !!e.closest('.predict'),
    hints: e.querySelectorAll('.ex-hints .hint').length, sol: e.querySelectorAll('.ex-solution').length,
    fbs: [...e.querySelectorAll('.fb')].map(f => f.textContent.trim()),
  })));
  for (const s of struct) {
    if (s.predict) { if (s.hints || s.sol) bad(s.id + ': predict block should rely on its reveal'); }
    else { if (s.hints !== 2) bad(s.id + ': ' + s.hints + ' hints'); if (s.sol !== 1) bad(s.id + ': no worked solution'); }
    for (const t of s.fbs) {
      if (/^[✓✗✔✘]/.test(t)) bad(s.id + ': feedback starts with a mark: ' + t.slice(0, 40));
      if (t.length < 60) bad(s.id + ': feedback too short to explain: ' + t);
      if (/^(correct|incorrect|right|wrong)\.?$/i.test(t)) bad(s.id + ': bare feedback ' + t);
    }
  }
  for (const s of struct.filter(s => !s.predict)) {
    const r = await p.evaluate((id) => {
      const e = document.getElementById(id);
      const hb = [...e.querySelectorAll('.ex-tools .btn')].find(b => /hint/i.test(b.textContent));
      hb.click(); const one = e.querySelectorAll('.hint.show').length; hb.click(); const two = e.querySelectorAll('.hint.show').length;
      const sl = [...e.querySelectorAll('.ex-tools .linkbtn')].find(b => /show/i.test(b.textContent)); sl.click();
      const sol = e.querySelector('.ex-solution');
      return { one, two, disabled: hb.disabled, sol: sol.classList.contains('show') && sol.offsetParent !== null };
    }, s.id);
    if (r.one !== 1 || r.two !== 2 || !r.disabled || !r.sol) bad(s.id + ': hint/solution reveal ' + JSON.stringify(r));
  }
  const k2 = await p.evaluate(() => ({ err: document.querySelectorAll('.katex-error').length,
    raw: [...document.querySelectorAll('.hint, .ex-solution p')].filter(n => /\\\(|\\\[/.test(n.textContent)).length }));
  if (k2.err || k2.raw) bad('katex in hints/solutions ' + JSON.stringify(k2));
  console.log('structure checked:', struct.length, 'exercises,', struct.filter(s => !s.predict).length, 'with hints and solutions');
  await browser.close();
  console.log(problems.length ? 'PROBLEMS ' + problems.length : 'page checks OK');
  process.exit(problems.length ? 1 : 0);
})();
