// Gallery smoke test: success path (mocked Commons API) + failure path (API down).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import { readFileSync } from 'fs';
import { extname } from 'path';

const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

// 1x1 red PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const server = http.createServer((req, res) => {
  const path = req.url.split('?')[0];
  if (path === '/img.png') { res.writeHead(200, {'Content-Type':'image/png'}); return res.end(PNG); }
  try {
    const body = readFileSync(REPO + (path === '/' ? '/index.html' : path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nope'); }
});
await new Promise(r => server.listen(8901, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let failures = 0;

async function run(name, mockApi, expectSuccess) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  // Leaflet CDN is aborted in this test, so its "L is not defined" is expected noise
  page.on('pageerror', e => { if (!String(e).includes('L is not defined')) errors.push(String(e)); });

  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.route('**/cdnjs.cloudflare.com/**', r => r.abort());
  await page.route('**/*.tile.opentopomap.org/**', r => r.abort());
  await page.route('**/tile.openstreetmap.org/**', r => r.abort());
  await page.route('**/upload.wikimedia.org/**', r =>
    r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));

  if (mockApi) {
    await page.route('**/commons.wikimedia.org/w/api.php*', route => {
      const u = new URL(route.request().url());
      const titles = decodeURIComponent(u.searchParams.get('titles')).split('|');
      const normalized = [], pages = {};
      titles.forEach((t, i) => {
        // normalize like the real API: nothing to do for spaces; pretend the 2nd title is MISSING
        if (i === 1) { pages[`-${i}`] = { title: t, missing: '' }; return; }
        pages[`${100 + i}`] = { title: t, imageinfo: [{ thumburl: `https://upload.wikimedia.org/fake/${i}.png` }] };
      });
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ query: { normalized, pages } }) });
    });
  } else {
    await page.route('**/commons.wikimedia.org/**', r => r.abort());
  }

  await page.goto('http://127.0.0.1:8901/day03.html', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const slides = await page.locator('.gal-slide').count();
  const fallback = await page.locator('.gal-fallback').count();
  const cap = await page.locator('.gal-cap').textContent().catch(() => '');
  const count = await page.locator('.gal-count').textContent().catch(() => '');
  const dots = await page.locator('.gal-dot').count();

  let verdict;
  if (expectSuccess) {
    // 8 candidates, 1 mocked missing -> 7 slides
    verdict = slides === 7 && fallback === 0 && count.trim() === '1 / 7' && dots === 7 && errors.length === 0;
    if (verdict) { // exercise next button
      await page.locator('.gal-btn.next').click();
      await page.waitForTimeout(600);
      const c2 = await page.locator('.gal-count').textContent();
      verdict = c2.trim() === '2 / 7';
      if (!verdict) console.log(`  next-button count: "${c2}"`);
    }
  } else {
    verdict = fallback === 1 && slides === 0 && errors.length === 0;
  }
  console.log(`${verdict ? 'PASS' : 'FAIL'} ${name}: slides=${slides} fallback=${fallback} cap="${(cap||'').trim()}" count="${(count||'').trim()}" dots=${dots} jsErrors=${errors.length}`);
  errors.forEach(e => console.log('   pageerror:', e));
  if (!verdict) failures++;
  await page.close();
}

await run('API up, one file missing', true, true);
await run('API + images unreachable', false, false);

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
