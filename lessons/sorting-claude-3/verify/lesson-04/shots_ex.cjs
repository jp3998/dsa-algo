/* Screenshots of revised exercises with hints, worked solutions and feedback revealed (390 and 1280 px). */
const path = require('path');
const SCRATCH = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  for (const w of [390, 1280]) {
    await p.setViewport({ width: w, height: 900 });
    await p.goto('file://' + path.resolve(__dirname, '../../lesson-04.html')); await sleep(500);
    await p.evaluate(async () => {
      for (const l of document.querySelectorAll('.gate-bar .linkbtn')) l.click();
      const cust = document.getElementById('l4-cp1-c'); cust.querySelector('input').value = '2 1 4 3'; cust.querySelector('.rowline .btn').click();
      const num = document.getElementById('l4-cp1-a'); num.querySelector('input').value = '6'; num.querySelector('.rowline .btn').click();
      document.querySelectorAll('#l4-ex-strict [aria-label="Line 4"]')[0].click();
      document.querySelectorAll('#l4-cp2-a .ex-options > li')[3].querySelector('.opt').click();
      for (const ex of document.querySelectorAll('.ex')) {
        const hb = Array.from(ex.querySelectorAll('.ex-tools .btn')).find(x => /^Hint/.test(x.textContent));
        if (hb) { hb.click(); hb.click(); }
        const l = ex.querySelector('.ex-tools .linkbtn'); if (l && !l.hidden) l.click();
      }
    });
    await sleep(300);
    for (const id of ['l4-cp1-a', 'l4-cp1-c', 'l4-cp2-a', 'l4-cp2-b', 'l4-ex-strict', 'l4-ex-rankbug']) {
      const el = await p.$('#' + id); await el.screenshot({ path: path.join(SCRATCH, 'shots', `l04-${id}-${w}.png`) });
    }
  }
  await b.close();
})();
