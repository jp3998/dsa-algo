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
  out.errors = errs;
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
