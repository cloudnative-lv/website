// Parse an OCG / CNCF community members export (tab + newline text) into CRM contacts.
// Each member is a run of lines [avatar, name, handle, ...position] terminated by a
// "Mon DD, YYYY" join-date line; the "Member Position Joined" header repeats per page.
// OCG rows carry no email/LinkedIn (a few have an email in the name field).
import { makeContact } from './crm.mjs';

const isDate = (s) => /^[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/.test(s);
const isHeader = (s) => /^(member|position|joined)$/i.test(s) || /member\s+position\s+joined/i.test(s);
const toIso = (s) => { const d = new Date(s); return Number.isNaN(+d) ? '' : d.toISOString().slice(0, 10); };
const emailIn = (s) => (s.match(/[^\s,]+@[^\s,]+\.[^\s,]+/) || [])[0] || '';

export function parseOcgMembers(text) {
  const lines = text.split('\n').map((l) => l.replace(/\t/g, ' ').trim()).filter((l) => l && !isHeader(l));
  const out = [];
  let buf = [];
  for (const line of lines) {
    if (isDate(line)) {
      if (buf.length >= 2 && buf[1]) {
        const name = buf[1];
        const email = emailIn(name);
        out.push(email
          ? makeContact({ email, source: 'ocg', added: toIso(line) })
          : makeContact({ name, source: 'ocg', added: toIso(line) }));
      }
      buf = [];
    } else {
      buf.push(line);
    }
  }
  return out;
}
