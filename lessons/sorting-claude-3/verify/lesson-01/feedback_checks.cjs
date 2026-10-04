const path = require('path');
const S = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(S, 'node_modules', 'puppeteer-core'));
const html = 'file://' + path.resolve(__dirname, '../../lesson-01.html');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  const spec = { 'l1-q-oop': { 3: 'correct', 2: '2', 6: '6', 99: 'other' }, 'l1-cp2-a': { 2: 'correct', 6: '6', 1: '1', 3: '3', 99: 'other' }, 'l1-cp2-b': { 12: 'correct', 24: '24', 6: '6', 2: '2', 99: 'other' }, 'l1-cp3-a': { 999: 'correct', 1000: '1000', 499500: '499500', 5: 'other' }, 'l1-cp4-b': { 12: 'correct', 720: '720', 6: '6', 3: '3', 99: 'other' }, 'l1-ex-chains': { 6: 'correct', 12: '12', 24: '24', 4: '4', 99: 'other' }, 'l1-ex-fib': { 8: 'correct', 1: '1', 120: '120', 5: '5', 99: 'other' } };
  let bad = 0, n = 0;
  async function fresh() { await p.goto(html, { waitUntil: 'load' }); await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto(html, { waitUntil: 'load' }); }
  for (const [id, m] of Object.entries(spec)) for (const [v, want] of Object.entries(m)) {
    await fresh();
    const got = await p.evaluate(async (id, v) => { const ex = document.getElementById(id); const i = ex.querySelector('input'); i.value = v; ex.querySelector('button.primary, button').click(); await new Promise(r => setTimeout(r, 40)); return Array.from(ex.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when')).join('|'); }, id, v);
    n++; if (got !== want) { bad++; console.log('MISMATCH', id, v, got, want); }
  }
  for (const [k, want] of Object.entries({ 1: '1', 2: 'correct', 3: '3', 4: '4', 5: '5' })) {
    await fresh();
    const got = await p.evaluate(async k => { const ex = document.getElementById('l1-ex-bug'); ex.querySelectorAll('.cl')[k - 1].click(); await new Promise(r => setTimeout(r, 40)); return Array.from(ex.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when')).join('|'); }, +k);
    n++; if (got !== want) { bad++; console.log('MISMATCH line', k, got, want); }
  }
  // mcq: every option shows its own feedback; match: each wrong category
  await fresh();
  const mc = await p.evaluate(async () => {
    const res = []; for (const ex of document.querySelectorAll('.ex[data-type="mcq"]')) {
      const lis = ex.querySelectorAll('.ex-options > li');
      const ord = Array.from(lis.keys()).sort((a, b) => lis[a].hasAttribute('data-correct') - lis[b].hasAttribute('data-correct')); for (const k of ord) { lis[k].querySelector('.opt').click(); await new Promise(r => setTimeout(r, 15)); const fb = lis[k].querySelector('.fb'); res.push([ex.id, k, lis[k].hasAttribute('data-correct'), fb.classList.contains('show'), fb.classList.contains('ok')]); }
    } return res; });
  for (const r of mc) { n++; if (!r[3] || r[4] !== r[2]) { bad++; console.log('MCQ mismatch', r); } }
  // match l1-pr-requests: every (item, category) pair shows the intended feedback
  {
    const ans = { 0: 'one', 1: 'many', 2: 'many', 3: 'none' }, cats = ['one', 'many', 'none'];
    for (const i of [0, 1, 2, 3]) for (const c of cats) {
      await fresh();
      const got = await p.evaluate(async (i, c) => {
        const ex = document.getElementById('l1-pr-requests'); const lis = ex.querySelectorAll('.ex-items > li');
        lis.forEach(li => { const b = li.querySelector('button[data-cat="none"]'); b.click(); });
        lis[i].querySelector('button[data-cat="' + c + '"]').click();
        ex.querySelector('button.primary').click(); await new Promise(r => setTimeout(r, 40));
        return Array.from(lis[i].querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when')).join('|');
      }, i, c);
      const want = c === ans[i] ? 'correct' : (i === 3 ? 'one,many' : c);
      n++; if (got !== want) { bad++; console.log('MATCH mismatch', i, c, got, want); }
    }
  }
  // the reveal of Fig. 1 contains the figure and its text alternative
  await fresh();
  const alt = await p.evaluate(() => { const f = document.querySelector('#pr-requests .reveal #fig-1 [role="img"]'); return f && f.getAttribute('aria-label').length; });
  n++; if (!(alt > 200)) { bad++; console.log('Fig 1 aria-label missing'); }
  // order exercise: the lesson hook adds each true step's own reason to the component's message
  {
    const cases = [
      { order: [2, 1, 3, 4], excl: [], flag: 2, want: 'doesn’t open with it' },
      { order: [1, 3, 2, 4], excl: [], flag: 3, want: 'needs two facts before it' },
      { order: [4, 1, 2, 3], excl: [], flag: 4, want: 'induction step comes last' },
      { order: [1, 2, 3, 4], excl: [1], flag: 1, want: 'would stand later although it must come earlier' },
      { order: [1, 2, 3, 4], excl: [3], flag: 3, want: 'asymmetry forbids' },
      { order: [1, 2, 3, 4], excl: [], keepFalse: true, flag: 0, want: '7, 2, 9, 4' },
      { order: [1, 2, 3, 4], excl: [], flag: null, want: 'That’s the proof.' },
    ];
    for (const c of cases) {
      await fresh();
      const got = await p.evaluate(async c => {
        const ex = document.getElementById('l1-ex-proof-order'); const ol = ex.querySelector('.ex-steps');
        const lis = Array.from(ol.children); const byPos = k => lis.filter(li => +li.getAttribute('data-pos') === k);
        for (const k of c.order) ol.appendChild(byPos(k)[0]);
        const falses = byPos(0); for (const f of falses) ol.appendChild(f);
        const exclBtn = li => Array.from(li.querySelectorAll('.stp-ctl .btn')).find(b => /Exclude/.test(b.textContent));
        if (!c.keepFalse) for (const f of falses) exclBtn(f).click();
        for (const k of c.excl) exclBtn(byPos(k)[0]).click();
        ex.querySelector('.ex-actions .btn.primary').click(); await new Promise(r => setTimeout(r, 40));
        const fl = ol.querySelector('li.flag');
        return { text: (ex.courseApi.live || {}).textContent || '', flag: fl ? +fl.getAttribute('data-pos') : null, ok: ex.getAttribute('data-solved') === '1' };
      }, c);
      n++; if (got.flag !== c.flag || got.text.indexOf(c.want) < 0 || (c.flag === null) !== got.ok) { bad++; console.log('ORDER mismatch', c, got); }
    }
  }
  // exercise standards: two staged hints + worked solution (except predict-first), feedback on every answer,
  // no leading marks, no bare verdicts
  await fresh();
  const std = await p.evaluate(() => {
    const out = [];
    for (const ex of document.querySelectorAll('.ex')) {
      const id = ex.id, t = ex.getAttribute('data-type'), inPredict = !!ex.closest('.predict');
      const hints = ex.querySelectorAll('.ex-hints .hint').length, sol = ex.querySelectorAll('.ex-solution').length;
      if (!inPredict && (hints !== 2 || sol !== 1)) out.push(id + ': hints ' + hints + ' solution ' + sol);
      if (inPredict && (hints || sol)) out.push(id + ': predict block with hints/solution');
      if (t === 'mcq') ex.querySelectorAll('.ex-options > li').forEach((li, i) => { if (!li.querySelector('.fb')) out.push(id + ': option ' + i + ' has no feedback'); });
      if (t === 'numeric') for (const w of ['correct', 'other']) if (!ex.querySelector('.fb[data-when="' + w + '"]')) out.push(id + ': no ' + w + ' feedback');
      if (t === 'match') {
        const cats = ex.getAttribute('data-categories').split('|').map(c => c.split(':')[0]);
        ex.querySelectorAll('.ex-items > li').forEach((li, i) => {
          const ws = Array.from(li.querySelectorAll('.fb')).flatMap(f => f.getAttribute('data-when').split(','));
          for (const c of cats) { const want = c === li.getAttribute('data-answer') ? 'correct' : c; if (ws.indexOf(want) < 0 && ws.indexOf('other') < 0) out.push(id + ': item ' + i + ' lacks ' + want); }
        });
      }
      if (t === 'order') ex.querySelectorAll('.ex-steps > li').forEach(li => { const pos = +li.getAttribute('data-pos'); if (pos === 0 ? !li.getAttribute('data-why') : !li.getAttribute('data-true')) out.push(id + ': step without reason'); });
      for (const f of ex.querySelectorAll('.fb, .hint, .ex-solution')) {
        const tx = f.textContent.trim();
        if (/^[✓✗✔✘]/.test(tx)) out.push(id + ': leading mark');
        if (tx.length < 45) out.push(id + ': short text "' + tx + '"');
        if (/^(correct|incorrect|right|wrong)\.?$/i.test(tx)) out.push(id + ': bare verdict');
      }
    }
    return out;
  });
  for (const m of std) { n++; bad++; console.log('STANDARD', m); }
  n++;
  console.log('feedback checks', n, 'bad', bad);
  await b.close();
})();
