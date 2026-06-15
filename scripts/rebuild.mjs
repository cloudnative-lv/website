// One-pass rebuild of the common CRM (subscribers.csv) + every per-event roster
// (attendees/<slug>.csv) from ALL local sources and the Eventbrite API, writing each R2
// object exactly once, then rendering the community + feedback reports from the in-memory
// data. Use this for a full rebuild — it's reliable even though `wrangler r2 object get`
// serves a cached copy (the incremental import:* ops are for spaced-out single updates).
//
//   npm run rebuild [-- --dry-run]
//
// Sources: subscribers.csv (seed) · data/linkedin-followers.html (LI followers) ·
// data/linkedin-<N>.html (LI event attendees) · data/ocg-followers.txt (OCG members) ·
// data/ocg-event-<N>.csv (OCG event attendees) · data/zoho-campaigns.csv · Eventbrite API.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseCsv, norm, headerFinder, stripBom } from './lib/csv.mjs';
import { parseCrm, serializeCrm, mergeContacts, makeContact, today, CRM_KEY } from './lib/crm.mjs';
import { r2ReadText, r2WriteText } from './lib/r2.mjs';
import { rosterId, serializeRoster } from './lib/roster.mjs';
import { readEvents, slugByEventbriteId } from './lib/events.mjs';
import { parseLinkedinHtml } from './lib/linkedin.mjs';
import { parseOcgMembers } from './lib/ocg.mjs';
import { ebFetchAttendees } from './lib/eventbrite.mjs';
import { renderCommunityReport, renderFeedbackReport, parseFeedbackCsv } from './lib/reports.mjs';

const DRY = process.argv.includes('--dry-run');
const DATA = 'data';
const has = async (f) => { try { await readFile(path.join(DATA, f)); return true; } catch { return false; } };
const read = async (f) => readFile(path.join(DATA, f), 'utf8');

