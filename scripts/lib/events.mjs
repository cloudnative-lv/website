// Read the event slugs (and their Eventbrite / CNCF ids) straight from the YAML files,
// so the ops never need an R2 object-listing API. Lightweight regex — the full schema
// is validated separately by scripts/validate-events.mjs.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = 'src/data/events';

// Speaker names across an event's talks. Handles the three YAML shapes: `speaker: "X"`,
// a `speakers:` block list, and an inline `speakers: ["A", "B"]`.
function parseSpeakers(txt) {
  const names = new Set();
  let inList = false, listIndent = 0;
  for (const line of txt.split('\n')) {
    const inline = line.match(/^\s*speakers:\s*\[([^\]]+)\]/);
    if (inline) { for (const m of inline[1].split(',')) { const n = m.trim().replace(/^["']|["']$/g, ''); if (n) names.add(n); } inList = false; continue; }
    const single = line.match(/^\s*speaker:\s*"?([^"\n]+?)"?\s*$/);
    if (single) { names.add(single[1].trim()); inList = false; continue; }
    const listStart = line.match(/^(\s*)speakers:\s*$/);
    if (listStart) { inList = true; listIndent = listStart[1].length; continue; }
    if (inList) {
      const item = line.match(/^(\s+)-\s*"?([^"\n]+?)"?\s*$/);
      if (item && item[1].length > listIndent) { names.add(item[2].trim()); continue; }
      inList = false;
    }
  }
  return [...names];
}

export async function readEvents() {
  const out = [];
  for (const f of (await readdir(DIR)).filter((x) => x.endsWith('.yaml'))) {
    const txt = await readFile(path.join(DIR, f), 'utf8');
    const slug = (txt.match(/slug:\s*"?([^"\n]+)"?/) || [])[1]?.trim();
    const date = (txt.match(/date:\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})/) || [])[1];
    const eventbriteId = (txt.match(/eventbriteUrl:\s*"?https:\/\/www\.eventbrite\.com\/e\/(\d+)/) || [])[1] || null;
    // cncfUrl is either community.cncf.io/e/<code> or ocgroups.dev/.../event/<code>
    const cncfCode = (txt.match(/cncfUrl:\s*"?[^"\n]*?\/(?:e|event)\/([a-z0-9]+)/i) || [])[1] || null;
    // attendance: head-count from the event photos (speakers + organizers included)
    const attendanceRaw = (txt.match(/^attendance:\s*(\d+)/m) || [])[1];
    const attendance = attendanceRaw != null ? Number(attendanceRaw) : null;
    const speakers = parseSpeakers(txt);
    const talks = (txt.match(/^\s*-\s+title:/gm) || []).length; // talk list items under `talks:`
    if (slug) out.push({ file: f, slug, date: date || null, eventbriteId, cncfCode, attendance, speakers, talks });
  }
  return out;
}

export async function eventSlugs() {
  return (await readEvents()).map((e) => e.slug);
}

export async function slugByEventbriteId() {
  const map = {};
  for (const e of await readEvents()) if (e.eventbriteId) map[e.eventbriteId] = e.slug;
  return map;
}

export async function slugByCncfCode() {
  const map = {};
  for (const e of await readEvents()) if (e.cncfCode) map[e.cncfCode.toLowerCase()] = e.slug;
  return map;
}
