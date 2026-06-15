// Generate the sponsor one-pager PDF from the live /sponsors page so it always matches
// the site. Run after `npm run build`, against the preview server (like the artifacts):
//   ARTIFACT_BASE=http://localhost:4173 node scripts/generate-sponsor-pdf.mjs
// Output: dist/sponsor-onepager.pdf (deployed + uploaded as a build artifact). Site
// chrome (nav/footer) is hidden via the `print:hidden` utilities in print media.
import { chromium } from '@playwright/test';
import path from 'node:path';

const BASE = process.env.ARTIFACT_BASE || 'http://localhost:4173';
const OUT = path.resolve('dist/sponsor-onepager.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/sponsors`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(150);
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
});
await browser.close();
console.log(`✓ sponsor one-pager → ${OUT}`);
