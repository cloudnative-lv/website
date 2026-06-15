// Community & registrations report: reads R2 subscribers.csv (the CRM) and every
// per-event roster (attendees/<slug>.csv) and writes a markdown summary + charts to
// data/reports/subscribers/.    npm run report:subscribers
import { parseCrm, CRM_KEY } from './lib/crm.mjs';
import { r2ReadText } from './lib/r2.mjs';
import { readEvents } from './lib/events.mjs';
import { readRoster } from './lib/roster.mjs';
import { renderCommunityReport } from './lib/reports.mjs';

const crmRows = [...parseCrm(r2ReadText(CRM_KEY)).values()];
if (!crmRows.length) { console.error('CRM subscribers.csv is empty (or not created yet).'); process.exit(1); }

const events = (await readEvents()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
const rostersBySlug = new Map();
for (const e of events) {
  const map = readRoster(`attendees/${e.slug}.csv`);
  if (map.size) rostersBySlug.set(e.slug, [...map.values()].map((r) => ({ email: r.email, name: r.name })));
}

const r = await renderCommunityReport({ crmRows, rostersBySlug, OUT: 'data/reports/subscribers' });
console.log(`Wrote data/reports/subscribers/ — community ${r.uniquePeople} (rows ${r.total}), registrations ${r.totalRegistrations} over ${rostersBySlug.size} events, repeat ${r.repeatAttendees}.`);
