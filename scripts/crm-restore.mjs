// crm:restore — reconcile the subscribe worker's immutable audit log into the CRM. The
// worker writes each web signup to subscribers/incoming/<ts>_<uuid>.json FIRST, then upserts a
// row into subscribers.csv; if that upsert ever fails (or the CRM is rebuilt from data/
// sources that don't include web signups), this op replays the audit log so no signup is
// lost. Idempotent — re-running never duplicates (web contacts key on email).
//
//   npm run crm:restore             # dry run — show recoverable signups
//   npm run crm:restore -- --write  # apply
//
// Reads the live bucket through the S3 API (cache-immune).
import { s3Available, s3List, s3GetText } from './lib/s3.mjs';
import { r2ReadText, r2WriteText } from './lib/r2.mjs';
import { parseCrm, serializeCrm, mergeContacts, makeContact, CRM_KEY } from './lib/crm.mjs';

if (!s3Available()) {
  console.error('crm:restore needs the R2 S3 keys in .env (R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).');
  process.exit(1);
}

const WRITE = process.argv.includes('--write');

const keys = (await s3List('subscribers/incoming/')).filter((o) => o.key.endsWith('.json'));
if (!keys.length) {
  console.log('No signup audit records under subscribers/incoming/ — nothing to restore.');
  process.exit(0);
}

const incoming = [];
let skipped = 0;
for (const o of keys) {
  const raw = await s3GetText(o.key);
  let j; try { j = JSON.parse(raw); } catch { j = null; }
  if (!j || !j.email) { skipped++; continue; }
  incoming.push(makeContact({ email: j.email, source: j.source || 'web', added: String(j.ts || '').slice(0, 10) || undefined }));
}
if (skipped) console.warn(`Skipped ${skipped} unreadable/empty audit record(s).`);

const crm = parseCrm(r2ReadText(CRM_KEY));
const before = crm.size;
const { added, updated } = mergeContacts(crm, incoming);

console.log(`Audit log: ${keys.length} signups → CRM ${before} contacts; ${added} new, ${updated} updated.`);
if (added || updated) {
  if (WRITE) {
    r2WriteText(CRM_KEY, serializeCrm(crm));
    console.log(`Wrote subscribers.csv (${crm.size} contacts).`);
  } else {
    console.log('Dry run — pass --write to apply.');
  }
} else {
  console.log('CRM already in sync with the audit log.');
}
