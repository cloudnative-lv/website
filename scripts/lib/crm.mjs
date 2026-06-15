// The common CRM: one accumulating list in R2 subscribers.csv.
//   email,first,last,linkedin,source,event,added
// Every source (web, eventbrite, ocg, linkedin, nethunt, zoho, csv) contributes
// rows tagged with its `source`. Imports are idempotent *per source* — re-running
// never duplicates — but the same person from two different sources stays as two
// rows on purpose; cross-source dedup is the deliberate job of `crm:cleanup`
// (driven by the NetHunt export), never automatic here.
import { parseCsv, toCsv, norm, lower, isEmail } from './csv.mjs';
import { transliterate } from './translit.mjs';
import { r2ReadText, r2WriteText } from './r2.mjs';

export const CRM_KEY = 'subscribers.csv';
export const CRM_HEADER = ['email', 'first', 'last', 'linkedin', 'source', 'event', 'added'];

export const today = () => new Date().toISOString().slice(0, 10);

// Normalize a LinkedIn URL or bare handle to https://www.linkedin.com/in/<handle>.
export function normLinkedin(s) {
  let v = norm(s);
  if (!v) return '';
  v = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
  const m = v.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (m) return `https://www.linkedin.com/in/${decodeURIComponent(m[1]).toLowerCase()}`;
  if (/^[a-z0-9\-_%.]+$/i.test(v)) return `https://www.linkedin.com/in/${v.toLowerCase()}`;
  return v.toLowerCase();
}

// Split a full name into {first, last}, transliterated to Latin.
export function splitName(full) {
  const t = transliterate(norm(full)).replace(/\s+/g, ' ').trim();
  if (!t) return { first: '', last: '' };
  const parts = t.split(' ');
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

// Build a normalized contact from whatever a source provides.
export function makeContact({ email = '', first = '', last = '', name = '', linkedin = '', source = 'csv', event = '', added } = {}) {
  if (!first && !last && name) ({ first, last } = splitName(name));
  else { first = transliterate(norm(first)); last = transliterate(norm(last)); }
  const e = lower(email);
  return {
    email: isEmail(e) ? e : '',
    first, last,
    linkedin: normLinkedin(linkedin),
    source: lower(source) || 'csv',
    event: norm(event),
    added: added || today(),
  };
}

// Identity *within a source*: email, else LinkedIn, else first+last.
const identity = (c) => c.email || c.linkedin || `${lower(c.first)} ${lower(c.last)}`.trim();
const keyOf = (c) => `${c.source}::${identity(c)}`;
const mergeEvents = (a, b) => [...new Set(`${a || ''};${b || ''}`.split(';').map((s) => s.trim()).filter(Boolean))].sort().join(';');

export function parseCrm(text) {
  const map = new Map();
  if (!text) return map;
  const rows = parseCsv(text);
  if (!rows.length) return map;
  const h = rows[0].map(lower);
  const idx = (n) => h.indexOf(n);
  const legacy = idx('first') < 0 && idx('email') >= 0; // old email,timestamp,source
  for (const r of rows.slice(1)) {
    let c;
    if (legacy) {
      c = makeContact({ email: r[idx('email')], source: r[idx('source')] || 'web', added: norm(r[idx('timestamp')] ?? '').slice(0, 10) || undefined });
    } else {
      c = {
        email: lower(r[idx('email')] ?? ''),
        first: norm(r[idx('first')] ?? ''),
        last: norm(r[idx('last')] ?? ''),
        linkedin: norm(r[idx('linkedin')] ?? ''),
        source: lower(r[idx('source')] ?? '') || 'csv',
        event: norm(r[idx('event')] ?? ''),
        added: norm(r[idx('added')] ?? '') || today(),
      };
    }
    if (identity(c)) map.set(keyOf(c), c);
  }
  return map;
}

export const serializeCrm = (map) =>
  toCsv([CRM_HEADER, ...[...map.values()].map((c) => CRM_HEADER.map((k) => c[k] ?? ''))]);

// Merge normalized contacts into a CRM map. Fills blank fields, unions events,
// keeps the earliest `added`. Returns counts.
export function mergeContacts(map, incoming) {
  let added = 0, updated = 0;
  for (const c of incoming) {
    if (!identity(c)) continue;
    const k = keyOf(c);
    const prev = map.get(k);
    if (!prev) { map.set(k, c); added++; continue; }
    const next = { ...prev };
    for (const f of ['email', 'first', 'last', 'linkedin']) if (!next[f] && c[f]) next[f] = c[f];
    next.event = mergeEvents(prev.event, c.event);
    if (c.added && (!next.added || c.added < next.added)) next.added = c.added;
    if (JSON.stringify(next) !== JSON.stringify(prev)) { map.set(k, next); updated++; }
  }
  return { added, updated };
}

// Read CRM from R2, merge, write back (unless dryRun). Returns a summary.
export function upsertCrm(contacts, { dryRun = false } = {}) {
  const map = parseCrm(r2ReadText(CRM_KEY));
  const before = map.size;
  const { added, updated } = mergeContacts(map, contacts);
  if (!dryRun && (added || updated)) r2WriteText(CRM_KEY, serializeCrm(map));
  return { before, after: map.size, added, updated, dryRun };
}
