// Retrofit the historical Google Form feedback exports (data/feedback-<N>.xlsx, N =
// meetup number) into R2 feedback/<slug>.csv — the same file the feedback worker appends
// to. The xlsx is the authoritative historical record, so the CSV is fully rewritten from
// it (sorted by timestamp). That makes this idempotent AND a recovery tool: it restores a
// feedback CSV that was accidentally deleted from R2.
//
//   npm run import:feedback [-- --dry-run]
//
// Note: it overwrites feedback/<slug>.csv. For past events (Google Form era) the xlsx is
// the only source. Don't run it for an event whose feedback was collected only via the
// website worker form (there is no xlsx for those anyway).
import { readdir } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import { cell, norm } from './lib/csv.mjs';
import { r2WriteText } from './lib/r2.mjs';
import { readEvents } from './lib/events.mjs';

const DRY = process.argv.includes('--dry-run');
const HEADER = ['timestamp', 'overall', 'talks', 'organization', 'topics', 'comments'];
const isoTs = (v) => (v instanceof Date ? v.toISOString() : String(v ?? '').trim());
const rating = (v) => { const s = String(v ?? '').trim(); return /^[1-5]$/.test(s) ? s : ''; };

const events = await readEvents();
const slugByNum = {};
for (const e of events) { const m = e.slug.match(/meetup-0*(\d+)/); if (m) slugByNum[+m[1]] = e.slug; }

const files = (await readdir('data')).filter((f) => /^feedback-\d+\.xlsx$/i.test(f)).sort();
if (!files.length) { console.error('No data/feedback-<N>.xlsx files found in data/.'); process.exit(1); }

let grand = 0;
for (const f of files) {
  const num = +f.match(/feedback-(\d+)/i)[1];
  const slug = slugByNum[num];
  if (!slug) { console.warn(`Skip ${f}: no event for meetup #${num}.`); continue; }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(`data/${f}`);
  const ws = wb.worksheets[0];
  const rows = [];
  ws.eachRow((row, n) => {
    if (n === 1) return; // header
    const v = row.values; // 1-indexed (v[0] is undefined)
    const ts = isoTs(v[1]);
    if (!ts) return;
    rows.push([ts, rating(v[2]), rating(v[3]), rating(v[4]), norm(v[5]), norm(v[6])]);
  });
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const csv = [HEADER, ...rows].map((r) => r.map(cell).join(',')).join('\n') + '\n';
  console.log(`${f} -> feedback/${slug}.csv: ${rows.length} responses${DRY ? ' [dry-run]' : ' -> R2'}`);
  if (!DRY) r2WriteText(`feedback/${slug}.csv`, csv);
  grand += rows.length;
}
console.log(`\nFeedback retrofit: ${grand} responses across ${files.length} forms${DRY ? ' (dry run — R2 not written)' : ' written to R2'}.`);
