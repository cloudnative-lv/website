// Pure metadata derivations shared by all artifact templates and the generator.
// No imports, no DOM — safe to unit-test in Node.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// "2026-06-10-meetup-006" (id) or "Meetup #006: …" (title) -> "6"
export const meetupNumber = (event = {}) => {
  const fromId = String(event.id || '').match(/meetup-0*(\d+)/i);
  if (fromId) return String(Number(fromId[1]));
  const fromTitle = String(event.title || '').match(/#0*(\d+)/);
  return fromTitle ? String(Number(fromTitle[1])) : '';
};

// "Meetup #006: GPUs and AI Agents" -> "GPUs and AI Agents"
export const cleanTitle = (title) =>
  String(title || '').replace(/^\s*meetup\s*#?\d+\s*[:.\-–—]\s*/i, '').trim();

// "2026-06-10" -> "10.06.2026"
export const dateDots = (date) => {
  const m = String(date || '').match(DATE_RE);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(date || '');
};

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// "2026-06-10" -> "10th of June"
export const dateLong = (date) => {
  const m = String(date || '').match(DATE_RE);
  return m ? `${ordinal(Number(m[3]))} of ${MONTHS[Number(m[2]) - 1]}` : String(date || '');
};

// Speaker profile {title, company} -> "CTO & Co-founder @ Nuoxera" |
// "DevOps Engineer" | "airBaltic" | ""
export const speakerRole = (info = {}) => {
  const { title, company } = info;
  if (title && company) return `${title} @ ${company}`;
  return title || company || '';
};

// Promo start time: explicit `startTime` (talks start) else `time` (doors).
export const startTime = (event = {}) => event.startTime || event.time || '';

// "Andrey Adamovich" -> "AA"
export const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Speakers featured by a talk: `speakers: []` or single `speaker:`.
export const talkSpeakerNames = (talk = {}) =>
  talk.speakers || (talk.speaker ? [talk.speaker] : []);

// Every speaker across an event's talks, in order, de-duplicated by name.
export const eventSpeakerNames = (event = {}) => [
  ...new Set((event.talks || []).flatMap(talkSpeakerNames)),
];

// "Marijas iela 2A, Rīga, LV-1050" + "GoCardless" -> "Marijas iela 2A, GoCardless"
export const venueLine = (venue = {}) => {
  const street = String(venue.address || '').split(',')[0].trim();
  return [street, venue.name].filter(Boolean).join(', ');
};

// The timed run-of-show, from the structured `schedule:` field in the event YAML
// (doors, welcome, talks, breaks, networking, doors close). A `{ time, talk: N }` item
// expands to the real talk title + speaker(s); other items carry `{ time, item }`.
// Returns [{ time, label, isTalk }], or [] when an event has no schedule.
export const eventSchedule = (event = {}) => {
  const talks = event.talks || [];
  return (event.schedule || []).map((s) => {
    if (s.talk != null) {
      const t = talks[Number(s.talk) - 1];
      if (t) {
        const who = talkSpeakerNames(t).join(' & ');
        return { time: s.time, label: `${t.title}${who ? ` — ${who}` : ''}`, isTalk: true };
      }
    }
    const label = String(s.item ?? s.label ?? '');
    return { time: s.time, label, isTalk: talks.some((t) => label.toLowerCase().includes(String(t.title || '').toLowerCase().slice(0, 20))) };
  });
};
