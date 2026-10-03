/* Page-level checks for lesson 4: gates, every exercise's feedback, KaTeX, stepper + knowledge view.
 * Usage: node page_checks.cjs */
const path = require('path');
const SCRATCH = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
const abs = path.resolve(__dirname, '../../lesson-04.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const ok = (c, m) => { if (!c) { problems.push(m); console.log('FAIL', m); } };

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('pageerror', e => problems.push('pageerror ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.location().url || '')) problems.push('console ' + m.text()); });
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('file://' + abs, { waitUntil: 'load' });
  await sleep(500);

  // ---- KaTeX
  const kx = await page.evaluate(() => ({
    errors: document.querySelectorAll('.katex-error').length,
    rendered: document.querySelectorAll('.katex').length,
    raw: (document.body.innerText.match(/\\\(|\\\)|\\\[|\\\]/g) || []).length
  }));
  console.log('katex', kx);
  ok(kx.errors === 0 && kx.rendered > 50 && kx.raw === 0, 'KaTeX rendering');

  // ---- gates closed at start
  const gates = await page.evaluate(() => ['s06', 's07', 's08'].map(id => document.getElementById(id).classList.contains('gated')));
  ok(gates.every(Boolean), 'gates initially closed ' + gates);

  // ---- exercise driver
  async function numeric(id, answers) {   // answers: [[value, expectedWhen]] correct last
    for (const [v, when] of answers) {
      const r = await page.evaluate(async (id, v) => {
        const ex = document.getElementById(id);
        const inp = ex.querySelector('input'); inp.value = v;
        ex.querySelector('.rowline .btn').click();
        await new Promise(r => setTimeout(r, 30));
        const shown = Array.from(ex.querySelectorAll('.fb.show')).map(f => (f.getAttribute('data-when') || '') + '|' + f.className + '|' + f.textContent.slice(0, 40));
        return shown;
      }, id, v);
      const good = r.length === 1 && r[0].startsWith(when + '|') || r.some(s => s.split('|')[0].split(',').includes(when));
      ok(good, `${id} answer ${v} expected fb ${when}, got ${JSON.stringify(r)}`);
      const wantOk = when === 'correct';
      ok(r.some(s => s.includes(wantOk ? ' ok' : ' bad')), `${id} answer ${v} ok/bad class ${JSON.stringify(r)}`);
    }
  }
  async function mcq(id, nOpts, correctIdx) {  // click wrong ones then correct
    const order = []; for (let i = 0; i < nOpts; i++) if (i !== correctIdx) order.push(i); order.push(correctIdx);
    for (const i of order) {
      const r = await page.evaluate(async (id, i) => {
        const ex = document.getElementById(id);
        const li = ex.querySelectorAll('.ex-options > li')[i];
        li.querySelector('.opt').click();
        await new Promise(r => setTimeout(r, 30));
        const fb = li.querySelector('.fb');
        return { shown: fb && getComputedStyle(fb).display !== 'none' && fb.textContent.trim().length > 0, cls: li.className, txt: fb && fb.textContent.slice(0, 30) };
      }, id, i);
      ok(r.shown, `${id} option ${i} shows feedback`);
      ok(r.cls.includes(i === correctIdx ? 'right' : 'wrong'), `${id} option ${i} class ${r.cls}`);
    }
  }
  async function lines(id, nLines, correct, specific) {
    for (let n = 1; n <= nLines; n++) {
      if (correct.includes(n)) continue;
      const r = await page.evaluate(async (id, n) => {
        const ex = document.getElementById(id);
        const rows = ex.querySelectorAll('[role=button][aria-label^="Line "]');
        const row = rows.length ? rows[n - 1] : null;
        if (row) row.click();
        await new Promise(r => setTimeout(r, 30));
        return { nrows: rows.length, shown: Array.from(ex.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when')) };
      }, id, n);
      const want = specific[n] || 'other';
      ok(r.nrows >= nLines && r.shown.length === 1 && r.shown[0] === want, `${id} line ${n}: want ${want}, got ${JSON.stringify(r)}`);
    }
    for (const n of correct) {
      const r = await page.evaluate(async (id, n) => {
        const ex = document.getElementById(id);
        const rows = ex.querySelectorAll('[role=button][aria-label^="Line "]');
        rows[n - 1].click();
        await new Promise(r => setTimeout(r, 30));
        return Array.from(ex.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when'));
      }, id, n);
      ok(r.length === 1 && r[0] === 'correct', `${id} correct line ${n}: ${JSON.stringify(r)}`);
    }
  }

  // prerequisites + predicts + checkpoint 1
  await numeric('l4-pre-1', [['15', '15'], ['6', '6'], ['9', 'other'], ['5', 'correct']]);
  await mcq('l4-pre-2', 4, 0);
  await numeric('l4-pr-candidates', [['1', '1'], ['12', '12'], ['3', '3'], ['7', 'other'], ['24', 'correct']]);
  await numeric('l4-pr-reversed4', [['24', '24'], ['72', '72'], ['41', 'other'], ['40', 'correct']]);
  const revealOpen = await page.evaluate(() => ['pr-candidates', 'pr-reversed4'].map(id => document.querySelector('#' + id + ' .reveal').classList.contains('open')));
  ok(revealOpen.every(Boolean), 'predict reveals open ' + revealOpen);

  await numeric('l4-cp1-a', [['3', '3'], ['2', '2'], ['9', '9'], ['4', 'other'], ['5', 'correct']]);
  const gateAfterA = await page.evaluate(() => document.getElementById('s06').classList.contains('gated'));
  ok(gateAfterA, 's06 still gated before all of cp1 attempted');
  await mcq('l4-cp1-b', 4, 0);
  // custom checker
  const cust = async (v) => page.evaluate(async v => {
    const ex = document.getElementById('l4-cp1-c');
    const inp = ex.querySelector('input'); inp.value = v; ex.querySelector('.rowline .btn').click();
    await new Promise(r => setTimeout(r, 30));
    return { txt: ex.querySelector('.fb.show') ? ex.querySelector('.fb.show').textContent : ex.innerText.slice(-300), cls: ex.querySelector('.fb.show') ? ex.querySelector('.fb.show').className : '' };
  }, v);
  let c = await cust('1 2 3 4'); console.log('custom 1234:', c.txt); ok(/bad/.test(c.cls) && /Examined 1 candidates/.test(c.txt), 'custom wrong');
  c = await cust('1 1 2 3'); ok(/distinct/.test(c.txt), 'custom dup: ' + c.txt);
  c = await cust('2 1 3 4'); console.log('custom 2134:', c.txt); ok(/ok/.test(c.cls) && /7 candidates/.test(c.txt), 'custom right');
  const g1 = await page.evaluate(() => ['s06', 's07', 's08'].map(id => document.getElementById(id).classList.contains('gated')));
  ok(g1[0] === false && g1[1] === true && g1[2] === true, 'after cp1 only s06 open ' + g1);

  // s06: predict + checkpoint 2
  await numeric('l4-pr-knows', [['7', '7'], ['2', '2'], ['4', 'other'], ['3', 'correct']]);
  await mcq('l4-cp2-a', 4, 2);
  await numeric('l4-cp2-b', [['24', '24'], ['3', '3'], ['4', 'other'], ['5', 'correct']]);
  const g2 = await page.evaluate(() => ['s07', 's08'].map(id => document.getElementById(id).classList.contains('gated')));
  ok(g2.every(x => x === false), 'after cp2 s07, s08 open ' + g2);

  // s07 predict (mcq), exercises
  await mcq('l4-pr-rankties', 3, 0);
  await lines('l4-ex-strict', 5, [3], { 2: '2', 5: '5' });
  await lines('l4-ex-rankbug', 12, [8], { 12: '12', 6: '6' });
  await mcq('l4-ex-worst', 4, 0);
  await numeric('l4-ex-rank10', [['90', '90'], ['100', '100'], ['9', '9'], ['46', 'other'], ['45', 'correct']]);
  await mcq('l4-ex-spiral', 4, 0);

  // ---- Fig. 1
  const snap = () => page.evaluate(() => ({
    pos: document.querySelector('#fig1-stepper .st-pos').textContent,
    poset: document.getElementById('fig1-poset').innerHTML,
    status: document.getElementById('fig1-status').innerHTML,
    err: document.querySelector('#fig1-stepper .st-error').textContent,
    hl: (document.querySelector('#fig1-stepper .hl, #fig1-stepper .cur, #fig1-stepper [class*="active"]') || {}).textContent
  }));
  const click = (txt) => page.evaluate(t => { const b = Array.from(document.querySelectorAll('#fig1-stepper .st-controls .btn')).find(b => b.textContent.includes(t)); b.click(); }, txt);
  async function loadPreset(label) {
    await page.evaluate(l => Array.from(document.querySelectorAll('#fig1-stepper .st-setup .tgl .btn')).find(b => b.textContent.startsWith(l)).click(), label);
  }
  async function walk(label, maxSteps) {
    await loadPreset(label);
    await sleep(50);
    const fwd = [await snap()];
    const total = parseInt(fwd[0].pos.split('/')[1]);
    const steps = Math.min(total - 1, maxSteps);
    for (let k = 0; k < steps; k++) { await click('Forward'); fwd.push(await snap()); }
    const bwd = [fwd[fwd.length - 1]];
    for (let k = 0; k < steps; k++) { await click('Back'); bwd.push(await snap()); }
    bwd.reverse();
    let same = true;
    for (let k = 0; k < fwd.length; k++) if (JSON.stringify(fwd[k]) !== JSON.stringify(bwd[k])) { same = false; console.log('mismatch at', k); break; }
    ok(same, label + ': stepping back restores poset, status, counters exactly');
    return { total, fwd };
  }
  let w = await walk('[3, 1, 2]', 100000);
  console.log('[3,1,2] total steps', w.total);
  const lastStatus = w.fwd[w.fwd.length - 1].status;
  console.log('final status', lastStatus.replace(/<[^>]+>/g, ''));
  ok(/taught nothing: <strong>3<\/strong>/.test(lastStatus), '[3,1,2] ends with 3 wasted');
  const statuses = new Set(w.fwd.map(s => (s.status.match(/<strong>(new|already known|implied by transitivity)<\/strong>/) || [])[1]));
  console.log('statuses seen', [...statuses]);
  ok(statuses.has('new') && statuses.has('already known'), 'new/known statuses shown');
  const lastPoset = w.fwd[w.fwd.length - 1].poset;
  ok(/e\(P\) = 1<\/strong>/.test(lastPoset), 'e(P)=1 at end');
  w = await walk('[2, 3, 1]', 100000);
  w = await walk('Reversed', 100000);
  ok(/taught nothing: <strong>34<\/strong>/.test(w.fwd[w.fwd.length - 1].status), 'reversed ends with 34 wasted');
  w = await walk('Sorted', 100000);
  w = await walk('Random 5', 150);
  await loadPreset('[3, 1, 2]');
  // implied status: find an input where it occurs (n=5 random) by running forward to end of trace for a few inputs
  // custom input: n = 6 reversed, cap, duplicates, empty
  const load = async (txt) => {
    await page.evaluate(t => { const i = document.querySelector('#fig1-stepper .st-setup input'); i.value = t; Array.from(document.querySelectorAll('#fig1-stepper .st-setup .btn')).find(b => b.textContent === 'Load').click(); }, txt);
    await sleep(120);
    return snap();
  };
  let s = await load('6 5 4 3 2 1'); console.log('n=6 reversed:', s.pos, s.err); ok(/\/ 4634$/.test(s.pos) && !s.err, 'n=6 reversed loads, 4634 steps');
  s = await load('1 2 3 4 5 6 7'); console.log('7 numbers:', s.err); ok(/at most 6/.test(s.err) && /5040 candidates/.test(s.err), 'cap message');
  s = await load('2 1 2'); console.log('dups:', s.err); ok(/assumes distinct values \(Assumption A1\).*see §04/.test(s.err), 'duplicate message');
  s = await load(''); console.log('empty:', s.pos, s.poset.length); ok(/\/ 5$/.test(s.pos), 'empty input 5 steps');
  s = await load('7'); ok(/\/ 5$/.test(s.pos), 'single input');
  // random-ish input with implied
  s = await load('5 2 4 1 3'); const tot = parseInt(s.pos.split('/')[1]); console.log('[5,2,4,1,3] steps', tot);
  let sawImplied = false;
  for (let k = 0; k < Math.min(tot, 3000) && !sawImplied; k++) { await click('Forward'); const t = await snap(); if (/implied by transitivity/.test(t.status)) { sawImplied = true; console.log('implied example:', t.status.replace(/<[^>]+>/g, '')); } }
  console.log('implied status seen on [5,2,4,1,3]:', sawImplied);
  // highlighted code line follows the trace
  const hl = await page.evaluate(() => Array.from(document.querySelectorAll('#fig1-stepper pre .cur, #fig1-stepper .cur')).length);
  console.log('cur-line elements', hl);

  // plot
  const plot = await page.evaluate(() => ({ svg: document.querySelectorAll('#fig2-plot svg').length, txt: document.getElementById('fig2-plot').innerText.slice(0, 300) }));
  console.log('plot', plot); ok(plot.svg >= 1, 'plot rendered');

  await browser.close();
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL PAGE CHECKS OK');
  process.exit(problems.length ? 1 : 0);
})();
