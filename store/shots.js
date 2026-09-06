/**
 * Capture App Store screenshots from the Expo web build with Playwright at iPhone 6.7" scale (1290x2796).
 *   node store/shots.js   (expo web on http://localhost:8088, playwright in $PW)
 * Output: store/raw/01..06.png + store/captions.json → python3 store/compose.py
 */
const path = require('path');
const fs = require('fs');
const PW = process.env.PW || path.join(process.env.HOME, '.claude/jobs/5f43ca6b/tmp/pw/node_modules/playwright');
const { chromium } = require(PW);
const BASE = process.env.BASE || 'http://localhost:8088';
const OUT = path.join(__dirname, 'raw');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  ['01', 'porch', 'Put out a bowl.\nSee who comes.'],
  ['02', 'traces', 'They visit while you’re away\nand leave a note.'],
  ['03', 'catbook', 'Thirty-one neighbourhood cats\nto collect.'],
  ['04', 'cat&cat=biscuit', 'Pet them. Bond grows.\nMementos follow.'],
  ['05', 'shop', 'Better food, rarer cats.\nNo ads, ever.'],
  ['06', 'club&club=0', 'The Cat Club keeps\nthe bowl full.'],
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  for (const [n, demo] of SHOTS) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?demo=${demo}&snap=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `${n}.png`) });
    await page.close();
    console.log('captured', n, demo);
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'captions.json'), JSON.stringify(SHOTS.map(([n, , c]) => [n, c])));
})();
