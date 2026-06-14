// Generate every event artifact from the running site into dist/artifacts/.
//
// Usage:
//   ARTIFACT_BASE=http://localhost:5173 node scripts/generate-artifacts.mjs [slugFilter]
//
// The matrix + copy live in the app (src/artifacts/*) and are exposed at
// /kit/manifest. This script reads that manifest and produces, per event:
//   <variant>.png / .webp   screenshots of /kit/:slug/raw/:variant
//   qr.png, qr.svg          QR of the canonical event URL
//   announcement.md, speaker-intro-*.md   deterministic social copy
//   manifest.json           index of the event's files
// plus brand/ (OCG banners) and a top-level manifest.json.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import QRCode from 'qrcode';

const BASE = process.env.ARTIFACT_BASE || 'http://localhost:4173';
const OUT = path.resolve('dist/artifacts');
const slugFilter = process.argv[2] || '';
const QR_OPTS = { margin: 1, color: { dark: '#881337', light: '#ffffff' } };

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

// 1) Read the manifest. (page.$eval is Playwright's DOM API — it runs the
// selector callback in the page and returns text; not JavaScript eval. The text
// is parsed with JSON.parse, never executed.)
await page.goto(`${BASE}/kit/manifest`, { waitUntil: 'networkidle' });
const data = JSON.parse(await page.$eval('[data-manifest]', (el) => el.textContent));
let images = data.images;
let events = data.events;
if (slugFilter) {
  images = images.filter((a) => a.slug.includes(slugFilter));
  events = events.filter((e) => e.slug.includes(slugFilter));
}
console.log(`${images.length} images, ${events.length} events${slugFilter ? ` (filter: ${slugFilter})` : ''}`);

const filesByDir = {}; // eventId -> [filenames] for per-event manifest.json
const record = (id, file) => (filesByDir[id] ||= []).push(file);
const failures = [];

// 2) Screenshot image artifacts.
let ok = 0;
for (const a of images) {
  const dir = path.join(OUT, a.eventId);
  await mkdir(dir, { recursive: true });
  await page.setViewportSize({ width: a.width, height: a.height });
  await page.goto(`${BASE}/kit/${a.slug}/raw/${a.variant}`, { waitUntil: 'networkidle' });

  const err = await page.$('[data-artifact-error]');
  if (err) { failures.push(`${a.eventId}/${a.variant}: ${(await err.textContent())?.trim()}`); continue; }
  const frame = await page.waitForSelector('[data-artifact-frame]', { timeout: 10_000 }).catch(() => null);
  if (!frame) { failures.push(`${a.eventId}/${a.variant}: no frame`); continue; }

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
  const png = await frame.screenshot({ type: 'png' });
  if (a.format === 'webp') await sharp(png).webp({ quality: 90 }).toFile(path.join(dir, a.filename));
  else await writeFile(path.join(dir, a.filename), png);
  record(a.eventId, a.filename);
  ok += 1;
  console.log(`✓ ${a.eventId}/${a.filename}`);
}

// 3) Per-event QR codes + social copy.
for (const ev of events) {
  const dir = path.join(OUT, ev.id);
  await mkdir(dir, { recursive: true });
  await QRCode.toFile(path.join(dir, 'qr.png'), ev.url, { ...QR_OPTS, width: 600 });
  await writeFile(path.join(dir, 'qr.svg'), await QRCode.toString(ev.url, { ...QR_OPTS, type: 'svg' }));
  await writeFile(path.join(dir, 'announcement.md'), ev.social.announcement);
  await writeFile(path.join(dir, 'eventbrite-description.md'), ev.social.eventbrite);
  record(ev.id, 'qr.png'); record(ev.id, 'qr.svg'); record(ev.id, 'announcement.md'); record(ev.id, 'eventbrite-description.md');
  for (const intro of ev.social.speakerIntros) {
    await writeFile(path.join(dir, intro.filename), intro.text);
    record(ev.id, intro.filename);
  }
  for (const ty of ev.social.speakerThankYous || []) {
    await writeFile(path.join(dir, ty.filename), ty.text);
    record(ev.id, ty.filename);
  }
  console.log(`✓ ${ev.id}/qr + social (${ev.social.speakerIntros.length} intros)`);
}

// 4) manifest.json per directory + a top-level index.
for (const [id, files] of Object.entries(filesByDir)) {
  await writeFile(path.join(OUT, id, 'manifest.json'), JSON.stringify({ id, files: files.sort() }, null, 2));
}
await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(
  { generatedFrom: BASE, dirs: Object.keys(filesByDir).sort() }, null, 2,
));

await browser.close();
console.log(`\n${ok}/${images.length} images generated → ${OUT}`);
if (failures.length) {
  console.error(`\n${failures.length} FAILED:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
