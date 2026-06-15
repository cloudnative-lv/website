// Fetch every meetup's attendees from the Eventbrite API into the per-event roster
// (attendees/<slug>.csv) AND roll them into the common CRM (subscribers.csv).
// Re-runnable — idempotent on email. Config from .env (see .env.example):
// EVENTBRITE_TOKEN, CLOUDFLARE_ACCOUNT_ID, R2_BUCKET.
//   npm run import:eventbrite [-- --dry-run]      (needs `wrangler login`)
// Eventbrite events are matched to our slugs via the eventbriteUrl ids in the YAMLs.
import { readRoster, writeRoster, rosterId } from './lib/roster.mjs';
import { slugByEventbriteId } from './lib/events.mjs';
import { makeContact, upsertCrm } from './lib/crm.mjs';
import { ebFetchAttendees } from './lib/eventbrite.mjs';

const DRY = process.argv.includes('--dry-run');
const TOKEN = process.env.EVENTBRITE_TOKEN;
if (!TOKEN) { console.error('Missing EVENTBRITE_TOKEN — copy .env.example to .env and fill it in.'); process.exit(1); }
if (!process.env.CLOUDFLARE_ACCOUNT_ID) { console.error('Missing CLOUDFLARE_ACCOUNT_ID — see .env.'); process.exit(1); }

const fetchAttendees = (ebId) => ebFetchAttendees(TOKEN, ebId);
const slugByEb = await slugByEventbriteId();
const crmContacts = [];
let grand = 0;
for (const [eb, slug] of Object.entries(slugByEb)) {
  const att = await fetchAttendees(eb);
  const roster = readRoster(`attendees/${slug}.csv`);
  let added = 0;
  for (const a of att) {
    crmContacts.push(makeContact({ email: a.email, name: a.name, source: 'eventbrite', event: slug, added: a.added }));
    const id = rosterId(a.email, a.name);
    if (roster.has(id)) continue;
    roster.set(id, { email: a.email, name: a.name, source: 'eventbrite', event: slug, added: a.added });
    added += 1;
  }
  console.log(`${slug}: ${att.length} on Eventbrite -> ${roster.size} roster (+${added})${DRY ? '  [dry-run]' : ''}`);
  if (!DRY) writeRoster(`attendees/${slug}.csv`, roster);
  grand += att.length;
}

const crm = upsertCrm(crmContacts, { dryRun: DRY });
console.log(`\nEventbrite: ${grand} attendees across ${Object.keys(slugByEb).length} events.`);
console.log(`CRM (subscribers.csv): ${crm.before} -> ${crm.after}  (+${crm.added} new, ${crm.updated} enriched)${DRY ? ' [dry run — R2 not written]' : ''}`);
