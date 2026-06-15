// Update the common CRM (R2 subscribers.csv) from a generic contact CSV (e.g. a Zoho
// Campaigns export) and/or by rolling every per-event roster (attendees/*.csv) into it.
//
//   npm run import:subscribers -- --source zoho data/zoho.csv
//   npm run import:subscribers -- --from-r2-attendees
//   npm run import:subscribers -- --source zoho data/zoho.csv --from-r2-attendees --dry-run
//
// Flexible columns: email / first / last / name / linkedin. Idempotent per source.
import { readFile } from 'node:fs/promises';
import { parseCsv, norm, lower, stripBom, headerFinder } from './lib/csv.mjs';
import { r2ReadText } from './lib/r2.mjs';
import { eventSlugs } from './lib/events.mjs';
import { makeContact, upsertCrm } from './lib/crm.mjs';

const argv = process.argv.slice(2);
const opts = { source: '', dryRun: false, fromAttendees: false };
const rest = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--source') opts.source = argv[++i];
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--from-r2-attendees') opts.fromAttendees = true;
  else if (a === '--help' || a === '-h') opts.help = true;
  else rest.push(a);
}
const input = rest[0];
if (opts.help || (!input && !opts.fromAttendees)) {
  console.log('Usage: node scripts/import-subscribers.mjs [--source <name>] [--from-r2-attendees] [--dry-run] [<contacts.csv>]');
  process.exit(opts.help ? 0 : 1);
}

const contacts = [];

// 1) a generic contacts CSV (Zoho export, a hand-built list, etc.)
if (input) {
  const source = opts.source || 'csv';
  const rows = parseCsv(stripBom(await readFile(input, 'utf8')));
  if (rows.length < 2) { console.error(`No data rows in ${input}.`); process.exit(1); }
  const find = headerFinder(rows[0]);
  const col = {
    email: find(['email', 'e-mail', 'email address', 'contact email', 'email id', 'primary email']),
    name: find(['name', 'full name', 'contact name']),
    first: find(['first name', 'first', 'firstname', 'given name']),
    last: find(['last name', 'last', 'lastname', 'surname', 'family name']),
    linkedin: find(['linkedin', 'linkedin url', 'linkedin profile', 'linkedin handle']),
  };
  let read = 0;
  for (const r of rows.slice(1)) {
    const get = (i) => (i >= 0 ? norm(r[i]) : '');
    const c = makeContact({
      email: get(col.email), first: get(col.first), last: get(col.last),
      name: get(col.name), linkedin: get(col.linkedin), source,
    });
    if (c.email || c.linkedin || c.first || c.last) { contacts.push(c); read++; }
  }
  console.log(`Read ${read} contacts from ${input} (source=${source}).`);
}

// 2) roll every per-event roster into the CRM (keeps each row's own source)
if (opts.fromAttendees) {
  let rolled = 0;
  for (const slug of await eventSlugs()) {
    const text = r2ReadText(`attendees/${slug}.csv`);
    if (!text) continue;
    const rows = parseCsv(text); const h = rows[0].map(lower); const idx = (n) => h.indexOf(n);
    for (const r of rows.slice(1)) {
      const email = idx('email') >= 0 ? norm(r[idx('email')]) : '';
      if (!email) continue;
      contacts.push(makeContact({
        email,
        name: idx('name') >= 0 ? norm(r[idx('name')]) : '',
        source: (idx('source') >= 0 && norm(r[idx('source')])) || 'eventbrite',
        event: slug,
        added: idx('added') >= 0 ? norm(r[idx('added')]) : '',
      }));
      rolled++;
    }
  }
  console.log(`Rolled ${rolled} attendee rows from R2 into the CRM batch.`);
}

if (!contacts.length) { console.error('Nothing to import.'); process.exit(1); }
const crm = upsertCrm(contacts, { dryRun: opts.dryRun });
console.log(`CRM (subscribers.csv): ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)${opts.dryRun ? ' [dry run — R2 not written]' : ''}`);
