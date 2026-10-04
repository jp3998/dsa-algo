const path = require('path'), fs = require('fs');
const S = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(S, 'node_modules', 'puppeteer-core'));
const html = path.resolve(__dirname, '../../lesson-01.html');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage(); await p.setViewport({ width: 1000, height: 900 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/fonts\.g/.test(m.location().url || '') && errs.push(m.text()));
  await p.goto('file://' + html, { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 500));
  const r = await p.evaluate(async () => {
    const out = {}; const sleep = ms => new Promise(r => setTimeout(r, ms));
    out.katexErr = document.querySelectorAll('.katex-error').length;
    out.rawTex = (document.body.innerText.match(/\\\(|\\\)|\\\[|\\\]/g) || []).length;
    out.katexCount = document.querySelectorAll('.katex').length;
    out.gatesClosedAtStart = Array.from(document.querySelectorAll('[data-gate]')).map(s => s.id + ':' + (getComputedStyle(s.querySelector('.sec-head')).display === 'none' || s.classList.contains('gated') || !!s.querySelector('.gate-bar')));
    // attempt every checkpoint, then check gates
    for (const cp of document.querySelectorAll('.checkpoint')) {
      for (const o of cp.querySelectorAll('.ex[data-type="mcq"] .ex-options > li:first-child .opt')) o.click();
      for (const ex of cp.querySelectorAll('.ex[data-type="numeric"]')) { const i = ex.querySelector('input'); i.value = '12345'; ex.querySelector('button').click(); }
      for (const ex of cp.querySelectorAll('.ex[data-type="match"]')) { ex.querySelectorAll('button').forEach(x => x.click()); }
      await sleep(150);
    }
    out.gateBarsAfter = document.querySelectorAll('.gate-bar').length;
    // numeric feedback checks
    const num = {};
    for (const ex of document.querySelectorAll('.ex[data-type="numeric"]')) {
      const ans = ex.getAttribute('data-answer'); const i = ex.querySelector('input');
      const whens = Array.from(ex.querySelectorAll('.fb')).map(f => f.getAttribute('data-when'));
      const res = {};
      // wrong answers first (a correct answer locks the exercise), then the answer itself
      for (const v of [...whens.filter(w => /^\d+$/.test(w)), '777', ans]) {
        i.value = v; ex.querySelector('button').click(); await sleep(30);
        const shown = Array.from(ex.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when'));
        res[v] = shown.join('|');
      }
      num[ex.id] = res;
    }
    out.num = num;
    // lines
    const ln = document.querySelector('#l1-ex-bug');
    const res = {};
    const lines = ln.querySelectorAll('.cl');
    const ansLines = ln.getAttribute('data-answer').split(',').map(Number);
    const seq = [...Array(lines.length).keys()].map(k => k + 1).sort((x, y) => ansLines.includes(x) - ansLines.includes(y));
    for (const k of seq) { lines[k - 1].click(); await sleep(30); res[k] = Array.from(ln.querySelectorAll('.fb.show')).map(f => f.getAttribute('data-when')).join('|'); }
    out.lines = res;
    // custom checker
    const cu = document.querySelector('#l1-ex-neighbour-trap'); const ci = cu.querySelector('input');
    const cres = {};
    for (const v of ['abc', 'dabc', 'abcd', 'cabd', 'bcda', 'cdab']) { ci.value = v; cu.querySelector('button').click(); await sleep(30); cres[v] = (cu.querySelector('.ex-live, .live, [aria-live]') || cu).innerText.slice(0, 260).replace(/\s+/g, ' '); if (v==='bcda'||v==='cdab') break; }
    out.custom = cres;
    // posets
    out.pvTasks = document.querySelector('#pv-tasks').innerText.replace(/\s+/g, ' ').slice(0, 300);
    out.pvPlay = document.querySelector('#pv-playground').innerText.replace(/\s+/g, ' ').slice(0, 200);
    out.listings = Array.from(document.querySelectorAll('.listing')).map(l => l.id);
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
