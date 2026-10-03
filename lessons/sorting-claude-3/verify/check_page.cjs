/* Headless page checker.
 *
 * Usage:  node check_page.cjs <file.html> [--click]
 *
 * Loads the page from file:// in headless Chrome (puppeteer-core, executable /usr/bin/google-chrome),
 * and collects console errors/warnings, page errors and failed requests (Google Fonts failures are
 * reported but tolerated, since they happen offline). At a 390px viewport it checks that
 * document.documentElement.scrollWidth <= 390. Full-page screenshots at 1280 and 390 go to
 * $SCRATCH/shots/<name>-<width>.png (SCRATCH defaults to the session scratchpad).
 * With --click it clicks every button inside .ex, .stepper and .predict once (and the first option
 * of every mcq) and re-checks for errors and overflow.
 * Prints a JSON summary; exits non-zero on any error.
 * puppeteer-core is resolved from $PUPPETEER_DIR or the session scratchpad's node_modules.
 */
const path = require('path');
const fs = require('fs');
const SCRATCH = process.env.SCRATCH || '/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer = require(path.join(process.env.PUPPETEER_DIR || path.join(SCRATCH, 'node_modules'), 'puppeteer-core'));

(async () => {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  const click = args.includes('--click');
  if (!file) { console.error('usage: node check_page.cjs <file.html> [--click]'); process.exit(2); }
  const abs = path.resolve(file);
  const name = path.basename(abs, path.extname(abs));
  const shots = path.join(SCRATCH, 'shots');
  fs.mkdirSync(shots, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const errors = [], warnings = [], failed = [], tolerated = [];
  const result = { file: abs, errors, warnings, failedRequests: failed, toleratedFailures: tolerated, widths: {}, clicks: 0 };
  try {
    const page = await browser.newPage();
    page.on('console', m => {
      const t = m.type(), txt = m.text();
      if (t === 'error') { if (/Failed to load resource/.test(txt) && /fonts\.g/.test(m.location().url || '')) tolerated.push(txt); else errors.push('console: ' + txt + ' @' + (m.location().url || '')); }
      else if (t === 'warning') warnings.push(txt);
    });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => {
      const u = r.url();
      (/fonts\.(googleapis|gstatic)\.com/.test(u) ? tolerated : failed).push(u + ' ' + (r.failure() && r.failure().errorText));
    });
    page.on('response', r => { if (r.status() >= 400 && !/fonts\.g/.test(r.url())) failed.push(r.url() + ' ' + r.status()); });

    async function overflow(w) {
      return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    }
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('file://' + abs, { waitUntil: 'load', timeout: 30000 }).catch(e => errors.push('goto: ' + e.message));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(shots, name + '-1280.png'), fullPage: true });
    result.widths[1280] = await overflow();

    await page.setViewport({ width: 390, height: 800 });
    await new Promise(r => setTimeout(r, 500));
    const o = await overflow();
    result.widths[390] = o;
    if (o.sw > 390) {
      errors.push('horizontal overflow at 390px: scrollWidth=' + o.sw);
      const culprits = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > 391 && r.width > 0) out.push(e.tagName + '.' + e.className + ' right=' + Math.round(r.right)); });
        return out.slice(0, 12);
      });
      result.overflowCulprits = culprits;
    }
    await page.screenshot({ path: path.join(shots, name + '-390.png'), fullPage: true });

    if (click) {
      const n = await page.evaluate(async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        let count = 0;
        const clickAll = async sel => {
          const list = Array.from(document.querySelectorAll(sel));
          for (const b of list) { if (b.disabled) continue; try { b.click(); count++; } catch (e) { } await sleep(20); }
        };
        // first option of every mcq
        for (const o of document.querySelectorAll('.ex[data-type="mcq"] .ex-options > li:first-child .opt')) { o.click(); count++; await sleep(10); }
        // continue anyway on gates
        for (const b of document.querySelectorAll('.gate-bar .linkbtn')) { b.click(); count++; }
        await clickAll('.ex button, .stepper button, .predict button');
        // lines exercises
        for (const l of document.querySelectorAll('.ex[data-type="lines"] .cl')) { l.click(); count++; }
        // poset nodes
        const nodes = document.querySelectorAll('.pv-svg .node.can');
        if (nodes.length > 1) { nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(10); const ns = document.querySelectorAll('.pv-svg .node.can'); ns[1].dispatchEvent(new MouseEvent('click', { bubbles: true })); }
        await sleep(1200);
        // pause any playing stepper
        for (const b of document.querySelectorAll('.stepper .btn')) { if (/pause/i.test(b.textContent)) b.click(); }
        return count;
      });
      result.clicks = n;
      await new Promise(r => setTimeout(r, 400));
      const o2 = await overflow();
      result.widths['390-after-click'] = o2;
      if (o2.sw > 390) errors.push('horizontal overflow at 390px after clicks: scrollWidth=' + o2.sw);
      await page.screenshot({ path: path.join(shots, name + '-390-clicked.png'), fullPage: true });
      await page.setViewport({ width: 1280, height: 900 });
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(shots, name + '-1280-clicked.png'), fullPage: true });
    }
  } catch (e) {
    errors.push('checker: ' + e.message);
  } finally {
    await browser.close();
  }
  result.ok = errors.length === 0 && failed.length === 0;
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
})();
