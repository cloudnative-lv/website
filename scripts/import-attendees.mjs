// Import an attendee list (Eventbrite / OCG / LinkedIn export) into the per-event roster
// attendees/<slug>.csv AND roll the people into the common CRM (subscribers.csv).
//
// Handles both email-bearing exports (Eventbrite) and emailless name-only ones (OCG/Bevy
// attendee lists). Dedups on email when present, else on the (transliterated) name, and
// merges with what's already in R2 — re-running only appends new people.
//
// Usage:
//   node scripts/import-attendees.mjs --event <slug> [--source <name>] <list.csv>
//   node scripts/import-attendees.mjs data/event-<cncf-code>-attendees.csv   # auto-maps
// Flags:
//   --event <slug>   which event (auto-derived from an `event-<cncf-code>-attendees.csv`
//                    filename via the event YAML cncfUrl when omitted)
//   --source <name>  provenance per row (default: csv, or ocg for auto-mapped files)
//   --dry-run        parse + merge, print the summary, but don't write to R2
//   --out <file>     also write the merged roster CSV to a local file
//   --bucket <name>  R2 bucket (default: cloudnative-lv)
// Roster columns: email,name,source,event,added.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { norm, lower, isEmail, stripBom, headerFinder, parseCsv } from './lib/csv.mjs';
import { readRoster, writeRoster, serializeRoster, rosterId } from './lib/roster.mjs';
import { makeContact, upsertCrm, today } from './lib/crm.mjs';
import { slugByCncfCode, readEvents } from './lib/events.mjs';

const argv = process.argv.slice(2);
const opts = { source: '', bucket: 'cloudnative-lv', dryRun: false };
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
if (opts.help || !input) {
  console.log('Usage: node scripts/import-attendees.mjs [--event <slug>] [--source <name>] [--dry-run] [--out <file>] <list.csv>');
  process.exit(opts.help ? 0 : 1);
}

// Derive the event from the filename if not given: `ocg-event-<N>.csv` (N = meetup number)
// or `event-<cncf-code>-attendees.csv` (mapped via the event YAML cncfUrl).
if (!opts.event) {
  const base = path.basename(input);
  const num = (base.match(/^ocg-event-(\d+)\.csv$/i) || [])[1];
  const code = (base.match(/event-([a-z0-9]+)-attendees/i) || [])[1];
  if (num) {
    const slug = (await readEvents()).find((e) => +(e.slug.match(/meetup-0*(\d+)/)?.[1]) === +num)?.slug;
    if (slug) { opts.event = slug; if (!opts.source) opts.source = 'ocg'; }
  } else if (code) {
    const slug = (await slugByCncfCode())[code.toLowerCase()];
    if (slug) { opts.event = slug; if (!opts.source) opts.source = 'ocg'; }
  }
}
if (!opts.event) {
  console.error(`No --event given and none could be derived from "${path.basename(input)}". Pass --event <slug>.`);
  process.exit(1);
}
if (!opts.source) opts.source = 'csv';

const key = `attendees/${opts.event}.csv`;

// --- read the export ---
const inRows = parseCsv(stripBom(await readFile(input, 'utf8')));
if (inRows.length < 2) { console.error(`No data rows in ${input}.`); process.exit(1); }
const find = headerFinder(inRows[0]);
const col = {
  email: find(['email', 'e-mail', 'email address', 'attendee email', 'buyer email', 'contact email']),
  name: find(['name', 'full name', 'attendee name', 'buyer name']),
  first: find(['first name', 'first', 'firstname', 'given name']),
  last: find(['last name', 'last', 'lastname', 'surname', 'family name']),
};
if (col.email < 0 && col.name < 0 && col.first < 0 && col.last < 0) {
  console.error(`Could not find an email or name column. Headers: ${inRows[0].join(', ')}`);
  process.exit(1);
}

const incoming = [];
for (const r of inRows.slice(1)) {
  const rawEmail = col.email >= 0 ? lower(r[col.email]) : '';
  const email = isEmail(rawEmail) ? rawEmail : '';
  const name = col.name >= 0 ? norm(r[col.name]) : [r[col.first], r[col.last]].map(norm).filter(Boolean).join(' ');
  if (!email && !name) continue;
  incoming.push({ email, name, source: opts.source, event: opts.event, added: today() });
}
if (!incoming.length) { console.error('No valid rows found in the export.'); process.exit(1); }
const emailless = incoming.filter((r) => !r.email).length;

// --- merge into the per-event roster (email- or name-keyed) ---
const roster = readRoster(key, { bucket: opts.bucket });
const existing = roster.size;
let added = 0;
for (const rec of incoming) {
  const id = rosterId(rec.email, rec.name);
  if (roster.has(id)) continue;
  roster.set(id, rec); added += 1;
}

console.log(`Event:   ${opts.event}  (${opts.bucket}/${key})`);
console.log(`Export:  ${input}  [${incoming.length} rows, ${emailless} without email, source=${opts.source}]`);
console.log(`Roster:  ${existing} -> ${roster.size}  (+${added} new)`);
if (opts.out) { await writeFile(opts.out, serializeRoster(roster)); console.log(`Wrote local copy -> ${opts.out}`); }

// --- roll the same people into the common CRM ---
const crm = upsertCrm(
  incoming.map((r) => makeContact({ email: r.email, name: r.name, source: opts.source, event: opts.event, added: r.added })),
  { dryRun: opts.dryRun },
);
console.log(`CRM:     ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)`);

if (opts.dryRun) { console.log('Dry run — R2 not written.'); process.exit(0); }
if (added > 0) writeRoster(key, roster, { bucket: opts.bucket });
else console.log('Roster unchanged.');
console.log('Done.');
