/* Extracts the page's running prose (the blocks the v3 manuscript rewrites) as raw text, TeX unrendered.
 * Usage: node prose_extract.cjs > prose.json   (used by prose_diff.py) */
const path = require('path');
const fs = require('fs');
const SCRATCH = '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(SCRATCH, 'node_modules', 'puppeteer-core'));
(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../../lesson-04.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setContent(html);
  const blocks = await p.evaluate(() => {
    const sel = '#where > p:not(.label), .lsec > p, #s02 > ol > li, #pr-candidates .reveal > p, #pr-reversed4 .reveal > p, #pr-rankties .reveal > p';
    return Array.from(document.querySelectorAll(sel)).map(e => ({ sec: (e.closest('section') || {}).id, text: e.textContent }));
  });
  console.log(JSON.stringify(blocks));
  await b.close();
})();
