// r2:verify — read the live R2 bucket through the S3 API (cache-immune) and print a
// health summary: the CRM size + source mix, per-event rosters and feedback, and the
// immutable incoming/ audit logs the workers write. Read-only; never mutates the bucket.
//
//   npm run r2:verify
import { s3Available, s3List, s3GetText, BUCKET } from './lib/s3.mjs';
import { parseCrm, CRM_KEY } from './lib/crm.mjs';
import { readEvents } from './lib/events.mjs';

if (!s3Available()) {
  console.error('r2:verify needs the R2 S3 keys in .env (R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).');
  process.exit(1);
}

const dataRows = (csv) => (csv ? csv.trim().split('\n').length - 1 : 0);
const pad = (s, n) => String(s).padEnd(n);
const num = (n, w = 5) => String(n).padStart(w);

console.log(`Bucket ${BUCKET} (via S3 API — live, no cache)\n`);

const objects = await s3List('');
const byPrefix = {};
for (const o of objects) {
  const top = o.key.includes('/') ? `${o.key.split('/')[0]}/` : o.key;
  byPrefix[top] = (byPrefix[top] || 0) + 1;
}
console.log(`${objects.length} objects:`, Object.entries(byPrefix).map(([k, n]) => `${k} ${n}`).join('  ·  '), '\n');

// --- CRM (subscribers.csv) ---
const crm = parseCrm(await s3GetText(CRM_KEY));
const bySource = {};
for (const c of crm.values()) bySource[c.source || '(blank)'] = (bySource[c.source || '(blank)'] || 0) + 1;
const withEmail = [...crm.values()].filter((c) => c.email).length;
const withLinkedin = [...crm.values()].filter((c) => c.linkedin).length;
console.log(`CRM ${CRM_KEY}: ${crm.size} contacts  (${withEmail} with email, ${withLinkedin} with LinkedIn)`);
console.log('  by source:', Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(', '), '\n');

// --- per-event rosters + feedback ---
const events = (await readEvents()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
const incoming = objects.filter((o) => o.key.includes('/incoming/'));
const fbIncomingFor = (slug) => incoming.filter((o) => o.key.startsWith(`feedback/incoming/${slug}/`)).length;

console.log(`${pad('event', 26)} ${pad('attendees', 10)} ${pad('feedback', 9)} fb-audit`);
let totReg = 0, totFb = 0;
for (const e of events) {
  const att = dataRows(await s3GetText(`attendees/${e.slug}.csv`));
  const fb = dataRows(await s3GetText(`feedback/${e.slug}.csv`));
  totReg += att; totFb += fb;
  console.log(`${pad(e.slug, 26)} ${num(att, 10)} ${num(fb, 9)} ${num(fbIncomingFor(e.slug), 8)}`);
}
console.log(`${pad('TOTAL', 26)} ${num(totReg, 10)} ${num(totFb, 9)}\n`);

// --- audit logs (worker-written, immutable) ---
const subsIncoming = incoming.filter((o) => o.key.startsWith('subscribers/incoming/')).length;
const fbIncoming = incoming.filter((o) => o.key.startsWith('feedback/incoming/')).length;
console.log(`audit log: ${subsIncoming} web signups (subscribers/incoming/), ${fbIncoming} feedback submissions (feedback/incoming/)`);

// --- orphan check: CSVs with no matching event ---
const slugs = new Set(events.map((e) => e.slug));
const orphans = objects
  .map((o) => o.key.match(/^(?:attendees|feedback)\/([a-z0-9-]+)\.csv$/)?.[1])
  .filter((s) => s && !slugs.has(s));
if (orphans.length) console.log(`\n⚠ rosters/feedback with no matching event: ${[...new Set(orphans)].join(', ')}`);
