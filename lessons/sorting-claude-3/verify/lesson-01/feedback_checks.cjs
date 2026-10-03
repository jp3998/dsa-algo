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
  for (const [k, want] of Object.entries({ 1: 'other', 2: 'correct', 3: '3', 4: 'other', 5: '5' })) {
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
  console.log('feedback checks', n, 'bad', bad);
  await b.close();
})();
