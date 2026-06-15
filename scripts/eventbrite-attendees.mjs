// Fetch every meetup's attendees from the Eventbrite API and merge them into the
// R2 source of truth (attendees/<slug>.csv). Re-runnable (dedups on email).
//
// Config from .env (see .env.example): EVENTBRITE_TOKEN, CLOUDFLARE_ACCOUNT_ID,
// R2_BUCKET. Run:  npm run import:eventbrite [-- --dry-run]   (needs wrangler login).
// Eventbrite events are matched to our slugs via the eventbriteUrl IDs in
// src/data/events/*.yaml.
import { writeFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const TOKEN = process.env.EVENTBRITE_TOKEN;
const BUCKET = process.env.R2_BUCKET || 'cloudnative-lv';
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const HEADER = ['email', 'name', 'source', 'event', 'added'];
if (!TOKEN) { console.error('Missing EVENTBRITE_TOKEN — copy .env.example to .env and fill it in.'); process.exit(1); }
if (!ACCOUNT) { console.error('Missing CLOUDFLARE_ACCOUNT_ID — see .env.'); process.exit(1); }
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT };

// --- Eventbrite event id -> our slug, from the event YAMLs ---
const dir = 'src/data/events';
const slugByEb = {};
for (const f of (await readdir(dir)).filter((f) => f.endsWith('.yaml'))) {
  const txt = await readFile(path.join(dir, f), 'utf8');
  const slug = (txt.match(/slug:\s*"?([^"\n]+)"?/) || [])[1]?.trim();
  const eb = (txt.match(/eventbriteUrl:\s*"?https:\/\/www\.eventbrite\.com\/e\/(\d+)/) || [])[1];
  if (slug && eb) slugByEb[eb] = slug;
}

// --- tiny CSV parser/writer (RFC-4180-ish) ---
function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false;
  const push = () => { row.push(field); field = ''; };
  const endRow = () => { push(); if (row.length > 1 || row[0] !== '') rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') push();
    else if (c === '\n') endRow();
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) endRow();
  return rows;
}
const cell = (s) => (/[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

// --- Eventbrite ---
async function ebGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Eventbrite ${res.status}: ${await res.text()}`);
  return res.json();
}
async function fetchAttendees(ebId) {
  const out = [];
  const base = `https://www.eventbriteapi.com/v3/events/${ebId}/attendees/`;
  let url = base;
  for (;;) {
    const d = await ebGet(url);
    for (const a of d.attendees || []) {
      if (a.cancelled || a.refunded) continue;
      const email = String(a.profile?.email || '').trim().toLowerCase();
      if (!email) continue;
      out.push({ email, name: String(a.profile?.name || '').trim(), added: String(a.created || '').slice(0, 10) });
    }
    if (d.pagination?.has_more_items && d.pagination?.continuation) url = `${base}?continuation=${encodeURIComponent(d.pagination.continuation)}`;
    else break;
  }
  return out;
}

// --- R2 via wrangler ---
function r2Read(key) {
  try {
    const out = execFileSync('npx', ['wrangler', 'r2', 'object', 'get', `${BUCKET}/${key}`, '--remote', '--pipe'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env });
    const rows = parseCsv(out); const map = new Map();
    if (rows.length) {
      const h = rows[0].map((s) => s.trim().toLowerCase()); const idx = (n) => h.indexOf(n);
      for (const r of rows.slice(1)) {
        const rec = {}; HEADER.forEach((k) => { rec[k] = idx(k) >= 0 ? (r[idx(k)] || '').trim() : ''; });
        if (rec.email) map.set(rec.email.toLowerCase(), rec);
      }
    }
    return map;
  } catch (err) {
    const msg = `${err.stderr || ''}${err.stdout || ''}${err.message || ''}`;
    if (/not exist|not found|404|NoSuchKey/i.test(msg)) return new Map();
    console.error(`Failed to read ${key} from R2 (aborting):\n${msg.trim()}`); process.exit(1);
  }
}
function r2Write(key, csv) {
  const tmp = path.join(os.tmpdir(), key.replace(/\//g, '_'));
  writeFileSync(tmp, csv);
  try {
    execFileSync('npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`, '--remote', '--file', tmp, '--content-type', 'text/csv'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env });
  } catch (err) {
    throw new Error(`r2 put ${key} failed: ${String(err.stderr || err.stdout || err.message || '').trim()}`);
  }
}

// --- main ---
let grand = 0;
for (const [eb, slug] of Object.entries(slugByEb)) {
  const att = await fetchAttendees(eb);
  const merged = r2Read(`attendees/${slug}.csv`);
  let added = 0;
  for (const a of att) {
    if (merged.has(a.email)) continue;
    merged.set(a.email, { email: a.email, name: a.name, source: 'eventbrite', event: slug, added: a.added });
    added += 1;
  }
  const rows = [HEADER, ...[...merged.values()].map((r) => HEADER.map((k) => r[k] ?? ''))];
  const csv = rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
  console.log(`${slug}: ${att.length} on Eventbrite -> ${merged.size} total (+${added} new)${DRY ? '  [dry-run]' : ''}`);
  if (!DRY) r2Write(`attendees/${slug}.csv`, csv);
  grand += att.length;
}
console.log(`\n${grand} Eventbrite attendees across ${Object.keys(slugByEb).length} events${DRY ? ' (dry run — R2 not written)' : ' -> R2'}`);
