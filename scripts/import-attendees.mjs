// Import an attendee list (Eventbrite / OCG / LinkedIn CSV export) into the R2
// source of truth: attendees/<event-slug>.csv in the cloudnative-lv bucket.
//
// Reads the export, maps its columns (email + name, however they're labelled),
// dedups on email, merges with whatever is already in R2, and writes it back —
// so re-running with a fresh export only ever appends new people.
//
// Usage:
//   node scripts/import-attendees.mjs --event <slug> [--source <name>] <list.csv>
//   node scripts/import-attendees.mjs --event meetup-006 --source eventbrite list.csv
//
// Flags:
//   --event <slug>     (required) which event the list belongs to
//   --source <name>    provenance recorded per row (default: csv) e.g. eventbrite|ocg|linkedin
//   --dry-run          parse + merge, print the summary, but don't write to R2
//   --out <file>       also write the merged CSV to a local file
//   --bucket <name>    R2 bucket (default: cloudnative-lv)
//
// Auth: uses `wrangler` (run `wrangler login` once). Canonical columns:
//   email,name,source,event,added
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

// --- args ---
const argv = process.argv.slice(2);
const opts = { source: 'csv', bucket: 'cloudnative-lv', dryRun: false };
const rest = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--event') opts.event = argv[++i];
  else if (a === '--source') opts.source = argv[++i];
  else if (a === '--bucket') opts.bucket = argv[++i];
  else if (a === '--out') opts.out = argv[++i];
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--help' || a === '-h') opts.help = true;
  else rest.push(a);
}
const input = rest[0];

if (opts.help || !opts.event || !input) {
  console.log(`Usage: node scripts/import-attendees.mjs --event <slug> [--source <name>] [--dry-run] [--out <file>] <list.csv>`);
  process.exit(opts.help ? 0 : 1);
}

const key = `attendees/${opts.event}.csv`;
const target = `${opts.bucket}/${key}`;
const wrangler = ['--yes', 'wrangler@4'];

// --- tiny RFC-4180-ish CSV reader/writer (no deps) ---
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const push = () => { row.push(field); field = ''; };
  const endRow = () => { push(); if (row.length > 1 || row[0] !== '') rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') push();
    else if (c === '\n') endRow();
    else if (c === '\r') { /* swallow; \n ends the row */ }
    else field += c;
  }
  if (field !== '' || row.length) endRow();
  return rows;
}
const cell = (s) => (/[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
const toCsv = (rows) => rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';

const norm = (s) => String(s ?? '').trim();
const lower = (s) => norm(s).toLowerCase();
const isEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

function columnMap(headers) {
  const h = headers.map(lower);
  const find = (names) => h.findIndex((x) => names.includes(x));
  return {
    email: find(['email', 'e-mail', 'email address', 'attendee email', 'buyer email']),
    name: find(['name', 'full name', 'attendee name', 'buyer name']),
    first: find(['first name', 'first', 'firstname', 'given name']),
    last: find(['last name', 'last', 'lastname', 'surname', 'family name']),
  };
}

// --- read the export ---
const raw = (await readFile(input, 'utf8')).replace(/^﻿/, '');
const inRows = parseCsv(raw);
if (inRows.length < 2) { console.error(`No data rows in ${input}.`); process.exit(1); }
const col = columnMap(inRows[0]);
if (col.email < 0) {
  console.error(`Could not find an email column. Headers: ${inRows[0].join(', ')}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const incoming = [];
for (const r of inRows.slice(1)) {
  const email = lower(r[col.email]);
  if (!isEmail(email)) continue;
  const name = col.name >= 0
    ? norm(r[col.name])
    : [r[col.first], r[col.last]].map(norm).filter(Boolean).join(' ');
  incoming.push({ email, name, source: opts.source, event: opts.event, added: today });
}
if (!incoming.length) { console.error('No valid email rows found in the export.'); process.exit(1); }

// --- pull what's already in R2 ---
const HEADER = ['email', 'name', 'source', 'event', 'added'];
function parseExisting(text) {
  const rows = parseCsv(text);
  if (!rows.length) return new Map();
  const h = rows[0].map(lower);
  const idx = (n) => h.indexOf(n);
  const map = new Map();
  for (const r of rows.slice(1)) {
    const rec = {};
    HEADER.forEach((k) => { rec[k] = idx(k) >= 0 ? norm(r[idx(k)]) : ''; });
    if (rec.email) map.set(lower(rec.email), rec);
  }
  return map;
}
function readExisting() {
  try {
    const out = execFileSync('npx', [...wrangler, 'r2', 'object', 'get', target, '--remote', '--pipe'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return parseExisting(out);
  } catch (err) {
    const msg = `${err.stderr || ''}${err.stdout || ''}${err.message || ''}`;
    if (/not exist|not found|404|NoSuchKey/i.test(msg)) return new Map(); // first import for this event
    // A real failure (auth / network / wrangler). Abort rather than risk
    // overwriting the existing list with only the new rows.
    console.error(`Failed to read ${target} from R2 (aborting so the existing list is not overwritten):\n${msg.trim()}`);
    process.exit(1);
  }
}

const merged = readExisting();
const existingCount = merged.size;
let added = 0;
for (const rec of incoming) {
  if (merged.has(rec.email)) continue; // keep the original row (and its added date)
  merged.set(rec.email, rec);
  added += 1;
}

const rows = [HEADER, ...[...merged.values()].map((r) => HEADER.map((k) => r[k] ?? ''))];
const csv = toCsv(rows);

// --- report ---
console.log(`Event:      ${opts.event}  (${target})`);
console.log(`Export:     ${input}  [${incoming.length} valid rows, source=${opts.source}]`);
console.log(`In R2:      ${existingCount} existing → ${merged.size} total  (+${added} new, ${incoming.length - added} already present)`);

if (opts.out) { await writeFile(opts.out, csv); console.log(`Wrote local copy → ${opts.out}`); }

if (opts.dryRun) { console.log('Dry run — R2 not written.'); process.exit(0); }
if (added === 0 && !opts.out) { console.log('Nothing new to write.'); process.exit(0); }

// --- write back to R2 ---
const tmp = path.join(os.tmpdir(), `attendees-${opts.event}.csv`);
await writeFile(tmp, csv);
execFileSync('npx', [...wrangler, 'r2', 'object', 'put', target, '--remote', '--file', tmp, '--content-type', 'text/csv'],
  { stdio: 'inherit' });
console.log(`Updated ${target} (${merged.size} attendees).`);
