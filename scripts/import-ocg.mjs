// Parse an OCG / CNCF community MEMBERS export (tab + newline text) into the CRM.
//
// Manual step: open the chapter's Members page on the community platform, select the
// members table and copy it, then paste into data/ocg.txt (screenshots in docs/).
//   npm run import:ocg [-- --in data/ocg.txt --dry-run]
// OCG rows carry no email/LinkedIn — they land as source=ocg (name only). A few rows
// whose name field is actually an email address are captured as email.
// (For per-event OCG attendee CSVs, see import:attendees.)
import { readFile } from 'node:fs/promises';
import { parseOcgMembers } from './lib/ocg.mjs';
import { upsertCrm } from './lib/crm.mjs';

const argv = process.argv.slice(2);
const opts = { in: 'data/ocg.txt', dryRun: false, parseOnly: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--in') opts.in = argv[++i];
  else if (a === '--dry-run') opts.dryRun = true;
  else if (a === '--parse-only') opts.parseOnly = true;
}

const contacts = parseOcgMembers(await readFile(opts.in, 'utf8'));
if (!contacts.length) { console.error(`No members parsed from ${opts.in}.`); process.exit(1); }

if (opts.parseOnly) {
  console.log(`Parsed ${contacts.length} OCG members from ${opts.in}.`);
  process.exit(0);
}

console.log(`Parsed ${contacts.length} OCG members from ${opts.in}`);
const crm = upsertCrm(contacts, { dryRun: opts.dryRun });
console.log(`CRM (subscribers.csv): ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)${opts.dryRun ? ' [dry run — R2 not written]' : ''}`);
