// Per-event roster (attendees/<slug>.csv) read/write, shared by the attendee importers.
// Schema: email,name,source,event,added. Rows are keyed by email when present, else by
// the transliterated name — so emailless OCG / LinkedIn attendee lists merge cleanly with
// the email-bearing Eventbrite rosters and re-imports stay idempotent.
import { parseCsv, toCsv, norm, lower } from './csv.mjs';
import { transliterate } from './translit.mjs';
import { r2ReadText, r2WriteText } from './r2.mjs';

export const ROSTER_HEADER = ['email', 'name', 'source', 'event', 'added'];
export const rosterId = (email, name) => (email ? lower(email) : (name ? `name:${lower(transliterate(name))}` : ''));

export function readRoster(key, opt = {}) {
  const map = new Map();
  const text = r2ReadText(key, opt);
  if (!text) return map;
  const rows = parseCsv(text);
  if (!rows.length) return map;
  const h = rows[0].map(lower); const idx = (n) => h.indexOf(n);
  for (const r of rows.slice(1)) {
    const rec = {}; ROSTER_HEADER.forEach((k) => { rec[k] = idx(k) >= 0 ? norm(r[idx(k)]) : ''; });
    const id = rosterId(rec.email, rec.name);
    if (id) map.set(id, rec);
  }
  return map;
}

export const serializeRoster = (map) =>
  toCsv([ROSTER_HEADER, ...[...map.values()].map((r) => ROSTER_HEADER.map((k) => r[k] ?? ''))]);

export function writeRoster(key, map, opt = {}) {
  r2WriteText(key, serializeRoster(map), opt);
}
