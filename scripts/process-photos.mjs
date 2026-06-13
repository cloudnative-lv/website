// Resize hand-picked event photos into the site.
//
// Workflow:
//   1. Drop chosen full-res photos into photos-inbox/<event-id>/  (one folder per
//      event, named exactly like the event id, e.g. 2025-10-15-meetup-002).
//      Order is by filename, so prefix them 01-, 02-, ... to control gallery order.
//   2. npm run process:photos
//      -> resizes each to 800px wide and writes photo-01.jpg, photo-02.jpg, ...
//         into src/assets/events/<event-id>/ (the gallery auto-discovers them).
//   3. Review, then commit src/assets/events/. photos-inbox/ is gitignored.
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const INBOX = 'photos-inbox';
const OUT_BASE = 'src/assets/events';
const IMG = /\.(jpe?g|png|webp|heic|heif)$/i;

if (!existsSync(INBOX)) {
  console.log(`No ${INBOX}/ folder — nothing to do.`);
  process.exit(0);
}

const eventDirs = (await readdir(INBOX, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (!eventDirs.length) {
  console.log(`No event folders in ${INBOX}/. Create ${INBOX}/<event-id>/ and add photos.`);
  process.exit(0);
}

let total = 0;
const failures = [];
for (const id of eventDirs) {
  const srcDir = path.join(INBOX, id);
  const files = (await readdir(srcDir)).filter((f) => IMG.test(f)).sort();
  if (!files.length) {
    console.log(`• ${id}: no images, skipped`);
    continue;
  }
  const outDir = path.join(OUT_BASE, id);
  await mkdir(outDir, { recursive: true });
  let n = 0;
  for (const f of files) {
    try {
      const name = `photo-${String(n + 1).padStart(2, '0')}.jpg`;
      await sharp(path.join(srcDir, f))
        .rotate()
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(outDir, name));
      n += 1;
    } catch (err) {
      failures.push(`${id}/${f}: ${err.message}`);
    }
  }
  total += n;
  console.log(`✓ ${id}: ${n} photos -> ${outDir}/photo-01..${String(n).padStart(2, '0')}.jpg`);
}

console.log(`\nDone — ${total} photos processed. Review the galleries, then commit src/assets/events/.`);
if (failures.length) {
  console.error(`\n${failures.length} failed (HEIC may need conversion to JPG first):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
