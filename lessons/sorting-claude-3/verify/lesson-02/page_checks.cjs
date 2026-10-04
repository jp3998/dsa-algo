// Extra page checks for lesson 2: gates, exercise feedback, KaTeX, checker widget, listing text, screenshots.
const path = require('path'), fs = require('fs');
const SCRATCH = process.env.SCRATCH || '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
const root = path.resolve(__dirname, '../..');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.location().url || '')) errs.push(m.text()); });
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('file://' + path.join(root, 'lesson-02.html'), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));
  const out = {};
  out.gatedBefore = await page.$$eval('.lsec[data-gate]', s => s.map(x => [x.id, getComputedStyle(x).display]));
  // attempt every exercise in each checkpoint
  async function attemptAll(sel) {
    return page.evaluate(async (sel) => {
      const res = [];
      for (const ex of document.querySelectorAll(sel)) {
        const t = ex.dataset.type, id = ex.id;
        if (t === 'mcq') {
          const lis = [...ex.querySelectorAll('.ex-options > li')];
          const wrongFirst = lis.filter(l => !l.hasAttribute('data-correct')).concat(lis.filter(l => l.hasAttribute('data-correct')));
          const seen = [];
          for (const li of wrongFirst) { li.querySelector('.opt').click(); await new Promise(r => setTimeout(r, 20));
            const fb = li.querySelector('.fb'); seen.push(!!fb && getComputedStyle(fb).display !== 'none' && fb.textContent.trim().length > 0); }
          res.push([id, t, seen.every(Boolean), seen.length]);
        } else if (t === 'lines') {
          const lines = [...ex.querySelectorAll('.cl')]; const seen = [];
          for (const l of lines) { l.click(); await new Promise(r => setTimeout(r, 20));
            const fbs = [...ex.querySelectorAll('.fb')].filter(f => getComputedStyle(f).display !== 'none' && f.textContent.trim()); seen.push(fbs.length > 0); }
          res.push([id, t, seen.every(Boolean), lines.length]);
        } else if (t === 'numeric') {
          const inp = ex.querySelector('input'), btn = ex.querySelector('button.primary, .ex-actions button');
          const seen = [];
          for (const v of ['12112', '5', '12121']) { inp.value = v; btn.click(); await new Promise(r => setTimeout(r, 20));
            seen.push([...ex.querySelectorAll('.fb')].filter(f => getComputedStyle(f).display !== 'none' && f.textContent.trim()).length > 0); }
          res.push([id, t, seen.every(Boolean), 3]);
        } else if (t === 'order') {
          const b = [...ex.querySelectorAll('button')].find(b => /check/i.test(b.textContent));
          if (b) { b.click(); await new Promise(r => setTimeout(r, 20)); }
          res.push([id, t, [...ex.querySelectorAll('.fb')].some(f => getComputedStyle(f).display !== 'none' && f.textContent.trim()), 1]);
        }
      }
      return res;
    }, sel);
  }
  out.prereq = await attemptAll('#prereq .ex');
  out.predictNan = await attemptAll('#pr-nan .ex');
  out.cp1 = await attemptAll('#cp1 .ex');
  out.gatedAfterCp1 = await page.$$eval('.lsec[data-gate]', s => s.map(x => [x.id, getComputedStyle(x).display]));
  out.revealNan = await page.$eval('#pr-nan .reveal', r => r.classList.contains('open'));
  out.cp2 = await attemptAll('#cp2 .ex');
  out.predictConcat = await attemptAll('#pr-concat .ex');
  out.exercises = await attemptAll('#exercises .ex');
  out.gatedAfterCp2 = await page.$$eval('.lsec[data-gate]', s => s.map(x => [x.id, getComputedStyle(x).display]));
  // Every exercise outside predict blocks: two staged hints and a worked solution, both reachable.
  out.tools = await page.evaluate(async () => {
    const res = [];
    for (const ex of document.querySelectorAll('.ex')) {
      if (ex.closest('.predict')) continue;
      const hints = [...ex.querySelectorAll('.ex-hints .hint')];
      const hb = [...ex.querySelectorAll('.ex-tools button')].find(b => /hint/i.test(b.textContent));
      const shown = [];
      for (let i = 0; i < hints.length && hb; i++) { hb.click(); await new Promise(r => setTimeout(r, 10)); shown.push(hints.filter(h => getComputedStyle(h).display !== 'none').length); }
      const sol = ex.querySelector('.ex-solution');
      const sl = [...ex.querySelectorAll('.ex-tools button')].find(b => /solution|show me/i.test(b.textContent));
      if (sl) { sl.click(); await new Promise(r => setTimeout(r, 10)); }
      res.push({ id: ex.id, hints: hints.length, hintsShownStepwise: shown.join(','), solutionVisible: !!sol && getComputedStyle(sol).display !== 'none',
        solutionWords: sol ? sol.textContent.trim().split(/\s+/).length : 0, solutionParas: sol ? sol.querySelectorAll('p').length : 0 });
    }
    return res;
  });
  out.toolsOk = out.tools.every(t => t.hints === 2 && t.hintsShownStepwise === '1,2' && t.solutionVisible && t.solutionWords > 80);
  // feedback text never starts with a check or cross mark in the source
  out.leadingMarks = await page.evaluate(() => [...document.querySelectorAll('.fb, [data-why]')].filter(f => /^\s*[✓✗✔✘]/.test(f.getAttribute('data-why') || f.textContent)).length);
  // lines exercises: every non-blank line has its own feedback block (or is the answer)
  out.linesCoverage = await page.evaluate(() => [...document.querySelectorAll('.ex[data-type="lines"]')].map(ex => {
    const ans = ex.dataset.answer.split(',').map(Number);
    const whens = [...ex.querySelectorAll('.fb[data-when]')].flatMap(f => f.dataset.when.split(','));
    const lines = [...ex.querySelectorAll('.cl')];
    const code = l => [...l.childNodes].filter(c => !(c.classList && c.classList.contains('ln'))).map(c => c.textContent).join('');
    const missing = lines.map((l, i) => i + 1).filter(n => code(lines[n - 1]).trim() && !ans.includes(n) && !whens.includes(String(n)));
    return [ex.id, missing];
  }));
  // order exercise on a fresh load: keep a false step -> its data-why; then the correct arrangement -> success text
  {
    const p2 = await browser.newPage();
    p2.on('pageerror', e => errs.push(e.message));
    await p2.setViewport({ width: 1280, height: 900 });
    await p2.goto('file://' + path.join(root, 'lesson-02.html'), { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 600));
    out.order = await p2.evaluate(async () => {
      const ex = document.getElementById('l2-ex-proof'), ol = ex.querySelector('.ex-steps');
      const check = [...ex.querySelectorAll('.ex-actions button')].find(b => /check/i.test(b.textContent));
      const live = () => { const f = ex.querySelector('.ex-live .fb'); return f ? f.textContent.trim() : ''; };
      const lis = () => [...ol.children];
      const res = {};
      // exclude only the "strings" false step, keep the "numbers" one, order the true ones
      const numbersStep = lis().find(li => li.dataset.pos === '0' && /numbers/.test(li.textContent));
      const stringsStep = lis().find(li => li.dataset.pos === '0' && /strings/.test(li.textContent));
      stringsStep.querySelector('.stp-ctl .btn:nth-child(3)').click();
      check.click(); await new Promise(r => setTimeout(r, 20));
      res.keptFalse = live();
      numbersStep.querySelector('.stp-ctl .btn:nth-child(3)').click();
      // bubble the true steps into ascending order with the up/down buttons
      for (let pass = 0; pass < 10; pass++) {
        const kept = lis().filter(li => li.dataset.pos !== '0');
        for (let i = 1; i < kept.length; i++) if (+kept[i].dataset.pos < +kept[i - 1].dataset.pos) {
          while (kept[i].previousElementSibling !== null && kept[i].previousElementSibling !== kept[i - 1].previousElementSibling) kept[i].querySelector('.stp-ctl .btn:nth-child(1)').click();
        }
      }
      res.finalOrder = lis().map(li => li.dataset.pos + (li.classList.contains('excl') ? 'x' : '')).join(' ');
      check.click(); await new Promise(r => setTimeout(r, 20));
      res.success = live();
      res.solved = ex.dataset.solved === '1';
      res.successKatex = ex.querySelectorAll('.ex-live .katex').length;
      return res;
    });
    await p2.close();
  }
  // KaTeX
  out.katex = await page.evaluate(() => {
    const raw = [];
    const w = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (n.parentElement.closest('.katex, pre, code, script, style')) continue; if (/\\\(|\\\)|\\\[|\\\]/.test(n.nodeValue)) raw.push(n.nodeValue.slice(0, 60)); }
    return { rawTex: raw, errors: document.querySelectorAll('.katex-error').length, rendered: document.querySelectorAll('.katex').length };
  });
  // checker widget: click all presets, record verdict text
  out.checker = [];
  const n = await page.$$eval('#checker .tgl .btn', b => b.length);
  for (let i = 0; i < n; i++) {
    await page.$$eval('#checker .tgl .btn', (b, i) => b[i].click(), i);
    out.checker.push(await page.$eval('#checker .chk-verdict', v => v.className + ' | ' + v.textContent + ' | red cells: ' + document.querySelectorAll('#checker td.bad').length));
  }
  // listings equal the verify files
  const he = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  out.listings = [];
  for (const [i, f] of [[1, 'listing1.py'], [2, 'listing2.py'], [3, 'listing3.py'], [4, 'listing4.py']]) {
    const html = fs.readFileSync(path.join(root, 'lesson-02.html'), 'utf8');
    const m = html.match(new RegExp('id="lst-' + i + '">[\\s\\S]*?<pre class="py">([\\s\\S]*?)</pre>'));
    out.listings.push([i, he(m[1]).trim() === fs.readFileSync(path.join(__dirname, f), 'utf8').trim()]);
  }
  out.linesOk = out.linesCoverage.every(([, m]) => m.length === 0);
  out.orderOk = /does not belong/.test(out.order.keptFalse) && out.order.finalOrder.replace(/ ?0x/g, '') === '1 2 3 4' && out.order.solved && /That’s the proof/.test(out.order.success) && out.order.successKatex > 0;
  out.errors = errs;
  if (!(out.toolsOk && out.linesOk && out.orderOk && out.leadingMarks === 0 && out.katex.errors === 0 && out.katex.rawTex.length === 0)) errs.push('lesson-02 page checks failed');
  console.log(JSON.stringify(out, null, 1));
  // screenshots with everything open
  await page.screenshot({ path: path.join(SCRATCH, 'shots', 'lesson-02-full-1280.png'), fullPage: true });
  await page.setViewport({ width: 390, height: 800 });
  await new Promise(r => setTimeout(r, 300));
  out.sw390 = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('scrollWidth@390', out.sw390);
  await page.screenshot({ path: path.join(SCRATCH, 'shots', 'lesson-02-full-390.png'), fullPage: true });
  await page.$eval('#fig-1', e => e.scrollIntoView());
  await page.setViewport({ width: 1280, height: 900 });
  await (await page.$('#fig-1')).screenshot({ path: path.join(SCRATCH, 'shots', 'lesson-02-fig1-a.png') });
  await page.$$eval('#checker .tgl .btn', b => b[2].click());
  await (await page.$('#fig-1')).screenshot({ path: path.join(SCRATCH, 'shots', 'lesson-02-fig1-tol.png') });
  await page.$$eval('#checker .tgl .btn', b => b[4].click());
  await page.setViewport({ width: 390, height: 800 });
  await (await page.$('#fig-1')).screenshot({ path: path.join(SCRATCH, 'shots', 'lesson-02-fig1-rps-390.png') });
  await browser.close();
  process.exit(errs.length ? 1 : 0);
})();
