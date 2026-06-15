// Parse LinkedIn EVENT attendee HTML exports (data/linkedin-<N>.html, one per meetup,
// N = meetup number) into the per-event roster attendees/<slug>.csv and the common CRM
// (source=linkedin, with the profile URL). Emailless — keyed by name.
//
// Manual step: open the LinkedIn event -> Attendees, scroll so every attendee loads,
// then save the page as HTML to data/linkedin-<N>.html.
//   npm run import:linkedin-events [-- --dry-run]
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { readRoster, writeRoster, rosterId } from './lib/roster.mjs';
import { readEvents } from './lib/events.mjs';
import { parseLinkedinHtml } from './lib/linkedin.mjs';
import { makeContact, upsertCrm, today } from './lib/crm.mjs';

const DRY = process.argv.includes('--dry-run');
const DATA = 'data';

// meetup number -> event slug
const slugByNum = {};
for (const e of await readEvents()) { const m = e.slug.match(/meetup-0*(\d+)/); if (m) slugByNum[+m[1]] = e.slug; }

const files = (await readdir(DATA)).filter((f) => /^linkedin-\d+\.html$/i.test(f)).sort();
if (!files.length) { console.error('No data/linkedin-<N>.html files found.'); process.exit(1); }

const crmContacts = [];
let grand = 0;
for (const f of files) {
  const num = +f.match(/linkedin-(\d+)\.html/i)[1];
  const slug = slugByNum[num];
  if (!slug) { console.warn(`Skip ${f}: no event for meetup #${num}.`); continue; }
  const people = parseLinkedinHtml(await readFile(path.join(DATA, f), 'utf8'));
  const key = `attendees/${slug}.csv`;
  const roster = readRoster(key);
  let added = 0;
  for (const p of people) {
    crmContacts.push(makeContact({ name: p.name, linkedin: p.profile_url, source: 'linkedin', event: slug }));
    const id = rosterId('', p.name);
    if (roster.has(id)) continue;
    roster.set(id, { email: '', name: p.name, source: 'linkedin', event: slug, added: today() });
    added += 1;
  }
  console.log(`${f} -> ${slug}: ${people.length} attendees, roster +${added} (${roster.size})${DRY ? '  [dry-run]' : ''}`);
  if (!DRY) writeRoster(key, roster);
  grand += people.length;
}

const crm = upsertCrm(crmContacts, { dryRun: DRY });
console.log(`\nLinkedIn events: ${grand} attendees across ${files.length} files.`);
console.log(`CRM (subscribers.csv): ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)${DRY ? ' [dry run — R2 not written]' : ''}`);