const events = (await readEvents()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
const slugByNum = {};
for (const e of events) { const m = e.slug.match(/meetup-0*(\d+)/); if (m) slugByNum[+m[1]] = e.slug; }

// --- CRM seed + contacts collected from every source ---
const crm = parseCrm(r2ReadText(CRM_KEY));
const seed = crm.size;
const contacts = [];

// per-event rosters: Map(slug -> Map(rosterId -> rec))
const rosters = new Map();
const addRoster = (slug, { email = '', name = '', source, added }) => {
  const id = rosterId(email, name);
  if (!id) return;
  if (!rosters.has(slug)) rosters.set(slug, new Map());
  const m = rosters.get(slug);
  if (!m.has(id)) m.set(id, { email, name, source, event: slug, added: added || today() });
};

// 1) LinkedIn followers (community)
if (await has('linkedin-followers.html')) {
  const people = parseLinkedinHtml(await read('linkedin-followers.html'));
  for (const p of people) contacts.push(makeContact({ name: p.name, linkedin: p.profile_url, source: 'linkedin' }));
  console.log(`LinkedIn followers: ${people.length}`);
}

// 2) OCG members (community)
if (await has('ocg-followers.txt')) {
  const members = parseOcgMembers(await read('ocg-followers.txt'));
  contacts.push(...members);
  console.log(`OCG members: ${members.length}`);
}

// 3) Zoho contacts (community)
if (await has('zoho-campaigns.csv')) {
  const rows = parseCsv(stripBom(await read('zoho-campaigns.csv')));
  const f = headerFinder(rows[0]);
  const c = {
    email: f(['contact email', 'email', 'e-mail', 'email address']),
    first: f(['first name', 'first']), last: f(['last name', 'last']),
    name: f(['name', 'full name']), linkedin: f(['linkedin handle', 'linkedin', 'linkedin url']),
  };
  let n = 0;
  for (const r of rows.slice(1)) {
    const get = (i) => (i >= 0 ? norm(r[i]) : '');
    const ct = makeContact({ email: get(c.email), first: get(c.first), last: get(c.last), name: get(c.name), linkedin: get(c.linkedin), source: 'zoho' });
    if (ct.email || ct.linkedin || ct.first || ct.last) { contacts.push(ct); n++; }
  }
  console.log(`Zoho contacts: ${n}`);
}

// 4) Per-event: LinkedIn event attendees (data/linkedin-<N>.html)
for (const f of (await readdir(DATA)).filter((x) => /^linkedin-\d+\.html$/i.test(x))) {
  const slug = slugByNum[+f.match(/linkedin-(\d+)/i)[1]];
  if (!slug) continue;
  const people = parseLinkedinHtml(await read(f));
  for (const p of people) {
    contacts.push(makeContact({ name: p.name, linkedin: p.profile_url, source: 'linkedin', event: slug }));
    addRoster(slug, { name: p.name, source: 'linkedin' });
  }
  console.log(`${f} -> ${slug}: ${people.length} LI attendees`);
}

// 5) Per-event: OCG event attendees (data/ocg-event-<N>.csv, emailless Name column)
for (const f of (await readdir(DATA)).filter((x) => /^ocg-event-\d+\.csv$/i.test(x))) {
  const slug = slugByNum[+f.match(/ocg-event-(\d+)/i)[1]];
  if (!slug) continue;
  const rows = parseCsv(stripBom(await read(f)));
  const ni = headerFinder(rows[0])(['name', 'full name', 'attendee name']);
  let n = 0;
  for (const r of rows.slice(1)) {
    const name = ni >= 0 ? norm(r[ni]) : '';
    if (!name) continue;
    contacts.push(makeContact({ name, source: 'ocg', event: slug }));
    addRoster(slug, { name, source: 'ocg' });
    n++;
  }
  console.log(`${f} -> ${slug}: ${n} OCG attendees`);
}

// 6) Per-event: Eventbrite API (has email)
const TOKEN = process.env.EVENTBRITE_TOKEN;
if (TOKEN) {
  const slugByEb = await slugByEventbriteId();
  let grand = 0;
  for (const [eb, slug] of Object.entries(slugByEb)) {
    try {
      const att = await ebFetchAttendees(TOKEN, eb);
      for (const a of att) {
        contacts.push(makeContact({ email: a.email, name: a.name, source: 'eventbrite', event: slug, added: a.added }));
        addRoster(slug, { email: a.email, name: a.name, source: 'eventbrite', added: a.added });
      }
      grand += att.length;
      console.log(`Eventbrite ${slug}: ${att.length}`);
    } catch (err) { console.warn(`Eventbrite ${slug} failed: ${err.message}`); }
  }
  console.log(`Eventbrite total: ${grand}`);
} else {
  console.warn('No EVENTBRITE_TOKEN — skipping Eventbrite (rosters will lack Eventbrite attendees).');
}

// --- merge + write once each ---
const { added, updated } = mergeContacts(crm, contacts);
console.log(`\nCRM: seed ${seed} -> ${crm.size}  (+${added} new, ${updated} enriched), from ${contacts.length} source rows`);
if (!DRY) {
  r2WriteText(CRM_KEY, serializeCrm(crm));
  for (const [slug, m] of rosters) r2WriteText(`attendees/${slug}.csv`, serializeRoster(m));
  console.log(`Wrote subscribers.csv + ${rosters.size} rosters to R2.`);
} else {
  console.log(`[dry-run] would write subscribers.csv + ${rosters.size} rosters.`);
}

// --- reports from in-memory data ---
const rostersBySlug = new Map();
for (const e of events) if (rosters.has(e.slug)) rostersBySlug.set(e.slug, [...rosters.get(e.slug).values()].map((r) => ({ email: r.email, name: r.name })));
const cr = await renderCommunityReport({ crmRows: [...crm.values()], rostersBySlug, OUT: 'data/reports/subscribers' });
console.log(`Community report: ${cr.uniquePeople} people (rows ${cr.total}), ${cr.totalRegistrations} registrations, ${cr.repeatAttendees} repeat.`);

const feedbackBySlug = new Map();
for (const e of events) { const t = r2ReadText(`feedback/${e.slug}.csv`); if (t) { const rows = parseFeedbackCsv(t); if (rows.length) feedbackBySlug.set(e.slug, rows); } }
if (feedbackBySlug.size) {
  const fr = await renderFeedbackReport({ feedbackBySlug, OUT: 'data/reports/feedback' });
  console.log(`Feedback report: ${fr.responses} responses across ${fr.meetups} meetups, overall ${fr.overall.toFixed(2)}.`);
}
console.log('\nDone.');
