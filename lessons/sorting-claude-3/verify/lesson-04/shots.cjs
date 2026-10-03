const path = require('path');
const SCRATCH = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  for (const w of [1280, 390]) {
    await p.setViewport({ width: w, height: 900 });
    await p.goto('file://' + path.resolve(__dirname, '../../lesson-04.html')); await sleep(500);
    // advance fig1 to step ~12 on default
    for (let k = 0; k < 15; k++) await p.evaluate(() => Array.from(document.querySelectorAll('#fig1-stepper .st-controls .btn')).find(b => b.textContent.includes('Forward')).click());
    await sleep(300);
    for (const id of ['fig-1', 'fig-2', 'tbl-2']) {
      const el = await p.$('#' + id); await el.screenshot({ path: path.join(SCRATCH, 'shots', `l04-${id}-${w}.png`) });
    }
  }
  await b.close();
})();
