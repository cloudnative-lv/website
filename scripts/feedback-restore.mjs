// feedback:restore — reconcile the feedback worker's immutable audit log into the
// aggregate CSVs. The worker writes each submission to feedback/incoming/<event>/<ts>.json
// FIRST, then appends to feedback/<event>.csv; if that append ever fails (or the CSV is
// deleted), this op rebuilds the missing rows from the audit log. It MERGES (dedup by
// timestamp), so historical Google-Form rows imported via `import:feedback` are preserved.
//
//   npm run feedback:restore            # dry run — show what's missing
//   npm run feedback:restore -- --write # apply
//   npm run feedback:restore -- --event meetup-006-gpus-ai-agents --write
//
// Reads the live bucket through the S3 API (cache-immune).
import { s3Available, s3List, s3GetText } from './lib/s3.mjs';
import { parseCsv, cell, norm } from './lib/csv.mjs';
import { r2WriteText } from './lib/r2.mjs';
import { readEvents } from './lib/events.mjs';

if (!s3Available()) {
  console.error('feedback:restore needs the R2 S3 keys in .env (R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).');
  process.exit(1);
}

const WRITE = process.argv.includes('--write');
const evArg = process.argv.includes('--event') ? process.argv[process.argv.indexOf('--event') + 1] : '';
if (process.argv.includes('--event') && (!evArg || evArg.startsWith('--'))) {
  console.error('--event requires a slug value, e.g. --event meetup-006-gpus-ai-agents');
  process.exit(1);
}
const HEADER = ['timestamp', 'overall', 'talks', 'organization', 'topics', 'comments'];
const rating = (v) => { const s = String(v ?? '').trim(); return /^[1-5]$/.test(s) ? s : ''; };

const slugs = new Set((await readEvents()).map((e) => e.slug));

// Group the audit records by the <event> path segment the worker used.
const groups = new Map();
for (const o of await s3List('feedback/incoming/')) {
  const m = o.key.match(/^feedback\/incoming\/([^/]+)\/[^/]+\.json$/);
  if (!m) continue;
  if (!groups.has(m[1])) groups.set(m[1], []);
  groups.get(m[1]).push(o.key);
}

if (!groups.size) {
  console.log('No feedback audit records under feedback/incoming/ — nothing to restore.');
  process.exit(0);
}

let totalAdded = 0;
for (const [event, keys] of [...groups].sort()) {
  if (evArg && event !== evArg) continue;

  // Incoming rows from the audit JSONs (skip any unreadable/partial record rather than abort).
  const incoming = [];
  for (const k of keys) {
    const raw = await s3GetText(k);
    let j; try { j = JSON.parse(raw); } catch { j = null; }
    if (!j || !j.ts) { console.warn(`Skipping unreadable audit record: ${k}`); continue; }
    incoming.push([j.ts, rating(j.overall), rating(j.talks), rating(j.organization), norm(j.topics), norm(j.comments)]);
  }

  // Existing CSV rows, normalised to HEADER order (so a column reorder can't corrupt the merge).
  const all = parseCsv((await s3GetText(`feedback/${event}.csv`)) || '');
  const h = all.length ? all[0].map((s) => String(s).toLowerCase().trim()) : HEADER;
  const col = HEADER.map((c) => h.indexOf(c));
  // A real CSV missing an expected column would map to index -1 → silently blank that field on
  // rewrite. Skip the event rather than corrupt it.
  if (all.length && col.some((i) => i < 0)) {
    console.warn(`feedback/${event}.csv header missing columns (${HEADER.filter((_, i) => col[i] < 0).join(', ')}) — skipping.`);
    continue;
  }
  const existing = all.slice(1).filter((r) => r.length > 1).map((r) => HEADER.map((_, i) => norm(r[col[i]] ?? '')));

  const seen = new Set(existing.map((r) => r[0]));
  const fresh = incoming.filter((r) => r[0] && !seen.has(r[0]));
  const merged = [...existing, ...fresh].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  totalAdded += fresh.length;

  const flag = slugs.has(event) ? '' : '   ⚠ not a known event slug (test/orphan record)';
  console.log(`feedback/${event}.csv: ${existing.length} existing + ${fresh.length} from audit → ${merged.length}${flag}`);

  if (WRITE && fresh.length) {
    r2WriteText(`feedback/${event}.csv`, [HEADER, ...merged].map((r) => r.map(cell).join(',')).join('\n') + '\n');
  }
}

console.log(`\n${totalAdded} record(s) ${WRITE ? 'restored to R2' : 'recoverable (dry run — pass --write to apply)'}.`);
